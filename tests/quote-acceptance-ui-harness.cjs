const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('index.html');
const config = read('config.js');
const build = read('scripts/build-app-pages.mjs');
const publicHtml = read('quote/index.html');
const publicJs = read('quote/quote.js');
const publicCss = read('quote/quote.css');
const headers = read('deployment/cloudflare/app/_headers');
const redirects = read('deployment/cloudflare/app/_redirects').replace(/\r\n/g, '\n');
const worker = read('service-worker.js');

assert.match(config, /window\.TALLYO_QUOTE_ACCEPTANCE_ENABLED = false/);
assert.match(build, /TALLYO_QUOTE_ACCEPTANCE_PUBLIC_RELEASE_APPROVED/);
assert.match(build, /Quote acceptance controls require explicit public-release approval/);
assert.match(build, /quote\/index\.html/);

assert.match(publicHtml, /meta name="robots" content="noindex,nofollow,noarchive"/);
assert.match(publicHtml, /meta name="referrer" content="no-referrer"/);
assert.match(publicHtml, /tallyo-wordmark-white\.png/);
assert.doesNotMatch(publicHtml, /googletagmanager|google-analytics|cdn\.jsdelivr|<form/i);
assert.doesNotMatch(publicHtml, /Willow|Sarah|customer@|gmail\.com/i, 'public shell must not contain demonstration or customer data');

assert.match(publicJs, /window\.location\.hash/);
assert.match(publicJs, /TALLYO_QUOTE_ACCEPTANCE_ENABLED === true/);
assert.match(publicJs, /\/functions\/v1\/quote-public/);
assert.match(publicJs, /headers: \{ 'Content-Type': 'application\/json', apikey: publishableKey \}/);
assert.doesNotMatch(publicJs, /Authorization|console\.|innerHTML|localStorage|sessionStorage|document\.cookie/);
for (const action of ['view', 'accept', 'decline', 'invoice']) assert.ok(publicJs.includes(`'${action}'`), `missing public quote action ${action}`);
for (const state of ['active', 'accepted', 'declined', 'expired', 'revoked', 'changed', 'unavailable']) assert.ok(publicJs.includes(state), `missing public quote state ${state}`);
assert.match(publicJs, /window\.print\(\)/, 'PDF action must preserve a no-mutation browser print/save route');
assert.match(publicCss, /@media\(max-width:620px\)/);

assert.match(index, /quoteAcceptance: \{/);
assert.match(index, /supabaseClient\.functions\.invoke\('manage-quote-access'/);
assert.match(index, /Create secure link/);
assert.match(index, /Create replacement link/);
assert.match(index, /Revoke link/);
assert.match(index, /draft\.docType === 'quote' && !quoteAcceptance\.enabled/);
assert.match(index, /quoteAcceptanceLocked/);
assert.match(index, /quoteResponseName: r\.quote_response_name \|\| ''/);
assert.match(index, /this\.quoteAcceptance\.firstViewedAt = data\.link\?\.firstViewedAt \|\| null/);
assert.match(index, /const \{ quote_access_token_hash, \.\.\.safeInvoice \} = row/);
assert.doesNotMatch(index, /quote_access_token_hash\s*:/, 'browser code must never write or expose the stored token hash');

assert.equal(redirects.split('\n')[0], '/quote /quote/index.html 200');
assert.equal(redirects.split('\n')[1], '/quote/* /quote/index.html 200');
assert.match(headers, /\/quote\r?\n\s+Cache-Control: no-store\r?\n\s+Referrer-Policy: no-referrer/);
assert.match(headers, /\/quote\/\*[\s\S]*?Cache-Control: no-store[\s\S]*?Referrer-Policy: no-referrer/);
assert.match(worker, /requestUrl\.pathname === '\/quote'[\s\S]*?requestUrl\.pathname\.startsWith\('\/quote\/'\)[\s\S]*?event\.respondWith\(fetch\(req\)\)/);

console.log('Quote acceptance UI harness passed.');
