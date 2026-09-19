export const QUOTE_ACCESS_ORIGINS = new Set([
  "https://app.tallyo.co.uk",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);

export const QUOTE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": QUOTE_ACCESS_ORIGINS.has(origin)
      ? origin
      : "https://app.tallyo.co.uk",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function jsonResponse(request, body, status = 200) {
  const origin = request.headers.get("origin") || "";
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function browserOriginAllowed(request) {
  const origin = request.headers.get("origin") || "";
  return !origin || QUOTE_ACCESS_ORIGINS.has(origin);
}

export async function readBoundedJson(request, maxBytes = 2_048) {
  const type = String(request.headers.get("content-type") || "")
    .toLowerCase();
  if (!type.startsWith("application/json")) {
    return { ok: false, status: 415, error: "Use a JSON request." };
  }
  const declared = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, status: 413, error: "Request too large." };
  }
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > maxBytes) {
      return { ok: false, status: 413, error: "Request too large." };
    }
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, status: 400, error: "Invalid request." };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, status: 400, error: "Invalid request." };
  }
}

export function normalizeConfirmedName(value) {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name.length >= 2 && name.length <= 100 ? name : null;
}

export function validQuoteId(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function validQuoteToken(value) {
  return typeof value === "string" && QUOTE_TOKEN_PATTERN.test(value);
}

export function randomQuoteToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function quoteTokenHash(token) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function quoteExpiry(validUntil, now = new Date()) {
  const maximum = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (
    typeof validUntil !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)
  ) {
    return maximum.toISOString();
  }
  const endOfDay = new Date(`${validUntil}T23:59:59.999Z`);
  if (!Number.isFinite(endOfDay.getTime()) || endOfDay <= now) {
    return maximum.toISOString();
  }
  return new Date(Math.min(endOfDay.getTime(), maximum.getTime()))
    .toISOString();
}

export function createMemoryRateLimiter({ windowMs, limit }) {
  const buckets = new Map();
  return (key, now = Date.now()) => {
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    current.count += 1;
    if (buckets.size > 2_000) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(bucketKey);
      }
    }
    return current.count <= limit;
  };
}
