const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const base = path.join(root, 'deployment', 'cloudflare');
const state = JSON.parse(fs.readFileSync(path.join(base, 'preview-acceptance.json'), 'utf8'));
const record = fs.readFileSync(path.join(base, 'preview-acceptance.md'), 'utf8');
const actions = fs.readFileSync(path.join(base, 'owner-actions.md'), 'utf8');

assert.equal(state.status, 'provider-projects-created-builds-blocked');
assert.equal(state.websitePreviewUrl, null);
assert.equal(state.appPreviewUrl, null);
assert.equal(state.providerProjectsCreated, true);
assert.deepEqual(state.providerProjectNames, ['tallyo-website', 'tallyo-app']);
assert.deepEqual(state.initialBuilds, {
  website: 'blocked-by-access-guard',
  app: 'blocked-by-access-guard'
});
assert.equal(state.liveDnsChanged, false);
assert.equal(state.productionReleased, false);
assert.equal(state.githubPagesRollbackRetained, true);
assert.ok(Object.values(state.checks).every((value) => value === 'pending'), 'no preview check may be pre-accepted');
assert.ok(state.deferredHighRiskScopes.some((value) => value.includes('GitHub application authorization')));
for (const scope of ['financial calculations', 'private account data', 'Supabase Auth', 'Stripe', 'Turnstile', 'custom-domain DNS']) {
  assert.ok(state.deferredHighRiskScopes.some((value) => value.includes(scope)), `missing deferred High-risk scope: ${scope}`);
}

assert.match(record, /no preview deployment exists yet/i);
assert.match(record, /Both blocked by the reviewed Access guard; no deployment available/);
assert.match(record, /Preview accepted by Owner: \*\*Pending\*\*/);
assert.match(record, /Acceptance of a preview is not approval for custom-domain DNS/);
assert.match(record, /`noindex` is not a privacy control/);
assert.match(record, /main project hostname and wildcard branch-preview hostnames/);
assert.doesNotMatch(record, /https:\/\/[a-z0-9-]+\.pages\.dev/i, 'do not invent preview URLs');
assert.doesNotMatch(record, /\[[xX]\]/, 'no preview acceptance checkbox may be pre-checked');

for (let step = 1; step <= 14; step += 1) assert.match(actions, new RegExp(`^${step}\\. `, 'm'), `missing separate Owner action ${step}`);
for (const boundary of ['Free document generator (High)', 'Supabase Auth and MFA migration (High)', 'Stripe and email-link migration (High)', 'Connect custom domains and DNS (High)', 'Final production release (High)']) {
  assert.ok(actions.includes(boundary), `missing explicit High boundary: ${boundary}`);
}
assert.match(actions, /Approval for one does not approve any later gate/);
assert.match(actions, /Current analytics and advertising remain disabled/);
assert.match(actions, /access limited to\s+`EdsonLRO\/InvoicePro`/);
assert.match(actions, /Both initial builds stopped at\s+the reviewed Access guard/);
assert.doesNotMatch(actions, /password\s*[:=]|sb_secret_|sk_live_|whsec_/i);

console.log('Preview acceptance readiness harness passed.');
