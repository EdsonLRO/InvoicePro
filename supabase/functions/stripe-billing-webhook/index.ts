// Signed, test-mode-only Stripe Billing lifecycle reconciliation.
// This endpoint is separate from Tallyo's customer invoice-payment webhook.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const allowedEvents = new Set([
  "checkout.session.completed",
  "checkout.session.expired",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
]);

const supportedStatuses = new Set([
  "incomplete",
  "incomplete_expired",
  "active",
  "past_due",
  "unpaid",
  "canceled",
  "paused",
]);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(signature)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  const aa = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (aa.length !== bb.length) return false;
  let difference = 0;
  for (let index = 0; index < aa.length; index++) {
    difference |= aa[index] ^ bb[index];
  }
  return difference === 0;
}

async function verifyStripeSignature(
  header: string | null,
  rawBody: string,
  secret: string,
): Promise<boolean> {
  if (!header) return false;
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  const timestampNumber = Number(timestamp);
  if (
    !Number.isFinite(timestampNumber) ||
    Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > 300
  ) {
    return false;
  }
  const expected = await hmacSha256Hex(
    secret,
    `${timestamp}.${rawBody}`,
  );
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

function testConfig() {
  if (Deno.env.get("STRIPE_BILLING_TEST_MODE") !== "true") {
    throw new Error("Billing webhook requires explicit test mode");
  }
  const key = Deno.env.get("STRIPE_BILLING_SECRET_KEY") || "";
  const webhookSecret = Deno.env.get("STRIPE_BILLING_WEBHOOK_SECRET") || "";
  const apiVersion = Deno.env.get("STRIPE_BILLING_API_VERSION")?.trim() || "";
  const monthlyPrice = Deno.env.get("STRIPE_BILLING_MONTHLY_PRICE_ID") || "";
  const annualPrice = Deno.env.get("STRIPE_BILLING_ANNUAL_PRICE_ID") || "";
  if (!/^(?:sk|rk)_test_/.test(key)) {
    throw new Error("Billing requires a Stripe test-mode key");
  }
  if (!webhookSecret.startsWith("whsec_")) {
    throw new Error("Billing webhook secret is not configured");
  }
  if (!/^\d{4}-\d{2}-\d{2}(?:\.[a-z]+)?$/.test(apiVersion)) {
    throw new Error("STRIPE_BILLING_API_VERSION is required");
  }
  if (
    !/^price_[A-Za-z0-9]+$/.test(monthlyPrice) ||
    !/^price_[A-Za-z0-9]+$/.test(annualPrice) ||
    monthlyPrice === annualPrice
  ) {
    throw new Error("Billing price allowlist is not configured");
  }
  return { key, webhookSecret, apiVersion, monthlyPrice, annualPrice };
}

function subscriptionIdFromEvent(event: any): string {
  const object = event.data?.object || {};
  if (event.type.startsWith("customer.subscription.")) {
    return String(object.id || "");
  }
  if (event.type.startsWith("checkout.session.")) {
    return String(object.subscription || "");
  }
  return String(
    object.subscription ||
      object.parent?.subscription_details?.subscription ||
      "",
  );
}

function checkoutSessionIdFromEvent(event: any): string {
  if (!event.type.startsWith("checkout.session.")) return "";
  return String(event.data?.object?.id || "");
}

async function clearCheckoutClaim(admin: any, event: any): Promise<void> {
  const sessionId = checkoutSessionIdFromEvent(event);
  if (!/^cs_test_[A-Za-z0-9]+$/.test(sessionId)) {
    throw new Error("Stripe Checkout Session identity is invalid");
  }
  const { error } = await admin.rpc(
    "clear_stripe_billing_checkout_claim",
    { p_stripe_checkout_session_id: sessionId },
  );
  if (error) throw new Error("Billing Checkout claim cleanup failed");
}

async function retrieveSubscription(
  subscriptionId: string,
  config: ReturnType<typeof testConfig>,
) {
  const response = await fetch(
    `https://api.stripe.com/v1/subscriptions/${
      encodeURIComponent(subscriptionId)
    }`,
    {
      headers: {
        Authorization: `Bearer ${config.key}`,
        "Stripe-Version": config.apiVersion,
      },
    },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      body?.error?.message || "Stripe subscription lookup failed",
    );
  }
  return body;
}

function subscriptionPeriodEnd(subscription: any): string | null {
  const itemPeriodEnd = subscription?.items?.data?.[0]?.current_period_end;
  const seconds = Number(subscription?.current_period_end || itemPeriodEnd);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

function subscriptionCancelsAtPeriodEnd(subscription: any): boolean {
  if (subscription?.cancel_at_period_end === true) return true;
  const itemPeriodEnd = subscription?.items?.data?.[0]?.current_period_end;
  const periodEnd = Number(subscription?.current_period_end || itemPeriodEnd);
  const cancelAt = Number(subscription?.cancel_at);
  return Number.isFinite(periodEnd) &&
    periodEnd > 0 &&
    Number.isFinite(cancelAt) &&
    cancelAt === periodEnd;
}

function subscriptionPrice(subscription: any): string {
  const items = Array.isArray(subscription?.items?.data)
    ? subscription.items.data
    : [];
  if (items.length !== 1 || Number(items[0]?.quantity || 1) !== 1) return "";
  return String(items[0]?.price?.id || "");
}

async function reconcile(
  admin: any,
  event: any,
  config: ReturnType<typeof testConfig>,
) {
  if (event.type === "checkout.session.expired") {
    await clearCheckoutClaim(admin, event);
    return { ok: true, ignored: "expired Checkout claim cleared" };
  }

  const subscriptionId = subscriptionIdFromEvent(event);
  if (!/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) {
    if (event.type === "checkout.session.completed") {
      throw new Error("Completed Checkout is missing its subscription");
    }
    return { ok: true, ignored: "missing subscription" };
  }

  let subscription: any;
  try {
    subscription = await retrieveSubscription(subscriptionId, config);
  } catch (error) {
    if (event.type !== "customer.subscription.deleted") throw error;
    subscription = event.data?.object || {};
  }
  if (String(subscription?.id || "") !== subscriptionId) {
    throw new Error("Stripe subscription identity mismatch");
  }

  const customerId = String(subscription?.customer || "");
  if (!/^cus_[A-Za-z0-9]+$/.test(customerId)) {
    throw new Error("Stripe subscription customer is invalid");
  }
  const { data: mapping, error: mappingError } = await admin
    .from("billing_customers")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (mappingError) throw new Error("Billing customer lookup failed");
  if (!mapping?.user_id) {
    return { ok: true, ignored: "customer is not mapped to Tallyo" };
  }

  const priceId = subscriptionPrice(subscription);
  const billingInterval = priceId === config.monthlyPrice
    ? "monthly"
    : priceId === config.annualPrice
    ? "annual"
    : "";
  if (!billingInterval) {
    return { ok: true, ignored: "subscription price is not allowlisted" };
  }

  const status = String(subscription?.status || "");
  if (!supportedStatuses.has(status)) {
    return { ok: true, ignored: "subscription status is not supported" };
  }
  const eventCreatedSeconds = Number(event.created);
  if (!Number.isFinite(eventCreatedSeconds) || eventCreatedSeconds <= 0) {
    throw new Error("Stripe event timestamp is invalid");
  }
  const eventCreatedAt = new Date(eventCreatedSeconds * 1000).toISOString();
  const { data: result, error: applyError } = await admin.rpc(
    "apply_stripe_billing_event",
    {
      p_user_id: mapping.user_id,
      p_stripe_customer_id: customerId,
      p_stripe_subscription_id: subscriptionId,
      p_stripe_price_id: priceId,
      p_billing_interval: billingInterval,
      p_provider_status: status,
      p_current_period_end: subscriptionPeriodEnd(subscription),
      p_cancel_at_period_end: subscriptionCancelsAtPeriodEnd(subscription),
      p_event_id: event.id,
      p_event_type: event.type,
      p_stripe_object_id: String(event.data?.object?.id || ""),
      p_event_created_at: eventCreatedAt,
    },
  );
  if (applyError) throw new Error("Atomic Billing reconciliation failed");
  if (result === "customer_mismatch") {
    throw new Error("Billing ownership changed during reconciliation");
  }
  if (!["applied", "duplicate", "stale"].includes(String(result))) {
    throw new Error("Billing reconciliation returned an invalid result");
  }
  if (event.type === "checkout.session.completed") {
    await clearCheckoutClaim(admin, event);
  }
  return {
    ok: true,
    ...(result === "duplicate" ? { duplicate: true } : {}),
    ...(result === "stale" ? { stale: true } : {}),
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let config: ReturnType<typeof testConfig>;
  try {
    config = testConfig();
  } catch (error) {
    return json({
      error: error instanceof Error
        ? error.message
        : "Billing is not configured",
    }, 503);
  }

  const rawBody = await req.text();
  if (
    !await verifyStripeSignature(
      req.headers.get("stripe-signature"),
      rawBody,
      config.webhookSecret,
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
  if (
    !/^evt_[A-Za-z0-9]+$/.test(String(event?.id || "")) ||
    event?.livemode !== false
  ) {
    return json(
      { error: "Only valid Stripe test-mode events are accepted" },
      400,
    );
  }
  if (!allowedEvents.has(String(event.type || ""))) {
    return json({ ok: true, ignored: "event type is not used" });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  try {
    return json(await reconcile(admin, event, config));
  } catch (error) {
    console.error(
      "stripe billing webhook failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return json({ error: "Billing webhook processing failed" }, 500);
  }
});
