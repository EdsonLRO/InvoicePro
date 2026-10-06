const fs = require('node:fs');
const path = require('node:path');

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const money = values => values.reduce((sum, value) => sum + value, 0);

const business = {
  issuedByMonth: [2200, 2800, 2300, 3500, 3100, 4520],
  netByMonth: [1900, 2450, 2100, 3020, 2600, 3310],
  grossReceived: 15560,
  refunds: 180,
  outstanding: 3040,
  overdue: 620,
  customerNet: [4500, 3840, 2940, 2400, 1700],
  workflowNet: [9840, 3740, 1800],
};

const customer = {
  issued: 5980,
  grossReceived: 4620,
  refunds: 120,
  outstanding: 1480,
  overdue: 240,
  netByMonth: [800, 950, 1000, 900, 850],
  serviceIssued: [2200, 1580, 1400, 800],
};

const businessIssued = money(business.issuedByMonth);
const businessNet = business.grossReceived - business.refunds;
assert(businessIssued === 18420, 'Business issued total must be £18,420');
assert(money(business.netByMonth) === businessNet, 'Business monthly net receipts must equal net received');
assert(money(business.customerNet) === businessNet, 'Customer net receipts must equal business net received');
assert(money(business.workflowNet) === businessNet, 'Workflow net receipts must equal business net received');
assert(businessNet + business.outstanding === businessIssued, 'Business paid plus outstanding must equal issued');
assert(business.overdue <= business.outstanding, 'Business overdue must be a subset of outstanding');

const customerNet = customer.grossReceived - customer.refunds;
assert(customerNet === 4500, 'Customer net received must be £4,500');
assert(money(customer.netByMonth) === customerNet, 'Customer monthly net receipts must equal net received');
assert(money(customer.serviceIssued) === customer.issued, 'Customer service lines must equal issued invoices');
assert(customerNet + customer.outstanding === customer.issued, 'Customer paid plus outstanding must equal issued');
assert(customer.overdue <= customer.outstanding, 'Customer overdue must be a subset of outstanding');

const files = [
  'desktop-finances.html',
  'mobile-finances.html',
  'desktop-customer-finances.html',
  'mobile-customer-finances.html',
  'states.html',
];
const forbidden = [/MTD compliant/i, /HMRC ready/i, /tax due/i, /profit/i, /bank balance/i];
for (const file of files) {
  const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
  assert(!source.includes('http://') && !source.includes('https://'), `${file} must not load remote content`);
  for (const pattern of forbidden) assert(!pattern.test(source), `${file} contains forbidden claim ${pattern}`);
}

for (const file of files.slice(0, 4)) {
  const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
  assert(source.includes('Income received elsewhere and business expenses are not included.'), `${file} is missing the scope boundary`);
  assert(source.includes('role="img" aria-label='), `${file} is missing chart text alternatives`);
}

console.log(JSON.stringify({
  business: { issued: businessIssued, grossReceived: business.grossReceived, refunds: business.refunds, netReceived: businessNet, outstanding: business.outstanding, overdue: business.overdue },
  customer: { issued: customer.issued, grossReceived: customer.grossReceived, refunds: customer.refunds, netReceived: customerNet, outstanding: customer.outstanding, overdue: customer.overdue },
  filesChecked: files.length,
  remoteReferences: 0,
  status: 'passed',
}, null, 2));
