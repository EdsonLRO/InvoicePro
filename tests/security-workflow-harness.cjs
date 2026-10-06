const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, '.github', 'workflows', 'security-checks.yml');
const workflow = fs.readFileSync(workflowPath, 'utf8');

const expectedActions = [
  'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1',
  'denoland/setup-deno@22d081ff2d3a40755e97629de92e3bcbfa7cf2ed',
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
  'core-lifecycle-harness.cjs',
  'dispute-lifecycle-visibility-harness.cjs',
  'email-status-accuracy-harness.cjs',
  'edge-dependency-pin-harness.cjs',
  'financial-action-audit-harness.cjs',
  'mfa-recovery-harness.cjs',
  'operational-health-harness.cjs',
  'owner-console-harness.cjs',
  'quote-acceptance-runtime-harness.cjs',
  'quote-acceptance-ui-harness.cjs',
  'quote-auto-send-harness.cjs',
  'refund-consequence-preview-harness.cjs',
  'recurring-calendar-reliability-harness.cjs',
  'scale-accessibility-safety-harness.cjs',
  'security-workflow-harness.cjs',
  'session-expiry-harness.cjs',
  'stripe-payment-integrity-harness.cjs',
  'stripe-connect-foundation-harness.cjs',
  'tenant-isolation-attribution-harness.cjs',
]) {
  assert.ok(workflow.includes(`node tests/${harness}`), `${harness} must run in CI`);
}

assert.match(workflow, /pull_request:\s+branches:\s+- main\s+- codex\/tallyo-redesign/, 'redesign integration PRs keep equivalent checks');
assert.match(workflow, /push:\s+branches:\s+- main\s+- codex\/tallyo-redesign\s+- codex\/tallyo-redesign-\*/, 'redesign pushes run checks without removing main');
assert.ok(workflow.includes('node tests/redesign-preview-harness.mjs'));
assert.ok(workflow.includes('node tests/redesign-overview-harness.cjs'));
assert.ok(workflow.includes('node tests/income-insights-finances-ui-harness.cjs'));
assert.ok(workflow.includes('node tests/income-insights-records-ui-harness.cjs'));
assert.ok(workflow.includes('node tests/redesign-documents-harness.cjs'));
assert.ok(workflow.includes('deno test tests/invoice-status-rules-runtime-test.ts'));
assert.ok(workflow.includes('node tests/quote-access-runtime-test.mjs'));
assert.ok(workflow.includes('deno run --allow-env tests/quote-auto-send-runtime-test.ts'));
console.log('Security workflow harness passed.');
