import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("playwright-core")); }

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const captureDir = path.join(repoRoot, "website", "public", "assets", "product", "growth-studio");
const outputDir = path.join(repoRoot, "website", "public", "assets", "social", "linkedin");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const creatives = [
  ["33-quote-accepted-to-invoice.png", "FROM YES TO INVOICE", "Keep accepted work moving", "Review the invoice Tallyo creates from an accepted quote, then send it when ready.", "accepted-quote-invoice.png"],
  ["34-income-insights.png", "INCOME INSIGHTS", "See the income Tallyo has recorded", "Review invoiced, received, outstanding and overdue amounts by period and currency.", "income-insights.png"],
  ["35-income-pack.png", "INCOME RECORDS, READY", "Prepare a clearer handover", "Download organised Tallyo income records when you choose to share them.", "income-pack.png"],
  ["36-document-layouts.png", "DOCUMENT LAYOUTS", "Choose the look that fits your business", "Compare four real document styles and preview your branding choices before saving.", "document-layouts.png"],
  ["37-review-before-sending.png", "A CLEAR SEND REVIEW", "Check the details before anything is sent", "Review the recipient and choose what should happen when a customer accepts the quote.", "quote-email-review.png"],
  ["38-google-sign-in.png", "A FASTER WAY BACK IN", "Sign in with Google", "Use the current Google sign-in option or continue with your Tallyo email and password.", "google-sign-in.png"],
  ["39-growth-studio-workflow.png", "BUILDING TALLYO IN PUBLIC", "Research. Draft. Review.", "Growth Studio keeps draft preparation and visual selection inside the Owner workspace.", "growth-studio.png"],
].map(([file, eyebrow, headline, supporting, screenshot]) => ({ file, eyebrow, headline, supporting, screenshot }));

const dataUrl = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  const mime = extension === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const wordmark = dataUrl(path.join(repoRoot, "website", "public", "assets", "tallyo-wordmark-white.png"));

function pageTemplate(creative) {
  const screenshot = dataUrl(path.join(captureDir, creative.screenshot));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{width:1200px;height:1200px;margin:0;overflow:hidden}body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;background:#f6f8fc;color:#111a34}.promo{position:relative;width:1200px;height:1200px;overflow:hidden}.hero{position:absolute;inset:0 0 auto;height:410px;padding:48px 64px 50px;color:#fff;background:linear-gradient(128deg,#0b1328 0%,#101c3d 66%,#3729c7 100%)}.hero:after{content:"";position:absolute;width:320px;height:320px;right:-150px;top:-115px;border-radius:50%;background:#5c4fff7a;border:1px solid #ffffff29}.wordmark{display:block;width:210px;height:auto;margin-bottom:34px}.site{position:absolute;top:50px;right:64px;z-index:2;padding:12px 20px;border:1px solid #ffffff47;border-radius:999px;color:#fff;font-size:18px;font-weight:650}.eyebrow{margin:0 0 14px;color:#8fe8ce;font-size:18px;line-height:1;letter-spacing:.14em;font-weight:800}.hero h1{margin:0;max-width:1030px;color:#fff;font-size:58px;line-height:1.03;letter-spacing:-.045em;font-weight:790}.supporting{margin:18px 0 0;max-width:980px;color:#dbe4f6;font-size:25px;line-height:1.35}.stage{position:absolute;inset:410px 0 0;background:radial-gradient(circle at 6% 86%,#8fe8ce57 0 120px,transparent 121px),radial-gradient(circle at 96% 24%,#5145f529 0 190px,transparent 191px),#f5f7fb}.frame{position:absolute;inset:44px 56px 54px;display:flex;align-items:center;justify-content:center;padding:24px;border:1px solid #dbe2ef;border-radius:30px;background:#fffffff7;box-shadow:0 24px 70px #0f172224;overflow:hidden}.frame img{display:block;width:100%;height:100%;object-fit:contain;border:1px solid #e0e6f0;border-radius:18px;background:#fff}
</style></head><body><main class="promo"><header class="hero"><img class="wordmark" src="${wordmark}" alt="Tallyo"><span class="site">tallyo.co.uk</span><p class="eyebrow">${escapeHtml(creative.eyebrow)}</p><h1>${escapeHtml(creative.headline)}</h1><p class="supporting">${escapeHtml(creative.supporting)}</p></header><section class="stage"><div class="frame"><img src="${screenshot}" alt=""></div></section></main></body></html>`;
}

fs.mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
try {
  for (const creative of creatives) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
    await page.setContent(pageTemplate(creative), { waitUntil: "load" });
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => image.decode()));
      if (document.fonts?.ready) await document.fonts.ready;
    });
    await page.screenshot({ path: path.join(outputDir, creative.file), type: "png" });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Rendered ${creatives.length} Growth Studio visuals from real Tallyo interface captures to ${outputDir}`);
