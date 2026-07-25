const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const app = read('index.html');
const publicConfig = read('config.js');
const buildScript = read('scripts/build-app-pages.mjs');

assert.match(publicConfig, /window\.TALLYO_BILLING_TEST_ENABLED = false;/, 'public configuration must keep Billing test UI disabled');
assert.match(publicConfig, /window\.TALLYO_BILLING_LIVE_ENABLED = false;/, 'public configuration must keep live Billing UI disabled');
assert.match(app, /window\.TALLYO_BILLING_TEST_ENABLED === true && window\.STRIPE_LIVE_MODE !== true/, 'Billing UI must preserve its explicit test gate');
assert.match(app, /window\.TALLYO_BILLING_LIVE_ENABLED === true && window\.STRIPE_LIVE_MODE === true/, 'Billing UI must require both explicit live gates');
assert.match(buildScript, /TALLYO_BILLING_TEST_ENABLED cannot be enabled when TALLYO_STRIPE_LIVE_MODE is true/, 'Cloudflare build must reject a mixed Billing-test/live configuration');
assert.match(buildScript, /TALLYO_BILLING_LIVE_ENABLED requires TALLYO_STRIPE_LIVE_MODE=true/, 'Cloudflare build must reject live Billing controls in test mode');
assert.match(buildScript, /Live Billing browser controls require explicit public-release approval/, 'Cloudflare build must require an explicit live Billing release gate');

assert.match(app, /v-if="billing\.enabled"/, 'Billing controls must be absent when the test gate is off');
assert.match(app, /openBillingCheckout\('monthly'\)/);
assert.match(app, /openBillingCheckout\('annual'\)/);
assert.match(app, /body: \{ interval, requestId: crypto\.randomUUID\(\) \}/, 'Checkout must send only the plan interval and a fresh request ID');
assert.match(app, /functions\.invoke\('create-billing-checkout'/);
assert.match(app, /functions\.invoke\('create-billing-portal'/);
assert.match(app, /billingRedirectUrl\(data && data\.url, 'checkout\.stripe\.com'\)/, 'Checkout redirects must be restricted to Stripe Checkout');
assert.match(app, /billingRedirectUrl\(data && data\.url, 'billing\.stripe\.com'\)/, 'Portal redirects must be restricted to Stripe Billing');
assert.doesNotMatch(app, /stripe_customer_id|stripe_subscription_id/, 'browser queries must not request provider identifiers');
assert.doesNotMatch(app, /STRIPE_BILLING_SECRET_KEY|STRIPE_BILLING_WEBHOOK_SECRET/, 'browser code must never reference Billing secrets');

for (const table of ['billing_subscriptions', 'account_entitlements']) {
  assert.match(app, new RegExp(`\\.from\\('${table}'\\)`), `Billing state must be read through owner-scoped ${table} RLS`);
}
assert.match(app, /\['success', 'cancelled'\]\.includes\(callback\)/, 'only documented Billing callback states may be handled');
assert.match(app, /url\.searchParams\.delete\('subscription'\)/, 'callback query state must be removed after handling');
assert.match(app, /Your subscription payment was received/);
assert.match(app, /No payment was completed/);

console.log('Stripe Billing client harness passed.');
