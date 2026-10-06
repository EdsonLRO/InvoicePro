(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TallyoIncomeInsights = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const CALCULATION_VERSION = '1.0.0';
  const BOUNDARY_NOTICE = 'These figures cover invoices and payments recorded in Tallyo. Income received elsewhere and business expenses are not included.';
  const CATEGORY = Object.freeze({ id: 'sales_from_invoices', label: 'Sales from invoices', exportLabel: 'Turnover / sales' });
  const ISSUE_MESSAGES = Object.freeze({
    invalid_currency: 'Choose or correct the invoice currency before using this record.',
    missing_issue_date: 'This issued invoice needs an issue date before it can enter a dated invoice period.',
    missing_customer: 'This invoice does not have a retained customer reference or name.',
    missing_invoice_reference: 'This invoice needs a reference number.',
    tax_total_mismatch: 'The saved invoice total cannot be reproduced from its saved line and tax data.',
    missing_payment_date: 'This payment or refund needs a valid date before it can enter a period total.',
    invalid_payment_amount: 'This payment or refund has an invalid or zero amount.',
    payment_currency_mismatch: 'This payment currency does not match its invoice currency.',
    uncertain_provider_lifecycle: 'This provider payment has an unrecognised lifecycle value.',
    payment_exceeds_invoice_total: 'Recorded payments exceed the supported invoice total and need review.',
    paid_without_dated_payment: 'This invoice is marked Paid but has no dated positive payment record.',
    standalone_credit_note: 'This standalone credit note is kept separate and needs explicit reconciliation.',
    payment_on_excluded_invoice: 'A Draft or Cancelled invoice has payment history and needs review.'
  });

  function roundMoney(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.round((number + Math.sign(number || 1) * Number.EPSILON) * 100) / 100;
  }

  function finiteNumber(value) {
    const number = typeof value === 'string' && value.trim() === '' ? NaN : Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function validDate(value) {
    const text = String(value || '');
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) return '';
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return '';
    return text;
  }

  function utcToday() {
    return new Date().toISOString().slice(0, 10);
  }

  function daysBetween(from, to) {
    const parse = value => {
      const [year, month, day] = value.split('-').map(Number);
      return Date.UTC(year, month - 1, day);
    };
    return Math.max(0, Math.floor((parse(to) - parse(from)) / 86400000));
  }

  function normaliseCurrency(value) {
    const currency = String(value || '').trim().toUpperCase();
    return /^[A-Z]{3}$/.test(currency) ? currency : 'UNKNOWN';
  }

  function documentCurrencyValue(document) {
    return document && Object.prototype.hasOwnProperty.call(document, 'currency') ? document.currency : 'GBP';
  }

  function normaliseStatus(document) {
    const raw = String(document && (document.status || document.lifecycle) || 'Draft').trim();
    if (raw.toLowerCase() === 'due') return 'Sent';
    const known = ['draft', 'sent', 'paid', 'cancelled', 'accepted', 'declined'];
    const index = known.indexOf(raw.toLowerCase());
    return index >= 0 ? known[index][0].toUpperCase() + known[index].slice(1) : raw;
  }

  function documentType(document) {
    return String(document && (document.docType || document.doc_type) || 'invoice').trim().toLowerCase().replace(/[-\s]+/g, '_');
  }

  function documentTotal(document) {
    const value = document && document.totals && finiteNumber(document.totals.grandTotal);
    const fallback = document && finiteNumber(document.grand_total);
    return Math.max(0, roundMoney(value == null ? fallback : value));
  }

  function documentTax(document) {
    const value = document && document.totals && finiteNumber(document.totals.taxAmt);
    const fallback = document && finiteNumber(document.tax_amount);
    return Math.max(0, roundMoney(value == null ? fallback : value));
  }

  function issueDate(document) {
    return validDate(document && (document.date || document.issueDate || document.issue_date));
  }

  function dueDate(document) {
    return validDate(document && (document.dueDate || document.due_date));
  }

  function documentReference(document) {
    return String(document && (document.number || document.reference) || '').trim();
  }

  function customerSnapshot(document) {
    const customer = document && (document.customer || document.customer_snapshot);
    if (!customer || typeof customer !== 'object') return { id: '', name: '', email: '' };
    return {
      id: String(customer.id || '').trim(),
      name: String(customer.name || '').trim(),
      email: String(customer.email || '').trim()
    };
  }

  function customerKey(customer) {
    if (customer.id) return `id:${customer.id}`;
    if (customer.name || customer.email) return `snapshot:${customer.name.toLowerCase()}|${customer.email.toLowerCase()}`;
    return 'missing';
  }

  function workflowSource(document) {
    if (document && (document.sourceQuoteId || document.source_quote_id)) return 'accepted_quote';
    const recurringId = document && (document.recurringTemplateId || document.recurring_template_id);
    const recurringHistory = Array.isArray(document && document.history) && document.history.some(event => String(event && event.type || '').toLowerCase() === 'recurring');
    return recurringId || recurringHistory ? 'recurring' : 'one_off';
  }

  function paymentProvider(payment) {
    return String(payment && payment.provider || '').toLowerCase() === 'stripe' ? 'stripe_confirmed' : 'manual';
  }

  function paymentLifecycleIssue(payment) {
    if (String(payment && payment.provider || '').toLowerCase() !== 'stripe') return false;
    const lifecycle = String(payment && payment.lifecycleEvent || '').trim();
    return Boolean(lifecycle) && !['payment', 'refund', 'refund_failed_reversal'].includes(lifecycle);
  }

  function calculateSavedTotals(document) {
    const items = Array.isArray(document && document.items) ? document.items : [];
    const mode = String(document && (document.taxMode || document.tax_mode) || 'exclusive').toLowerCase() === 'inclusive' ? 'inclusive' : 'exclusive';
    let netSum = 0;
    let grossSum = 0;
    const taxRaw = {};
    for (const item of items) {
      const quantity = finiteNumber(item && (item.qty ?? item.quantity)) || 0;
      const price = finiteNumber(item && item.price) || 0;
      const discount = finiteNumber(item && item.discount) || 0;
      const rate = finiteNumber(item && item.tax) || 0;
      const afterDiscount = (quantity * price) * (1 - discount / 100);
      const lineNet = mode === 'inclusive' ? afterDiscount / (1 + rate / 100) : afterDiscount;
      const lineTax = mode === 'inclusive' ? afterDiscount - lineNet : afterDiscount * rate / 100;
      netSum += lineNet;
      grossSum += mode === 'inclusive' ? afterDiscount : afterDiscount + lineTax;
      if (rate > 0) taxRaw[rate] = (taxRaw[rate] || 0) + lineTax;
    }
    const base = mode === 'inclusive' ? grossSum : netSum;
    const subtotal = roundMoney(base);
    const fixedDiscount = document && document._discountMode === 'amount';
    const discountValue = finiteNumber(document && (document.globalDiscount ?? document.global_discount)) || 0;
    const requestedDiscount = fixedDiscount ? (finiteNumber(document && document._discountAmount) || 0) : base * discountValue / 100;
    const globalDiscountAmount = roundMoney(requestedDiscount);
    const discountFactor = base > 0 ? Math.max(0, 1 - globalDiscountAmount / base) : 1;
    let taxAmount = 0;
    for (const raw of Object.values(taxRaw)) taxAmount = roundMoney(taxAmount + roundMoney(raw * discountFactor));
    const shipping = finiteNumber(document && (document.shippingCost ?? document.shipping_cost)) || 0;
    const grandTotal = mode === 'inclusive'
      ? roundMoney(base - globalDiscountAmount + shipping)
      : roundMoney(base - globalDiscountAmount + taxAmount + shipping);
    return { subtotal, globalDiscountAmount, taxAmount, shipping: roundMoney(shipping), mode, grandTotal };
  }

  function validateOptions(options) {
    const from = options && options.from ? validDate(options.from) : '';
    const to = options && options.to ? validDate(options.to) : '';
    const today = validDate(options && options.today) || utcToday();
    if (options && options.from && !from) throw new TypeError('from must be a valid YYYY-MM-DD date');
    if (options && options.to && !to) throw new TypeError('to must be a valid YYYY-MM-DD date');
    if (options && options.today && !validDate(options.today)) throw new TypeError('today must be a valid YYYY-MM-DD date');
    if (from && to && from > to) throw new RangeError('from must not be after to');
    return { from, to, today, customerId: String(options && options.customerId || '').trim() };
  }

  function inPeriod(date, period) {
    if (!date) return false;
    return (!period.from || date >= period.from) && (!period.to || date <= period.to);
  }

  function issueApplies(date, period) {
    if (date) return inPeriod(date, period);
    return !period.from && !period.to;
  }

  function monthKeys(period, observed) {
    if (!period.from || !period.to) return [...observed].sort();
    const result = [];
    let year = Number(period.from.slice(0, 4));
    let month = Number(period.from.slice(5, 7));
    const lastYear = Number(period.to.slice(0, 4));
    const lastMonth = Number(period.to.slice(5, 7));
    while (year < lastYear || (year === lastYear && month <= lastMonth)) {
      result.push(`${year}-${String(month).padStart(2, '0')}`);
      month += 1;
      if (month === 13) { month = 1; year += 1; }
      if (result.length > 600) throw new RangeError('date range must not exceed 600 months');
    }
    return result;
  }

  function emptySummary() {
    return {
      invoiced: 0, received: 0, refunds: 0, netReceived: 0, outstanding: 0, overdue: 0, taxShown: 0,
      issuedInvoiceCount: 0, outstandingInvoiceCount: 0, overdueInvoiceCount: 0, customerCount: 0, incomeRecordCount: 0
    };
  }

  function addMoney(target, key, value) {
    target[key] = roundMoney(target[key] + value);
  }

  function addIssue(issues, code, details) {
    issues.push({
      code,
      message: ISSUE_MESSAGES[code],
      affectsTotals: Boolean(details && details.affectsTotals),
      documentId: String(details && details.documentId || ''),
      invoiceReference: String(details && details.invoiceReference || ''),
      paymentIndex: Number.isInteger(details && details.paymentIndex) ? details.paymentIndex : null
    });
  }

  function canonicalPaymentRows(document, context) {
    const rows = [];
    const payments = Array.isArray(document && document.payments) ? document.payments : [];
    const total = documentTotal(document);
    let runningNet = 0;
    const chronological = payments.map((payment, index) => ({ payment, index, date: validDate(payment && payment.date) }))
      .sort((a, b) => (a.date || '9999-99-99').localeCompare(b.date || '9999-99-99') || a.index - b.index);
    for (const entry of chronological) {
      const payment = entry.payment || {};
      const amountNumber = finiteNumber(payment.amount);
      const signedAmount = amountNumber === null ? 0 : roundMoney(amountNumber);
      const beforeBalance = Math.max(0, roundMoney(total - runningNet));
      const lifecycle = String(payment.lifecycleEvent || '').trim();
      let paymentKind = signedAmount < 0 ? 'refund' : (signedAmount >= beforeBalance - 0.001 && beforeBalance > 0 ? 'full' : 'part');
      if (lifecycle === 'refund_failed_reversal') paymentKind = 'refund_reversal';
      const issueCodes = [...context.documentIssueCodes];
      let blocksTotals = context.currency === 'UNKNOWN';
      if (amountNumber === null || Math.abs(signedAmount) < 0.001) { issueCodes.push('invalid_payment_amount'); blocksTotals = true; }
      if (!entry.date) { issueCodes.push('missing_payment_date'); blocksTotals = true; }
      const paymentCurrency = payment.currency ? normaliseCurrency(payment.currency) : context.currency;
      if (payment.currency && paymentCurrency !== context.currency) { issueCodes.push('payment_currency_mismatch'); blocksTotals = true; }
      if (paymentLifecycleIssue(payment)) { issueCodes.push('uncertain_provider_lifecycle'); blocksTotals = true; }
      if (['Draft', 'Cancelled'].includes(context.status)) issueCodes.push('payment_on_excluded_invoice');
      const afterNet = roundMoney(runningNet + signedAmount);
      if (signedAmount > 0 && afterNet > total + 0.001 && lifecycle !== 'refund_failed_reversal') issueCodes.push('payment_exceeds_invoice_total');
      runningNet = afterNet;
      const datedInPeriod = entry.date ? inPeriod(entry.date, context.period) : true;
      if (!datedInPeriod) continue;
      const uniqueCodes = [...new Set(issueCodes)];
      rows.push({
        id: `${context.documentId || context.invoiceReference || 'invoice'}:payment:${entry.index}`,
        recordType: signedAmount < 0 ? 'refund' : 'payment',
        paymentKind,
        date: entry.date || null,
        amount: signedAmount,
        currency: context.currency,
        category: CATEGORY.id,
        categoryLabel: CATEGORY.label,
        exportCategory: CATEGORY.exportLabel,
        workflowSource: context.source,
        paymentSource: paymentProvider(payment),
        customerId: context.customer.id || null,
        customerName: context.customer.name || 'Customer not recorded',
        invoiceId: context.documentId || null,
        invoiceReference: context.invoiceReference || null,
        invoiceIssueDate: context.issueDate || null,
        taxShown: context.taxShown,
        includedInTotals: !blocksTotals,
        ready: uniqueCodes.length === 0,
        reviewReasons: uniqueCodes,
        paymentIndex: entry.index
      });
    }
    return { rows, runningNet };
  }

  function makeReviewRecord(document, context, codes, suffix) {
    return {
      id: `${context.documentId || context.invoiceReference || 'document'}:review:${suffix}`,
      recordType: 'review', paymentKind: null, date: context.issueDate || null, amount: 0, currency: context.currency,
      category: null, categoryLabel: null, exportCategory: null, workflowSource: context.source, paymentSource: null,
      customerId: context.customer.id || null, customerName: context.customer.name || 'Customer not recorded',
      invoiceId: context.documentId || null, invoiceReference: context.invoiceReference || null,
      invoiceIssueDate: context.issueDate || null, taxShown: context.taxShown, includedInTotals: false, ready: false,
      reviewReasons: [...new Set(codes)], paymentIndex: null
    };
  }

  function buildCurrencyReport(currency, documents, period) {
    const summary = emptySummary();
    const records = [];
    const issues = [];
    const customers = new Map();
    const sources = new Map(['one_off', 'recurring', 'accepted_quote'].map(key => [key, { source: key, invoiced: 0, received: 0, refunds: 0, netReceived: 0, recordCount: 0 }]));
    const months = new Map();
    const paymentDays = [];
    const observedMonths = new Set();

    const ensureMonth = key => {
      if (!months.has(key)) months.set(key, { month: key, invoiced: 0, received: 0, refunds: 0, netReceived: 0 });
      return months.get(key);
    };
    const ensureCustomer = customer => {
      const key = customerKey(customer);
      if (!customers.has(key)) customers.set(key, {
        key, customerId: customer.id || null, customerName: customer.name || 'Customer not recorded',
        invoiced: 0, received: 0, refunds: 0, netReceived: 0, outstanding: 0, overdue: 0, invoiceCount: 0, recordCount: 0
      });
      return customers.get(key);
    };

    for (const document of documents) {
      const type = documentType(document);
      const status = normaliseStatus(document);
      const documentCurrency = normaliseCurrency(documentCurrencyValue(document));
      if (documentCurrency !== currency) continue;
      const date = issueDate(document);
      const due = dueDate(document);
      const reference = documentReference(document);
      const customer = customerSnapshot(document);
      const source = workflowSource(document);
      const total = documentTotal(document);
      const taxShown = documentTax(document);
      const documentId = String(document && document.id || '');
      const context = { currency, status, issueDate: date, dueDate: due, invoiceReference: reference, customer, source, taxShown, documentId, period, documentIssueCodes: [] };

      if (type !== 'invoice') {
        if (['credit', 'credit_note', 'creditnote'].includes(type) && issueApplies(date, period)) {
          addIssue(issues, 'standalone_credit_note', { documentId, invoiceReference: reference });
          records.push(makeReviewRecord(document, context, ['standalone_credit_note'], 'credit-note'));
        }
        continue;
      }

      if (currency === 'UNKNOWN') context.documentIssueCodes.push('invalid_currency');
      if (!date) context.documentIssueCodes.push('missing_issue_date');
      if (!reference) context.documentIssueCodes.push('missing_invoice_reference');
      if (!customer.id && !customer.name) context.documentIssueCodes.push('missing_customer');
      if (Array.isArray(document.items)) {
        const calculated = calculateSavedTotals(document);
        if (Math.abs(calculated.grandTotal - total) > 0.011 || Math.abs(calculated.taxAmount - taxShown) > 0.011) context.documentIssueCodes.push('tax_total_mismatch');
      } else if (taxShown > 0) context.documentIssueCodes.push('tax_total_mismatch');

      for (const code of context.documentIssueCodes) addIssue(issues, code, { affectsTotals: code === 'invalid_currency' || code === 'missing_issue_date', documentId, invoiceReference: reference });

      const paymentResult = canonicalPaymentRows(document, context);
      let reviewRecordAdded = false;
      const allPayments = Array.isArray(document.payments) ? document.payments : [];
      const allNetPaid = roundMoney(allPayments.reduce((sum, payment) => sum + (finiteNumber(payment && payment.amount) || 0), 0));
      const issued = !['Draft', 'Cancelled'].includes(status);
      const issuedInPeriod = issued && currency !== 'UNKNOWN' && issueApplies(date, period);
      const balance = Math.max(0, roundMoney(total - allNetPaid));

      if (issuedInPeriod) {
        addMoney(summary, 'invoiced', total);
        addMoney(summary, 'taxShown', taxShown);
        summary.issuedInvoiceCount += 1;
        if (balance > 0.001) {
          addMoney(summary, 'outstanding', balance);
          summary.outstandingInvoiceCount += 1;
          if (due && due < period.today) { addMoney(summary, 'overdue', balance); summary.overdueInvoiceCount += 1; }
        }
        const customerRow = ensureCustomer(customer);
        addMoney(customerRow, 'invoiced', total);
        addMoney(customerRow, 'outstanding', balance);
        if (due && due < period.today && balance > 0.001) addMoney(customerRow, 'overdue', balance);
        customerRow.invoiceCount += 1;
        addMoney(sources.get(source), 'invoiced', total);
        if (date) { const month = date.slice(0, 7); observedMonths.add(month); addMoney(ensureMonth(month), 'invoiced', total); }
      }

      const datedPositive = allPayments.some(payment => (finiteNumber(payment && payment.amount) || 0) > 0 && validDate(payment && payment.date));
      if (status === 'Paid' && !datedPositive && issueApplies(date, period)) {
        addIssue(issues, 'paid_without_dated_payment', { affectsTotals: true, documentId, invoiceReference: reference });
        context.documentIssueCodes.push('paid_without_dated_payment');
        if (!paymentResult.rows.length) {
          records.push(makeReviewRecord(document, context, context.documentIssueCodes, 'paid-without-payment'));
          reviewRecordAdded = true;
        }
      }

      if (paymentResult.rows.length === 0 && context.documentIssueCodes.length && issuedInPeriod && !reviewRecordAdded) {
        records.push(makeReviewRecord(document, context, context.documentIssueCodes, 'invoice'));
      }

      for (const row of paymentResult.rows) {
        records.push(row);
        for (const code of row.reviewReasons) {
          if (!context.documentIssueCodes.includes(code)) addIssue(issues, code, { affectsTotals: !row.includedInTotals, documentId, invoiceReference: reference, paymentIndex: row.paymentIndex });
        }
        if (!row.includedInTotals) continue;
        const amount = row.amount;
        if (amount > 0) addMoney(summary, 'received', amount);
        if (amount < 0) addMoney(summary, 'refunds', Math.abs(amount));
        addMoney(summary, 'netReceived', amount);
        summary.incomeRecordCount += 1;
        const customerRow = ensureCustomer(customer);
        if (amount > 0) addMoney(customerRow, 'received', amount);
        if (amount < 0) addMoney(customerRow, 'refunds', Math.abs(amount));
        addMoney(customerRow, 'netReceived', amount);
        customerRow.recordCount += 1;
        const sourceRow = sources.get(source);
        if (amount > 0) addMoney(sourceRow, 'received', amount);
        if (amount < 0) addMoney(sourceRow, 'refunds', Math.abs(amount));
        addMoney(sourceRow, 'netReceived', amount);
        sourceRow.recordCount += 1;
        if (row.date) {
          const month = row.date.slice(0, 7); observedMonths.add(month);
          const monthRow = ensureMonth(month);
          if (amount > 0) addMoney(monthRow, 'received', amount);
          if (amount < 0) addMoney(monthRow, 'refunds', Math.abs(amount));
          addMoney(monthRow, 'netReceived', amount);
        }
      }

      if (issuedInPeriod && date && total > 0) {
        let running = 0;
        const dated = allPayments.map((payment, index) => ({ amount: finiteNumber(payment && payment.amount), date: validDate(payment && payment.date), index }))
          .filter(entry => entry.amount !== null && entry.date)
          .sort((a, b) => a.date.localeCompare(b.date) || a.index - b.index);
        for (const entry of dated) {
          running = roundMoney(running + entry.amount);
          if (running >= total - 0.001) { paymentDays.push(daysBetween(date, entry.date)); break; }
        }
      }
    }

    summary.customerCount = [...customers.values()].filter(customer => customer.key !== 'missing' && (customer.recordCount > 0 || customer.invoiceCount > 0)).length;
    const orderedMonths = monthKeys(period, observedMonths).map(key => months.get(key) || { month: key, invoiced: 0, received: 0, refunds: 0, netReceived: 0 });
    const orderedRecords = records.sort((a, b) => String(a.date || '9999-99-99').localeCompare(String(b.date || '9999-99-99')) || String(a.invoiceReference || '').localeCompare(String(b.invoiceReference || '')) || (a.paymentIndex ?? 9999) - (b.paymentIndex ?? 9999));
    const readiness = {
      ready: orderedRecords.filter(record => record.ready).length,
      total: orderedRecords.length,
      needsReview: orderedRecords.filter(record => !record.ready).length,
      excludedFromTotals: orderedRecords.filter(record => !record.includedInTotals).length,
      issues,
      byReason: Object.fromEntries([...new Set(issues.map(issue => issue.code))].sort().map(code => [code, issues.filter(issue => issue.code === code).length]))
    };
    return {
      currency,
      summary,
      timeSeries: orderedMonths,
      customers: [...customers.values()].sort((a, b) => b.netReceived - a.netReceived || b.invoiced - a.invoiced || a.customerName.localeCompare(b.customerName)),
      sources: [...sources.values()],
      paymentTime: { sampleSize: paymentDays.length, averageDays: paymentDays.length ? roundMoney(paymentDays.reduce((sum, days) => sum + days, 0) / paymentDays.length) : null },
      records: orderedRecords,
      readiness
    };
  }

  function calculateIncomeInsights(documents, options) {
    if (!Array.isArray(documents)) throw new TypeError('documents must be an array');
    const period = validateOptions(options || {});
    const scoped = period.customerId
      ? documents.filter(document => customerSnapshot(document).id === period.customerId)
      : documents.slice();
    const currencySet = new Set();
    for (const document of scoped) {
      const type = documentType(document);
      if (type === 'invoice' || ['credit', 'credit_note', 'creditnote'].includes(type)) currencySet.add(normaliseCurrency(documentCurrencyValue(document)));
    }
    const currencies = [...currencySet].sort((a, b) => a === 'UNKNOWN' ? 1 : b === 'UNKNOWN' ? -1 : a.localeCompare(b));
    const reports = currencies.map(currency => buildCurrencyReport(currency, scoped, period));
    const allIssues = reports.flatMap(report => report.readiness.issues);
    return {
      calculationVersion: CALCULATION_VERSION,
      boundaryNotice: BOUNDARY_NOTICE,
      period: { from: period.from || null, to: period.to || null, today: period.today },
      filters: { customerId: period.customerId || null },
      currencyMode: reports.length > 1 ? 'separate' : 'single',
      currencies: reports,
      readiness: {
        ready: reports.reduce((sum, report) => sum + report.readiness.ready, 0),
        total: reports.reduce((sum, report) => sum + report.readiness.total, 0),
        needsReview: reports.reduce((sum, report) => sum + report.readiness.needsReview, 0),
        excludedFromTotals: reports.reduce((sum, report) => sum + report.readiness.excludedFromTotals, 0),
        issues: allIssues
      }
    };
  }

  return Object.freeze({
    CALCULATION_VERSION,
    BOUNDARY_NOTICE,
    CATEGORY,
    calculateIncomeInsights,
    calculateSavedTotals,
    roundMoney,
    validDate
  });
});
