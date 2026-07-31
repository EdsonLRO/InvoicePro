const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const messages = require(path.join(root, 'app-user-messages.js'));

const restrictedCustomer = messages.normalise(
  'Could not save customer: new row violates row-level security policy for table "customers"',
  { accessState: null }
);
assert.deepEqual(restrictedCustomer, {
  title: "Customer wasn't saved",
  message: 'This feature needs an active Tallyo Pro subscription. Open Account, choose a plan, then try again.',
  tone: 'warning',
  duration: 0
});
assert.doesNotMatch(restrictedCustomer.message, /row-level|policy|table|customers/i);

const authorisedCustomer = messages.normalise(
  'Could not save customer: new row violates row-level security policy for table "customers"',
  { accessState: 'full' }
);
assert.equal(authorisedCustomer.title, "Customer wasn't saved");
assert.match(authorisedCustomer.message, /Refresh the page and try again/);
assert.doesNotMatch(authorisedCustomer.message, /row-level|policy|table/i);

const serviceFailure = messages.normalise(
  'Could not send reminder: Failed to send a request to the Edge Function',
  { accessState: 'full' }
);
assert.equal(serviceFailure.title, "Reminder wasn't sent");
assert.match(serviceFailure.message, /Check your connection, wait a moment and try again/);
assert.doesNotMatch(serviceFailure.message, /Edge Function|non-2xx/i);

const validation = messages.normalise('Enter a valid payment amount.', { accessState: 'full' });
assert.equal(validation.title, 'Information needed');
assert.equal(validation.tone, 'warning');
assert.match(validation.message, /Enter a valid payment amount/);

const success = messages.normalise('Settings saved.', { accessState: 'full' });
assert.equal(success.title, 'Settings saved');
assert.equal(success.tone, 'success');

const sessionEnded = messages.normalise('Your session has ended. Please sign in again.', { accessState: 'full' });
assert.equal(sessionEnded.title, 'Session ended');
assert.match(sessionEnded.message, /sign in again/);

const reminder = messages.normalise('Reminder accepted for delivery to customer@example.test. You can follow its status in Activity History.', { accessState: 'full' });
assert.equal(reminder.title, 'Reminder is on its way');
assert.equal(reminder.message, 'You can check its delivery status in Activity History.');
assert.doesNotMatch(reminder.message, /@/);

assert.match(app, /<script src="\.\/app-user-messages\.js"><\/script>/);
assert.match(app, /window\.alert = \(message\) => tallyoApp\.showUserMessage\(message\)/);
assert.match(app, /class="app-notice" role="status" aria-live="polite" aria-atomic="true" :data-tone="appNotice\.tone"/);
assert.match(app, /showUserMessage\(message\)/);

console.log('User message guidance harness passed.');
