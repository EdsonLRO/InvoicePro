const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const app = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const hash = source => createHash('sha256').update(source.replace(/\r\n/g, '\n').trim()).digest('hex');

// The reviewed interaction refinements change the contiguous route/history block,
// its popstate listeners, the bounded Overview schedule action, and the source-gated
// quote-access/export blocks. Keep every other method/startup byte frozen and
// exercise each reviewed block separately.
let protectedMethods = app.slice(app.indexOf('        methods: {'));
protectedMethods = protectedMethods.replace(/\r?\n\s*this\.resetQuoteAcceptance\(\);/, '');
const accountExportStart = protectedMethods.indexOf('            async exportAccountData()');
const accountExportEnd = protectedMethods.indexOf('            cloneCompanyForAudit(', accountExportStart);
assert.ok(accountExportStart >= 0 && accountExportEnd > accountExportStart, 'reviewed account export redaction must remain bounded');
protectedMethods = protectedMethods.slice(0, accountExportStart) + '            /* account export token redaction reviewed separately */\n' + protectedMethods.slice(accountExportEnd);
const quoteAccessStart = protectedMethods.indexOf('            resetQuoteAcceptance()');
const quoteAccessEnd = protectedMethods.indexOf('            async deleteInvoice(', quoteAccessStart);
assert.ok(quoteAccessStart >= 0 && quoteAccessEnd > quoteAccessStart, 'reviewed quote access UI methods must remain bounded');
protectedMethods = protectedMethods.slice(0, quoteAccessStart) + '            /* quote acceptance UI methods reviewed separately */\n' + protectedMethods.slice(quoteAccessEnd);
const quoteRowMapStart = protectedMethods.indexOf('            rowToInvoice(r)');
const quoteRowMapEnd = protectedMethods.indexOf('            invoiceToRow(inv)', quoteRowMapStart);
assert.ok(quoteRowMapStart >= 0 && quoteRowMapEnd > quoteRowMapStart, 'reviewed quote response row mapping must remain bounded');
protectedMethods = protectedMethods.slice(0, quoteRowMapStart) + '            /* quote response row mapping reviewed separately */\n' + protectedMethods.slice(quoteRowMapEnd);
const cancellationStart = protectedMethods.indexOf('            documentCancellationReason(inv)');
const cancellationEnd = protectedMethods.indexOf('            async changeStatus(newStatus)', cancellationStart);
assert.ok(cancellationStart >= 0 && cancellationEnd > cancellationStart, 'reviewed document cancellation actions must remain bounded');
protectedMethods = protectedMethods.slice(0, cancellationStart) + protectedMethods.slice(cancellationEnd);
const statusChangeStart = protectedMethods.indexOf('            async changeStatus(newStatus)');
const statusChangeEnd = protectedMethods.indexOf('            async addActivityNote()', statusChangeStart);
assert.ok(statusChangeStart >= 0 && statusChangeEnd > statusChangeStart, 'reviewed status action block must remain bounded');
protectedMethods = protectedMethods.slice(0, statusChangeStart) + '            /* document status actions reviewed separately */\n' + protectedMethods.slice(statusChangeEnd);
const paymentRecordStart = protectedMethods.indexOf('            async recordPayment()');
const paymentRecordEnd = protectedMethods.indexOf('            stripePaymentBadge(payment)', paymentRecordStart);
assert.ok(paymentRecordStart >= 0 && paymentRecordEnd > paymentRecordStart, 'reviewed manual-payment guard must remain bounded');
protectedMethods = protectedMethods.slice(0, paymentRecordStart) + '            /* manual payment document-type guard reviewed separately */\n' + protectedMethods.slice(paymentRecordEnd);
const statusPolicyStart = protectedMethods.indexOf('            normalizedStatus(inv)');
const statusPolicyEnd = protectedMethods.indexOf('            statusBadgeClass(status)', statusPolicyStart);
assert.ok(statusPolicyStart >= 0 && statusPolicyEnd > statusPolicyStart, 'reviewed effective-status policy must remain bounded');
protectedMethods = protectedMethods.slice(0, statusPolicyStart) + '            /* effective document status policy reviewed separately */\n' + protectedMethods.slice(statusPolicyEnd);
const overviewActStart = protectedMethods.indexOf('            overviewAct(item)');
const overviewActEnd = protectedMethods.indexOf('            overviewSetupAction(step)', overviewActStart);
assert.ok(overviewActStart >= 0 && overviewActEnd > overviewActStart, 'reviewed Overview action must remain bounded');
protectedMethods = protectedMethods.slice(0, overviewActStart) + '            /* Overview action reviewed separately */\n' + protectedMethods.slice(overviewActEnd);
const navigationStart = protectedMethods.indexOf('            routeTabs()');
const navigationEnd = protectedMethods.indexOf('            ownerRecoveryTokenFromHash()', navigationStart);
assert.ok(navigationStart >= 0 && navigationEnd > navigationStart, 'reviewed navigation block must remain bounded');
protectedMethods = protectedMethods.slice(0, navigationStart) + '            /* navigation methods reviewed separately */\n' + protectedMethods.slice(navigationEnd);
protectedMethods = protectedMethods.replace(/\r?\n\s*window\.(addEventListener|removeEventListener)\('popstate', this\.handlePopState\);/g, '');
assert.equal(hash(protectedMethods), 'e7489859ff23d21ccaee05445051eb8ccca5befebb3989d90803e08d355af5d3', 'all unreviewed methods/startup must remain unchanged');
const canvasStart = app.indexOf('\n', app.indexOf('<div id="invoice-canvas"'));
const canvasEnd = app.indexOf('\n                </div>', app.indexOf('company.invoiceFooter', canvasStart)) + 23;
assert.equal(hash(app.slice(canvasStart, canvasEnd)), 'd478ee1f800c304a181747174eeb2ee4c8fa37a4ab0c294eaf8ac18eaa9187d6', 'printable document content must remain unchanged');
assert.equal((app.match(/id="invoice-canvas"/g) || []).length, 1);
assert.match(app, /@click="exportPDF\(draft\)"/);
assert.match(app, /@click="sendDocumentEmail\(draft\)"[^>]*>Review &amp; send/);
assert.match(app, /Changes are saved when you select Save/);
assert.doesNotMatch(app, /Last saved just now/);
const editor = app.slice(app.indexOf('<div class="editor-layout"'), app.indexOf('<div class="editor-preview-surface"'));
for (const binding of ['draft.customer', 'draft.docType', 'draft.number', 'draft.currency', 'draft.date', 'draft.dueDate', 'draft.poNumber', 'item.name', 'item.qty', 'item.unit', 'item._h', 'item._m', 'item.price', 'item.discount', 'item.tax', 'draft.globalDiscount', 'draft.shippingCost', 'draft.terms', 'draft.notes', 'draft.onlinePaymentMode', 'draft.depositAmount', 'draft.repeat.frequency', 'draft.repeat.emailEnabled', 'draft.overdueFirstReminderDays', 'draft.overdueRepeatReminderDays', 'draft.overdueMaxReminders']) assert.ok(editor.includes(binding), binding + ' remains editable');
for (const handler of ['applyStatusAction', 'onCustomerSelect', 'onDocTypeChange', 'onUnitSelect', 'applyTime', 'selectMatch', 'saveAsNewPreset', 'setTaxMode', 'toggleRepeat', 'toggleOverdueReminders', 'recordPayment', 'openStripeCheckout', 'openStripeRefundModal', 'removePayment', 'addActivityNote']) assert.ok(editor.includes(handler + '(') || editor.includes('"' + handler + '"'), handler + ' remains bound');
assert.match(app, /async changeStatus\(newStatus\)[\s\S]*?statusActions\(this\.draft\)/, 'status changes are restricted to contextual actions');
assert.doesNotMatch(editor, /value="Paid"/, 'Paid is not a user-selectable editor status');
assert.match(editor, /company\.paymentDetails/);
assert.match(editor, /role="switch" aria-label="Recurring invoice"/);
assert.match(editor, /role="switch" aria-label="Overdue reminders"/);
assert.match(editor, /Done editing items/);
assert.match(app, /@click="toggleEditorPreview"/);
assert.match(app, /handlePopState\(event\)[\s\S]*?restoreNavigationState\(event\.state\)/);
assert.match(app, /toggleEditorPreview\(\)[\s\S]*?setRouteKey\(`\$\{this\.activeTab\}-preview`\)/);
assert.match(app, /window\.addEventListener\('popstate', this\.handlePopState\)/);
assert.match(app, /window\.removeEventListener\('popstate', this\.handlePopState\)/);
assert.match(app, /closeOpenRecordMenus = event =>[\s\S]*?details\.record-menu\[open\][\s\S]*?!menu\.contains\(event\.target\)/);
assert.match(app, /document\.addEventListener\('click', closeOpenRecordMenus\)/);
assert.match(editor, /editor-save-row[\s\S]*?editor-rail[\s\S]*?editor-side-options[\s\S]*?editor-payments[\s\S]*?editor-activity/);
assert.match(app, /\.editor-rail>\.editor-payments\s*\{\s*grid-column:1;\s*grid-row:2;/);
assert.match(app, /\.editor-rail>\.editor-activity\s*\{\s*grid-column:1;\s*grid-row:3;/);
assert.match(app, /@media \(max-width:899px\)[\s\S]*?\.editor-form,\.editor-side-options\s*\{\s*display:contents;\s*\}[\s\S]*?\.editor-summary\s*\{[^}]*order:2;\s*\}[\s\S]*?\.editor-save-row\s*\{[^}]*order:3;\s*\}[\s\S]*?\.editor-rail>\.editor-payments\s*\{[^}]*order:4;\s*\}[\s\S]*?\.editor-rail>\.editor-activity\s*\{[^}]*order:5;\s*\}/,
  'mobile editor flows from Notes to Summary, save, Payments and Activity');
assert.match(app, /@media \(max-width:899px\)[\s\S]*?\.editor-preview-surface:not\(\.editor-preview-hidden\)\s*\{[^}]*overflow-x:hidden;[^}]*\}[\s\S]*?\.editor-preview-surface:not\(\.editor-preview-hidden\) #invoice-canvas\s*\{[^}]*zoom:min\(1,calc\(\(100vw - 40px\)\/800px\)\);[^}]*margin:0 auto;/,
  'mobile document preview fits the available width without changing the printable template');
assert.match(app, /'editor-preview-document': editorPreview && !isExportingPDF/);
assert.match(app, /\.editor-preview-document\s*\{[^}]*border:1px solid #e2e8f0!important;[^}]*border-radius:\.75rem!important;[^}]*overflow:hidden;/);
assert.match(app, /\.editor-preview-document \.pdf-line-items thead th:nth-child\(6\)\s*\{[^}]*border-top-right-radius:\.5rem;/,
  'preview-only document and visible final table column keep complete rounded right edges');
console.log('Step 4 contracts passed: non-navigation handler/startup and printable-template hashes, reviewed history routing, one PDF canvas, complete editor bindings, explicit save/review, accessible automation controls.');
