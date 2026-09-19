// Authenticated owner actions for one quote's customer-access link.
// Raw tokens are returned only when created and are never persisted.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";
import {
  accountAllowsWrite,
  readOnlyAccountMessage,
} from "../_shared/account-entitlements.ts";
import {
  browserOriginAllowed,
  corsHeaders,
  jsonResponse,
  quoteExpiry,
  quoteTokenHash,
  randomQuoteToken,
  readBoundedJson,
  validQuoteId,
} from "../_shared/quote-access.mjs";

type QuoteRow = {
  id: string;
  user_id: string;
  doc_type: string;
  status: string;
  due_date: string | null;
  quote_access_created_at: string | null;
  quote_access_expires_at: string | null;
  quote_access_revoked_at: string | null;
  quote_first_viewed_at: string | null;
  quote_access_version: number;
  quote_response: string | null;
  quote_responded_at: string | null;
};

async function writeAudit(
  admin: any,
  userId: string,
  quoteId: string,
  eventType: "quote_link_created" | "quote_link_revoked",
) {
  const { error } = await admin.from("audit_events").insert({
    user_id: userId,
    actor_user_id: userId,
    event_type: eventType,
    object_type: "quote",
    object_id: quoteId,
    source: "edge_function",
    metadata: {},
  });
  if (error) throw new Error("Quote-link activity could not be recorded.");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders(request.headers.get("origin") || ""),
    });
  }
  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Method not allowed" }, 405);
  }
  if (!browserOriginAllowed(request)) {
    return jsonResponse(request, { error: "Origin not allowed" }, 403);
  }

  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse(request, { error: "Missing authorization" }, 401);
  }
  const parsed = await readBoundedJson(request);
  if (!parsed.ok) {
    return jsonResponse(request, { error: parsed.error }, parsed.status);
  }

  try {
    const supabaseUrl = String(Deno.env.get("SUPABASE_URL") || "");
    const anonKey = String(Deno.env.get("SUPABASE_ANON_KEY") || "");
    const serviceKey = String(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      throw new Error("Quote links are temporarily unavailable.");
    }
    const jwt = authHeader.slice("Bearer ".length);
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(
      jwt,
    );
    if (userError || !userData.user?.id) {
      return jsonResponse(request, { error: "Invalid session" }, 401);
    }

    const body = parsed.value as Record<string, unknown>;
    const action = String(body.action || "");
    const quoteId = body.quoteId;
    if (
      !["status", "create", "revoke"].includes(action) || !validQuoteId(quoteId)
    ) {
      return jsonResponse(request, { error: "Invalid request." }, 400);
    }

    const { data: quote, error: quoteError } = await admin.from("invoices")
      .select(
        "id,user_id,doc_type,status,due_date,quote_access_created_at,quote_access_expires_at,quote_access_revoked_at,quote_first_viewed_at,quote_access_version,quote_response,quote_responded_at",
      )
      .eq("id", quoteId)
      .eq("user_id", userData.user.id)
      .eq("doc_type", "quote")
      .maybeSingle();
    if (quoteError) throw new Error("Quote could not be checked.");
    if (!quote) {
      return jsonResponse(request, { error: "Quote not found." }, 404);
    }
    const ownedQuote = quote as QuoteRow;

    if (action === "status") {
      const { data: linkedInvoice } = await admin.from("invoices")
        .select("number,status")
        .eq("source_quote_id", ownedQuote.id)
        .maybeSingle();
      return jsonResponse(request, {
        link: {
          active: Boolean(
            ownedQuote.quote_access_created_at &&
              !ownedQuote.quote_access_revoked_at &&
              ownedQuote.quote_access_expires_at &&
              new Date(ownedQuote.quote_access_expires_at).getTime() >
                Date.now(),
          ),
          createdAt: ownedQuote.quote_access_created_at,
          expiresAt: ownedQuote.quote_access_expires_at,
          revokedAt: ownedQuote.quote_access_revoked_at,
          firstViewedAt: ownedQuote.quote_first_viewed_at,
        },
        response: ownedQuote.quote_response
          ? {
            outcome: ownedQuote.quote_response,
            respondedAt: ownedQuote.quote_responded_at,
          }
          : null,
        invoice: linkedInvoice || null,
      });
    }

    if (
      action === "create" &&
      !(await accountAllowsWrite(admin, userData.user.id))
    ) {
      return jsonResponse(request, { error: readOnlyAccountMessage }, 403);
    }

    if (action === "revoke") {
      if (
        !ownedQuote.quote_access_created_at ||
        ownedQuote.quote_access_revoked_at
      ) {
        return jsonResponse(request, {
          error: "This quote link is not active.",
        }, 409);
      }
      const revokedAt = new Date().toISOString();
      const { data: revoked, error: revokeError } = await admin.from("invoices")
        .update({ quote_access_revoked_at: revokedAt })
        .eq("id", ownedQuote.id)
        .eq("user_id", userData.user.id)
        .is("quote_access_revoked_at", null)
        .select("id")
        .maybeSingle();
      if (revokeError) throw new Error("Quote link could not be revoked.");
      if (!revoked) {
        return jsonResponse(request, {
          error: "This quote link is not active.",
        }, 409);
      }
      await writeAudit(
        admin,
        userData.user.id,
        ownedQuote.id,
        "quote_link_revoked",
      );
      return jsonResponse(request, { ok: true, revokedAt });
    }

    if (ownedQuote.status !== "Sent" || ownedQuote.quote_response) {
      return jsonResponse(
        request,
        { error: "Only an unanswered sent quote can receive a link." },
        409,
      );
    }
    const token = randomQuoteToken();
    const tokenHash = await quoteTokenHash(token);
    const createdAt = new Date().toISOString();
    const expiresAt = quoteExpiry(ownedQuote.due_date, new Date(createdAt));
    const { data: created, error: createError } = await admin.from("invoices")
      .update({
        quote_access_token_hash: tokenHash,
        quote_access_created_at: createdAt,
        quote_access_expires_at: expiresAt,
        quote_access_revoked_at: null,
        quote_first_viewed_at: null,
        quote_link_version: ownedQuote.quote_access_version,
      })
      .eq("id", ownedQuote.id)
      .eq("user_id", userData.user.id)
      .eq("status", "Sent")
      .eq("quote_access_version", ownedQuote.quote_access_version)
      .is("quote_response", null)
      .select("id")
      .maybeSingle();
    if (createError) throw new Error("Quote link could not be created.");
    if (!created) {
      return jsonResponse(request, {
        error: "The quote changed. Review it and try again.",
      }, 409);
    }
    await writeAudit(
      admin,
      userData.user.id,
      ownedQuote.id,
      "quote_link_created",
    );
    return jsonResponse(request, {
      link: `https://app.tallyo.co.uk/quote/#${token}`,
      expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Quote link action failed.";
    return jsonResponse(request, { error: message }, 500);
  }
});
