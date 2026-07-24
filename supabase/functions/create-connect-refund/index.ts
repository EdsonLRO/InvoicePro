// Disabled-by-default refund request for a payment that belongs to the
// authenticated business's tenant-bound Stripe connected account.

import {
  connectConfig,
  connectCorsHeaders,
  isUuid,
  json,
  loadConnectMapping,
  refreshActiveAccount,
  requireActiveMapping,
  requireSensitiveSession,
  sha256,
  stripeV1,
  supabaseClients,
} from "../_shared/stripe-connect.ts";

type InvoicePayment = {
  amount?: unknown;
  provider?: unknown;
  providerChannel?: unknown;
  providerPaymentIntentId?: unknown;
  providerRefundId?: unknown;
  lifecycleEvent?: unknown;
};

function isRefund(payment: InvoicePayment): boolean {
  return payment.provider === "stripe" &&
    (payment.lifecycleEvent === "refund" || Number(payment.amount) < 0);
}

function tallyoRefundable(
  payments: InvoicePayment[],
  payment: InvoicePayment,
): number {
  const intentId = String(payment.providerPaymentIntentId || "");
  const paid = Number(payment.amount) || 0;
  if (!intentId || paid <= 0) return 0;
  const refunded = payments
    .filter((entry) =>
      isRefund(entry) &&
      String(entry.providerPaymentIntentId || "") === intentId
    )
    .reduce((sum, entry) => sum + Math.abs(Number(entry.amount) || 0), 0);
  return Math.max(0, Math.round((paid - refunded + Number.EPSILON) * 100) / 100);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: connectCorsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, true);
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "Missing authorization" }, 401, true);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400, true);
  }
  const documentId = String(body.documentId || "");
  const requestId = String(body.requestId || "");
  const paymentIndex = Number(body.paymentIndex);
  if (
    !isUuid(documentId) || !isUuid(requestId) ||
    !Number.isInteger(paymentIndex) || paymentIndex < 0
  ) {
    return json({ error: "Invalid refund request" }, 400, true);
  }

  try {
    const config = connectConfig("STRIPE_CONNECT_REFUNDS_ENABLED");
    const { userClient, admin } = supabaseClients(authHeader);
    const user = await requireSensitiveSession(userClient);
    const mapping = await loadConnectMapping(admin, user.id);
    requireActiveMapping(mapping, config);
    await refreshActiveAccount(admin, user.id, mapping, config);

    const { data: invoice, error: invoiceError } = await admin.from("invoices")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (invoiceError) throw new Error("Invoice could not be loaded");
    if (!invoice) return json({ error: "Invoice not found" }, 404, true);
    if (invoice.doc_type !== "invoice") {
      return json(
        { error: "Only invoice card payments can be refunded" },
        400,
        true,
      );
    }

    const payments: InvoicePayment[] = Array.isArray(invoice.payments)
      ? invoice.payments
      : [];
    const payment = payments[paymentIndex];
    if (
      !payment ||
      payment.provider !== "stripe" ||
      payment.providerChannel !== "connect" ||
      isRefund(payment)
    ) {
      return json(
        { error: "Select a connected Stripe payment to refund" },
        400,
        true,
      );
    }
    const paymentIntentId = String(payment.providerPaymentIntentId || "");
    if (!/^pi_[A-Za-z0-9]+$/.test(paymentIntentId)) {
      return json(
        { error: "This payment cannot be verified for a refund" },
        409,
        true,
      );
    }

    const paymentIntent = await stripeV1(
      `payment_intents/${encodeURIComponent(paymentIntentId)}`,
      config,
      mapping.stripe_account_id,
    );
    if (
      String(paymentIntent?.id || "") !== paymentIntentId ||
      String(paymentIntent?.metadata?.invoice_id || "") !== documentId ||
      String(paymentIntent?.metadata?.user_id || "") !== user.id ||
      paymentIntent?.metadata?.payment_channel !== "stripe_connect"
    ) {
      throw new Error("Stripe payment ownership could not be confirmed");
    }
    const chargeId = String(paymentIntent?.latest_charge || "");
    if (!/^ch_[A-Za-z0-9]+$/.test(chargeId)) {
      throw new Error("Stripe payment charge could not be confirmed");
    }
    const charge = await stripeV1(
      `charges/${encodeURIComponent(chargeId)}`,
      config,
      mapping.stripe_account_id,
    );
    if (
      String(charge?.id || "") !== chargeId ||
      String(charge?.payment_intent || "") !== paymentIntentId ||
      charge?.paid !== true
    ) {
      throw new Error("Stripe payment charge does not match the invoice");
    }

    const currency = String(invoice.currency || "GBP").toUpperCase();
    if (String(charge?.currency || "").toUpperCase() !== currency) {
      throw new Error("Stripe payment currency does not match the invoice");
    }
    const providerRefundableMinor = Math.max(
      0,
      Number(charge?.amount || 0) - Number(charge?.amount_refunded || 0),
    );
    const tallyoRefundableMinor = Math.round(
      tallyoRefundable(payments, payment) * 100,
    );
    const refundableMinor = Math.min(
      providerRefundableMinor,
      tallyoRefundableMinor,
    );
    if (!Number.isFinite(refundableMinor) || refundableMinor < 1) {
      return json(
        { error: "This payment has already been fully refunded" },
        409,
        true,
      );
    }

    const requestedAmount = body.amount === undefined ||
        body.amount === null || body.amount === ""
      ? refundableMinor
      : Math.round(Number(body.amount) * 100);
    if (!Number.isFinite(requestedAmount) || requestedAmount < 1) {
      return json({ error: "Enter a valid refund amount" }, 400, true);
    }
    if (requestedAmount > refundableMinor) {
      return json(
        { error: "Refund amount is greater than the refundable balance" },
        400,
        true,
      );
    }

    const params = new URLSearchParams();
    params.set("payment_intent", paymentIntentId);
    params.set("amount", String(requestedAmount));
    params.set("reason", "requested_by_customer");
    params.set("metadata[invoice_id]", documentId);
    params.set("metadata[user_id]", user.id);
    params.set("metadata[payment_channel]", "stripe_connect");
    params.set("metadata[source]", "tallyo_app");
    const refund = await stripeV1(
      "refunds",
      config,
      mapping.stripe_account_id,
      {
        method: "POST",
        params,
        idempotencyKey: `tallyo-connect-refund-${await sha256([
          user.id,
          mapping.stripe_account_id,
          documentId,
          paymentIntentId,
          requestId,
          String(requestedAmount),
        ])}`,
      },
    );
    if (
      !/^re_[A-Za-z0-9]+$/.test(String(refund?.id || "")) ||
      String(refund?.payment_intent || "") !== paymentIntentId ||
      Number(refund?.amount || 0) !== requestedAmount ||
      String(refund?.currency || "").toUpperCase() !== currency
    ) {
      throw new Error("Stripe refund returned an inconsistent result");
    }

    const { error: auditError } = await admin.from("audit_events").insert({
      user_id: user.id,
      actor_user_id: user.id,
      event_type: "stripe_connect_refund_requested",
      object_type: "invoice",
      object_id: documentId,
      source: "edge_function",
      provider: "stripe_connect",
      provider_event_id: refund.id,
      metadata: {
        payment_intent: paymentIntentId,
        amount: requestedAmount / 100,
        currency,
        status: String(refund?.status || ""),
        request_id: requestId,
      },
    });
    if (auditError && auditError.code !== "23505") {
      console.error("Stripe Connect refund request audit insert failed");
    }

    return json({
      ok: true,
      refundId: refund.id,
      status: String(refund?.status || ""),
      amount: requestedAmount / 100,
      currency,
    }, 200, true);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Refund could not be requested";
    const disabled = /disabled|release approval/.test(message);
    const unauthorized = [
      "Invalid session",
      "Confirm your email first",
      "Complete two-factor verification first",
      "Account security could not be confirmed",
    ].includes(message);
    return json(
      { error: message },
      disabled ? 503 : unauthorized ? 403 : 502,
      true,
    );
  }
});
