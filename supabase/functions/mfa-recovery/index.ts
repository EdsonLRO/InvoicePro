// mfa-recovery - server-side one-time recovery codes for lost TOTP factors.
// Raw codes are returned once to an AAL2 session and are never stored or logged.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const APP_ORIGINS = new Set([
  "https://edsonlro.github.io",
  "https://app.tallyo.co.uk",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Tallyo <invoices@mail.tallyo.co.uk>";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_COUNT = 10;
const CODE_LENGTH = 20;

type Action = "generate" | "recover" | "complete" | "request-owner" | "confirm-owner";
type AuditMetadata = Record<string, string | number | boolean | null>;
type Database = {
  public: {
    Tables: {
      audit_events: {
        Row: Record<string, unknown>;
        Insert: {
          user_id: string;
          actor_user_id: string;
          event_type: string;
          object_type: string;
          source: "edge_function";
          metadata: AuditMetadata;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      mfa_recovery_state: {
        Row: {
          user_id: string;
          recovery_required: boolean;
          generation_notice_sent_at: string | null;
          recovery_notice_sent_at: string | null;
          completion_notice_sent_at: string | null;
        };
        Insert: Record<string, never>;
        Update: {
          generation_notice_sent_at?: string;
          recovery_notice_sent_at?: string;
          completion_notice_sent_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      replace_mfa_recovery_codes: {
        Args: { p_user_id: string; p_generation: string; p_code_hashes: string[] };
        Returns: undefined;
      };
      revoke_mfa_recovery_codes: { Args: { p_user_id: string }; Returns: undefined };
      claim_mfa_recovery_code: {
        Args: { p_user_id: string; p_code_hash: string };
        Returns: string;
      };
      complete_mfa_recovery: { Args: { p_user_id: string }; Returns: undefined };
      create_owner_mfa_recovery_request: {
        Args: { p_user_id: string; p_token_hash: string; p_expires_at: string };
        Returns: string;
      };
      cancel_owner_mfa_recovery_request: {
        Args: { p_user_id: string; p_request_id: string };
        Returns: undefined;
      };
      confirm_owner_mfa_recovery_request: {
        Args: { p_user_id: string; p_token_hash: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
type AdminClient = SupabaseClient<Database>;

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": APP_ORIGINS.has(origin) ? origin : "https://edsonlro.github.io",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function normalizeCode(value: unknown): string {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function formatCode(value: string): string {
  return value.match(/.{1,5}/g)?.join("-") || value;
}

function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  let value = "";
  for (const byte of bytes) value += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return formatCode(value);
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacCode(pepper: string, code: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(code)));
}

function securityEmail(action: "generate" | "recover" | "complete"): { subject: string; html: string; text: string } {
  const details = action === "generate"
    ? {
      subject: "Your Tallyo recovery codes were replaced",
      heading: "Recovery codes replaced",
      message: "A new set of one-time MFA recovery codes was generated for your Tallyo account. Any previous set is no longer valid.",
    }
    : action === "recover"
    ? {
      subject: "Your Tallyo account recovery was used",
      heading: "Account recovery used",
      message: "A one-time recovery code was used and the enrolled authenticators were removed from your Tallyo account. Business data remains locked until a new authenticator is verified.",
    }
    : {
      subject: "Your Tallyo account recovery is complete",
      heading: "Account recovery complete",
      message: "A new authenticator was verified and access to your Tallyo business data was restored. Generate a fresh recovery-code set from Account Security.",
    };

  const warning = "If you did not perform this action, change your password immediately and contact Tallyo support.";
  return {
    subject: details.subject,
    text: `${details.heading}\n\n${details.message}\n\n${warning}`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1e293b;line-height:1.55"><div style="max-width:600px;margin:0 auto;padding:24px"><h1 style="font-size:22px">${details.heading}</h1><p>${details.message}</p><p style="padding:14px;background:#fff7ed;border:1px solid #fed7aa"><strong>${warning}</strong></p><p style="color:#64748b;font-size:13px">This notice never contains your password, authenticator secret, or recovery codes.</p></div></body></html>`,
  };
}

async function sendSecurityNotice(resendKey: string, to: string, action: "generate" | "recover" | "complete"): Promise<boolean> {
  const email = securityEmail(action);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject: email.subject, html: email.html, text: email.text }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    })[char] || char);
}

async function sendOwnerRecoveryConfirmation(
  resendKey: string,
  to: string,
  confirmationUrl: string,
): Promise<boolean> {
  const safeUrl = escapeHtml(confirmationUrl);
  const message = "Confirm that you asked the Tallyo Owner to reset your lost authenticator. This link expires in 30 minutes and does not unlock the account by itself.";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: "Confirm your Tallyo authenticator recovery request",
        text: `Confirm your recovery request\n\n${message}\n\nConfirm recovery request: ${confirmationUrl}\n\nIf you did not request this, do not open the link. Your account remains protected.`,
        html:
          `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1e293b;line-height:1.55"><div style="max-width:600px;margin:0 auto;padding:24px"><h1 style="font-size:22px">Confirm your recovery request</h1><p>${message}</p><p style="margin:24px 0"><a href="${safeUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Confirm recovery request</a></p><p style="padding:14px;background:#fff7ed;border:1px solid #fed7aa"><strong>If you did not request this, do not open the link. Your account remains protected.</strong></p></div></body></html>`,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function ownerRecoveryBaseUrl(): string {
  const value = String(Deno.env.get("APP_BASE_URL") || "").replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Recovery service is unavailable");
  }
  if (
    !APP_ORIGINS.has(parsed.origin) || parsed.username || parsed.password ||
    parsed.search || parsed.hash
  ) {
    throw new Error("Recovery service is unavailable");
  }
  return parsed.origin;
}

async function writeAudit(
  admin: AdminClient,
  userId: string,
  eventType: string,
  metadata: AuditMetadata = {},
): Promise<void> {
  const { error } = await admin.from("audit_events").insert({
    user_id: userId,
    actor_user_id: userId,
    event_type: eventType,
    object_type: "account",
    source: "edge_function",
    metadata,
  });
  if (error) console.error("MFA recovery audit insert failed", { eventType, error: error.code });
}

async function verifiedFactors(admin: AdminClient, userId: string) {
  const { data, error } = await admin.auth.admin.mfa.listFactors({ userId });
  if (error) throw error;
  return (data?.factors || []).filter((factor) => factor.status === "verified");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const requestOrigin = req.headers.get("origin");
  if (requestOrigin && !APP_ORIGINS.has(requestOrigin)) return json(req, { error: "Origin not allowed" }, 403);

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json(req, { error: "Missing authorization" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const pepper = Deno.env.get("MFA_RECOVERY_PEPPER") || "";
  const resendKey = Deno.env.get("RESEND_API_KEY") || "";
  if (!supabaseUrl || !anonKey || !serviceKey || pepper.length < 32 || !resendKey) {
    console.error("MFA recovery function configuration is incomplete");
    return json(req, { error: "Recovery service is unavailable" }, 503);
  }

  const jwt = authHeader.slice("Bearer ".length);
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const admin = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(jwt);
  if (userError || !userData.user?.id || !userData.user.email) return json(req, { error: "Invalid session" }, 401);
  const user = userData.user;
  const userId = user.id;
  const userEmail = user.email!;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid JSON body" }, 400);
  }
  const action = body.action as Action;
  if (!(["generate", "recover", "complete", "request-owner", "confirm-owner"] as Action[]).includes(action)) {
    return json(req, { error: "Unsupported action" }, 400);
  }

  const { data: aal, error: aalError } = await userClient.auth.mfa.getAuthenticatorAssuranceLevel(jwt);
  if (aalError || !aal?.currentLevel) return json(req, { error: "Account assurance could not be verified" }, 403);

  if (action === "request-owner") {
    if (aal.currentLevel !== "aal1" || aal.nextLevel !== "aal2") {
      return json(req, {
        error: "Owner-assisted recovery is only available at the authenticator step",
      }, 409);
    }
    const factors = await verifiedFactors(admin, userId);
    if (!factors.length) {
      return json(req, {
        error: "Owner-assisted recovery is not required for this account",
      }, 409);
    }
    const recoveryBaseUrl = ownerRecoveryBaseUrl();

    const token = `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
    const tokenHash = await hmacCode(pepper, token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const { data: requestId, error: requestError } = await admin.rpc(
      "create_owner_mfa_recovery_request",
      {
        p_user_id: userId,
        p_token_hash: tokenHash,
        p_expires_at: expiresAt,
      },
    );
    if (requestError || !requestId) {
      const message = String(requestError?.message || "");
      return json(req, {
        error: message.includes("wait 15 minutes") ? "Please wait 15 minutes before requesting another confirmation email." : "Recovery confirmation could not be prepared.",
      }, message.includes("wait 15 minutes") ? 429 : 500);
    }

    const confirmationUrl = `${recoveryBaseUrl}/#mfa-recovery-confirm?token=${token}`;
    if (
      !(await sendOwnerRecoveryConfirmation(
        resendKey,
        userEmail,
        confirmationUrl,
      ))
    ) {
      await admin.rpc("cancel_owner_mfa_recovery_request", {
        p_user_id: userId,
        p_request_id: String(requestId),
      });
      await writeAudit(
        admin,
        userId,
        "account_mfa_owner_recovery_request_failed",
        { phase: "notification" },
      );
      return json(req, {
        error: "The confirmation email could not be sent. Try again.",
      }, 502);
    }
    await writeAudit(admin, userId, "account_mfa_owner_recovery_requested", {
      expires_minutes: 30,
    });
    return json(req, { sent: true });
  }

  if (action === "confirm-owner") {
    const isMfaChallenge = aal.currentLevel === "aal1" &&
      aal.nextLevel === "aal2";
    if (!isMfaChallenge && aal.currentLevel !== "aal2") {
      return json(req, {
        error: "This recovery confirmation is not required for the current session",
      }, 409);
    }
    const token = String(body.token || "").trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(token)) {
      return json(req, { error: "This recovery link is invalid." }, 400);
    }
    const tokenHash = await hmacCode(pepper, token);
    const { data: result, error: confirmError } = await admin.rpc(
      "confirm_owner_mfa_recovery_request",
      {
        p_user_id: userId,
        p_token_hash: tokenHash,
      },
    );
    if (confirmError) {
      return json(req, {
        error: "Recovery confirmation could not be completed.",
      }, 500);
    }
    if (result !== "confirmed") {
      return json(req, {
        error: result === "expired" ? "This recovery link has expired. Request a new confirmation email." : "This recovery link is invalid or has already been used.",
      }, 400);
    }
    await writeAudit(admin, userId, "account_mfa_owner_recovery_confirmed", {});
    return json(req, { confirmed: true });
  }

  if (action === "generate") {
    if (aal.currentLevel !== "aal2") return json(req, { error: "Two-factor verification is required" }, 403);
    const factors = await verifiedFactors(admin, userId);
    if (!factors.length) return json(req, { error: "A verified authenticator is required" }, 409);

    const codes = Array.from({ length: CODE_COUNT }, generateCode);
    const hashes = await Promise.all(codes.map((code) => hmacCode(pepper, normalizeCode(code))));
    const generation = crypto.randomUUID();
    const { error: replaceError } = await admin.rpc("replace_mfa_recovery_codes", {
      p_user_id: userId,
      p_generation: generation,
      p_code_hashes: hashes,
    });
    if (replaceError) {
      console.error("MFA recovery code replacement failed", { code: replaceError.code });
      return json(req, { error: "Recovery codes could not be generated" }, 500);
    }

    if (!(await sendSecurityNotice(resendKey, userEmail, "generate"))) {
      await admin.rpc("revoke_mfa_recovery_codes", { p_user_id: userId });
      await writeAudit(admin, userId, "account_mfa_recovery_codes_failed", { phase: "notification" });
      return json(req, { error: "Recovery codes were not enabled because the security notice could not be sent" }, 502);
    }

    await admin.from("mfa_recovery_state").update({ generation_notice_sent_at: new Date().toISOString() }).eq("user_id", userId);
    await writeAudit(admin, userId, "account_mfa_recovery_codes_generated", { count: CODE_COUNT });
    return json(req, { codes });
  }

  if (action === "recover") {
    if (aal.currentLevel !== "aal1") return json(req, { error: "Use Account Security while already verified" }, 409);

    const { data: state, error: stateError } = await admin.from("mfa_recovery_state")
      .select("recovery_required")
      .eq("user_id", userId)
      .maybeSingle();
    if (stateError) return json(req, { error: "Recovery could not be completed" }, 500);

    let claimResult = "resume";
    if (!state?.recovery_required) {
      const normalized = normalizeCode(body.code);
      if (normalized.length !== CODE_LENGTH || [...normalized].some((char) => !CODE_ALPHABET.includes(char))) {
        return json(req, { error: "Recovery could not be completed" }, 400);
      }
      const codeHash = await hmacCode(pepper, normalized);
      const { data, error } = await admin.rpc("claim_mfa_recovery_code", {
        p_user_id: userId,
        p_code_hash: codeHash,
      });
      if (error) return json(req, { error: "Recovery could not be completed" }, 500);
      claimResult = String(data || "invalid");
      if (claimResult === "locked") return json(req, { error: "Recovery could not be completed. Wait 15 minutes before trying again." }, 429);
      if (claimResult !== "accepted" && claimResult !== "resume") {
        return json(req, { error: "Recovery could not be completed" }, 400);
      }
    }

    try {
      const { data, error } = await admin.auth.admin.mfa.listFactors({ userId });
      if (error) throw error;
      for (const factor of data?.factors || []) {
        const { error: deleteError } = await admin.auth.admin.mfa.deleteFactor({ userId, id: factor.id });
        if (deleteError) throw deleteError;
      }
    } catch (error) {
      console.error("MFA recovery factor cleanup failed", { error: error instanceof Error ? error.name : "unknown" });
      await writeAudit(admin, userId, "account_mfa_recovery_cleanup_pending", {});
      return json(req, { error: "Recovery is pending. Sign in again to resume the secure cleanup." }, 503);
    }

    const noticeSent = await sendSecurityNotice(resendKey, userEmail, "recover");
    if (noticeSent) {
      await admin.from("mfa_recovery_state").update({ recovery_notice_sent_at: new Date().toISOString() }).eq("user_id", userId);
    }
    await writeAudit(admin, userId, "account_mfa_recovery_started", { notice_sent: noticeSent });
    return json(req, { recovered: true, notificationSent: noticeSent });
  }

  if (aal.currentLevel !== "aal2") return json(req, { error: "A new verified authenticator is required" }, 403);
  const factors = await verifiedFactors(admin, userId);
  if (!factors.length) return json(req, { error: "A new verified authenticator is required" }, 409);

  const { data: pending, error: pendingError } = await admin.from("mfa_recovery_state")
    .select("recovery_required")
    .eq("user_id", userId)
    .maybeSingle();
  if (pendingError || !pending?.recovery_required) return json(req, { error: "No recovery is awaiting completion" }, 409);

  const { error: completeError } = await admin.rpc("complete_mfa_recovery", { p_user_id: userId });
  if (completeError) return json(req, { error: "Recovery could not be completed" }, 500);

  const noticeSent = await sendSecurityNotice(resendKey, userEmail, "complete");
  if (noticeSent) {
    await admin.from("mfa_recovery_state").update({ completion_notice_sent_at: new Date().toISOString() }).eq("user_id", userId);
  }
  await writeAudit(admin, userId, "account_mfa_recovery_completed", { notice_sent: noticeSent });
  return json(req, { completed: true, notificationSent: noticeSent });
});
