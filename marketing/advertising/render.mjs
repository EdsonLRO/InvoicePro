import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("playwright-core"));
}

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const productRoot = path.join(repoRoot, "website", "public", "assets", "product");
const screenshotRoot = path.join(repoRoot, "website", "public", "assets", "App Screenshots");
const outputDir = path.join(here, "assets");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const campaigns = [
  {
    slug: "01-free-invoice-maker",
    eyebrow: "NO SIGN-UP. NO CARD.",
    headline: "Create one invoice free",
    supporting: "Add the details, check the preview and download a clear PDF in your browser.",
    screenshot: path.join(screenshotRoot, "Free Invoice Generator.png"),
    crop: "free-maker",
  },
  {
    slug: "02-finished-invoice",
    eyebrow: "CLEAR FROM THE FIRST LOOK",
    headline: "Send an invoice you feel good about",
    supporting: "Keep the customer, dates, items and amount easy to understand before you send it.",
    screenshot: path.join(productRoot, "tallyo-invoice-editor.jpg"),
    crop: "desktop",
  },
  {
    slug: "03-quote-01-send",
    eyebrow: "1 OF 5 · SEND THE QUOTE",
    headline: "Give your customer a clear choice",
    supporting: "Share the work and price so they can review everything before saying yes.",
    custom: "quote-send",
  },
  {
    slug: "04-quote-02-accepted",
    eyebrow: "2 OF 5 · QUOTE ACCEPTED",
    headline: "Your customer can accept from their phone",
    supporting: "The accepted quote stays saved, together with who accepted it and when.",
    screenshot: path.join(productRoot, "tallyo-mobile-quote.jpg"),
    crop: "phone",
  },
  {
    slug: "05-quote-03-invoice-created",
    eyebrow: "3 OF 5 · INVOICE CREATED",
    headline: "The next step is already connected",
    supporting: "Tallyo keeps the quote and creates one linked invoice. If you chose automatic sending earlier, the invoice is emailed too.",
    screenshot: path.join(productRoot, "tallyo-quote-editor.jpg"),
    crop: "quote-link",
  },
  {
    slug: "06-quote-04-payment-tracked",
    eyebrow: "4 OF 5 · PAYMENT TRACKED",
    headline: "See what has been paid and what is left",
    supporting: "Record a deposit or the full payment without losing sight of the remaining amount.",
    screenshot: path.join(productRoot, "tallyo-payments.jpg"),
    crop: "payment",
  },
  {
    slug: "07-quote-05-follow-up",
    eyebrow: "5 OF 5 · FOLLOW-UP STAYS CLEAR",
    headline: "The full story stays with the invoice",
    supporting: "Emails, reminders and payments stay together, so you can quickly see what happened.",
    screenshot: path.join(productRoot, "tallyo-activity.jpg"),
    crop: "activity",
  },
  {
    slug: "08-recurring-setup",
    eyebrow: "REGULAR WORK, ALREADY PLANNED",
    headline: "Let the next invoice remember itself",
    supporting: "Choose how often it repeats and whether each new invoice is sent or left for you to review.",
    custom: "recurring-setup",
  },
  {
    slug: "09-recurring-overview",
    eyebrow: "EVERY SCHEDULE, ONE VIEW",
    headline: "See what is coming next",
    supporting: "Check what is active, when the next invoice is due and which ones will be sent automatically.",
    screenshot: path.join(productRoot, "tallyo-recurring.jpg"),
    crop: "desktop",
  },
  {
    slug: "10-dashboard-clarity",
    eyebrow: "YOUR DAY, AT A GLANCE",
    headline: "Know what needs your attention",
    supporting: "See money still to come in, late invoices, recent payments and regular work in one place.",
    screenshot: path.join(productRoot, "tallyo-dashboard.jpg"),
    crop: "dashboard",
  },
  {
    slug: "11-deposits-and-balances",
    eyebrow: "PART-PAYMENTS MADE CLEAR",
    headline: "Keep the deposit and balance together",
    supporting: "Record each payment as it arrives and always see what your customer still needs to pay.",
    screenshot: path.join(productRoot, "tallyo-payments.jpg"),
    crop: "payment",
  },
  {
    slug: "12-overdue-reminders",
    eyebrow: "A FRIENDLY NUDGE, ON TIME",
    headline: "Follow up when payment is late",
    supporting: "Choose when reminders begin and let Tallyo keep the overdue invoice easy to find.",
    screenshot: path.join(productRoot, "tallyo-overdue.jpg"),
    crop: "desktop",
  },
  {
    slug: "13-seven-day-trial",
    eyebrow: "TRY TALLYO PRO FOR 7 DAYS",
    headline: "Explore every feature before paying",
    supporting: "A card is required. We remind you 3 days before the trial ends, then it continues at £8 a month unless you cancel.",
    custom: "trial",
  },
  {
    slug: "14-cancel-online",
    eyebrow: "STAY IN CONTROL",
    headline: "Cancel online whenever you need to",
    supporting: "Cancel during the trial and you keep access until it ends. You will not be charged.",
    custom: "cancel",
  },
];

function dataUrl(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mime = extension === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const logo = dataUrl(path.join(repoRoot, "website", "public", "assets", "tallyo-wordmark-white.png"));

function recurringSetup() {
  return `<div class="product-mock recurring-mock">
    <div class="mock-nav"><span class="mock-brand"><img src="${logo}" alt="Tallyo"></span><strong>Edit invoice</strong><span>Account ↗</span></div>
    <div class="mock-body">
      <div class="mock-sidebar"><strong>North &amp; Stone</strong><span>Overview</span><span>Invoices</span><span>Customers</span><span class="active">Recurring</span><span>Reminders</span></div>
      <div class="mock-content">
        <p class="mock-kicker">AUTOMATION</p><h3>Repeat this invoice</h3>
        <p class="mock-lead">Set the timing once. You can change or pause it whenever the work changes.</p>
        <div class="mock-grid">
          <label>How often?<strong>Monthly</strong></label>
          <label>First invoice<strong>1 October 2026</strong></label>
          <label>When should it end?<strong>No end date</strong></label>
        </div>
        <div class="choice selected"><span>✓</span><div><strong>Send each invoice automatically</strong><small>Email it when the schedule creates it.</small></div></div>
        <div class="choice"><span></span><div><strong>Leave each invoice for me to review</strong><small>Save it as a draft until I am ready.</small></div></div>
        <button>Save recurring schedule</button>
      </div>
    </div>
  </div>`;
}

function quoteSend() {
  return `<div class="product-mock quote-send-mock">
    <div class="mock-nav"><span class="mock-brand"><img src="${logo}" alt="Tallyo"></span><strong>Review &amp; send quote</strong><span>Account ↗</span></div>
    <div class="quote-send-body">
      <div class="quote-preview">
        <p class="mock-kicker">QUOTE</p><h3>Quote QUO-0217</h3>
        <div class="quote-parties"><span><small>FROM</small><strong>North &amp; Stone</strong></span><span><small>TO</small><strong>Willow &amp; Pine Studio</strong></span></div>
        <div class="quote-line"><span>Bathroom preparation</span><strong>£1,800.00</strong></div>
        <div class="quote-line"><span>Installation and finishing</span><strong>£5,000.00</strong></div>
        <div class="quote-total"><span>Total</span><strong>£6,800.00</strong></div>
      </div>
      <div class="send-panel">
        <p class="mock-kicker">EMAIL THE QUOTE</p><h3>Ready for your customer</h3>
        <label class="send-field">Send to<strong>sarah@willowandpine.example</strong></label>
        <label class="send-field">Message<strong>Here is the quote we discussed. You can review and accept it online.</strong></label>
        <div class="send-choice selected"><span>✓</span><div><strong>Let the customer accept online</strong><small>The email includes a link for their answer.</small></div></div>
        <div class="send-choice selected"><span>✓</span><div><strong>Automatically send the invoice when accepted</strong><small>Or leave this off and review the invoice yourself.</small></div></div>
        <button>Send quote</button>
      </div>
    </div>
  </div>`;
}

function trialCard() {
  return `<div class="product-mock account-mock">
    <div class="mock-nav"><span class="mock-brand"><img src="${logo}" alt="Tallyo"></span><strong>Account</strong><span>+ New</span></div>
    <div class="account-shell">
      <p class="mock-kicker">YOUR ACCOUNT</p>
      <div class="account-title"><div><h3>Tallyo Subscription</h3><p>Try every Tallyo Pro feature free for 7 days.</p></div><span class="status green">Free trial</span></div>
      <div class="account-grid"><div><small>PLAN</small><strong>Tallyo Pro · Monthly</strong></div><div><small>ACCESS</small><strong>Every feature included</strong></div><div><small>AFTER THE TRIAL</small><strong>£8 a month</strong></div></div>
      <div class="notice">Your trial ends on 3 October. We will email you 3 days before. Cancel online before it ends and you will not be charged.</div>
      <div class="account-actions"><button>Manage subscription</button><span>Card required to begin</span></div>
    </div>
  </div>`;
}

function cancelCard() {
  return `<div class="product-mock cancel-mock">
    <div class="portal-side"><span class="mock-brand portal-brand"><img src="${logo}" alt="Tallyo"></span><h3>Manage your Tallyo subscription.</h3><span>← Return to Tallyo</span></div>
    <div class="portal-main"><p class="mock-kicker">CURRENT SUBSCRIPTION</p><span class="status amber">Free trial ends 3 Oct</span><h3>Tallyo Pro</h3><h4>£8.00 per month</h4><p>After your free trial ends, your subscription continues automatically unless you cancel.</p><button>Cancel subscription</button><small>You can cancel online before the trial ends.</small></div>
  </div>`;
}

function customMarkup(type) {
  if (type === "quote-send") return quoteSend();
  if (type === "recurring-setup") return recurringSetup();
  if (type === "trial") return trialCard();
  if (type === "cancel") return cancelCard();
  throw new Error(`Unknown custom creative: ${type}`);
}

function template(campaign) {
  const visual = campaign.custom
    ? customMarkup(campaign.custom)
    : `<img class="product-shot ${escapeHtml(campaign.crop)}" src="${dataUrl(campaign.screenshot)}" alt="">`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    html, body { width: 1200px; height: 1200px; margin: 0; overflow: hidden; }
    body { font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111a34; background: #f7f8fc; }
    .promo { position: relative; width: 1200px; height: 1200px; overflow: hidden; }
    .hero { position: absolute; inset: 0 0 auto; height: 430px; padding: 52px 64px 48px; color: white; background: linear-gradient(132deg, #0b142a 0%, #152452 58%, #5145f5 100%); overflow: hidden; }
    .hero::before { content: ""; position: absolute; width: 420px; height: 420px; right: -170px; top: -210px; border-radius: 50%; background: rgba(127, 108, 255, .38); border: 1px solid rgba(255,255,255,.18); }
    .hero::after { content: ""; position: absolute; width: 170px; height: 170px; right: 150px; bottom: -105px; border-radius: 50%; background: rgba(115, 229, 200, .18); }
    .brand { width: 188px; height: auto; display: block; margin-bottom: 34px; position: relative; z-index: 1; }
    .site { position: absolute; top: 54px; right: 64px; z-index: 2; padding: 11px 19px; border: 1px solid rgba(255,255,255,.35); border-radius: 999px; font-size: 18px; font-weight: 700; }
    .eyebrow { position: relative; z-index: 1; margin: 0 0 13px; color: #94efd3; font-size: 17px; line-height: 1; letter-spacing: .15em; font-weight: 850; }
    h1 { position: relative; z-index: 1; margin: 0; max-width: 1050px; font-size: 56px; line-height: 1.03; letter-spacing: -.045em; font-weight: 790; }
    .supporting { position: relative; z-index: 1; margin: 17px 0 0; max-width: 1060px; color: #e1e8f7; font-size: 23px; line-height: 1.34; font-weight: 440; }
    .stage { position: absolute; inset: 430px 0 0; background: radial-gradient(circle at 4% 91%, rgba(121,227,199,.35) 0 112px, transparent 113px), radial-gradient(circle at 97% 17%, rgba(81,69,245,.14) 0 175px, transparent 176px), #f7f8fc; }
    .frame { position: absolute; left: 54px; right: 54px; top: 48px; bottom: 52px; padding: 19px; display: flex; align-items: center; justify-content: center; border: 1px solid #dbe2ee; border-radius: 30px; background: rgba(255,255,255,.98); box-shadow: 0 25px 65px rgba(15,23,42,.14); overflow: hidden; }
    .product-shot { display: block; width: 100%; height: 100%; border: 1px solid #e1e6ef; border-radius: 17px; background: white; object-fit: cover; object-position: center; }
    .product-shot.desktop { object-position: center top; }
    .product-shot.dashboard { object-position: 46% top; }
    .product-shot.payment { object-position: 43% center; }
    .product-shot.activity { object-position: 43% center; }
    .product-shot.quote-link { object-position: 52% top; }
    .product-shot.free-maker { object-fit: fill; transform: scaleY(1.18) translateY(-34px); transform-origin: center; }
    .product-shot.phone { width: 420px; height: 100%; object-fit: cover; object-position: center 58%; border-radius: 30px; box-shadow: 0 10px 30px rgba(15,23,42,.12); }
    .product-mock { width: 100%; height: 100%; border: 1px solid #dce3ef; border-radius: 18px; background: #f6f8fb; overflow: hidden; color: #15213a; }
    .mock-nav { height: 62px; padding: 0 28px; display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; background: white; border-bottom: 1px solid #dfe5ee; font-size: 15px; }
    .mock-nav > :last-child { justify-self: end; }
    .mock-brand { width: 116px; height: 40px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: #111a31; }
    .mock-brand img { display: block; width: 92px; height: auto; }
    .mock-body { height: calc(100% - 62px); display: grid; grid-template-columns: 180px 1fr; }
    .mock-sidebar { display: flex; flex-direction: column; gap: 20px; padding: 30px 22px; color: #dce4f5; background: #111a31; font-size: 14px; }
    .mock-sidebar strong { margin-bottom: 14px; color: white; }
    .mock-sidebar .active { padding: 11px 13px; margin: -11px -13px; border-left: 3px solid #8375ff; border-radius: 8px; background: #2e385e; color: white; font-weight: 700; }
    .mock-content { padding: 30px 38px; background: #f7f9fc; }
    .mock-kicker { margin: 0 0 8px; color: #5b6790; font-size: 12px; letter-spacing: .13em; font-weight: 850; }
    .mock-content h3, .account-title h3, .portal-main h3 { margin: 0; font-size: 28px; }
    .mock-lead { margin: 9px 0 22px; color: #66728d; }
    .mock-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    .mock-grid label { padding: 13px 15px; border: 1px solid #d8dfeb; border-radius: 11px; background: white; color: #64708a; font-size: 12px; }
    .mock-grid strong { display: block; margin-top: 7px; color: #19233a; font-size: 15px; }
    .choice { margin-top: 13px; padding: 14px 16px; display: flex; gap: 13px; align-items: center; border: 1px solid #d8dfeb; border-radius: 11px; background: white; }
    .choice > span { width: 24px; height: 24px; display: grid; place-items: center; border: 2px solid #ccd4e2; border-radius: 50%; }
    .choice.selected { border-color: #7569f7; background: #f4f2ff; }
    .choice.selected > span { color: white; border-color: #5549e8; background: #5549e8; }
    .choice strong, .choice small { display: block; }
    .choice small { margin-top: 3px; color: #6a7590; }
    .mock-content button, .account-actions button, .portal-main button { margin-top: 16px; padding: 13px 20px; border: 0; border-radius: 10px; color: white; background: #5145e8; font-weight: 750; font-size: 14px; }
    .account-shell { padding: 42px 55px; }
    .quote-send-body { height: calc(100% - 62px); display: grid; grid-template-columns: 46% 54%; background: #f3f6fa; }
    .quote-preview { margin: 25px 14px 25px 25px; padding: 30px; border: 1px solid #dce3ed; border-radius: 14px; background: white; }
    .quote-preview h3, .send-panel h3 { margin: 0 0 20px; font-size: 25px; }
    .quote-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 17px 0; border-top: 2px solid #172139; border-bottom: 1px solid #dfe5ee; }
    .quote-parties small, .quote-parties strong { display: block; }
    .quote-parties small { margin-bottom: 6px; color: #72809a; font-size: 10px; font-weight: 850; letter-spacing: .12em; }
    .quote-line, .quote-total { display: flex; justify-content: space-between; gap: 20px; padding: 16px 0; border-bottom: 1px solid #e2e7ef; font-size: 13px; }
    .quote-total { margin-top: 10px; border-bottom: 2px solid #172139; font-size: 17px; }
    .send-panel { margin: 25px 25px 25px 14px; padding: 30px; border: 1px solid #dce3ed; border-radius: 14px; background: white; }
    .send-field { display: block; margin-bottom: 12px; padding: 12px 14px; border: 1px solid #dce3ed; border-radius: 10px; color: #6c7790; font-size: 11px; }
    .send-field strong { display: block; margin-top: 5px; color: #1a243c; font-size: 13px; line-height: 1.3; }
    .send-choice { margin-top: 11px; padding: 12px 13px; display: flex; gap: 11px; border: 1px solid #dce3ed; border-radius: 10px; }
    .send-choice > span { flex: 0 0 auto; width: 21px; height: 21px; display: grid; place-items: center; border-radius: 6px; color: white; background: #5145e8; font-size: 12px; }
    .send-choice strong, .send-choice small { display: block; }
    .send-choice strong { font-size: 13px; }
    .send-choice small { margin-top: 3px; color: #6c7790; font-size: 11px; }
    .send-panel button { width: 100%; margin-top: 15px; padding: 13px; border: 0; border-radius: 9px; color: white; background: #5145e8; font-weight: 800; }
    .account-title { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 22px; border-bottom: 1px solid #dce2eb; }
    .account-title p { margin: 8px 0 0; color: #66728d; }
    .status { display: inline-flex; padding: 7px 12px; border-radius: 999px; font-size: 13px; font-weight: 750; }
    .status.green { color: #086f4a; background: #d8f7e8; }
    .status.amber { color: #9a5700; background: #fff0c7; }
    .account-grid { margin: 24px 0 18px; display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
    .account-grid > div { padding: 18px; border: 1px solid #dce2eb; border-radius: 12px; background: white; }
    .account-grid small, .account-grid strong { display: block; }
    .account-grid small { margin-bottom: 8px; color: #65718b; font-weight: 800; }
    .notice { padding: 18px 20px; border: 1px solid #d7dcff; border-radius: 12px; color: #34417a; background: #eef0ff; line-height: 1.45; }
    .account-actions { display: flex; align-items: center; gap: 20px; }
    .account-actions span { margin-top: 16px; color: #69758e; font-size: 13px; }
    .cancel-mock { display: grid; grid-template-columns: 36% 64%; background: white; }
    .portal-side { padding: 48px 36px; background: #f1f3f6; }
    .portal-brand { width: 132px; height: 46px; }
    .portal-brand img { width: 104px; }
    .portal-side h3 { margin: 90px 0 36px; max-width: 240px; font-size: 28px; line-height: 1.28; }
    .portal-side > span:last-child { color: #49546b; font-weight: 700; }
    .portal-main { padding: 55px 64px; }
    .portal-main .status { margin: 16px 0 18px; }
    .portal-main h4 { margin: 12px 0; font-size: 30px; }
    .portal-main > p:not(.mock-kicker) { max-width: 560px; color: #59657d; font-size: 17px; line-height: 1.5; }
    .portal-main button { width: 100%; margin-top: 28px; background: #1678d2; font-size: 16px; }
    .portal-main small { display: block; margin-top: 14px; color: #69758e; text-align: center; }
  </style></head><body><main class="promo"><header class="hero"><img class="brand" src="${logo}" alt="Tallyo"><span class="site">tallyo.co.uk</span><p class="eyebrow">${escapeHtml(campaign.eyebrow)}</p><h1>${escapeHtml(campaign.headline)}</h1><p class="supporting">${escapeHtml(campaign.supporting)}</p></header><section class="stage"><div class="frame">${visual}</div></section></main></body></html>`;
}

fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
try {
  for (const campaign of campaigns) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
    await page.setContent(template(campaign), { waitUntil: "load" });
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => image.complete ? image.decode() : new Promise((resolve) => image.addEventListener("load", resolve, { once: true }))));
      if (document.fonts?.ready) await document.fonts.ready;
    });
    await page.screenshot({ path: path.join(outputDir, `${campaign.slug}.png`), type: "png", clip: { x: 0, y: 0, width: 1200, height: 1200 } });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Rendered ${campaigns.length} advertising creatives to ${outputDir}`);
