import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { notFoundPage, pages } from "../src/pages.mjs";
import { renderPage } from "../src/layout.mjs";
import { siteConfig } from "../src/config.mjs";
import { applyConnectPaymentCopy } from "../src/commercial-offer.mjs";
import { assertCloudflareAccessConfirmed } from "../../scripts/cloudflare-access-build-guard.mjs";

assertCloudflareAccessConfirmed();

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(websiteRoot, "dist");
if (distRoot !== join(websiteRoot, "dist") || !distRoot.startsWith(`${websiteRoot}${sep}`)) {
  throw new Error("Refusing to build outside website/dist");
}

await rm(distRoot, { recursive: true, force: true });
await mkdir(join(distRoot, "assets"), { recursive: true });

const helperKnowledge = JSON.parse(applyConnectPaymentCopy(
  await readFile(join(websiteRoot, "content", "helper-knowledge.json"), "utf8"),
  siteConfig.connectPaymentsEnabled
));
const helperKnowledgeJson = JSON.stringify(helperKnowledge).replaceAll("<", "\\u003c");
const eventPolicy = JSON.parse(await readFile(join(websiteRoot, "content", "analytics-events.json"), "utf8"));
const assetSourcePaths = [
  ["src", "styles.css"],
  ["src", "site.js"],
  ["src", "helper.js"],
  ["src", "helper-core.mjs"],
  ["src", "generator.js"],
  ["src", "document-calculator.mjs"],
  ["src", "growth.js"],
  ["public", "assets", "icon-192.png"],
  ["public", "assets", "tallyo-mark.png"],
  ["public", "assets", "tallyo-wordmark-white.png"],
  ["public", "assets", "tallyo-social-card.webp"],
  ["public", "assets", "product", "tallyo-dashboard.jpg"],
  ["public", "assets", "product", "tallyo-invoice-editor.jpg"],
  ["public", "assets", "product", "tallyo-quote-editor.jpg"],
  ["public", "assets", "product", "tallyo-customers.jpg"],
  ["public", "assets", "product", "tallyo-recurring.jpg"],
  ["public", "assets", "product", "tallyo-overdue.jpg"],
  ["public", "assets", "product", "tallyo-payments.jpg"],
  ["public", "assets", "product", "tallyo-activity.jpg"],
  ["public", "assets", "product", "tallyo-branding.jpg"],
  ["public", "assets", "product", "tallyo-security.jpg"],
  ["public", "assets", "product", "tallyo-mobile-quote.jpg"]
];
const assetRevisionHash = createHash("sha256");
for (const pathParts of assetSourcePaths) {
  assetRevisionHash.update(pathParts.join("/"));
  assetRevisionHash.update(await readFile(join(websiteRoot, ...pathParts)));
}
for (const sharedAsset of ["analytics-consent.mjs", "analytics-consent.css"]) {
  assetRevisionHash.update(sharedAsset);
  assetRevisionHash.update(await readFile(join(websiteRoot, "..", sharedAsset)));
}
assetRevisionHash.update(JSON.stringify(eventPolicy));
const assetRevision = assetRevisionHash.digest("hex").slice(0, 12);

const rendered = [];
for (const page of [...pages, notFoundPage]) {
  const outputPath = join(distRoot, page.output);
  const result = renderPage(page, { helperKnowledgeJson, assetRevision });
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, result.html, "utf8");
  rendered.push({ page, ...result });
}

await copyFile(join(websiteRoot, "src", "styles.css"), join(distRoot, "assets", "styles.css"));
await copyFile(join(websiteRoot, "src", "site.js"), join(distRoot, "assets", "site.js"));
await copyFile(join(websiteRoot, "src", "helper-core.mjs"), join(distRoot, "assets", "helper-core.mjs"));
await copyFile(join(websiteRoot, "src", "document-calculator.mjs"), join(distRoot, "assets", "document-calculator.mjs"));
await copyFile(join(websiteRoot, "..", "analytics-consent.mjs"), join(distRoot, "assets", "analytics-consent.mjs"));
await copyFile(join(websiteRoot, "..", "analytics-consent.css"), join(distRoot, "assets", "analytics-consent.css"));
for (const moduleName of ["helper.js", "generator.js", "growth.js"]) {
  const source = await readFile(join(websiteRoot, "src", moduleName), "utf8");
  await writeFile(
    join(distRoot, "assets", moduleName),
    source.replaceAll("__TALLYO_ASSET_REVISION__", assetRevision),
    "utf8"
  );
}
await writeFile(
  join(distRoot, "assets", "analytics-config.mjs"),
  `export const analyticsConfiguration = Object.freeze(${JSON.stringify({
    enabled: siteConfig.analyticsEnabled,
    environment: siteConfig.mode,
    measurementId: siteConfig.ga4MeasurementId
  })});\n`,
  "utf8"
);
await copyFile(join(websiteRoot, "public", "assets", "icon-192.png"), join(distRoot, "assets", "icon-192.png"));
await copyFile(join(websiteRoot, "public", "assets", "tallyo-mark.png"), join(distRoot, "assets", "tallyo-mark.png"));
await copyFile(join(websiteRoot, "public", "assets", "tallyo-wordmark-white.png"), join(distRoot, "assets", "tallyo-wordmark-white.png"));
await copyFile(join(websiteRoot, "public", "assets", "tallyo-social-card.webp"), join(distRoot, "assets", "tallyo-social-card.webp"));
await mkdir(join(distRoot, "assets", "product"), { recursive: true });
for (const imageName of ["tallyo-dashboard.jpg", "tallyo-invoice-editor.jpg", "tallyo-quote-editor.jpg", "tallyo-customers.jpg", "tallyo-recurring.jpg", "tallyo-overdue.jpg", "tallyo-payments.jpg", "tallyo-activity.jpg", "tallyo-branding.jpg", "tallyo-security.jpg", "tallyo-mobile-quote.jpg"]) {
  await copyFile(join(websiteRoot, "public", "assets", "product", imageName), join(distRoot, "assets", "product", imageName));
}
await copyFile(join(websiteRoot, "public", "_redirects"), join(distRoot, "_redirects"));

const hashes = [...new Set(rendered.flatMap(({ inlineScripts }) => inlineScripts).filter(Boolean).map((inlineScript) => {
  const digest = createHash("sha256").update(inlineScript).digest("base64");
  return `'sha256-${digest}'`;
}))].join(" ");
const headerTemplate = await readFile(join(websiteRoot, "public", "_headers.template"), "utf8");
const connectSources = [
  siteConfig.aiHelperEnabled ? "'self'" : "",
  siteConfig.analyticsEnabled ? "https://www.google-analytics.com https://region1.google-analytics.com" : ""
].filter(Boolean).join(" ") || "'none'";
const headers = headerTemplate
  .replace("{{SCRIPT_HASHES}}", hashes)
  .replace("{{CONNECT_SRC}}", connectSources)
  .replace("{{ANALYTICS_SCRIPT_SRC}}", siteConfig.analyticsEnabled ? " https://www.googletagmanager.com" : "")
  .replace("{{ROBOTS_HEADER}}", siteConfig.preview ? "X-Robots-Tag: noindex, nofollow, noarchive" : "");
await writeFile(join(distRoot, "_headers"), headers, "utf8");

const sitemapEntries = pages.map((page) => `  <url><loc>${siteConfig.canonicalOrigin}${page.route}</loc></url>`).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
await writeFile(join(distRoot, "sitemap.xml"), sitemap, "utf8");

const robots = siteConfig.preview
  ? "User-agent: *\nDisallow: /\n"
  : `User-agent: *\nAllow: /\nSitemap: ${siteConfig.canonicalOrigin}/sitemap.xml\n`;
await writeFile(join(distRoot, "robots.txt"), robots, "utf8");

const assetFiles = ["assets/styles.css", "assets/analytics-consent.css", "assets/site.js", "assets/helper.js", "assets/helper-core.mjs", "assets/generator.js", "assets/document-calculator.mjs", "assets/analytics-consent.mjs", "assets/analytics-config.mjs", "assets/growth.js", "assets/icon-192.png", "assets/tallyo-mark.png", "assets/tallyo-wordmark-white.png", "assets/tallyo-social-card.webp", "assets/product/tallyo-dashboard.jpg", "assets/product/tallyo-invoice-editor.jpg", "assets/product/tallyo-quote-editor.jpg", "assets/product/tallyo-customers.jpg", "assets/product/tallyo-recurring.jpg", "assets/product/tallyo-overdue.jpg", "assets/product/tallyo-payments.jpg", "assets/product/tallyo-activity.jpg", "assets/product/tallyo-branding.jpg", "assets/product/tallyo-security.jpg", "assets/product/tallyo-mobile-quote.jpg"];
const assetBytes = {};
for (const file of assetFiles) assetBytes[file] = (await stat(join(distRoot, file))).size;
await writeFile(join(distRoot, "build-report.json"), `${JSON.stringify({ mode: siteConfig.mode, routes: pages.length, externalOrigins: siteConfig.analyticsEnabled ? 3 : 0, assetRevision, assetBytes }, null, 2)}\n`, "utf8");

console.log(`Built ${pages.length} routes plus 404 in ${siteConfig.mode} mode.`);
