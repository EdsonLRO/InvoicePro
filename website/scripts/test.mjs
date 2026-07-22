import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { helpArticles, industries, notFoundPage, pages, productScenes } from "../src/pages.mjs";

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = join(websiteRoot, "dist");
execFileSync(process.execPath, [join(websiteRoot, "scripts", "build.mjs")], { stdio: "inherit", env: { ...process.env, TALLYO_SITE_MODE: "preview" } });

const read = (relative) => readFileSync(join(distRoot, relative), "utf8");
const routeOutput = new Map([...pages, notFoundPage].map((page) => [page.route, page.output]));
const seenTitles = new Set();
const seenDescriptions = new Set();
const schemas = new Map();
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
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `unique element IDs for ${page.route}`);
  assert.match(html, /property="og:title"/, `Open Graph title for ${page.route}`);
  assert.match(html, /property="og:image" content="https:\/\/tallyo\.co\.uk\/assets\/tallyo-social-card\.webp"/, `Open Graph image for ${page.route}`);
  assert.match(html, /name="twitter:card" content="summary_large_image"/, `large social card for ${page.route}`);
  assert.doesNotMatch(html, prohibitedClaims, `prohibited claim on ${page.route}`);
  assert.doesNotMatch(html, fakeProof, `fake proof on ${page.route}`);
  assert.doesNotMatch(html, /<script[^>]+src="https?:\/\//, `no external script on ${page.route}`);
  const schemaText = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
  assert.ok(schemaText, `structured data for ${page.route}`);
  assert.doesNotThrow(() => JSON.parse(schemaText), `valid structured data for ${page.route}`);
  schemas.set(page.route, JSON.parse(schemaText));

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
assert.equal((home.match(/class="product-demo /g) || []).length, 3, "home shows three product-tour previews");
assert.match(home, /Set up your business[\s\S]*Automate recurring work/, "home shows the complete six-step workflow");

const productTour = read("product-tour/index.html");
assert.equal((productTour.match(/class="product-demo /g) || []).length, productScenes.length, "product tour covers every supported scene");
for (const scene of productScenes) {
  assert.match(productTour, new RegExp(`id="${scene.id}"`), `product scene ${scene.id}`);
}
assert.equal((productTour.match(/Fictional demonstration<\/span>/g) || []).length, productScenes.length, "every product view is visibly fictional");
assert.doesNotMatch(productTour, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|acct_|cs_(?:test|live)_|eyJ[A-Za-z0-9_-]{10,}/, "product tour has no emails, provider IDs or JWT-like data");

for (const article of helpArticles) {
  const route = `/help/${article.slug}/`;
  const html = read(`help/${article.slug}/index.html`);
  assert.match(html, /aria-label="Breadcrumb"/, `breadcrumbs for ${route}`);
  assert.equal((html.match(/class="steps workflow-steps"/g) || []).length, 1, `one guide workflow for ${route}`);
  const graph = schemas.get(route)?.["@graph"] || [];
  const howTo = graph.find((item) => item["@type"] === "HowTo");
  const breadcrumb = graph.find((item) => item["@type"] === "BreadcrumbList");
  assert.equal(howTo?.step?.length, article.steps.length, `HowTo matches visible steps for ${route}`);
  assert.ok(breadcrumb, `breadcrumb schema for ${route}`);
}

const publishedIndustryPages = pages.filter((page) => page.route.startsWith("/industries/"));
assert.equal(publishedIndustryPages.length, 6, "six distinct industry landing pages are intentionally published");
for (const page of publishedIndustryPages) {
  const html = read(page.output);
  assert.match(html, /specialist trade or accounting software/, `honest industry boundary for ${page.route}`);
  assert.match(html, /aria-label="Breadcrumb"/, `industry breadcrumbs for ${page.route}`);
}
assert.ok(industries.length >= publishedIndustryPages.length, "homepage can show broader factual industry examples");

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
assert.ok(existsSync(join(distRoot, "assets", "tallyo-social-card.webp")), "social card asset exists");
assert.ok(statSync(join(distRoot, "assets", "tallyo-social-card.webp")).size < 100_000, "social card stays under 100 KB");

const contentMap = JSON.parse(readFileSync(join(websiteRoot, "content", "seo-content-map.json"), "utf8"));
assert.equal(contentMap.status, "planning-only");
assert.equal(contentMap.topics.length, 20, "all master-spec SEO topics are mapped");
assert.ok(contentMap.topics.every((topic) => topic.topic && topic.intent && topic.status), "SEO map entries are actionable specifications");

const report = JSON.parse(read("build-report.json"));
assert.equal(report.mode, "preview");
assert.equal(report.externalOrigins, 0);
assert.equal(report.routes, pages.length);

console.log(`Website product-content checks passed for ${pages.length} routes plus 404.`);
