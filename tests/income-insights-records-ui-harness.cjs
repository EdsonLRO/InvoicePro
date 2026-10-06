const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const insights = require(path.join(root, 'income-insights.js'));

global.window = { TallyoIncomeInsights: insights };
const computedStart = app.indexOf('            financesPeriod()');
const computedEnd = app.indexOf('            overviewNavigation()', computedStart);
const methodsStart = app.indexOf('            overviewMoney(value');
const methodsEnd = app.indexOf('            overviewTime(ts)', methodsStart);
assert.ok(computedStart > 0 && computedEnd > computedStart && methodsStart > 0 && methodsEnd > methodsStart);
const computed = new Function('return ({' + app.slice(computedStart, computedEnd) + '})')();
const methods = new Function('return ({' + app.slice(methodsStart, methodsEnd) + '})')();

const invoice = (id, changes = {}) => ({
  id, number: `INV-${id}`, docType: 'invoice', status: 'Sent', currency: 'GBP', date: '2026-09-01', dueDate: '2099-12-31',
  customer: { id: 'customer-one', name: 'Fictional Studio' }, items: [{ name: 'Service', qty: 1, price: 1000, discount: 0, tax: 0 }],
  totals: { grandTotal: 1000, taxAmt: 0 }, payments: [], history: [], ...changes
});
const vm = {
  incomeInsightsEnabled: true,
  company: { defaultCurrency: 'GBP' },
  financesCurrencyChoice: '', financesPeriodChoice: 'custom', financesCustomFrom: '2026-07-06', financesCustomTo: '2026-10-05',
  financesView: 'overview', financesRecordFilters: { customer: '', type: 'all', paymentKind: 'all', paymentSource: 'all', workflow: 'all', readiness: 'all' }, financesRecordPage: 1,
  invoices: [
    invoice('part', { payments: [{ amount: 400, date: '2026-09-10' }] }),
    invoice('recurring', { recurringTemplateId: 'schedule-one', totals: { grandTotal: 500, taxAmt: 0 }, items: [{ name: 'Retainer', qty: 1, price: 500, discount: 0, tax: 0 }], payments: [{ amount: 500, date: '2026-09-12', provider: 'stripe', providerPaymentIntentId: 'pi_fictional' }] }),
    invoice('quote', { sourceQuoteId: 'quote-one', totals: { grandTotal: 200, taxAmt: 0 }, items: [{ name: 'Quoted work', qty: 1, price: 200, discount: 0, tax: 0 }], customer: { id: 'customer-two', name: 'Another Business' }, payments: [{ amount: 200, date: '2026-09-15' }, { amount: -50, date: '2026-09-20' }] }),
    invoice('review', { status: 'Paid', totals: { grandTotal: 80, taxAmt: 0 }, items: [{ name: 'Review', qty: 1, price: 80, discount: 0, tax: 0 }] })
  ],
  setRouteKey(key) { this.lastRouteKey = key; },
  loadInvoice(invoiceRecord) { this.loadedInvoice = invoiceRecord; }
};
Object.assign(vm, methods);
for (const [key, getter] of Object.entries(computed)) Object.defineProperty(vm, key, {
  get: () => (typeof getter === 'function' ? getter : getter.get).call(vm),
  set: typeof getter.set === 'function' ? value => getter.set.call(vm, value) : undefined,
  configurable: true
});

assert.equal(vm.financesRecords.length, 5, 'four money rows and one explicit review row are available');
assert.equal(vm.financesRecordCustomers.length, 2);
assert.equal(vm.financesFilteredRecords.length, 5);
vm.financesRecordFilters.type = 'refund';
assert.equal(vm.financesFilteredRecords.length, 1);
assert.equal(vm.financesFilteredRecords[0].amount, -50);
vm.financesRecordFilters.type = 'all'; vm.financesRecordFilters.paymentSource = 'stripe_confirmed';
assert.equal(vm.financesFilteredRecords.length, 1);
assert.equal(vm.financesFilteredRecords[0].invoiceId, 'recurring');
vm.financesRecordFilters.paymentSource = 'all'; vm.financesRecordFilters.workflow = 'accepted_quote';
assert.equal(vm.financesFilteredRecords.length, 2);
vm.financesRecordFilters.workflow = 'all'; vm.financesRecordFilters.readiness = 'review';
assert.equal(vm.financesFilteredRecords.length, 1);
assert.match(vm.financesRecordReasons(vm.financesFilteredRecords[0]), /marked Paid/);
assert.equal(vm.financesRecordTotalPages, 1);
vm.financesRecordPage = 2;
assert.equal(vm.financesRecordCurrentPage, 1, 'the visible ledger page is clamped after a filter or period reduces the result count');
vm.financesRecordPage = 1;

const periods = vm.financesUkPeriods;
assert.equal(periods.length, 4);
assert.equal(periods[0].activityFrom, `${vm.financesTaxYearStartYear}-04-06`);
assert.equal(periods[1].activityFrom, `${vm.financesTaxYearStartYear}-07-06`);
assert.equal(periods[1].activity.netReceived, 1050);
assert.equal(periods[1].cumulative.netReceived, 1050);
assert.equal(periods[1].activity.recordCount, 4);
assert.equal(periods[1].cumulative.needsReview, 1);
vm.openFinancesPeriodRecords(periods[1], false);
assert.equal(vm.financesView, 'records');
assert.equal(vm.lastRouteKey, 'finances-records');
assert.equal(vm.financesCustomFrom, periods[1].activityFrom);
assert.equal(vm.financesCustomTo, periods[1].activityTo);
vm.financesPeriodChoice = 'previous_tax_year';
assert.equal(vm.financesTaxYearStartYear, Number(vm.financesPeriod.from.slice(0, 4)), 'UK period cards follow the selected tax year');
vm.financesPeriodChoice = 'custom';

for (const text of ['Income records', 'Payments and refunds', 'UK income periods', 'Activity records', 'Tax year to date', 'Nothing is filed with or sent to HMRC']) assert.ok(app.includes(text), `${text} remains visible`);
for (const filter of ['Income records customer', 'Income records type', 'Income records payment kind', 'Income records payment source', 'Income records workflow', 'Income records readiness']) assert.ok(app.includes(filter), `${filter} remains available`);
assert.match(app, /openFinancesRecords\(\)/, 'summary visuals link directly to supporting records');
assert.match(app, /financesView = key === 'finances-records' \? 'records' : key === 'finances-periods' \? 'periods' : key === 'finances-exports' \? 'exports' : 'overview'/, 'history routes restore the exact Finances subview');
assert.match(app, /!financesHasRecords && financesView === 'overview'/, 'an empty overview does not hide the ledger or UK period views');
assert.doesNotMatch(app, /Submit to HMRC|File with HMRC|MTD compliant/i);

delete global.window;
console.log('Income records and UK period contracts passed: traceable filtered ledger, exact quarterly and cumulative totals, routes, non-filing language and no compliance claim.');
