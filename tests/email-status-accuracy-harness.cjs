const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const documentEmail = fs.readFileSync(path.join(root, 'supabase', 'functions', 'send-document-email', 'index.ts'), 'utf8');
const reminderEmail = fs.readFileSync(path.join(root, 'supabase', 'functions', 'send-reminder-email', 'index.ts'), 'utf8');
const overdueEmail = fs.readFileSync(path.join(root, 'supabase', 'functions', 'send-overdue-reminders', 'index.ts'), 'utf8');
const recurringEmail = fs.readFileSync(path.join(root, 'supabase', 'functions', 'generate-recurring', 'index.ts'), 'utf8');
const resendWebhook = fs.readFileSync(path.join(root, 'supabase', 'functions', 'resend-webhook', 'index.ts'), 'utf8');

function methodBody(source, signature) {
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, `${signature} must exist`);
  const open = source.indexOf('{', start + signature.length);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, index);
    }
  }
  throw new Error(`Could not parse ${signature}`);
}

const emailStatusFor = new Function('id', methodBody(app, 'emailStatusFor(id)'));
const invoiceId = '11111111-1111-4111-8111-111111111111';

function status(events, extra = {}) {
  return emailStatusFor.call({
    emailEventsByDocument: { [invoiceId]: events },
    emailSendingId: null,
    emailSendingStage: null,
    draft: null,
    formatHistoryTime(value) { return value; },
    ...extra
  }, invoiceId);
}

assert.equal(status([], { emailSendingId: invoiceId, emailSendingStage: 'prepared' }).label, 'Preparing');
assert.equal(status([], { emailSendingId: invoiceId, emailSendingStage: 'queued' }).label, 'Sending');

const accepted = {
  event_type: 'document_email_sent',
  provider_event_id: 'email-new',
  created_at: '2026-07-18T12:00:00Z',
  metadata: { to: 'synthetic@example.test' }
};
assert.equal(status([accepted]).label, 'Accepted for delivery', 'API acceptance must not claim delivery');
assert.equal(status([
  { event_type: 'email_delivered', created_at: '2026-07-18T12:01:00Z', metadata: { resend_email_id: 'email-new' } },
  accepted
]).label, 'Delivered');
assert.equal(status([
  { event_type: 'email_delivery_delayed', created_at: '2026-07-18T12:01:00Z', metadata: { resend_email_id: 'email-new' } },
  accepted
]).label, 'Delayed');
assert.equal(status([
  { event_type: 'email_bounced', created_at: '2026-07-18T12:01:00Z', metadata: { resend_email_id: 'email-new' } },
  accepted
]).label, 'Bounced');

assert.equal(status([
  { ...accepted, provider_event_id: 'email-retry', created_at: '2026-07-18T13:00:00Z' },
  { event_type: 'email_bounced', created_at: '2026-07-18T12:30:00Z', metadata: { resend_email_id: 'email-old' } },
  { ...accepted, provider_event_id: 'email-old', created_at: '2026-07-18T12:00:00Z' }
]).label, 'Accepted for delivery', 'a later accepted retry must supersede an older bounce');

assert.equal(status([
  { event_type: 'email_send_failed', created_at: '2026-07-18T13:00:00Z', metadata: { reason: 'provider_timeout' } },
  { event_type: 'email_delivered', created_at: '2026-07-18T12:30:00Z', metadata: { resend_email_id: 'email-old' } },
  { ...accepted, provider_event_id: 'email-old', created_at: '2026-07-18T12:00:00Z' }
]).label, 'Failed', 'a failed latest attempt must remain visible after refresh');

assert.equal(status([{
  event_type: 'payment_reminder_email_sent',
  provider_event_id: 'reminder-new',
  created_at: '2026-07-18T14:00:00Z',
  metadata: {}
}]).label, 'Accepted for delivery');

for (const source of [documentEmail, reminderEmail, overdueEmail, recurringEmail]) {
  assert.match(source, /"Idempotency-Key": resendRequestKey/);
  assert.match(source, /AbortSignal\.timeout\(15_000\)/);
}
assert.match(documentEmail, /provider timed out; it is safe to retry/);
assert.match(reminderEmail, /provider timed out; it is safe to retry/);
assert.match(overdueEmail, /reason: timedOut \? "provider_timeout" : "provider_request_failed"/);
assert.match(recurringEmail, /reason: timedOut \? "provider_timeout" : "provider_request_failed"/);

assert.match(resendWebhook, /req\.headers\.get\("svix-id"\)/);
assert.match(resendWebhook, /"email\.sent": `Email sent to provider/);
assert.doesNotMatch(resendWebhook, /raw:\s*payload/);
assert.match(app, /'payment_reminder_email_sent', 'email_send_failed'/);
assert.match(app, /You can follow its status in Activity History/);
assert.match(app, /Emails processed\. Accepted for delivery:/);
assert.doesNotMatch(app, /Provider submission complete|Delivery status will update when the provider reports it/);

console.log('Email status accuracy harness passed.');
