const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const app = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const hash = source => createHash('sha256').update(source.replace(/\r\n/g, '\n').trim()).digest('hex');

// The approved navigation refinement changes only the contiguous route/history
// block and its popstate listeners. Keep every other existing method/startup byte
// frozen against integration c756f24, and exercise the navigation block below.
let protectedMethods = app.slice(app.indexOf('        methods: {'));
const navigationStart = protectedMethods.indexOf('            routeTabs()');
const navigationEnd = protectedMethods.indexOf('            ownerRecoveryTokenFromHash()', navigationStart);
assert.ok(navigationStart >= 0 && navigationEnd > navigationStart, 'reviewed navigation block must remain bounded');
protectedMethods = protectedMethods.slice(0, navigationStart) + '            /* navigation methods reviewed separately */\n' + protectedMethods.slice(navigationEnd);
protectedMethods = protectedMethods.replace(/\r?\n\s*window\.(addEventListener|removeEventListener)\('popstate', this\.handlePopState\);/g, '');
assert.equal(hash(protectedMethods), 'db3952fa253a82879412ac1ff1f5e22e33a993b99f0df370fee0cd0c16751b50', 'all non-navigation methods/startup must remain unchanged');
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
for (const handler of ['changeStatus', 'onCustomerSelect', 'onDocTypeChange', 'onUnitSelect', 'applyTime', 'selectMatch', 'saveAsNewPreset', 'setTaxMode', 'toggleRepeat', 'toggleOverdueReminders', 'recordPayment', 'openStripeCheckout', 'openStripeRefundModal', 'removePayment', 'addActivityNote']) assert.ok(editor.includes(handler + '(') || editor.includes('"' + handler + '"'), handler + ' remains bound');
assert.match(editor, /company\.paymentDetails/);
assert.match(editor, /role="switch" aria-label="Recurring invoice"/);
assert.match(editor, /role="switch" aria-label="Overdue reminders"/);
assert.match(editor, /Done editing items/);
assert.match(app, /@click="toggleEditorPreview"/);
assert.match(app, /handlePopState\(event\)[\s\S]*?restoreNavigationState\(event\.state\)/);
assert.match(app, /toggleEditorPreview\(\)[\s\S]*?setRouteKey\(`\$\{this\.activeTab\}-preview`\)/);
assert.match(app, /window\.addEventListener\('popstate', this\.handlePopState\)/);
assert.match(app, /window\.removeEventListener\('popstate', this\.handlePopState\)/);
console.log('Step 4 contracts passed: non-navigation handler/startup and printable-template hashes, reviewed history routing, one PDF canvas, complete editor bindings, explicit save/review, accessible automation controls.');
