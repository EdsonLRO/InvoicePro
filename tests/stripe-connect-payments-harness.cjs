const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const migration = read(
  'supabase',
  'migrations',
  '20260724175920_stripe_connect_payments.sql'
);
const expiredClaimFix = read(
  'supabase',
  'migrations',
  '20260726172105_fix_connect_checkout_expired_claim_constraint.sql'
);
const shared = read('supabase', 'functions', '_shared', 'stripe-connect.ts');
const checkout = read('supabase', 'functions', 'create-connect-checkout', 'index.ts');
const refund = read('supabase', 'functions', 'create-connect-refund', 'index.ts');
const webhook = read('supabase', 'functions', 'stripe-connect-webhook', 'index.ts');
const ownerCheckout = read('supabase', 'functions', 'create-stripe-checkout', 'index.ts');
const ownerRefund = read('supabase', 'functions', 'create-stripe-refund', 'index.ts');
const email = read('supabase', 'functions', 'send-document-email', 'index.ts');
const app = read('index.html');
const config = read('supabase', 'config.toml');
const workflow = read('.github', 'workflows', 'security-checks.yml');

assert.match(migration, /create table public\.stripe_connect_checkout_claims/i);
assert.match(migration, /stripe_connect_checkout_claims_account_owner_fk/i);
assert.match(migration, /stripe_connect_checkout_claims_invoice_owner_fk/i);
assert.match(migration, /stripe_connect_checkout_open_invoice_uidx/i);
assert.match(migration, /alter table public\.stripe_connect_checkout_claims enable row level security/i);
assert.match(
  migration,
  /revoke all on public\.stripe_connect_checkout_claims\s+from public, anon, authenticated/i
);
assert.doesNotMatch(
  migration,
  /create policy[\s\S]{0,160}stripe_connect_checkout_claims/i
);
assert.match(migration, /Stripe Connect Checkout binding is immutable/i);
assert.match(migration, /create or replace function public\.claim_stripe_connect_checkout/i);
assert.match(
  expiredClaimFix,
  /drop constraint if exists stripe_connect_checkout_claim_completion_check/i
);
assert.match(
  expiredClaimFix,
  /claim_status in \('expired', 'failed'\)[\s\S]*?stripe_checkout_session_id is null[\s\S]*?session_expires_at is null/i
);
assert.match(
  expiredClaimFix,
  /claim_status in \('created', 'completed'\)[\s\S]*?stripe_checkout_session_id is not null[\s\S]*?session_expires_at is not null/i
);
assert.match(migration, /onboarding_state = 'active'/i);
assert.match(migration, /card_payments_status = 'active'/i);
assert.match(migration, /payouts_status = 'active'/i);
assert.match(migration, /create or replace function public\.apply_stripe_connect_invoice_event/i);
assert.match(migration, /for update;/i);
assert.match(migration, /return 'stale'/i);
assert.match(migration, /provider,\s+provider_event_id[\s\S]*?'stripe_connect'/i);
assert.match(migration, /insert into public\.stripe_connect_events/i);
assert.match(migration, /update public\.invoices[\s\S]*?set payments = p_payments/i);
assert.match(
  migration,
  /revoke all on function public\.apply_stripe_connect_invoice_event[\s\S]*?from public, anon, authenticated/i
);

for (const [name, source, gate] of [
  ['checkout', checkout, 'STRIPE_CONNECT_CHECKOUT_ENABLED'],
  ['refund', refund, 'STRIPE_CONNECT_REFUNDS_ENABLED'],
  ['webhook', webhook, 'STRIPE_CONNECT_WEBHOOK_ENABLED'],
]) {
  assert.match(source + shared, new RegExp(gate), `${name} must fail closed on its feature gate`);
  assert.match(source + shared, /STRIPE_CONNECT_LIVE_APPROVED/);
  assert.match(source + shared, /STRIPE_CONNECT_SECRET_KEY/);
  assert.match(source + shared, /STRIPE_CONNECT_API_VERSION/);
}

assert.match(shared, /"Stripe-Account": options\.stripeAccountId/);
assert.match(shared, /STRIPE_CONNECT_APP_BASE_URL/);
assert.match(shared, /Deno\.env\.get\("APP_BASE_URL"\)/);
assert.match(shared, /fees_collector\?\.fees_collector|fees_collector/);
assert.match(shared, /losses_collector/);
assert.match(shared, /account\?\.metadata\?\.tallyo_user_id/);
assert.match(shared, /include\.append\("include\[0\]", "configuration\.merchant"\)/);
assert.match(shared, /include\.append\("include\[1\]", "defaults"\)/);
assert.match(shared, /include\.append\("include\[2\]", "requirements"\)/);
assert.doesNotMatch(shared, /include\.append\("include\[\]"/);
assert.match(
  shared,
  /export function connectCapabilityStatus[\s\S]*?\["active", "inactive", "pending", "restricted"\][\s\S]*?: "unknown"/
);
assert.match(
  shared,
  /export function connectOnboardingState[\s\S]*?cardPayments === "active" && payouts === "active"[\s\S]*?includes\("restricted"\)[\s\S]*?\? "restricted"[\s\S]*?: "pending"/
);
const refreshAccountBlock = shared.match(
  /export async function refreshActiveAccount[\s\S]*?export function safeStripeCheckoutUrl/
)?.[0] || '';
assert.match(
  refreshAccountBlock,
  /onboarding_state: onboardingState,\s*card_payments_status: cardPayments,\s*payouts_status: payouts/
);
assert.match(
  refreshAccountBlock,
  /\.eq\("user_id", userId\)\.eq\(\s*"stripe_account_id",\s*mapping\.stripe_account_id/
);
assert.ok(
  refreshAccountBlock.indexOf('.from("stripe_connected_accounts").update') <
    refreshAccountBlock.indexOf('Stripe has paused card payments or payouts'),
  'provider capability state must persist before Checkout/refund rejection'
);
assert.doesNotMatch(refreshAccountBlock, /disconnected_at/);
assert.match(checkout, /refreshActiveAccount/);
assert.match(checkout, /claim_stripe_connect_checkout/);
assert.match(checkout, /complete_stripe_connect_checkout_claim/);
assert.match(checkout, /metadata\[payment_channel\]", "stripe_connect"/);
assert.match(checkout, /crypto\.randomUUID|requestId/);
assert.doesNotMatch(checkout, /application_fee|transfer_data|destination|on_behalf_of/);
assert.doesNotMatch(checkout, /body\.(?:stripeAccount|stripe_account|accountId)/);
assert.doesNotMatch(refund, /body\.(?:stripeAccount|stripe_account|accountId)/);
assert.match(refund, /payment\.providerChannel !== "connect"/);
assert.match(refund, /payment_intents\/\$\{encodeURIComponent\(paymentIntentId\)\}/);
assert.match(refund, /charges\/\$\{encodeURIComponent\(chargeId\)\}/);
assert.match(refund, /Number\(charge\?\.amount_refunded \|\| 0\)/);
assert.match(refund, /tallyo-connect-refund-/);

assert.match(webhook, /const rawBody = await req\.text\(\)/);
assert.match(webhook, /verifyStripeSignature/);
assert.match(webhook, /String\(event\?\.account \|\| ""\)/);
assert.match(webhook, /\.eq\("stripe_account_id", accountId\)/);
assert.match(webhook, /stripe_connect_checkout_claims/);
assert.match(webhook, /apply_stripe_connect_invoice_event/);
assert.match(webhook, /result === "stale" && attempt < 4/g);
assert.equal((webhook.match(/result === "stale" && attempt < 4/g) || []).length, 4);
assert.match(webhook, /stripeV1\(\s*`refunds\//);
assert.match(webhook, /providerChannel === "connect"/);
assert.doesNotMatch(webhook, /STRIPE_WEBHOOK_SECRET/);

assert.match(ownerCheckout, /STRIPE_OWNER_USER_ID/);
assert.match(ownerCheckout, /userData\.user\.id !== ownerUserId/);
assert.match(ownerRefund, /STRIPE_OWNER_USER_ID/);
assert.match(ownerRefund, /userData\.user\.id !== ownerUserId/);
assert.match(email, /STRIPE_OWNER_USER_ID/);
assert.match(email, /functions\/v1\/create-connect-checkout/);
assert.match(app, /useConnectedAccount/);
assert.match(app, /'create-connect-checkout'/);
assert.match(app, /'create-connect-refund'/);
assert.match(app, /payment\.providerChannel === 'connect'/);

assert.match(
  config,
  /\[functions\.create-connect-checkout\][\s\S]*?verify_jwt = true/
);
assert.match(
  config,
  /\[functions\.create-connect-refund\][\s\S]*?verify_jwt = true/
);
assert.match(
  config,
  /\[functions\.stripe-connect-webhook\][\s\S]*?verify_jwt = false/
);
assert.match(workflow, /node tests\/stripe-connect-payments-harness\.cjs/);

console.log('stripe-connect-payments-harness: ok');
