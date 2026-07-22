import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(repositoryRoot, "app-dist");
if (outputRoot !== join(repositoryRoot, "app-dist") || !outputRoot.startsWith(`${repositoryRoot}${sep}`)) {
  throw new Error("Refusing to build outside app-dist");
}

const required = (name) => {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`${name} is required for an app Pages build`);
  return value;
};

const httpsUrl = (name, value, { optional = false } = {}) => {
  if (!value && optional) return "";
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL`);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error(`${name} must be a credential-free HTTPS URL`);
  }
  parsed.hash = "";
  parsed.search = "";
  return parsed.href.replace(/\/+$/, "");
};

const supabaseUrl = httpsUrl("TALLYO_SUPABASE_URL", required("TALLYO_SUPABASE_URL"));
const publishableKey = required("TALLYO_SUPABASE_PUBLISHABLE_KEY");
if (/service[_-]?role|sb_secret_|private[_-]?key|secret/i.test(publishableKey)) {
  throw new Error("TALLYO_SUPABASE_PUBLISHABLE_KEY must be a browser-publishable key, never a secret or service-role credential");
}
if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey) && !/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(publishableKey)) {
  throw new Error("TALLYO_SUPABASE_PUBLISHABLE_KEY is not a recognised publishable-key format");
}

const turnstileEnabled = process.env.TALLYO_TURNSTILE_ENABLED === "true";
const turnstileSiteKey = String(process.env.TALLYO_TURNSTILE_SITE_KEY || "").trim();
if (turnstileEnabled && !turnstileSiteKey) throw new Error("TALLYO_TURNSTILE_SITE_KEY is required when Turnstile is enabled");
if (/secret|private/i.test(turnstileSiteKey)) throw new Error("Only a public Turnstile site key is allowed in the browser build");

const publicSiteUrl = httpsUrl("TALLYO_PUBLIC_SITE_URL", String(process.env.TALLYO_PUBLIC_SITE_URL || "").trim(), { optional: true });
const stripeLiveMode = process.env.TALLYO_STRIPE_LIVE_MODE === "true";
const configuration = [
  "// Generated during the Cloudflare Pages build. Do not commit this file.",
  `window.SUPABASE_URL = ${JSON.stringify(supabaseUrl)};`,
  `window.SUPABASE_ANON_KEY = ${JSON.stringify(publishableKey)};`,
  `window.TURNSTILE_ENABLED = ${JSON.stringify(turnstileEnabled)};`,
  `window.TURNSTILE_SITE_KEY = ${JSON.stringify(turnstileSiteKey)};`,
  `window.STRIPE_LIVE_MODE = ${JSON.stringify(stripeLiveMode)};`,
  `window.TALLYO_PUBLIC_SITE_URL = ${JSON.stringify(publicSiteUrl)};`,
  ""
].join("\n");

const appAssets = [
  "index.html",
  "tailwind.css",
  "app-help-install.js",
  "manifest.json",
  "service-worker.js",
  "tallyo-mark.png",
  "tallyo-wordmark-white.png",
  "icon-192.png",
  "icon-512.png"
];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
for (const asset of appAssets) await copyFile(join(repositoryRoot, asset), join(outputRoot, asset));
await copyFile(join(repositoryRoot, "deployment", "cloudflare", "app", "_headers"), join(outputRoot, "_headers"));
await copyFile(join(repositoryRoot, "deployment", "cloudflare", "app", "_redirects"), join(outputRoot, "_redirects"));
await writeFile(join(outputRoot, "config.js"), configuration, "utf8");

const assetBytes = {};
for (const asset of [...appAssets, "config.js", "_headers", "_redirects"]) {
  assetBytes[asset] = (await stat(join(outputRoot, asset))).size;
}
const indexHtml = await readFile(join(outputRoot, "index.html"), "utf8");
const build = indexHtml.match(/const APP_BUILD = '([^']+)'/)?.[1] || "unknown";
await writeFile(join(outputRoot, "build-report.json"), `${JSON.stringify({ build, assets: Object.keys(assetBytes).sort(), assetBytes }, null, 2)}\n`, "utf8");

console.log(`Built Tallyo app ${build} for Cloudflare Pages with ${Object.keys(assetBytes).length} public files.`);
