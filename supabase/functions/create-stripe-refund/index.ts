// create-stripe-refund - requests a Stripe refund for a Tallyo invoice payment.
// Money state is still updated only by the signed Stripe webhook.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InvoicePayment = {
  amount?: unknown;
  provider?: unknown;
  providerPaymentIntentId?: unknown;
  providerRefundId?: unknown;
  lifecycleEvent?: unknown;
  note?: unknown;
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

function isStripeRefund(payment: InvoicePayment): boolean {
  return payment.provider === "stripe" &&
    (payment.lifecycleEvent === "refund" || Number(payment.amount) < 0);
}

function refundableForPayment(payments: InvoicePayment[], payment: InvoicePayment): number {
  const intent = String(payment.providerPaymentIntentId || "");
  const paidAmount = Number(payment.amount) || 0;
  if (!intent || paidAmount <= 0) return 0;

  const refunded = payments
    .filter((entry) => isStripeRefund(entry) && String(entry.providerPaymentIntentId || "") === intent)
    .reduce((sum, entry) => sum + Math.abs(Number(entry.amount) || 0), 0);

  return Math.max(0, Math.round((paidAmount - refunded + Number.EPSILON) * 100) / 100);
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

  const paymentIndex = Number(body.paymentIndex);
  if (!Number.isInteger(paymentIndex) || paymentIndex < 0) return json({ error: "Invalid payment selection" }, 400);

  const { data: inv, error: invError } = await admin.from("invoices").select("*").eq("id", documentId).maybeSingle();
  if (invError) return json({ error: invError.message }, 500);
  if (!inv || inv.user_id !== userData.user.id) return json({ error: "Invoice not found" }, 404);
  if (inv.doc_type !== "invoice") return json({ error: "Only invoice card payments can be refunded" }, 400);

  const payments: InvoicePayment[] = Array.isArray(inv.payments) ? inv.payments : [];
  const payment = payments[paymentIndex];
  if (!payment || payment.provider !== "stripe" || isStripeRefund(payment)) {
    return json({ error: "Select a confirmed Stripe payment to refund" }, 400);
  }

  const paymentIntentId = String(payment.providerPaymentIntentId || "");
  if (!paymentIntentId) return json({ error: "This Stripe payment is missing a payment intent ID" }, 400);

  const refundable = refundableForPayment(payments, payment);
  if (refundable <= 0.001) return json({ error: "This Stripe payment has already been fully refunded" }, 400);

  const requestedAmount = body.amount === undefined || body.amount === null || body.amount === ""
    ? refundable
    : Number(body.amount);
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) return json({ error: "Enter a valid refund amount" }, 400);
  if (requestedAmount > refundable + 0.001) return json({ error: "Refund amount is greater than the refundable balance" }, 400);

  const currency = String(inv.currency || "GBP").toUpperCase();
  const amountMinor = Math.round(requestedAmount * 100);
  if (amountMinor < 1) return json({ error: "Refund amount is too small" }, 400);

  const refundSequence = payments.filter((entry) =>
    isStripeRefund(entry) && String(entry.providerPaymentIntentId || "") === paymentIntentId
  ).length;
  const idempotencyKey = `tallyo-refund-${documentId}-${paymentIntentId}-${refundSequence}-${amountMinor}`;

  const params = new URLSearchParams();
  params.set("payment_intent", paymentIntentId);
  params.set("amount", String(amountMinor));
  params.set("reason", "requested_by_customer");
  params.set("metadata[invoice_id]", documentId);
  params.set("metadata[user_id]", userData.user.id);
  params.set("metadata[invoice_number]", String(inv.number || ""));
  params.set("metadata[source]", "tallyo_app");

  const stripeResponse = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": idempotencyKey,
    },
    body: params,
  });
  const stripeBody = await stripeResponse.json().catch(() => ({}));
  if (!stripeResponse.ok) {
    return json({ error: stripeBody?.error?.message || "Stripe refund could not be created" }, 502);
  }

  const refundAmount = Math.round((Number(stripeBody?.amount) || amountMinor)) / 100;
  await insertAuditEvent(admin, {
    user_id: userData.user.id,
    actor_user_id: userData.user.id,
    event_type: "stripe_refund_requested",
    object_type: "invoice",
    object_id: documentId,
    source: "edge_function",
    provider: "stripe",
    provider_event_id: stripeBody?.id || null,
    metadata: {
      invoice_number: inv.number || null,
      payment_intent: paymentIntentId,
      amount: refundAmount,
      currency,
      status: stripeBody?.status || null,
      idempotency_key: idempotencyKey,
    },
  });

  return json({
    ok: true,
    refundId: stripeBody?.id || null,
    status: stripeBody?.status || null,
    amount: refundAmount,
    currency,
  });
});
