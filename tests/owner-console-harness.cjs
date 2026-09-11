const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const migration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '20260911170410_owner_console.sql'),
  'utf8',
);
const edge = fs.readFileSync(
  path.join(root, 'supabase', 'functions', 'owner-account-admin', 'index.ts'),
  'utf8',
);
const recovery = fs.readFileSync(
  path.join(root, 'supabase', 'functions', 'mfa-recovery', 'index.ts'),
  'utf8',
);
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const config = fs.readFileSync(path.join(root, 'supabase', 'config.toml'), 'utf8');
const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf8');

const inlineScript = [...app.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .find((match) => !/\ssrc\s*=/.test(match[0]));
assert(inlineScript, 'The application inline script was not found.');
new Function(inlineScript[1]);

assert.match(migration, /create table private\.owner_mfa_recovery_requests/i);
assert.match(migration, /alter table private\.owner_mfa_recovery_requests enable row level security/i);
assert.match(
  migration,
  /revoke all on private\.owner_mfa_recovery_requests[\s\S]*from public, anon, authenticated, service_role/i,
);
assert.doesNotMatch(
  migration,
  /grant (?:select|insert|update|delete|all) on private\.owner_mfa_recovery_requests/i,
  'Owner recovery state must have no direct table grant.',
);
assert.match(migration, /token_hash text not null unique[\s\S]*check \(token_hash ~ '\^\[0-9a-f\]\{64\}\$'\)/i);
assert.doesNotMatch(migration, /\b(?:raw_token|plain(?:text)?_token|confirmation_token)\b/i);
assert.match(migration, /interval '15 minutes'/i);
assert.match(migration, /pg_catalog\.pg_advisory_xact_lock[\s\S]*pg_catalog\.hashtextextended\(p_user_id::text, 0\)/i);
assert.match(migration, /expires_at > requested_at and expires_at <= requested_at \+ interval '1 hour'/i);
assert.match(migration, /resolution is distinct from 'approved' or \(confirmed_at is not null and approved_by is not null\)/i);
assert.match(migration, /email_confirmed_at is not null/i);
assert.match(migration, /from auth\.mfa_factors[\s\S]*status = 'verified'/i);
assert.match(migration, /where lower\(u\.email\) = lower\(btrim\(coalesce\(p_email, ''\)\)\)/i);
assert.match(migration, /delete from public\.mfa_recovery_codes[\s\S]*where user_id = p_user_id/i);
assert.match(migration, /recovery_required = true/i);
assert.match(migration, /resolution = 'approved'[\s\S]*resolved_at > now\(\) - interval '1 hour'/i);

for (const signature of [
  'create_owner_mfa_recovery_request\\(uuid, text, timestamptz\\)',
  'cancel_owner_mfa_recovery_request\\(uuid, uuid\\)',
  'confirm_owner_mfa_recovery_request\\(uuid, text\\)',
  'owner_console_account_by_email\\(text\\)',
  'owner_console_grant_complimentary_access\\(text, timestamptz\\)',
  'owner_console_revoke_complimentary_access\\(text\\)',
  'owner_console_begin_mfa_recovery\\(uuid, uuid\\)',
]) {
  assert.match(
    migration,
    new RegExp(`revoke all on function public\\.${signature}[\\s\\S]*?from public, anon, authenticated, service_role`, 'i'),
  );
  assert.match(
    migration,
    new RegExp(`grant execute on function public\\.${signature}[\\s\\S]*?to service_role`, 'i'),
  );
}

assert.match(edge, /TALLYO_OWNER_USER_ID/);
assert.match(edge, /userData\.user\.id !== ownerId/);
assert.match(edge, /aal\?\.currentLevel !== "aal2"/);
assert.match(edge, /return action === "status"[\s\S]*owner: false[\s\S]*"Not found"/);
assert.match(edge, /admin\.auth\.admin[\s\S]{0,40}\.generateLink\(\{/);
assert.match(edge, /type: "recovery"/);
assert.match(edge, /link\.origin === base\.origin && link\.pathname === "\/auth\/v1\/verify"/);
assert.doesNotMatch(edge, /actionLink[^\n]*return|return[^\n]*actionLink/i, 'Reset links must not be returned to the browser.');
assert.match(edge, /Wait 10 minutes before sending another password-reset email/);
assert.match(edge, /account\.user_id === ownerId[\s\S]*cannot reset its own MFA/i);
assert.match(edge, /\["confirmed", "approved"\]\.includes\(account\.recovery_request_status\)/);
assert.match(edge, /admin\.auth\.admin\.mfa\.deleteFactor/);
assert.match(edge, /owner_mfa_recovery_ready/);
assert.match(edge, /actor_user_id: null/);
assert.doesNotMatch(migration, /insert into public\.audit_events[\s\S]*?values \(\s*p_user_id,\s*p_actor_user_id,/i);
assert.match(edge, /const \{ user_id: _serverOnlyUserId, \.\.\.safeAccount \} = account/);
assert.match(edge, /account: accountForBrowser\(/);
const queriedOwnerTables = [...edge.matchAll(/admin\.from\("([^"]+)"\)/g)].map((match) => match[1]);
assert.deepEqual([...new Set(queriedOwnerTables)], ['audit_events'], 'Owner API must not query business-data tables');
assert.doesNotMatch(edge, /admin\.auth\.admin\.listUsers|impersonat/i);
assert.match(recovery, /action === "request-owner"[\s\S]*create_owner_mfa_recovery_request/);
assert.match(recovery, /action === "confirm-owner"[\s\S]*confirm_owner_mfa_recovery_request/);
assert.match(recovery, /#mfa-recovery-confirm\?token=\$\{token\}/);
assert.doesNotMatch(recovery, /console\.(?:log|warn|error)\([^\n]*(?:tokenHash|confirmationUrl|body\.token)/i);

assert.match(app, /Owner Console/);
assert.match(app, /Use an exact account email to manage access or help with account recovery/);
assert.match(app, /Grant or update access/);
assert.match(app, /Send password-reset email/);
assert.match(app, /Approve confirmed MFA reset/);
assert.match(app, /This console cannot open invoices, customer records or sign in as another user/);
assert.match(app, /loadOwnerConsoleAccess\(\)/);
assert.match(app, /ownerConsole\.available/);
assert.doesNotMatch(app, /ownerConsole[\s\S]{0,200}(?:impersonat|bulk)/i);

assert.match(config, /\[functions\.owner-account-admin\][\s\S]*?verify_jwt = true/);
assert.match(config, /\[functions\.mfa-recovery\][\s\S]*?verify_jwt = true/);
assert.match(envExample, /^TALLYO_OWNER_USER_ID=\s*$/m);
assert.doesNotMatch(envExample, /^TALLYO_OWNER_USER_ID=.+$/m, 'Owner identifier must not be committed');

for (const [name, source] of Object.entries({ migration, edge, recovery, app })) {
  assert.doesNotMatch(source, /(?:service_role|anon)_key\s*[:=]\s*["'][A-Za-z0-9._-]{20,}/i, `${name} contains a credential`);
  assert.doesNotMatch(source, /sk_(?:live|test)_[A-Za-z0-9]{16,}/, `${name} contains a Stripe secret`);
  assert.doesNotMatch(source, /whsec_[A-Za-z0-9]{16,}/, `${name} contains a webhook secret`);
}

console.log('Owner Console security harness passed.');
