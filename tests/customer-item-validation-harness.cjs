const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

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

const validateCustomer = new Function('customer', methodBody(app, 'validateCustomerForSave(customer)'));
const customerToRow = new Function('c', methodBody(app, 'customerToRow(c)'));
const validateItem = new Function('item', methodBody(app, 'validateSavedItemForSave(item)'));
const itemToRow = new Function('i', methodBody(app, 'itemToRow(i)'));

assert.match(validateCustomer({ name: '   ', email: '' }), /required/i);
assert.match(validateCustomer({ name: 'Synthetic', email: 'invalid-address' }), /valid customer email/i);
assert.equal(validateCustomer({ name: ' Synthetic ', email: 'qa@example.invalid' }), '');
assert.equal(validateCustomer({ name: 'Synthetic', email: '' }), '');
assert.deepEqual(
  customerToRow({ name: ' Synthetic ', address: ' Test Street ', email: ' qa@example.invalid ', additionalInfo: ' Safe text ' }),
  { name: 'Synthetic', address: 'Test Street', phone: null, mobile: null, email: 'qa@example.invalid', tax_id: null, additional_info: 'Safe text' }
);

assert.match(validateItem({ name: '   ', price: 0 }), /required/i);
assert.match(validateItem({ name: 'Synthetic', price: -0.01 }), /non-negative/i);
assert.match(validateItem({ name: 'Synthetic', price: Number.NaN }), /non-negative/i);
assert.equal(validateItem({ name: 'Synthetic', price: 0 }), '');
assert.equal(validateItem({ name: 'Synthetic', price: 12.345 }), '');
assert.deepEqual(itemToRow({ name: ' Synthetic ', description: ' Test ', price: 12.345 }), {
  name: 'Synthetic', description: 'Test', price: 12.35
});

assert.match(app, /Default Price<\/label><input type="number" min="0" step="0\.01"/);
assert.match(app, /async saveQuickCustomer\(\)[\s\S]*?validateCustomerForSave\(this\.quickCustomer\)/);
assert.match(app, /async saveCustomer\(\)[\s\S]*?validateCustomerForSave\(this\.customerForm\)/);
assert.match(app, /async saveSavedItem\(\)[\s\S]*?validateSavedItemForSave\(this\.itemForm\)/);
assert.match(app, /async saveAsNewPreset\(index\)[\s\S]*?validateSavedItemForSave\(preset\)/);
assert.doesNotMatch(app, /v-html="customer\.name"|v-html="item\.name"/);

console.log('Customer and saved-item validation harness passed.');
