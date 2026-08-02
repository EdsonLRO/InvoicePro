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
const screenshotRoot = path.join(repoRoot, "website", "public", "assets", "App Screenshots");
const curatedOutputDir = path.join(here, "assets");
const libraryOutputDir = path.join(screenshotRoot, "LinkedIn Promos");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const campaigns = [
  {
    slug: "01-free-invoice-maker",
    curatedSlug: "01-free-invoice-maker",
    eyebrow: "FREE INVOICE MAKER",
    headline: "Create an invoice for free",
    supporting: "No account required. Preview and download your PDF in the browser.",
    screenshot: "Free Invoice Generator.png",
    fit: "landscape",
  },
  {
    slug: "02-dashboard-clarity",
    curatedSlug: "02-dashboard-clarity",
    eyebrow: "A CLEARER START TO THE DAY",
    headline: "Know what needs attention",
    supporting: "Outstanding, overdue and paid - at a glance.",
    screenshot: "Dashboard Card.png",
    fit: "wide",
  },
  {
    slug: "03-create-invoices",
    curatedSlug: "03-create-invoices",
    eyebrow: "PROFESSIONAL DOCUMENTS",
    headline: "Create invoices without starting over",
    supporting: "Saved details. Clear totals. Professional PDFs.",
    screenshot: "New Invoice Card.png",
    fit: "tall",
  },
  {
    slug: "04-saved-items",
    curatedSlug: "04-saved-items",
    eyebrow: "LESS REPEATED TYPING",
    headline: "Save it once. Reuse it next time.",
    supporting: "Keep commonly used products and services ready for the next invoice.",
    screenshot: "Manage Saved Items Card.png",
    fit: "wide",
  },
  {
    slug: "05-recurring-invoices",
    curatedSlug: "05-recurring-invoices",
    eyebrow: "REPEAT WORK, LESS ADMIN",
    headline: "Plan recurring invoices",
    supporting: "Choose the schedule and decide whether generated invoices are emailed.",
    screenshot: "Repeat this Invoice Card.png",
    fit: "standard",
  },
  {
    slug: "06-optional-online-payments",
    curatedSlug: "06-optional-online-payments",
    eyebrow: "PAYMENT OPTIONS YOU CONTROL",
    headline: "Offer card payment when it suits the invoice",
    supporting: "Request the full balance or a predefined deposit. Stripe fees may apply.",
    screenshot: "Payment Card Full Amount.png",
    fit: "tall",
  },
  {
    slug: "07-manage-customers",
    eyebrow: "CUSTOMER DETAILS, READY",
    headline: "Save customer details for next time",
    supporting: "Keep repeat customer information organised and ready for the next document.",
    screenshot: "Manage Customers Card.png",
    fit: "wide",
  },
  {
    slug: "08-edit-customer",
    eyebrow: "KEEP RECORDS CURRENT",
    headline: "Update customer details in one place",
    supporting: "Edit the contact information used across future invoices and quotes.",
    screenshot: "Edit Customer Card.png",
    fit: "standard",
  },
  {
    slug: "09-my-invoices",
    eyebrow: "EVERY DOCUMENT, ONE VIEW",
    headline: "See invoice status without the guesswork",
    supporting: "Filter invoices, quotes and credit notes and see what is due, paid or overdue.",
    screenshot: "My Invoices Card.png",
    fit: "landscape",
  },
  {
    slug: "10-bulk-invoice-actions",
    eyebrow: "LESS REPETITIVE ADMIN",
    headline: "Handle several documents together",
    supporting: "Select multiple records when you need to duplicate, email, export or delete them.",
    screenshot: "My Invoices Card - Bulk Options.png",
    fit: "landscape",
  },
  {
    slug: "11-activity-history",
    eyebrow: "A CLEAR RECORD",
    headline: "Understand what happened",
    supporting: "Email, payment, refund and document activity stays attached to the relevant record.",
    screenshot: "Activity History Card.png",
    fit: "wide",
  },
  {
    slug: "12-predefined-deposits",
    eyebrow: "FLEXIBLE PAYMENT REQUESTS",
    headline: "Offer a predefined deposit",
    supporting: "Choose the deposit amount before sending and keep the remaining balance visible.",
    screenshot: "Payment Card Deposit.png",
    fit: "tall",
  },
  {
    slug: "13-recurring-schedules",
    eyebrow: "RECURRING WORK, ORGANISED",
    headline: "Manage recurring schedules together",
    supporting: "See the next invoice date, email choice and schedule status in one place.",
    screenshot: "Recurring Invoices Card.png",
    fit: "wide",
  },
  {
    slug: "14-edit-recurring-schedule",
    eyebrow: "STAY IN CONTROL",
    headline: "Change a recurring schedule when needed",
    supporting: "Adjust timing, email delivery or the next run without rebuilding the invoice.",
    screenshot: "Edit Recurring Schedule Card.png",
    fit: "standard",
  },
  {
    slug: "15-recurring-history",
    eyebrow: "SEE WHAT WAS CREATED",
    headline: "Review recurring invoice history",
    supporting: "Keep each generated invoice and schedule result easy to trace.",
    screenshot: "Recurring Schedule History Card.png",
    fit: "wide",
  },
  {
    slug: "16-automatic-reminders",
    eyebrow: "FOLLOW UP BY CHOICE",
    headline: "Set automatic overdue reminders",
    supporting: "Choose when reminders start, how often they repeat and when they stop.",
    screenshot: "Automatic Reminders Card.png",
    fit: "wide",
  },
  {
    slug: "17-branding",
    eyebrow: "YOUR BUSINESS, YOUR LOOK",
    headline: "Keep invoices recognisably yours",
    supporting: "Choose a brand colour and logo position, then preview the result before saving.",
    screenshot: "Branding Card.png",
    fit: "landscape",
  },
  {
    slug: "18-company-settings",
    eyebrow: "BUSINESS DETAILS, READY",
    headline: "Keep company details in one place",
    supporting: "Save the information and logo you use across customer documents.",
    screenshot: "Company Settings Card.png",
    fit: "standard",
  },
  {
    slug: "19-company-defaults",
    eyebrow: "SET IT ONCE",
    headline: "Start each invoice with sensible defaults",
    supporting: "Choose common currency, tax, payment terms and document settings for faster setup.",
    screenshot: "Company Settings  Defaults Card.png",
    fit: "standard",
  },
  {
    slug: "20-subscription-and-payments",
    eyebrow: "ACCOUNT CONTROLS",
    headline: "Manage your plan and card-payment setup",
    supporting: "See subscription access and connected Stripe payment readiness from your account.",
    screenshot: "Account Card.png",
    fit: "landscape",
  },
  {
    slug: "21-account-security",
    eyebrow: "ACCOUNT SECURITY",
    headline: "Choose stronger sign-in protection",
    supporting: "Manage your password, authenticator app and account recovery controls.",
    screenshot: "Change Password-Two Factor Authentication Card.png",
    fit: "standard",
  },
  {
    slug: "22-data-and-sessions",
    eyebrow: "YOUR DATA, YOUR SESSIONS",
    headline: "Export account data and manage sign-outs",
    supporting: "Download your records or sign out this device or every signed-in device.",
    screenshot: "Data Export-Sign Out Card.png",
    fit: "standard",
  },
  {
    slug: "23-simple-pricing",
    eyebrow: "STRAIGHTFORWARD PRICING",
    headline: "Choose monthly or annual Tallyo Pro",
    supporting: "£8 monthly or £80 annually, with the core invoicing tools in one plan.",
    screenshot: "Subscription Prices.png",
    fit: "landscape",
  },
  {
    slug: "24-install-tallyo",
    eyebrow: "TALLYO ON YOUR DEVICE",
    headline: "Install Tallyo from your browser",
    supporting: "Add the app to supported desktop and mobile devices for quicker access.",
    screenshot: "Tallyo App Installation Icon Search Bar.png",
    fit: "wide",
  },
  {
    slug: "25-tallyo-helper",
    eyebrow: "QUESTIONS, ANSWERED",
    headline: "Get quick answers about Tallyo",
    supporting: "Use the public Helper for straightforward product and feature guidance.",
    screenshot: "Tallyo Helper.png",
    fit: "landscape",
  },
  {
    slug: "26-invoice-list-actions",
    eyebrow: "WORK IN BATCHES",
    headline: "Keep busy invoice lists manageable",
    supporting: "Select the records you need and take the next action without losing context.",
    screenshot: "Screenshot 2026-08-01 132337.png",
    fit: "landscape",
  },
  {
    slug: "27-invoice-without-the-admin-session",
    eyebrow: "WHEN THE WORK IS ALREADY DONE",
    headline: "The invoice should not be the difficult part",
    supporting: "Bring the customer, line items, tax and total together before you send.",
    screenshot: "New Invoice Card.png",
    fit: "tall",
  },
  {
    slug: "28-repeat-customer-less-retyping",
    eyebrow: "FOR THE CUSTOMERS WHO COME BACK",
    headline: "The next invoice can start with what you already know",
    supporting: "Keep familiar customer details ready instead of typing them again.",
    screenshot: "Manage Customers Card.png",
    fit: "wide",
  },
  {
    slug: "29-let-the-schedule-remember",
    eyebrow: "WHEN THE WORK REPEATS",
    headline: "Put the next invoice on the schedule",
    supporting: "Set the timing once, then review, change or pause it whenever needed.",
    screenshot: "Recurring Invoices Card.png",
    fit: "wide",
  },
  {
    slug: "30-overdue-with-context",
    eyebrow: "WHEN PAYMENT IS LATE",
    headline: "Follow up without rebuilding the context",
    supporting: "Choose if and when reminders are sent, while the invoice history stays together.",
    screenshot: "Automatic Reminders Card.png",
    fit: "wide",
  },
  {
    slug: "31-deposit-and-balance",
    eyebrow: "WHEN A JOB NEEDS A DEPOSIT",
    headline: "Ask for a deposit without losing sight of the balance",
    supporting: "Set the amount before sending and keep the remaining balance visible.",
    screenshot: "Payment Card Deposit.png",
    fit: "tall",
  },
  {
    slug: "32-after-the-invoice-is-sent",
    eyebrow: "AFTER THE INVOICE IS SENT",
    headline: "Keep the invoice story in one place",
    supporting: "Email, payment, refund and document activity stays with the relevant record.",
    screenshot: "Activity History Card.png",
    fit: "wide",
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

function template(campaign) {
  const screenshot = dataUrl(path.join(screenshotRoot, campaign.screenshot));
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; }
        html, body { width: 1200px; height: 1200px; margin: 0; overflow: hidden; }
        body {
          font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f5f7fb;
          color: #0f172a;
        }
        .promo { position: relative; width: 1200px; height: 1200px; overflow: hidden; }
        .hero {
          position: absolute; inset: 0 0 auto 0; height: 410px;
          padding: 48px 64px 50px;
          background: linear-gradient(128deg, #0b1328 0%, #101c3d 66%, #3729c7 100%);
          color: #fff;
        }
        .hero::after {
          content: ""; position: absolute; width: 320px; height: 320px; right: -150px; top: -115px;
          border-radius: 50%; background: rgba(92, 79, 255, .48); border: 1px solid rgba(255,255,255,.16);
        }
        .brand { width: 210px; height: auto; display: block; margin-bottom: 34px; }
        .site {
          position: absolute; top: 50px; right: 64px; z-index: 2;
          padding: 12px 20px; border: 1px solid rgba(255,255,255,.28); border-radius: 999px;
          font-size: 18px; font-weight: 650; color: #fff;
        }
        .eyebrow { margin: 0 0 14px; font-size: 18px; line-height: 1; letter-spacing: .14em; font-weight: 800; color: #8fe8ce; }
        h1 { margin: 0; max-width: 1030px; font-size: 58px; line-height: 1.03; letter-spacing: -.045em; font-weight: 790; }
        .supporting { margin: 18px 0 0; max-width: 980px; font-size: 25px; line-height: 1.35; color: #dbe4f6; }
        .stage {
          position: absolute; left: 0; right: 0; top: 410px; bottom: 0;
          background:
            radial-gradient(circle at 6% 86%, rgba(143,232,206,.34) 0 120px, transparent 121px),
            radial-gradient(circle at 96% 24%, rgba(81,69,245,.16) 0 190px, transparent 191px),
            #f5f7fb;
        }
        .frame {
          position: absolute; left: 56px; right: 56px; top: 44px; bottom: 54px;
          display: flex; align-items: center; justify-content: center;
          padding: 24px; border: 1px solid #dbe2ef; border-radius: 30px;
          background: rgba(255,255,255,.97);
          box-shadow: 0 24px 70px rgba(15,23,42,.14);
          overflow: hidden;
        }
        .frame img {
          display: block; width: 100%; height: 100%; object-fit: contain;
          border: 1px solid #e0e6f0; border-radius: 18px; background: #fff;
        }
        .frame.wide { top: 122px; bottom: 148px; }
        .frame.wide img { height: auto; max-height: 100%; }
        .frame.landscape { top: 50px; bottom: 58px; }
        .frame.standard { top: 82px; bottom: 88px; }
        .frame.tall { top: 30px; bottom: 34px; }
      </style>
    </head>
    <body>
      <main class="promo">
        <header class="hero">
          <img class="brand" src="${logo}" alt="Tallyo">
          <span class="site">tallyo.co.uk</span>
          <p class="eyebrow">${escapeHtml(campaign.eyebrow)}</p>
          <h1>${escapeHtml(campaign.headline)}</h1>
          <p class="supporting">${escapeHtml(campaign.supporting)}</p>
        </header>
        <section class="stage">
          <div class="frame ${escapeHtml(campaign.fit)}">
            <img src="${screenshot}" alt="">
          </div>
        </section>
      </main>
    </body>
  </html>`;
}

fs.mkdirSync(curatedOutputDir, { recursive: true });
fs.mkdirSync(libraryOutputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
try {
  for (const campaign of campaigns) {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 1200 },
      deviceScaleFactor: 1,
    });
    await page.setContent(template(campaign), { waitUntil: "load" });
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].map((image) =>
          image.complete
            ? image.decode()
            : new Promise((resolve) => image.addEventListener("load", resolve, { once: true })),
        ),
      );
      window.scrollTo(0, 0);
    });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: path.join(libraryOutputDir, `${campaign.slug}.png`),
      type: "png",
      clip: { x: 0, y: 0, width: 1200, height: 1200 },
    });
    if (campaign.curatedSlug) {
      fs.copyFileSync(
        path.join(libraryOutputDir, `${campaign.slug}.png`),
        path.join(curatedOutputDir, `${campaign.curatedSlug}.png`),
      );
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Rendered ${campaigns.length} LinkedIn campaign assets to ${libraryOutputDir}`);
