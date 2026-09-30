const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const app = read('index.html');
const schema = read('schema.sql');
const migration = read('supabase/migrations/20260924112357_invoice_template_preferences.sql');
const emailFunction = read('supabase/functions/send-document-email/index.ts');
const fixture = read('dev/redesign/fixture.js');

for (const source of [schema, migration]) {
  assert.match(source, /invoice_template\s+text\s+not null\s+default 'tallyo'/i);
  assert.match(source, /alternate_item_rows\s+boolean\s+not null\s+default true/i);
  for (const template of ['tallyo', 'basic', 'modern', 'professional']) {
    assert.ok(source.includes(`'${template}'`), `${template} must be allowlisted in database DDL`);
  }
}
assert.doesNotMatch(migration, /\b(create policy|alter policy|grant|revoke|drop table|delete from|truncate)\b/i, 'preference migration must not alter access control or destroy data');

for (const template of ['tallyo', 'basic', 'modern', 'professional']) {
  assert.match(app, new RegExp(`id: '${template}'`), `${template} must be offered in Branding`);
  if (template !== 'tallyo') assert.match(app, new RegExp(`invoice-template-${template}`), `${template} must have a document style`);
  assert.ok(emailFunction.includes(`"${template}"`), `${template} must be available to emailed PDFs`);
}
assert.match(app, /\.document-template-surface \.pdf-document-header/, 'Tallyo remains the default document style');
assert.match(app, /Alternating item row colours/);
assert.match(app, /v-model="company\.alternateItemRows"/);
assert.match(app, /'pdf-row-tinted': company\.alternateItemRows/);
assert.match(app, /invoice_template: this\.normaliseInvoiceTemplate\(c\.invoiceTemplate\)/);
assert.match(app, /alternate_item_rows: c\.alternateItemRows !== false/);
assert.match(app, /invoiceTemplate: this\.normaliseInvoiceTemplate\(r\.invoice_template\)/);
assert.match(app, /alternateItemRows: r\.alternate_item_rows !== false/);
assert.match(app, /branding_changed: changed\(\['logo', 'brandColor', 'logoPosition', 'invoiceTemplate', 'alternateItemRows'\]\)/);
assert.match(app, /class="document-template-surface/);

assert.match(emailFunction, /function documentTemplate\(company: any\)/);
assert.match(emailFunction, /function usesAlternatingItemRows\(company: any\)/);
assert.match(emailFunction, /alternateRows && itemIndex % 2 === 1/);
assert.match(emailFunction, /template === "professional"/);
assert.doesNotMatch(emailFunction, /\bbold\b/);
assert.match(fixture, /invoice_template: 'tallyo', alternate_item_rows: true/);
assert.match(fixture, /upsert\(value\)/);

console.log('Invoice template preference harness passed.');
