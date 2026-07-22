const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'app-dist');
const buildScript = path.join(root, 'scripts', 'build-app-pages.mjs');
const projectConfig = JSON.parse(fs.readFileSync(path.join(root, 'deployment', 'cloudflare', 'pages-projects.json'), 'utf8'));

const syntheticEnv = {
  ...process.env,
  CF_PAGES: '1',
  TALLYO_CLOUDFLARE_ACCESS_CONFIRMED: 'true',
  TALLYO_SUPABASE_URL: 'https://public-preview.example.supabase.co',
  TALLYO_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic_preview_key',
  TALLYO_TURNSTILE_ENABLED: 'false',
  TALLYO_TURNSTILE_SITE_KEY: '',
  TALLYO_STRIPE_LIVE_MODE: 'false',
  TALLYO_PUBLIC_SITE_URL: 'https://website-preview.example.test'
};
const failClosedSentinel = path.join(output, 'fail-closed-sentinel.txt');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(failClosedSentinel, 'preserve', 'utf8');
const blockedBeforeAccess = spawnSync(process.execPath, [buildScript], {
  cwd: root,
  env: { ...syntheticEnv, TALLYO_CLOUDFLARE_ACCESS_CONFIRMED: '' },
  encoding: 'utf8'
});
assert.notEqual(blockedBeforeAccess.status, 0, 'Cloudflare app build must fail before Access is confirmed');
assert.match(blockedBeforeAccess.stderr, /required Access policies are confirmed/);
assert.ok(fs.existsSync(failClosedSentinel), 'blocked Cloudflare app build must not alter existing output');
const build = spawnSync(process.execPath, [buildScript], { cwd: root, env: syntheticEnv, encoding: 'utf8' });
assert.equal(build.status, 0, build.stderr || build.stdout);
assert.doesNotMatch(build.stdout, /synthetic_preview_key|public-preview\.example/, 'build output must never log public configuration values');

const expectedAssets = ['_headers', '_redirects', 'app-help-install.js', 'build-report.json', 'config.js', 'icon-192.png', 'icon-512.png', 'index.html', 'manifest.json', 'service-worker.js', 'tailwind.css', 'tallyo-mark.png', 'tallyo-wordmark-white.png'];
assert.deepEqual(fs.readdirSync(output).sort(), expectedAssets, 'app Pages output must use a strict public-file allowlist');
const generatedConfig = fs.readFileSync(path.join(output, 'config.js'), 'utf8');
assert.match(generatedConfig, /sb_publishable_synthetic_preview_key/);
assert.match(generatedConfig, /window\.TURNSTILE_ENABLED = false/);
assert.match(generatedConfig, /window\.STRIPE_LIVE_MODE = false/);
assert.match(generatedConfig, /window\.TALLYO_PUBLIC_SITE_URL = "https:\/\/website-preview\.example\.test"/);
assert.doesNotMatch(generatedConfig, /service[_-]?role|sb_secret_|private[_-]?key/i);

const rejectedSecret = spawnSync(process.execPath, [buildScript], {
  cwd: root,
  env: { ...syntheticEnv, TALLYO_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_never_browser_side' },
  encoding: 'utf8'
});
assert.notEqual(rejectedSecret.status, 0, 'secret-like Supabase credentials must fail the build');
assert.match(rejectedSecret.stderr, /browser-publishable key/);
assert.doesNotMatch(rejectedSecret.stderr, /sb_secret_never_browser_side/, 'rejected values must not be echoed');

assert.equal(projectConfig.status, 'repository-readiness-only');
assert.deepEqual(projectConfig.projects.website, {
  expectedName: 'tallyo-website',
  rootDirectory: 'website',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  previewMode: 'noindex',
  accessPolicyRequiredBeforeFirstSuccessfulDeploy: true,
  productionBuildRequiresOwnerApproval: true
});
assert.equal(projectConfig.projects.app.expectedName, 'tallyo-app');
assert.equal(projectConfig.projects.app.buildCommand, 'node scripts/build-app-pages.mjs');
assert.equal(projectConfig.projects.app.outputDirectory, 'app-dist');
assert.equal(projectConfig.projects.website.accessPolicyRequiredBeforeFirstSuccessfulDeploy, true);
assert.equal(projectConfig.projects.app.accessPolicyRequiredBeforeFirstSuccessfulDeploy, true);
assert.equal(projectConfig.accessConfirmationVariable, 'TALLYO_CLOUDFLARE_ACCESS_CONFIRMED');
assert.equal(projectConfig.defaultDeploymentReachability, 'public-unless-cloudflare-access-is-enabled');
assert.equal(projectConfig.liveDnsChanged, false);
assert.equal(projectConfig.providerProjectsCreated, false);
assert.equal(projectConfig.existingGitHubPagesRollbackRetained, true);

const headers = fs.readFileSync(path.join(output, '_headers'), 'utf8');
for (const policy of ["default-src 'self'", "frame-ancestors 'none'", 'X-Content-Type-Options: nosniff', 'X-Robots-Tag: noindex', '/config.js', 'Cache-Control: no-store']) {
  assert.ok(headers.includes(policy), `missing app Pages header policy: ${policy}`);
}
assert.doesNotMatch(headers, /Strict-Transport-Security/i, 'HSTS must wait for accepted custom-domain HTTPS');
assert.equal(fs.readFileSync(path.join(output, '_redirects'), 'utf8'), '/* /index.html 200\n');

const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'), 'utf8'));
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
const worker = fs.readFileSync(path.join(output, 'service-worker.js'), 'utf8');
for (const asset of ['./index.html', './config.js', './app-help-install.js', './manifest.json', './tallyo-mark.png', './tallyo-wordmark-white.png']) assert.ok(worker.includes(asset), `worker shell missing ${asset}`);

const migrationMap = fs.readFileSync(path.join(root, 'deployment', 'cloudflare', 'domain-migration-map.md'), 'utf8');
for (const boundary of ['Supabase allowed/site URLs', 'MFA recovery origin allowlist', 'Stripe success/cancel', 'Turnstile', 'Existing GitHub Pages deployment']) {
  assert.ok(migrationMap.includes(boundary), `domain migration map missing ${boundary}`);
}
assert.match(migrationMap, /High/);
assert.match(migrationMap, /Keep until Cloudflare production acceptance/);

console.log('Cloudflare Pages readiness harness passed.');
