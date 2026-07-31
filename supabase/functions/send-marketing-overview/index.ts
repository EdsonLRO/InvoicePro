// Public one-time Tallyo overview request. This function accepts only an
// explicit, versioned opt-in from the free invoice generator.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";
import {
  buildOverviewEmail,
  CONSENT_VERSION,
  CONSENT_WORDING,
  REQUEST_SOURCE,
  validateOverviewBody,
} from "../_shared/marketing-overview.mjs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RATE_LIMIT_PER_HOUR = 3;

const requiredEnv = (name: string) => {
  const value = String(Deno.env.get(name) || "").trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const allowedOrigins = () =>
  new Set(
    String(Deno.env.get("MARKETING_OVERVIEW_ALLOWED_ORIGINS") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
});

const json = (body: Record<string, unknown>, status: number, origin = "") =>
  new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...(origin ? cors(origin) : {}),
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );

const bytesToHex = (bytes: Uint8Array) =>
  [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");

const hmac = async (value: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToHex(
    new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
    ),
  );
};

const randomToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll(
    "/",
    "_",
  ).replaceAll("=", "");
};

const networkAddress = (request: Request) =>
  String(
    request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unavailable",
  ).trim();

Deno.serve(async (request) => {
  if (Deno.env.get("MARKETING_OVERVIEW_ENABLED") !== "true") {
    return json({ message: "Not available." }, 404);
  }

  let supabase;
  let hashSecret;
  let publicSiteUrl;
  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    supabase = createClient(
      supabaseUrl,
      requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    hashSecret = requiredEnv("MARKETING_OVERVIEW_HASH_SECRET");
    publicSiteUrl = new URL(requiredEnv("MARKETING_OVERVIEW_PUBLIC_SITE_URL"));
    if (publicSiteUrl.protocol !== "https:") {
      throw new Error("Public site URL must use HTTPS");
    }
  } catch {
    return json(
      { message: "The overview email is temporarily unavailable." },
      503,
    );
  }

  const requestUrl = new URL(request.url);
  if (
    ["GET", "POST"].includes(request.method) &&
    requestUrl.searchParams.has("unsubscribe")
  ) {
    const token = String(requestUrl.searchParams.get("unsubscribe") || "");
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return json({ message: "Invalid unsubscribe link." }, 400);
    }
    const tokenHash = await hmac(`unsubscribe:${token}`, hashSecret);
    const { data, error } = await supabase
      .from("marketing_overview_requests")
      .update({
        status: "withdrawn",
        withdrawn_at: new Date().toISOString(),
        email: null,
      })
      .eq("unsubscribe_token_hash", tokenHash)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      return json({ message: "Invalid unsubscribe link." }, 400);
    }
    if (request.method === "POST") return json({ status: "unsubscribed" }, 200);
    return Response.redirect(
      new URL("/email-preferences/", publicSiteUrl).toString(),
      303,
    );
  }

  const origin = String(request.headers.get("origin") || "");
  if (!allowedOrigins().has(origin)) {
    return json({ message: "Origin not allowed." }, 403);
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }
  if (request.method !== "POST") {
    return json({ message: "Method not allowed." }, 405, origin);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 2_048) {
    return json({ message: "Request too large." }, 413, origin);
  }
  let body;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 2_048) {
      return json({ message: "Request too large." }, 413, origin);
    }
    body = JSON.parse(rawBody);
  } catch {
    return json({ message: "Invalid request." }, 400, origin);
  }
  const validated = validateOverviewBody(body);
  if (!validated.ok) return json({ message: validated.message }, 400, origin);

  const emailHash = await hmac(`email:${validated.email}`, hashSecret);
  const networkHash = await hmac(
    `network:${networkAddress(request)}`,
    hashSecret,
  );
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("marketing_overview_requests")
    .select("id", { count: "exact", head: true })
    .eq("network_hash", networkHash)
    .gte("created_at", since);
  if (countError) {
    return json(
      { message: "The overview email is temporarily unavailable." },
      503,
      origin,
    );
  }
  if ((count || 0) >= RATE_LIMIT_PER_HOUR) {
    return json({ message: "rate_limited" }, 429, origin);
  }

  const unsubscribeToken = randomToken();
  const unsubscribeTokenHash = await hmac(
    `unsubscribe:${unsubscribeToken}`,
    hashSecret,
  );
  const { data: inserted, error: insertError } = await supabase
    .from("marketing_overview_requests")
    .insert({
      email: validated.email,
      email_hash: emailHash,
      network_hash: networkHash,
      consent_version: CONSENT_VERSION,
      consent_wording: CONSENT_WORDING,
      source: REQUEST_SOURCE,
      unsubscribe_token_hash: unsubscribeTokenHash,
    })
    .select("id")
    .single();

  if (insertError?.code === "23505") {
    const { data: existing } = await supabase
      .from("marketing_overview_requests")
      .select("status")
      .eq("email_hash", emailHash)
      .maybeSingle();
    if (existing?.status === "failed") {
      return json(
        { message: "The overview email is temporarily unavailable." },
        503,
        origin,
      );
    }
    return json({ status: "already_requested" }, 200, origin);
  }
  if (insertError || !inserted) {
    return json(
      { message: "The overview email is temporarily unavailable." },
      503,
      origin,
    );
  }

  const unsubscribeUrl = new URL(request.url);
  unsubscribeUrl.search = "";
  unsubscribeUrl.searchParams.set("unsubscribe", unsubscribeToken);
  const email = buildOverviewEmail({
    unsubscribeUrl: unsubscribeUrl.toString(),
  });
  let providerAccepted = false;
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${requiredEnv("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `tallyo-overview-${inserted.id}`,
      },
      body: JSON.stringify({
        from: Deno.env.get("MARKETING_OVERVIEW_FROM_EMAIL") ||
          "Tallyo <main@tallyo.co.uk>",
        to: [validated.email],
        subject: email.subject,
        text: email.text,
        html: email.html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl.toString()}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    providerAccepted = response.ok;
  } catch {
    providerAccepted = false;
  }

  const completedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("marketing_overview_requests")
    .update({
      email: null,
      status: providerAccepted ? "sent" : "failed",
      sent_at: providerAccepted ? completedAt : null,
    })
    .eq("id", inserted.id);
  if (updateError || !providerAccepted) {
    return json(
      { message: "The overview email is temporarily unavailable." },
      502,
      origin,
    );
  }
  return json({ status: "requested" }, 200, origin);
});
