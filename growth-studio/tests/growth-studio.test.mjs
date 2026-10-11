import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { audienceSegments, brandAssets, channelDefinitions, claimGuardrails, initialState } from "../src/data.js";
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

test("Cloudflare deployment exposes only the Access-protected custom domain", async () => {
  const config = JSON.parse(await readFile(path.join(root, "wrangler.jsonc"), "utf8"));
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assert.equal(config.assets.directory, "./dist");
  assert.equal(config.assets.not_found_handling, "single-page-application");
  assert.equal(config.observability.redact_query_string, true);
  assert.deepEqual(config.routes, [{ pattern: "growth.tallyo.co.uk", custom_domain: true }]);
});
