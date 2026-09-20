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
import { sendAcceptedQuoteInvoice } from "../send-document-email/index.ts";

const allowView = createMemoryRateLimiter({ windowMs: 60_000, limit: 60 });
const allowResponse = createMemoryRateLimiter({ windowMs: 60_000, limit: 10 });
// A small hash shard prevents one unknown token from consuming the safety
// ceiling for every quote handled by the same warm isolate. Per-token limits
// below remain the primary customer-action control.
const allowSafetyShard = createMemoryRateLimiter({
  windowMs: 60_000,
  limit: 600,
});

function dueDateAfter(acceptedAt: unknown, days: number): string {
  const accepted = new Date(String(acceptedAt || ""));
  const base = Number.isFinite(accepted.getTime()) ? accepted : new Date();
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

async function finishAutomaticDeliveryState(
  admin: any,
  quoteId: string,
  ownerUserId: string,
  values: Record<string, unknown>,
) {
  const { error } = await admin
    .from("invoices")
    .update(values)
    .eq("id", quoteId)
    .eq("user_id", ownerUserId)
    .eq("doc_type", "quote")
    .eq("quote_auto_send_status", "sending");
  if (error) console.error("quote automatic delivery state update failed");
}

async function attemptAcceptedQuoteAutomaticDelivery(
  admin: any,
  tokenHash: string,
  actionData: any,
) {
  if (String(actionData?.state || "") !== "accepted") return actionData;

  const { data: quote, error: quoteError } = await admin
    .from("invoices")
    .select("id,user_id,quote_response,quote_responded_at,quote_auto_send_invoice,quote_auto_send_due_days,quote_auto_send_recipient,quote_auto_send_status")
    .eq("quote_access_token_hash", tokenHash)
    .eq("doc_type", "quote")
    .maybeSingle();
  if (quoteError || !quote || quote.quote_response !== "accepted") return actionData;
  if (quote.quote_auto_send_invoice !== true || quote.quote_auto_send_status !== null) return actionData;

  const attemptedAt = new Date().toISOString();
  const { data: claimed, error: claimError } = await admin
    .from("invoices")
    .update({
      quote_auto_send_status: "sending",
      quote_auto_send_attempted_at: attemptedAt,
      quote_auto_send_sent_at: null,
    })
    .eq("id", quote.id)
    .eq("user_id", quote.user_id)
    .eq("doc_type", "quote")
    .eq("quote_response", "accepted")
    .is("quote_auto_send_status", null)
    .select("id")
    .maybeSingle();
  if (claimError || !claimed) return actionData;

  try {
    const dueDays = Number(quote.quote_auto_send_due_days);
    if (![7, 14, 30, 60].includes(dueDays)) {
      throw new Error("Automatic invoice due period is invalid");
    }
    const { data: generatedInvoice, error: invoiceError } = await admin
      .from("invoices")
      .select("*")
      .eq("source_quote_id", quote.id)
      .eq("user_id", quote.user_id)
      .eq("doc_type", "invoice")
      .maybeSingle();
    if (invoiceError || !generatedInvoice) throw new Error("Generated invoice could not be loaded");

    const dueDate = dueDateAfter(quote.quote_responded_at, dueDays);
    const { data: invoiceWithDueDate, error: dueDateError } = await admin
      .from("invoices")
      .update({ due_date: dueDate, updated_at: attemptedAt })
      .eq("id", generatedInvoice.id)
      .eq("user_id", quote.user_id)
      .eq("doc_type", "invoice")
      .eq("status", "Draft")
      .eq("source_quote_id", quote.id)
      .select("*")
      .maybeSingle();
    if (dueDateError || !invoiceWithDueDate) throw new Error("Generated invoice could not be prepared");

    const recipient = String(quote.quote_auto_send_recipient || "").trim();
    const delivered = await sendAcceptedQuoteInvoice({
      admin,
      invoice: invoiceWithDueDate,
      ownerUserId: quote.user_id,
      to: recipient,
    });
    await finishAutomaticDeliveryState(admin, quote.id, quote.user_id, {
      quote_auto_send_status: "sent",
      quote_auto_send_sent_at: new Date().toISOString(),
    });
    return {
      ...actionData,
      invoice: {
        ...actionData.invoice,
        status: delivered.invoice.status,
        dueDate: delivered.invoice.due_date,
      },
      automaticDelivery: { state: "sent" },
    };
  } catch (error) {
    console.error("accepted quote automatic invoice delivery failed");
    await finishAutomaticDeliveryState(admin, quote.id, quote.user_id, {
      quote_auto_send_status: "failed",
      quote_auto_send_sent_at: null,
    });
    return {
      ...actionData,
      automaticDelivery: { state: "failed" },
    };
  }
}

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
    if (!allowSafetyShard(tokenHash.slice(0, 2))) {
      return jsonResponse(
        request,
        { message: "Please wait a moment before trying again." },
        429,
      );
    }
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
    const responseData = action === "accept"
      ? await attemptAcceptedQuoteAutomaticDelivery(admin, tokenHash, data)
      : data;
    return jsonResponse(request, responseData, 200);
  } catch {
    return jsonResponse(
      request,
      { message: "This quote is temporarily unavailable." },
      503,
    );
  }
});
