const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const writer = fs.readFileSync(path.join(root, 'supabase', 'functions', 'log-app-event', 'index.ts'), 'utf8');
const recurring = fs.readFileSync(path.join(root, 'supabase', 'functions', 'generate-recurring', 'index.ts'), 'utf8');
const reminders = fs.readFileSync(path.join(root, 'supabase', 'functions', 'send-overdue-reminders', 'index.ts'), 'utf8');
const resendWebhook = fs.readFileSync(path.join(root, 'supabase', 'functions', 'resend-webhook', 'index.ts'), 'utf8');
const documentEmail = fs.readFileSync(path.join(root, 'supabase', 'functions', 'send-document-email', 'index.ts'), 'utf8');
const reminderEmail = fs.readFileSync(path.join(root, 'supabase', 'functions', 'send-reminder-email', 'index.ts'), 'utf8');

assert.match(app, /id="operational-health-title"/);
assert.match(app, />System Status</);
assert.doesNotMatch(app, />Operational Health</);
assert.match(app, /How this status works/);
assert.match(app, /Everything looks good/);
assert.match(app, /persisted account evidence; it does not claim that missing evidence proves no failure occurred/i);
assert.match(app, /\.select\('event_type, object_type, object_id, source, provider, provider_event_id, created_at, metadata'\)/);

for (const eventType of [
  'recurring_automation_run_completed',
  'overdue_reminder_run_completed',
  'recurring_invoice_generation_failed',
  'payment_reminder_processing_failed',
  'stripe_refund_failed',
  'charge_dispute_created',
]) {
  assert.match(app, new RegExp(eventType), `${eventType} must feed the operator health view`);
}

for (const eventType of [
  'document_created',
  'credit_note_created',
  'quote_converted_to_invoice',
  'recurring_schedule_created',
  'recurring_schedule_updated',
  'reminder_settings_changed',
]) {
  assert.match(writer, new RegExp(`"${eventType}"`), `${eventType} must be allowlisted`);
  assert.match(app, new RegExp(`'${eventType}'`), `${eventType} must be emitted by the app`);
}
assert.match(app, /from\('invoices'\)\.insert\(row\)\.select\(\)\.single\(\)[\s\S]*?logAppAuditEvent\(mapped\.docType === 'credit' \? 'credit_note_created' : 'document_created'/,
  'document creation audit must follow the successful insert');
assert.match(app, /from\('recurring_templates'\)\.insert\(row\)\.select\(\)\.single\(\)[\s\S]*?logAppAuditEvent\('recurring_schedule_created'/,
  'schedule creation audit must follow the successful insert');

assert.doesNotMatch(writer, /metadata\.user_agent|headers\.get\("user-agent"\)/,
  'The audit writer must not add browser fingerprint data.');

for (const source of [recurring, reminders, resendWebhook, documentEmail, reminderEmail]) {
  assert.doesNotMatch(source, /metadata:\s*\{[^}\n]*(?:\bto\b|\bfrom\b|\bsubject\b)/,
    'Audit metadata must not retain recipient, sender, or subject fields.');
}
assert.doesNotMatch(resendWebhook, /const metadata = \{[\s\S]*?\n\s*to,\s*\n/,
  'Resend webhook audit metadata must not retain recipient addresses.');

assert.match(recurring, /event_type: "recurring_automation_run_completed"/);
assert.match(recurring, /const ok = generationFailed === 0 && historyUpdateFailed === 0 && emailFailed === 0 && monitoringFailed === 0/);
assert.match(reminders, /event_type: "overdue_reminder_run_completed"/);
assert.match(reminders, /const ok = failed === 0 && monitoringFailed === 0/);

console.log('Operational health harness passed.');
