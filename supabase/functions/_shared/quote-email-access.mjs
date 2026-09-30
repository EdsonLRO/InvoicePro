import {
  quoteExpiry,
  quoteTokenHash,
  randomQuoteToken,
} from "./quote-access.mjs";

const QUOTE_PUBLIC_URL = "https://app.tallyo.co.uk/quote/#";

export async function prepareQuoteEmailAccess({
  quote,
  userId,
  admin,
  now = new Date(),
}) {
  if (quote?.doc_type !== "quote") return null;
  if (!quote?.id || quote.user_id !== userId) {
    throw new Error("Quote not found.");
  }
  if (!["Draft", "Sent"].includes(String(quote.status || ""))) {
    throw new Error("Only a draft or sent quote can be emailed.");
  }
  if (quote.quote_response) {
    throw new Error("This quote already has a customer response.");
  }

  const token = randomQuoteToken();
  const tokenHash = await quoteTokenHash(token);
  const createdAt = now.toISOString();
  const expiresAt = quoteExpiry(quote.due_date, new Date(createdAt));
  const accessVersion = Number(quote.quote_access_version) || 1;

  let update = admin.from("invoices")
    .update({
      status: "Sent",
      quote_access_token_hash: tokenHash,
      quote_access_created_at: createdAt,
      quote_access_expires_at: expiresAt,
      quote_access_revoked_at: null,
      quote_first_viewed_at: null,
      quote_link_version: accessVersion,
      updated_at: createdAt,
    })
    .eq("id", quote.id)
    .eq("user_id", userId)
    .eq("doc_type", "quote")
    .in("status", ["Draft", "Sent"])
    .eq("quote_access_version", accessVersion)
    .is("quote_response", null);

  if (quote.updated_at) update = update.eq("updated_at", quote.updated_at);

  const { data: prepared, error } = await update.select("*").maybeSingle();
  if (error) {
    throw new Error("The secure quote response link could not be prepared.");
  }
  if (!prepared) {
    throw new Error("The quote changed. Review it and try sending again.");
  }

  return {
    invoice: prepared,
    link: `${QUOTE_PUBLIC_URL}${token}`,
    expiresAt,
    tokenHash,
  };
}
