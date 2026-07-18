// log-app-event - authenticated append-only audit event writer for sensitive app actions.
// Browser clients never write audit_events directly; this function validates the
// session, limits event types, scrubs metadata, and inserts with the service role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedEvents = new Set([
  "account_password_changed",
  "account_password_recovered",
  "account_mfa_enabled",
  "account_mfa_backup_added",
  "account_mfa_factor_removed",
  "account_mfa_disabled",
  "account_logout_local",
  "account_logout_all_devices",
  "account_data_exported",
  "company_settings_updated",
  "document_created",
  "credit_note_created",
  "quote_converted_to_invoice",
  "document_deleted",
  "document_bulk_deleted",
  "document_pdf_exported",
  "document_bulk_pdf_exported",
  "document_status_changed",
  "manual_payment_recorded",
  "manual_payment_removed",
  "customer_deleted",
  "customer_bulk_deleted",
  "saved_item_deleted",
  "saved_item_bulk_deleted",
  "saved_item_bulk_price_changed",
  "recurring_schedule_deleted",
  "recurring_schedule_bulk_deleted",
  "recurring_schedule_paused",
  "recurring_schedule_resumed",
  "recurring_schedule_created",
  "recurring_schedule_updated",
  "reminder_settings_changed",
]);

const allowedObjectTypes = new Set([
  "account",
  "company_settings",
  "invoice",
  "document",
  "customer",
  "saved_item",
  "recurring_template",
]);

const sensitiveKeyPattern = /(password|token|secret|key|authorization|cookie|card|cvc|cvv|iban|sort|account_number|email|address|phone|mobile|name|notes|terms|items|customer)/i;

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function cleanText(value: unknown, max = 80): string | null {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, max);
}

function sanitizeMetadata(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (sensitiveKeyPattern.test(key)) continue;
    if (value === null) {
      output[key] = null;
    } else if (typeof value === "boolean") {
      output[key] = value;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      output[key] = value;
    } else if (typeof value === "string") {
      output[key] = value.slice(0, 120);
    }
    if (Object.keys(output).length >= 12) break;
  }
  return output;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Missing authorization" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) return json({ error: "Invalid session" }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const eventType = cleanText(body.eventType);
  if (!eventType || !allowedEvents.has(eventType)) return json({ error: "Unsupported audit event" }, 400);

  const objectType = cleanText(body.objectType, 40);
  if (objectType && !allowedObjectTypes.has(objectType)) return json({ error: "Unsupported object type" }, 400);

  const objectId = cleanText(body.objectId, 60);
  if (objectId && !isUuid(objectId)) return json({ error: "Invalid object ID" }, 400);

  const metadata = sanitizeMetadata(body.metadata);

  const { error } = await admin.from("audit_events").insert({
    user_id: userData.user.id,
    actor_user_id: userData.user.id,
    event_type: eventType,
    object_type: objectType || null,
    object_id: objectId || null,
    source: "edge_function",
    metadata,
  });
  if (error) return json({ error: "Audit event could not be recorded" }, 500);

  return json({ ok: true });
});
