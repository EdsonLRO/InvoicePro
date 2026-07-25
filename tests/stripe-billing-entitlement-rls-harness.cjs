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
  /grant execute[\s\S]*current_account_entitlement_allows_write\(\)[\s\S]*to (?:anon|service_role)/i,
);

for (const requiredProbe of [
  /write succeeded without an entitlement/i,
  /cross-tenant insert succeeded/i,
  /read-only entitlement allowed an update/i,
  /expired entitlement allowed an update/i,
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
