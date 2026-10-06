const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const config = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
const build = fs.readFileSync(path.join(root, 'scripts', 'build-app-pages.mjs'), 'utf8');
const insights = require(path.join(root, 'income-insights.js'));

global.window = { TallyoIncomeInsights: insights };
const start = app.indexOf('            customerContext()');
const end = app.indexOf('            overviewNavigation()', start);
assert.ok(start > 0 && end > start, 'customer computed contract must remain extractable');
const computed = new Function('return ({' + app.slice(start, end) + '})')();

const vm = {
  customers: [{ id: 'customer-a', name: 'Current customer name' }, { id: 'customer-b', name: 'Another customer' }],
  customerContextId: 'customer-a',
  company: { defaultCurrency: 'GBP' },
  customerContextCurrencyChoice: '',
  incomeInsightsEnabled: true,
  auditEvents: [],
  recurringTemplates: [],
  overviewMoney(value, currency) { return `${currency} ${Number(value).toFixed(2)}`; },
  customerFinanceMonthLongLabel(month) { return month; },
  normalizedStatus: document => document.status,
  invoiceOutstanding: document => Math.max(0, document.totals.grandTotal - document.payments.reduce((sum, payment) => sum + payment.amount, 0))
};
for (const [key, getter] of Object.entries(computed)) Object.defineProperty(vm, key, {
  get: () => (typeof getter === 'function' ? getter : getter.get).call(vm),
  set: typeof getter.set === 'function' ? value => getter.set.call(vm, value) : undefined,
  configurable: true
});

const invoice = (id, overrides = {}) => ({
  id,
  number: `INV-${id}`,
  docType: 'invoice',
  status: 'Sent',
  currency: 'GBP',
  date: '2026-09-01',
  dueDate: '2026-09-30',
  customer: { id: 'customer-a', name: 'Historical customer snapshot' },
  totals: { grandTotal: 1000, taxAmt: 0 },
  payments: [],
  history: [],
  ...overrides
});

vm.invoices = [
  invoice('one', { payments: [{ amount: 400, date: '2026-09-10' }] }),
  invoice('recurring', { recurringTemplateId: 'schedule-1', totals: { grandTotal: 600, taxAmt: 0 }, payments: [{ amount: 600, date: '2026-09-15' }] }),
  invoice('quote-linked', { sourceQuoteId: 'quote-1', totals: { grandTotal: 500, taxAmt: 0 }, payments: [{ amount: 500, date: '2026-10-02' }, { amount: -50, date: '2026-10-03' }] }),
  invoice('usd', { currency: 'USD', totals: { grandTotal: 250, taxAmt: 0 }, payments: [{ amount: 250, date: '2026-09-20' }] }),
  invoice('other-customer', { customer: { id: 'customer-b', name: 'Another customer' }, totals: { grandTotal: 9000, taxAmt: 0 }, payments: [{ amount: 9000, date: '2026-09-20' }] }),
  invoice('same-name-no-id', { customer: { name: 'Current customer name' }, totals: { grandTotal: 8000, taxAmt: 0 }, payments: [{ amount: 8000, date: '2026-09-20' }] })
];

assert.deepEqual(vm.customerContextCurrencies, ['GBP', 'USD'], 'only currencies linked by the selected customer ID are offered');
assert.equal(vm.customerContextCurrency, 'GBP');
assert.equal(vm.customerIncomeInsights.filters.customerId, 'customer-a', 'canonical calculation receives the exact selected customer ID');
assert.equal(vm.customerIncomeReport.currency, 'GBP');
assert.equal(vm.customerIncomeSummary.invoiced, 2100);
assert.equal(vm.customerIncomeSummary.received, 1500);
assert.equal(vm.customerIncomeSummary.refunds, 50);
assert.equal(vm.customerIncomeSummary.netReceived, 1450);
assert.equal(vm.customerIncomeSummary.outstanding, 650);
assert.equal(vm.customerIncomeMonths.length, 2);
assert.equal(vm.customerIncomeSources.find(source => source.source === 'recurring').netReceived, 600);
assert.equal(vm.customerIncomeSources.find(source => source.source === 'accepted_quote').netReceived, 450);
assert.equal(vm.customerIncomeMoneyActivity.length, 4);
assert.ok(vm.customerIncomeMoneyActivity.every(record => record.customerId === 'customer-a'), 'activity stays within the selected customer');
assert.equal(vm.invoices[0].customer.name, 'Historical customer snapshot', 'calculation never rewrites retained customer snapshots');

vm.customerContextCurrency = 'USD';
assert.equal(vm.customerIncomeSummary.invoiced, 250, 'currency reports remain separate');
assert.equal(vm.customerIncomeSummary.netReceived, 250);

assert.match(config, /window\.TALLYO_INCOME_INSIGHTS_ENABLED = false;/, 'checked-in public configuration must stay fail-closed');
assert.match(build, /TALLYO_INCOME_INSIGHTS_PUBLIC_RELEASE_APPROVED/, 'public build requires a separate release approval');
assert.match(app, /<script src="\.\/income-insights\.js"><\/script>/, 'customer UI uses the shared calculation module');
assert.match(app, /These figures cover this customer's invoices and payments recorded in Tallyo\. Income received elsewhere and business expenses are not included\./);
assert.match(app, /role="img" :aria-label="customerIncomeChartLabel"/, 'monthly chart has an exact accessible description');
assert.match(app, /<details v-if="customerIncomeMonths\.length" class="customer-exact-values">/, 'monthly chart has a keyboard-accessible exact-value table');
assert.match(app, /aria-label="Payment position exact values"/, 'payment-position graphic repeats every value in text');
assert.match(app, /How the invoices started/, 'workflow sources are clearly contextual rather than financial categories');
for (const method of ['customerFinanceMonthLabel', 'customerFinanceMonthLongLabel', 'customerFinanceBarHeight', 'customerFinanceSourceLabel', 'customerFinancePaymentSourceLabel', 'customerFinanceDateLabel']) {
  assert.match(app, new RegExp(`${method}\\(`), `${method} remains available to the reviewed customer presentation`);
}
assert.doesNotMatch(app, /chart\.js|highcharts|d3\.js/i, 'customer visuals add no chart dependency or third-party request');

delete global.window;
console.log('Income insights customer UI contracts passed: ID-only scope, snapshot preservation, separate currencies, canonical totals, accessible visuals and fail-closed publication.');
