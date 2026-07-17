const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const functionsRoot = path.join(root, 'supabase', 'functions');
const expectedVersion = '2.110.1';
const expectedImport = `https://esm.sh/@supabase/supabase-js@${expectedVersion}`;
const expectedLockVersion = '4';

const functionDirectories = fs.readdirSync(functionsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

assert.equal(functionDirectories.length, 10, 'expected all ten Edge Functions');

for (const functionName of functionDirectories) {
  const indexPath = path.join(functionsRoot, functionName, 'index.ts');
  const denoPath = path.join(functionsRoot, functionName, 'deno.json');
  const lockPath = path.join(functionsRoot, functionName, 'deno.lock');
  const source = fs.readFileSync(indexPath, 'utf8');
  const denoConfig = fs.readFileSync(denoPath, 'utf8');
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const combined = `${source}\n${denoConfig}`;

  assert.ok(
    source.includes(expectedImport),
    `${functionName} must pin supabase-js to ${expectedVersion}`
  );
  assert.doesNotMatch(
    combined,
    /@supabase\/[\w-]+@(?:latest|next|\^|~|\d+(?:\.\d+)?)(?=["'\/\s])/i,
    `${functionName} contains a floating Supabase dependency`
  );
  assert.equal(
    lock.version,
    expectedLockVersion,
    `${functionName} must use the Supabase-compatible Deno lockfile format`
  );
  assert.match(
    lock.remote?.[expectedImport] || '',
    /^[a-f0-9]{64}$/,
    `${functionName} must lock the exact Supabase dependency digest`
  );
}

console.log(
  `Edge dependency pin and lock integrity harness passed for ${functionDirectories.length} functions.`
);
