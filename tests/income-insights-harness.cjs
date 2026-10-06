const assert = require('node:assert/strict');
const api = require('../income-insights.js');

const { calculateIncomeInsights, calculateSavedTotals, BOUNDARY_NOTICE, CALCULATION_VERSION } = api;
const period = { from: '2026-04-06', to: '2026-07-05', today: '2026-10-06' };

function invoice(id, changes = {}) {
  const document = {
    id,
    number: id,
    docType: 'invoice',
    status: 'Sent',
    date: '2026-04-06',
    dueDate: '2026-05-06',
    currency: 'GBP',
    customer: { id: 'customer-one', name: 'Fictional Studio', email: 'accounts@fictional.example' },
    items: [{ name: 'Service', qty: 1, price: 100, discount: 0, tax: 0 }],
    globalDiscount: 0,
    taxMode: 'exclusive',
    shippingCost: 0,
    payments: [],
    history: [],
    ...changes
  };
  if (!document.totals) {
    const totals = calculateSavedTotals(document);
    document.totals = { grandTotal: totals.grandTotal, taxAmt: totals.taxAmount };
  }
  return document;
}

function totalInvoice(id, total, changes = {}) {
  return invoice(id, { items: [{ name: 'Service', qty: 1, price: total, discount: 0, tax: 0 }], ...changes });
}

function currency(result, code = 'GBP') {
  const report = result.currencies.find(entry => entry.currency === code);
  assert.ok(report, `${code} report exists`);
  return report;
}

assert.equal(CALCULATION_VERSION, '1.0.0');
assert.match(BOUNDARY_NOTICE, /Income received elsewhere and business expenses are not included/);
assert.equal(Object.isFrozen(api), true, 'public API is immutable');

const documents = [
  totalInvoice('INV-FULL', 100, { payments: [{ amount: 100, date: '2026-04-06', provider: 'manual' }] }),
  totalInvoice('INV-DEPOSIT', 500, { date: '2026-04-09', dueDate: '2026-08-01', payments: [
    { amount: 100, date: '2026-05-01', provider: 'manual' },
    { amount: 400, date: '2026-07-06', provider: 'manual' }
  ] }),
  totalInvoice('INV-REFUND', 300, { date: '2026-04-10', payments: [
    { amount: 300, date: '2026-04-15', provider: 'stripe', providerPaymentIntentId: 'pi_fictional' },
    { amount: -60, date: '2026-07-07', provider: 'stripe', lifecycleEvent: 'refund', providerPaymentIntentId: 'pi_fictional' }
  ] }),
  totalInvoice('INV-PART', 400, { date: '2026-04-13', dueDate: '2026-04-20', payments: [{ amount: 100, date: '2026-04-15' }] }),
  totalInvoice('INV-RECURRING', 120, { date: '2026-04-14', history: [{ type: 'recurring', ts: '2026-04-14T09:00:00Z' }], payments: [{ amount: 120, date: '2026-04-14' }] }),
  totalInvoice('INV-QUOTE', 150, { date: '2026-04-16', sourceQuoteId: 'quote-id', payments: [{ amount: 150, date: '2026-04-17' }] }),
  totalInvoice('QUO-EXCLUDED', 800, { docType: 'quote', status: 'Accepted', payments: [{ amount: 800, date: '2026-04-20' }] }),
  totalInvoice('DRAFT-EXCLUDED', 900, { status: 'Draft' }),
  totalInvoice('CANCELLED-EXCLUDED', 700, { status: 'Cancelled' }),
  totalInvoice('CN-REVIEW', 50, { docType: 'credit', status: 'Sent' })
];
const original = JSON.stringify(documents);
const result = calculateIncomeInsights(documents, period);
const gbp = currency(result);
assert.equal(JSON.stringify(documents), original, 'calculation never mutates owner-loaded records');
assert.deepEqual(result.period, { ...period });
assert.equal(result.currencyMode, 'single');
assert.equal(gbp.summary.invoiced, 1570, 'quotes, drafts, cancelled invoices and credit notes are excluded from issued value');
assert.equal(gbp.summary.received, 870, 'dated payments in the selected period include exact deposits and part-payments');
assert.equal(gbp.summary.refunds, 0, 'a refund in a later period does not rewrite this period');
assert.equal(gbp.summary.netReceived, 870);
assert.equal(gbp.summary.outstanding, 360, 'outstanding uses complete recorded payment history, including later records');
assert.equal(gbp.summary.overdue, 360, 'overdue remains a subset of outstanding');
assert.ok(gbp.summary.overdue <= gbp.summary.outstanding);
assert.equal(gbp.records.filter(record => record.recordType === 'payment').length, 6);
assert.equal(gbp.records.filter(record => record.recordType === 'refund').length, 0);
assert.ok(gbp.records.some(record => record.invoiceReference === 'INV-DEPOSIT' && record.amount === 100 && record.paymentKind === 'part'));
assert.ok(!gbp.records.some(record => record.invoiceReference === 'INV-DEPOSIT' && record.amount === 400), 'payment after the period is not emitted');
assert.equal(gbp.sources.find(source => source.source === 'recurring').netReceived, 120);
assert.equal(gbp.sources.find(source => source.source === 'accepted_quote').netReceived, 150);
assert.equal(gbp.sources.find(source => source.source === 'one_off').netReceived, 600);
assert.equal(gbp.readiness.byReason.standalone_credit_note, 1);
assert.equal(gbp.paymentTime.sampleSize, 5, 'only invoices that become fully paid from dated entries enter payment-time context');

const laterPeriod = currency(calculateIncomeInsights(documents, { from: '2026-07-06', to: '2026-07-07', today: period.today }));
assert.equal(laterPeriod.summary.received, 400);
assert.equal(laterPeriod.summary.refunds, 60);
assert.equal(laterPeriod.summary.netReceived, 340);
assert.equal(laterPeriod.records.find(record => record.amount === 400).paymentKind, 'full', 'the final part-payment is labelled by the balance it clears');

const refundCases = currency(calculateIncomeInsights([
  totalInvoice('FULL-REFUND', 75, { dueDate: '2026-12-01', payments: [
    { amount: 75, date: '2026-04-20', provider: 'stripe' },
    { amount: -75, date: '2026-04-21', provider: 'stripe', lifecycleEvent: 'refund' }
  ] }),
  totalInvoice('UNPAID-OVERDUE', 200, { dueDate: '2026-04-10' })
], period));
assert.equal(refundCases.summary.received, 75);
assert.equal(refundCases.summary.refunds, 75, 'a full refund remains an explicit adjustment');
assert.equal(refundCases.summary.netReceived, 0);
assert.equal(refundCases.summary.outstanding, 275);
assert.equal(refundCases.summary.overdue, 200, 'an unpaid overdue invoice is represented without inventing a payment');

const qualityDocuments = [
  totalInvoice('PAID-NO-EVIDENCE', 80, { status: 'Paid', date: '2026-04-11', payments: [] }),
  totalInvoice('UNDATED', 100, { date: '2026-04-12', payments: [{ amount: 50 }] }),
  totalInvoice('BAD-DATE', 100, { date: '2026-04-12', payments: [{ amount: 50, date: '2026-02-30' }] }),
  totalInvoice('OVERPAID', 100, { date: '2026-04-12', payments: [{ amount: 120, date: '2026-04-13' }] }),
  totalInvoice('MISMATCH', 100, { date: '2026-04-12', payments: [{ amount: 20, date: '2026-04-13', currency: 'USD' }] }),
  totalInvoice('', 100, { id: 'NO-REFERENCE', date: '2026-04-12', customer: null, payments: [{ amount: 20, date: '2026-04-13' }] }),
  totalInvoice('UNKNOWN-CURRENCY', 100, { currency: '', date: '2026-04-12', payments: [{ amount: 10, date: '2026-04-13' }] })
];
const quality = calculateIncomeInsights(qualityDocuments, period);
const qualityGbp = currency(quality);
const qualityUnknown = currency(quality, 'UNKNOWN');
assert.equal(quality.currencyMode, 'separate', 'invalid currency records are isolated, never merged into GBP');
assert.equal(qualityGbp.summary.received, 140, 'valid dated amounts remain visible while blocked records stay out of totals');
assert.equal(qualityGbp.summary.customerCount, 1, 'missing customer metadata never invents an additional customer');
assert.equal(qualityUnknown.summary.received, 0);
assert.equal(qualityUnknown.summary.invoiced, 0, 'invalid currency records never produce a labelled monetary total');
assert.ok(quality.readiness.issues.some(issue => issue.code === 'paid_without_dated_payment'));
assert.ok(quality.readiness.issues.some(issue => issue.code === 'missing_payment_date' && issue.affectsTotals));
assert.ok(quality.readiness.issues.some(issue => issue.code === 'payment_exceeds_invoice_total' && !issue.affectsTotals));
assert.ok(quality.readiness.issues.some(issue => issue.code === 'payment_currency_mismatch' && issue.affectsTotals));
assert.ok(quality.readiness.issues.some(issue => issue.code === 'missing_customer' && !issue.affectsTotals));
assert.ok(quality.readiness.issues.some(issue => issue.code === 'missing_invoice_reference' && !issue.affectsTotals));
assert.ok(quality.readiness.issues.some(issue => issue.code === 'invalid_currency' && issue.affectsTotals));
assert.equal(qualityGbp.records.find(record => record.invoiceId === 'UNDATED').includedInTotals, false);

const stripe = totalInvoice('STRIPE', 200, { date: '2026-04-08', payments: [{ amount: 200, date: '2026-04-09', provider: 'stripe', providerPaymentIntentId: 'pi_example' }] });
const stripeReport = currency(calculateIncomeInsights([stripe], period));
assert.equal(stripeReport.records[0].paymentSource, 'stripe_confirmed');
assert.equal(stripeReport.records[0].ready, true, 'existing confirmed Stripe payment shape is accepted without invented lifecycle data');
const uncertainStripe = totalInvoice('STRIPE-UNCERTAIN', 200, { payments: [{ amount: 200, date: '2026-04-09', provider: 'stripe', lifecycleEvent: 'pending' }] });
assert.equal(currency(calculateIncomeInsights([uncertainStripe], period)).summary.received, 0, 'unrecognised provider lifecycle never enters totals');

const exclusive = invoice('TAX-EXCLUSIVE', {
  items: [{ name: 'Service', qty: 1, price: 100, discount: 0, tax: 20 }],
  globalDiscount: 10,
  shippingCost: 10,
  taxMode: 'exclusive'
});
assert.deepEqual(calculateSavedTotals(exclusive), { subtotal: 100, globalDiscountAmount: 10, taxAmount: 18, shipping: 10, mode: 'exclusive', grandTotal: 118 });
const inclusive = invoice('TAX-INCLUSIVE', {
  items: [{ name: 'Service', qty: 1, price: 120, discount: 0, tax: 20 }],
  taxMode: 'inclusive'
});
assert.deepEqual(calculateSavedTotals(inclusive), { subtotal: 120, globalDiscountAmount: 0, taxAmount: 20, shipping: 0, mode: 'inclusive', grandTotal: 120 });
const taxReport = currency(calculateIncomeInsights([exclusive, inclusive], period));
assert.equal(taxReport.summary.taxShown, 38, 'tax shown is invoice context only');
const brokenTax = structuredClone(exclusive);
brokenTax.totals.grandTotal = 119;
assert.ok(calculateIncomeInsights([brokenTax], period).readiness.issues.some(issue => issue.code === 'tax_total_mismatch'));

const multiCurrency = calculateIncomeInsights([
  totalInvoice('GBP-ONE', 100, { payments: [{ amount: 100, date: '2026-04-06' }] }),
  totalInvoice('USD-ONE', 250, { currency: 'USD', payments: [{ amount: 250, date: '2026-04-06', currency: 'USD' }] })
], period);
assert.equal(multiCurrency.currencyMode, 'separate');
assert.deepEqual(multiCurrency.currencies.map(report => report.currency), ['GBP', 'USD']);
assert.equal(currency(multiCurrency, 'GBP').summary.netReceived, 100);
assert.equal(currency(multiCurrency, 'USD').summary.netReceived, 250);

const deletedCustomer = totalInvoice('SNAPSHOT', 90, { customer: { name: 'Retained Customer Snapshot', email: 'removed@fictional.example' }, payments: [{ amount: 90, date: '2026-04-06' }] });
const snapshotReport = currency(calculateIncomeInsights([deletedCustomer], period));
assert.equal(snapshotReport.customers[0].customerName, 'Retained Customer Snapshot');
assert.equal(snapshotReport.records[0].ready, true, 'a retained historical customer snapshot remains usable without a live customer ID');
const filtered = calculateIncomeInsights(documents, { ...period, customerId: 'customer-one' });
assert.equal(currency(filtered).summary.invoiced, 1570);
assert.equal(calculateIncomeInsights(documents, { ...period, customerId: 'other-customer' }).currencies.length, 0);

const boundary = currency(calculateIncomeInsights([
  totalInvoice('START', 10, { date: '2026-04-06', payments: [{ amount: 10, date: '2026-04-06' }] }),
  totalInvoice('END', 20, { date: '2026-07-05', payments: [{ amount: 20, date: '2026-07-05' }] }),
  totalInvoice('OUTSIDE', 30, { date: '2026-07-06', payments: [{ amount: 30, date: '2026-07-06' }] })
], period));
assert.equal(boundary.summary.invoiced, 30, 'period boundaries are inclusive');
assert.equal(boundary.summary.received, 30);
assert.equal(boundary.timeSeries.length, 4, 'month series includes zero-capable deterministic month buckets');
assert.doesNotThrow(() => calculateIncomeInsights([], { from: '2028-02-29', to: '2028-02-29', today: '2028-02-29' }), 'leap day is valid');
assert.throws(() => calculateIncomeInsights([], { from: '2027-02-29' }), /valid YYYY-MM-DD/);
assert.throws(() => calculateIncomeInsights([], { from: '2026-07-05', to: '2026-04-06' }), /must not be after/);

const largePaymentSet = Array.from({ length: 1001 }, (_, index) => ({ amount: 1, date: index % 2 ? '2026-04-06' : '2026-04-07' }));
const largeReport = currency(calculateIncomeInsights([totalInvoice('LARGE', 1001, { payments: largePaymentSet })], period));
assert.equal(largeReport.records.length, 1001, 'the module does not silently impose a database-page-sized result limit');
assert.equal(largeReport.summary.received, 1001);

// Characterise compatibility with the currently released Overview semantics.
const overviewFixtures = [
  totalInvoice('overdue', 240, { date: '2026-09-01', dueDate: '2026-09-04', payments: [{ amount: 40, date: '2026-09-02' }, { amount: -10, date: '2026-09-03' }] }),
  totalInvoice('cancelled', 240, { status: 'Cancelled', date: '2026-09-01', payments: [{ amount: 50, date: '2026-09-01' }] }),
  totalInvoice('draft', 240, { status: 'Draft', date: '2026-09-01' }),
  totalInvoice('quote', 240, { docType: 'quote', date: '2026-09-01', payments: [{ amount: 800, date: '2026-09-01' }] }),
  totalInvoice('credit', 240, { docType: 'credit', date: '2026-09-01', payments: [{ amount: 200, date: '2026-09-01' }] }),
  totalInvoice('legacy-paid', 100, { status: 'Paid', date: '2026-09-01', dueDate: '2026-09-04' }),
  totalInvoice('usd', 600, { currency: 'USD', date: '2026-09-01', dueDate: '2026-09-30' })
];
const overview = calculateIncomeInsights(overviewFixtures, { from: '2026-09-01', to: '2026-09-30', today: '2026-09-12' });
assert.equal(currency(overview).summary.outstanding, 310, 'released Overview outstanding semantics are preserved');
assert.equal(currency(overview).summary.overdue, 310);
assert.equal(currency(overview).summary.netReceived, 80, 'released Overview paid-this-month net semantics are preserved');
assert.equal(currency(overview, 'USD').summary.outstanding, 600);
assert.equal(currency(overview, 'USD').summary.overdue, 0);

console.log('Income insights harness passed: canonical totals, periods, currencies, customer/source grouping, readiness, payment timing, tax context and released Overview compatibility.');
