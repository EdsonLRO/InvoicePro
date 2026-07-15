const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const writer = fs.readFileSync(
  path.join(root, 'supabase', 'functions', 'log-app-event', 'index.ts'),
  'utf8'
);

function methodSource(startMarker, endMarker) {
  const start = app.indexOf(startMarker);
  const end = app.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, `could not isolate ${startMarker}`);
  return app.slice(start, end);
}

const changeStatus = methodSource('async changeStatus(newStatus)', 'async addActivityNote()');
const recordPayment = methodSource('async recordPayment()', 'stripePaymentBadge(payment)');

for (const eventType of ['document_status_changed', 'manual_payment_recorded']) {
  assert.match(writer, new RegExp(`"${eventType}"`), `${eventType} must be allowlisted`);
  assert.match(app, new RegExp(`logAppAuditEvent\\('${eventType}'`), `${eventType} must be emitted by the app`);
}

assert.match(
  changeStatus,
  /const saved = await this\.persistDraft\(\);[\s\S]*?if \(saved\) \{[\s\S]*?document_status_changed/,
  'document status audit must follow a successful save'
);
assert.match(
  recordPayment,
  /const saved = await this\.persistDraft\(\);[\s\S]*?if \(saved && this\.isUuid\(this\.draft\.id\)\) \{[\s\S]*?manual_payment_recorded/,
  'manual payment audit must follow a successful save'
);

const manualPaymentMetadata = recordPayment.match(
  /logAppAuditEvent\('manual_payment_recorded'[\s\S]*?\{([\s\S]*?)\}\);/
);
assert.ok(manualPaymentMetadata, 'manual payment audit metadata must be present');
assert.doesNotMatch(
  manualPaymentMetadata[1],
  /note|customer|email|address|phone|items|paymentDetails/i,
  'manual payment audit must not include customer or free-text fields'
);

console.log('Financial action audit harness passed.');
