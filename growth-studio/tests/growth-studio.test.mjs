import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { audienceSegments, brandAssets, brandCategories, channelDefinitions, claimGuardrails, initialState, recommendAsset, recommendSegment } from "../src/data.js";
import { emptyDiscovery, normaliseDiscovery, validateDiscoveryPayload } from "../src/discovery.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("LinkedIn is draft-first and prohibits automated account actions", () => {
  const capabilities = channelDefinitions.linkedin.capabilities;
  assert.equal(capabilities.generateDrafts, true);
  assert.equal(capabilities.renderAssets, true);
  for (const capability of ["publish", "readAnalytics", "searchPeople", "sendMessages", "sendConnections", "reactToPosts"]) {
    assert.equal(capabilities[capability], false, `${capability} must remain disabled`);
  }
});

test("future channels are completely disabled", () => {
  for (const id of ["facebook", "x"]) {
    assert.equal(Object.values(channelDefinitions[id].capabilities).some(Boolean), false);
  }
});

test("audience strategy stores no personal profile fields", () => {
  const prohibited = new Set(["nameOfPerson", "profileUrl", "email", "phone", "message"]);
  for (const segment of audienceSegments) {
    for (const field of Object.keys(segment)) assert.equal(prohibited.has(field), false);
    assert.ok(segment.signals.length >= 3);
  }
});

test("audience strategy prioritises trades and self-employed service businesses", () => {
  assert.deepEqual(audienceSegments.slice(0, 3).map((segment) => segment.id), ["trades", "property-services", "mobile-services"]);
  assert.equal(recommendSegment("Local plumber offering bathroom installations").id, "trades");
  assert.equal(recommendSegment("Garden maintenance packages").id, "property-services");
});

test("brand library is current, categorised, and topic-aware", () => {
  assert.ok(brandAssets.length >= 20);
  assert.ok(brandCategories.length >= 7);
  assert.equal(new Set(brandAssets.map((asset) => asset.id)).size, brandAssets.length);
  assert.equal(new Set(brandAssets.map((asset) => asset.file)).size, brandAssets.length);
  for (const asset of brandAssets) {
    assert.ok(brandCategories.some((category) => category.id === asset.category));
    assert.ok(asset.topics.length >= 3);
    assert.ok(asset.alt.length > 20);
  }
  assert.equal(recommendAsset("The customer accepted our quote").id, "quote-to-invoice");
  assert.equal(recommendAsset("A deposit with the remaining balance visible").id, "deposit");
  assert.equal(recommendAsset("Prepare records for the accountant handover").id, "income-pack");
  assert.equal(recommendAsset("Regular monthly garden maintenance").id, "recurring");
});

test("product screenshots use genuine fictional-data captures rather than recreated interface art", async () => {
  const screenshots = brandAssets.filter((asset) => asset.format === "Raw product screenshot");
  assert.deepEqual(screenshots.map((asset) => asset.id), ["quote-to-invoice", "income-insights", "income-pack"]);
  for (const asset of screenshots) {
    assert.match(asset.file, /^4[0-2]-product-.+\.png$/);
    assert.doesNotMatch(asset.alt, /preview|illustration/i);
  }

  const repository = path.resolve(root, "..");
  const originals = ["accepted-quote-invoice.png", "income-insights.png", "income-pack.png"];
  for (const [index, asset] of screenshots.entries()) {
    const [published, original] = await Promise.all([
      readFile(path.join(repository, "website", "public", "assets", "social", "linkedin", asset.file)),
      readFile(path.join(repository, "website", "public", "assets", "product", "growth-studio", originals[index]))
    ]);
    assert.deepEqual(published, original, `${asset.file} must remain an unmodified product capture`);
  }
});

test("Growth Studio visuals use real current interface captures and the official wordmark", async () => {
  const repoRoot = path.resolve(root, "..");
  const [capture, renderer, libraryRenderer] = await Promise.all([
    readFile(path.join(repoRoot, "marketing", "growth-studio", "capture-real-screenshots.mjs"), "utf8"),
    readFile(path.join(repoRoot, "marketing", "growth-studio", "render.mjs"), "utf8"),
    readFile(path.join(repoRoot, "marketing", "linkedin", "render.mjs"), "utf8"),
  ]);
  assert.match(capture, /dev\/redesign\/preview\.mjs/);
  assert.match(capture, /outsideRequests\.length/);
  assert.doesNotMatch(capture, /https:\/\/app\.tallyo\.co\.uk/);
  assert.doesNotMatch(renderer, /screenMarkup|<div class="mark">T<\/div>|interface preview/i);
  assert.match(renderer, /assets", "tallyo-wordmark-white\.png"/);
  assert.match(renderer, /product", "growth-studio"/);
  assert.doesNotMatch(libraryRenderer, /tallyo-(dashboard|invoice-editor|customers|recurring|overdue|payments|activity|branding|security)\.(jpg|png)/i);
  assert.ok(brandAssets.some((asset) => asset.file === "37-review-before-sending.png"));
  assert.equal(brandAssets.some((asset) => asset.file === "37-branded-emails.png"), false);
  await Promise.all([
    "dashboard-overview.png",
    "products-services.png",
    "recurring-invoices.png",
    "recurring-edit.png",
    "recurring-history.png",
    "customer-record.png",
    "customer-details.png",
    "invoice-editor.png",
    "automatic-reminders.png",
    "overdue-invoices.png",
    "invoice-list-actions.png",
    "activity-history.png",
    "deposit-request.png",
    "document-layouts.png",
    "business-settings.png",
    "business-defaults.png",
    "account-subscription.png",
    "account-security.png",
    "account-data-sessions.png",
    "accepted-quote-invoice.png",
    "income-insights.png",
    "income-pack.png",
    "document-layouts.png",
    "quote-email-review.png",
    "google-sign-in.png",
    "growth-studio.png",
  ].map((file) => access(path.join(repoRoot, "website", "public", "assets", "product", "growth-studio", file))));
});

test("public-business discovery is enabled while LinkedIn people automation remains disabled", () => {
  const capabilities = channelDefinitions.linkedin.capabilities;
  assert.equal(capabilities.discoverPublicBusinesses, true);
  assert.equal(capabilities.searchPeople, false);
  assert.equal(capabilities.sendMessages, false);
  assert.equal(capabilities.sendConnections, false);
});

test("discovery records require public HTTPS evidence and contain no contact fields", () => {
  const result = normaliseDiscovery({
    generatedAt: "2026-10-11T08:30:00+01:00",
    candidates: [
      { id: "example", company: "Example Studio", website: "https://example.com", sourceUrl: "https://example.com/services", fitScore: 130, email: "not-allowed@example.com" },
      { id: "unsafe", company: "Unsafe URL", sourceUrl: "http://example.com" }
    ]
  });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].fitScore, 100);
  assert.equal("email" in result.candidates[0], false);
  assert.equal(emptyDiscovery.candidates.length, 0);
});

test("production discovery validation rejects personal contact fields and duplicate candidates", () => {
  const candidate = {
    id: "example",
    company: "Example Studio",
    website: "https://example.com/",
    fitScore: 80,
    sourceUrl: "https://example.com/services"
  };
  const payload = {
    schemaVersion: 1,
    generatedAt: "2026-10-11T08:30:00+01:00",
    sourcePolicy: "Public business websites only",
    searchSummary: "Validated public evidence.",
    candidates: [candidate]
  };

  assert.equal(validateDiscoveryPayload(payload).candidates.length, 1);
  assert.throws(() => validateDiscoveryPayload({ ...payload, candidates: [{ ...candidate, email: "owner@example.com" }] }), /Unexpected candidate field: email/);
  assert.throws(() => validateDiscoveryPayload({ ...payload, candidates: [candidate, candidate] }), /Duplicate discovery candidate id/);
});

test("every post has review state, audience, asset, caption, and alt text", () => {
  for (const post of initialState.posts) {
    assert.ok(["Draft", "In review", "Approved"].includes(post.status));
    assert.ok(audienceSegments.some((segment) => segment.id === post.segmentId));
    assert.ok(brandAssets.some((asset) => asset.id === post.assetId));
    assert.ok(post.caption.length > 80);
    assert.ok(post.alt.length > 20);
  }
  assert.ok(claimGuardrails.length >= 4);
});

test("income content states the verified product boundary", () => {
  const corpus = JSON.stringify({ initialState, templates: initialState.posts, claimGuardrails });
  assert.doesNotMatch(corpus, /invoices,? payment status,? and expenses/i);
  assert.match(corpus, /excludes expenses, profit and tax due/i);
});

test("application CSP allows same-origin discovery only and contains no external request URLs", async () => {
  const [html, app] = await Promise.all([
    readFile(path.join(root, "src", "index.html"), "utf8"),
    readFile(path.join(root, "src", "app.js"), "utf8")
  ]);
  assert.match(html, /connect-src 'self'/);
  assert.doesNotMatch(html, /style=/);
  assert.doesNotMatch(app, /style=/);
  assert.doesNotMatch(app, /fetch\(["']https?:/);
  assert.doesNotMatch(app, /\b(XMLHttpRequest|WebSocket)\s*\(/);
  assert.doesNotMatch(app, /manual LinkedIn search|copy-search/);
});

test("build contains approved Tallyo brand and campaign assets", async () => {
  const expected = [
    "dist/index.html",
    "dist/discovery.js",
    "dist/discovery.json",
    "dist/assets/tallyo-wordmark-white.png",
    "dist/assets/tallyo-mark.png",
    ...brandAssets.map((asset) => `dist/assets/linkedin/${asset.file}`)
  ];
  await Promise.all(expected.map((file) => access(path.join(root, file))));
  const manifest = JSON.parse(await readFile(path.join(root, "dist", "build-manifest.json"), "utf8"));
  assert.equal(manifest.mode, "draft-only");
  assert.deepEqual(manifest.channels, ["linkedin"]);
});

test("discovery feed permits only the Tallyo app origin", async () => {
  const headers = await readFile(path.join(root, "dist", "_headers"), "utf8");
  assert.match(headers, /^\/discovery\.json$/m);
  assert.match(headers, /Access-Control-Allow-Origin: https:\/\/app\.tallyo\.co\.uk/);
  assert.match(headers, /Access-Control-Allow-Credentials: true/);
  assert.match(headers, /Cache-Control: private, no-store/);
  assert.doesNotMatch(headers, /Access-Control-Allow-Origin:\s*\*/);
});

test("Cloudflare deployment exposes only the Access-protected custom domain", async () => {
  const config = JSON.parse(await readFile(path.join(root, "wrangler.jsonc"), "utf8"));
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assert.equal(config.assets.directory, "./dist");
  assert.equal(config.assets.not_found_handling, "single-page-application");
  assert.equal(config.observability.redact_query_string, true);
  assert.deepEqual(config.routes, [{ pattern: "growth.tallyo.co.uk", custom_domain: true }]);
});
