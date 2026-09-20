const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

function mockAdmin(returnedRow) {
  const calls = { table: '', update: null, filters: [] };
  const builder = {
    update(value) { calls.update = value; return this; },
    eq(column, value) { calls.filters.push(['eq', column, value]); return this; },
    in(column, value) { calls.filters.push(['in', column, value]); return this; },
    is(column, value) { calls.filters.push(['is', column, value]); return this; },
    select() { return this; },
    async maybeSingle() { return { data: { ...returnedRow, ...calls.update }, error: null }; },
  };
  return {
    calls,
    client: {
      from(table) { calls.table = table; return builder; },
    },
  };
}

async function main() {
  const moduleUrl = pathToFileURL(path.join(
    root,
    'supabase',
    'functions',
    '_shared',
    'quote-email-access.mjs'
  )).href;
  const { prepareQuoteEmailAccess } = await import(moduleUrl);

  const untouched = mockAdmin({});
  assert.equal(await prepareQuoteEmailAccess({
    quote: { doc_type: 'invoice' },
    userId: 'owner',
    admin: untouched.client,
  }), null);
  assert.equal(untouched.calls.table, '', 'ordinary invoice email must not create quote access');

  const quote = {
    id: '11111111-1111-4111-8111-111111111111',
    user_id: 'owner',
    doc_type: 'quote',
    status: 'Draft',
    due_date: '2026-09-25',
    quote_access_version: 4,
    quote_response: null,
    updated_at: '2026-09-20T08:00:00.000Z',
  };
  const database = mockAdmin(quote);
  const prepared = await prepareQuoteEmailAccess({
    quote,
    userId: 'owner',
    admin: database.client,
    now: new Date('2026-09-20T09:30:00.000Z'),
  });

  assert.equal(database.calls.table, 'invoices');
  assert.equal(database.calls.update.status, 'Sent', 'emailing a draft quote must issue it');
  assert.match(database.calls.update.quote_access_token_hash, /^[0-9a-f]{64}$/);
  assert.equal(database.calls.update.quote_link_version, 4);
  assert.equal(database.calls.update.quote_access_expires_at, '2026-09-25T23:59:59.999Z');
  assert.equal(database.calls.update.quote_access_revoked_at, null);
  assert.equal(database.calls.update.quote_first_viewed_at, null);
  assert.match(prepared.link, /^https:\/\/app\.tallyo\.co\.uk\/quote\/#[-_A-Za-z0-9]{43}$/);
  assert.equal(prepared.link.includes(prepared.tokenHash), false, 'stored hash must not be exposed in the customer URL');
  assert.deepEqual(database.calls.filters, [
    ['eq', 'id', quote.id],
    ['eq', 'user_id', 'owner'],
    ['eq', 'doc_type', 'quote'],
    ['in', 'status', ['Draft', 'Sent']],
    ['eq', 'quote_access_version', 4],
    ['is', 'quote_response', null],
    ['eq', 'updated_at', quote.updated_at],
  ]);

  await assert.rejects(
    prepareQuoteEmailAccess({
      quote: { ...quote, quote_response: 'accepted' },
      userId: 'owner',
      admin: mockAdmin(quote).client,
    }),
    /already has a customer response/
  );

  const email = read('supabase', 'functions', 'send-document-email', 'index.ts');
  const app = read('index.html');
  assert.match(email, /prepareQuoteEmailAccess/);
  assert.match(email, /View and respond to this quote:/);
  assert.match(email, />View and respond to quote<\/a>/);
  assert.match(email, /quoteAccess\?\.tokenHash \|\| "no_quote_response_link"/);
  assert.match(email, /event_type: "quote_link_created"/);
  assert.match(email, /metadata: \{ channel: "document_email" \}/);
  assert.match(email, /quoteAccess: \{ link: quoteAccess\.link, expiresAt: quoteAccess\.expiresAt \}/);
  assert.match(email, /updateQuery = updateQuery\.is\("quote_response", null\)/);
  assert.match(email, /\.not\("quote_response", "is", null\)/);
  assert.doesNotMatch(email, /quoteAccess: \{[^}]*tokenHash/, 'response must not expose the stored token hash');

  assert.match(app, /Customer response included/);
  assert.match(app, /You do not need to create a link first/);
  assert.match(app, /Sending this quote again replaces any previous response link/);
  assert.match(app, /data\.quoteAccess && this\.draft && this\.draft\.id === target\.id/);
  assert.match(app, /The email will include a secure quote response button/);

  console.log('Quote email acceptance harness passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
