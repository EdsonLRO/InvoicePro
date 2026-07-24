// Disabled-by-default signed webhook for direct charges that belong to
// tenant-bound Stripe connected accounts. This endpoint is separate from
// Tallyo Billing and the existing Owner-account invoice-payment webhook.

import {
  amountPaid,
  connectConfig,
  formatMoney,
  isUuid,
  json,
  statusAfterPaymentChange,
  stripeV1,
  supabaseClients,
  verifyStripeSignature,
} from "../_shared/stripe-connect.ts";

type InvoicePayment = {
  amount?: unknown;
  date?: unknown;
  note?: unknown;
  provider?: unknown;
  providerChannel?: unknown;
  providerEventId?: unknown;
  providerSessionId?: unknown;
  providerPaymentIntentId?: unknown;
  providerRefundId?: unknown;
  lifecycleEvent?: unknown;
  currency?: unknown;
};

const allowedEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "refund.created",
  "refund.updated",
  "refund.failed",
  "charge.dispute.created",
  "charge.dispute.updated",
  "charge.dispute.closed",
  "charge.dispute.funds_withdrawn",
  "charge.dispute.funds_reinstated",
]);

function providerCreatedAt(event: any): string {
  const seconds = Number(event?.created);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error("Stripe event timestamp is invalid");
  }
  return new Date(seconds * 1000).toISOString();
}

function historyHasMarker(history: unknown, marker: string) {
  return Array.isArray(history) &&
    history.some((entry) => entry?.providerMarker === marker);
}

async function loadInvoice(admin: any, invoiceId: string, userId: string) {
  const { data, error } = await admin.from("invoices").select("*")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Invoice lookup failed");
  return data;
}

async function connectEventExists(admin: any, eventId: string) {
  const { data, error } = await admin.from("stripe_connect_events")
    .select("stripe_event_id")
    .eq("stripe_event_id", eventId)
    .maybeSingle();
  if (error) throw new Error("Connect event lookup failed");
  return Boolean(data);
}

async function loadCheckoutClaim(
  admin: any,
  session: any,
  userId: string,
  accountId: string,
  liveMode: boolean,
) {
  const sessionId = String(session?.id || "");
  const invoiceId = String(
    session?.metadata?.invoice_id || session?.client_reference_id || "",
  );
  const metadataUserId = String(session?.metadata?.user_id || "");
  const amountMinor = Number(session?.amount_total);
  const currency = String(session?.currency || "").toUpperCase();
  if (
    !/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId) ||
    !isUuid(invoiceId) ||
    metadataUserId !== userId ||
    session?.metadata?.payment_channel !== "stripe_connect" ||
    !Number.isInteger(amountMinor) || amountMinor < 1 ||
    !/^[A-Z]{3}$/.test(currency)
  ) {
    throw new Error("Stripe Checkout metadata is invalid");
  }
  const { data, error } = await admin.from("stripe_connect_checkout_claims")
    .select(
      "request_id, invoice_id, user_id, stripe_account_id, amount_minor, currency, livemode, claim_status",
    )
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (error) throw new Error("Stripe Checkout claim lookup failed");
  if (
    !data ||
    data.invoice_id !== invoiceId ||
    data.user_id !== userId ||
    data.stripe_account_id !== accountId ||
    Number(data.amount_minor) !== amountMinor ||
    data.currency !== currency ||
    data.livemode !== liveMode ||
    (
      session?.status === "expired"
        ? !["created", "failed"].includes(String(data.claim_status))
        : data.claim_status !== "created"
    )
  ) {
    throw new Error("Stripe Checkout claim does not match this account");
  }
  return {
    sessionId,
    invoiceId,
    amountMinor,
    currency,
    requestId: String(data.request_id),
  };
}

async function applyConnectInvoiceEvent(
  admin: any,
  invoice: any,
  event: any,
  accountId: string,
  liveMode: boolean,
  payments: InvoicePayment[],
  history: any[],
  status: string,
  eventType: string,
  metadata: Record<string, unknown>,
  checkout: {
    sessionId?: string;
    amountMinor?: number;
    currency?: string;
  } = {},
) {
  const processedAt = new Date().toISOString();
  const { data, error } = await admin.rpc(
    "apply_stripe_connect_invoice_event",
    {
      p_invoice_id: invoice.id,
      p_user_id: invoice.user_id,
      p_stripe_account_id: accountId,
      p_expected_version: Number(invoice.stripe_event_version) || 0,
      p_payments: payments,
      p_history: history,
      p_status: status,
      p_event_type: eventType,
      p_provider_event_id: event.id,
      p_metadata: metadata,
      p_processed_at: processedAt,
      p_provider_created_at: providerCreatedAt(event),
      p_livemode: liveMode,
      p_checkout_session_id: checkout.sessionId || null,
      p_amount_minor: checkout.amountMinor || null,
      p_currency: checkout.currency || null,
    },
  );
  if (error) throw new Error("Atomic Connect reconciliation failed");
  return String(data || "");
}

function appliedResult(result: string) {
  if (result === "applied") return { ok: true };
  if (result === "duplicate") return { ok: true, duplicate: true };
  if (result === "missing") return { ok: true, ignored: "invoice not found" };
  return null;
}

async function handleCheckout(
  admin: any,
  event: any,
  userId: string,
  accountId: string,
  liveMode: boolean,
  attempt = 0,
): Promise<Record<string, unknown>> {
  const session = event.data?.object || {};
  const claim = await loadCheckoutClaim(
    admin,
    session,
    userId,
    accountId,
    liveMode,
  );

  if (event.type === "checkout.session.expired") {
    const { data, error } = await admin.rpc(
      "record_stripe_connect_checkout_terminal_event",
      {
        p_stripe_checkout_session_id: claim.sessionId,
        p_user_id: userId,
        p_stripe_account_id: accountId,
        p_provider_event_id: event.id,
        p_event_type: "stripe_connect_checkout_expired",
        p_livemode: liveMode,
        p_provider_created_at: providerCreatedAt(event),
        p_processed_at: new Date().toISOString(),
      },
    );
    if (error) throw new Error("Expired Checkout could not be reconciled");
    return String(data) === "duplicate"
      ? { ok: true, duplicate: true }
      : String(data) === "missing"
      ? { ok: true, ignored: "Checkout was already closed" }
      : { ok: true, expired: true };
  }

  const isFailure = event.type === "checkout.session.async_payment_failed";
  if (!isFailure && session.payment_status !== "paid") {
    return { ok: true, ignored: "Checkout is not paid" };
  }
  const invoice = await loadInvoice(admin, claim.invoiceId, userId);
  if (!invoice) return { ok: true, ignored: "invoice not found" };
  if (
    claim.currency !== String(invoice.currency || "GBP").toUpperCase()
  ) {
    throw new Error("Stripe Checkout currency does not match the invoice");
  }

  const payments: InvoicePayment[] = Array.isArray(invoice.payments)
    ? invoice.payments
    : [];
  const history = Array.isArray(invoice.history) ? invoice.history : [];
  if (
    historyHasMarker(history, `stripe-connect:${event.id}`) ||
    payments.some((payment) =>
      payment.provider === "stripe" &&
      payment.providerChannel === "connect" &&
      (
        payment.providerEventId === event.id ||
        payment.providerSessionId === claim.sessionId ||
        (
          session.payment_intent &&
          payment.providerPaymentIntentId === session.payment_intent
        )
      )
    )
  ) {
    return { ok: true, duplicate: true };
  }

  const amount = claim.amountMinor / 100;
  if (isFailure) {
    history.push({
      ts: new Date().toISOString(),
      type: "payment_failed",
      text: `Stripe card payment failed for ${
        formatMoney(claim.currency, amount)
      }`,
      providerMarker: `stripe-connect:${event.id}`,
    });
    const result = await applyConnectInvoiceEvent(
      admin,
      invoice,
      event,
      accountId,
      liveMode,
      payments,
      history,
      invoice.status || "Sent",
      "stripe_connect_payment_failed",
      {
        session_id: claim.sessionId,
        payment_intent: session.payment_intent || null,
        amount,
        currency: claim.currency,
        request_id: claim.requestId,
        payment_channel: "connect",
      },
      {
        sessionId: claim.sessionId,
        amountMinor: claim.amountMinor,
        currency: claim.currency,
      },
    );
    const settled = appliedResult(result);
    if (settled) return settled;
    if (result === "stale" && attempt < 4) {
      return await handleCheckout(
        admin,
        event,
        userId,
        accountId,
        liveMode,
        attempt + 1,
      );
    }
    throw new Error("Invoice changed repeatedly during payment reconciliation");
  }

  const now = new Date().toISOString();
  payments.push({
    amount,
    date: now.split("T")[0],
    note: "Stripe card payment confirmed",
    provider: "stripe",
    providerChannel: "connect",
    providerEventId: event.id,
    providerSessionId: claim.sessionId,
    providerPaymentIntentId: session.payment_intent || null,
    currency: claim.currency,
  });
  const nextStatus = statusAfterPaymentChange(invoice, amountPaid(payments));
  history.push({
    ts: now,
    type: "payment",
    text: `Stripe card payment of ${
      formatMoney(claim.currency, amount)
    } confirmed`,
    providerMarker: `stripe-connect:${event.id}`,
  });
  if (nextStatus === "Paid" && invoice.status !== "Paid") {
    history.push({
      ts: now,
      type: "paid",
      text: "Invoice fully paid by Stripe card payment",
      providerMarker: `stripe-connect-paid:${event.id}`,
    });
  }

  const result = await applyConnectInvoiceEvent(
    admin,
    invoice,
    event,
    accountId,
    liveMode,
    payments,
    history,
    nextStatus,
    "stripe_connect_payment_completed",
    {
      session_id: claim.sessionId,
      payment_intent: session.payment_intent || null,
      amount,
      currency: claim.currency,
      request_id: claim.requestId,
      payment_channel: "connect",
      invoice_number: invoice.number || null,
    },
    {
      sessionId: claim.sessionId,
      amountMinor: claim.amountMinor,
      currency: claim.currency,
    },
  );
  const settled = appliedResult(result);
  if (settled) return settled;
  if (result === "stale" && attempt < 4) {
    return await handleCheckout(
      admin,
      event,
      userId,
      accountId,
      liveMode,
      attempt + 1,
    );
  }
  throw new Error("Invoice changed repeatedly during payment reconciliation");
}

async function paymentAuditByIntent(
  admin: any,
  userId: string,
  paymentIntentId: string,
) {
  const { data, error } = await admin.from("audit_events")
    .select("user_id, object_id, metadata")
    .eq("provider", "stripe_connect")
    .eq("event_type", "stripe_connect_payment_completed")
    .eq("user_id", userId)
    .filter("metadata->>payment_intent", "eq", paymentIntentId)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Connect payment lookup failed");
  return data;
}

async function handleRefund(
  admin: any,
  event: any,
  config: ReturnType<typeof connectConfig>,
  userId: string,
  accountId: string,
  attempt = 0,
): Promise<Record<string, unknown>> {
  const deliveredRefund = event.data?.object || {};
  const refundId = String(deliveredRefund?.id || "");
  const deliveredIntentId = String(deliveredRefund?.payment_intent || "");
  if (
    !/^re_[A-Za-z0-9]+$/.test(refundId) ||
    !/^pi_[A-Za-z0-9]+$/.test(deliveredIntentId)
  ) {
    throw new Error("Stripe refund identity is invalid");
  }

  const refund = await stripeV1(
    `refunds/${encodeURIComponent(refundId)}`,
    config,
    accountId,
  );
  const paymentIntentId = String(refund?.payment_intent || "");
  if (
    String(refund?.id || "") !== refundId ||
    paymentIntentId !== deliveredIntentId
  ) {
    throw new Error("Stripe refund identity changed during reconciliation");
  }
  const paymentAudit = await paymentAuditByIntent(
    admin,
    userId,
    paymentIntentId,
  );
  if (!paymentAudit?.object_id || !isUuid(String(paymentAudit.object_id))) {
    return { ok: true, ignored: "payment is not known to Tallyo" };
  }
  const invoice = await loadInvoice(
    admin,
    String(paymentAudit.object_id),
    userId,
  );
  if (!invoice) return { ok: true, ignored: "invoice not found" };

  const currency = String(refund?.currency || "").toUpperCase();
  if (
    !/^[A-Z]{3}$/.test(currency) ||
    currency !== String(invoice.currency || "GBP").toUpperCase()
  ) {
    throw new Error("Stripe refund currency does not match the invoice");
  }
  const amountMinor = Number(refund?.amount);
  if (!Number.isInteger(amountMinor) || amountMinor < 1) {
    throw new Error("Stripe refund amount is invalid");
  }
  const refundAmount = amountMinor / 100;
  const payments: InvoicePayment[] = Array.isArray(invoice.payments)
    ? invoice.payments
    : [];
  const originalPayment = payments.find((payment) =>
    payment.provider === "stripe" &&
    payment.providerChannel === "connect" &&
    payment.providerPaymentIntentId === paymentIntentId &&
    Number(payment.amount) > 0
  );
  if (!originalPayment) {
    throw new Error("Stripe refund does not match a connected payment");
  }
  const history = Array.isArray(invoice.history) ? invoice.history : [];
  if (historyHasMarker(history, `stripe-connect-refund:${event.id}`)) {
    return { ok: true, duplicate: true };
  }

  const status = String(refund?.status || "").toLowerCase();
  const succeeded = status === "succeeded";
  const unsuccessful = status === "failed" || status === "canceled";
  const recordedRefund = payments.find((payment) =>
    payment.provider === "stripe" &&
    payment.providerChannel === "connect" &&
    payment.providerRefundId === refundId &&
    payment.lifecycleEvent === "refund" &&
    Number(payment.amount) < 0
  );
  const reversed = payments.some((payment) =>
    payment.provider === "stripe" &&
    payment.providerChannel === "connect" &&
    payment.providerRefundId === refundId &&
    payment.lifecycleEvent === "refund_failed_reversal" &&
    Number(payment.amount) > 0
  );
  const now = new Date().toISOString();
  if (succeeded && !recordedRefund) {
    payments.push({
      amount: -refundAmount,
      date: now.split("T")[0],
      note: "Stripe refund confirmed",
      provider: "stripe",
      providerChannel: "connect",
      providerEventId: event.id,
      providerRefundId: refundId,
      providerPaymentIntentId: paymentIntentId,
      lifecycleEvent: "refund",
      currency,
    });
    history.push({
      ts: now,
      type: "refund",
      text: `Stripe refund of ${
        formatMoney(currency, refundAmount)
      } confirmed`,
      providerMarker: `stripe-connect-refund:${event.id}`,
    });
  } else if (unsuccessful && recordedRefund && !reversed) {
    payments.push({
      amount: Math.abs(Number(recordedRefund.amount) || refundAmount),
      date: now.split("T")[0],
      note: `Stripe refund ${status} reversal`,
      provider: "stripe",
      providerChannel: "connect",
      providerEventId: event.id,
      providerRefundId: refundId,
      providerPaymentIntentId: paymentIntentId,
      lifecycleEvent: "refund_failed_reversal",
      currency,
    });
    history.push({
      ts: now,
      type: "refund",
      text: `Stripe refund ${status}; invoice balance restored`,
      providerMarker: `stripe-connect-refund:${event.id}`,
    });
  } else {
    history.push({
      ts: now,
      type: "refund",
      text: `Stripe refund ${status || "updated"} for ${
        formatMoney(currency, refundAmount)
      }`,
      providerMarker: `stripe-connect-refund:${event.id}`,
    });
  }

  const eventType = succeeded
    ? "stripe_connect_refund_succeeded"
    : status === "failed"
    ? "stripe_connect_refund_failed"
    : "stripe_connect_refund_updated";
  const result = await applyConnectInvoiceEvent(
    admin,
    invoice,
    event,
    accountId,
    config.liveMode,
    payments,
    history,
    statusAfterPaymentChange(invoice, amountPaid(payments)),
    eventType,
    {
      refund_id: refundId,
      payment_intent: paymentIntentId,
      amount: refundAmount,
      currency,
      status,
      payment_channel: "connect",
      invoice_number: invoice.number || null,
    },
  );
  const settled = appliedResult(result);
  if (settled) return settled;
  if (result === "stale" && attempt < 4) {
    return await handleRefund(
      admin,
      event,
      config,
      userId,
      accountId,
      attempt + 1,
    );
  }
  throw new Error("Invoice changed repeatedly during refund reconciliation");
}

async function handleDispute(
  admin: any,
  event: any,
  userId: string,
  accountId: string,
  liveMode: boolean,
  attempt = 0,
): Promise<Record<string, unknown>> {
  const dispute = event.data?.object || {};
  const paymentIntentId = String(dispute?.payment_intent || "");
  if (!/^pi_[A-Za-z0-9]+$/.test(paymentIntentId)) {
    throw new Error("Stripe dispute payment identity is invalid");
  }
  const paymentAudit = await paymentAuditByIntent(
    admin,
    userId,
    paymentIntentId,
  );
  if (!paymentAudit?.object_id || !isUuid(String(paymentAudit.object_id))) {
    return { ok: true, ignored: "payment is not known to Tallyo" };
  }
  const invoice = await loadInvoice(
    admin,
    String(paymentAudit.object_id),
    userId,
  );
  if (!invoice) return { ok: true, ignored: "invoice not found" };
  const payments: InvoicePayment[] = Array.isArray(invoice.payments)
    ? invoice.payments
    : [];
  if (
    !payments.some((payment) =>
      payment.provider === "stripe" &&
      payment.providerChannel === "connect" &&
      payment.providerPaymentIntentId === paymentIntentId
    )
  ) {
    throw new Error("Stripe dispute does not match a connected payment");
  }
  const currency = String(dispute?.currency || "").toUpperCase();
  if (currency !== String(invoice.currency || "GBP").toUpperCase()) {
    throw new Error("Stripe dispute currency does not match the invoice");
  }
  const amountMinor = Number(dispute?.amount || 0);
  const amount = Number.isInteger(amountMinor) && amountMinor > 0
    ? amountMinor / 100
    : 0;
  const history = Array.isArray(invoice.history) ? invoice.history : [];
  if (historyHasMarker(history, `stripe-connect-dispute:${event.id}`)) {
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
    ts: new Date().toISOString(),
    type: "dispute",
    text: `${label}${
      amount > 0 ? ` for ${formatMoney(currency, amount)}` : ""
    }`,
    providerMarker: `stripe-connect-dispute:${event.id}`,
  });
  const eventType = event.type === "charge.dispute.created"
    ? "stripe_connect_dispute_created"
    : event.type === "charge.dispute.funds_withdrawn"
    ? "stripe_connect_dispute_funds_withdrawn"
    : event.type === "charge.dispute.funds_reinstated"
    ? "stripe_connect_dispute_funds_reinstated"
    : event.type === "charge.dispute.closed"
    ? "stripe_connect_dispute_closed"
    : "stripe_connect_dispute_updated";
  const result = await applyConnectInvoiceEvent(
    admin,
    invoice,
    event,
    accountId,
    liveMode,
    payments,
    history,
    invoice.status || "Sent",
    eventType,
    {
      dispute_id: dispute.id || null,
      payment_intent: paymentIntentId,
      amount: amount || null,
      currency,
      reason: dispute.reason || null,
      status: dispute.status || null,
      payment_channel: "connect",
      invoice_number: invoice.number || null,
    },
  );
  const settled = appliedResult(result);
  if (settled) return settled;
  if (result === "stale" && attempt < 4) {
    return await handleDispute(
      admin,
      event,
      userId,
      accountId,
      liveMode,
      attempt + 1,
    );
  }
  throw new Error("Invoice changed repeatedly during dispute reconciliation");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let config: ReturnType<typeof connectConfig>;
  try {
    config = connectConfig("STRIPE_CONNECT_WEBHOOK_ENABLED");
  } catch {
    return json({ error: "Stripe Connect webhook is disabled" }, 503);
  }
  const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET") || "";
  if (!webhookSecret.startsWith("whsec_")) {
    return json({ error: "Stripe Connect webhook is not configured" }, 503);
  }

  const rawBody = await req.text();
  if (
    !await verifyStripeSignature(
      req.headers.get("stripe-signature"),
      rawBody,
      webhookSecret,
    )
  ) {
    return json({ error: "Invalid webhook signature" }, 401);
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const eventId = String(event?.id || "");
  const accountId = String(event?.account || "");
  if (
    !/^evt_[A-Za-z0-9]+$/.test(eventId) ||
    !/^acct_[A-Za-z0-9]+$/.test(accountId) ||
    Boolean(event?.livemode) !== config.liveMode
  ) {
    return json({ error: "Stripe Connect event context is invalid" }, 400);
  }
  if (!allowedEvents.has(String(event.type || ""))) {
    return json({ ok: true, ignored: "event type is not used" });
  }

  const { admin } = supabaseClients("");
  const { data: mapping, error: mappingError } = await admin
    .from("stripe_connected_accounts")
    .select("user_id, livemode")
    .eq("stripe_account_id", accountId)
    .maybeSingle();
  if (
    mappingError || !mapping?.user_id ||
    mapping.livemode !== config.liveMode
  ) {
    return json({ error: "Stripe Connect account is not mapped" }, 400);
  }
  if (await connectEventExists(admin, eventId)) {
    return json({ ok: true, duplicate: true });
  }

  try {
    if (event.type.startsWith("checkout.session.")) {
      return json(await handleCheckout(
        admin,
        event,
        mapping.user_id,
        accountId,
        config.liveMode,
      ));
    }
    if (event.type.startsWith("refund.")) {
      return json(await handleRefund(
        admin,
        event,
        config,
        mapping.user_id,
        accountId,
      ));
    }
    return json(await handleDispute(
      admin,
      event,
      mapping.user_id,
      accountId,
      config.liveMode,
    ));
  } catch (error) {
    console.error(
      "Stripe Connect webhook processing failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return json({ error: "Stripe Connect webhook processing failed" }, 500);
  }
});
