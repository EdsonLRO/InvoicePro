const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const schema = read('schema.sql');
const recurringSql = read('recurring_setup.sql');
const optimizedPolicies = read('supabase', 'migrations', '20260713210359_optimize_rls_and_foreign_key_indexes.sql');
const app = read('index.html');

for (const table of ['company_settings', 'customers', 'saved_items', 'invoices']) {
  assert.match(schema, new RegExp(`on public\\.${table} for select using \\(\\(select auth\\.uid\\(\\)\\) = user_id\\)`),
    `${table} select policy must bind auth.uid to user_id`);
  for (const operation of ['insert', 'update', 'delete']) {
    assert.match(schema, new RegExp(`own ${table} - ${operation}`), `${table} ${operation} policy must exist`);
  }
}
assert.match(recurringSql, /on public\.recurring_templates for select using \(\(select auth\.uid\(\)\) = user_id\)/);
assert.match(optimizedPolicies, /alter policy "own audit_events - select"[\s\S]*?auth\.uid\(\)\) = user_id/);
assert.match(optimizedPolicies, /alter policy "own recurring - update"[\s\S]*?using \(\(select auth\.uid\(\)\) = user_id\)[\s\S]*?with check \(\(select auth\.uid\(\)\) = user_id\)/);

const authenticatedFunctions = [
  'create-stripe-checkout',
  'create-stripe-refund',
  'send-document-email',
  'send-reminder-email',
  'log-app-event',
];
for (const name of authenticatedFunctions) {
  const source = read('supabase', 'functions', name, 'index.ts');
  assert.match(source, /auth\.getUser\(\)/, `${name} must resolve the authenticated user server-side`);
  assert.match(source, /userData\.user\.id/, `${name} must use the resolved user identity`);
  assert.doesNotMatch(source, /userId\s*=\s*(?:body|payload|requestBody)\./,
    `${name} must not accept tenant identity from the request body`);
}

const recurring = read('supabase', 'functions', 'generate-recurring', 'index.ts');
assert.match(recurring, /const userId = String\(tpl\.user_id \|\| ""\)/);
assert.match(recurring, /user_id: userId/);
assert.match(recurring, /\.eq\("user_id", userId\)/);

const reminders = read('supabase', 'functions', 'send-overdue-reminders', 'index.ts');
assert.match(reminders, /const userId = String\(inv\.user_id \|\| ""\)/);
assert.match(reminders, /\.eq\("user_id", userId\)/);

const stripeWebhook = read('supabase', 'functions', 'stripe-webhook', 'index.ts');
assert.match(stripeWebhook, /verifyStripeSignature/);
assert.match(stripeWebhook, /rpc\("apply_stripe_invoice_event"/);
assert.doesNotMatch(stripeWebhook, /service_role[^\n]*(?:return|json|Response)/i,
  'service-role material must never be returned');

assert.match(app, /\['audit_events', 'id'\]/);
assert.match(app, /tableSpecs\.map\(\(\[table, orderColumn\]\) =>\s*this\.fetchAllOwnedRows\(table, orderColumn\)/,
  'account export must query every tenant table through the authenticated public client');
assert.doesNotMatch(app, /SUPABASE_SERVICE_ROLE_KEY|service_role/i,
  'browser source must not contain service-role credentials or references');

console.log('Tenant isolation and service-role attribution harness passed.');
