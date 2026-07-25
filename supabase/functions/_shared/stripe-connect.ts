import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

export const connectCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export type ConnectConfig = {
  stripeKey: string;
  apiVersion: string;
  liveMode: boolean;
  appBaseUrl: string;
};

export type ConnectMapping = {
  user_id: string;
  stripe_account_id: string;
  livemode: boolean;
  onboarding_state: string;
  card_payments_status: string;
  payouts_status: string;
  disconnected_at?: string | null;
};

export function json(
  body: Record<string, unknown>,
  status = 200,
  cors = false,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...(cors ? connectCorsHeaders : {}),
      "Content-Type": "application/json",
    },
  });
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    .test(value);
}

export function validEmail(value: unknown): value is string {
  return typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function sha256(parts: string[]): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(parts.join("\u001f")),
  );
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export function connectConfig(
  featureGate: string,
  requireAppBaseUrl = false,
): ConnectConfig {
  if (
    Deno.env.get("STRIPE_CONNECT_ENABLED") !== "true" ||
    Deno.env.get(featureGate) !== "true"
  ) {
    throw new Error("This Stripe Connect feature is disabled");
  }

  const liveMode = Deno.env.get("STRIPE_CONNECT_LIVE_MODE") === "true";
  if (liveMode && Deno.env.get("STRIPE_CONNECT_LIVE_APPROVED") !== "true") {
    throw new Error("Live Stripe Connect requires release approval");
  }

  const stripeKey = Deno.env.get("STRIPE_CONNECT_SECRET_KEY") || "";
  const expectedKey = liveMode ? /^(?:sk|rk)_live_/ : /^(?:sk|rk)_test_/;
  if (!expectedKey.test(stripeKey)) {
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
  if (requireAppBaseUrl) {
    let parsed: URL;
    try {
      parsed = new URL(appBaseUrl);
    } catch {
      throw new Error("STRIPE_CONNECT_APP_BASE_URL is not configured");
    }
    const localTestUrl = !liveMode && parsed.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(parsed.hostname);
    if (parsed.protocol !== "https:" && !localTestUrl) {
      throw new Error("STRIPE_CONNECT_APP_BASE_URL must use HTTPS");
    }
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      throw new Error(
        "STRIPE_CONNECT_APP_BASE_URL must be a plain application URL",
      );
    }
  }

  return { stripeKey, apiVersion, liveMode, appBaseUrl };
}

export function supabaseClients(authHeader: string) {
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
  return { userClient, admin };
}

export async function requireSensitiveSession(userClient: any) {
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

export async function loadConnectMapping(
  admin: any,
  userId: string,
): Promise<ConnectMapping> {
  const { data, error } = await admin.from("stripe_connected_accounts")
    .select(
      "user_id, stripe_account_id, livemode, onboarding_state, card_payments_status, payouts_status, disconnected_at",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Stripe connection lookup failed");
  if (!data) throw new Error("Connect Stripe before accepting card payments");
  return data as ConnectMapping;
}

export function requireActiveMapping(
  mapping: ConnectMapping,
  config: ConnectConfig,
) {
  if (
    mapping.livemode !== config.liveMode ||
    mapping.onboarding_state !== "active" ||
    mapping.card_payments_status !== "active" ||
    mapping.payouts_status !== "active" ||
    mapping.disconnected_at
  ) {
    throw new Error(
      "Finish Stripe setup before accepting or refunding card payments",
    );
  }
  if (!/^acct_[A-Za-z0-9]+$/.test(mapping.stripe_account_id)) {
    throw new Error("Stripe connection identity is invalid");
  }
}

async function stripeJson(
  url: string,
  config: ConnectConfig,
  options: {
    method?: "GET" | "POST";
    stripeAccountId?: string;
    params?: URLSearchParams;
    jsonBody?: Record<string, unknown>;
    idempotencyKey?: string;
  } = {},
) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${config.stripeKey}`,
      "Stripe-Version": config.apiVersion,
      ...(options.stripeAccountId
        ? { "Stripe-Account": options.stripeAccountId }
        : {}),
      ...(options.params
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
      ...(options.jsonBody ? { "Content-Type": "application/json" } : {}),
      ...(options.idempotencyKey
        ? { "Idempotency-Key": options.idempotencyKey }
        : {}),
    },
    ...(options.params ? { body: options.params } : {}),
    ...(options.jsonBody ? { body: JSON.stringify(options.jsonBody) } : {}),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("Stripe could not complete the request");
  return body;
}

export async function stripeV1(
  path: string,
  config: ConnectConfig,
  stripeAccountId: string,
  options: {
    method?: "GET" | "POST";
    params?: URLSearchParams;
    idempotencyKey?: string;
  } = {},
) {
  return await stripeJson(
    `https://api.stripe.com/v1/${path}`,
    config,
    { ...options, stripeAccountId },
  );
}

export async function refreshActiveAccount(
  admin: any,
  userId: string,
  mapping: ConnectMapping,
  config: ConnectConfig,
) {
  const include = new URLSearchParams();
  include.append("include[0]", "configuration.merchant");
  include.append("include[1]", "defaults");
  include.append("include[2]", "requirements");
  const account = await stripeJson(
    `https://api.stripe.com/v2/core/accounts/${
      encodeURIComponent(mapping.stripe_account_id)
    }?${include.toString()}`,
    config,
  );
  if (
    String(account?.id || "") !== mapping.stripe_account_id ||
    String(account?.metadata?.tallyo_user_id || "") !== userId ||
    account?.livemode !== config.liveMode ||
    !Array.isArray(account?.applied_configurations) ||
    !account.applied_configurations.includes("merchant") ||
    account?.dashboard !== "full" ||
    account?.defaults?.responsibilities?.fees_collector !== "stripe" ||
    account?.defaults?.responsibilities?.losses_collector !== "stripe"
  ) {
    throw new Error("Stripe connection no longer matches Tallyo");
  }
  const cardPayments = String(
    account?.configuration?.merchant?.capabilities?.card_payments?.status ||
      "",
  );
  const payouts = String(
    account?.configuration?.merchant?.capabilities?.stripe_balance?.payouts
      ?.status || "",
  );
  if (cardPayments !== "active" || payouts !== "active") {
    throw new Error("Stripe has paused card payments or payouts");
  }
  const { error } = await admin.from("stripe_connected_accounts").update({
    onboarding_state: "active",
    card_payments_status: "active",
    payouts_status: "active",
    provider_updated_at: new Date().toISOString(),
  }).eq("user_id", userId).eq(
    "stripe_account_id",
    mapping.stripe_account_id,
  );
  if (error) throw new Error("Stripe connection state could not be refreshed");
}

export function safeStripeCheckoutUrl(value: unknown): string {
  let parsed: URL;
  try {
    parsed = new URL(String(value || ""));
  } catch {
    throw new Error("Stripe Checkout returned an invalid link");
  }
  if (
    parsed.protocol !== "https:" ||
    !(parsed.hostname === "stripe.com" ||
      parsed.hostname.endsWith(".stripe.com"))
  ) {
    throw new Error("Stripe Checkout returned an untrusted link");
  }
  return parsed.toString();
}

async function hmacSha256Hex(secret: string, payload: string) {
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

export async function verifyStripeSignature(
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

export function amountPaid(payments: unknown): number {
  if (!Array.isArray(payments)) return 0;
  return payments.reduce(
    (sum: number, payment: any) => sum + (Number(payment?.amount) || 0),
    0,
  );
}

export function statusAfterPaymentChange(inv: any, paid: number): string {
  const total = Number(inv.grand_total) || 0;
  if (inv.status === "Cancelled") return "Cancelled";
  if (paid >= total - 0.001) return "Paid";
  if (inv.status === "Paid") return "Sent";
  if (inv.status === "Draft" && paid > 0.001) return "Sent";
  return inv.status || "Sent";
}

export function formatMoney(code: string, amount: unknown) {
  const symbol = ({ GBP: "\u00A3", EUR: "\u20AC", USD: "$" } as Record<
    string,
    string
  >)[code] || `${code} `;
  return `${symbol}${(Number(amount) || 0).toFixed(2)}`;
}
