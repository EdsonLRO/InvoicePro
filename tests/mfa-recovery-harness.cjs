const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const edge = fs.readFileSync(path.join(root, 'supabase', 'functions', 'mfa-recovery', 'index.ts'), 'utf8');
const config = fs.readFileSync(path.join(root, 'supabase', 'config.toml'), 'utf8');
const migrationName = fs.readdirSync(path.join(root, 'supabase', 'migrations'))
  .find((name) => name.endsWith('_mfa_recovery_codes.sql'));

assert(migrationName, 'MFA recovery migration is missing.');
const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', migrationName), 'utf8');
const privateHelperMigrationName = fs.readdirSync(path.join(root, 'supabase', 'migrations'))
  .find((name) => name.endsWith('_move_mfa_helper_to_private_schema.sql'));
assert(privateHelperMigrationName, 'Private MFA RLS helper migration is missing.');
const privateHelperMigration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', privateHelperMigrationName),
  'utf8',
);

const inlineScript = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .find((match) => !/\ssrc\s*=/.test(match[0]));
assert(inlineScript, 'The application inline script was not found.');
new Function(inlineScript[1]);

for (const table of [
  'company_settings',
  'customers',
  'saved_items',
  'invoices',
  'recurring_templates',
  'audit_events',
]) {
  assert.match(migration, new RegExp(`'${table}'`), `${table} must receive the recovery lock.`);
}

assert.match(migration, /create table if not exists public\.mfa_recovery_state/i);
assert.match(migration, /create table if not exists public\.mfa_recovery_codes/i);
assert.match(migration, /alter table public\.mfa_recovery_(?:state|codes) enable row level security/gi);
assert.match(migration, /revoke all on table public\.mfa_recovery_codes from public, anon, authenticated/i);
assert.match(migration, /grant select on table public\.mfa_recovery_state to authenticated/i);
assert.match(migration, /security definer\s+set search_path = ''/gi);
assert.match(migration, /revoke all on function public\.claim_mfa_recovery_code\(uuid, text\) from public, anon, authenticated/i);
assert.match(migration, /grant execute on function public\.claim_mfa_recovery_code\(uuid, text\) to service_role/i);
assert.match(migration, /as restrictive[\s\S]*MFA recovery must be completed/i);
assert.match(migration, /auth\.jwt\(\)->>'aal'/i);
assert.match(migration, /from auth\.mfa_factors/i);
assert.match(migration, /failed_attempts between 0 and 5/i);
assert.match(migration, /interval '15 minutes'/i);
assert.match(migration, /delete from public\.mfa_recovery_codes[\s\S]*where user_id = p_user_id/i);
assert.doesNotMatch(migration, /raw_code|plain(?:text)?_code/i);

for (const table of [
  'company_settings',
  'customers',
  'saved_items',
  'invoices',
  'recurring_templates',
  'audit_events',
]) {
  assert.match(privateHelperMigration, new RegExp(`'${table}'`), `${table} must use the private MFA helper.`);
}
assert.match(privateHelperMigration, /create schema if not exists private/i);
assert.match(privateHelperMigration, /security definer\s+set search_path = ''/i);
assert.match(privateHelperMigration, /revoke all on function private\.current_user_has_verified_mfa\(\)[\s\S]*from public, anon, authenticated/i);
assert.match(privateHelperMigration, /grant execute on function private\.current_user_has_verified_mfa\(\)[\s\S]*to authenticated, service_role/i);
assert.match(privateHelperMigration, /not \(select private\.current_user_has_verified_mfa\(\)\)/i);
assert.match(privateHelperMigration, /\(\(select auth\.jwt\(\)\)->>'aal'\) = 'aal2'/i);
assert.match(privateHelperMigration, /drop function public\.current_user_has_verified_mfa\(\)/i);

assert.match(edge, /crypto\.getRandomValues\(new Uint8Array\(CODE_LENGTH\)\)/);
assert.match(edge, /CODE_LENGTH = 20/);
assert.match(edge, /crypto\.subtle\.sign\("HMAC"/);
assert.match(edge, /MFA_RECOVERY_PEPPER/);
assert.match(edge, /pepper\.length < 32/);
assert.match(edge, /getAuthenticatorAssuranceLevel\(jwt\)/);
assert.match(edge, /action === "generate"[\s\S]*aal\.currentLevel !== "aal2"/);
assert.match(edge, /action === "recover"[\s\S]*aal\.currentLevel !== "aal1"/);
assert.match(edge, /admin\.auth\.admin\.mfa\.deleteFactor\(\{ userId, id: factor\.id \}\)/);
assert.match(edge, /replace_mfa_recovery_codes/);
assert.match(edge, /claim_mfa_recovery_code/);
assert.match(edge, /complete_mfa_recovery/);
assert.match(edge, /account_mfa_recovery_started/);
assert.match(edge, /account_mfa_recovery_completed/);
assert.doesNotMatch(edge, /Access-Control-Allow-Origin": "\*"/);
assert.doesNotMatch(edge, /console\.(?:log|error|warn)\([^\n]*(?:body\.code|normalized|codeHash|hashes|codes)/i);

const emailFunction = edge.match(/function securityEmail[\s\S]*?\r?\n}\r?\n\r?\nasync function sendSecurityNotice/);
assert(emailFunction, 'Security-notification template was not found.');
assert.doesNotMatch(emailFunction[0], /\$\{[^}]*code/i, 'Security email must not interpolate recovery codes.');

assert.match(config, /\[functions\.mfa-recovery\][\s\S]*?verify_jwt = true/);
assert.match(html, /authMode === 'mfa-recovery-code'/);
assert.match(html, /authMode === 'mfa-recovery-enroll'/);
assert.match(html, /Use a recovery code/);
assert.match(html, /this\.mfaRecovery\.codes = \[\]/);
assert.doesNotMatch(html, /localStorage[^\n]*(?:recovery|mfaRecovery|codes)/i);

const route = html.match(/async routeAfterAuth\(user\) \{[\s\S]*?\n            async verifyMfaLogin/);
assert(route, 'Auth routing method was not found.');
assert(route[0].indexOf('fetchMfaRecoveryState') < route[0].indexOf('onSignedIn(user)'),
  'Recovery state must be checked before signed-in data is initialized.');

console.log('MFA recovery security harness passed.');
