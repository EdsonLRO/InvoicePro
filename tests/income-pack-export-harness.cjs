const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const insights = require(path.join(root, 'income-insights.js'));
const incomePack = require(path.join(root, 'income-pack-export.js'));

const invoice = (id, changes = {}) => ({
  id, number: `INV-${id}`, docType: 'invoice', status: 'Sent', currency: 'GBP', date: '2026-07-10', dueDate: '2026-08-10',
  customer: { id: `customer-${id}`, name: `Customer ${id}` }, items: [{ name: 'Service', qty: 1, price: 1000, discount: 0, tax: 0 }],
  totals: { grandTotal: 1000, taxAmt: 0 }, payments: [], history: [], ...changes
});

const documents = [
  invoice('manual', { customer: { id: 'formula-customer', name: '=HYPERLINK("https://example.invalid")' }, payments: [{ amount: 1000, date: '2026-07-12' }] }),
  invoice('recurring', {
    number: '+SUM(1,1)', recurringTemplateId: 'schedule-one',
    totals: { grandTotal: 500, taxAmt: 0 }, items: [{ name: 'Retainer', qty: 1, price: 500, discount: 0, tax: 0 }],
    payments: [{ amount: 500, date: '2026-07-15', provider: 'stripe' }, { amount: -50, date: '2026-08-01', provider: 'stripe', lifecycleEvent: 'refund' }]
  }),
  invoice('review', { status: 'Paid', totals: { grandTotal: 80, taxAmt: 0 }, items: [{ name: 'Review', qty: 1, price: 80, discount: 0, tax: 0 }] }),
  { id: 'credit', number: '@CREDIT', docType: 'credit', status: 'Sent', currency: 'GBP', date: '2026-07-20', customer: { id: 'credit-customer', name: '-Formula customer' }, totals: { grandTotal: 20, taxAmt: 0 }, payments: [] }
];
const calculation = insights.calculateIncomeInsights(documents, { from: '2026-07-01', to: '2026-09-30', today: '2026-09-30' });
const options = { currency: 'GBP', businessName: '@Formula Business', generatedAt: '2026-10-06T12:34:56.000Z' };
const pack = incomePack.buildIncomePack(calculation, options);

assert.equal(incomePack.EXPORT_VERSION, '1.0.0');
assert.equal(pack.metadata.calculationVersion, insights.CALCULATION_VERSION);
assert.equal(pack.metadata.generatedAt, options.generatedAt);
assert.equal(pack.metadata.currency, 'GBP');
assert.equal(pack.csvFiles.length, 6);
assert.deepEqual(pack.csvFiles.map(file => file.filename), [
  'income-records.csv', 'invoice-index.csv', 'customer-income-summary.csv', 'income-by-period.csv', 'refunds-and-credit-notes.csv', 'readiness-report.csv'
]);
assert.equal(pack.csvFiles.find(file => file.key === 'income-records').rowCount, 5);
assert.equal(pack.csvFiles.find(file => file.key === 'invoice-index').rowCount, 3);
assert.equal(pack.summary.invoiced, 1580);
assert.equal(pack.summary.received, 1500);
assert.equal(pack.summary.refunds, 50);
assert.equal(pack.summary.netReceived, 1450);
assert.equal(pack.summary.outstanding, 130);
assert.equal(pack.traceTotals.netReceived, pack.summary.netReceived);
assert.equal(pack.traceTotals.invoiced, pack.summary.invoiced);
assert.equal(pack.manifest.files.length, 8);
assert.equal(pack.manifest.summary.netReceived, 1450);
assert.equal(JSON.parse(pack.manifestFile.content).calculationVersion, insights.CALCULATION_VERSION);
assert.equal(pack.pdf.notice, incomePack.PDF_NOTICE);
assert.match(pack.pdf.notice, /not an HMRC submission/);
assert.ok(pack.pdf.limitations.some(text => /does not include expenses/.test(text)));

for (const file of pack.csvFiles) {
  assert.ok(file.content.startsWith('\uFEFF'), `${file.filename} must include a UTF-8 BOM`);
  assert.match(file.content, /"Export version","1\.0\.0"/);
  assert.match(file.content, /"Calculation version","1\.0\.0"/);
  assert.match(file.content, /"Generated at","2026-10-06T12:34:56\.000Z"/);
  assert.match(file.content, /"Currency","GBP"/);
  assert.match(file.content, /"Scope","These figures cover invoices and payments recorded in Tallyo/);
}
const recordsCsv = pack.csvFiles.find(file => file.key === 'income-records').content;
const invoiceCsv = pack.csvFiles.find(file => file.key === 'invoice-index').content;
assert.match(recordsCsv, /"'=HYPERLINK\(""https:\/\/example\.invalid""\)"/, 'formula-like customer text must be neutralised');
assert.match(recordsCsv, /"'\+SUM\(1,1\)"/, 'formula-like invoice references must be neutralised');
assert.match(invoiceCsv, /"1000\.00"/);
assert.match(invoiceCsv, /"50\.00"/);
assert.doesNotMatch(recordsCsv, /,"=HYPERLINK/);
assert.doesNotMatch(recordsCsv, /,"\+SUM/);
assert.equal(incomePack.neutraliseSpreadsheetText('  -2+3'), "'  -2+3");
assert.equal(incomePack.neutraliseSpreadsheetText('\uFEFF=2+3'), "'\uFEFF=2+3");
assert.equal(incomePack.neutraliseSpreadsheetText('2026-04-06'), '2026-04-06');
assert.deepEqual(incomePack.buildIncomePack(calculation, options), pack, 'fixed inputs must create a deterministic pack');

const corrupted = structuredClone(calculation);
corrupted.currencies[0].summary.netReceived += 1;
assert.throws(() => incomePack.buildIncomePack(corrupted, options), /do not reconcile with netReceived/);

const largeDocuments = Array.from({ length: 2005 }, (_, index) => invoice(`large-${index}`, {
  number: `INV-LARGE-${String(index).padStart(4, '0')}`,
  customer: { id: `large-customer-${index}`, name: `Large customer ${index}` },
  payments: [{ amount: 1000, date: '2026-07-12' }]
}));
const largeCalculation = insights.calculateIncomeInsights(largeDocuments, { from: '2026-07-01', to: '2026-09-30', today: '2026-09-30' });
const largePack = incomePack.buildIncomePack(largeCalculation, options);
assert.equal(largePack.csvFiles.find(file => file.key === 'income-records').rowCount, 2005);
assert.equal(largePack.csvFiles.find(file => file.key === 'invoice-index').rowCount, 2005);
assert.equal(largePack.summary.received, 2005000);

const source = fs.readFileSync(path.join(root, 'income-pack-export.js'), 'utf8');
assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|supabase|localStorage|sessionStorage|indexedDB|document\.cookie/i);
console.log('Income Pack export harness passed: reconciled versioned files, deterministic decimals, manifest, formula neutralisation and 2,005-record scale.');
