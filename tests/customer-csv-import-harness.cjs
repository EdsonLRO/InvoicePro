const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const csv = require(path.join(root, 'customer-csv-import.js'));
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const messages = fs.readFileSync(path.join(root, 'app-user-messages.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const build = fs.readFileSync(path.join(root, 'scripts', 'build-app-pages.mjs'), 'utf8');

const parsed = csv.parseCustomers(
  '\uFEFFName,Email,Phone,Mobile,Address,Tax ID,Additional Info,Ignored\r\n' +
  '"Willow, Pine",hello@willow.example,020 0000 0000,,"1 Example Road",GB-01,"Line one\r\nLine two",unused\r\n' +
  'Northstar Ltd,,,,,,,unused\r\n'
);
assert.equal(parsed.totalRows, 2);
assert.equal(parsed.rows.length, 2);
assert.equal(parsed.issues.length, 0);
assert.deepEqual(parsed.rows[0], {
  name: 'Willow, Pine',
  email: 'hello@willow.example',
  phone: '020 0000 0000',
  mobile: '',
  address: '1 Example Road',
  taxId: 'GB-01',
  additionalInfo: 'Line one\nLine two'
});

const aliases = csv.parseCustomers('Name / Company,Email Address,Tax / VAT ID,Notes\nSafe Studio,safe@example.test,GB-02,"Uses ""quoted"" text"');
assert.equal(aliases.rows[0].name, 'Safe Studio');
assert.equal(aliases.rows[0].taxId, 'GB-02');
assert.equal(aliases.rows[0].additionalInfo, 'Uses "quoted" text');

const validation = csv.parseCustomers(
  'Name,Email\nExisting,KNOWN@example.test\nDuplicate One,new@example.test\nDuplicate Two,NEW@example.test\nInvalid,no-at-symbol\n,blank@example.test\nNo email,\n',
  { existingCustomers: [{ email: 'known@example.test' }] }
);
assert.deepEqual(validation.rows.map(row => row.name), ['Duplicate One', 'No email']);
assert.deepEqual(validation.issues.map(issue => issue.message), [
  'A customer with this email already exists.',
  'This email appears more than once in the file.',
  'Enter a valid email address or leave it blank.',
  'Name is required.'
]);

const extraCells = csv.parseCustomers('Name,Email\nGood,good@example.test\nToo many,ok@example.test,unexpected');
assert.equal(extraCells.rows.length, 1);
assert.equal(extraCells.issues[0].row, 3);
assert.match(extraCells.issues[0].message, /more values/i);

const blankRows = csv.parseCustomers('Name,Email\n\nInvalid,bad-email');
assert.equal(blankRows.issues[0].row, 3, 'reported row number remains aligned after blank rows');

const formulaText = csv.parseCustomers('Name,Additional Info\nFormula,"=HYPERLINK(""https://example.invalid"")"');
assert.equal(formulaText.rows[0].additionalInfo, '=HYPERLINK("https://example.invalid")');

assert.throws(() => csv.parseCustomers('Email\nonly@example.test'), /Name column/);
assert.throws(() => csv.parseCustomers('Name,Company\nOne,Two'), /only once/);
assert.throws(() => csv.parseCustomers('Name,Email\n"Unclosed,test@example.test'), /not closed/);
assert.throws(() => csv.parseCustomers('Name\n' + Array.from({ length: 501 }, (_, index) => `Customer ${index}`).join('\n')), /up to 500/);
assert.throws(() => csv.parseCustomers('Name\n' + 'x'.repeat(csv.MAX_BYTES)), /smaller than 1 MB/);
assert.equal(csv.templateCsv(), 'Name,Email,Phone,Mobile,Address,Tax ID,Additional Info\r\n');
assert.doesNotMatch(fs.readFileSync(path.join(root, 'customer-csv-import.js'), 'utf8'), /fetch\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB/i);

assert.match(app, /<script src="\.\/customer-csv-import\.js"><\/script>/);
assert.match(app, /role="dialog" aria-modal="true" aria-labelledby="customer-import-title"/);
assert.match(app, /accept="\.csv,text\/csv"/);
assert.match(app, /Only import customer details you are allowed to store in Tallyo/);
assert.match(app, /parseCustomers\(text, \{ existingCustomers: this\.customers \}\)/);
assert.match(app, /from\('customers'\)\.insert\(rows\)\.select\(\)/);
assert.match(app, /rows\.map\(customer => this\.customerToRow\(customer\)\)/);
assert.doesNotMatch(app.match(/async importCustomersFromCsv\(\)[\s\S]*?\n\s*},\n\s*backToCustomers/)[0], /\.upsert\(|\.update\(|\.delete\(/);
assert.match(app, /showUserMessage\('Could not import customers:/);
assert.match(messages, /Customers weren\\'t imported|Customers weren't imported/);
assert.match(worker, /'\.\/customer-csv-import\.js'/);
assert.match(build, /"customer-csv-import\.js"/);

console.log('Customer CSV import harness passed.');
