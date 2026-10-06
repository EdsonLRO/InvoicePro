const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const config = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
const build = fs.readFileSync(path.join(root, 'scripts', 'build-app-pages.mjs'), 'utf8');
const insights = require(path.join(root, 'income-insights.js'));

global.window = { TallyoIncomeInsights: insights };

const computedStart = app.indexOf('            financesPeriod()');
const computedEnd = app.indexOf('            overviewNavigation()', computedStart);
assert.ok(computedStart > 0 && computedEnd > computedStart, 'Finances computed contract remains extractable');
const computed = new Function('return ({' + app.slice(computedStart, computedEnd) + '})')();

const methodsStart = app.indexOf('            overviewMoney(value');
const methodsEnd = app.indexOf('            overviewTime(ts)', methodsStart);
assert.ok(methodsStart > 0 && methodsEnd > methodsStart, 'Finances presentation methods remain extractable');
const methods = new Function('return ({' + app.slice(methodsStart, methodsEnd) + '})')();

const invoice = (id, changes = {}) => ({
  id,
  number: `INV-${id}`,
  docType: 'invoice',
  status: 'Sent',
  currency: 'GBP',
  date: '2026-09-01',
  dueDate: '2099-12-31',
  customer: { id: 'customer-one', name: 'Fictional Studio' },
  items: [{ name: 'Service', qty: 1, price: 1000, discount: 0, tax: 0 }],
  totals: { grandTotal: 1000, taxAmt: 0 },
  payments: [],
  history: [],
  ...changes
});

const vm = {
  incomeInsightsEnabled: true,
  company: { defaultCurrency: 'GBP' },
  financesCurrencyChoice: '',
  financesPeriodChoice: 'custom',
  financesCustomFrom: '2026-09-01',
  financesCustomTo: '2026-10-31',
  invoices: [
    invoice('one', { payments: [{ amount: 600, date: '2026-09-10' }] }),
    invoice('recurring', {
      date: '2026-10-01',
      items: [{ name: 'Retainer', qty: 1, price: 500, discount: 0, tax: 0 }],
      totals: { grandTotal: 500, taxAmt: 0 },
      recurringTemplateId: 'schedule-one',
      payments: [{ amount: 500, date: '2026-10-03' }]
    }),
    invoice('quote', {
      date: '2026-10-02',
      items: [{ name: 'Accepted work', qty: 1, price: 250, discount: 0, tax: 0 }],
      totals: { grandTotal: 250, taxAmt: 0 },
      sourceQuoteId: 'quote-one',
      customer: { id: 'customer-two', name: 'Another Fictional Business' }
    }),
    invoice('usd', {
      currency: 'USD',
      items: [{ name: 'Service', qty: 1, price: 300, discount: 0, tax: 0 }],
      totals: { grandTotal: 300, taxAmt: 0 },
      payments: [{ amount: 300, date: '2026-09-11', currency: 'USD' }]
    }),
    invoice('credit', {
      number: 'CN-001',
      docType: 'credit',
      items: [{ name: 'Adjustment', qty: 1, price: 50, discount: 0, tax: 0 }],
      totals: { grandTotal: 50, taxAmt: 0 }
    })
  ]
};
Object.assign(vm, methods);
for (const [key, getter] of Object.entries(computed)) Object.defineProperty(vm, key, {
  get: () => (typeof getter === 'function' ? getter : getter.get).call(vm),
  set: typeof getter.set === 'function' ? value => getter.set.call(vm, value) : undefined,
  configurable: true
});

assert.deepEqual(vm.financesPeriod, { from: '2026-09-01', to: '2026-10-31' });
assert.equal(vm.financesCalculationError, '');
assert.equal(vm.financesCalculation.currencyMode, 'separate');
assert.deepEqual(vm.financesCurrencies, ['GBP', 'USD']);
assert.equal(vm.financesCurrency, 'GBP');
assert.equal(vm.financesSummary.invoiced, 1750);
assert.equal(vm.financesSummary.received, 1100);
assert.equal(vm.financesSummary.netReceived, 1100);
assert.equal(vm.financesSummary.outstanding, 650);
assert.equal(vm.financesMonths.length, 2);
assert.equal(vm.financesCustomers.length, 2);
assert.equal(vm.financesSources.find(source => source.source === 'recurring').netReceived, 500);
assert.equal(vm.financesSources.find(source => source.source === 'accepted_quote').invoiced, 250);
assert.equal(vm.financesReviewGroups.find(issue => issue.code === 'standalone_credit_note').count, 1);
assert.match(vm.financesReadinessLabel, /income records ready/);

vm.financesCurrency = 'USD';
assert.equal(vm.financesSummary.invoiced, 300, 'currencies are selected independently');
assert.equal(vm.financesSummary.netReceived, 300);

vm.financesCustomFrom = '2026-11-01';
vm.financesCustomTo = '2026-10-01';
assert.match(vm.financesCalculationError, /must not be after/, 'invalid custom ranges fail clearly instead of showing zeroes');

assert.match(app, /incomeInsightsEnabled[\s\S]*?label: 'Finances', tab: 'finances'/, 'Finances navigation is feature gated');
assert.match(app, /if \(this\.incomeInsightsEnabled\) tabs\.push\('finances'\)/, 'disabled builds cannot route to Finances');
assert.match(app, /<section v-if="incomeInsightsEnabled" v-show="activeTab === 'finances'"/, 'Finances page is feature gated');
assert.match(app, /These figures cover invoices and payments recorded in Tallyo\. Income received elsewhere and business expenses are not included\./);
assert.match(app, /role="img" :aria-label="financesChartLabel"/, 'monthly chart has a written accessible description');
assert.match(app, /View exact monthly values[\s\S]*?<table>/, 'monthly chart exposes exact keyboard-accessible values');
assert.match(app, /aria-label="Payment position exact values"/, 'payment position repeats every visual value in text');
assert.match(app, /Income by customer/);
assert.match(app, /Where the income came from/);
assert.match(app, /Records organised/);
assert.match(app, /Some records need review/);
assert.match(app, /How these figures work/);
assert.doesNotMatch(app, /chart\.js|highcharts|d3\.js/i, 'business visuals add no chart dependency');
assert.match(config, /window\.TALLYO_INCOME_INSIGHTS_ENABLED = false;/, 'checked-in public configuration stays fail closed');
assert.match(build, /TALLYO_INCOME_INSIGHTS_PUBLIC_RELEASE_APPROVED/, 'public build still requires separate release approval');

delete global.window;
console.log('Income insights Finances UI contracts passed: canonical period totals, separate currencies, five accessible visuals, review states, gated navigation and fail-closed publication.');
