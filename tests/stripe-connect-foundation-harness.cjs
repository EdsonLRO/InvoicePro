const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const migration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '20260724174500_stripe_connect_foundation.sql'),
  'utf8'
);
const handler = fs.readFileSync(
  path.join(root, 'supabase', 'functions', 'manage-stripe-connect', 'index.ts'),
  'utf8'
);
const config = fs.readFileSync(path.join(root, 'supabase', 'config.toml'), 'utf8');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workflow = fs.readFileSync(
  path.join(root, '.github', 'workflows', 'security-checks.yml'),
  'utf8'
);

assert.match(migration, /create table public\.stripe_connected_accounts/i);
assert.match(migration, /user_id uuid primary key references auth\.users\(id\)/i);
assert.match(migration, /stripe_account_id text not null unique/i);
assert.match(migration, /fees_collector = 'stripe'/i);
assert.match(migration, /losses_collector = 'stripe'/i);
assert.match(migration, /dashboard_access = 'full'/i);
assert.match(migration, /alter table public\.stripe_connected_accounts enable row level security/i);
assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/i);
assert.match(migration, /revoke all on public\.stripe_connected_accounts\s+from public, anon, authenticated/i);
assert.match(migration, /grant select on public\.stripe_connected_accounts to authenticated/i);
assert.doesNotMatch(
  migration,
  /grant\s+(?:insert|update|delete|all).*stripe_connected_accounts to authenticated/i
);
assert.match(migration, /create table public\.stripe_connect_events/i);
assert.match(migration, /stripe_connect_events_account_owner_fk/i);
assert.match(migration, /stripe_connect_events_user_created_idx/i);
assert.match(migration, /stripe_connect_events_account_created_idx/i);
assert.match(migration, /stripe_connect_events are append-only/i);
assert.doesNotMatch(
  migration,
  /create policy[\s\S]{0,200}on public\.stripe_connect_events/i
);

assert.match(handler, /STRIPE_CONNECT_ENABLED/);
assert.match(handler, /STRIPE_CONNECT_LIVE_MODE/);
assert.match(handler, /STRIPE_CONNECT_LIVE_APPROVED/);
assert.match(handler, /STRIPE_CONNECT_SECRET_KEY/);
assert.match(handler, /STRIPE_CONNECT_API_VERSION/);
assert.match(handler, /STRIPE_CONNECT_APP_BASE_URL/);
assert.match(handler, /Deno\.env\.get\("APP_BASE_URL"\)/);
assert.match(handler, /Complete two-factor verification first/);
assert.match(handler, /https:\/\/api\.stripe\.com\/v2\/core\//);
assert.match(handler, /dashboard:\s*"full"/);
assert.match(handler, /fees_collector:\s*"stripe"/);
assert.match(handler, /losses_collector:\s*"stripe"/);
assert.match(handler, /card_payments:\s*\{\s*requested:\s*true\s*\}/);
const createAccountBlock = handler.match(
  /async function createAccount[\s\S]*?function stripeLinkUrl/
)?.[0] || '';
assert.doesNotMatch(createAccountBlock, /stripe_balance/);
assert.match(handler, /metadata:\s*\{\s*tallyo_user_id:\s*user\.id\s*\}/);
assert.match(handler, /String\(account\?\.metadata\?\.tallyo_user_id/);
assert.match(handler, /tallyo-connect-account-\$\{await sha256\(\[user\.id\]\)\}/);
assert.doesNotMatch(
  handler,
  /tallyo-connect-account-\$\{await sha256\(\[\s*user\.id,\s*requestId/
);
assert.match(handler, /account_onboarding/);
assert.match(handler, /account_update/);
assert.match(handler, /future_requirements:\s*"include"/);
assert.match(handler, /stripe_connect=refresh&stripe_connect_action=\$\{action\}/);
assert.match(handler, /parsed\.hostname\.endsWith\("\.stripe\.com"\)/);
assert.match(handler, /\.from\("stripe_connected_accounts"\)/);
assert.match(handler, /\.eq\("user_id", user\.id\)/);
assert.doesNotMatch(handler, /body\.(?:stripeAccount|stripe_account|accountId)/);
assert.doesNotMatch(handler, /payment_intent|checkout\/sessions|refunds|transfers|application_fee/);
assert.doesNotMatch(handler, /console\.(?:log|warn|error)/);
assert.doesNotMatch(handler, /body\?\.error\?\.(?:message|code)/);

assert.match(
  config,
  /\[functions\.manage-stripe-connect\][\s\S]*?verify_jwt = true/
);

assert.match(app, /Customer Card Payments/);
assert.match(app, /\.from\('stripe_connected_accounts'\)/);
assert.match(app, /select\('onboarding_state, card_payments_status, payouts_status, provider_updated_at'\)/);
assert.match(app, /functions\.invoke\('manage-stripe-connect'/);
assert.match(app, /body: \{ action, requestId: crypto\.randomUUID\(\) \}/);
assert.match(app, /window\.location\.assign\(result\.url\)/);
assert.match(app, /onboarding_state === 'pending' \? 'onboard' : 'update'/);
assert.match(app, /handleStripeConnectCallback/);
assert.match(app, /url\.searchParams\.delete\('stripe_connect'\)/);
assert.match(app, /callback === 'refresh'/);
assert.match(app, /Tallyo does not store your card details, identity documents or bank information/);
assert.doesNotMatch(app, /stripeConnect[\s\S]{0,200}stripe_account_id/);
assert.match(workflow, /node tests\/stripe-connect-foundation-harness\.cjs/);

console.log('stripe-connect-foundation-harness: ok');
