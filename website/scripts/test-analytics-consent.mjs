import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildScript = join(websiteRoot, "scripts", "build.mjs");
const distRoot = join(websiteRoot, "dist");
const cleanEnv = {
  ...process.env,
  CF_PAGES: "",
  TALLYO_CLOUDFLARE_ACCESS_CONFIRMED: "",
  TALLYO_SITE_MODE: "production",
  TALLYO_SUBSCRIPTIONS_ENABLED: "",
  TALLYO_PUBLIC_AI_HELPER_ENABLED: "",
  TALLYO_CONNECT_PAYMENTS_ENABLED: "",
  TALLYO_GA4_ENABLED: "true",
  TALLYO_GA4_MEASUREMENT_ID: "G-PZFZKCWZ7M",
  TALLYO_GA4_PRIVATE_PREVIEW_APPROVED: "",
  TALLYO_GA4_PUBLIC_RELEASE_APPROVED: ""
};

const unapproved = spawnSync(process.execPath, [buildScript], { encoding: "utf8", env: cleanEnv });
assert.notEqual(unapproved.status, 0, "production Analytics must fail closed without explicit release approval");
assert.match(unapproved.stderr, /Analytics production build blocked until public release is approved/);

const wrongMeasurement = spawnSync(process.execPath, [buildScript], {
  encoding: "utf8",
  env: { ...cleanEnv, TALLYO_GA4_MEASUREMENT_ID: "G-WRONG", TALLYO_GA4_PUBLIC_RELEASE_APPROVED: "true" }
});
assert.notEqual(wrongMeasurement.status, 0, "an unreviewed Measurement ID must fail closed");
assert.match(wrongMeasurement.stderr, /reviewed Tallyo GA4 Measurement ID/);

try {
  execFileSync(process.execPath, [buildScript], {
    stdio: "inherit",
    env: { ...cleanEnv, TALLYO_GA4_PUBLIC_RELEASE_APPROVED: "true" }
  });
  const home = readFileSync(join(distRoot, "index.html"), "utf8");
  const headers = readFileSync(join(distRoot, "_headers"), "utf8");
  const config = readFileSync(join(distRoot, "assets", "analytics-config.mjs"), "utf8");
  const consentStyles = readFileSync(join(distRoot, "assets", "analytics-consent.css"), "utf8");
  assert.match(config, /"enabled":true/);
  assert.match(config, /"environment":"production"/);
  assert.match(config, /"measurementId":"G-PZFZKCWZ7M"/);
  assert.match(headers, /script-src[^;\n]+https:\/\/www\.googletagmanager\.com/);
  assert.match(headers, /connect-src[^;\n]+https:\/\/www\.google-analytics\.com https:\/\/region1\.google-analytics\.com/);
  assert.doesNotMatch(home, /<script[^>]+src="https:\/\/www\.googletagmanager\.com/i, "the accepted tag remains dynamically consent-gated");
  assert.match(home, /data-cookie-accept>Accept analytics<\/button>/);
  assert.match(home, /data-cookie-reject>Reject analytics<\/button>/);
  assert.match(home, /data-cookie-settings>Manage preferences<\/button>/);
  assert.match(consentStyles, /\.cookie-choice\s*\{[^}]*min-height:\s*2\.75rem/s, "consent choices keep accessible tap targets");
  assert.match(consentStyles, /\.cookie-choice:focus-visible\s*\{/s, "consent choices retain a visible keyboard focus treatment");
  assert.match(consentStyles, /@media \(max-width: 39rem\)[\s\S]*grid-template-columns:\s*1fr/s, "consent choices stack on narrow screens");
} finally {
  execFileSync(process.execPath, [buildScript], {
    stdio: "inherit",
    env: {
      ...cleanEnv,
      TALLYO_SITE_MODE: "preview",
      TALLYO_GA4_ENABLED: "",
      TALLYO_GA4_MEASUREMENT_ID: "",
      TALLYO_GA4_PUBLIC_RELEASE_APPROVED: ""
    }
  });
}

console.log("Website Analytics activation-gate checks passed.");
