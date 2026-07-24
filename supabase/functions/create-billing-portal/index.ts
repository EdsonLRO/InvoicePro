// Test-mode-only Stripe Customer Portal session for the authenticated owner.

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

function testConfig() {
  if (Deno.env.get("STRIPE_BILLING_ENABLED") !== "true") {
    throw new Error("Billing Portal is disabled");
  }
  if (Deno.env.get("STRIPE_BILLING_TEST_MODE") !== "true") {
    throw new Error("Billing Portal requires explicit test mode");
  }
  const key = Deno.env.get("STRIPE_BILLING_SECRET_KEY") || "";
  const version = Deno.env.get("STRIPE_BILLING_API_VERSION")?.trim() || "";
  const baseUrl = (Deno.env.get("APP_BASE_URL") || "").replace(/\/+$/, "");
  if (!/^(?:sk|rk)_test_/.test(key)) {
    throw new Error("Billing requires a Stripe test-mode key");
  }
  if (!/^\d{4}-\d{2}-\d{2}(?:\.[a-z]+)?$/.test(version)) {
    throw new Error("STRIPE_BILLING_API_VERSION is required");
  }
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error("APP_BASE_URL is not configured");
  }
  if (
    parsed.protocol !== "https:" &&
    !(parsed.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(parsed.hostname))
  ) {
    throw new Error("APP_BASE_URL must use HTTPS");
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("APP_BASE_URL must be a plain application URL");
  }
  return { key, version, baseUrl };
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

  try {
    const config = testConfig();
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
    const { data: userData, error: userError } = await userClient.auth
      .getUser();
    const user = userData?.user;
    if (userError || !user) return json({ error: "Invalid session" }, 401);
    if (!user.email_confirmed_at) {
      return json({ error: "Confirm your email first" }, 403);
    }
    const { data: aal, error: aalError } = await userClient.auth.mfa
      .getAuthenticatorAssuranceLevel();
    if (
      aalError || !aal ||
      (aal.nextLevel === "aal2" && aal.currentLevel !== "aal2")
    ) {
      return json(
        { error: "Complete account security verification first" },
        403,
      );
    }

    const { data: mapping, error: mappingError } = await admin
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (mappingError) throw new Error("Billing customer lookup failed");
    if (!mapping?.stripe_customer_id) {
      return json({ error: "No Billing account was found" }, 404);
    }

    const params = new URLSearchParams();
    params.set("customer", String(mapping.stripe_customer_id));
    params.set("return_url", `${config.baseUrl}/#account`);
    const response = await fetch(
      "https://api.stripe.com/v1/billing_portal/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version": config.version,
        },
        body: params,
      },
    );
    const portal = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(portal?.error?.message || "Stripe Portal request failed");
    }
    if (
      !/^bps_[A-Za-z0-9]+$/.test(String(portal?.id || "")) ||
      typeof portal?.url !== "string"
    ) {
      throw new Error("Stripe Portal returned an incomplete session");
    }
    return json({ ok: true, url: portal.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portal failed";
    return json(
      { error: message },
      /disabled|test mode/.test(message) ? 503 : 502,
    );
  }
});
