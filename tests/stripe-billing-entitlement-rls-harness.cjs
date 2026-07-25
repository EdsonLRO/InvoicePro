const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const migration = read(
  'supabase',
  'migrations',
  '20260725014434_enforce_subscription_write_entitlements.sql',
);
const probes = read('tests', 'stripe-billing-entitlement-rls-probes.sql');

assert.match(migration, /create table private\.commercial_feature_flags/i);
assert.match(migration, /subscription_write_enforcement/i);
assert.match(migration, /enabled boolean not null default false/i);
assert.match(
  migration,
  /revoke all on private\.commercial_feature_flags[\s\S]*?from public, anon, authenticated, service_role/i,
);
assert.match(
  migration,
  /grant select on private\.commercial_feature_flags to service_role/i,
);
assert.match(
  migration,
  /create or replace function private\.current_account_entitlement_allows_write\(\)/i,
);
assert.match(migration, /security definer/i);
assert.match(migration, /set search_path = ''/i);
assert.match(migration, /where user_id = \(select auth\.uid\(\)\)/i);
assert.match(migration, /access_state in \('full', 'grace'\)/i);
assert.match(migration, /effective_until > now\(\)/i);
assert.match(
  migration,
  /not coalesce\([\s\S]*?commercial_feature_flags[\s\S]*?true\)[\s\S]*?or exists/i,
  'write helpers must permit rollout only while the private gate exists and is disabled',
);
assert.match(
  migration,
  /create or replace function public\.account_entitlement_allows_write\([\s\S]*?commercial_feature_flags[\s\S]*?subscription_write_enforcement/i,
  'service-side guards must use the same private rollout gate',
);
assert.match(
  migration,
  /revoke all on function private\.current_account_entitlement_allows_write\(\)[\s\S]*?from public, anon, authenticated, service_role/i,
);
assert.match(
  migration,
  /grant execute on function private\.current_account_entitlement_allows_write\(\)[\s\S]*?to authenticated/i,
);

for (const policyName of [
  'own company_settings',
  'own customers',
  'own saved_items',
  'own invoices',
  'own recurring',
]) {
  for (const operation of ['insert', 'update', 'delete']) {
    const escapedPolicyName = policyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(
      migration,
      new RegExp(
        `alter policy "${escapedPolicyName} - ${operation}"[\\s\\S]{0,400}` +
          'current_account_entitlement_allows_write',
        'i',
      ),
      `${policyName} ${operation} must require a verified write entitlement`,
    );
  }
}

assert.doesNotMatch(
  migration,
  /alter policy "own (?:company_settings|customers|saved_items|invoices|recurring) - select"/i,
  'owner-scoped reads must remain available in restricted mode',
);
assert.doesNotMatch(
  migration,
  /grant execute on function private\.current_account_entitlement_allows_write\(\)[\s\S]{0,80}?to (?:anon|service_role)/i,
);

for (const requiredProbe of [
  /rollout gate open/i,
  /non-owner role can change the commercial rollout gate/i,
  /set enabled = true/i,
  /write succeeded without an entitlement/i,
  /cross-tenant insert succeeded/i,
  /read-only entitlement allowed an update/i,
  /expired entitlement allowed an update/i,
  /missing rollout gate allowed a write/i,
  /service_role_reconciliation_preserved/i,
]) {
  assert.match(probes, requiredProbe);
}

for (const [name, source] of Object.entries({ migration, probes })) {
  assert.doesNotMatch(
    source,
    /sk_(?:live|test)_[A-Za-z0-9]{16,}/,
    `${name} contains a Stripe key`,
  );
  assert.doesNotMatch(
    source,
    /whsec_[A-Za-z0-9]{16,}/,
    `${name} contains a webhook secret`,
  );
}

console.log('Stripe Billing entitlement RLS harness passed.');
