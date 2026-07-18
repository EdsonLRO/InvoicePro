const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const refundFunction = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'functions', 'create-stripe-refund', 'index.ts'), 'utf8');

function methodBody(source, signature) {
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, `${signature} must exist`);
  const open = source.indexOf('{', start + signature.length);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, index);
    }
  }
  throw new Error(`Could not parse ${signature}`);
}

const refundPreview = new Function(methodBody(app, 'refundPreview()'));
const refundableStripePaymentAmount = new Function('payment', methodBody(app, 'refundableStripePaymentAmount(payment)'));

function stripePayment(amount, intent) {
  return { amount, provider: 'stripe', providerPaymentIntentId: intent, lifecycleEvent: 'payment' };
}

function stripeRefund(amount, intent) {
  return { amount: -Math.abs(amount), provider: 'stripe', providerPaymentIntentId: intent, lifecycleEvent: 'refund' };
}

function manualPayment(amount) {
  return { amount, provider: 'manual', lifecycleEvent: 'payment' };
}

function refundable(payment, payments) {
  return refundableStripePaymentAmount.call({
    draft: { payments },
    isStripeRefundPayment(entry) {
      return entry && entry.provider === 'stripe' &&
        (entry.lifecycleEvent === 'refund' || Number(entry.amount) < 0);
    }
  }, payment);
}

function context({ total = 100, payments = [100], amount = 25, max = 100, status = 'Paid', dueDate = '2099-01-01' } = {}) {
  const ctx = {
    refundModal: { amount, max },
    totals: { grandTotal: total },
    draft: {
      status,
      dueDate,
      totals: { grandTotal: total },
      payments: payments.map(value => ({ amount: value }))
    },
    normalizedStatus(inv) {
      return inv.status === 'Due' ? 'Sent' : (inv.status || 'Draft');
    },
    amountPaid(inv) {
      return (inv.payments || []).reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    },
    effectiveStatus(inv) {
      const stored = this.normalizedStatus(inv);
      if (stored === 'Cancelled') return 'Cancelled';
      const paid = this.amountPaid(inv);
      const today = new Date().toISOString().split('T')[0];
      if (stored === 'Paid' || (total > 0 && paid >= total - 0.001)) return 'Paid';
      if (paid > 0.001) return inv.dueDate && inv.dueDate < today ? 'Overdue' : 'Partially Paid';
      if (stored === 'Sent' && inv.dueDate && inv.dueDate < today) return 'Overdue';
      return stored;
    }
  };
  Object.defineProperty(ctx, 'draftPaid', {
    get() { return ctx.amountPaid(ctx.draft); }
  });
  return ctx;
}

assert.deepEqual(
  refundPreview.call(context()),
  { valid: true, amount: 25, paidAfter: 75, outstanding: 25, status: 'Partially Paid' }
);
assert.deepEqual(
  refundPreview.call(context({ amount: 100 })),
  { valid: true, amount: 100, paidAfter: 0, outstanding: 100, status: 'Sent' }
);
assert.equal(refundPreview.call(context({ amount: 25, dueDate: '2000-01-01' })).status, 'Overdue');
assert.equal(refundPreview.call(context({ amount: 25, status: 'Cancelled' })).status, 'Cancelled');
assert.deepEqual(
  refundPreview.call(context({ payments: [80, 20, -10], amount: 20, max: 70 })),
  { valid: true, amount: 20, paidAfter: 70, outstanding: 30, status: 'Partially Paid' }
);
assert.deepEqual(
  refundPreview.call(context({ payments: [120], amount: 10 })),
  { valid: true, amount: 10, paidAfter: 110, outstanding: 0, status: 'Paid' }
);
assert.equal(refundPreview.call(context({ amount: 100.01, max: 100 })).valid, false);
assert.equal(refundPreview.call(context({ amount: 0 })).valid, false);

// Each Stripe payment intent carries its own refund balance. Manual payments,
// unrelated credit notes and refunds against other intents must not change it.
const deposit = stripePayment(30, 'pi_deposit');
const balance = stripePayment(70, 'pi_balance');
const mixedPayments = [
  deposit,
  balance,
  manualPayment(15),
  stripeRefund(10, 'pi_deposit'),
  stripeRefund(25, 'pi_balance'),
  { amount: -40, provider: 'manual', lifecycleEvent: 'credit_note' }
];
assert.equal(refundable(deposit, mixedPayments), 20);
assert.equal(refundable(balance, mixedPayments), 45);

// Multiple sequential refunds reduce only their original payment intent and
// clamp at zero if historical events exceed the captured payment amount.
const sequential = stripePayment(100, 'pi_sequential');
assert.equal(refundable(sequential, [sequential]), 100);
assert.equal(refundable(sequential, [sequential, stripeRefund(20, 'pi_sequential')]), 80);
assert.equal(refundable(sequential, [sequential, stripeRefund(20, 'pi_sequential'), stripeRefund(30, 'pi_sequential')]), 50);
assert.equal(refundable(sequential, [sequential, stripeRefund(120, 'pi_sequential')]), 0);
assert.equal(refundable(manualPayment(100), [manualPayment(100)]), 0);
assert.equal(refundable(stripePayment(100, ''), []), 0);

// Overpayments remain paid until the cumulative refund falls below the invoice total.
assert.equal(refundPreview.call(context({ total: 100, payments: [130], amount: 20, max: 130 })).status, 'Paid');
assert.equal(refundPreview.call(context({ total: 100, payments: [130], amount: 40, max: 130 })).status, 'Partially Paid');

// The server independently enforces ownership, invoice type, payment selection,
// intent-scoped refundable balance and excess-refund rejection.
assert.match(refundFunction, /inv\.user_id !== userData\.user\.id/);
assert.match(refundFunction, /inv\.doc_type !== "invoice"/);
assert.match(refundFunction, /payment\.provider !== "stripe" \|\| isStripeRefund\(payment\)/);
assert.match(refundFunction, /refundableForPayment\(payments, payment\)/);
assert.match(refundFunction, /requestedAmount > refundable \+ 0\.001/);
assert.match(refundFunction, /String\(entry\.providerPaymentIntentId \|\| ""\) === intent/);

for (const label of [
  'Amount returned to customer',
  'Paid amount after refund',
  'Outstanding balance after refund',
  'Invoice status after refund',
  'Customer receipt behaviour'
]) {
  assert.ok(app.includes(label), `refund dialog must show ${label}`);
}
assert.match(app, /Current payment-correction model:[\s\S]*?restores any outstanding balance/);
assert.match(app, /Stripe may email a refund receipt[\s\S]*?Tallyo does not send a duplicate refund email/);
assert.match(app, /:disabled="refundModal\.submitting \|\| !refundPreview\.valid"/);
assert.match(app, /role="dialog" aria-modal="true" aria-labelledby="stripe-refund-title"/);
assert.match(app, /max-height: calc\(100vh - 2rem\); overflow-y: auto;/);

console.log('Refund consequence preview harness passed.');
