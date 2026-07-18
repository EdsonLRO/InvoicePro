const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function extract(pattern, message) {
  const match = app.match(pattern);
  assert.ok(match, message);
  return match[1];
}

const calcTotals = new Function(
  'src',
  extract(
    /calcTotals\(src\) \{([\s\S]*?)\r?\n            \},\r?\n            isUuid\(v\)/,
    'calcTotals must remain extractable'
  )
);
const validateDraftForSave = new Function(
  'src',
  extract(
    /validateDraftForSave\(src\) \{([\s\S]*?)\r?\n            \},\r?\n            docTypeNoun/,
    'validateDraftForSave must remain extractable'
  )
);
const validate = draft => validateDraftForSave.call({ calcTotals }, draft);
const validDraft = {
  docType: 'invoice',
  taxMode: 'exclusive',
  globalDiscount: 0,
  shippingCost: 0,
  items: [{ name: 'Consulting', qty: 2, price: 50, discount: 0, tax: 20 }],
};

assert.equal(validate(validDraft), '', 'a valid invoice must pass validation');
assert.equal(calcTotals(validDraft).grandTotal, 120, 'exclusive VAT totals must remain exact');
assert.equal(calcTotals({ ...validDraft, taxMode: 'inclusive' }).grandTotal, 100, 'inclusive VAT totals must remain exact');

for (const [change, expected] of [
  [{ items: [] }, /at least one line item/i],
  [{ items: [{ name: '', qty: 1, price: 1 }] }, /item or description/i],
  [{ items: [{ name: 'Item', qty: 0, price: 1 }] }, /quantity must be greater than zero/i],
  [{ items: [{ name: 'Item', qty: 1, price: -1 }] }, /unit price cannot be negative/i],
  [{ items: [{ name: 'Item', qty: 1, price: 1, discount: 101 }] }, /discount must be between/i],
  [{ items: [{ name: 'Item', qty: 1, price: 1, tax: -1 }] }, /tax must be between/i],
  [{ globalDiscount: 101 }, /global discount must be between/i],
  [{ shippingCost: -0.01 }, /shipping cannot be negative/i],
  [{ items: [{ name: 'Free', qty: 1, price: 0 }] }, /total must be greater than zero/i],
]) {
  const candidate = { ...validDraft, ...change };
  assert.match(validate(candidate), expected);
}

assert.match(app, /const validationIssue = this\.validateDraftForSave\(this\.draft\);[\s\S]*?this\.documentSaveBusy = true;/,
  'validation must run before the save becomes busy');
assert.match(app, /if \(amt > outstanding \+ 0\.001\)[\s\S]*?Payment cannot exceed the outstanding balance/,
  'manual payments must not exceed the current outstanding balance');
assert.match(app, /Standalone credit note:[\s\S]*?does not automatically link to an invoice or reduce its outstanding balance/,
  'standalone credit notes must explain their balance limitation');
assert.match(app, /existing\.docType === 'quote' && mapped\.docType === 'invoice'/,
  'quote conversion must remain explicit');
assert.match(app, /logAppAuditEvent\('quote_converted_to_invoice'/,
  'quote conversion must remain audited');
for (const status of ['Draft', 'Sent', 'Paid', 'Cancelled']) {
  assert.ok(app.includes(`<option value="${status}">${status}</option>`), `${status} must remain available`);
}

console.log('Core document lifecycle harness passed.');
