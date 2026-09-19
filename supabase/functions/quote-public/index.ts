// Public quote read/respond endpoint. The sole customer authority is a scoped,
// high-entropy token; the database stores only its SHA-256 hash.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";
import {
  browserOriginAllowed,
  corsHeaders,
  createMemoryRateLimiter,
  jsonResponse,
  normalizeConfirmedName,
  quoteTokenHash,
  readBoundedJson,
  validQuoteToken,
} from "../_shared/quote-access.mjs";

const allowView = createMemoryRateLimiter({ windowMs: 60_000, limit: 60 });
const allowResponse = createMemoryRateLimiter({ windowMs: 60_000, limit: 10 });
const allowGlobal = createMemoryRateLimiter({ windowMs: 60_000, limit: 600 });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders(request.headers.get("origin") || ""),
    });
  }
  if (request.method !== "POST") {
    return jsonResponse(request, { message: "Method not allowed." }, 405);
  }
  if (!browserOriginAllowed(request)) {
    return jsonResponse(request, { message: "Origin not allowed." }, 403);
  }
  const parsed = await readBoundedJson(request);
  if (!parsed.ok) {
    return jsonResponse(request, { message: parsed.error }, parsed.status);
  }
  const body = parsed.value as Record<string, unknown>;
  if (!allowGlobal("all")) {
    return jsonResponse(
      request,
      { message: "Please wait a moment before trying again." },
      429,
    );
  }
  const action = String(body.action || "");
  const token = body.token;
  if (
    !["view", "accept", "decline", "invoice"].includes(action) ||
    !validQuoteToken(token)
  ) {
    return jsonResponse(request, { state: "unavailable" }, 404);
  }

  let name: string | null = null;
  if (action === "accept") {
    name = normalizeConfirmedName(body.name);
    if (!name) {
      return jsonResponse(
        request,
        {
          state: "invalid_name",
          message: "Enter your name (2–100 characters).",
        },
        400,
      );
    }
  }

  try {
    const tokenHash = await quoteTokenHash(token as string);
    const allowed = action === "view" || action === "invoice"
      ? allowView(`${tokenHash}:${action}`)
      : allowResponse(`${tokenHash}:${action}`);
    if (!allowed) {
      return jsonResponse(
        request,
        { message: "Please wait a moment before trying again." },
        429,
      );
    }

    const supabaseUrl = String(Deno.env.get("SUPABASE_URL") || "");
    const serviceKey = String(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Quote service unavailable");
    }
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    const { data, error } = await admin.rpc("quote_public_action", {
      p_token_hash: tokenHash,
      p_action: action,
      p_confirmed_name: name,
    });
    if (error) throw new Error("Quote action failed");
    const state = String(data?.state || "unavailable");
    if (state === "unavailable") {
      return jsonResponse(request, { state: "unavailable" }, 404);
    }
    if (["expired", "revoked", "changed"].includes(state)) {
      return jsonResponse(request, { state }, 410);
    }
    if (state === "invalid_name") {
      return jsonResponse(request, { state }, 400);
    }
    return jsonResponse(request, data, 200);
  } catch {
    return jsonResponse(
      request,
      { message: "This quote is temporarily unavailable." },
      503,
    );
  }
});
