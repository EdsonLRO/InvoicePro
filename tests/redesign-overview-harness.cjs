const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const NativeDate = Date;
class FixedDate extends NativeDate {
  constructor(...args) { super(...(args.length ? args : ['2026-09-12T10:00:00Z'])); }
  static now() { return NativeDate.parse('2026-09-12T10:00:00Z'); }
}
function block(start, end) {
  const from = app.indexOf(start), to = app.indexOf(end, from);
  assert.ok(from >= 0 && to > from, 'Vue source must remain extractable');
  return app.slice(from + start.length, to);
}
const computed = new Function('Date', 'return ({' + block('        computed: {', '\n        watch: {').replace(/\},\s*$/, '') + '})')(FixedDate);
const methods = new Function('Date', 'return ({' + block('        methods: {', '\n        async mounted()').replace(/\},\s*$/, '') + '})')(FixedDate);
function model(changes = {}) {
  const state = { invoices: [], customers: [], recurringTemplates: [], auditEvents: [], company: {}, currentUser: {},
    overviewCurrencyChoice: '', ownerConsole: { available: false }, activeTab: 'dashboard', ...changes };
  for (const [key, fn] of Object.entries(methods)) state[key] = fn.bind(state);
  for (const [key, value] of Object.entries(computed)) Object.defineProperty(state, key, {
    get: (typeof value === 'function' ? value : value.get).bind(state),
    ...(value.set ? { set: value.set.bind(state) } : {}), configurable: true
  });
  return state;
}
const invoice = (id, change = {}) => ({ id, number: id, docType: 'invoice', status: 'Sent', currency: 'GBP',
  dueDate: '2026-09-04', totals: { grandTotal: 240 }, payments: [], history: [], customer: { name: 'Fictional Studio' }, ...change });
const state = model({ invoices: [
  invoice('overdue', { payments: [{ amount: 40, date: '2026-09-02' }, { amount: -10, date: '2026-09-03' }] }),
  invoice('cancelled', { status: 'Cancelled', payments: [{ amount: 50, date: '2026-09-01' }] }),
  invoice('draft', { status: 'Draft' }),
  invoice('quote', { docType: 'quote', payments: [{ amount: 800, date: '2026-09-01' }] }),
  invoice('credit', { docType: 'credit', payments: [{ amount: 200, date: '2026-09-01' }] }),
  invoice('legacy-paid', { status: 'Paid', totals: { grandTotal: 100 } }),
  invoice('usd', { currency: 'USD', dueDate: '2026-09-30', totals: { grandTotal: 600 } })
] });
assert.equal(state.overviewStat.outstanding, 310, 'existing totals/payment/legacy status definitions are preserved');
assert.equal(state.overviewStat.overdue, 310);
assert.equal(state.overviewStat.paidThisMonth, 80, 'dated net payment records include refunds, not quote/credit payments');
assert.equal(state.overviewAging.reduce((sum, bucket) => sum + bucket.amount, 0), 310);
assert.deepEqual(state.overviewCurrencies, ['GBP', 'USD']);
state.overviewCurrency = 'USD';
assert.equal(state.overviewStat.outstanding, 600, 'currencies cannot be summed');
assert.equal(state.overviewStat.overdue, 0);
assert.equal(state.overviewStat.paidThisMonth, 0);
assert.equal(state.overviewAttention.filter(item => item.kind === 'overdue').length, 1, 'attention preserves effective status and excludes cancelled/draft/legacy-paid/quote/credit');
assert.equal(state.overviewMoney(120, 'USD'), 'US$120.00');
assert.equal(state.overviewMoney(120, 'GBP'), '£120.00');

const schedule = (id, nextRun, active = true) => ({ id, nextRun, active, name: 'Fictional schedule' });
state.recurringTemplates = [schedule('mon', '2026-09-07'), schedule('sun', '2026-09-13'), schedule('past', '2026-09-06'),
  schedule('next', '2026-09-14'), schedule('paused', '2026-09-12', false)];
assert.deepEqual(state.overviewWeekTemplates.map(t => t.id), ['mon', 'sun'], 'UTC Monday–Sunday inclusive; active next runs only');
assert.ok(state.overviewAttention.some(item => item.template?.id === 'past'), 'missed earlier runs remain attention items');
assert.ok(!state.overviewAttention.some(item => item.template?.id === 'paused'));
state.invoices.push(invoice('zero', { totals: { grandTotal: 0 } }));
assert.ok(!state.overviewAttention.some(item => item.invoice?.id === 'zero'));
const disputeModel = model({ invoices: [invoice('case')], auditEvents: [
  { object_id: 'case', event_type: 'charge_dispute_created', created_at: '2026-09-10T10:00:00Z', metadata: { status: 'needs_response', provider_created: 1789034400 } }
] });
assert.equal(disputeModel.overviewAttention[0].kind, 'dispute', 'an actionable dispute is prioritised');
disputeModel.auditEvents.push({ object_id: 'case', event_type: 'charge_dispute_closed', created_at: '2026-09-11T10:00:00Z', metadata: { status: 'won', provider_created: 1789120800 } });
assert.ok(!disputeModel.overviewAttention.some(item => item.kind === 'dispute'), 'resolved disputes must leave attention');

const quotes = model({ invoices: [
  invoice('old', { docType: 'quote', date: '2026-08-01' }),
  invoice('sent', { docType: 'quote', history: [{ type: 'sent', ts: '2026-09-06T10:00:00Z' }] }),
  invoice('resent', { docType: 'quote', history: [{ type: 'sent', ts: '2026-09-01T10:00:00Z' }, { type: 'sent', ts: '2026-09-11T10:00:00Z' }] })
] });
assert.deepEqual(quotes.overviewAttention.map(item => item.invoice.id), ['sent'], 'quote age comes from latest recorded sending, never issue date');

const activity = model({ invoices: [invoice('one', { history: [
  { type: 'created', ts: '2026-09-01T10:00:00Z', text: 'private free text must not be reused' },
  { type: 'payment', ts: '2026-09-12T09:00:00Z', text: 'secret payment notes' },
  { type: 'note', ts: '2026-09-12T09:30:00Z', text: 'private note' },
  { type: 'created', ts: 'invalid' }
] })], auditEvents: [
  { object_id: 'one', event_type: 'email_delivered', created_at: '2026-09-12T09:15:00Z', metadata: { email: 'not-for-overview@example.invalid' } },
  { object_id: 'unknown', event_type: 'email_delivered', created_at: '2026-09-12T09:20:00Z' }
] });
assert.deepEqual(activity.overviewActivity.map(event => event.label), ['Email delivered', 'Payment recorded', 'Document created']);
assert.equal(activity.overviewActivity.length, 3);
assert.ok(activity.overviewTime('2026-09-12T09:15:00Z').includes('09:15 UTC'));
assert.equal(model().overviewSetup.filter(step => step.done).length, 0);
assert.equal(quotes.overviewSetup.find(step => step.route === 'create').done, false, 'quotes are not first invoices');
assert.equal(activity.overviewSetup.at(-1).done, true, 'delivery evidence completes first send');
assert.equal(model({ invoices: [invoice('manual', { history: [{ type: 'sent', ts: '2026-09-01T10:00:00Z' }] })] }).overviewSetup.at(-1).done, false, 'manually marking Sent is not proof of email');
assert.equal(model({ currentUser: { email: 'private-name@example.invalid' } }).overviewGreeting.includes('private-name'), false);
assert.equal(model().overviewStat.outstanding, 0, 'empty accounts receive meaningful zero figures');
assert.equal(model().overviewAttention.length, 0);
assert.equal(model().overviewActivity.length, 0);

const actions = [];
state.navigateTo = tab => actions.push(['navigate', tab]);
state.writeNavigationState = (route, options) => actions.push(['record-return', route, options]);
state.openReminder = inv => actions.push(['review-reminder', inv.id]);
state.loadInvoice = inv => actions.push(['open-document', inv.id]);
state.openRecurringTemplate = template => actions.push(['open-schedule', template.id]);
state.overviewAct({ kind: 'overdue', invoice: { id: 'one' } });
state.overviewAct({ template: { id: 'schedule' } });
state.overviewAct({ kind: 'dispute', invoice: { id: 'one' } });
assert.deepEqual(actions, [['review-reminder', 'one'], ['record-return', 'dashboard', { replace: true }], ['open-schedule', 'schedule'], ['open-document', 'one']]);
state.overviewNavigate({ tab: 'invoices', reminders: true });
assert.equal(state.invoiceStatusFilter, 'Overdue'); assert.equal(state.invoiceTypeFilter, 'invoice');
state.overviewNavigate({ tab: 'invoices' });
assert.equal(state.invoiceStatusFilter, 'All'); assert.equal(state.invoiceTypeFilter, 'All');
assert.ok(!state.routeTabs().includes('owner'), 'Owner route remains conditionally available');
assert.equal(state.overviewDocumentLabel({ number: 'INV-1042', docType: 'invoice' }), 'INV-1042');
assert.equal(state.overviewDocumentLabel({ number: '1042', docType: 'invoice' }), 'Invoice #1042');
const overviewSource = block('            overviewNavigation()', '            brandColor()') + block('            overviewIcon(name)', '            showAppNotice(');
assert.doesNotMatch(overviewSource, /functions\.invoke|supabaseClient|fetch\(|sendReminderEmail\(|trackEvent\(|gtag\(/, 'Overview selectors/actions must not add provider, email, payment or analytics calls');
assert.match(overviewSource, /label: 'Invoices', tab: 'invoices'/);
assert.match(overviewSource, /item\.template\)[\s\S]*?writeNavigationState\('dashboard', \{ replace: true \}\)[\s\S]*?openRecurringTemplate\(item\.template\)/);
console.log('Overview harness passed: currency separation, existing financial semantics, net payments, UTC week boundaries, eligible attention, evidence-based quote age/setup/activity, empty states and review-only actions.');
