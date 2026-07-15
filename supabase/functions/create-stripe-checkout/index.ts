// create-stripe-checkout - creates a Stripe Checkout payment page for an invoice.
// The browser may request a payment link, but it cannot mark an invoice as paid.
// Payment state is updated only by the signed Stripe webhook.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InvoicePayment = {
  amount?: unknown;
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function amountPaid(payments: unknown): number {
  if (!Array.isArray(payments)) return 0;
  return payments.reduce((sum: number, payment: InvoicePayment) => {
    return sum + (Number(payment?.amount) || 0);
  }, 0);
}

function outstandingAmount(inv: any): number {
  return Math.max(0, (Number(inv.grand_total) || 0) - amountPaid(inv.payments));
}

function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function checkoutBaseUrl(req: Request): string | null {
  const configured = Deno.env.get("APP_BASE_URL");
  if (configured) return configured.replace(/\/+$/, "");
  const origin = req.headers.get("Origin");
  return origin ? origin.replace(/\/+$/, "") : null;
}

async function insertAuditEvent(admin: any, payload: Record<string, unknown>) {
  try {
    const { error } = await admin.from("audit_events").insert(payload);
    if (error) console.warn("audit event insert skipped", error.message);
  } catch (e) {
    console.warn("audit event insert skipped", String(e));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return json({ error: "Stripe is not configured" }, 500);

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

  const documentId = String(body.documentId || "");
  if (!isUuid(documentId)) return json({ error: "Invalid document ID" }, 400);

  const { data: inv, error: invError } = await admin.from("invoices").select("*").eq("id", documentId).maybeSingle();
  if (invError) return json({ error: invError.message }, 500);
  if (!inv || inv.user_id !== userData.user.id) return json({ error: "Invoice not found" }, 404);
  if (inv.doc_type !== "invoice") return json({ error: "Only invoices can be paid online" }, 400);
  if (inv.status === "Cancelled") return json({ error: "Cancelled invoices cannot be paid online" }, 400);

  const outstanding = outstandingAmount(inv);
  if (outstanding <= 0.001 || inv.status === "Paid") return json({ error: "This invoice is already paid" }, 400);

  const appUrl = checkoutBaseUrl(req);
  if (!appUrl) return json({ error: "APP_BASE_URL is not configured" }, 500);

  const customer = inv.customer_snapshot || {};
  const currency = String(inv.currency || "GBP").toLowerCase();
  const amountMinor = Math.round(outstanding * 100);
  if (!Number.isFinite(amountMinor) || amountMinor < 1) return json({ error: "Invoice balance is too small to pay online" }, 400);
  const checkoutAmount = amountMinor / 100;

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${appUrl}?payment=success&invoice=${encodeURIComponent(documentId)}`);
  params.set("cancel_url", `${appUrl}?payment=cancelled&invoice=${encodeURIComponent(documentId)}`);
  params.set("client_reference_id", documentId);
  params.set("line_items[0][price_data][currency]", currency);
  params.set("line_items[0][price_data][unit_amount]", String(amountMinor));
  params.set("line_items[0][price_data][product_data][name]", `Invoice #${inv.number || documentId}`);
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[invoice_id]", documentId);
  params.set("metadata[user_id]", userData.user.id);
  params.set("metadata[invoice_number]", String(inv.number || ""));
  params.set("metadata[payment_kind]", "full_balance");
  params.set("payment_intent_data[metadata][invoice_id]", documentId);
  params.set("payment_intent_data[metadata][user_id]", userData.user.id);
  params.set("payment_intent_data[metadata][payment_kind]", "full_balance");
  if (validEmail(customer.email)) params.set("customer_email", customer.email.trim());

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const stripeBody = await stripeResponse.json().catch(() => ({}));
  if (!stripeResponse.ok) {
    return json({ error: stripeBody?.error?.message || "Stripe Checkout session could not be created" }, 502);
  }

  await insertAuditEvent(admin, {
    user_id: userData.user.id,
    actor_user_id: userData.user.id,
    event_type: "stripe_checkout_created",
    object_type: "invoice",
    object_id: documentId,
    source: "edge_function",
    provider: "stripe",
    provider_event_id: stripeBody?.id || null,
    metadata: {
      invoice_number: inv.number || null,
      amount: checkoutAmount,
      currency: inv.currency || "GBP",
      customer_email: validEmail(customer.email) ? customer.email.trim() : null,
      channel: "app",
      payment_kind: "full_balance",
    },
  });

  return json({ ok: true, url: stripeBody?.url || null, sessionId: stripeBody?.id || null });
});
