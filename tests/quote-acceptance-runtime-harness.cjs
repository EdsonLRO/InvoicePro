const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const migrationFiles = fs.readdirSync(path.join(root, 'supabase', 'migrations'))
  .filter(name => name.endsWith('_quote_acceptance_runtime.sql'));
assert.equal(migrationFiles.length, 1, 'exactly one quote acceptance migration is tracked');

const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', migrationFiles[0]), 'utf8');
const manage = fs.readFileSync(path.join(root, 'supabase', 'functions', 'manage-quote-access', 'index.ts'), 'utf8');
const publicFn = fs.readFileSync(path.join(root, 'supabase', 'functions', 'quote-public', 'index.ts'), 'utf8');
const shared = fs.readFileSync(path.join(root, 'supabase', 'functions', '_shared', 'quote-access.mjs'), 'utf8');
const config = fs.readFileSync(path.join(root, 'supabase', 'config.toml'), 'utf8');

for (const field of [
  'quote_access_token_hash', 'quote_access_created_at', 'quote_access_expires_at',
  'quote_access_revoked_at', 'quote_first_viewed_at', 'quote_access_version',
  'quote_link_version', 'quote_response', 'quote_response_name', 'quote_responded_at',
  'source_quote_id'
]) assert.ok(migration.includes(field), `${field} must be in the migration`);

assert.match(migration, /quote_access_token_hash ~ '\^\[0-9a-f\]\{64\}\$'/);
assert.match(migration, /create unique index invoices_source_quote_uidx/);
assert.match(migration, /foreign key \(source_quote_id, user_id\)[\s\S]*?references public\.invoices\(id, user_id\)[\s\S]*?on delete restrict/);
assert.match(migration, /before insert or update or delete on public\.invoices/);
assert.match(migration, /current_user = 'authenticated'/);
assert.match(migration, /Responded quotes are read-only/);
assert.match(migration, /Invoices created from accepted quotes cannot be deleted/);
assert.match(migration, /Quote acceptance fields are server-managed/);
assert.match(migration, /new\.quote_access_version := old\.quote_access_version \+ 1/);
assert.match(migration, /new\.quote_access_token_hash := null/);

assert.match(migration, /create or replace function public\.quote_public_action/);
assert.match(migration, /returns jsonb\s+language plpgsql\s+security invoker\s+set search_path = ''/);
assert.match(migration, /where quote_access_token_hash = p_token_hash[\s\S]*?for update/);
assert.match(migration, /pg_advisory_xact_lock/);
assert.match(migration, /overdue_reminders_enabled, source_quote_id/);
assert.match(migration, /v_quote\.grand_total, false, v_quote\.id/);
assert.match(migration, /'Draft',[\s\S]*?v_now::date, null/);
assert.match(migration, /v_quote\.items, '\[\]'::jsonb, 'full', 0/);
assert.match(migration, /set status = 'Accepted'/);
assert.match(migration, /set status = 'Declined'/);
assert.match(migration, /'quote_accepted'/);
assert.match(migration, /'invoice_created_from_quote'/);
assert.match(migration, /revoke all on function public\.quote_public_action\(text, text, text\)[\s\S]*?from public, anon, authenticated/);
assert.match(migration, /grant execute on function public\.quote_public_action\(text, text, text\)[\s\S]*?to service_role/);
assert.doesNotMatch(migration, /grant\s+(?:select|insert|update|delete).*\b(?:anon|public)\b/i);

assert.match(shared, /crypto\.getRandomValues\(new Uint8Array\(32\)\)/);
assert.match(shared, /crypto\.subtle\.digest\([\s\S]*?"SHA-256"/);
assert.match(shared, /https:\/\/app\.tallyo\.co\.uk/);
assert.doesNotMatch(shared, /cf-connecting-ip|x-forwarded-for|fingerprint/i);

assert.match(manage, /auth\.getUser\([\s\S]*?jwt/);
assert.match(manage, /\.eq\("user_id", userData\.user\.id\)/);
assert.match(manage, /accountAllowsWrite/);
assert.match(manage, /action === "create"[\s\S]*?!\(await accountAllowsWrite/);
assert.match(manage, /quote_access_token_hash: tokenHash/);
assert.match(manage, /quote_link_version: ownedQuote\.quote_access_version/);
assert.match(manage, /https:\/\/app\.tallyo\.co\.uk\/quote\/#\$\{token\}/);
assert.doesNotMatch(manage, /console\.(?:log|warn|error).*token/i);

assert.match(publicFn, /\["view", "accept", "decline", "invoice"\]/);
assert.match(publicFn, /createMemoryRateLimiter/);
assert.match(publicFn, /allowGlobal\("all"\)/);
assert.match(publicFn, /normalizeConfirmedName/);
assert.match(publicFn, /admin\.rpc\("quote_public_action"/);
assert.doesNotMatch(publicFn, /Authorization:\s*`Bearer \$\{token/i);
assert.doesNotMatch(publicFn, /fetch\([\s\S]*?(?:stripe|resend|google-analytics|googletagmanager)/i);

assert.match(config, /\[functions\.manage-quote-access\][\s\S]*?verify_jwt = true/);
assert.match(config, /\[functions\.quote-public\][\s\S]*?verify_jwt = false/);

console.log('Quote acceptance runtime contract harness passed.');
