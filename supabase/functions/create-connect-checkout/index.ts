// Disabled-by-default direct-charge Checkout for an authenticated Tallyo
// business with an active, tenant-bound Stripe connected account.

import {
  connectConfig,
  connectCorsHeaders,
  isUuid,
  json,
  loadConnectMapping,
  refreshActiveAccount,
  requireActiveMapping,
  requireSensitiveSession,
  safeStripeCheckoutUrl,
  sha256,
  stripeV1,
  supabaseClients,
  validEmail,
} from "../_shared/stripe-connect.ts";
import { resolveInvoicePaymentSelection } from "../_shared/invoice-payment-options.mjs";
import {
  accountAllowsWrite,
  readOnlyAccountMessage,
} from "../_shared/account-entitlements.ts";

async function existingCheckoutUrl(
  admin: any,
  invoiceId: string,
  requestId: string,
  stripeAccountId: string,
  config: ReturnType<typeof connectConfig>,
  amountMinor: number,
  currency: string,
  paymentKind: "full_balance" | "deposit",
) {
  let query = admin.from("stripe_connect_checkout_claims")
    .select("stripe_checkout_session_id")
    .eq("invoice_id", invoiceId)
    .eq("claim_status", "created");
  if (requestId) query = query.eq("request_id", requestId);
  const { data, error } = await query.order("created_at", {
    ascending: false,
  }).limit(1).maybeSingle();
  if (error) throw new Error("Existing Checkout could not be verified");
  const sessionId = String(data?.stripe_checkout_session_id || "");
  if (!sessionId) return null;
  const session = await stripeV1(
    `checkout/sessions/${encodeURIComponent(sessionId)}`,
    config,
    stripeAccountId,
  );
  if (
    String(session?.id || "") !== sessionId ||
    session?.status !== "open" ||
    Number(session?.amount_total) !== amountMinor ||
    String(session?.currency || "").toUpperCase() !== currency ||
    String(session?.metadata?.payment_kind || "") !== paymentKind ||
    Number(session?.expires_at || 0) <= Math.floor(Date.now() / 1000)
  ) {
    return null;
  }
  return {
    url: safeStripeCheckoutUrl(session?.url),
    sessionId,
  };
}

async function completedClaimMatchesSession(
  admin: any,
  userId: string,
  requestId: string,
  sessionId: string,
  sessionExpiresAt: string,
) {
  const { data, error } = await admin.from("stripe_connect_checkout_claims")
    .select("claim_status,stripe_checkout_session_id,session_expires_at")
    .eq("user_id", userId)
    .eq("request_id", requestId)
    .maybeSingle();
  if (error || data?.claim_status !== "created") return false;

  const expectedExpiry = new Date(sessionExpiresAt).getTime();
  const storedExpiry = new Date(data.session_expires_at || "").getTime();
  return data.stripe_checkout_session_id === sessionId &&
    Number.isFinite(expectedExpiry) &&
    storedExpiry === expectedExpiry &&
    storedExpiry > Date.now();
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
  const suppliedPaymentKind = body.paymentKind;
  const paymentKind = suppliedPaymentKind === undefined
    ? "full_balance"
    : String(suppliedPaymentKind);
  if (!isUuid(documentId) || !isUuid(requestId)) {
    return json({ error: "Invalid payment request" }, 400, true);
  }
  if (!["full_balance", "deposit"].includes(paymentKind)) {
    return json(
      { error: "Choose either the full balance or the saved deposit" },
      400,
      true,
    );
  }

  try {
    const config = connectConfig("STRIPE_CONNECT_CHECKOUT_ENABLED", true);
    const { userClient, admin } = supabaseClients(authHeader);
    const user = await requireSensitiveSession(userClient);
    if (!await accountAllowsWrite(admin, user.id)) {
      return json({ error: readOnlyAccountMessage }, 403, true);
    }
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
    let selection: {
      kind: "full_balance" | "deposit";
      amount: number;
      outstanding: number;
      remainingBalance: number;
    };
    try {
      selection = resolveInvoicePaymentSelection(invoice, paymentKind);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "This invoice cannot be paid online";
      return json({ error: message }, 400, true);
    }

    const amountMinor = Math.round(selection.amount * 100);
    if (!Number.isFinite(amountMinor) || amountMinor < 1) {
      return json(
        { error: "Invoice balance is too small to pay online" },
        400,
        true,
      );
    }
    const currency = String(invoice.currency || "GBP").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      return json({ error: "Invoice currency is invalid" }, 400, true);
    }

    const { data: claimResult, error: claimError } = await admin.rpc(
      "claim_stripe_connect_checkout",
      {
        p_user_id: user.id,
        p_stripe_account_id: mapping.stripe_account_id,
        p_invoice_id: documentId,
        p_request_id: requestId,
        p_amount_minor: amountMinor,
        p_currency: currency,
        p_livemode: config.liveMode,
      },
    );
    if (claimError) throw new Error("Payment attempt could not be reserved");
    if (claimResult === "account_unavailable") {
      return json(
        { error: "Finish Stripe setup before accepting card payments" },
        409,
        true,
      );
    }
    if (claimResult === "invoice_mismatch") {
      return json({ error: "Invoice not found" }, 404, true);
    }
    if (claimResult === "request_mismatch") {
      return json(
        { error: "Payment request could not be verified" },
        409,
        true,
      );
    }
    if (claimResult === "request_created") {
      const existing = await existingCheckoutUrl(
        admin,
        documentId,
        requestId,
        mapping.stripe_account_id,
        config,
        amountMinor,
        currency,
        selection.kind,
      );
      if (existing) return json({ ok: true, ...existing }, 200, true);
    }
    if (claimResult === "checkout_pending") {
      const existing = await existingCheckoutUrl(
        admin,
        documentId,
        "",
        mapping.stripe_account_id,
        config,
        amountMinor,
        currency,
        selection.kind,
      );
      if (existing) return json({ ok: true, ...existing }, 200, true);
      return json(
        {
          error:
            "A card payment page is already being prepared. Try again shortly.",
        },
        409,
        true,
      );
    }
    if (!["claimed", "request_reused"].includes(String(claimResult))) {
      throw new Error("Payment attempt returned an invalid state");
    }

    const customer = invoice.customer_snapshot || {};
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("customer_creation", "always");
    params.set(
      "success_url",
      `${config.appBaseUrl}?payment=success&invoice=${
        encodeURIComponent(documentId)
      }`,
    );
    params.set(
      "cancel_url",
      `${config.appBaseUrl}?payment=cancelled&invoice=${
        encodeURIComponent(documentId)
      }`,
    );
    params.set("client_reference_id", documentId);
    params.set("line_items[0][price_data][currency]", currency.toLowerCase());
    params.set(
      "line_items[0][price_data][unit_amount]",
      String(amountMinor),
    );
    params.set(
      "line_items[0][price_data][product_data][name]",
      `Invoice #${invoice.number || documentId}`,
    );
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[invoice_id]", documentId);
    params.set("metadata[user_id]", user.id);
    params.set("metadata[payment_channel]", "stripe_connect");
    params.set("metadata[payment_kind]", selection.kind);
    params.set("payment_intent_data[metadata][invoice_id]", documentId);
    params.set("payment_intent_data[metadata][user_id]", user.id);
    params.set(
      "payment_intent_data[metadata][payment_channel]",
      "stripe_connect",
    );
    params.set(
      "payment_intent_data[metadata][payment_kind]",
      selection.kind,
    );
    params.set(
      "expires_at",
      String(Math.floor(Date.now() / 1000) + 30 * 60),
    );
    if (validEmail(customer.email)) {
      params.set("customer_email", customer.email.trim());
    }

    const session = await stripeV1(
      "checkout/sessions",
      config,
      mapping.stripe_account_id,
      {
        method: "POST",
        params,
        idempotencyKey: `tallyo-connect-checkout-${await sha256([
          user.id,
          mapping.stripe_account_id,
          documentId,
          requestId,
          currency,
          String(amountMinor),
          selection.kind,
          String(invoice.stripe_event_version || 0),
        ])}`,
      },
    );
    const expectedSession = config.liveMode ? /^cs_live_/ : /^cs_test_/;
    if (
      !expectedSession.test(String(session?.id || "")) ||
      !Number.isFinite(Number(session?.expires_at)) ||
      Number(session.expires_at) <= Math.floor(Date.now() / 1000)
    ) {
      throw new Error("Stripe Checkout returned an incomplete session");
    }
    const checkoutUrl = safeStripeCheckoutUrl(session?.url);
    const sessionExpiresAt = new Date(
      Number(session.expires_at) * 1000,
    ).toISOString();
    const { data: completed, error: completionError } = await admin.rpc(
      "complete_stripe_connect_checkout_claim",
      {
        p_user_id: user.id,
        p_request_id: requestId,
        p_stripe_checkout_session_id: session.id,
        p_session_expires_at: sessionExpiresAt,
      },
    );
    const completionConfirmed = !completionError && completed === true
      ? true
      : await completedClaimMatchesSession(
        admin,
        user.id,
        requestId,
        session.id,
        sessionExpiresAt,
      );
    if (!completionConfirmed) {
      throw new Error("Payment attempt could not be completed safely");
    }

    return json(
      { ok: true, url: checkoutUrl, sessionId: session.id },
      200,
      true,
    );
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Card payment could not be started";
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
