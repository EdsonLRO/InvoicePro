const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const migration = read('supabase', 'migrations', '20260920110017_quote_acceptance_followup.sql');
const sender = read('supabase', 'functions', 'send-document-email', 'index.ts');
const quotePublic = read('supabase', 'functions', 'quote-public', 'index.ts');
const app = read('index.html');

for (const field of [
  'quote_auto_send_invoice',
  'quote_auto_send_due_days',
  'quote_auto_send_recipient',
  'quote_auto_send_status',
  'quote_auto_send_attempted_at',
  'quote_auto_send_sent_at',
]) assert.ok(migration.includes(field), `${field} must be tracked by the migration`);

assert.match(migration, /quote_auto_send_status in \('sending', 'sent', 'failed'\)/);
assert.match(migration, /new\.quote_auto_send_status is distinct from old\.quote_auto_send_status/);
assert.match(migration, /new\.quote_auto_send_attempted_at is distinct from old\.quote_auto_send_attempted_at/);
assert.match(migration, /new\.quote_auto_send_sent_at is distinct from old\.quote_auto_send_sent_at/);
assert.match(migration, /quote_auto_send_invoice = true[\s\S]*?doc_type = 'quote'/);

assert.match(app, /Automatically send the invoice when accepted/);
assert.match(app, /autoSendOnAcceptance: false/);
assert.match(app, /body\.autoSendOnAcceptance = autoSendOnAcceptance/);
assert.match(app, /body\.autoSendDueDays = autoSendOnAcceptance \? autoSendDueDays : null/);
assert.match(app, /Review & send invoice/);
assert.match(app, /Automatic email could not be sent\. Review the invoice and send it manually\./);
assert.match(app, /do not include an online card-payment button/i);

assert.match(sender, /export async function sendAcceptedQuoteInvoice/);
assert.match(sender, /"accepted_quote_auto_send"/);
assert.match(sender, /buildEmail\(invoice, company \|\| \{\}, \[\], null\)/);
assert.match(sender, /\.eq\("status", "Draft"\)/);
assert.match(sender, /\.eq\("source_quote_id", invoice\.source_quote_id\)/);
assert.match(sender, /status: "Sent"/);
assert.match(sender, /if \(import\.meta\.main\) Deno\.serve\(handleDocumentEmailRequest\)/);
assert.match(sender, /quote_auto_send_invoice: autoSendOnAcceptance/);
assert.match(sender, /quote_auto_send_due_days: autoSendOnAcceptance \? autoSendDueDays : null/);
assert.match(sender, /quote_auto_send_recipient: autoSendOnAcceptance \? to : null/);

assert.match(quotePublic, /import \{ sendAcceptedQuoteInvoice \}/);
assert.match(quotePublic, /\.is\("quote_auto_send_status", null\)/);
assert.match(quotePublic, /recipient = String\(quote\.quote_auto_send_recipient/);
assert.match(quotePublic, /automaticDelivery: \{ state: "sent" \}/);
assert.match(quotePublic, /automaticDelivery: \{ state: "failed" \}/);
assert.match(quotePublic, /quote_auto_send_status: "failed"/);
assert.doesNotMatch(quotePublic, /body\.(?:to|email|recipient)\b/, 'the public request must not choose the invoice recipient');

console.log('Quote automatic invoice delivery contract harness passed.');
