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

export const OVERVIEW_EMAIL_IMAGES = [
  {
    src: "https://tallyo.co.uk/assets/email/overview-create-invoice.jpg",
    alt: "Tallyo invoice editor with invoice details and flexible tax fields",
  },
  {
    src: "https://tallyo.co.uk/assets/email/overview-saved-items.jpg",
    alt: "Tallyo saved items list with reusable sample services and prices",
  },
  {
    src: "https://tallyo.co.uk/assets/email/overview-recurring-reminders.jpg",
    alt: "Tallyo recurring invoice and automatic reminder controls",
  },
  {
    src: "https://tallyo.co.uk/assets/email/overview-stripe-payments.jpg",
    alt: "Tallyo customer card payment settings showing Stripe payments and payouts ready",
  },
];

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("\"", "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

export const buildOverviewEmail = ({ unsubscribeUrl }) => {
  const unsubscribe = new URL(unsubscribeUrl);
  if (unsubscribe.protocol !== "https:") {
    throw new Error("The unsubscribe URL must use HTTPS.");
  }
  const safeUnsubscribeUrl = escapeHtml(unsubscribe.toString());
  const subject = "See what else you can do with Tallyo";
  const preheader = "Save customers and items, automate invoices and reminders, track payments and accept online card payments.";
  const text = [
    "THANKS FOR TRYING TALLYO",
    "",
    "Create invoices faster. Get paid with less admin.",
    "",
    "You asked for a quick look at what Tallyo can do. Here’s a simple overview of the features that help UK sole traders, freelancers and small businesses save time on invoicing.",
    "",
    "Create your Tallyo account: https://app.tallyo.co.uk/",
    "",
    "No account or subscription has been created. This is the one introductory email you requested.",
    "",
    "CREATE PROFESSIONAL INVOICES IN MINUTES",
    "Create invoices, quotes and credit notes with flexible tax settings and PDF export.",
    "",
    "SAVE CUSTOMERS AND ITEMS",
    "Reuse customer details and saved products or services so the next invoice takes less time.",
    "",
    "TRACK INVOICES AND PAYMENT STATUS",
    "See what is sent, overdue or paid and keep records organised in one place.",
    "",
    "AUTOMATE RECURRING INVOICES AND REMINDERS",
    "Schedule invoices, email them automatically and send overdue reminders.",
    "",
    "ACCEPT ONLINE PAYMENTS WITH STRIPE",
    "Connect a Stripe account and optionally include full-payment or predefined-deposit payment options. Stripe fees may apply.",
    "",
    "KEEP INVOICES ON BRAND",
    "Add a logo, company details, brand colours and preferred logo position.",
    "",
    "TALLYO PRO",
    "£8 monthly",
    "£80 annually",
    "",
    "See plans and get started: https://tallyo.co.uk/pricing/",
    "Continue using the free invoice tool: https://tallyo.co.uk/free-invoice-generator/",
    "",
    "You received this email because you actively requested one introduction to Tallyo while using the free invoice tool. You have not been added to an ongoing newsletter and Tallyo will not send further promotional messages under this consent.",
    "",
    "Website: https://tallyo.co.uk/",
    "Pricing: https://tallyo.co.uk/pricing/",
    "Privacy Notice: https://tallyo.co.uk/privacy/",
    `Unsubscribe: ${unsubscribe.toString()}`,
    "Contact: main@tallyo.co.uk",
    "",
    "Tallyo is operated by Edson Oliveira, a UK sole trader.",
    "87 Coles Green Road, London, NW2 7JH, UK",
  ].join("\n");
  const html = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject}</title>
  <style>
    @media only screen and (max-width:620px) {
      .email-shell { width:100% !important; }
      .email-pad { padding-left:20px !important; padding-right:20px !important; }
      .hero-title { font-size:30px !important; line-height:1.12 !important; }
      .feature-title { font-size:21px !important; }
      .button { display:block !important; width:auto !important; text-align:center !important; }
      .price-cell { display:block !important; width:100% !important; box-sizing:border-box !important; }
      .price-cell + .price-cell { padding-top:12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;color:#111a31;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f4f6fa;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #dfe4ee;border-radius:16px;overflow:hidden;">
        <tr><td class="email-pad" style="padding:20px 32px;background:#0f1930;">
          <a href="https://tallyo.co.uk/" aria-label="Tallyo website" style="display:inline-block;text-decoration:none;"><img src="https://tallyo.co.uk/assets/tallyo-wordmark-white.png" width="116" alt="Tallyo" style="display:block;width:116px;max-width:100%;height:auto;border:0;"></a>
        </td></tr>
        <tr><td class="email-pad" style="padding:38px 42px 30px;">
          <p style="margin:0 0 10px;color:#5138ed;font-size:13px;line-height:1.4;font-weight:700;letter-spacing:.09em;text-transform:uppercase;">Thanks for trying Tallyo</p>
          <h1 class="hero-title" style="margin:0 0 18px;color:#111a31;font-size:38px;line-height:1.1;font-weight:800;letter-spacing:-.02em;">Create invoices faster.<br>Get paid with less admin.</h1>
          <p style="margin:0 0 24px;color:#4d5b73;font-size:17px;line-height:1.6;">You asked for a quick look at what Tallyo can do. Here’s a simple overview of the features that help UK sole traders, freelancers and small businesses save time on invoicing.</p>
          <a class="button" href="https://app.tallyo.co.uk/" style="display:inline-block;padding:14px 22px;border-radius:9px;background:#5138ed;color:#ffffff;font-size:16px;line-height:1.2;font-weight:700;text-decoration:none;">Create your Tallyo account</a>
          <p style="margin:18px 0 0;color:#657188;font-size:13px;line-height:1.55;">No account or subscription has been created. This is the one introductory email you requested.</p>
        </td></tr>

        <tr><td class="email-pad" style="padding:0 32px 28px;">
          <img src="${OVERVIEW_EMAIL_IMAGES[0].src}" width="536" alt="${OVERVIEW_EMAIL_IMAGES[0].alt}" style="display:block;width:100%;max-width:536px;height:auto;border:1px solid #dfe4ee;border-radius:12px;">
          <h2 class="feature-title" style="margin:20px 0 7px;color:#111a31;font-size:24px;line-height:1.2;">Create professional invoices in minutes</h2>
          <p style="margin:0;color:#526078;font-size:15px;line-height:1.6;">Create invoices, quotes and credit notes with flexible tax settings and PDF export.</p>
        </td></tr>

        <tr><td class="email-pad" style="padding:0 32px 28px;">
          <img src="${OVERVIEW_EMAIL_IMAGES[1].src}" width="536" alt="${OVERVIEW_EMAIL_IMAGES[1].alt}" style="display:block;width:100%;max-width:536px;height:auto;border:1px solid #dfe4ee;border-radius:12px;">
          <h2 class="feature-title" style="margin:20px 0 7px;color:#111a31;font-size:24px;line-height:1.2;">Save customers and items</h2>
          <p style="margin:0 0 16px;color:#526078;font-size:15px;line-height:1.6;">Reuse customer details and saved products or services so the next invoice takes less time.</p>
          <h2 class="feature-title" style="margin:0 0 7px;color:#111a31;font-size:24px;line-height:1.2;">Track invoices and payment status</h2>
          <p style="margin:0;color:#526078;font-size:15px;line-height:1.6;">See what is sent, overdue or paid and keep records organised in one place.</p>
        </td></tr>

        <tr><td class="email-pad" style="padding:0 32px 28px;">
          <img src="${OVERVIEW_EMAIL_IMAGES[2].src}" width="536" alt="${OVERVIEW_EMAIL_IMAGES[2].alt}" style="display:block;width:100%;max-width:536px;height:auto;border:1px solid #dfe4ee;border-radius:12px;">
          <h2 class="feature-title" style="margin:20px 0 7px;color:#111a31;font-size:24px;line-height:1.2;">Automate recurring invoices and reminders</h2>
          <p style="margin:0;color:#526078;font-size:15px;line-height:1.6;">Schedule invoices, email them automatically and send overdue reminders.</p>
        </td></tr>

        <tr><td class="email-pad" style="padding:0 32px 28px;">
          <img src="${OVERVIEW_EMAIL_IMAGES[3].src}" width="536" alt="${OVERVIEW_EMAIL_IMAGES[3].alt}" style="display:block;width:100%;max-width:536px;height:auto;border:1px solid #dfe4ee;border-radius:12px;">
          <h2 class="feature-title" style="margin:20px 0 7px;color:#111a31;font-size:24px;line-height:1.2;">Accept online payments with Stripe</h2>
          <p style="margin:0 0 16px;color:#526078;font-size:15px;line-height:1.6;">Connect a Stripe account and optionally include full-payment or predefined-deposit payment options. Stripe fees may apply.</p>
          <h2 class="feature-title" style="margin:0 0 7px;color:#111a31;font-size:24px;line-height:1.2;">Keep invoices on brand</h2>
          <p style="margin:0;color:#526078;font-size:15px;line-height:1.6;">Add a logo, company details, brand colours and preferred logo position.</p>
        </td></tr>

        <tr><td class="email-pad" style="padding:4px 32px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f0edff;border:1px solid #d7d0ff;border-radius:12px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 4px;color:#5138ed;font-size:13px;line-height:1.4;font-weight:700;letter-spacing:.09em;text-transform:uppercase;">Tallyo Pro</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td class="price-cell" width="50%" style="width:50%;padding:8px 10px 8px 0;color:#111a31;font-size:21px;line-height:1.3;font-weight:800;">£8 monthly</td>
                  <td class="price-cell" width="50%" style="width:50%;padding:8px 0 8px 10px;color:#111a31;font-size:21px;line-height:1.3;font-weight:800;">£80 annually</td>
                </tr>
              </table>
              <p style="margin:16px 0 12px;"><a class="button" href="https://tallyo.co.uk/pricing/" style="display:inline-block;padding:13px 20px;border-radius:9px;background:#5138ed;color:#ffffff;font-size:16px;line-height:1.2;font-weight:700;text-decoration:none;">See plans and get started</a></p>
              <p style="margin:0;"><a href="https://tallyo.co.uk/free-invoice-generator/" style="color:#3f2bd5;font-size:14px;line-height:1.5;font-weight:700;">Continue using the free invoice tool</a></p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td class="email-pad" style="padding:26px 32px;background:#f8f9fc;border-top:1px solid #dfe4ee;">
          <p style="margin:0 0 14px;color:#5c687d;font-size:12px;line-height:1.55;">You received this email because you actively requested one introduction to Tallyo while using the free invoice tool. You have not been added to an ongoing newsletter and Tallyo will not send further promotional messages under this consent.</p>
          <p style="margin:0 0 14px;color:#5c687d;font-size:12px;line-height:1.55;"><a href="https://tallyo.co.uk/" style="color:#3f2bd5;">Website</a> &nbsp;·&nbsp; <a href="https://tallyo.co.uk/pricing/" style="color:#3f2bd5;">Pricing</a> &nbsp;·&nbsp; <a href="https://tallyo.co.uk/privacy/" style="color:#3f2bd5;">Privacy Notice</a> &nbsp;·&nbsp; <a href="${safeUnsubscribeUrl}" style="color:#3f2bd5;">Unsubscribe</a></p>
          <p style="margin:0;color:#5c687d;font-size:12px;line-height:1.55;">Tallyo is operated by Edson Oliveira, a UK sole trader.<br>87 Coles Green Road, London, NW2 7JH, UK<br><a href="mailto:main@tallyo.co.uk" style="color:#3f2bd5;">main@tallyo.co.uk</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  return {
    subject,
    preheader,
    text,
    html,
    images: OVERVIEW_EMAIL_IMAGES,
  };
};
