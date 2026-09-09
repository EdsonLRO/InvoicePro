const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const migration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '20260909115547_complimentary_access_by_email.sql'),
  'utf8',
);
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const probes = fs.readFileSync(path.join(__dirname, 'complimentary-access-probes.sql'), 'utf8');

const tableDefinition = migration.match(
  /create table private\.complimentary_access_grants \(([\s\S]*?)\n\);/i,
)?.[1] || '';

assert.match(tableDefinition, /user_id uuid primary key references auth\.users\(id\) on delete cascade/i);
assert.match(tableDefinition, /granted_at timestamptz not null default now\(\)/i);
assert.match(tableDefinition, /expires_at timestamptz/i);
assert.match(tableDefinition, /revoked_at timestamptz/i);
assert.doesNotMatch(tableDefinition, /\bemail\b/i, 'the grant table must not duplicate Auth email addresses');
assert.match(migration, /alter table private\.complimentary_access_grants enable row level security/i);
assert.match(
  migration,
  /revoke all on private\.complimentary_access_grants[\s\S]*?from public, anon, authenticated, service_role/i,
);
assert.match(migration, /grant select on private\.complimentary_access_grants to service_role/i);
assert.doesNotMatch(migration, /grant (?:insert|update|delete|all)[\s\S]{0,100}complimentary_access_grants to service_role/i);

for (const signature of [
  'private\\.grant_complimentary_access_by_email\\(text, timestamptz\\)',
  'private\\.revoke_complimentary_access_by_email\\(text\\)',
]) {
  assert.match(
    migration,
    new RegExp(`revoke all on function ${signature}[\\s\\S]*?from public, anon, authenticated, service_role`, 'i'),
  );
}

assert.match(migration, /where lower\(email\) = v_email[\s\S]*?email_confirmed_at is not null/i);
assert.match(migration, /on conflict \(user_id\) do update[\s\S]*?revoked_at = null/i);
assert.match(migration, /create or replace function public\.current_account_has_complimentary_access\(\)/i);
assert.match(migration, /security definer[\s\S]*?set search_path = ''/i);
assert.match(migration, /where user_id = \(select auth\.uid\(\)\)[\s\S]*?revoked_at is null/i);
assert.match(
  migration,
  /grant execute on function public\.current_account_has_complimentary_access\(\)[\s\S]*?to authenticated/i,
);

for (const helper of [
  /create or replace function private\.current_account_entitlement_allows_write\(\)([\s\S]*?)revoke all on function private/i,
  /create or replace function public\.account_entitlement_allows_write\([\s\S]*?\)([\s\S]*?)revoke all on function public/i,
]) {
  const body = migration.match(helper)?.[1] || '';
  assert.match(body, /account_entitlements/i);
  assert.match(body, /complimentary_access_grants/i);
  assert.match(body, /revoked_at is null/i);
  assert.match(body, /expires_at is null or expires_at > now\(\)/i);
}

assert.match(app, /complimentaryAccess: false/);
assert.match(app, /supabaseClient\.rpc\('current_account_has_complimentary_access'\)/);
assert.match(app, /this\.billing\.complimentaryAccess = complimentaryAccessResult\.data === true/);
assert.match(app, /Complimentary access/);
assert.match(app, /No subscription payment is required while this access remains active\./);
assert.match(app, /!billing\.complimentaryAccess && \(!billing\.subscription/);

for (const evidence of [
  /authenticated role can grant complimentary access/i,
  /unconfirmed account received complimentary access/i,
  /cross-tenant insert succeeded/i,
  /revoked complimentary access still allowed a write/i,
  /expired complimentary access was reported active/i,
  /service role can mutate complimentary grants/i,
]) {
  assert.match(probes, evidence);
}

for (const [name, source] of Object.entries({ migration, app, probes })) {
  assert.doesNotMatch(source, /sk_(?:live|test)_[A-Za-z0-9]{16,}/, `${name} contains a Stripe key`);
  assert.doesNotMatch(source, /whsec_[A-Za-z0-9]{16,}/, `${name} contains a webhook secret`);
}

console.log('Complimentary access harness passed.');
