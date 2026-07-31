export const CONSENT_VERSION = "tallyo-overview-v1-2026-07-31";
export const CONSENT_WORDING =
  "Yes, Tallyo may send me one promotional email about its invoicing features. This does not create an account or subscription.";
export const REQUEST_SOURCE = "free-invoice-generator-pre-download";

export const normaliseEmail = (value) =>
  String(value || "").trim().toLowerCase();

export const validEmail = (value) => {
  const email = normaliseEmail(value);
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateOverviewBody = (body) => {
  const email = normaliseEmail(body?.email);
  if (
    body?.consent !== true ||
    body?.consentVersion !== CONSENT_VERSION ||
    body?.source !== REQUEST_SOURCE
  ) return { ok: false, message: "Explicit consent is required." };
  if (!validEmail(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  return { ok: true, email };
};

export const buildOverviewEmail = ({ unsubscribeUrl }) => {
  const subject = "A quick introduction to Tallyo invoicing";
  const text = [
    "Tallyo invoicing, in one quick overview",
    "",
    "Tallyo Pro helps UK small businesses save customers and items, create recurring invoices, send automatic overdue reminders, track invoices and payments, and offer online payments through their own connected Stripe account.",
    "",
    "Tallyo Pro costs £8 monthly or £80 annually.",
    "",
    "Create an account: https://app.tallyo.co.uk/",
    "Privacy Notice: https://tallyo.co.uk/privacy/",
    `Unsubscribe: ${unsubscribeUrl}`,
    "",
    "You requested this one introductory email from the free Tallyo invoice generator. This is the only promotional overview email Tallyo will send for that request.",
    "",
    "Tallyo is operated by Edson Oliveira, a UK sole trader.",
    "87 Coles Green Road, NW2 7JH, London, UK",
  ].join("\n");
  const html =
    `<!doctype html><html lang="en-GB"><body style="margin:0;background:#f5f7fb;color:#111a31;font-family:Arial,sans-serif;"><main style="max-width:620px;margin:0 auto;padding:28px 20px;"><div style="padding:28px;border:1px solid #dfe4ee;border-radius:16px;background:#ffffff;"><p style="margin:0 0 8px;color:#5138ed;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Tallyo</p><h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;">Invoicing, in one quick overview</h1><p>Tallyo Pro helps UK small businesses:</p><ul><li>save customers and items;</li><li>create recurring invoices;</li><li>send automatic overdue reminders;</li><li>track invoices and payment status; and</li><li>offer online payments through their own connected Stripe account.</li></ul><p><strong>£8 monthly or £80 annually.</strong></p><p><a href="https://app.tallyo.co.uk/" style="display:inline-block;padding:12px 18px;border-radius:9px;color:#ffffff;background:#5138ed;font-weight:700;text-decoration:none;">Create a Tallyo account</a></p><hr style="margin:24px 0;border:0;border-top:1px solid #dfe4ee;"><p style="font-size:13px;color:#59657a;">You requested this one introductory email from the free Tallyo invoice generator. This is the only promotional overview email Tallyo will send for that request.</p><p style="font-size:13px;color:#59657a;"><a href="https://tallyo.co.uk/privacy/">Privacy Notice</a> · <a href="${unsubscribeUrl}">Unsubscribe</a></p><p style="font-size:13px;color:#59657a;">Tallyo is operated by Edson Oliveira, a UK sole trader.<br>87 Coles Green Road, NW2 7JH, London, UK</p></div></main></body></html>`;
  return { subject, text, html };
};
