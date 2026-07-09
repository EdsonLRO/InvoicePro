// stripe-webhook - trusted payment event receiver.
// This function verifies Stripe's signature before updating invoice payments.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type InvoicePayment = {
  amount?: unknown;
  provider?: unknown;
  providerEventId?: unknown;
  providerSessionId?: unknown;
  providerPaymentIntentId?: unknown;
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function amountPaid(payments: unknown): number {
  if (!Array.isArray(payments)) return 0;
  return payments.reduce((sum: number, payment: InvoicePayment) => {
    return sum + (Number(payment?.amount) || 0);
  }, 0);
}

function currencySymbol(code: string) {
  return ({ GBP: "\u00A3", EUR: "\u20AC", USD: "$" } as Record<string, string>)[code] || `${code} `;
}

function formatMoney(code: string, amount: unknown) {
  return `${currencySymbol(code || "GBP")}${(Number(amount) || 0).toFixed(2)}`;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
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

async function verifyStripeSignature(header: string | null, rawBody: string, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;

  const ts = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > 300) return false;

  const expected = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

async function auditEventExists(admin: any, providerEventId: string): Promise<boolean> {
  const { data, error } = await admin.from("audit_events")
    .select("id")
    .eq("provider", "stripe")
    .eq("provider_event_id", providerEventId)
    .maybeSingle();
  if (error) {
    console.warn("audit event lookup failed", error.message);
    return false;
  }
  return Boolean(data);
}

async function insertAuditEvent(admin: any, payload: Record<string, unknown>) {
  try {
    const { error } = await admin.from("audit_events").insert(payload);
    if (error) console.warn("audit event insert skipped", error.message);
  } catch (e) {
    console.warn("audit event insert skipped", String(e));
  }
}

async function handleCheckoutCompleted(admin: any, event: any) {
  const session = event.data?.object || {};
  if (session.payment_status !== "paid") return { ignored: "checkout not paid" };

  const invoiceId = String(session.metadata?.invoice_id || session.client_reference_id || "");
  const userId = String(session.metadata?.user_id || "");
  if (!invoiceId || !userId) return { ignored: "missing Tallyo metadata" };

  const { data: inv, error: invError } = await admin.from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (invError) throw new Error(invError.message);
  if (!inv) return { ignored: "invoice not found" };

  const payments: InvoicePayment[] = Array.isArray(inv.payments) ? inv.payments : [];
  const alreadyRecorded = payments.some((payment) => {
    return payment?.provider === "stripe" && (
      payment.providerEventId === event.id ||
      payment.providerSessionId === session.id ||
      (session.payment_intent && payment.providerPaymentIntentId === session.payment_intent)
    );
  });
  if (alreadyRecorded) return { ok: true, duplicate: true };

  const currency = String(session.currency || inv.currency || "GBP").toUpperCase();
  const amount = Math.round((Number(session.amount_total) || 0)) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return { ignored: "invalid payment amount" };

  const nowISO = new Date().toISOString();
  const payment = {
    amount,
    date: nowISO.split("T")[0],
    note: "Stripe card payment",
    provider: "stripe",
    providerEventId: event.id,
    providerSessionId: session.id || null,
    providerPaymentIntentId: session.payment_intent || null,
    currency,
  };
  payments.push(payment);

  const total = Number(inv.grand_total) || 0;
  const newPaid = amountPaid(payments);
  const nextStatus = newPaid >= total - 0.001 ? "Paid" : (inv.status === "Draft" ? "Sent" : inv.status);
  const history = Array.isArray(inv.history) ? inv.history : [];
  history.push({
    ts: nowISO,
    type: "payment",
    text: `Stripe payment of ${formatMoney(currency, amount)} recorded`,
    providerMarker: `stripe:${event.id}`,
  });
  if (nextStatus === "Paid" && inv.status !== "Paid") {
    history.push({
      ts: nowISO,
      type: "paid",
      text: "Marked as fully paid by Stripe payment",
      providerMarker: `stripe-paid:${event.id}`,
    });
  }

  const { error: updateError } = await admin.from("invoices")
    .update({ payments, history, status: nextStatus, updated_at: nowISO })
    .eq("id", invoiceId)
    .eq("user_id", userId);
  if (updateError) throw new Error(updateError.message);

  await insertAuditEvent(admin, {
    user_id: userId,
    actor_user_id: null,
    event_type: "stripe_payment_completed",
    object_type: "invoice",
    object_id: invoiceId,
    source: "provider_webhook",
    provider: "stripe",
    provider_event_id: event.id,
    metadata: {
      session_id: session.id || null,
      payment_intent: session.payment_intent || null,
      amount,
      currency,
      invoice_number: inv.number || null,
      customer_email: session.customer_details?.email || session.customer_email || null,
    },
  });

  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) return json({ error: "Stripe webhook is not configured" }, 500);

  const rawBody = await req.text();
  const verified = await verifyStripeSignature(req.headers.get("stripe-signature"), rawBody, webhookSecret);
  if (!verified) return json({ error: "Invalid webhook signature" }, 401);

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const eventId = String(event.id || "");
  if (!eventId) return json({ error: "Missing Stripe event ID" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (await auditEventExists(admin, eventId)) return json({ ok: true, duplicate: true });

  try {
    if (event.type === "checkout.session.completed") {
      return json(await handleCheckoutCompleted(admin, event));
    }
    return json({ ok: true, ignored: event.type || "unknown event" });
  } catch (e) {
    console.error("stripe webhook failed", e);
    return json({ error: e instanceof Error ? e.message : "Webhook processing failed" }, 500);
  }
});
