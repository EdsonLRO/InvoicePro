// Disabled-by-default Stripe Connect account onboarding and status management.
// No payment, refund, payout or account disconnection is performed here.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";
import { accountAllowsWrite, readOnlyAccountMessage } from "../_shared/account-entitlements.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ConnectAction = "status" | "onboard" | "update";

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    .test(value);
}

function safeBusinessName(value: unknown): string {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 120) : "Tallyo business";
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

function connectConfig() {
  if (Deno.env.get("STRIPE_CONNECT_ENABLED") !== "true") {
    throw new Error("Stripe connection is not available yet");
  }

  const liveMode = Deno.env.get("STRIPE_CONNECT_LIVE_MODE") === "true";
  if (liveMode && Deno.env.get("STRIPE_CONNECT_LIVE_APPROVED") !== "true") {
    throw new Error("Live Stripe connection requires release approval");
  }

  const stripeKey = Deno.env.get("STRIPE_CONNECT_SECRET_KEY") || "";
  const expectedKeyPattern = liveMode
    ? /^(?:sk|rk)_live_/
    : /^(?:sk|rk)_test_/;
  if (!expectedKeyPattern.test(stripeKey)) {
    throw new Error("Stripe Connect key mode does not match configuration");
  }

  const apiVersion = Deno.env.get("STRIPE_CONNECT_API_VERSION")?.trim() || "";
  if (!/^\d{4}-\d{2}-\d{2}(?:\.[a-z]+)?$/.test(apiVersion)) {
    throw new Error("STRIPE_CONNECT_API_VERSION is required");
  }

  const appBaseUrl = (
    Deno.env.get("STRIPE_CONNECT_APP_BASE_URL") ||
    Deno.env.get("APP_BASE_URL") ||
    ""
  ).replace(/\/+$/, "");
  let parsedBaseUrl: URL;
  try {
    parsedBaseUrl = new URL(appBaseUrl);
  } catch {
    throw new Error("STRIPE_CONNECT_APP_BASE_URL is not configured");
  }
  const localTestUrl = !liveMode &&
    parsedBaseUrl.protocol === "http:" &&
    ["127.0.0.1", "localhost"].includes(parsedBaseUrl.hostname);
  if (parsedBaseUrl.protocol !== "https:" && !localTestUrl) {
    throw new Error("STRIPE_CONNECT_APP_BASE_URL must use HTTPS");
  }
  if (
    parsedBaseUrl.username || parsedBaseUrl.password ||
    parsedBaseUrl.search || parsedBaseUrl.hash
  ) {
    throw new Error(
      "STRIPE_CONNECT_APP_BASE_URL must be a plain application URL",
    );
  }

  return { stripeKey, apiVersion, appBaseUrl, liveMode };
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

async function stripeV2(
  path: string,
  config: ReturnType<typeof connectConfig>,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
    idempotencyKey?: string;
  } = {},
) {
  const response = await fetch(`https://api.stripe.com/v2/core/${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${config.stripeKey}`,
      "Content-Type": "application/json",
      "Stripe-Version": config.apiVersion,
      ...(options.idempotencyKey
        ? { "Idempotency-Key": options.idempotencyKey }
        : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error("Stripe could not complete the request");
  }
  return body;
}

function capabilityStatus(value: unknown): string {
  const status = String(value || "").toLowerCase();
  if (["active", "inactive", "pending", "restricted"].includes(status)) {
    return status;
  }
  return "unknown";
}

function accountState(account: any) {
  const accountId = String(account?.id || "");
  if (!/^acct_[A-Za-z0-9]+$/.test(accountId)) {
    throw new Error("Stripe returned an invalid connected account");
  }
  if (!Array.isArray(account?.applied_configurations) ||
    !account.applied_configurations.includes("merchant")) {
    throw new Error("Stripe Merchant configuration is missing");
  }
  if (
    account?.dashboard !== "full" ||
    account?.defaults?.responsibilities?.fees_collector !== "stripe" ||
    account?.defaults?.responsibilities?.losses_collector !== "stripe"
  ) {
    throw new Error("Stripe account responsibilities do not match approval");
  }

  const cardPayments = capabilityStatus(
    account?.configuration?.merchant?.capabilities?.card_payments?.status,
  );
  const payouts = capabilityStatus(
    account?.configuration?.merchant?.capabilities?.stripe_balance?.payouts
      ?.status,
  );
  const onboardingState = cardPayments === "active" && payouts === "active"
    ? "active"
    : [cardPayments, payouts].includes("restricted")
    ? "restricted"
    : "pending";

  return {
    stripe_account_id: accountId,
    api_family: "accounts_v2",
    dashboard_access: "full",
    fees_collector: "stripe",
    losses_collector: "stripe",
    livemode: account?.livemode === true,
    onboarding_state: onboardingState,
    card_payments_status: cardPayments,
    payouts_status: payouts,
    provider_updated_at: new Date().toISOString(),
    disconnected_at: null,
  };
}

async function fetchAccount(
  stripeAccountId: string,
  config: ReturnType<typeof connectConfig>,
) {
  const include = new URLSearchParams();
  include.append("include[]", "configuration.merchant");
  include.append("include[]", "defaults");
  include.append("include[]", "requirements");
  return await stripeV2(
    `accounts/${encodeURIComponent(stripeAccountId)}?${include.toString()}`,
    config,
  );
}

async function saveAccountState(
  admin: any,
  userId: string,
  account: any,
  expectedLiveMode: boolean,
) {
  if (String(account?.metadata?.tallyo_user_id || "") !== userId) {
    throw new Error("Stripe account ownership could not be confirmed");
  }
  const state = accountState(account);
  if (state.livemode !== expectedLiveMode) {
    throw new Error("Stripe account mode does not match configuration");
  }
  const { error } = await admin.from("stripe_connected_accounts").upsert(
    { user_id: userId, ...state },
    { onConflict: "user_id" },
  );
  if (error) throw new Error("Stripe account state could not be saved");
  return state;
}

async function createAccount(
  admin: any,
  user: any,
  config: ReturnType<typeof connectConfig>,
) {
  const { data: company, error: companyError } = await admin
    .from("company_settings")
    .select("name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (companyError) throw new Error("Company details could not be loaded");

  const account = await stripeV2("accounts", config, {
    method: "POST",
    idempotencyKey: `tallyo-connect-account-${await sha256([user.id])}`,
    body: {
      contact_email: user.email,
      display_name: safeBusinessName(company?.name),
      dashboard: "full",
      defaults: {
        responsibilities: {
          fees_collector: "stripe",
          losses_collector: "stripe",
        },
      },
      configuration: {
        merchant: {
          capabilities: {
            card_payments: { requested: true },
          },
        },
      },
      metadata: { tallyo_user_id: user.id },
      include: ["configuration.merchant", "defaults", "requirements"],
    },
  });
  const state = await saveAccountState(
    admin,
    user.id,
    account,
    config.liveMode,
  );
  return state.stripe_account_id;
}

function stripeLinkUrl(value: unknown): string {
  let parsed: URL;
  try {
    parsed = new URL(String(value || ""));
  } catch {
    throw new Error("Stripe returned an invalid onboarding link");
  }
  if (
    parsed.protocol !== "https:" ||
    !(parsed.hostname === "stripe.com" ||
      parsed.hostname.endsWith(".stripe.com"))
  ) {
    throw new Error("Stripe returned an untrusted onboarding link");
  }
  return parsed.toString();
}

async function createAccountLink(
  stripeAccountId: string,
  action: Exclude<ConnectAction, "status">,
  config: ReturnType<typeof connectConfig>,
  requestId: string,
) {
  const useCaseType = action === "update"
    ? "account_update"
    : "account_onboarding";
  const linkOptions = {
    configurations: ["merchant"],
    refresh_url:
      `${config.appBaseUrl}/?stripe_connect=refresh&stripe_connect_action=${action}#account`,
    return_url:
      `${config.appBaseUrl}/?stripe_connect=return#account`,
    collection_options: {
      fields: "eventually_due",
      future_requirements: "include",
    },
  };
  const link = await stripeV2("account_links", config, {
    method: "POST",
    idempotencyKey: `tallyo-connect-link-${await sha256([
      stripeAccountId,
      action,
      requestId,
    ])}`,
    body: {
      account: stripeAccountId,
      use_case: {
        type: useCaseType,
        [useCaseType]: linkOptions,
      },
    },
  });
  return stripeLinkUrl(link?.url);
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
  const action = String(body.action || "") as ConnectAction;
  const requestId = String(body.requestId || "");
  if (!["status", "onboard", "update"].includes(action)) {
    return json({ error: "Invalid Stripe connection action" }, 400);
  }
  if (!isUuid(requestId)) {
    return json({ error: "Invalid request ID" }, 400);
  }

  try {
    const config = connectConfig();
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
    if (action !== "status" && !await accountAllowsWrite(admin, user.id)) {
      return json({ error: readOnlyAccountMessage }, 403);
    }

    const { data: existing, error: lookupError } = await admin
      .from("stripe_connected_accounts")
      .select("stripe_account_id, onboarding_state")
      .eq("user_id", user.id)
      .maybeSingle();
    if (lookupError) throw new Error("Stripe connection lookup failed");
    if (existing?.onboarding_state === "disconnected") {
      throw new Error("This Stripe connection is disconnected");
    }

    if (!existing?.stripe_account_id && action === "status") {
      return json({ ok: true, connected: false });
    }
    if (!existing?.stripe_account_id && action === "update") {
      return json({ error: "Connect Stripe before updating it" }, 409);
    }

    const stripeAccountId = existing?.stripe_account_id ||
      await createAccount(admin, user, config);
    const providerAccount = await fetchAccount(stripeAccountId, config);
    const state = await saveAccountState(
      admin,
      user.id,
      providerAccount,
      config.liveMode,
    );
    if (action === "status") {
      return json({
        ok: true,
        connected: true,
        status: state.onboarding_state,
        cardPayments: state.card_payments_status,
        payouts: state.payouts_status,
      });
    }

    const url = await createAccountLink(
      stripeAccountId,
      action,
      config,
      requestId,
    );
    return json({
      ok: true,
      connected: true,
      status: state.onboarding_state,
      url,
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Stripe connection failed";
    const unavailable = /not available|release approval/.test(message);
    const unauthorized = [
      "Invalid session",
      "Confirm your email first",
      "Complete two-factor verification first",
      "Account security could not be confirmed",
    ].includes(message);
    return json(
      { error: message },
      unavailable ? 503 : unauthorized ? 403 : 502,
    );
  }
});
