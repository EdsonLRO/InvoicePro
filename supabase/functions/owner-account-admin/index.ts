// owner-account-admin - minimal owner-only account support actions.
// The browser never receives the service key, reset links, MFA factor IDs, or
// any customer, invoice, payment, or business data.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const APP_ORIGINS = new Set([
  "https://edsonlro.github.io",
  "https://app.tallyo.co.uk",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ||
  "Tallyo <invoices@mail.tallyo.co.uk>";
const OWNER_ACTION_EVENTS = new Set([
  "owner_complimentary_access_granted",
  "owner_complimentary_access_revoked",
  "owner_password_reset_sent",
  "owner_mfa_recovery_ready",
]);

type Action =
  | "status"
  | "lookup"
  | "grant-complimentary"
  | "revoke-complimentary"
  | "send-password-reset"
  | "approve-mfa-reset";

type AccountRecord = {
  user_id: string;
  account_email: string;
  email_confirmed: boolean;
  account_created_at: string;
  verified_mfa_factors: number;
  complimentary_access_active: boolean;
  complimentary_access_expires_at: string | null;
  subscription_access_state: string | null;
  recovery_request_status: string;
  recovery_requested_at: string | null;
  recovery_expires_at: string | null;
  recent_owner_actions: Array<{ event_type: string; created_at: string }>;
};
type BrowserAccountRecord = Omit<AccountRecord, "user_id">;

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": APP_ORIGINS.has(origin)
      ? origin
      : "https://app.tallyo.co.uk",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(
  req: Request,
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function normalizeEmail(value: unknown): string {
  const email = String(value || "").trim().toLowerCase();
  if (
    email.length < 3 || email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) throw new Error("Enter a valid account email.");
  return email;
}

function configuredOwnerId(): string {
  const ownerId = String(Deno.env.get("TALLYO_OWNER_USER_ID") || "").trim();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(ownerId)
  ) {
    throw new Error("Owner Console is unavailable.");
  }
  return ownerId;
}

function configuredAppBaseUrl(): string {
  const value = String(Deno.env.get("APP_BASE_URL") || "").replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Owner Console is unavailable.");
  }
  if (
    !APP_ORIGINS.has(parsed.origin) || parsed.username || parsed.password ||
    parsed.search || parsed.hash
  ) {
    throw new Error("Owner Console is unavailable.");
  }
  return parsed.origin;
}

function isExpectedAuthActionLink(
  value: unknown,
  supabaseUrl: string,
): value is string {
  if (typeof value !== "string") return false;
  try {
    const link = new URL(value);
    const base = new URL(supabaseUrl);
    return link.origin === base.origin && link.pathname === "/auth/v1/verify" &&
      !link.username && !link.password;
  } catch {
    return false;
  }
}

async function accountByEmail(
  admin: any,
  email: string,
): Promise<AccountRecord | null> {
  const { data, error } = await admin.rpc("owner_console_account_by_email", {
    p_email: email,
  });
  if (error) throw new Error("Account lookup could not be completed.");
  const record = Array.isArray(data) ? data[0] : data;
  if (!record) return null;
  return {
    ...record,
    verified_mfa_factors: Number(record.verified_mfa_factors || 0),
    recent_owner_actions: Array.isArray(record.recent_owner_actions)
      ? record.recent_owner_actions
      : [],
  } as AccountRecord;
}

function accountForBrowser(
  account: AccountRecord | null,
): BrowserAccountRecord | null {
  if (!account) return null;
  const { user_id: _serverOnlyUserId, ...safeAccount } = account;
  return safeAccount;
}

async function writeAudit(
  admin: any,
  targetUserId: string,
  eventType: string,
  metadata: Record<string, string | number | boolean | null> = {},
): Promise<void> {
  if (!OWNER_ACTION_EVENTS.has(eventType)) {
    throw new Error("Unsupported owner audit event.");
  }
  const { error } = await admin.from("audit_events").insert({
    user_id: targetUserId,
    actor_user_id: null,
    event_type: eventType,
    object_type: "account",
    source: "edge_function",
    metadata,
  });
  if (error) throw new Error("The owner action could not be recorded.");
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

async function sendEmail(
  resendKey: string,
  to: string,
  subject: string,
  heading: string,
  message: string,
  buttonLabel: string,
  buttonUrl: string,
): Promise<boolean> {
  const safeHeading = escapeHtml(heading);
  const safeMessage = escapeHtml(message);
  const safeLabel = escapeHtml(buttonLabel);
  const safeUrl = escapeHtml(buttonUrl);
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
        subject,
        text:
          `${heading}\n\n${message}\n\n${buttonLabel}: ${buttonUrl}\n\nIf you did not request this, you can ignore this email and contact Tallyo support.`,
        html:
          `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1e293b;line-height:1.55"><div style="max-width:600px;margin:0 auto;padding:24px"><h1 style="font-size:22px">${safeHeading}</h1><p>${safeMessage}</p><p style="margin:24px 0"><a href="${safeUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">${safeLabel}</a></p><p style="padding:14px;background:#fff7ed;border:1px solid #fed7aa"><strong>If you did not request this, ignore this email and contact Tallyo support.</strong></p></div></body></html>`,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  if (req.method !== "POST") {
    return json(req, { error: "Method not allowed" }, 405);
  }
  const requestOrigin = req.headers.get("origin");
  if (requestOrigin && !APP_ORIGINS.has(requestOrigin)) {
    return json(req, { error: "Origin not allowed" }, 403);
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return json(req, { error: "Missing authorization" }, 401);
  }

  try {
    const supabaseUrl = String(Deno.env.get("SUPABASE_URL") || "");
    const anonKey = String(Deno.env.get("SUPABASE_ANON_KEY") || "");
    const serviceKey = String(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      throw new Error("Owner Console is unavailable.");
    }

    const jwt = authHeader.slice("Bearer ".length);
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(
      jwt,
    );
    if (userError || !userData.user?.id) {
      return json(req, { error: "Invalid session" }, 401);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json(req, { error: "Invalid JSON body" }, 400);
    }
    const action = String(body.action || "") as Action;
    const ownerId = configuredOwnerId();
    if (userData.user.id !== ownerId) {
      return action === "status"
        ? json(req, { owner: false })
        : json(req, { error: "Not found" }, 404);
    }
    const { data: aal, error: aalError } = await userClient.auth.mfa
      .getAuthenticatorAssuranceLevel(jwt);
    if (aalError || aal?.currentLevel !== "aal2") {
      return json(
        req,
        { error: "Complete two-factor verification first." },
        403,
      );
    }
    if (action === "status") return json(req, { owner: true });

    const email = normalizeEmail(body.email);
    const account = await accountByEmail(admin, email);
    if (!account) {
      return json(
        req,
        { error: "No Tallyo account was found for that email." },
        404,
      );
    }
    if (action === "lookup") {
      return json(req, { account: accountForBrowser(account) });
    }

    if (action === "grant-complimentary") {
      let expiresAt: string | null = null;
      if (
        body.expiresAt !== null && body.expiresAt !== undefined &&
        body.expiresAt !== ""
      ) {
        const parsed = new Date(String(body.expiresAt));
        if (
          !Number.isFinite(parsed.getTime()) || parsed.getTime() <= Date.now()
        ) {
          return json(req, {
            error: "Choose a future complimentary-access expiry.",
          }, 400);
        }
        expiresAt = parsed.toISOString();
      }
      const { error } = await admin.rpc(
        "owner_console_grant_complimentary_access",
        {
          p_email: email,
          p_expires_at: expiresAt,
        },
      );
      if (error) throw new Error("Complimentary access could not be granted.");
      await writeAudit(
        admin,
        account.user_id,
        "owner_complimentary_access_granted",
        {
          temporary: Boolean(expiresAt),
        },
      );
      return json(req, {
        ok: true,
        account: accountForBrowser(await accountByEmail(admin, email)),
      });
    }

    if (action === "revoke-complimentary") {
      const { error } = await admin.rpc(
        "owner_console_revoke_complimentary_access",
        { p_email: email },
      );
      if (error) {
        return json(req, {
          error: "That account does not have active complimentary access.",
        }, 409);
      }
      await writeAudit(
        admin,
        account.user_id,
        "owner_complimentary_access_revoked",
      );
      return json(req, {
        ok: true,
        account: accountForBrowser(await accountByEmail(admin, email)),
      });
    }

    if (action === "send-password-reset") {
      if (!account.email_confirmed) {
        return json(
          req,
          { error: "The account email has not been confirmed." },
          409,
        );
      }
      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count, error: countError } = await admin.from("audit_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", account.user_id)
        .eq("event_type", "owner_password_reset_sent")
        .gte("created_at", since);
      if (countError) {
        throw new Error("Password-reset rate limit could not be checked.");
      }
      if ((count || 0) > 0) {
        return json(req, {
          error: "Wait 10 minutes before sending another password-reset email.",
        }, 429);
      }

      const appBaseUrl = configuredAppBaseUrl();
      const { data: linkData, error: linkError } = await admin.auth.admin
        .generateLink({
          type: "recovery",
          email: account.account_email,
          options: { redirectTo: `${appBaseUrl}/` },
        });
      const actionLink = linkData?.properties?.action_link;
      if (linkError || !isExpectedAuthActionLink(actionLink, supabaseUrl)) {
        throw new Error("Password-reset email could not be prepared.");
      }
      const resendKey = String(Deno.env.get("RESEND_API_KEY") || "");
      if (
        !resendKey || !(await sendEmail(
          resendKey,
          account.account_email,
          "Reset your Tallyo password",
          "Reset your Tallyo password",
          "The Tallyo Owner sent this link after receiving your account-access request. The link can be used once and does not remove two-factor authentication.",
          "Choose a new password",
          actionLink,
        ))
      ) throw new Error("Password-reset email could not be sent.");
      await writeAudit(
        admin,
        account.user_id,
        "owner_password_reset_sent",
      );
      return json(req, {
        ok: true,
        account: accountForBrowser(await accountByEmail(admin, email)),
      });
    }

    if (action === "approve-mfa-reset") {
      if (account.user_id === ownerId) {
        return json(req, {
          error: "The Owner Console cannot reset its own MFA.",
        }, 409);
      }
      if (
        !["confirmed", "approved"].includes(account.recovery_request_status)
      ) {
        return json(req, {
          error: "The account holder must confirm the recovery email first.",
        }, 409);
      }
      const { error: beginError } = await admin.rpc(
        "owner_console_begin_mfa_recovery",
        {
          p_user_id: account.user_id,
          p_actor_user_id: ownerId,
        },
      );
      if (beginError) throw new Error("MFA recovery could not be approved.");

      const { data: factorData, error: factorError } = await admin.auth.admin
        .mfa.listFactors({
          userId: account.user_id,
        });
      if (factorError) {
        throw new Error(
          "MFA recovery is securely locked but authenticator removal must be retried.",
        );
      }
      for (const factor of factorData?.factors || []) {
        const { error: deleteError } = await admin.auth.admin.mfa.deleteFactor({
          userId: account.user_id,
          id: factor.id,
        });
        if (deleteError) {
          throw new Error(
            "MFA recovery is securely locked but authenticator removal must be retried.",
          );
        }
      }

      const readySince = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString();
      const { count: readyCount } = await admin.from("audit_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", account.user_id)
        .eq("event_type", "owner_mfa_recovery_ready")
        .gte("created_at", readySince);
      let notificationSent = true;
      if ((readyCount || 0) === 0) {
        notificationSent = await sendEmail(
          String(Deno.env.get("RESEND_API_KEY") || ""),
          account.account_email,
          "Your Tallyo authenticator can now be replaced",
          "Set up a new authenticator",
          "Your confirmed recovery request was approved. Sign in with your existing email and password, then follow the instructions to connect a new authenticator before your business data is unlocked.",
          "Return to Tallyo",
          `${configuredAppBaseUrl()}/`,
        );
        await writeAudit(
          admin,
          account.user_id,
          "owner_mfa_recovery_ready",
          {
            notice_sent: notificationSent,
          },
        );
      }
      return json(req, {
        ok: true,
        notificationSent,
        account: accountForBrowser(await accountByEmail(admin, email)),
      });
    }

    return json(req, { error: "Unsupported action" }, 400);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Owner action failed.";
    const status = /unavailable/.test(message)
      ? 503
      : /valid account email|future/.test(message)
      ? 400
      : 500;
    return json(req, { error: message }, status);
  }
});
