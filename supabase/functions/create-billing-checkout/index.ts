// Test-mode-only Tallyo Pro subscription Checkout.
// Disabled unless both Billing feature gates are explicitly enabled.

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
  if (Deno.env.get("STRIPE_BILLING_TEST_MODE") !== "true") {
    throw new Error("Billing Checkout requires explicit test mode");
  }

  const stripeKey = Deno.env.get("STRIPE_BILLING_SECRET_KEY") || "";
  const stripeApiVersion = Deno.env.get("STRIPE_BILLING_API_VERSION")?.trim() ||
    "";
  const priceId = interval === "monthly"
    ? Deno.env.get("STRIPE_BILLING_MONTHLY_PRICE_ID") || ""
    : interval === "annual"
    ? Deno.env.get("STRIPE_BILLING_ANNUAL_PRICE_ID") || ""
    : "";
  const appBaseUrl = (Deno.env.get("APP_BASE_URL") || "").replace(/\/+$/, "");

  if (!/^(?:sk|rk)_test_/.test(stripeKey)) {
    throw new Error("Billing requires a Stripe test-mode key");
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
    throw new Error("APP_BASE_URL is not configured");
  }
  if (
    parsedBaseUrl.protocol !== "https:" &&
    !(parsedBaseUrl.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(parsedBaseUrl.hostname))
  ) {
    throw new Error("APP_BASE_URL must use HTTPS");
  }
  if (
    parsedBaseUrl.username || parsedBaseUrl.password || parsedBaseUrl.search ||
    parsedBaseUrl.hash
  ) {
    throw new Error("APP_BASE_URL must be a plain application URL");
  }

  return { stripeKey, stripeApiVersion, priceId, appBaseUrl };
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
    const { data: current, error: currentError } = await admin
      .from("billing_subscriptions")
      .select("provider_status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (currentError) throw new Error("Billing subscription lookup failed");
    if (
      current?.provider_status &&
      !["canceled", "incomplete_expired"].includes(current.provider_status)
    ) {
      return json({
        error:
          "A subscription already exists. Manage it from Billing settings.",
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
      !/^cs_test_[A-Za-z0-9]+$/.test(String(session?.id || "")) ||
      typeof session?.url !== "string"
    ) {
      throw new Error("Stripe Checkout returned an incomplete session");
    }
    return json({ ok: true, url: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    const disabled = /disabled|test mode/.test(message);
    const unauthorized = [
      "Invalid session",
      "Confirm your email first",
      "Complete two-factor verification first",
      "Account security could not be confirmed",
    ].includes(message);
    return json({ error: message }, disabled ? 503 : unauthorized ? 403 : 502);
  }
});
