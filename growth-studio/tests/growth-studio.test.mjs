import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { audienceSegments, brandAssets, channelDefinitions, claimGuardrails, initialState } from "../src/data.js";

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
    assert.ok(segment.search.length > 20);
  }
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

test("application CSP blocks network connections and code makes none", async () => {
  const [html, app] = await Promise.all([
    readFile(path.join(root, "src", "index.html"), "utf8"),
    readFile(path.join(root, "src", "app.js"), "utf8")
  ]);
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /style=/);
  assert.doesNotMatch(app, /style=/);
  assert.doesNotMatch(app, /\b(fetch|XMLHttpRequest|WebSocket)\s*\(/);
});

test("build contains approved Tallyo brand and campaign assets", async () => {
  const expected = [
    "dist/index.html",
    "dist/assets/tallyo-wordmark-white.png",
    "dist/assets/tallyo-mark.png",
    ...brandAssets.map((asset) => `dist/assets/linkedin/${asset.file}`)
  ];
  await Promise.all(expected.map((file) => access(path.join(root, file))));
  const manifest = JSON.parse(await readFile(path.join(root, "dist", "build-manifest.json"), "utf8"));
  assert.equal(manifest.mode, "draft-only");
  assert.deepEqual(manifest.channels, ["linkedin"]);
});
