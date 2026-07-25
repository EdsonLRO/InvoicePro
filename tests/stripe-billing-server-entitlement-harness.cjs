const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const fn = (name) => read('supabase', 'functions', name, 'index.ts');
const shared = read(
  'supabase',
  'functions',
  '_shared',
  'account-entitlements.ts',
);

assert.match(shared, /account_entitlement_allows_write/);
assert.match(shared, /p_user_id:\s*userId/);
assert.match(shared, /if \(error\) throw new Error/);
assert.match(shared, /return data === true/);
assert.match(shared, /account is read-only/i);

for (const name of [
  'create-stripe-checkout',
  'send-document-email',
  'send-reminder-email',
  'create-connect-checkout',
]) {
  const source = fn(name);
  assert.match(
    source,
    /accountAllowsWrite\(admin,\s*(?:userData\.user|user)\.id\)/,
    `${name} must verify the authenticated account entitlement`,
  );
  assert.match(
    source,
    /readOnlyAccountMessage[\s\S]{0,80}403/,
    `${name} must fail closed with a read-only response`,
  );
}

const connectManagement = fn('manage-stripe-connect');
assert.match(
  connectManagement,
  /action !== "status"[\s\S]{0,100}accountAllowsWrite\(admin, user\.id\)/,
  'Connect status must remain readable while onboarding and updates require write entitlement',
);

for (const name of ['generate-recurring', 'send-overdue-reminders']) {
  const source = fn(name);
  assert.match(source, /const entitlementCache = new Map<string, boolean>\(\)/);
  assert.match(source, /accountAllowsWrite\(admin, userId\)/);
  assert.match(source, /if \(!writeAllowed\)[\s\S]{0,100}continue;/);
}

for (const name of [
  'create-stripe-refund',
  'create-connect-refund',
  'stripe-webhook',
  'stripe-connect-webhook',
  'stripe-billing-webhook',
  'resend-webhook',
]) {
  assert.doesNotMatch(
    fn(name),
    /accountAllowsWrite/,
    `${name} must preserve refund or signed-provider reconciliation while access is restricted`,
  );
}

for (const [name, source] of Object.entries({
  shared,
  createStripeCheckout: fn('create-stripe-checkout'),
  sendDocumentEmail: fn('send-document-email'),
  sendReminderEmail: fn('send-reminder-email'),
  generateRecurring: fn('generate-recurring'),
  sendOverdueReminders: fn('send-overdue-reminders'),
  createConnectCheckout: fn('create-connect-checkout'),
  manageStripeConnect: connectManagement,
})) {
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

console.log('Stripe Billing server entitlement harness passed.');
