const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const start = app.indexOf('            customerContext()');
const end = app.indexOf('            overviewNavigation()', start);
const computed = new Function('return ({' + app.slice(start, end) + '})')();
const vm = { customers: [{ id: 'a', name: 'Example Studio' }, { id: 'b', name: 'Example Studio' }], customerContextId: 'a',
  company: { defaultCurrency: 'GBP' }, customerContextCurrencyChoice: '', auditEvents: [], recurringTemplates: [],
  normalizedStatus: inv => inv.status,
  invoiceOutstanding: inv => inv.status === 'Paid' ? 0 : Math.max(0, inv.totals.grandTotal - inv.payments.reduce((n, p) => n + p.amount, 0)) };
for (const [key, getter] of Object.entries(computed)) Object.defineProperty(vm, key, {
  get: () => (typeof getter === 'function' ? getter : getter.get).call(vm),
  set: typeof getter.set === 'function' ? value => getter.set.call(vm, value) : undefined
});
const make = (id, props = {}) => ({ id, customer: { id: 'a', name: 'Original customer snapshot' }, docType: 'invoice', status: 'Sent', currency: 'GBP',
  date: '2026-09-12', totals: { grandTotal: 240 }, payments: [], history: [{ type: 'created', ts: '2026-09-12T10:00:00Z' }], ...props });
vm.invoices = [make('part', { payments: [{ amount: 100 }, { amount: -20 }] }), make('draft', { status: 'Draft' }), make('cancelled', { status: 'Cancelled' }),
  make('legacy-paid', { status: 'Paid' }), make('quote', { docType: 'quote' }), make('credit', { docType: 'credit' }), make('usd', { currency: 'USD' }),
  make('other-id', { customer: { id: 'b', name: 'Example Studio' } }), make('no-id', { customer: { name: 'Example Studio' } })];
assert.equal(vm.customerContextDocuments.length, 7, 'join only by existing snapshot customer ID');
assert.deepEqual(vm.customerContextSummary, { outstanding: 160, paid: 80 }, 'drafts/cancellations/quotes/credits excluded from outstanding, refunds netted, no invented legacy payments');
vm.customerContextCurrency = 'USD';
assert.deepEqual(vm.customerContextSummary, { outstanding: 240, paid: 0 }, 'no mixed-currency aggregation');
vm.customers[0].name = 'Renamed contact';
assert.equal(vm.customerContextDocuments.length, 7, 'contact rename retains association');
assert.equal(vm.invoices[0].customer.name, 'Original customer snapshot', 'summary never rewrites snapshots');
vm.recurringTemplates = [{ id: 'linked', customer: { id: 'a' } }, { id: 'unlinked', customer: { name: 'Renamed contact' } }];
assert.deepEqual(vm.customerContextSchedules.map(s => s.id), ['linked']);
vm.auditEvents = [{ object_id: 'part', event_type: 'email_delivered', created_at: '2026-09-13T10:00:00Z' },
  { object_id: 'other-id', event_type: 'email_delivered', created_at: '2026-09-14T10:00:00Z' }];
assert.equal(vm.customerContextActivity.length, 6);
assert.equal(vm.customerContextActivity[0].label, 'Email delivered');
assert.equal(vm.customerContextActivity[0].invoice.id, 'part');
assert.ok(vm.customerContextActivity.every(event => event.invoice.customer.id === 'a'));
vm.customerContextId = 'missing';
assert.equal(vm.customerContext, null); assert.deepEqual(vm.customerContextDocuments, []); assert.deepEqual(vm.customerContextActivity, []);
assert.deepEqual(vm.customerContextSummary, { outstanding: 0, paid: 0 });
assert.match(app, /customer-name[^>]*@click="openCustomerContext\(customer\)"/);
assert.match(app, /openCustomerContext\(customer\)[\s\S]*?setRouteKey\('customers-detail'\)/);
assert.match(app, /openRecurringTemplate\(template\)[\s\S]*?setRouteKey\('recurring-form'\)/);
assert.doesNotMatch(app, /activeTab\(\) \{ this\.editorPreview = false; this\.customerContextId = '';/);
assert.match(app, /class="schedule-table" aria-label="Recurring schedules"/);
assert.match(app, /@click="toggleTemplateActive\(t\)"/);
assert.match(app, /v-show="activeTab === 'owner' && ownerConsole.available"/);
console.log('Step 5 contracts passed: ID-only links, snapshot preservation, currency/status/payment definitions, bounded factual activity, missing customers, existing automation and Owner gate.');
