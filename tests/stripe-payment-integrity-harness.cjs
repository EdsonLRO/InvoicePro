const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const migration = read('supabase', 'migrations', '20260717165044_atomic_stripe_invoice_events.sql');
const webhook = read('supabase', 'functions', 'stripe-webhook', 'index.ts');
const checkout = read('supabase', 'functions', 'create-stripe-checkout', 'index.ts');
const refund = read('supabase', 'functions', 'create-stripe-refund', 'index.ts');
const email = read('supabase', 'functions', 'send-document-email', 'index.ts');
const app = read('index.html');
const publicConfig = read('config.js');

// The database function must serialize each invoice, reject stale snapshots,
// and write the audit row before the invoice inside the same transaction.
assert.match(migration, /from public\.invoices[\s\S]*?for update;/i);
assert.match(migration, /v_version is distinct from p_expected_version[\s\S]*?return 'stale'/i);
assert.match(migration, /new\.stripe_event_version := old\.stripe_event_version \+ 1/i);
assert.match(migration, /before update on public\.invoices/i);
assert.match(migration, /insert into public\.audit_events[\s\S]*?update public\.invoices/i);
assert.match(migration, /on conflict \(provider, provider_event_id\)[\s\S]*?do nothing/i);
assert.match(migration, /revoke all on function public\.apply_stripe_invoice_event[\s\S]*?from public, anon, authenticated/i);
assert.match(migration, /grant execute on function public\.apply_stripe_invoice_event[\s\S]*?to service_role/i);

// Every webhook invoice mutation must go through the atomic RPC. Direct JSONB
// read-modify-write updates in the webhook would reintroduce lost updates.
assert.match(webhook, /admin\.rpc\("apply_stripe_invoice_event"/);
assert.doesNotMatch(webhook, /admin\.from\("invoices"\)\s*\.update\(/);
assert.match(webhook, /result === "stale" && attempt < 4/g);
assert.equal((webhook.match(/result === "stale" && attempt < 4/g) || []).length, 4);

// Refund event delivery can be out of order, so current provider state is
// fetched and identity-checked before a financial mutation is computed.
assert.match(webhook, /retrieveStripeRefund\(refundId\)/);
assert.match(webhook, /paymentIntentId !== eventPaymentIntentId/);
assert.match(webhook, /const refundFailed = refundStatus === "failed";/);
assert.match(webhook, /refundFailed \|\| refundStatus === "canceled"/);
assert.doesNotMatch(webhook, /event\.type === "refund\.failed"\s*\|\|/);

// Both app-created and email-created Checkout Sessions are deterministic and
// the trusted creation audit is required before a URL can leave the server.
for (const [label, source] of [['app checkout', checkout], ['email checkout', email]]) {
  assert.match(source, /checkoutIdempotencyKey\(/, `${label} must derive an idempotency key`);
  assert.match(source, /"Idempotency-Key": idempotencyKey/, `${label} must send its key to Stripe`);
  assert.match(source, /required audit event insert failed/, `${label} audit failure must fail closed`);
  assert.match(source, /Stripe key mode does not match STRIPE_LIVE_MODE/, `${label} must reject mixed test\/live configuration`);
  assert.match(source, /STRIPE_PAYMENTS_ENABLED/, `${label} must retain the server-side live kill switch`);
  assert.match(source, /STRIPE_API_VERSION is required in live mode/, `${label} must pin the live Stripe API version`);
}
assert.match(refund, /"Idempotency-Key": idempotencyKey/);
assert.match(refund, /refund request audit insert skipped/);
assert.match(refund, /Stripe key mode does not match STRIPE_LIVE_MODE/);
assert.match(refund, /STRIPE_PAYMENTS_ENABLED/);
assert.match(refund, /STRIPE_API_VERSION is required in live mode/);
assert.match(webhook, /Stripe key mode does not match STRIPE_LIVE_MODE/);
assert.match(webhook, /STRIPE_API_VERSION is required in live mode/);
assert.match(app, /v-if="!stripeLiveMode"[\s\S]*?Stripe test mode/);
assert.match(app, /stripeLiveMode: window\.STRIPE_LIVE_MODE === true/);
assert.match(publicConfig, /window\.STRIPE_LIVE_MODE = true;/);

// Model the optimistic-concurrency contract: two workers can read version 1,
// one becomes stale, retries from version 2, and both distinct events survive.
const state = { version: 1, events: [] };
function apply(expectedVersion, eventId) {
  if (state.events.includes(eventId)) return 'duplicate';
  if (state.version !== expectedVersion) return 'stale';
  state.events.push(eventId);
  state.version += 1;
  return 'applied';
}
assert.equal(apply(1, 'evt_payment'), 'applied');
assert.equal(apply(1, 'evt_dispute'), 'stale');
assert.equal(apply(state.version, 'evt_dispute'), 'applied');
assert.deepEqual(state.events, ['evt_payment', 'evt_dispute']);
assert.equal(apply(state.version, 'evt_payment'), 'duplicate');

console.log('Stripe payment integrity harness passed.');
