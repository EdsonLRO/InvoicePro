const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const app = read('index.html');
const schema = read('schema.sql');
const stripeWebhook = read('supabase/functions/stripe-webhook/index.ts');
const connectShared = read('supabase/functions/_shared/stripe-connect.ts');
const documentEmail = read('supabase/functions/send-document-email/index.ts');
const overdueReminders = read('supabase/functions/send-overdue-reminders/index.ts');
const editor = app.slice(app.indexOf('<div class="editor-layout"'), app.indexOf('<div class="editor-preview-surface"'));

// Characterise the current boundaries that the implementation phase must
// deliberately replace or preserve. This file is an executable product-rule
// specification; it does not claim that production uses the target helper yet.
assert.doesNotMatch(editor, /<option value="Paid">Paid<\/option>/, 'editor no longer exposes manual Paid');
assert.match(app, /aria-label="Status action"/, 'editor exposes only contextual lifecycle actions');
assert.match(app, /if \(s === 'Paid' \|\| \(total > 0 && balance <= 0\.001\)\) return 'Paid';/, 'browser preserves legacy Paid and derives new Paid from the balance');
assert.match(app, /if \(docType !== 'invoice'\) return s === 'Draft' \? 'Draft' : 'Sent';/, 'quotes and credit notes do not derive payment or overdue states');
assert.match(app, /Payments can only be recorded against invoices\./, 'browser rejects payment recording for quotes and credit notes');
assert.match(app, /stored === 'Sent' && !this\.hasPaymentHistory\(inv\)/, 'only unpaid issued documents expose Cancel');
assert.doesNotMatch(app, /Reverted to draft/, 'issued documents are not silently reverted to Draft');
assert.match(schema, /check \(status in \('Draft','Sent','Paid','Cancelled'\)\)/, 'current schema retains legacy Paid storage');
assert.match(stripeWebhook, /function statusAfterPaymentChange\(/, 'owner Stripe webhook has a payment status helper');
assert.match(connectShared, /export function statusAfterPaymentChange\(/, 'Connect webhook has a second payment status helper');
assert.match(documentEmail, /inv\.status === "Draft" \? "Sent" : inv\.status/, 'emailing a draft issues it as Sent');
assert.match(overdueReminders, /inv\.status === "Draft" \|\| inv\.status === "Paid" \|\| inv\.status === "Cancelled"/, 'reminders skip stored Draft, Paid and Cancelled rows');

const money = value => Math.round(((Number(value) || 0) + Number.EPSILON) * 100) / 100;

function deriveStatus({ docType = 'invoice', lifecycle = 'Draft', total = 0, netPaid = 0, dueDate = '', today = '2026-09-19', legacyPaid = false }) {
  const stored = lifecycle === 'Due' ? 'Sent' : lifecycle;
  if (stored === 'Cancelled') return 'Cancelled';
  if (docType !== 'invoice') return stored === 'Draft' ? 'Draft' : 'Sent';
  if (stored === 'Draft' && money(netPaid) <= 0) return 'Draft';

  const invoiceTotal = Math.max(0, money(total));
  const paid = Math.max(0, money(netPaid));
  const balance = Math.max(0, money(invoiceTotal - paid));

  // Existing records that were manually marked Paid must not silently reopen
  // merely because they pre-date complete payment evidence.
  if (legacyPaid && stored === 'Paid') return 'Paid';
  if (invoiceTotal > 0 && balance <= 0.001) return 'Paid';
  if (dueDate && dueDate < today && balance > 0.001) return 'Overdue';
  if (paid > 0.001 && balance > 0.001) return 'Partially Paid';
  return stored === 'Draft' ? 'Sent' : stored;
}

const scenarios = [
  ['unissued invoice', { lifecycle: 'Draft', total: 100 }, 'Draft'],
  ['issued invoice before due date', { lifecycle: 'Sent', total: 100, dueDate: '2026-09-20' }, 'Sent'],
  ['unpaid invoice after due date', { lifecycle: 'Sent', total: 100, dueDate: '2026-09-18' }, 'Overdue'],
  ['part-payment before due date', { lifecycle: 'Sent', total: 100, netPaid: 40, dueDate: '2026-09-20' }, 'Partially Paid'],
  ['part-payment after due date', { lifecycle: 'Sent', total: 100, netPaid: 40, dueDate: '2026-09-18' }, 'Overdue'],
  ['fully paid invoice', { lifecycle: 'Sent', total: 100, netPaid: 100 }, 'Paid'],
  ['overpaid historical invoice', { lifecycle: 'Sent', total: 100, netPaid: 120 }, 'Paid'],
  ['zero-value issued invoice', { lifecycle: 'Sent', total: 0, netPaid: 0 }, 'Sent'],
  ['cancelled invoice remains cancelled', { lifecycle: 'Cancelled', total: 100, netPaid: 100 }, 'Cancelled'],
  ['legacy manually paid invoice remains paid', { lifecycle: 'Paid', total: 100, netPaid: 0, legacyPaid: true }, 'Paid'],
  ['partial refund restores part-payment', { lifecycle: 'Sent', total: 100, netPaid: 60, dueDate: '2026-09-20' }, 'Partially Paid'],
  ['partial refund restores overdue balance', { lifecycle: 'Sent', total: 100, netPaid: 60, dueDate: '2026-09-18' }, 'Overdue'],
  ['quote never becomes overdue from its date', { docType: 'quote', lifecycle: 'Sent', total: 100, dueDate: '2026-09-18' }, 'Sent'],
  ['credit note never becomes paid from its amount', { docType: 'credit', lifecycle: 'Sent', total: 100, netPaid: 100 }, 'Sent']
];

for (const [name, input, expected] of scenarios) {
  assert.equal(deriveStatus(input), expected, name);
}

const userTransitions = {
  Draft: ['Sent', 'Cancelled'],
  Sent: ['Cancelled'],
  Cancelled: []
};

assert.deepEqual(userTransitions.Draft, ['Sent', 'Cancelled']);
assert.deepEqual(userTransitions.Sent, ['Cancelled']);
assert.deepEqual(userTransitions.Cancelled, []);
assert.ok(!Object.values(userTransitions).flat().includes('Paid'), 'Paid is never a user-selected transition');

const cancellationAllowed = payments => !Array.isArray(payments) || payments.length === 0;
assert.equal(cancellationAllowed([]), true, 'unpaid document can be cancelled');
assert.equal(cancellationAllowed([{ amount: 100 }]), false, 'payment history blocks cancellation');
assert.equal(cancellationAllowed([{ amount: 100 }, { amount: -100 }]), false, 'refund history still blocks cancellation');

console.log(`document status rules specification passed (${scenarios.length} scenarios)`);
