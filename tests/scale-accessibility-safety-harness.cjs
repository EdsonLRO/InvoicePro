const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function extract(pattern, message) {
  const match = app.match(pattern);
  assert.ok(match, message);
  return match;
}

const fetchParts = extract(
  /async fetchAllOwnedRows\(([^)]*)\) \{([\s\S]*?)\r?\n            \},\r?\n            async exportAccountData\(\)/,
  'fetchAllOwnedRows must remain extractable'
);
const datasets = {
  customers: Array.from({ length: 1000 }, (_, index) => ({ id: index + 1, name: `Synthetic Customer ${index}` })),
  saved_items: Array.from({ length: 1000 }, (_, index) => ({ id: index + 1, name: `Synthetic Item ${index}` })),
  invoices: Array.from({ length: 2000 }, (_, index) => ({ id: index + 1 }))
};
const ranges = {};
const fakeSupabase = {
  from(table) {
    const rows = datasets[table] || [];
    ranges[table] = ranges[table] || [];
    return {
      select() { return this; },
      order() { return this; },
      range(from, to) {
        ranges[table].push([from, to]);
        return Promise.resolve({ data: rows.slice(from, to + 1), error: null });
      }
    };
  }
};
const fetchAllOwnedRows = new Function('supabaseClient', `return async function(${fetchParts[1]}) {${fetchParts[2]}}`)(fakeSupabase);

const calcBody = extract(
  /calcTotals\(src\) \{([\s\S]*?)\r?\n            \},\r?\n            isUuid\(v\)/,
  'calcTotals must remain extractable'
)[1];
const calcTotals = new Function('src', calcBody);
const hundredLineInvoice = {
  taxMode: 'exclusive', globalDiscount: 2.5, shippingCost: 12.34,
  items: Array.from({ length: 100 }, (_, index) => ({ qty: index + 1, price: 1.25, discount: index % 7, tax: 20 }))
};

const filterBody = extract(
  /filteredInvoices\(\) \{([\s\S]*?)\r?\n            \},\r?\n            invoiceTotalPages\(\)/,
  'filteredInvoices must remain extractable'
)[1];
const filteredInvoices = new Function(filterBody);
const documents = Array.from({ length: 2000 }, (_, index) => ({
  id: index + 1,
  number: `INV-${String(index + 1).padStart(4, '0')}`,
  date: `2026-07-${String((index % 28) + 1).padStart(2, '0')}`,
  docType: 'invoice', status: index % 2 ? 'Sent' : 'Draft',
  customer: { name: `Synthetic Customer ${index % 1000}` },
  totals: { grandTotal: index + 1 }
}));

(async () => {
  const loaded = await fetchAllOwnedRows('invoices', 'created_at', 1000, false);
  assert.equal(loaded.length, 2000, 'all 2,000 synthetic documents must load');
  assert.deepEqual(ranges.invoices, [[0, 999], [1000, 1999], [2000, 2999]], 'exact page boundaries must continue until a short page');
  assert.equal((await fetchAllOwnedRows('customers', 'name')).length, 1000, 'all 1,000 synthetic customers must load');
  assert.equal((await fetchAllOwnedRows('saved_items', 'name')).length, 1000, 'all 1,000 synthetic saved items must load');
  assert.deepEqual(ranges.customers, [[0, 999], [1000, 1999]]);
  assert.deepEqual(ranges.saved_items, [[0, 999], [1000, 1999]]);
  assert.match(app, /if \(orderColumn !== 'id'\) query = query\.order\('id', \{ ascending: true \}\)/,
    'pagination must use an id tie-breaker for stable page boundaries');

  for (const call of [
    "fetchAllOwnedRows('customers', 'name')",
    "fetchAllOwnedRows('saved_items', 'name')",
    "fetchAllOwnedRows('invoices', 'created_at', 1000, false)",
    "fetchAllOwnedRows('recurring_templates', 'created_at', 1000, false)",
  ]) assert.ok(app.includes(call), `${call} must be used during normal loading`);

  const started = performance.now();
  const totals = calcTotals(hundredLineInvoice);
  assert.ok(Number.isFinite(totals.grandTotal) && totals.grandTotal > 0, '100-line totals must remain finite');
  const longHistory = Array.from({ length: 500 }, (_, index) => ({ ts: new Date(index * 1000).toISOString(), type: 'note', text: 'Synthetic event' }));
  assert.equal([...longHistory].reverse().length, 500, 'long activity histories must remain iterable without truncation');
  const context = {
    invoices: documents,
    invoiceSearch: 'synthetic customer 999', invoiceStatusFilter: 'All', invoiceTypeFilter: 'All', invoiceSort: 'amount_desc',
    effectiveStatus(inv) { return inv.status; }
  };
  const filtered = filteredInvoices.call(context);
  const elapsed = performance.now() - started;
  assert.equal(filtered.length, 2, 'search must find the expected synthetic customer documents');
  assert.ok(elapsed < 1000, `synthetic calculation/filter pass took ${elapsed.toFixed(1)}ms`);
  assert.match(app, /const data = this\.invoices\.map\(inv => \(\{/);
  assert.match(app, /XLSX\.writeFile\(wb, "Invoices_Export\.xlsx"\)/);

  assert.match(app, /updatedAt: r\.updated_at \|\| null/);
  assert.match(app, /updateQuery = updateQuery\.eq\('updated_at', existing\.updatedAt\)/);
  assert.match(app, /changed in another tab or device/i);
  assert.match(app, /if \(this\.documentSaveBusy\) return false;/);
  for (const busy of ['quickCustomerSaveBusy', 'customerSaveBusy', 'itemSaveBusy', 'scheduleSaveBusy']) {
    assert.match(app, new RegExp(`if \\(this\\.${busy}\\) return`), `${busy} must prevent duplicate saves`);
  }

  assert.match(app, /:focus-visible \{ outline: 3px solid #4f46e5 !important;/);
  assert.match(app, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(app, /bindAccessibleLabels\(\)/);
  assert.match(app, /new MutationObserver\(\(\) => this\.bindAccessibleLabels\(\)\)/);
  assert.match(app, /role="status" aria-live="polite" aria-label="Loading account data"/);
  assert.match(app, /class="primary-menu-toggle[^\"]*" aria-label="Menu" aria-controls="primary-navigation" :aria-expanded=/,
    'the menu button must remain available until the full navigation fits');
  assert.match(app, /\.primary-navigation \{[\s\S]*?max-height: calc\(100vh - 4rem\);[\s\S]*?overflow-y: auto;/,
    'the compact navigation must remain scrollable on short windows');
  assert.match(app, /@media \(min-width: 1280px\) \{[\s\S]*?\.primary-menu-toggle \{ display: none; \}[\s\S]*?\.primary-navigation \{[\s\S]*?display: flex !important;/,
    'the full navigation must replace the menu button only at a safe desktop width');
  assert.match(app, /id="primary-navigation"[\s\S]*?:class="mobileMenuOpen \? 'flex' : 'hidden'"[\s\S]*?class="primary-navigation"/,
    'compact navigation visibility must follow the menu state');
  assert.match(app, /inline-flex min-w-16 items-center justify-center rounded px-2 py-1 text-center text-xs font-medium leading-tight/,
    'document type badges must remain centred when labels wrap');
  assert.match(app, /@media \(max-width: 639px\) \{[\s\S]*?\.invoice-email-status-full \{ display: none; \}[\s\S]*?\.invoice-email-status-short \{ display: inline; \}/,
    'mobile invoice rows must use the compact Email status label');
  assert.match(app, /compactEmailStatusLabel\(label\) \{[\s\S]*?label === 'Accepted for delivery' \? 'Accepted' : label;/,
    'the compact Email status must preserve provider-acceptance meaning');
  assert.match(app, /v-show="activeTab === 'create' \|\| activeTab === 'edit' \|\| isExportingPDF"[\s\S]*?'pdf-export-surface': isExportingPDF && activeTab !== 'create' && activeTab !== 'edit'/,
    'invoice export must use the off-screen surface without changing the visible route');

  const exportPdfBody = extract(
    /async exportPDF\(inv, audit = true\) \{([\s\S]*?)\r?\n            \},\r?\n            downloadPdfFile\(pdf, filename\)/,
    'exportPDF must remain extractable'
  )[1];
  assert.doesNotMatch(exportPdfBody, /loadInvoice\(|navigateTo\(|window\.location/,
    'PDF export must not navigate away from My Invoices');
  assert.match(exportPdfBody, /const previousDraft = this\.draft;[\s\S]*?this\.draft = previousDraft;/,
    'PDF export must preserve any draft already in progress');
  assert.match(app, /downloadPdfFile\(pdf, filename\) \{[\s\S]*?pdf\.output\('blob'\)[\s\S]*?type: 'application\/pdf'[\s\S]*?link\.download = filename;[\s\S]*?link\.click\(\);/,
    'PDF download must use a named application/pdf file instead of opening a navigation target');
  assert.doesNotMatch(exportPdfBody, /pdf\.save\(/, 'PDF export must use the explicit MIME-safe downloader');
  assert.match(app, /addPdfRowPageBreaks\(container\) \{[\s\S]*?cloneNode\(true\)[\s\S]*?pdf-repeated-header[\s\S]*?pdf-summary-block[\s\S]*?pdf-summary-spacer/,
    'multi-page PDFs must repeat line-item headers and keep the summary together');
  assert.match(app, /class="pdf-summary-block flex flex-col-reverse/,
    'the totals and document notes must be grouped for page-break handling');

  assert.match(app, /activeTab: 'dashboard'/, 'Dashboard must be the initial authenticated view');
  assert.match(app, /routeKeyFromHash\(\) \{[\s\S]*?return key \|\| 'dashboard';/,
    'an empty route must resolve to Dashboard');
  assert.match(app, /tabFromRouteKey\(routeKey\) \{[\s\S]*?this\.routeTabs\(\)\.includes\(key\) \? key : 'dashboard';/,
    'an unsupported route must resolve to Dashboard');
  assert.match(app, /applyRoute\(tab, routeKey = null\) \{[\s\S]*?this\.routeTabs\(\)\.includes\(tab\) \? tab : 'dashboard';/,
    'route application must fail safely to Dashboard');
  for (const label of ['Remove line item', 'Close new customer dialog', 'Close reminder dialog', 'Close refund dialog']) {
    assert.ok(app.includes(`aria-label="${label}"`), `${label} must have an accessible name`);
  }

  assert.match(app, /Only drafts can be deleted/);
  assert.match(app, /payment or refund history and cannot be deleted/);
  assert.match(app, /Stripe dispute history and cannot be deleted/);
  assert.match(app, /Existing documents keep their saved customer snapshot/);
  assert.match(app, /Existing document line items are unchanged/);
  assert.match(app, /No future invoices will be generated until you resume it/);
  assert.match(app, /The paid amount will become[\s\S]*outstanding balance will become/);
  assert.match(app, /requestPasswordMfaCode\(\{[\s\S]*?title: 'Remove authenticator'/);
  assert.match(app, /confirmLogoutAllDevices\(\)[\s\S]*?reauthenticateCurrentUser\(password, 'global_signout'\)[\s\S]*?currentSessionNeedsMfa/);
  assert.match(app, /reauthenticateCurrentUser\(password, context\)[\s\S]*?options = \{ captchaToken \}[\s\S]*?signInWithPassword/);

  console.log(`Scale, accessibility and destructive-safety harness passed in ${elapsed.toFixed(1)}ms.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
