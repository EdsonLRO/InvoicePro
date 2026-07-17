// stripe-webhook - trusted payment event receiver.
// This function verifies Stripe's signature before updating invoice payments.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

type InvoicePayment = {
  amount?: unknown;
  date?: unknown;
  note?: unknown;
  provider?: unknown;
  providerEventId?: unknown;
  providerSessionId?: unknown;
  providerPaymentIntentId?: unknown;
  providerRefundId?: unknown;
  lifecycleEvent?: unknown;
  currency?: unknown;
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
  return ({ GBP: "\u00A3", EUR: "\u20AC", USD: "$" } as Record<string, string>)[
    code
  ] || `${code} `;
}

function formatMoney(code: string, amount: unknown) {
  return `${currencySymbol(code || "GBP")}${(Number(amount) || 0).toFixed(2)}`;
}

function statusAfterPaymentChange(inv: any, paid: number): string {
  const total = Number(inv.grand_total) || 0;
  if (inv.status === "Cancelled") return "Cancelled";
  if (paid >= total - 0.001) return "Paid";
  if (inv.status === "Paid") return "Sent";
  if (inv.status === "Draft" && paid > 0.001) return "Sent";
  return inv.status || "Sent";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(sig)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
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

async function verifyStripeSignature(
  header: string | null,
  rawBody: string,
  secret: string,
): Promise<boolean> {
  if (!header) return false;
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((
    part,
  ) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;

  const ts = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > 300) return false;

  const expected = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

async function auditEventExists(
  admin: any,
  providerEventId: string,
): Promise<boolean> {
  const { data, error } = await admin.from("audit_events")
    .select("id")
    .eq("provider", "stripe")
    .eq("provider_event_id", providerEventId)
    .maybeSingle();
  if (error) {
    throw new Error(`audit event lookup failed: ${error.message}`);
  }
  return Boolean(data);
}

async function verifiedCheckoutSession(
  admin: any,
  sessionId: string,
  invoiceId: string,
  userId: string,
  amount: number,
): Promise<boolean> {
  const { data, error } = await admin.from("audit_events")
    .select("metadata")
    .eq("event_type", "stripe_checkout_created")
    .eq("object_type", "invoice")
    .eq("object_id", invoiceId)
    .eq("user_id", userId)
    .eq("provider", "stripe")
    .eq("provider_event_id", sessionId)
    .maybeSingle();
  if (error) {
    throw new Error(`checkout session lookup failed: ${error.message}`);
  }
  if (!data) return false;
  const expectedAmount = Number(data.metadata?.amount);
  if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) return false;
  return Math.abs(expectedAmount - amount) < 0.01;
}

function historyHasProviderMarker(history: unknown, marker: string): boolean {
  return Array.isArray(history) &&
    history.some((entry) => entry?.providerMarker === marker);
}

async function findPaymentAuditByIntent(admin: any, paymentIntentId: string) {
  if (!paymentIntentId) return null;
  const { data, error } = await admin.from("audit_events")
    .select("user_id, object_id, metadata")
    .eq("event_type", "stripe_payment_completed")
    .eq("object_type", "invoice")
    .eq("provider", "stripe")
    .filter("metadata->>payment_intent", "eq", paymentIntentId)
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`payment intent audit lookup failed: ${error.message}`);
  }
  return data;
}

async function retrieveStripeRefund(refundId: string): Promise<any> {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("Stripe API is not configured for refund reconciliation");
  const expectsLive = Deno.env.get("STRIPE_LIVE_MODE") === "true";
  const keyModeMatches = expectsLive
    ? /^(?:sk|rk)_live_/.test(stripeKey)
    : /^(?:sk|rk)_test_/.test(stripeKey);
  if (!keyModeMatches) {
    throw new Error("Stripe key mode does not match STRIPE_LIVE_MODE");
  }
  const stripeApiVersion = Deno.env.get("STRIPE_API_VERSION")?.trim();
  if (expectsLive && !stripeApiVersion) {
    throw new Error("STRIPE_API_VERSION is required in live mode");
  }
  const response = await fetch(
    `https://api.stripe.com/v1/refunds/${encodeURIComponent(refundId)}`,
    {
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        ...(stripeApiVersion ? { "Stripe-Version": stripeApiVersion } : {}),
      },
    },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || "Stripe refund reconciliation failed");
  }
  return body;
}

async function loadInvoice(admin: any, invoiceId: string, userId: string) {
  const { data: inv, error } = await admin.from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return inv;
}

async function applyStripeInvoiceEvent(
  admin: any,
  inv: any,
  event: any,
  payments: InvoicePayment[],
  history: any[],
  status: string,
  eventType: string,
  metadata: Record<string, unknown>,
  processedAt: string,
): Promise<string> {
  const { data, error } = await admin.rpc("apply_stripe_invoice_event", {
    p_invoice_id: inv.id,
    p_user_id: inv.user_id,
    p_expected_version: Number(inv.stripe_event_version) || 0,
    p_payments: payments,
    p_history: history,
    p_status: status,
    p_event_type: eventType,
    p_provider_event_id: event.id,
    p_metadata: metadata,
    p_processed_at: processedAt,
  });
  if (error) throw new Error(`atomic invoice event failed: ${error.message}`);
  return String(data || "");
}

function mutationResult(result: string) {
  if (result === "applied") return { ok: true };
  if (result === "duplicate") return { ok: true, duplicate: true };
  if (result === "missing") return { ignored: "invoice not found" };
  return null;
}

async function handleCheckoutCompleted(admin: any, event: any, attempt = 0): Promise<any> {
  const session = event.data?.object || {};
  if (session.payment_status !== "paid") {
    return { ignored: "checkout not paid" };
  }

  const invoiceId = String(
    session.metadata?.invoice_id || session.client_reference_id || "",
  );
  const userId = String(session.metadata?.user_id || "");
  if (!invoiceId || !userId) return { ignored: "missing Tallyo metadata" };
  if (!isUuid(invoiceId) || !isUuid(userId)) {
    return { ignored: "invalid Tallyo metadata" };
  }
  if (!session.id) return { ignored: "missing checkout session ID" };

  const currency = String(session.currency || "GBP").toUpperCase();
  const amount = Math.round(Number(session.amount_total) || 0) / 100;
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ignored: "invalid payment amount" };
  }
  const paymentKind = String(session.metadata?.payment_kind || "");
  const paymentLabel = paymentKind === "deposit"
    ? "Stripe deposit payment"
    : "Stripe card payment";

  const knownCheckout = await verifiedCheckoutSession(
    admin,
    String(session.id),
    invoiceId,
    userId,
    amount,
  );
  if (!knownCheckout) {
    return { ignored: "checkout session was not created by Tallyo" };
  }

  const inv = await loadInvoice(admin, invoiceId, userId);
  if (!inv) return { ignored: "invoice not found" };

  const payments: InvoicePayment[] = Array.isArray(inv.payments)
    ? inv.payments
    : [];
  const alreadyRecorded = payments.some((payment) => {
    return payment?.provider === "stripe" && (
      payment.providerEventId === event.id ||
      payment.providerSessionId === session.id ||
      (session.payment_intent &&
        payment.providerPaymentIntentId === session.payment_intent)
    );
  });
  if (alreadyRecorded) return { ok: true, duplicate: true };

  if (currency !== String(inv.currency || "GBP").toUpperCase()) {
    return { ignored: "currency mismatch" };
  }

  const nowISO = new Date().toISOString();
  const payment = {
    amount,
    date: nowISO.split("T")[0],
    note: `${paymentLabel} confirmed`,
    provider: "stripe",
    providerEventId: event.id,
    providerSessionId: session.id || null,
    providerPaymentIntentId: session.payment_intent || null,
    currency,
  };
  payments.push(payment);

  const total = Number(inv.grand_total) || 0;
  const newPaid = amountPaid(payments);
  const nextStatus = newPaid >= total - 0.001
    ? "Paid"
    : (inv.status === "Draft" ? "Sent" : inv.status);
  const history = Array.isArray(inv.history) ? inv.history : [];
  history.push({
    ts: nowISO,
    type: "payment",
    text: `${paymentLabel} of ${formatMoney(currency, amount)} confirmed`,
    providerMarker: `stripe:${event.id}`,
  });
  if (nextStatus === "Paid" && inv.status !== "Paid") {
    history.push({
      ts: nowISO,
      type: "paid",
      text: "Invoice fully paid by Stripe payment",
      providerMarker: `stripe-paid:${event.id}`,
    });
  }

  const result = await applyStripeInvoiceEvent(
    admin,
    inv,
    event,
    payments,
    history,
    nextStatus,
    "stripe_payment_completed",
    {
      session_id: session.id || null,
      payment_intent: session.payment_intent || null,
      amount,
      currency,
      payment_kind: paymentKind || null,
      invoice_number: inv.number || null,
      customer_email: session.customer_details?.email ||
        session.customer_email || null,
    },
    nowISO,
  );
  const settled = mutationResult(result);
  if (settled) return settled;
  if (result === "stale" && attempt < 4) {
    return await handleCheckoutCompleted(admin, event, attempt + 1);
  }
  throw new Error("invoice changed repeatedly while recording Stripe payment");
}

async function handleCheckoutPaymentFailed(admin: any, event: any, attempt = 0): Promise<any> {
  const session = event.data?.object || {};
  const invoiceId = String(
    session.metadata?.invoice_id || session.client_reference_id || "",
  );
  const userId = String(session.metadata?.user_id || "");
  if (!invoiceId || !userId) return { ignored: "missing Tallyo metadata" };
  if (!isUuid(invoiceId) || !isUuid(userId)) {
    return { ignored: "invalid Tallyo metadata" };
  }
  if (!session.id) return { ignored: "missing checkout session ID" };

  const amount = Math.round(Number(session.amount_total) || 0) / 100;
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ignored: "invalid payment amount" };
  }

  const knownCheckout = await verifiedCheckoutSession(
    admin,
    String(session.id),
    invoiceId,
    userId,
    amount,
  );
  if (!knownCheckout) {
    return { ignored: "checkout session was not created by Tallyo" };
  }

  const inv = await loadInvoice(admin, invoiceId, userId);
  if (!inv) return { ignored: "invoice not found" };

  const currency = String(session.currency || inv.currency || "GBP")
    .toUpperCase();
  if (currency !== String(inv.currency || "GBP").toUpperCase()) {
    return { ignored: "currency mismatch" };
  }
  const nowISO = new Date().toISOString();
  const history = Array.isArray(inv.history) ? inv.history : [];
  if (historyHasProviderMarker(history, `stripe-failed:${event.id}`)) {
    return { ok: true, duplicate: true };
  }
  history.push({
    ts: nowISO,
    type: "payment_failed",
    text: `Stripe payment failed${
      amount > 0 ? ` for ${formatMoney(currency, amount)}` : ""
    }`,
    providerMarker: `stripe-failed:${event.id}`,
  });

  const result = await applyStripeInvoiceEvent(
    admin,
    inv,
    event,
    Array.isArray(inv.payments) ? inv.payments : [],
    history,
    inv.status || "Sent",
    "stripe_payment_failed",
    {
      session_id: session.id || null,
      payment_intent: session.payment_intent || null,
      amount: amount > 0 ? amount : null,
      currency,
      invoice_number: inv.number || null,
      customer_email: session.customer_details?.email ||
        session.customer_email || null,
    },
    nowISO,
  );
  const settled = mutationResult(result);
  if (settled) return settled;
  if (result === "stale" && attempt < 4) {
    return await handleCheckoutPaymentFailed(admin, event, attempt + 1);
  }
  throw new Error("invoice changed repeatedly while recording failed Stripe payment");
}

async function handleRefund(admin: any, event: any, attempt = 0): Promise<any> {
  const eventRefund = event.data?.object || {};
  const refundId = String(eventRefund.id || "");
  const eventPaymentIntentId = String(eventRefund.payment_intent || "");
  if (!eventPaymentIntentId || !refundId) {
    return { ignored: "refund missing payment intent" };
  }

  // Stripe does not guarantee event ordering. Re-read the current Refund so an
  // older succeeded/updated delivery cannot undo a later failed state.
  const refund = await retrieveStripeRefund(refundId);
  const paymentIntentId = String(refund.payment_intent || "");
  if (!paymentIntentId || !refundId) {
    return { ignored: "refund missing payment intent" };
  }
  if (paymentIntentId !== eventPaymentIntentId || String(refund.id || "") !== refundId) {
    throw new Error("Stripe refund reconciliation identity mismatch");
  }

  const paymentAudit = await findPaymentAuditByIntent(admin, paymentIntentId);
  if (!paymentAudit?.object_id || !paymentAudit?.user_id) {
    return { ignored: "payment intent not known to Tallyo" };
  }

  const invoiceId = String(paymentAudit.object_id);
  const userId = String(paymentAudit.user_id);
  if (!isUuid(invoiceId) || !isUuid(userId)) {
    return { ignored: "invalid Tallyo metadata" };
  }

  const inv = await loadInvoice(admin, invoiceId, userId);
  if (!inv) return { ignored: "invoice not found" };

  const currency = String(refund.currency || inv.currency || "GBP")
    .toUpperCase();
  if (currency !== String(inv.currency || "GBP").toUpperCase()) {
    return { ignored: "currency mismatch" };
  }

  const nowISO = new Date().toISOString();
  const payments: InvoicePayment[] = Array.isArray(inv.payments)
    ? inv.payments
    : [];
  const history = Array.isArray(inv.history) ? inv.history : [];
  if (
    historyHasProviderMarker(history, `stripe-refund:${event.id}`) ||
    historyHasProviderMarker(
      history,
      `stripe-refund-failed-reversal:${event.id}`,
    ) ||
    historyHasProviderMarker(history, `stripe-refund-status:${event.id}`)
  ) {
    return { ok: true, duplicate: true };
  }
  const refundAmount = Math.round(Number(refund.amount) || 0) / 100;
  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    return { ignored: "invalid refund amount" };
  }

  const alreadyRecorded = payments.some((payment) =>
    payment?.provider === "stripe" && payment.providerRefundId === refundId
  );
  const refundStatus = String(refund.status || "").toLowerCase();
  const refundSucceeded = refundStatus === "succeeded";
  const refundFailed = refundStatus === "failed";
  const refundUnsuccessful = refundFailed || refundStatus === "canceled";
  const eventType = refundSucceeded
    ? "stripe_refund_succeeded"
    : refundFailed
    ? "stripe_refund_failed"
    : "stripe_refund_updated";
  const recordedRefund = payments.find((payment) =>
    payment?.provider === "stripe" &&
    payment.providerRefundId === refundId &&
    payment.lifecycleEvent === "refund" &&
    Number(payment.amount) < 0
  );
  const failedRefundReversed = payments.some((payment) =>
    payment?.provider === "stripe" &&
    payment.providerRefundId === refundId &&
    payment.lifecycleEvent === "refund_failed_reversal" &&
    Number(payment.amount) > 0
  );

  if (refundSucceeded && !alreadyRecorded) {
    payments.push({
      amount: -refundAmount,
      date: nowISO.split("T")[0],
      note: "Stripe refund confirmed",
      provider: "stripe",
      providerEventId: event.id,
      providerRefundId: refundId,
      providerPaymentIntentId: paymentIntentId,
      lifecycleEvent: "refund",
      currency,
    });
    history.push({
      ts: nowISO,
      type: "refund",
      text: `Stripe refund of ${formatMoney(currency, refundAmount)} confirmed`,
      providerMarker: `stripe-refund:${event.id}`,
    });
  } else if (refundUnsuccessful && recordedRefund && !failedRefundReversed) {
    payments.push({
      amount: Math.abs(Number(recordedRefund.amount) || refundAmount),
      date: nowISO.split("T")[0],
      note: `Stripe refund ${refundStatus} reversal`,
      provider: "stripe",
      providerEventId: event.id,
      providerRefundId: refundId,
      providerPaymentIntentId: paymentIntentId,
      lifecycleEvent: "refund_failed_reversal",
      currency,
    });
    history.push({
      ts: nowISO,
      type: "refund",
      text: `Stripe refund ${refundStatus} for ${
        formatMoney(currency, refundAmount)
      }; invoice balance restored`,
      providerMarker: `stripe-refund-failed-reversal:${event.id}`,
    });
  } else {
    history.push({
      ts: nowISO,
      type: "refund",
      text: `Stripe refund ${String(refund.status || "updated")} for ${
        formatMoney(currency, refundAmount)
      }`,
      providerMarker: `stripe-refund-status:${event.id}`,
    });
  }

  const nextStatus = statusAfterPaymentChange(inv, amountPaid(payments));
  const result = await applyStripeInvoiceEvent(
    admin,
    inv,
    event,
    payments,
    history,
    nextStatus,
    eventType,
    {
      refund_id: refundId,
      payment_intent: paymentIntentId,
      charge: refund.charge || null,
      amount: refundAmount,
      currency,
      status: refund.status || null,
      invoice_number: inv.number || null,
    },
    nowISO,
  );
  const settled = mutationResult(result);
  if (settled) return settled;
  if (result === "stale" && attempt < 4) {
    return await handleRefund(admin, event, attempt + 1);
  }
  throw new Error("invoice changed repeatedly while recording Stripe refund");
}

async function handleDispute(admin: any, event: any, attempt = 0): Promise<any> {
  const dispute = event.data?.object || {};
  const paymentIntentId = String(dispute.payment_intent || "");
  if (!paymentIntentId) return { ignored: "dispute missing payment intent" };

  const paymentAudit = await findPaymentAuditByIntent(admin, paymentIntentId);
  if (!paymentAudit?.object_id || !paymentAudit?.user_id) {
    return { ignored: "payment intent not known to Tallyo" };
  }

  const invoiceId = String(paymentAudit.object_id);
  const userId = String(paymentAudit.user_id);
  if (!isUuid(invoiceId) || !isUuid(userId)) {
    return { ignored: "invalid Tallyo metadata" };
  }

  const inv = await loadInvoice(admin, invoiceId, userId);
  if (!inv) return { ignored: "invoice not found" };

  const currency = String(dispute.currency || inv.currency || "GBP")
    .toUpperCase();
  const amount = Math.round(Number(dispute.amount) || 0) / 100;
  const nowISO = new Date().toISOString();
  const history = Array.isArray(inv.history) ? inv.history : [];
  if (historyHasProviderMarker(history, `stripe-dispute:${event.id}`)) {
    return { ok: true, duplicate: true };
  }
  const label = event.type === "charge.dispute.created"
    ? "Stripe dispute opened"
    : event.type === "charge.dispute.funds_withdrawn"
    ? "Stripe dispute funds withdrawn"
    : event.type === "charge.dispute.funds_reinstated"
    ? "Stripe dispute funds reinstated"
    : event.type === "charge.dispute.closed"
    ? "Stripe dispute closed"
    : "Stripe dispute updated";
  history.push({
    ts: nowISO,
    type: "dispute",
    text: `${label}${
      amount > 0 ? ` for ${formatMoney(currency, amount)}` : ""
    }`,
    providerMarker: `stripe-dispute:${event.id}`,
  });

  const result = await applyStripeInvoiceEvent(
    admin,
    inv,
    event,
    Array.isArray(inv.payments) ? inv.payments : [],
    history,
    inv.status || "Sent",
    event.type.replaceAll(".", "_"),
    {
      dispute_id: dispute.id || null,
      payment_intent: paymentIntentId,
      charge: dispute.charge || null,
      amount: amount > 0 ? amount : null,
      currency,
      reason: dispute.reason || null,
      status: dispute.status || null,
      invoice_number: inv.number || null,
    },
    nowISO,
  );
  const settled = mutationResult(result);
  if (settled) return settled;
  if (result === "stale" && attempt < 4) {
    return await handleDispute(admin, event, attempt + 1);
  }
  throw new Error("invoice changed repeatedly while recording Stripe dispute");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return json({ error: "Stripe webhook is not configured" }, 500);
  }

  const rawBody = await req.text();
  const verified = await verifyStripeSignature(
    req.headers.get("stripe-signature"),
    rawBody,
    webhookSecret,
  );
  if (!verified) return json({ error: "Invalid webhook signature" }, 401);

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const eventId = String(event.id || "");
  if (!eventId) return json({ error: "Missing Stripe event ID" }, 400);

  const expectedLivemode = Deno.env.get("STRIPE_LIVE_MODE") === "true";
  if (Boolean(event.livemode) !== expectedLivemode) {
    return json({
      error: "Stripe event mode does not match this Tallyo environment",
    }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (await auditEventExists(admin, eventId)) {
    return json({ ok: true, duplicate: true });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      return json(await handleCheckoutCompleted(admin, event));
    }
    if (event.type === "checkout.session.async_payment_failed") {
      return json(await handleCheckoutPaymentFailed(admin, event));
    }
    if (
      event.type === "refund.created" || event.type === "refund.updated" ||
      event.type === "refund.failed"
    ) {
      return json(await handleRefund(admin, event));
    }
    if (
      event.type === "charge.dispute.created" ||
      event.type === "charge.dispute.funds_withdrawn" ||
      event.type === "charge.dispute.funds_reinstated" ||
      event.type === "charge.dispute.closed" ||
      event.type === "charge.dispute.updated"
    ) {
      return json(await handleDispute(admin, event));
    }
    return json({ ok: true, ignored: event.type || "unknown event" });
  } catch (e) {
    console.error("stripe webhook failed", e);
    return json({
      error: e instanceof Error ? e.message : "Webhook processing failed",
    }, 500);
  }
});
