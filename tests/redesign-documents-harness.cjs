const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const docs = app.slice(app.indexOf('<div v-show="activeTab === \'invoices\'"'), app.indexOf('<div v-if="reminderModal.open"'));
assert.ok(docs.includes('class="documents-page"'));
assert.ok(docs.includes('class="document-record" role="row"'));
assert.ok(docs.includes('aria-label="Saved documents" role="table"'));
for (const binding of ['invoiceSearch', 'invoiceTypeFilter', 'invoiceStatusFilter', 'invoiceSort', 'selectedInvoices']) {
  assert.ok(docs.includes(`v-model="${binding}"`), binding + ' retains its established state');
}
for (const action of ['newInvoice', 'loadInvoice(inv)', 'duplicateInvoice(inv)', 'sendDocumentEmail(inv)', 'exportPDF(inv)', 'deleteInvoice(inv)', 'exportExcel', 'bulkDuplicateInvoices', 'bulkEmailInvoices', 'bulkPdfInvoices', 'bulkDeleteInvoices']) {
  assert.equal(docs.split(`@click="${action}"`).length - 1, 1, action + ' uses one existing handler, not duplicate mobile controls');
}
assert.ok(docs.includes(`@click="openDocumentCancellation([inv], 'list')"`), 'each eligible invoice or quote exposes cancellation from More');
assert.ok(docs.includes(`@click="openDocumentCancellation(selectedInvoiceRows, 'bulk')"`), 'selected invoices and quotes expose bulk cancellation');
assert.match(app, /editingExisting && canCancelDocument\(draft\)[\s\S]*?Cancel \{\{ docTypeNoun\(draft\.docType\)\.toLowerCase\(\) \}\}/,
  'the editor More menu exposes the same cancellation action');
assert.match(app, /documentCancellationReason\(inv\)[\s\S]*?!\['invoice', 'quote'\]\.includes\(docType\)[\s\S]*?quoteResponse[\s\S]*?hasPaymentHistory\(inv\)[\s\S]*?disputeStateFor\(inv\.id\)/,
  'cancellation is limited to mutable unpaid invoices and quotes without response or dispute history');
assert.match(app, /update\(\{[\s\S]*?status: 'Cancelled',[\s\S]*?history,[\s\S]*?updated_at: timestamp[\s\S]*?\}\)\.eq\('id', inv\.id\)\.eq\('user_id', this\.currentUser\.id\)/,
  'single and bulk cancellation use one owner-bound persistence path');
assert.ok(docs.includes('invoiceListEmailStatus(inv.id)'), 'use delivery outcomes, not invented delivery claims');
assert.ok(docs.includes('effectiveStatus(inv)'), 'preserve status semantics');
assert.ok(docs.includes('inv.currency || \'GBP\''), 'disambiguate each document currency');
assert.ok(!docs.includes('overdueOutstanding.toFixed'), 'do not display a potentially mixed-currency sum');
assert.ok(docs.includes('@keydown.esc='), 'native More disclosure supports Escape and focus return');
assert.ok(!/min-width:\s*1120px/.test(app), 'remove the obsolete wide document table on mobile');
assert.match(app, /\.document-record \{[^}]*grid-template-areas:/, 'mobile documents become cards');
assert.match(app, /\.record-open::after \{[^}]*inset: 0;/, 'card surface opens its document');
assert.match(app, /\.record-actions \{[^}]*z-index: 1;/, 'secondary actions are above the card surface');

function computed(name, next) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = app.match(new RegExp(escaped + '\\(\\) \\{([\\s\\S]*?)\\r?\\n            \\},\\r?\\n            ' + next + '\\('));
  assert.ok(match, name + ' is extractable');
  return new Function(match[1]);
}
const filter = computed('filteredInvoices', 'invoiceTotalPages');
const paginate = computed('paginatedInvoices', 'currentInvoicePageSelected');
const invoices = [
  { id: 'a', number: 'INV-01', docType: 'invoice', status: 'Sent', date: '2026-09-01', customer: { name: 'Fictional Studio' }, totals: { grandTotal: 240 } },
  { id: 'b', number: 'QUO-02', docType: 'quote', status: 'Draft', date: '2026-09-02', customer: { name: 'Fictional Studio' }, totals: { grandTotal: 900 } },
  { id: 'c', number: 'CN-03', docType: 'credit', status: 'Paid', date: '2026-09-03', customer: { name: 'Example Services' }, totals: { grandTotal: 120 } },
];
const vm = { invoices, invoiceSearch: '', invoiceTypeFilter: 'All', invoiceStatusFilter: 'All', invoiceSort: 'date_desc', effectiveStatus: inv => inv.status };
for (const [sort, ids] of [['date_desc', 'cba'], ['date_asc', 'abc'], ['amount_desc', 'bac'], ['amount_asc', 'cab'], ['number_desc', 'bac'], ['number_asc', 'cab']]) {
  vm.invoiceSort = sort;
  assert.equal(filter.call(vm).map(row => row.id).join(''), ids);
}
vm.invoiceTypeFilter = 'credit';
assert.deepEqual(filter.call(vm).map(row => row.id), ['c']);
vm.invoiceTypeFilter = 'All'; vm.invoiceStatusFilter = 'Draft';
assert.deepEqual(filter.call(vm).map(row => row.id), ['b']);
vm.invoiceStatusFilter = 'All'; vm.invoiceSearch = 'EXAMPLE';
assert.deepEqual(filter.call(vm).map(row => row.id), ['c']);
assert.equal(paginate.call({ filteredInvoices: Array.from({ length: 21 }, (_, n) => n), invoicePage: 2, invoiceTotalPages: 2 }).length, 1);
assert.ok(app.includes("supabaseClient.from('saved_items')"), 'catalogue rename does not rename storage');
assert.ok(app.includes('v-model="itemForm.name"') && app.includes('v-model="itemForm.description"') && app.includes('v-model.number="itemForm.price"'));
assert.ok(!app.includes('Manage Saved Items'));
assert.ok(app.includes('class="record-card-list overflow-x-auto"'), 'customer list uses the shared row-card frame');
assert.ok(app.includes('class="catalogue-record"'), 'catalogue records use the shared row-card treatment');
assert.match(app, /\.customer-record:nth-of-type\(even\), \.catalogue-record:nth-of-type\(even\) \{ --record-row-bg: #f8fafc; \}/,
  'customer and catalogue rows alternate white and light-slate surfaces');
assert.match(app, /\.customer-record td:first-child, \.catalogue-record td:first-child \{[^}]*border-left: 1px solid #dce4ef;[^}]*border-radius: 12px 0 0 12px;/,
  'each desktop row-card has a thin outline and rounded left edge');
assert.match(app, /\.customer-record td:last-child, \.catalogue-record td:last-child \{[^}]*border-right: 1px solid #dce4ef;[^}]*border-radius: 0 12px 12px 0;/,
  'each desktop row-card has a thin outline and rounded right edge');
console.log('Step 3 document presentation/filter/catalogue contracts passed.');
