const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const base = path.join(root, 'deployment', 'cloudflare');
const state = JSON.parse(fs.readFileSync(path.join(base, 'preview-acceptance.json'), 'utf8'));
const record = fs.readFileSync(path.join(base, 'preview-acceptance.md'), 'utf8');
const actions = fs.readFileSync(path.join(base, 'owner-actions.md'), 'utf8');

assert.equal(state.status, 'authenticated-content-acceptance-partially-complete');
assert.equal(state.websitePreviewUrl, 'https://f7d12c7b.tallyo-website.pages.dev');
assert.equal(state.appPreviewUrl, 'https://e8ac6e50.tallyo-app.pages.dev');
assert.equal(state.providerProjectsCreated, true);
assert.deepEqual(state.providerProjectNames, ['tallyo-website', 'tallyo-app']);
assert.deepEqual(state.initialBuilds, {
  website: 'blocked-by-access-guard',
  app: 'blocked-by-access-guard'
});
assert.deepEqual(state.approvedRetries, {
  commit: '9fc3f9063527057aa04b9c4544290b0095fc043e',
  website: 'successful',
  app: 'successful'
});
assert.deepEqual(state.accessControls, {
  websiteWildcardPreview: 'owner-policy-enabled-unauthenticated-blocked',
  appWildcardPreview: 'owner-policy-enabled-unauthenticated-blocked',
  websiteMainPagesDev: 'owner-policy-enabled-unauthenticated-blocked',
  appMainPagesDev: 'owner-policy-enabled-unauthenticated-blocked'
});
assert.equal(state.liveDnsChanged, false);
assert.equal(state.productionReleased, false);
assert.equal(state.githubPagesRollbackRetained, true);
assert.equal(state.checks.immutableCommitRecorded, 'passed');
assert.equal(state.checks.mainHostnameAccessControlled, 'passed-after-successful-deployment-unauthenticated-redirect');
assert.equal(state.checks.previewHostnamesAccessControlled, 'passed-after-successful-deployment-unauthenticated-redirect');
assert.equal(state.checks.websiteRoutesAnd404, 'passed-live-26-routes-and-real-404');
assert.match(state.checks.websiteNoindex, /^partial-live-/);
assert.equal(state.checks.websiteResponsiveAndAccessible, 'passed-live-menu-and-current-local-multi-viewport-suite');
assert.equal(state.checks.helperPublicBoundary, 'passed-live-public-and-refusal-boundaries');
assert.equal(state.checks.appRefreshAndRouting, 'passed-live-root-and-hash-route-refresh');
assert.equal(state.checks.appBrowserSafeConfig, 'passed-build-guard-and-live-shell-no-values-recorded');
assert.match(state.checks.pwaInstallAndUpdate, /^partial-live-/);
assert.equal(state.checks.crossDeploymentLinks, 'passed-live-github-pages-rollback-target');
assert.equal(state.checks.noRealOrPaymentDataUsed, 'passed');
assert.equal(state.checks.githubPagesRollbackReachable, 'passed-public-build-2026.07.22.2');
const pendingChecks = new Set(['websiteHeadersAndRedirects', 'appNoindex', 'appHeaders', 'helpAndInstallPanel', 'syntheticAuthJourney', 'rollbackRehearsal']);
for (const [name, value] of Object.entries(state.checks)) {
  if (pendingChecks.has(name)) assert.equal(value, 'pending', `preview check ${name} must remain pending`);
}
assert.ok(!state.deferredHighRiskScopes.some((value) => value.includes('deployment variables and build retries')));
for (const scope of ['financial calculations', 'private account data', 'Supabase Auth', 'Stripe', 'Turnstile', 'custom-domain DNS']) {
  assert.ok(state.deferredHighRiskScopes.some((value) => value.includes(scope)), `missing deferred High-risk scope: ${scope}`);
}

assert.match(record, /Authenticated public-content acceptance partially complete/i);
assert.match(record, /separately approved one-time retries then succeeded/);
assert.match(record, /Main `pages\.dev` Access \| Owner policy enabled/);
assert.match(record, /Preview accepted by Owner: \*\*Pending\*\*/);
assert.match(record, /Acceptance of a preview is not approval for custom-domain DNS/);
assert.match(record, /`noindex` is not a privacy control/);
assert.match(record, /main project hostname and wildcard branch-preview hostnames/);
assert.match(record, /https:\/\/f7d12c7b\.tallyo-website\.pages\.dev/);
assert.match(record, /https:\/\/e8ac6e50\.tallyo-app\.pages\.dev/);
assert.equal((record.match(/\[[xX]\]/g) || []).length, 17, 'only evidenced Access, content, metadata, routing, boundary and rollback-preservation checks may be complete');
assert.match(record, /all 26 generated routes/);
assert.match(record, /in-app browser\s+blocked direct live navigation to `robots\.txt`/);
assert.match(record, /Operating-system installation and update UX remain\s+open/);

for (let step = 1; step <= 14; step += 1) assert.match(actions, new RegExp(`^${step}\\. `, 'm'), `missing separate Owner action ${step}`);
for (const boundary of ['Free document generator (High)', 'Supabase Auth and MFA migration (High)', 'Stripe and email-link migration (High)', 'Connect custom domains and DNS (High)', 'Final production release (High)']) {
  assert.ok(actions.includes(boundary), `missing explicit High boundary: ${boundary}`);
}
assert.match(actions, /Approval for one does not approve any later gate/);
assert.match(actions, /Current analytics and advertising remain disabled/);
assert.match(actions, /access limited to\s+`EdsonLRO\/InvoicePro`/);
assert.match(actions, /Both initial builds stopped at\s+the reviewed Access guard/);
assert.match(actions, /unauthenticated requests to all four destinations\s+redirected to Cloudflare Access sign-in/);
assert.match(actions, /retried each build once/);
assert.match(actions, /Owner must now sign in through Cloudflare Access/);
assert.doesNotMatch(actions, /password\s*[:=]|sb_secret_|sk_live_|whsec_/i);

console.log('Preview acceptance readiness harness passed.');
