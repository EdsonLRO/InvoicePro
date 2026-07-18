const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, '.github', 'workflows', 'security-checks.yml');
const workflow = fs.readFileSync(workflowPath, 'utf8');

const expectedActions = [
  'actions/checkout@08eba0b27e820071cde6df949e0beb9ba4906955',
  'denoland/setup-deno@667a34cdef165d8d2b2e98dde39547c9daac7282',
];

for (const action of expectedActions) {
  assert.ok(workflow.includes(`uses: ${action}`), `${action} must remain pinned`);
}

assert.match(workflow, /permissions:\r?\n  contents: read\r?\n/);
assert.doesNotMatch(workflow, /permissions:[\s\S]*?\b(?:write|write-all)\b/i);
assert.doesNotMatch(workflow, /\bsecrets\s*\./i);
assert.match(workflow, /deno-version: v2\.2\.15/);
assert.match(workflow, /deno check --frozen --lock=deno\.lock index\.ts/);
assert.match(workflow, /persist-credentials: false/);

for (const harness of [
  'auth-captcha-harness.cjs',
  'dispute-lifecycle-visibility-harness.cjs',
  'email-status-accuracy-harness.cjs',
  'edge-dependency-pin-harness.cjs',
  'financial-action-audit-harness.cjs',
  'mfa-recovery-harness.cjs',
  'refund-consequence-preview-harness.cjs',
  'security-workflow-harness.cjs',
  'session-expiry-harness.cjs',
  'stripe-payment-integrity-harness.cjs',
]) {
  assert.ok(workflow.includes(`node tests/${harness}`), `${harness} must run in CI`);
}

console.log('Security workflow harness passed.');
