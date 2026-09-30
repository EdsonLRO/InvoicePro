const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const spec = read('docs/design/tallyo-redesign/QUOTE_ACCEPTANCE_RULES.md');
const server = read('dev/quote-acceptance/preview.mjs');
const html = read('dev/quote-acceptance/index.html');
const script = read('dev/quote-acceptance/prototype.js');

for (const phrase of [
  'exactly one separate linked draft invoice', 'server time', 'Raw tokens are never stored',
  '`anon` receives no table grant or policy', 'two concurrent calls', 'No new vendor, secret',
  'does not claim identity verification', 'no IP address', 'Approved with conditions',
]) assert.match(spec, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

assert.match(server, /server\.listen\(port, '127\.0\.0\.1'/);
assert.match(server, /connect-src 'none'/);
assert.match(server, /X-Robots-Tag': 'noindex, nofollow'/);
assert.match(server, /Referrer-Policy': 'no-referrer'/);
assert.doesNotMatch(script, /fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|supabase|stripe|resend/i);
assert.doesNotMatch(html + script, /google-analytics|googletagmanager|gtag\s*\(/i);
assert.match(script, /No payment has been taken and no invoice has been emailed/);
assert.match(script, /Customer-confirmed name/);
assert.match(script, /production PDF action is not connected/);
assert.doesNotMatch(html + script, /@[a-z0-9.-]+\.[a-z]{2,}/i, 'preview must contain no email address');
console.log('Quote acceptance specification/preview contracts passed: minimal architecture, atomic/idempotent rules, privacy wording, local-only preview and no provider or analytics calls.');
