const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const functionsRoot = path.join(root, 'supabase', 'functions');
const expectedVersion = '2.110.1';
const expectedImport = `https://esm.sh/@supabase/supabase-js@${expectedVersion}`;

const functionDirectories = fs.readdirSync(functionsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

assert.equal(functionDirectories.length, 9, 'expected all nine Edge Functions');

for (const functionName of functionDirectories) {
  const indexPath = path.join(functionsRoot, functionName, 'index.ts');
  const denoPath = path.join(functionsRoot, functionName, 'deno.json');
  const source = fs.readFileSync(indexPath, 'utf8');
  const denoConfig = fs.readFileSync(denoPath, 'utf8');
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
}

console.log(`Edge dependency pin harness passed for ${functionDirectories.length} functions.`);
