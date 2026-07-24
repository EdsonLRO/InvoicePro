const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const migrationName = fs.readdirSync(path.join(root, 'supabase', 'migrations'))
  .find((name) => name.endsWith('_stripe_billing_test_foundation.sql'));
assert.ok(migrationName, 'timestamped Stripe Billing migration must exist');

const migration = read('supabase', 'migrations', migrationName);
const checkout = read('supabase', 'functions', 'create-billing-checkout', 'index.ts');
const portal = read('supabase', 'functions', 'create-billing-portal', 'index.ts');
const webhook = read('supabase', 'functions', 'stripe-billing-webhook', 'index.ts');
const invoiceWebhook = read('supabase', 'functions', 'stripe-webhook', 'index.ts');
const config = read('supabase', 'config.toml');
const websiteConfig = read('website', 'src', 'config.mjs');
const readiness = JSON.parse(read('website', 'content', 'subscription-readiness.json'));

const tables = [
  'billing_customers',
  'billing_subscriptions',
  'billing_events',
  'account_entitlements',
];
for (const table of tables) {
  assert.match(migration, new RegExp(`create table public\\.${table}\\b`, 'i'));
  assert.match(
    migration,
    new RegExp(`alter table public\\.${table} enable row level security`, 'i'),
    `${table} must enable RLS`,
  );
  assert.match(
    migration,
    new RegExp(`on public\\.${table}[\\s\\S]*?for select[\\s\\S]*?to authenticated[\\s\\S]*?auth\\.uid\\(\\)[\\s\\S]*?user_id`, 'i'),
    `${table} must scope authenticated reads to its owner`,
  );
  assert.match(
    migration,
    new RegExp(`revoke all on public\\.${table} from public, anon, authenticated`, 'i'),
    `${table} must revoke browser writes before granting reads`,
  );
  assert.match(
    migration,
    new RegExp(`grant select on public\\.${table} to authenticated`, 'i'),
    `${table} must grant read-only browser access`,
  );
  assert.doesNotMatch(
    migration,
    new RegExp(`grant (?:insert|update|delete|all) on public\\.${table} to authenticated`, 'i'),
    `${table} must not grant authenticated writes`,
  );
}

assert.match(migration, /from public\.billing_customers[\s\S]*?for update;/i);
assert.match(
  migration,
  /foreign key \(user_id, stripe_customer_id\)[\s\S]*?references public\.billing_customers\(user_id, stripe_customer_id\)/i,
);
assert.match(migration, /where stripe_event_id = p_event_id[\s\S]*?return 'duplicate'/i);
assert.match(migration, /p_event_created_at < v_existing_event_at[\s\S]*?'stale'/i);
assert.match(
  migration,
  /p_event_created_at = v_existing_event_at[\s\S]*?p_stripe_subscription_id <> v_existing_subscription_id/i,
);
assert.match(
  migration,
  /insert into public\.billing_events[\s\S]*?insert into public\.billing_subscriptions[\s\S]*?insert into public\.account_entitlements/i,
);
assert.match(migration, /p_provider_status = 'active'[\s\S]*?v_access_state := 'full'/i);
assert.match(migration, /p_provider_status = 'past_due'[\s\S]*?v_access_state := 'grace'/i);
assert.match(migration, /interval '7 days'/i);
assert.match(
  migration,
  /p_provider_status in \('active', 'past_due'\)[\s\S]*?p_current_period_end is null[\s\S]*?raise exception/i,
);
assert.match(
  migration,
  /revoke all on function public\.apply_stripe_billing_event[\s\S]*?from public, anon, authenticated/i,
);
assert.match(
  migration,
  /grant execute on function public\.apply_stripe_billing_event[\s\S]*?to service_role/i,
);
assert.match(migration, /raise exception 'billing_events are append-only'/i);
assert.match(migration, /before update on public\.billing_events/i);
assert.match(migration, /before delete on public\.billing_events/i);
assert.match(
  migration,
  /revoke all on function public\.account_entitlement_allows_write\(uuid\)[\s\S]*?from public, anon, authenticated/i,
);
assert.match(migration, /access_state in \('full', 'grace'\)[\s\S]*?effective_until > now\(\)/i);

// Checkout accepts a business choice, never a browser-provided Stripe Price.
assert.match(checkout, /\["monthly", "annual"\]\.includes\(interval\)/);
assert.match(checkout, /STRIPE_BILLING_MONTHLY_PRICE_ID/);
assert.match(checkout, /STRIPE_BILLING_ANNUAL_PRICE_ID/);
assert.doesNotMatch(checkout, /body\.(?:price|priceId|amount)/);
assert.match(checkout, /STRIPE_BILLING_ENABLED"\) !== "true"/);
assert.match(checkout, /STRIPE_BILLING_TEST_MODE"\) !== "true"/);
assert.match(checkout, /\^\(\?:sk\|rk\)_test_/);
assert.match(checkout, /params\.set\("mode", "subscription"\)/);
assert.match(checkout, /subscription_data\[metadata\]\[tallyo_user_id\]/);
assert.match(checkout, /client_reference_id", user\.id/);
assert.match(checkout, /getAuthenticatorAssuranceLevel/);
assert.match(checkout, /aal\.nextLevel === "aal2" && aal\.currentLevel !== "aal2"/);
assert.match(checkout, /email_confirmed_at/);
assert.match(checkout, /"Idempotency-Key": idempotencyKey/);
assert.match(checkout, /billing_customers/);
assert.match(
  checkout,
  /\.from\("billing_subscriptions"\)[\s\S]*?!\["canceled", "incomplete_expired"\]\.includes/,
);

// Portal ownership is resolved from the authenticated user, not request data.
assert.match(portal, /STRIPE_BILLING_ENABLED"\) !== "true"/);
assert.match(portal, /STRIPE_BILLING_TEST_MODE"\) !== "true"/);
assert.match(portal, /getAuthenticatorAssuranceLevel/);
assert.match(portal, /\.from\("billing_customers"\)[\s\S]*?\.eq\("user_id", user\.id\)/);
assert.doesNotMatch(portal, /req\.json\(/);
assert.match(portal, /billing_portal\/sessions/);

// The separate Billing endpoint verifies the untouched raw body, rejects live
// events, refreshes current provider state and resolves ownership from the DB.
assert.match(webhook, /const rawBody = await req\.text\(\)/);
assert.match(webhook, /verifyStripeSignature\([\s\S]*?rawBody/);
assert.match(webhook, /event = JSON\.parse\(rawBody\)/);
assert.ok(
  webhook.indexOf('verifyStripeSignature(') < webhook.indexOf('event = JSON.parse(rawBody)'),
  'signature verification must happen before parsing or mutation',
);
assert.match(webhook, /event\?\.livemode !== false/);
assert.match(webhook, /allowedEvents\.has/);
assert.match(webhook, /retrieveSubscription\(subscriptionId, config\)/);
assert.match(webhook, /\.from\("billing_customers"\)[\s\S]*?\.eq\("stripe_customer_id", customerId\)/);
assert.match(webhook, /priceId === config\.monthlyPrice[\s\S]*?priceId === config\.annualPrice/);
assert.match(webhook, /admin\.rpc\([\s\S]*?"apply_stripe_billing_event"/);
assert.doesNotMatch(webhook, /\.from\("invoices"\)/);
assert.doesNotMatch(invoiceWebhook, /account_entitlements|billing_subscriptions|apply_stripe_billing_event/);

for (const [name, source] of Object.entries({ checkout, portal, webhook })) {
  assert.doesNotMatch(source, /sk_(?:live|test)_[A-Za-z0-9]{16,}/, `${name} contains a Stripe key`);
  assert.doesNotMatch(source, /whsec_[A-Za-z0-9]{16,}/, `${name} contains a webhook secret`);
  assert.doesNotMatch(source, /console\.(?:log|info)\(/, `${name} must not log request or customer data`);
}

assert.match(config, /\[functions\.create-billing-checkout\][\s\S]*?verify_jwt = true/);
assert.match(config, /\[functions\.create-billing-portal\][\s\S]*?verify_jwt = true/);
assert.match(config, /\[functions\.stripe-billing-webhook\][\s\S]*?verify_jwt = false/);
assert.match(websiteConfig, /subscriptionCheckoutEnabled: false/);
assert.equal(readiness.publicCheckoutEnabled, false);
assert.equal(readiness.liveStripeBillingConfigured, false);

// Model the verified lifecycle contract independently of provider calls.
const state = {
  lastCreated: 0,
  events: new Set(),
  status: null,
  access: null,
};
function apply(eventId, created, status) {
  if (state.events.has(eventId)) return 'duplicate';
  state.events.add(eventId);
  if (created < state.lastCreated) return 'stale';
  state.lastCreated = created;
  state.status = status;
  state.access = status === 'active'
    ? 'full'
    : status === 'past_due'
    ? 'grace'
    : 'read_only';
  return 'applied';
}
assert.equal(apply('evt_active', 20, 'active'), 'applied');
assert.equal(state.access, 'full');
assert.equal(apply('evt_active', 20, 'active'), 'duplicate');
assert.equal(apply('evt_old', 10, 'unpaid'), 'stale');
assert.equal(state.access, 'full', 'a delayed event must not downgrade current access');
assert.equal(apply('evt_failed', 30, 'past_due'), 'applied');
assert.equal(state.access, 'grace');
assert.equal(apply('evt_unpaid', 40, 'unpaid'), 'applied');
assert.equal(state.access, 'read_only');
assert.equal(apply('evt_recovered', 50, 'active'), 'applied');
assert.equal(state.access, 'full');

console.log('Stripe Billing foundation harness passed.');
