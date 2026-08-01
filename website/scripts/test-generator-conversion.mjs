import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import {
  buildOverviewRequest,
  createPreparedDownloadController,
  MARKETING_OVERVIEW_CONSENT_VERSION,
  MARKETING_OVERVIEW_SOURCE
} from "../src/marketing-overview.mjs";
import {
  buildOverviewEmail,
  CONSENT_WORDING,
  OVERVIEW_EMAIL_IMAGES,
  validateOverviewBody
} from "../../supabase/functions/_shared/marketing-overview.mjs";

const root = resolve(import.meta.dirname, "../..");
const read = (path) => readFileSync(join(root, path), "utf8");
const configUrl = pathToFileURL(join(root, "website/src/config.mjs")).href;
const pagesUrl = pathToFileURL(join(root, "website/src/pages.mjs")).href;
const cleanMarketingEnv = {
  ...process.env,
  TALLYO_SITE_MODE: "preview",
  TALLYO_MARKETING_OVERVIEW_ENABLED: "true",
  TALLYO_MARKETING_OVERVIEW_ENDPOINT: "",
  TALLYO_MARKETING_OVERVIEW_PRIVATE_PREVIEW_APPROVED: "",
  TALLYO_MARKETING_OVERVIEW_PUBLIC_RELEASE_APPROVED: ""
};
const configProbe = (env, expression = `await import(${JSON.stringify(configUrl)})`) => spawnSync(
  process.execPath,
  ["--input-type=module", "--eval", expression],
  { encoding: "utf8", env }
);

const missingEndpoint = configProbe({ ...cleanMarketingEnv, TALLYO_MARKETING_OVERVIEW_PRIVATE_PREVIEW_APPROVED: "true" });
assert.notEqual(missingEndpoint.status, 0);
assert.match(missingEndpoint.stderr, /valid marketing overview endpoint is required/);
const missingApproval = configProbe({ ...cleanMarketingEnv, TALLYO_MARKETING_OVERVIEW_ENDPOINT: "https://example.supabase.co/functions/v1/send-marketing-overview" });
assert.notEqual(missingApproval.status, 0);
assert.match(missingApproval.stderr, /preview build blocked/);
const missingProductionApproval = configProbe({
  ...cleanMarketingEnv,
  TALLYO_SITE_MODE: "production",
  TALLYO_MARKETING_OVERVIEW_ENDPOINT: "https://example.supabase.co/functions/v1/send-marketing-overview",
  TALLYO_MARKETING_OVERVIEW_PUBLIC_RELEASE_APPROVED: "false"
});
assert.notEqual(missingProductionApproval.status, 0);
assert.match(missingProductionApproval.stderr, /production build blocked/);
const releasedProductionMarkup = configProbe(
  {
    ...cleanMarketingEnv,
    TALLYO_SITE_MODE: "production",
    TALLYO_MARKETING_OVERVIEW_ENABLED: "",
    TALLYO_MARKETING_OVERVIEW_ENDPOINT: "",
    TALLYO_MARKETING_OVERVIEW_PUBLIC_RELEASE_APPROVED: ""
  },
  `const { pages } = await import(${JSON.stringify(`${pagesUrl}?production-release-test`)}); const page = pages.find((item) => item.route === "/free-invoice-generator/"); console.log(page.content.includes("data-overview-form"));`
);
assert.equal(releasedProductionMarkup.status, 0);
assert.equal(releasedProductionMarkup.stdout.trim(), "true", "approved production release includes the one-email form");
const enabledMarkup = configProbe(
  {
    ...cleanMarketingEnv,
    TALLYO_MARKETING_OVERVIEW_ENDPOINT: "https://example.supabase.co/functions/v1/send-marketing-overview",
    TALLYO_MARKETING_OVERVIEW_PRIVATE_PREVIEW_APPROVED: "true"
  },
  `const { pages } = await import(${JSON.stringify(`${pagesUrl}?enabled-test`)}); const page = pages.find((item) => item.route === "/free-invoice-generator/"); console.log(page.content.includes("data-overview-form"));`
);
assert.equal(enabledMarkup.status, 0);
assert.equal(enabledMarkup.stdout.trim(), "true", "approved preview build includes the optional one-email form");

const valid = buildOverviewRequest({ email: "  PERSON@example.com ", consent: true });
assert.equal(valid.ok, true, "active consent with a valid address is accepted");
assert.deepEqual(valid.body, {
  email: "person@example.com",
  consent: true,
  consentVersion: MARKETING_OVERVIEW_CONSENT_VERSION,
  source: MARKETING_OVERVIEW_SOURCE
});
assert.equal(buildOverviewRequest({ email: "person@example.com", consent: false }).ok, false, "email without checkbox is rejected");
assert.equal(buildOverviewRequest({ email: "not-an-email", consent: true }).ok, false, "invalid email is rejected");
assert.deepEqual(validateOverviewBody(valid.body), { ok: true, email: "person@example.com" }, "server accepts only the reviewed client request shape");
assert.equal(validateOverviewBody({ ...valid.body, consent: false }).ok, false, "server rejects missing active consent");
assert.equal(validateOverviewBody({ ...valid.body, consentVersion: "old" }).ok, false, "server rejects stale consent wording");
const overviewEmail = buildOverviewEmail({ unsubscribeUrl: "https://example.invalid/unsubscribe" });
assert.match(CONSENT_WORDING, /^Yes, Tallyo may send me one promotional email/);
assert.equal(overviewEmail.subject, "See what else you can do with Tallyo");
assert.equal(overviewEmail.preheader, "Save customers and items, automate invoices and reminders, track payments and accept online card payments.");
assert.match(overviewEmail.text, /Create invoices faster\. Get paid with less admin\./);
assert.match(overviewEmail.text, /No account or subscription has been created\. This is the one introductory email you requested\./);
assert.match(overviewEmail.text, /You have not been added to an ongoing newsletter and Tallyo will not send further promotional messages under this consent\./);
assert.match(overviewEmail.text, /Privacy Notice: https:\/\/tallyo\.co\.uk\/privacy\//);
assert.match(overviewEmail.text, /Unsubscribe: https:\/\/example\.invalid\/unsubscribe/);
for (const copy of [
  "Create professional invoices in minutes",
  "Save customers and items",
  "Track invoices and payment status",
  "Automate recurring invoices and reminders",
  "Accept online payments with Stripe",
  "Keep invoices on brand",
  "£8 monthly",
  "£80 annually"
]) {
  assert.match(overviewEmail.text, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  assert.match(overviewEmail.html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
for (const href of [
  "https://app.tallyo.co.uk/",
  "https://tallyo.co.uk/",
  "https://tallyo.co.uk/pricing/",
  "https://tallyo.co.uk/privacy/",
  "https://tallyo.co.uk/free-invoice-generator/",
  "https://example.invalid/unsubscribe"
]) assert.match(overviewEmail.html, new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
assert.equal(OVERVIEW_EMAIL_IMAGES.length, 4, "the email remains concise with four real product screenshots");
assert.deepEqual(overviewEmail.images, OVERVIEW_EMAIL_IMAGES);
assert.equal(new Set(OVERVIEW_EMAIL_IMAGES.map(({ src }) => src)).size, 4);
for (const { src, alt } of OVERVIEW_EMAIL_IMAGES) {
  assert.match(src, /^https:\/\/tallyo\.co\.uk\/assets\/email\/overview-[a-z-]+\.jpg$/);
  assert.ok(alt.length >= 35, "every screenshot has meaningful alt text");
  assert.match(overviewEmail.html, new RegExp(`src="${src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]+alt="${alt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  const asset = join(root, "website/public", new URL(src).pathname);
  const bytes = statSync(asset).size;
  assert.ok(bytes > 10_000 && bytes < 100_000, `${src} is compressed for email (${bytes} bytes)`);
  assert.equal(statSync(join(root, "website/dist", new URL(src).pathname)).size, bytes, `${src} is copied into the deployable website build`);
}
assert.doesNotMatch(overviewEmail.html, /qa-live-acceptance|tallyo-test|new@gmail|customer data|invoice contents/i, "email screenshots and copy expose no acceptance-test identity");
assert.match(overviewEmail.html, /<table role="presentation"/, "email uses an email-safe table layout");
assert.match(overviewEmail.html, /@media only screen and \(max-width:620px\)/, "email includes a focused mobile layout");
assert.match(overviewEmail.html, /main@tallyo\.co\.uk/);
assert.match(
  read("supabase/functions/send-marketing-overview/index.ts"),
  /Deno\.env\.get\("FROM_EMAIL"\)[\s\S]*Tallyo <invoices@mail\.tallyo\.co\.uk>/,
);
assert.throws(() => buildOverviewEmail({ unsubscribeUrl: "http://example.invalid/unsubscribe" }), /must use HTTPS/);

let prepares = 0;
let panels = 0;
let downloads = 0;
const flow = createPreparedDownloadController({
  prepare: () => { prepares += 1; return true; },
  showPanel: () => { panels += 1; return true; },
  download: () => { downloads += 1; }
});
assert.equal(flow.begin(), true);
assert.deepEqual({ prepares, panels, downloads }, { prepares: 1, panels: 1, downloads: 0 }, "preparation succeeds before the panel and download waits");
assert.equal(flow.complete(), true);
assert.deepEqual({ prepares, panels, downloads }, { prepares: 1, panels: 1, downloads: 1 }, "continue or dismissal downloads without regenerating");
assert.equal(flow.complete(), false, "the same prepared document cannot download twice");

const failedFlow = createPreparedDownloadController({
  prepare: () => false,
  showPanel: () => assert.fail("panel must not open after PDF preparation failure"),
  download: () => assert.fail("download must not start after PDF preparation failure")
});
assert.equal(failedFlow.begin(), false);

let directDownloads = 0;
const noPanelFlow = createPreparedDownloadController({
  prepare: () => true,
  showPanel: () => false,
  download: () => { directDownloads += 1; }
});
assert.equal(noPanelFlow.begin(), true);
assert.equal(directDownloads, 1, "a missing dialog preserves the existing direct PDF route");

const pages = read("website/src/pages.mjs");
const generator = read("website/src/generator.js");
const styles = read("website/src/styles.css");
const server = read("supabase/functions/send-marketing-overview/index.ts");
const serverPolicy = read("supabase/functions/_shared/marketing-overview.mjs");
const migration = read("supabase/migrations/20260731152423_add_marketing_overview_requests.sql");
const grantMigration = read("supabase/migrations/20260731155610_narrow_marketing_overview_service_grants.sql");
const privacy = read("website/src/legal-content.mjs");

for (const copy of [
  "Saved customers and items",
  "Recurring invoices",
  "Automatic overdue reminders",
  "Invoice and payment-status tracking",
  "Online payments through your connected Stripe account",
  "&pound;8 monthly",
  "&pound;80 annually",
  "Create a free Tallyo account",
  "Send me the overview",
  "Continue download"
]) assert.match(pages, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(pages, /data-conversion-register[^>]+target="_blank"[^>]+rel="noopener"/, "registration opens separately and preserves the completed invoice");
assert.match(pages, /data-overview-consent><span>Yes, Tallyo may send me one promotional email/, "consent starts unticked and separate");
assert.doesNotMatch(pages, /data-overview-consent[^>]+checked/, "marketing consent is never preselected");
assert.match(pages, /aria-label="Close and continue download"/, "dismissal clearly preserves the download");
assert.match(generator, /addEventListener\("cancel"/, "Escape dismissal is keyboard supported");
assert.match(generator, /emitAnalyticsEvent\("start_registration"\)/);
assert.match(generator, /emitAnalyticsEvent\("download_invoice"\)/);
assert.doesNotMatch(generator, /emitAnalyticsEvent\([^\n]+email/i, "no email or personal data enters Analytics");
assert.match(styles, /width: min\(44rem, calc\(100% - 1\.5rem\)\)/, "panel fits narrow mobile viewports");
assert.match(styles, /width: 2\.75rem; height: 2\.75rem/, "dismiss control retains an accessible tap target");

assert.match(serverPolicy, /CONSENT_WORDING =\s*"Yes, Tallyo may send me one promotional email/);
assert.match(server, /RATE_LIMIT_PER_HOUR = 3/);
assert.match(server, /Idempotency-Key/);
assert.match(server, /insertError\?\.code === "23505"/, "duplicate address requests cannot create another send");
assert.match(server, /STALE_PENDING_AFTER_MS = 5 \* 60 \* 1000/, "an interrupted request becomes safely retryable after five minutes");
assert.match(server, /\.eq\("unsubscribe_token_hash", existing\.unsubscribe_token_hash\)/, "only one retry can claim an interrupted request");
assert.match(server, /new URL\([\s\S]+\/functions\/v1\/send-marketing-overview[\s\S]+supabaseUrl/, "unsubscribe links use the public HTTPS function origin");
assert.match(server, /return json\(\{ status: "already_requested" \}, 200, origin\)/, "a duplicate consent request exits without a second provider call");
assert.match(server, /MARKETING_OVERVIEW_ALLOWED_ORIGINS/);
assert.match(server, /List-Unsubscribe/);
assert.match(server, /email: null,[\s\S]+status: providerAccepted \? "sent" : "failed"/, "plain address is removed after the single send attempt");
assert.doesNotMatch(server, /senderContact|customerName|customerAddress|recipient/, "invoice fields are not available to the marketing function");

assert.match(migration, /enable row level security/);
assert.match(migration, /force row level security/);
assert.match(migration, /revoke all on table public\.marketing_overview_requests from public, anon, authenticated/);
assert.match(migration, /email_hash text not null unique/);
assert.match(migration, /consent_wording text not null/);
assert.match(migration, /withdrawn_at timestamptz/);
assert.match(grantMigration, /revoke delete, truncate, references, trigger/);
assert.match(grantMigration, /from service_role/);
assert.match(privacy, /single introductory overview/);
assert.match(privacy, /We do not copy the invoice sender or recipient address/);

console.log("Free-generator conversion and one-email consent checks passed.");
