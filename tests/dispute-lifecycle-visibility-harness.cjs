const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const webhook = fs.readFileSync(path.join(root, 'supabase', 'functions', 'stripe-webhook', 'index.ts'), 'utf8');

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

const disputeStateFor = new Function('id', methodBody(app, 'disputeStateFor(id)'));
const invoiceId = '11111111-1111-4111-8111-111111111111';
const context = {
  emailEventsByDocument: {
    [invoiceId]: [
      {
        event_type: 'charge_dispute_funds_withdrawn',
        created_at: '2026-07-18T12:05:00Z',
        metadata: { provider_created: 100, status: 'needs_response', amount: 75, currency: 'gbp', reason: 'product_not_received', evidence_due_by: 500 }
      },
      {
        event_type: 'email_delivered',
        created_at: '2026-07-18T12:04:00Z',
        metadata: {}
      },
      {
        event_type: 'charge_dispute_updated',
        created_at: '2026-07-18T12:03:00Z',
        metadata: { provider_created: 200, status: 'under_review', amount: 75, currency: 'gbp', reason: 'product_not_received' }
      },
      {
        event_type: 'charge_dispute_funds_reinstated',
        created_at: '2026-07-18T12:01:00Z',
        metadata: { provider_created: 300, status: 'won', amount: 75, currency: 'gbp', reason: 'product_not_received' }
      }
    ]
  }
};

const state = disputeStateFor.call(context, invoiceId);
assert.equal(state.status, 'won', 'provider event time must win over out-of-order delivery time');
assert.equal(state.label, 'Won');
assert.equal(state.amount, 75, 'partial dispute amount must remain visible');
assert.equal(state.currency, 'GBP');
assert.equal(state.reason, 'Product not received');
assert.equal(state.fundsLabel, 'Reinstated to Stripe balance');
assert.match(state.nextAction, /Reconcile the Stripe balance/);
assert.equal(disputeStateFor.call(context, '22222222-2222-4222-8222-222222222222'), null);

const needsResponse = disputeStateFor.call({
  emailEventsByDocument: {
    [invoiceId]: [{
      event_type: 'charge_dispute_created',
      created_at: '2026-07-18T12:00:00Z',
      metadata: { status: 'needs_response', amount: 100, currency: 'GBP', evidence_due_by: 1893456000, evidence_past_due: true }
    }]
  }
}, invoiceId);
assert.equal(needsResponse.label, 'Needs response');
assert.equal(needsResponse.pastDue, true);
assert.ok(needsResponse.dueBy);
assert.match(needsResponse.nextAction, /submit evidence before the deadline/);

for (const label of ['Amount affected', 'Funds movement', 'Evidence deadline', 'Next action', 'Open Stripe disputes']) {
  assert.ok(app.includes(label), `dispute view must show ${label}`);
}
assert.match(app, /original payment remains in the invoice history[\s\S]*?does not automatically mark the invoice unpaid/);
assert.match(app, /target="_blank" rel="noopener noreferrer"/);
assert.match(app, /emailStatusFor\(id\)[\s\S]*?filter\(ev => String\(ev\.event_type/);
assert.match(app, /if \(type === 'dispute'\)[\s\S]*?this\.disputeStateFor\(inv && inv\.id\)/);

assert.match(webhook, /payment intent not known to Tallyo/);
assert.match(webhook, /loadInvoice\(admin, invoiceId, userId\)/);
assert.match(webhook, /historyHasProviderMarker\(history, `stripe-dispute:\$\{event\.id\}`\)/);
assert.match(webhook, /Array\.isArray\(inv\.payments\) \? inv\.payments : \[\]/);
assert.match(webhook, /inv\.status \|\| "Sent"/);
assert.match(webhook, /provider_created:/);
assert.match(webhook, /evidence_due_by:/);
assert.match(webhook, /evidence_past_due:/);
assert.match(webhook, /event\.type\.replaceAll\("\.", "_"\)/);

console.log('Dispute lifecycle visibility harness passed.');
