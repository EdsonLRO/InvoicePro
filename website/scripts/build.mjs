import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { notFoundPage, pages } from "../src/pages.mjs";
import { renderPage } from "../src/layout.mjs";
import { siteConfig } from "../src/config.mjs";

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(websiteRoot, "dist");
if (distRoot !== join(websiteRoot, "dist") || !distRoot.startsWith(`${websiteRoot}${sep}`)) {
  throw new Error("Refusing to build outside website/dist");
}

await rm(distRoot, { recursive: true, force: true });
await mkdir(join(distRoot, "assets"), { recursive: true });

const helperKnowledge = JSON.parse(await readFile(join(websiteRoot, "content", "helper-knowledge.json"), "utf8"));
const helperKnowledgeJson = JSON.stringify(helperKnowledge).replaceAll("<", "\\u003c");
const eventPolicy = JSON.parse(await readFile(join(websiteRoot, "content", "analytics-events.json"), "utf8"));

const rendered = [];
for (const page of [...pages, notFoundPage]) {
  const outputPath = join(distRoot, page.output);
  const result = renderPage(page, { helperKnowledgeJson });
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, result.html, "utf8");
  rendered.push({ page, ...result });
}

await copyFile(join(websiteRoot, "src", "styles.css"), join(distRoot, "assets", "styles.css"));
await copyFile(join(websiteRoot, "src", "site.js"), join(distRoot, "assets", "site.js"));
await copyFile(join(websiteRoot, "src", "helper.js"), join(distRoot, "assets", "helper.js"));
await copyFile(join(websiteRoot, "src", "helper-core.mjs"), join(distRoot, "assets", "helper-core.mjs"));
await copyFile(join(websiteRoot, "src", "generator.js"), join(distRoot, "assets", "generator.js"));
await copyFile(join(websiteRoot, "src", "document-calculator.mjs"), join(distRoot, "assets", "document-calculator.mjs"));
await copyFile(join(websiteRoot, "src", "analytics.mjs"), join(distRoot, "assets", "analytics.mjs"));
await copyFile(join(websiteRoot, "src", "growth.js"), join(distRoot, "assets", "growth.js"));
await writeFile(join(distRoot, "assets", "analytics-policy.mjs"), `export const eventPolicy = Object.freeze(${JSON.stringify(eventPolicy)});\n`, "utf8");
await copyFile(join(websiteRoot, "public", "assets", "icon-192.png"), join(distRoot, "assets", "icon-192.png"));
await copyFile(join(websiteRoot, "public", "assets", "tallyo-mark.png"), join(distRoot, "assets", "tallyo-mark.png"));
await copyFile(join(websiteRoot, "public", "assets", "tallyo-wordmark-white.png"), join(distRoot, "assets", "tallyo-wordmark-white.png"));
await copyFile(join(websiteRoot, "public", "assets", "tallyo-social-card.webp"), join(distRoot, "assets", "tallyo-social-card.webp"));
await copyFile(join(websiteRoot, "public", "_redirects"), join(distRoot, "_redirects"));

const hashes = [...new Set(rendered.flatMap(({ inlineScripts }) => inlineScripts).filter(Boolean).map((inlineScript) => {
  const digest = createHash("sha256").update(inlineScript).digest("base64");
  return `'sha256-${digest}'`;
}))].join(" ");
const headerTemplate = await readFile(join(websiteRoot, "public", "_headers.template"), "utf8");
const headers = headerTemplate
  .replace("{{SCRIPT_HASHES}}", hashes)
  .replace("{{ROBOTS_HEADER}}", siteConfig.preview ? "X-Robots-Tag: noindex, nofollow, noarchive" : "");
await writeFile(join(distRoot, "_headers"), headers, "utf8");

const sitemapEntries = pages.map((page) => `  <url><loc>${siteConfig.canonicalOrigin}${page.route}</loc></url>`).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
await writeFile(join(distRoot, "sitemap.xml"), sitemap, "utf8");

const robots = siteConfig.preview
  ? "User-agent: *\nDisallow: /\n"
  : `User-agent: *\nAllow: /\nSitemap: ${siteConfig.canonicalOrigin}/sitemap.xml\n`;
await writeFile(join(distRoot, "robots.txt"), robots, "utf8");

const assetFiles = ["assets/styles.css", "assets/site.js", "assets/helper.js", "assets/helper-core.mjs", "assets/generator.js", "assets/document-calculator.mjs", "assets/analytics.mjs", "assets/growth.js", "assets/analytics-policy.mjs", "assets/icon-192.png", "assets/tallyo-mark.png", "assets/tallyo-wordmark-white.png", "assets/tallyo-social-card.webp"];
const assetBytes = {};
for (const file of assetFiles) assetBytes[file] = (await stat(join(distRoot, file))).size;
await writeFile(join(distRoot, "build-report.json"), `${JSON.stringify({ mode: siteConfig.mode, routes: pages.length, externalOrigins: 0, assetBytes }, null, 2)}\n`, "utf8");

console.log(`Built ${pages.length} routes plus 404 in ${siteConfig.mode} mode.`);
