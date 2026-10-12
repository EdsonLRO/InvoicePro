import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  businessEmailShell,
  emailActionButton,
  emailNotice,
  safeEmailColour,
  tallyoEmailShell,
} from '../supabase/functions/_shared/email-brand.mjs';

const tallyo = tallyoEmailShell({
  title: 'Your Tallyo account is ready',
  eyebrow: 'Account update',
  preheader: 'A clear update about your Tallyo account.',
  bodyHtml: `<p>Everything is ready.</p>${emailActionButton('Open Tallyo', 'https://app.tallyo.co.uk/')}${emailNotice('<strong>No action is needed.</strong>', 'positive')}`,
  footerNote: 'Tallyo account message.',
});
assert.match(tallyo, /https:\/\/tallyo\.co\.uk\/assets\/tallyo-mark\.png/);
assert.match(tallyo, /Your Tallyo account is ready/);
assert.match(tallyo, /tallyo-email-button/);
assert.match(tallyo, /No action is needed/);

const business = businessEmailShell({
  businessName: 'North & Stone <script>',
  brandColour: '#2463eb',
  title: 'Invoice #INV-1001',
  eyebrow: 'Invoice from North & Stone',
  preheader: 'Invoice #INV-1001 is ready.',
  bodyHtml: '<p>Fictional invoice content.</p>',
});
assert.match(business, /North &amp; Stone &lt;script&gt;/);
assert.doesNotMatch(business, /<script>/);
assert.match(business, /background:#2463eb/);
assert.match(business, /Sent securely with Tallyo/);
assert.equal(safeEmailColour('javascript:alert(1)'), '#4f46e5');
assert.equal(safeEmailColour('#AABBCC'), '#AABBCC');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(path.join(root, file), 'utf8');
for (const file of [
  'supabase/functions/send-document-email/index.ts',
  'supabase/functions/generate-recurring/index.ts',
  'supabase/functions/send-reminder-email/index.ts',
  'supabase/functions/send-overdue-reminders/index.ts',
]) {
  assert.match(read(file), /businessEmailShell/, `${file} must use the business-led Tallyo shell`);
}
for (const file of [
  'supabase/functions/mfa-recovery/index.ts',
  'supabase/functions/owner-account-admin/index.ts',
  'supabase/functions/stripe-billing-webhook/index.ts',
]) {
  assert.match(read(file), /tallyoEmailShell/, `${file} must use the Tallyo-owned shell`);
}
assert.match(read('supabase/functions/_shared/marketing-overview.mjs'), /https:\/\/tallyo\.co\.uk\/assets\/tallyo-mark\.png/,
  'the existing one-off overview must retain the official Tallyo mark');

for (const file of ['confirm-signup.html', 'reset-password.html', 'change-email.html', 'magic-link.html']) {
  const template = read(`supabase/auth-email-templates/${file}`);
  assert.match(template, /\{\{ \.ConfirmationURL \}\}/, `${file} must use the Supabase confirmation URL directly`);
  assert.doesNotMatch(template, /(?:bit\.ly|utm_|google-analytics|analytics)/i, `${file} must not rewrite or track Auth links`);
  assert.match(template, /https:\/\/tallyo\.co\.uk\/assets\/tallyo-mark\.png/);
}
assert.match(read('supabase/auth-email-templates/reauthentication-code.html'), /\{\{ \.Token \}\}/);

console.log('Shared Tallyo email brand harness passed.');
