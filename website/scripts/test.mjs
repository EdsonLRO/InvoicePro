import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { notFoundPage, pages } from "../src/pages.mjs";

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = join(websiteRoot, "dist");
execFileSync(process.execPath, [join(websiteRoot, "scripts", "build.mjs")], { stdio: "inherit", env: { ...process.env, TALLYO_SITE_MODE: "preview" } });

const read = (relative) => readFileSync(join(distRoot, relative), "utf8");
const routeOutput = new Map([...pages, notFoundPage].map((page) => [page.route, page.output]));
const seenTitles = new Set();
const seenDescriptions = new Set();
const prohibitedClaims = /100% secure|unhackable|bank-grade|fully GDPR compliant|certified compliant|guaranteed payment|guaranteed email delivery|works fully offline|uptime guarantee/i;
const fakeProof = /\b(?:trusted by|rated|award-winning|five-star|5-star)\b/i;

const hrefsFor = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
const meta = (html, name) => html.match(new RegExp(`<meta name="${name}" content="([^"]+)"`))?.[1];

for (const page of [...pages, notFoundPage]) {
  assert.ok(existsSync(join(distRoot, page.output)), `missing output for ${page.route}`);
  const html = read(page.output);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = meta(html, "description");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(title && !seenTitles.has(title), `title must be unique for ${page.route}`);
  assert.ok(description && !seenDescriptions.has(description), `description must be unique for ${page.route}`);
  seenTitles.add(title);
  seenDescriptions.add(description);
  assert.equal(meta(html, "robots"), "noindex, nofollow, noarchive", `preview robots for ${page.route}`);
  assert.equal(canonical, `https://tallyo.co.uk${page.route}`, `canonical for ${page.route}`);
  assert.ok(!canonical.includes("utm_"), `canonical excludes campaign parameters for ${page.route}`);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `one h1 for ${page.route}`);
  assert.match(html, /class="skip-link" href="#main-content"/, `skip link for ${page.route}`);
  assert.match(html, /aria-expanded="false" aria-controls="primary-navigation"/, `mobile menu semantics for ${page.route}`);
  assert.match(html, /property="og:title"/, `Open Graph title for ${page.route}`);
  assert.doesNotMatch(html, prohibitedClaims, `prohibited claim on ${page.route}`);
  assert.doesNotMatch(html, fakeProof, `fake proof on ${page.route}`);
  assert.doesNotMatch(html, /<script[^>]+src="https?:\/\//, `no external script on ${page.route}`);
  const schemaText = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
  assert.ok(schemaText, `structured data for ${page.route}`);
  assert.doesNotThrow(() => JSON.parse(schemaText), `valid structured data for ${page.route}`);

  for (const href of hrefsFor(html)) {
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const route = href.split("#")[0] || "/";
    const staticFile = join(distRoot, route.replace(/^\//, ""));
    assert.ok(routeOutput.has(route) || existsSync(staticFile), `broken internal link ${href} on ${page.route}`);
  }
}

const home = read("index.html");
for (const id of ["cta_header_create_account", "cta_hero_create_account", "cta_hero_free_invoice", "cta_footer_create_account", "cta_login"]) {
  assert.match(home, new RegExp(`id="${id}"`), `missing CTA id ${id}`);
}
assert.match(home, /Northstar Home Services/);
assert.match(home, /Willow &amp; Pine Studio/);

const pricing = read("pricing/index.html");
assert.match(pricing, /Plans and pricing are being finalised/);
assert.match(pricing, /Teams workspaces and multi-user access are not currently implemented/);
assert.doesNotMatch(pricing, /[£$€]\s*\d/);
assert.doesNotMatch(pricing, /free trial|\d+-day trial/i);

const headers = read("_headers");
assert.match(headers, /default-src 'self'/);
assert.match(headers, /connect-src 'none'/);
assert.match(headers, /frame-ancestors 'none'/);
assert.match(headers, /X-Robots-Tag: noindex, nofollow, noarchive/);
assert.doesNotMatch(headers, /unsafe-inline|unsafe-eval/);
assert.match(headers, /sha256-/);

assert.equal(read("robots.txt"), "User-agent: *\nDisallow: /\n");
const sitemap = read("sitemap.xml");
for (const page of pages) assert.match(sitemap, new RegExp(`https://tallyo\\.co\\.uk${page.route.replaceAll("/", "\\/")}`));
assert.ok(existsSync(join(distRoot, "404.html")));
assert.match(read("_redirects"), /\/\* \/404\.html 404/);
assert.ok(statSync(join(distRoot, "assets", "styles.css")).size < 60_000, "CSS baseline under 60 KB");
assert.ok(statSync(join(distRoot, "assets", "site.js")).size < 10_000, "JS baseline under 10 KB");
assert.ok(existsSync(join(distRoot, "assets", "icon-192.png")), "favicon asset exists");

const report = JSON.parse(read("build-report.json"));
assert.equal(report.mode, "preview");
assert.equal(report.externalOrigins, 0);
assert.equal(report.routes, pages.length);

console.log(`Website foundation checks passed for ${pages.length} routes plus 404.`);
