// Tallyo Pro subscription Checkout.
// Disabled unless Billing and exactly one reviewed provider mode are enabled.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function validEmail(value: unknown): value is string {
  return typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function sha256(parts: string[]): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(parts.join("\u001f")),
  );
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function billingConfig(interval: string) {
  if (Deno.env.get("STRIPE_BILLING_ENABLED") !== "true") {
    throw new Error("Billing Checkout is disabled");
  }
  const testMode = Deno.env.get("STRIPE_BILLING_TEST_MODE") === "true";
  const liveMode = Deno.env.get("STRIPE_BILLING_LIVE_MODE") === "true";
  if (testMode === liveMode) {
    throw new Error("Billing Checkout requires exactly one provider mode");
  }
  if (
    liveMode &&
    Deno.env.get("STRIPE_BILLING_LIVE_APPROVED") !== "true"
  ) {
    throw new Error("Live Billing Checkout is not approved");
  }

  const stripeKey = Deno.env.get("STRIPE_BILLING_SECRET_KEY") || "";
  const stripeApiVersion = Deno.env.get("STRIPE_BILLING_API_VERSION")?.trim() ||
    "";
  const priceId = interval === "monthly"
    ? Deno.env.get("STRIPE_BILLING_MONTHLY_PRICE_ID") || ""
    : interval === "annual"
    ? Deno.env.get("STRIPE_BILLING_ANNUAL_PRICE_ID") || ""
    : "";
  const appBaseUrl = (
    Deno.env.get("STRIPE_BILLING_APP_BASE_URL")?.trim() ||
    Deno.env.get("APP_BASE_URL")?.trim() ||
    ""
  ).replace(/\/+$/, "");

  const expectedKey = liveMode
    ? /^(?:sk|rk)_live_[A-Za-z0-9]+$/
    : /^(?:sk|rk)_test_[A-Za-z0-9]+$/;
  if (!expectedKey.test(stripeKey)) {
    throw new Error(
      `Billing requires a Stripe ${liveMode ? "live" : "test"}-mode key`,
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}(?:\.[a-z]+)?$/.test(stripeApiVersion)) {
    throw new Error("STRIPE_BILLING_API_VERSION is required");
  }
  if (!/^price_[A-Za-z0-9]+$/.test(priceId)) {
    throw new Error("The selected Billing price is not configured");
  }

  let parsedBaseUrl: URL;
  try {
    parsedBaseUrl = new URL(appBaseUrl);
  } catch {
    throw new Error(
      "STRIPE_BILLING_APP_BASE_URL or APP_BASE_URL is not configured",
    );
  }
  if (
    parsedBaseUrl.protocol !== "https:" &&
    !(testMode && parsedBaseUrl.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(parsedBaseUrl.hostname))
  ) {
    throw new Error("The Billing application URL must use HTTPS");
  }
  if (
    parsedBaseUrl.username || parsedBaseUrl.password || parsedBaseUrl.search ||
    parsedBaseUrl.hash
  ) {
    throw new Error("The Billing application URL must be a plain URL");
  }

  return { stripeKey, stripeApiVersion, priceId, appBaseUrl, liveMode };
}

async function stripePost(
  path: string,
  params: URLSearchParams,
  key: string,
  apiVersion: string,
  idempotencyKey: string,
) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": apiVersion,
      "Idempotency-Key": idempotencyKey,
    },
    body: params,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || "Stripe request failed");
  }
  return body;
}

async function hasBlockingStripeSubscription(
  customerId: string,
  config: ReturnType<typeof billingConfig>,
): Promise<boolean> {
  let startingAfter = "";
  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({
      customer: customerId,
      status: "all",
      limit: "100",
    });
    if (startingAfter) params.set("starting_after", startingAfter);
    const response = await fetch(
      `https://api.stripe.com/v1/subscriptions?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${config.stripeKey}`,
          "Stripe-Version": config.stripeApiVersion,
        },
      },
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(body?.data)) {
      throw new Error(
        body?.error?.message || "Stripe subscription verification failed",
      );
    }
    if (
      body.data.some((subscription: any) =>
        !["canceled", "incomplete_expired"].includes(
          String(subscription?.status || ""),
        )
      )
    ) {
      return true;
    }
    if (body.has_more !== true) return false;
    const lastId = String(body.data.at(-1)?.id || "");
    if (!/^sub_[A-Za-z0-9]+$/.test(lastId)) {
      throw new Error("Stripe subscription pagination could not be verified");
    }
    startingAfter = lastId;
  }
  throw new Error("Stripe subscription verification exceeded its safe limit");
}

async function requireSensitiveSession(userClient: any) {
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userError || !user) throw new Error("Invalid session");
  if (!user.email_confirmed_at) throw new Error("Confirm your email first");

  const { data: aal, error: aalError } = await userClient.auth.mfa
    .getAuthenticatorAssuranceLevel();
  if (aalError || !aal) {
    throw new Error("Account security could not be confirmed");
  }
  if (aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    throw new Error("Complete two-factor verification first");
  }
  return user;
}

async function mappedCustomer(
  admin: any,
  user: any,
  config: ReturnType<typeof billingConfig>,
): Promise<string> {
  const { data: existing, error: lookupError } = await admin
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (lookupError) throw new Error("Billing customer lookup failed");
  if (existing?.stripe_customer_id) return String(existing.stripe_customer_id);

  const customerParams = new URLSearchParams();
  customerParams.set("description", "Tallyo Pro account");
  customerParams.set("metadata[tallyo_user_id]", user.id);
  if (validEmail(user.email)) customerParams.set("email", user.email.trim());
  const customer = await stripePost(
    "customers",
    customerParams,
    config.stripeKey,
    config.stripeApiVersion,
    `tallyo-billing-customer-${await sha256([user.id])}`,
  );
  if (!/^cus_[A-Za-z0-9]+$/.test(String(customer?.id || ""))) {
    throw new Error("Stripe returned an invalid customer");
  }

  const { error: insertError } = await admin.from("billing_customers").insert({
    user_id: user.id,
    stripe_customer_id: customer.id,
  });
  if (!insertError) return customer.id;
  if (insertError.code !== "23505") {
    throw new Error("Billing customer mapping failed");
  }

  const { data: raced, error: racedError } = await admin
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (racedError || !raced?.stripe_customer_id) {
    throw new Error("Billing customer mapping could not be confirmed");
  }
  return String(raced.stripe_customer_id);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "Missing authorization" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const interval = String(body.interval || "");
  const requestId = String(body.requestId || "");
  if (!["monthly", "annual"].includes(interval)) {
    return json({ error: "Choose monthly or annual billing" }, 400);
  }
  if (!isUuid(requestId)) {
    return json({ error: "Invalid request ID" }, 400);
  }

  try {
    const config = billingConfig(interval);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const admin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const user = await requireSensitiveSession(userClient);
    const customerId = await mappedCustomer(admin, user, config);
    const { data: claimResult, error: claimError } = await admin.rpc(
      "claim_stripe_billing_checkout",
      {
        p_user_id: user.id,
        p_stripe_customer_id: customerId,
        p_request_id: requestId,
        p_billing_interval: interval,
      },
    );
    if (claimError) throw new Error("Billing Checkout claim failed");
    if (claimResult === "customer_mismatch") {
      throw new Error("Billing customer ownership could not be confirmed");
    }
    if (claimResult === "subscription_exists") {
      return json({
        error:
          "A subscription already exists. Manage it from Billing settings.",
      }, 409);
    }
    if (claimResult === "checkout_pending") {
      return json({
        error:
          "A Billing Checkout is already in progress. Finish or let it expire before starting another.",
      }, 409);
    }
    if (claimResult !== "claimed") {
      throw new Error("Billing Checkout claim returned an invalid result");
    }
    if (await hasBlockingStripeSubscription(customerId, config)) {
      return json({
        error:
          "A Stripe subscription already exists. Billing must be reconciled before another Checkout.",
      }, 409);
    }

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("customer", customerId);
    params.set("client_reference_id", user.id);
    params.set("line_items[0][price]", config.priceId);
    params.set("line_items[0][quantity]", "1");
    params.set(
      "success_url",
      `${config.appBaseUrl}/?subscription=success#account`,
    );
    params.set(
      "cancel_url",
      `${config.appBaseUrl}/?subscription=cancelled#account`,
    );
    params.set("metadata[tallyo_user_id]", user.id);
    params.set("metadata[plan_key]", "tallyo_pro");
    params.set("metadata[billing_interval]", interval);
    params.set("subscription_data[metadata][tallyo_user_id]", user.id);
    params.set("subscription_data[metadata][plan_key]", "tallyo_pro");
    params.set(
      "subscription_data[metadata][billing_interval]",
      interval,
    );
    params.set(
      "expires_at",
      String(Math.floor(Date.now() / 1000) + 30 * 60),
    );

    const session = await stripePost(
      "checkout/sessions",
      params,
      config.stripeKey,
      config.stripeApiVersion,
      `tallyo-billing-checkout-${await sha256([
        user.id,
        interval,
        config.priceId,
        requestId,
      ])}`,
    );
    if (
      !(config.liveMode ? /^cs_live_[A-Za-z0-9]+$/ : /^cs_test_[A-Za-z0-9]+$/)
        .test(
          String(session?.id || ""),
        ) ||
      typeof session?.url !== "string" ||
      !Number.isFinite(Number(session?.expires_at))
    ) {
      throw new Error("Stripe Checkout returned an incomplete session");
    }
    const sessionExpiresAt = new Date(
      Number(session.expires_at) * 1000,
    ).toISOString();
    const { data: claimCompleted, error: claimCompleteError } = await admin.rpc(
      "complete_stripe_billing_checkout_claim",
      {
        p_user_id: user.id,
        p_stripe_customer_id: customerId,
        p_request_id: requestId,
        p_stripe_checkout_session_id: session.id,
        p_session_expires_at: sessionExpiresAt,
      },
    );
    if (claimCompleteError || claimCompleted !== true) {
      throw new Error("Billing Checkout claim could not be completed");
    }
    return json({ ok: true, url: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    const disabled = /disabled|provider mode|not approved/.test(message);
    const unauthorized = [
      "Invalid session",
      "Confirm your email first",
      "Complete two-factor verification first",
      "Account security could not be confirmed",
    ].includes(message);
    return json({ error: message }, disabled ? 503 : unauthorized ? 403 : 502);
  }
});
