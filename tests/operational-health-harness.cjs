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

assert.doesNotMatch(app, /id="operational-health-title"|>System Status<|>Operational Health</,
  'The account page must not render a separate status panel.');
assert.doesNotMatch(app, /operationalHealth\(\)|operationalHealthStatusClass|operationalEventLabel/,
  'Status-panel-only presentation code must be removed with the panel.');
assert.match(app, /\.select\('event_type, object_type, object_id, source, provider, provider_event_id, created_at, metadata'\)/);
assert.match(app, /emailEventsByDocument\(\)/,
  'Removing the status panel must preserve document Activity History evidence.');
assert.match(app, />Activity History</,
  'The customer-facing document Activity History must remain available.');

for (const text of [
  'Download a copy of your Tallyo data',
  'Your file is prepared and downloaded directly on this device.',
  'Sign out on this device, or sign out everywhere your Tallyo account is open.',
  'signing out everywhere requires your password and, if enabled, an authenticator code.',
  'Turn this on if you want Tallyo to email a reminder when this saved invoice becomes overdue.',
  'Use at least 12 characters and choose a password that is unique to Tallyo.',
]) {
  assert.match(app, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    `Expected customer-friendly copy: ${text}`);
}
for (const technicalCopy of [
  'revoke refresh tokens',
  'structured JSON copy',
  'another Tallyo storage location',
  'scheduled server run',
  'All-devices logout asks',
]) {
  assert.doesNotMatch(app, new RegExp(technicalCopy, 'i'),
    `Technical customer-facing copy must be removed: ${technicalCopy}`);
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

console.log('Operational evidence and customer copy harness passed.');
