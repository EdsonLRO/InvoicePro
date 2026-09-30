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
    src: "https://tallyo.co.uk/assets/product/tallyo-invoice-editor.jpg?v=20260924-overview",
    alt: "Updated Tallyo invoice editor with clear sections, an invoice summary and fictional demonstration data",
  },
  {
    src: "https://tallyo.co.uk/assets/product/tallyo-quote-editor.jpg?v=20260924-overview",
    alt: "Accepted fictional quote in Tallyo with a clearly linked invoice ready to open",
  },
  {
    src: "https://tallyo.co.uk/assets/product/tallyo-recurring.jpg?v=20260924-overview",
    alt: "Tallyo recurring invoice schedules showing automatic and manual email choices with fictional data",
  },
  {
    src: "https://tallyo.co.uk/assets/product/tallyo-payments.jpg?v=20260924-overview",
    alt: "Tallyo payment record showing a deposit, remaining payment and a fully paid fictional invoice",
  },
  {
    src: "https://tallyo.co.uk/assets/product/tallyo-branding.jpg?v=20260924-overview",
    alt: "Tallyo branding controls with document style choices, brand colour, logo position and row options",
  },
];

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("\"", "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const screenshot = (image, title, copy) => `
        <tr><td class="email-pad" style="padding:0 32px 28px;">
          <img src="${image.src}" width="536" alt="${image.alt}" style="display:block;width:100%;max-width:536px;height:auto;border:1px solid #dfe4ee;border-radius:12px;">
          <h2 class="feature-title" style="margin:18px 0 7px;color:#111a31;font-size:23px;line-height:1.2;">${title}</h2>
          <p style="margin:0;color:#526078;font-size:15px;line-height:1.6;">${copy}</p>
        </td></tr>`;

export const buildOverviewEmail = ({ unsubscribeUrl }) => {
  const unsubscribe = new URL(unsubscribeUrl);
  if (unsubscribe.protocol !== "https:") {
    throw new Error("The unsubscribe URL must use HTTPS.");
  }
  const safeUnsubscribeUrl = escapeHtml(unsubscribe.toString());
  const subject = "See how Tallyo keeps invoicing work connected";
  const preheader = "Create clear documents, turn accepted quotes into invoices, repeat regular work and track every payment.";
  const text = [
    "THANKS FOR TRYING TALLYO",
    "",
    "From quote to paid, keep the whole job clear.",
    "",
    "You asked for one overview of Tallyo. Here is the current product, with the main tools that help your business spend less time repeating invoice admin.",
    "",
    "Create your Tallyo account: https://app.tallyo.co.uk/",
    "",
    "No account or subscription has been created. This is the one introductory email you requested.",
    "",
    "CREATE CLEAR DOCUMENTS YOUR WAY",
    "Create invoices, quotes and credit notes. Reuse customers, import a customer CSV, save products or services, choose how tax is applied, and use percentage or exact-amount discounts.",
    "",
    "MOVE FROM QUOTE TO INVOICE",
    "Send a quote for the customer to accept online. Tallyo keeps the accepted quote and creates one linked invoice. You choose whether that invoice is emailed automatically or kept as a draft for review.",
    "",
    "HANDLE REPEAT WORK AND OVERDUE FOLLOW-UP",
    "Schedule recurring invoices and choose whether each one is emailed automatically. Turn on reminders only for overdue invoices you want Tallyo to follow up.",
    "",
    "SEE WHAT HAS BEEN PAID AND WHAT IS LEFT",
    "Record deposits, part-payments and final payments. Delivery, reminder and payment activity stays with the document so the next action is easy to see.",
    "",
    "MAKE EVERY PDF RECOGNISABLY YOURS",
    "Choose Tallyo, Basic, Modern or Professional, then set your brand colour, logo position and whether item rows alternate in colour. The style follows downloaded and emailed PDFs.",
    "",
    "ONLINE CARD PAYMENTS",
    "Eligible independent business accounts can connect Stripe and offer a full-balance or set-deposit card payment option. Stripe fees may apply.",
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
    "Product tour: https://tallyo.co.uk/product-tour/",
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
      .price-cell + .price-cell { padding-top:8px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;color:#111a31;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f4f6fa;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #dfe4ee;border-radius:16px;overflow:hidden;">
        <tr><td class="email-pad" style="padding:18px 32px;border-bottom:1px solid #dfe4ee;background:#ffffff;">
          <a href="https://tallyo.co.uk/" aria-label="Tallyo website" style="display:inline-flex;align-items:center;text-decoration:none;">
            <img src="https://tallyo.co.uk/assets/tallyo-mark.png" width="32" height="32" alt="" style="display:inline-block;width:32px;height:32px;margin-right:9px;border:0;vertical-align:middle;">
            <span style="color:#111a31;font-size:25px;line-height:32px;font-weight:800;vertical-align:middle;">Tallyo</span>
          </a>
        </td></tr>
        <tr><td class="email-pad" style="padding:38px 42px 30px;">
          <p style="margin:0 0 10px;color:#4658eb;font-size:13px;line-height:1.4;font-weight:700;letter-spacing:.09em;text-transform:uppercase;">Thanks for trying Tallyo</p>
          <h1 class="hero-title" style="margin:0 0 18px;color:#111a31;font-size:38px;line-height:1.1;font-weight:800;letter-spacing:-.02em;">From quote to paid,<br>keep the whole job clear.</h1>
          <p style="margin:0 0 24px;color:#4d5b73;font-size:17px;line-height:1.6;">You asked for one overview of Tallyo. Here is the current product, with the main tools that help your business spend less time repeating invoice admin.</p>
          <a class="button" href="https://app.tallyo.co.uk/" style="display:inline-block;padding:14px 22px;border:1px solid #4658eb;border-radius:9px;background:#4658eb;color:#ffffff;font-size:16px;line-height:1.2;font-weight:700;text-decoration:none;">Create your Tallyo account</a>
          <p style="margin:18px 0 0;color:#657188;font-size:13px;line-height:1.55;">No account or subscription has been created. This is the one introductory email you requested.</p>
        </td></tr>

        ${screenshot(
          OVERVIEW_EMAIL_IMAGES[0],
          "Create clear documents your way",
          "Create invoices, quotes and credit notes. Reuse customers, import a customer CSV, save products or services, choose how tax is applied, and use percentage or exact-amount discounts.",
        )}

        ${screenshot(
          OVERVIEW_EMAIL_IMAGES[1],
          "Move from quote to invoice",
          "Send a quote for the customer to accept online. Tallyo keeps the accepted quote and creates one linked invoice. You choose whether that invoice is emailed automatically or kept as a draft for review.",
        )}

        ${screenshot(
          OVERVIEW_EMAIL_IMAGES[2],
          "Handle repeat work and overdue follow-up",
          "Schedule recurring invoices and choose whether each one is emailed automatically. Turn on reminders only for overdue invoices you want Tallyo to follow up.",
        )}

        ${screenshot(
          OVERVIEW_EMAIL_IMAGES[3],
          "See what has been paid and what is left",
          "Record deposits, part-payments and final payments. Delivery, reminder and payment activity stays with the document so the next action is easy to see.",
        )}

        ${screenshot(
          OVERVIEW_EMAIL_IMAGES[4],
          "Make every PDF recognisably yours",
          "Choose Tallyo, Basic, Modern or Professional, then set your brand colour, logo position and whether item rows alternate in colour. The style follows downloaded and emailed PDFs.",
        )}

        <tr><td class="email-pad" style="padding:0 32px 28px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #cfd5e1;border-radius:12px;background:#f8f9fc;">
            <tr><td style="padding:20px 22px;">
              <h2 style="margin:0 0 7px;color:#111a31;font-size:20px;line-height:1.25;">Online card payments</h2>
              <p style="margin:0;color:#526078;font-size:14px;line-height:1.6;">Eligible independent business accounts can connect Stripe and offer a full-balance or set-deposit card payment option. Stripe fees may apply.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td class="email-pad" style="padding:4px 32px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #b8c0ff;border-radius:12px;background:#f0edff;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 4px;color:#4658eb;font-size:13px;line-height:1.4;font-weight:700;letter-spacing:.09em;text-transform:uppercase;">Tallyo Pro</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td class="price-cell" width="50%" style="width:50%;padding:8px 10px 8px 0;color:#111a31;font-size:21px;line-height:1.3;font-weight:800;">£8 monthly</td>
                  <td class="price-cell" width="50%" style="width:50%;padding:8px 0 8px 10px;color:#111a31;font-size:21px;line-height:1.3;font-weight:800;">£80 annually</td>
                </tr>
              </table>
              <p style="margin:16px 0 12px;"><a class="button" href="https://tallyo.co.uk/pricing/" style="display:inline-block;padding:13px 20px;border:1px solid #4658eb;border-radius:9px;background:#4658eb;color:#ffffff;font-size:16px;line-height:1.2;font-weight:700;text-decoration:none;">See plans and get started</a></p>
              <p style="margin:0;"><a href="https://tallyo.co.uk/free-invoice-generator/" style="color:#3f2bd5;font-size:14px;line-height:1.5;font-weight:700;">Continue using the free invoice tool</a></p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td class="email-pad" style="padding:26px 32px;background:#f8f9fc;border-top:1px solid #dfe4ee;">
          <p style="margin:0 0 14px;color:#5c687d;font-size:12px;line-height:1.55;">You received this email because you actively requested one introduction to Tallyo while using the free invoice tool. You have not been added to an ongoing newsletter and Tallyo will not send further promotional messages under this consent.</p>
          <p style="margin:0 0 14px;color:#5c687d;font-size:12px;line-height:1.55;"><a href="https://tallyo.co.uk/" style="color:#3f2bd5;">Website</a> &nbsp;·&nbsp; <a href="https://tallyo.co.uk/product-tour/" style="color:#3f2bd5;">Product tour</a> &nbsp;·&nbsp; <a href="https://tallyo.co.uk/pricing/" style="color:#3f2bd5;">Pricing</a> &nbsp;·&nbsp; <a href="https://tallyo.co.uk/privacy/" style="color:#3f2bd5;">Privacy Notice</a> &nbsp;·&nbsp; <a href="${safeUnsubscribeUrl}" style="color:#3f2bd5;">Unsubscribe</a></p>
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
