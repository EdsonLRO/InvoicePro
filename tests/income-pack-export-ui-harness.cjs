const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const build = fs.readFileSync(path.join(root, 'scripts', 'build-app-pages.mjs'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const preview = fs.readFileSync(path.join(root, 'dev', 'redesign', 'preview.mjs'), 'utf8');

assert.match(app, /<script src="\.\/income-pack-export\.js"><\/script>/);
assert.match(app, /openFinancesView\('exports'\)[\s\S]*?>Prepare records</);
assert.match(app, /key === 'finances-exports' \? 'exports'/);
assert.match(app, /Income records from Tallyo only\.[\s\S]*?not an HMRC submission/);
assert.match(app, /Continue only on a trusted device/);
for (const filename of ['income-records.csv', 'invoice-index.csv', 'customer-income-summary.csv', 'income-by-period.csv', 'refunds-and-credit-notes.csv', 'readiness-report.csv', 'income-pack-manifest.json', 'income-summary.pdf']) {
  assert.ok(app.includes(filename) || fs.readFileSync(path.join(root, 'income-pack-export.js'), 'utf8').includes(filename), `${filename} must remain available`);
}
const methods = app.slice(app.indexOf('            buildIncomePack()'), app.indexOf('            overviewTime(ts)'));
assert.ok(methods.length > 0);
assert.doesNotMatch(methods, /supabaseClient|fetch\(|\.from\(|functions\.invoke/);
assert.match(methods, /window\.TallyoIncomePack\.buildIncomePack\(this\.financesCalculation/);
assert.match(methods, /downloadPdfFile\(pdf, model\.filename\)/);
assert.match(build, /"income-pack-export\.js"/);
assert.match(worker, /'\.\/income-pack-export\.js'/);
assert.match(preview, /'income-pack-export\.js'/);
assert.doesNotMatch(app, /Submit income pack|File income pack|MTD compliant/i);
console.log('Income Pack UI contracts passed: gated browser-only exports, trusted-device warning, exact files, PDF route and no provider calls.');
