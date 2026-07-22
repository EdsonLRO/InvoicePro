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

const rendered = [];
for (const page of [...pages, notFoundPage]) {
  const outputPath = join(distRoot, page.output);
  const result = renderPage(page);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, result.html, "utf8");
  rendered.push({ page, ...result });
}

await copyFile(join(websiteRoot, "src", "styles.css"), join(distRoot, "assets", "styles.css"));
await copyFile(join(websiteRoot, "src", "site.js"), join(distRoot, "assets", "site.js"));
await copyFile(join(websiteRoot, "public", "assets", "icon-192.png"), join(distRoot, "assets", "icon-192.png"));
await copyFile(join(websiteRoot, "public", "_redirects"), join(distRoot, "_redirects"));

const hashes = [...new Set(rendered.map(({ schema }) => {
  const digest = createHash("sha256").update(schema).digest("base64");
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

const assetFiles = ["assets/styles.css", "assets/site.js", "assets/icon-192.png"];
const assetBytes = {};
for (const file of assetFiles) assetBytes[file] = (await stat(join(distRoot, file))).size;
await writeFile(join(distRoot, "build-report.json"), `${JSON.stringify({ mode: siteConfig.mode, routes: pages.length, externalOrigins: 0, assetBytes }, null, 2)}\n`, "utf8");

console.log(`Built ${pages.length} routes plus 404 in ${siteConfig.mode} mode.`);
