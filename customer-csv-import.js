(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TallyoCustomerCsv = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const MAX_BYTES = 1024 * 1024;
  const MAX_ROWS = 500;
  const CANONICAL_HEADERS = ['Name', 'Email', 'Phone', 'Mobile', 'Address', 'Tax ID', 'Additional Info'];
  const HEADER_ALIASES = new Map([
    ['name', 'name'],
    ['name/company', 'name'],
    ['company', 'name'],
    ['company name', 'name'],
    ['email', 'email'],
    ['email address', 'email'],
    ['phone', 'phone'],
    ['phone number', 'phone'],
    ['mobile', 'mobile'],
    ['mobile number', 'mobile'],
    ['address', 'address'],
    ['tax id', 'taxId'],
    ['vat id', 'taxId'],
    ['tax/vat id', 'taxId'],
    ['additional info', 'additionalInfo'],
    ['notes', 'additionalInfo']
  ]);

  function byteLength(value) {
    const text = String(value || '');
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
    return unescape(encodeURIComponent(text)).length;
  }

  function normaliseHeader(value) {
    return String(value || '')
      .replace(/^\uFEFF/, '')
      .trim()
      .toLowerCase()
      .replace(/\s*\/\s*/g, '/')
      .replace(/\s+/g, ' ');
  }

  function parseCsv(text) {
    const source = String(text || '').replace(/^\uFEFF/, '');
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    let closedQuote = false;

    const finishField = () => {
      row.push(field);
      field = '';
      closedQuote = false;
    };
    const finishRow = () => {
      finishField();
      rows.push(row);
      row = [];
    };

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (inQuotes) {
        if (char === '"') {
          if (source[index + 1] === '"') {
            field += '"';
            index += 1;
          } else {
            inQuotes = false;
            closedQuote = true;
          }
        } else if (char === '\r' && source[index + 1] === '\n') {
          field += '\n';
          index += 1;
        } else {
          field += char;
        }
        continue;
      }

      if (closedQuote) {
        if (char === ',') {
          finishField();
          continue;
        }
        if (char === '\n' || char === '\r') {
          if (char === '\r' && source[index + 1] === '\n') index += 1;
          finishRow();
          continue;
        }
        if (char === ' ' || char === '\t') continue;
        throw new Error('Unexpected text after a closing quote. Check the CSV formatting.');
      }

      if (char === '"') {
        if (field.length) throw new Error('A quoted value must start at the beginning of a field. Check the CSV formatting.');
        inQuotes = true;
      } else if (char === ',') {
        finishField();
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && source[index + 1] === '\n') index += 1;
        finishRow();
      } else {
        field += char;
      }
    }

    if (inQuotes) throw new Error('A quoted value is not closed. Check the CSV formatting.');
    if (field.length || row.length || closedQuote) finishRow();
    return rows;
  }

  function isEmptyRow(row) {
    return row.every(value => !String(value || '').trim());
  }

  function parseCustomers(text, options) {
    const settings = options || {};
    const maxBytes = Number(settings.maxBytes) || MAX_BYTES;
    const maxRows = Number(settings.maxRows) || MAX_ROWS;
    if (byteLength(text) > maxBytes) throw new Error('Choose a CSV file smaller than 1 MB.');

    const parsed = parseCsv(text);
    while (parsed.length && isEmptyRow(parsed[parsed.length - 1])) parsed.pop();
    if (!parsed.length || isEmptyRow(parsed[0])) throw new Error('The CSV file needs a header row.');

    const header = parsed[0];
    const mappedHeaders = header.map(value => HEADER_ALIASES.get(normaliseHeader(value)) || null);
    if (!mappedHeaders.includes('name')) throw new Error('Add a Name column to the CSV file.');

    const recognised = mappedHeaders.filter(Boolean);
    const duplicateHeader = recognised.find((key, index) => recognised.indexOf(key) !== index);
    if (duplicateHeader) throw new Error('Each supported customer column can appear only once.');

    const dataRows = parsed.slice(1)
      .map((sourceRow, index) => ({ sourceRow, rowNumber: index + 2 }))
      .filter(entry => !isEmptyRow(entry.sourceRow));
    if (dataRows.length > maxRows) throw new Error(`Import up to ${maxRows} customers at a time.`);

    const existingEmails = new Set((settings.existingCustomers || [])
      .map(customer => String(customer && customer.email || '').trim().toLowerCase())
      .filter(Boolean));
    const fileEmails = new Set();
    const rows = [];
    const issues = [];

    dataRows.forEach(({ sourceRow, rowNumber }) => {
      if (sourceRow.length > header.length && sourceRow.slice(header.length).some(value => String(value || '').trim())) {
        issues.push({ row: rowNumber, message: 'This row has more values than the header row.' });
        return;
      }

      const customer = { name: '', email: '', phone: '', mobile: '', address: '', taxId: '', additionalInfo: '' };
      mappedHeaders.forEach((key, columnIndex) => {
        if (key) customer[key] = String(sourceRow[columnIndex] || '').trim();
      });

      if (!customer.name) {
        issues.push({ row: rowNumber, message: 'Name is required.' });
        return;
      }
      if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
        issues.push({ row: rowNumber, message: 'Enter a valid email address or leave it blank.' });
        return;
      }

      const emailKey = customer.email.toLowerCase();
      if (emailKey && existingEmails.has(emailKey)) {
        issues.push({ row: rowNumber, message: 'A customer with this email already exists.' });
        return;
      }
      if (emailKey && fileEmails.has(emailKey)) {
        issues.push({ row: rowNumber, message: 'This email appears more than once in the file.' });
        return;
      }
      if (emailKey) fileEmails.add(emailKey);
      rows.push(customer);
    });

    return { rows, issues, totalRows: dataRows.length };
  }

  function templateCsv() {
    return `${CANONICAL_HEADERS.join(',')}\r\n`;
  }

  return { MAX_BYTES, MAX_ROWS, CANONICAL_HEADERS, parseCsv, parseCustomers, templateCsv };
});
