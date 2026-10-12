export const TALLYO_EMAIL_ASSET_ROOT = "https://tallyo.co.uk/assets";

export const escapeEmailHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export const safeEmailColour = (value, fallback = "#4f46e5") =>
  /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;

const hiddenPreheader = (value) => value
  ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeEmailHtml(value)}</div>`
  : "";

const tallyoBrand = `
  <a href="https://tallyo.co.uk/" aria-label="Tallyo website" style="display:inline-block;text-decoration:none;">
    <img src="${TALLYO_EMAIL_ASSET_ROOT}/tallyo-mark.png" width="32" height="32" alt="" style="display:inline-block;width:32px;height:32px;margin-right:9px;border:0;vertical-align:middle;">
    <span style="color:#111a31;font-size:25px;line-height:32px;font-weight:800;vertical-align:middle;">Tallyo</span>
  </a>`;

const shell = ({ preheader = "", headerHtml, eyebrow = "", title, bodyHtml, footerHtml }) => `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeEmailHtml(title)}</title>
  <style>
    @media only screen and (max-width:620px) {
      .tallyo-email-shell { width:100% !important; }
      .tallyo-email-pad { padding-left:20px !important; padding-right:20px !important; }
      .tallyo-email-title { font-size:27px !important; line-height:1.16 !important; }
      .tallyo-email-button { display:block !important; text-align:center !important; }
      .tallyo-email-scroll { overflow-x:auto !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;color:#111a31;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  ${hiddenPreheader(preheader)}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f1f5f9;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" class="tallyo-email-shell" width="640" cellspacing="0" cellpadding="0" border="0" style="width:640px;max-width:640px;background:#ffffff;border:1px solid #dbe3ef;border-radius:16px;overflow:hidden;box-shadow:0 14px 32px rgba(15,23,42,.08);">
        ${headerHtml}
        <tr><td class="tallyo-email-pad" style="padding:34px 38px 32px;">
          ${eyebrow ? `<p style="margin:0 0 9px;color:#4f46e5;font-size:12px;line-height:1.4;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">${escapeEmailHtml(eyebrow)}</p>` : ""}
          <h1 class="tallyo-email-title" style="margin:0 0 18px;color:#111a31;font-size:32px;line-height:1.15;font-weight:800;letter-spacing:-.02em;">${escapeEmailHtml(title)}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td class="tallyo-email-pad" style="padding:22px 38px;background:#f8fafc;border-top:1px solid #dbe3ef;">${footerHtml}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const tallyoEmailShell = ({
  title,
  eyebrow = "Tallyo",
  preheader = "",
  bodyHtml,
  footerNote = "This email was sent by Tallyo.",
}) => shell({
  title,
  eyebrow,
  preheader,
  bodyHtml,
  headerHtml: `<tr><td class="tallyo-email-pad" style="padding:18px 38px;border-bottom:1px solid #dbe3ef;background:#ffffff;">${tallyoBrand}</td></tr>`,
  footerHtml: `<p style="margin:0 0 8px;color:#526078;font-size:12px;line-height:1.55;">${escapeEmailHtml(footerNote)}</p><p style="margin:0;color:#64748b;font-size:12px;line-height:1.55;"><a href="https://tallyo.co.uk/" style="color:#4338ca;font-weight:700;text-decoration:none;">tallyo.co.uk</a> &nbsp;·&nbsp; <a href="mailto:main@tallyo.co.uk" style="color:#4338ca;text-decoration:none;">main@tallyo.co.uk</a></p>`,
});

export const businessEmailShell = ({
  businessName,
  brandColour,
  title,
  eyebrow = "From your business",
  preheader = "",
  bodyHtml,
}) => {
  const safeBusiness = escapeEmailHtml(businessName || "Your business");
  const colour = safeEmailColour(brandColour);
  return shell({
    title,
    eyebrow,
    preheader,
    bodyHtml,
    headerHtml: `<tr><td style="height:6px;line-height:6px;background:${colour};font-size:0;">&nbsp;</td></tr><tr><td class="tallyo-email-pad" style="padding:20px 38px;border-bottom:1px solid #dbe3ef;background:#ffffff;"><p style="margin:0;color:#111a31;font-size:21px;line-height:1.3;font-weight:800;">${safeBusiness}</p><p style="margin:4px 0 0;color:#64748b;font-size:12px;line-height:1.45;">Sent securely with Tallyo</p></td></tr>`,
    footerHtml: `<p style="margin:0 0 10px;color:#526078;font-size:12px;line-height:1.55;">Sent securely with Tallyo on behalf of ${safeBusiness}.</p><p style="margin:0;color:#64748b;font-size:12px;line-height:1.55;"><img src="${TALLYO_EMAIL_ASSET_ROOT}/tallyo-mark.png" width="18" height="18" alt="" style="display:inline-block;width:18px;height:18px;margin-right:6px;border:0;vertical-align:middle;"><a href="https://tallyo.co.uk/" style="color:#4338ca;font-weight:700;text-decoration:none;vertical-align:middle;">Tallyo</a></p>`,
  });
};

export const emailActionButton = (label, url, colour = "#4f46e5") => {
  const safeUrl = escapeEmailHtml(url);
  const safeLabel = escapeEmailHtml(label);
  const safeColour = safeEmailColour(colour);
  return `<p style="margin:24px 0;"><a class="tallyo-email-button" href="${safeUrl}" style="display:inline-block;padding:13px 20px;border-radius:9px;background:${safeColour};color:#ffffff;font-size:15px;line-height:1.2;font-weight:800;text-decoration:none;">${safeLabel}</a></p>`;
};

export const emailNotice = (html, tone = "neutral") => {
  const tones = {
    neutral: ["#f8fafc", "#dbe3ef", "#334155"],
    important: ["#fff7ed", "#fed7aa", "#9a3412"],
    positive: ["#ecfdf5", "#a7f3d0", "#047857"],
  };
  const [background, border, colour] = tones[tone] || tones.neutral;
  return `<div style="margin:22px 0;padding:16px 18px;border:1px solid ${border};border-radius:10px;background:${background};color:${colour};font-size:14px;line-height:1.55;">${html}</div>`;
};
