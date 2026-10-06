(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TallyoIncomePack = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const EXPORT_VERSION = '1.0.0';
  const PDF_NOTICE = 'Income records from Tallyo only. This pack does not include expenses or income received outside Tallyo and is not an HMRC submission.';
  const LIMITATIONS = Object.freeze([
    'The pack includes only invoices and payments recorded in Tallyo for the selected period and currency.',
    'It does not include expenses, bank activity, income received elsewhere, profit or tax due.',
    'Tax shown is copied from saved invoices for context. It is not a VAT or tax calculation.',
    'Review warnings identify records that need attention. They are not a compliance assessment.',
    'Nothing in this pack is filed with or sent to HMRC.'
  ]);
  const CSV_DEFINITIONS = Object.freeze([
    { key: 'income-records', filename: 'income-records.csv', description: 'Payments, refunds and review records with their invoice references.' },
    { key: 'invoice-index', filename: 'invoice-index.csv', description: 'Issued invoice values, recorded payments and remaining balances.' },
    { key: 'customer-income-summary', filename: 'customer-income-summary.csv', description: 'Selected-period invoice and receipt totals grouped by customer.' },
    { key: 'income-by-period', filename: 'income-by-period.csv', description: 'Monthly invoice and receipt totals for the selected period.' },
    { key: 'refunds-and-credit-notes', filename: 'refunds-and-credit-notes.csv', description: 'Refund records and standalone credit notes requiring separate review.' },
    { key: 'readiness-report', filename: 'readiness-report.csv', description: 'Grouped record checks and the invoice references they affect.' }
  ]);

  function roundMoney(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.round((number + Math.sign(number || 1) * Number.EPSILON) * 100) / 100;
  }

  function csvNumber(value, decimals = 2) {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new TypeError('CSV numeric values must be finite');
    return Object.freeze({ csvNumber: true, value: number.toFixed(decimals) });
  }

  function neutraliseSpreadsheetText(value) {
    const text = String(value == null ? '' : value).replace(/\u0000/g, '');
    const formulaProbe = text.replace(/^\uFEFF+/, '');
    return /^[\s\u0001-\u001f]*[=+\-@]/.test(formulaProbe) ? `'${text}` : text;
  }

  function encodeCsvCell(value) {
    const text = value && value.csvNumber === true ? value.value : neutraliseSpreadsheetText(value);
    return `"${String(text).replace(/"/g, '""')}"`;
  }

  function createCsv(metadata, headers, rows) {
    const metadataRows = [
      ['Export version', metadata.exportVersion],
      ['Calculation version', metadata.calculationVersion],
      ['Generated at', metadata.generatedAt],
      ['Period from', metadata.period.from || 'All available dates'],
      ['Period to', metadata.period.to || 'All available dates'],
      ['Currency', metadata.currency],
      ['Business', metadata.businessName || 'Business name not recorded'],
      ['Scope', metadata.notice]
    ];
    const lines = metadataRows.map(row => row.map(encodeCsvCell).join(','));
    lines.push('', headers.map(encodeCsvCell).join(','));
    for (const row of rows) lines.push(row.map(encodeCsvCell).join(','));
    return `\uFEFF${lines.join('\r\n')}\r\n`;
  }

  function issueGroups(report) {
    const groups = new Map();
    for (const issue of report.readiness.issues || []) {
      const code = String(issue.code || 'needs_review');
      if (!groups.has(code)) groups.set(code, {
        code,
        message: String(issue.message || 'This record needs review.'),
        count: 0,
        excluded: 0,
        references: new Set()
      });
      const group = groups.get(code);
      group.count += 1;
      if (issue.affectsTotals) group.excluded += 1;
      if (issue.invoiceReference) group.references.add(String(issue.invoiceReference));
    }
    return [...groups.values()].map(group => ({
      code: group.code,
      message: group.message,
      count: group.count,
      excluded: group.excluded,
      references: [...group.references].sort().join('; ')
    })).sort((a, b) => a.code.localeCompare(b.code));
  }

  function recordReasons(record, messages) {
    return (record.reviewReasons || []).map(code => messages.get(code) || String(code).replace(/_/g, ' ')).join('; ');
  }

  function reconcileReport(report) {
    const included = (report.records || []).filter(record => record.includedInTotals && ['payment', 'refund'].includes(record.recordType));
    const received = roundMoney(included.filter(record => record.amount > 0).reduce((sum, record) => sum + record.amount, 0));
    const refunds = roundMoney(included.filter(record => record.amount < 0).reduce((sum, record) => sum + Math.abs(record.amount), 0));
    const netReceived = roundMoney(included.reduce((sum, record) => sum + record.amount, 0));
    const invoices = report.invoiceIndex || [];
    const invoiced = roundMoney(invoices.reduce((sum, invoice) => sum + invoice.grossTotal, 0));
    const outstanding = roundMoney(invoices.reduce((sum, invoice) => sum + invoice.outstanding, 0));
    const overdue = roundMoney(invoices.reduce((sum, invoice) => sum + invoice.overdue, 0));
    const taxShown = roundMoney(invoices.reduce((sum, invoice) => sum + invoice.taxShown, 0));
    const expected = report.summary || {};
    const checks = { received, refunds, netReceived, invoiced, outstanding, overdue, taxShown };
    for (const [key, value] of Object.entries(checks)) {
      if (Math.abs(value - roundMoney(expected[key])) > 0.001) throw new Error(`Export rows do not reconcile with ${key}`);
    }
    if (included.length !== Number(expected.incomeRecordCount || 0)) throw new Error('Export rows do not reconcile with incomeRecordCount');
    return Object.freeze(checks);
  }

  function requireCalculation(calculation, currency) {
    if (!calculation || typeof calculation !== 'object' || !Array.isArray(calculation.currencies)) throw new TypeError('A canonical income calculation is required');
    const selectedCurrency = String(currency || '').trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(selectedCurrency)) throw new TypeError('A three-letter export currency is required');
    const report = calculation.currencies.find(item => item.currency === selectedCurrency);
    if (!report) throw new RangeError('The selected currency has no income report');
    if (!calculation.calculationVersion) throw new TypeError('The calculation version is required');
    return { report, currency: selectedCurrency };
  }

  function normaliseGeneratedAt(value) {
    const date = new Date(value || Date.now());
    if (!Number.isFinite(date.getTime())) throw new TypeError('generatedAt must be a valid date');
    return date.toISOString();
  }

  function buildIncomePack(calculation, options) {
    const selected = requireCalculation(calculation, options && options.currency);
    const report = selected.report;
    const groups = issueGroups(report);
    const issueMessages = new Map(groups.map(group => [group.code, group.message]));
    const metadata = Object.freeze({
      exportVersion: EXPORT_VERSION,
      calculationVersion: String(calculation.calculationVersion),
      generatedAt: normaliseGeneratedAt(options && options.generatedAt),
      period: Object.freeze({ from: calculation.period && calculation.period.from || null, to: calculation.period && calculation.period.to || null }),
      currency: selected.currency,
      businessName: String(options && options.businessName || '').trim(),
      notice: String(calculation.boundaryNotice || PDF_NOTICE)
    });
    const traceTotals = reconcileReport(report);

    const recordsRows = (report.records || []).map(record => [
      record.date || '', record.recordType || '', record.recordType === 'review' ? '' : csvNumber(record.amount), selected.currency,
      record.exportCategory || '', record.customerName || '', record.invoiceReference || '', record.invoiceIssueDate || '',
      record.workflowSource || '', record.paymentSource || '', csvNumber(record.taxShown), record.includedInTotals ? 'Yes' : 'No',
      record.ready ? 'Ready' : 'Needs review', recordReasons(record, issueMessages)
    ]);
    const invoiceRows = (report.invoiceIndex || []).map(invoice => [
      invoice.issueDate || '', invoice.dueDate || '', invoice.invoiceReference || '', invoice.customerName || '', invoice.status || '',
      invoice.workflowSource || '', csvNumber(invoice.grossTotal), csvNumber(invoice.taxShown), csvNumber(invoice.recordedPayments),
      csvNumber(invoice.outstanding), csvNumber(invoice.overdue), invoice.ready ? 'Ready' : 'Needs review',
      (invoice.reviewReasons || []).map(code => issueMessages.get(code) || String(code).replace(/_/g, ' ')).join('; ')
    ]);
    const customerRows = (report.customers || []).map(customer => [
      customer.customerName || '', csvNumber(customer.invoiced), csvNumber(customer.received), csvNumber(customer.refunds),
      csvNumber(customer.netReceived), csvNumber(customer.outstanding), csvNumber(customer.overdue),
      csvNumber(customer.invoiceCount, 0), csvNumber(customer.recordCount, 0)
    ]);
    const periodRows = (report.timeSeries || []).map(month => [
      month.month, csvNumber(month.invoiced), csvNumber(month.received), csvNumber(month.refunds), csvNumber(month.netReceived)
    ]);
    const adjustmentRows = (report.records || []).filter(record => record.recordType === 'refund' || (record.reviewReasons || []).includes('standalone_credit_note')).map(record => [
      record.date || '', record.recordType === 'refund' ? 'Refund' : 'Standalone credit note', record.invoiceReference || '', record.customerName || '',
      record.recordType === 'review' ? '' : csvNumber(record.amount), record.ready ? 'Ready' : 'Needs review', recordReasons(record, issueMessages)
    ]);
    const readinessRows = groups.map(group => [group.code, group.message, csvNumber(group.count, 0), csvNumber(group.excluded, 0), group.references]);

    const sources = {
      'income-records': { headers: ['Date', 'Record type', 'Amount', 'Currency', 'Category', 'Customer', 'Invoice reference', 'Invoice issue date', 'Workflow source', 'Payment source', 'Invoice tax shown', 'Included in totals', 'Record check', 'Review explanation'], rows: recordsRows },
      'invoice-index': { headers: ['Issue date', 'Due date', 'Invoice reference', 'Customer', 'Status', 'Workflow source', 'Gross invoice value', 'Tax shown', 'Recorded payments', 'Outstanding', 'Overdue', 'Record check', 'Review explanation'], rows: invoiceRows },
      'customer-income-summary': { headers: ['Customer', 'Invoiced', 'Received', 'Refunds', 'Net received', 'Outstanding', 'Overdue', 'Invoice count', 'Income record count'], rows: customerRows },
      'income-by-period': { headers: ['Month', 'Invoiced', 'Received', 'Refunds', 'Net received'], rows: periodRows },
      'refunds-and-credit-notes': { headers: ['Date', 'Adjustment type', 'Invoice or credit-note reference', 'Customer', 'Amount', 'Record check', 'Review explanation'], rows: adjustmentRows },
      'readiness-report': { headers: ['Check code', 'Explanation', 'Records affected', 'Excluded from totals', 'Invoice references'], rows: readinessRows }
    };
    const csvFiles = CSV_DEFINITIONS.map(definition => Object.freeze({
      ...definition,
      mime: 'text/csv;charset=utf-8',
      rowCount: sources[definition.key].rows.length,
      content: createCsv(metadata, sources[definition.key].headers, sources[definition.key].rows)
    }));

    const summary = Object.freeze({
      invoiced: roundMoney(report.summary.invoiced), received: roundMoney(report.summary.received), refunds: roundMoney(report.summary.refunds),
      netReceived: roundMoney(report.summary.netReceived), outstanding: roundMoney(report.summary.outstanding), overdue: roundMoney(report.summary.overdue),
      taxShown: roundMoney(report.summary.taxShown), incomeRecordCount: Number(report.summary.incomeRecordCount || 0)
    });
    const readiness = Object.freeze({
      ready: Number(report.readiness.ready || 0), total: Number(report.readiness.total || 0),
      needsReview: Number(report.readiness.needsReview || 0), excludedFromTotals: Number(report.readiness.excludedFromTotals || 0), groups
    });
    const pdf = Object.freeze({
      filename: 'income-summary.pdf', title: 'Tallyo income summary', notice: PDF_NOTICE,
      metadata, summary, readiness, limitations: [...LIMITATIONS],
      customers: (report.customers || []).map(customer => ({ name: customer.customerName || 'Customer not recorded', netReceived: roundMoney(customer.netReceived) })),
      periods: (report.timeSeries || []).map(month => ({ month: month.month, netReceived: roundMoney(month.netReceived) }))
    });
    const manifest = {
      exportVersion: EXPORT_VERSION,
      calculationVersion: metadata.calculationVersion,
      generatedAt: metadata.generatedAt,
      period: metadata.period,
      currency: metadata.currency,
      businessName: metadata.businessName || null,
      scopeNotice: metadata.notice,
      pdfNotice: PDF_NOTICE,
      limitations: [...LIMITATIONS],
      summary,
      readiness: { ready: readiness.ready, total: readiness.total, needsReview: readiness.needsReview, excludedFromTotals: readiness.excludedFromTotals },
      traceTotals,
      files: [
        ...csvFiles.map(file => ({ name: file.filename, type: 'text/csv', rowCount: file.rowCount, description: file.description })),
        { name: 'income-pack-manifest.json', type: 'application/json', rowCount: null, description: 'Pack version, scope, totals, limitations and file list.' },
        { name: pdf.filename, type: 'application/pdf', rowCount: null, description: 'Human-readable income-only summary.' }
      ]
    };
    const manifestFile = Object.freeze({
      key: 'manifest', filename: 'income-pack-manifest.json', mime: 'application/json;charset=utf-8', rowCount: null,
      description: 'Pack version, scope, totals, limitations and file list.', content: `${JSON.stringify(manifest, null, 2)}\n`
    });
    return Object.freeze({ metadata, summary, readiness, traceTotals, csvFiles, manifest: Object.freeze(manifest), manifestFile, pdf });
  }

  return Object.freeze({ EXPORT_VERSION, PDF_NOTICE, LIMITATIONS, CSV_DEFINITIONS, neutraliseSpreadsheetText, buildIncomePack });
});
