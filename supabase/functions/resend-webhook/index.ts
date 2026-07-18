// resend-webhook - Resend delivery/failure event receiver.
// Verifies Resend/Svix signatures before writing trusted audit events or
// document history. If RESEND_WEBHOOK_SECRET is not configured yet, events are
// acknowledged but ignored so the endpoint can be created during setup.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64ToBytes(value: string): ArrayBuffer {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

async function hmacSha256Base64(secret: string, payload: string): Promise<string> {
  const rawSecret = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const keyBytes = base64ToBytes(rawSecret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const bytes = new Uint8Array(sig);
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin);
}

async function verifySvixSignature(req: Request, rawBody: string, secret: string): Promise<boolean> {
  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;

  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > 300) return false;

  const signedPayload = `${id}.${timestamp}.${rawBody}`;
  const expected = await hmacSha256Base64(secret, signedPayload);
  return signature.split(" ").some((part) => {
    const value = part.includes(",") ? part.split(",")[1] : part;
    return timingSafeEqual(value, expected);
  });
}

function getTag(tags: unknown, name: string): string | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    const hit = tags.find((t: any) => t && t.name === name);
    return hit ? String(hit.value || "") : null;
  }
  if (typeof tags === "object") {
    const value = (tags as Record<string, unknown>)[name];
    return value == null ? null : String(value);
  }
  return null;
}

function eventText(type: string, to: string | null): string {
  const suffix = to ? ` for ${to}` : "";
  const map: Record<string, string> = {
    "email.sent": `Email sent to provider${suffix}`,
    "email.delivered": `Email delivered${suffix}`,
    "email.delivery_delayed": `Email delivery delayed${suffix}`,
    "email.bounced": `Email bounced${suffix}`,
    "email.complained": `Spam complaint received${suffix}`,
    "email.failed": `Email failed${suffix}`,
    "email.opened": `Email opened${suffix}`,
    "email.clicked": `Email link clicked${suffix}`,
    "email.received": `Email received${suffix}`,
  };
  return map[type] || `Email event: ${type}${suffix}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const rawBody = await req.text();
  const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.warn("RESEND_WEBHOOK_SECRET missing; event ignored");
    return json({ ok: true, ignored: "missing webhook secret" }, 202);
  }

  const verified = await verifySvixSignature(req, rawBody, webhookSecret);
  if (!verified) return json({ error: "Invalid webhook signature" }, 401);

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const type = String(payload.type || "");
  const data = payload.data || {};
  const svixId = String(req.headers.get("svix-id") || "");
  const providerEventId = String(payload.id || payload.event_id || data.id || data.email_id || "");
  const providerEmailId = data.email_id ? String(data.email_id) : null;
  const auditProviderEventId = `${type}:${svixId || providerEventId || providerEmailId}`;
  const tags = data.tags || payload.tags;
  const userId = getTag(tags, "user_id");
  const documentId = getTag(tags, "document_id");
  const to = Array.isArray(data.to) ? String(data.to[0] || "") : (data.to ? String(data.to) : null);

  if (!userId || !documentId) {
    console.warn("Webhook missing Tallyo tags; event ignored", { type, providerEventId });
    return json({ ok: true, ignored: "missing Tallyo tags" }, 202);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const metadata = {
    resend_event_type: type,
    resend_event_id: providerEventId || null,
    resend_email_id: providerEmailId,
    to,
    provider_created_at: data.created_at || payload.created_at || null,
  };

  const { error: auditError } = await admin.from("audit_events").insert({
    user_id: userId,
    actor_user_id: null,
    event_type: type.replaceAll(".", "_"),
    object_type: "invoice",
    object_id: documentId,
    source: "provider_webhook",
    provider: "resend",
    provider_event_id: auditProviderEventId,
    metadata,
  });
  if (auditError && !String(auditError.message || "").includes("duplicate")) {
    console.error("audit event insert failed", auditError.message);
    return json({ error: auditError.message }, 500);
  }

  const historyTypes = new Set([
    "email.delivered",
    "email.delivery_delayed",
    "email.bounced",
    "email.complained",
    "email.failed",
  ]);
  if (historyTypes.has(type)) {
    const { data: inv, error: invError } = await admin.from("invoices")
      .select("history,user_id")
      .eq("id", documentId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!invError && inv) {
      const history = Array.isArray(inv.history) ? inv.history : [];
      const marker = `${type}:${svixId || providerEventId || providerEmailId || ""}`;
      const exists = history.some((ev: any) => ev && ev.providerMarker === marker);
      if (!exists) {
        history.push({
          ts: new Date().toISOString(),
          type: "email",
          text: eventText(type, to),
          providerMarker: marker,
        });
        await admin.from("invoices")
          .update({ history, updated_at: new Date().toISOString() })
          .eq("id", documentId)
          .eq("user_id", userId);
      }
    }
  }

  return json({ ok: true });
});
