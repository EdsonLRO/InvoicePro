const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

assert.match(app, /v-if="subscriptionWelcomeOpen && !dataLoading"/);
assert.match(app, /role="dialog" aria-modal="true" aria-labelledby="subscription-welcome-title"/);
assert.match(app, /Choose a plan to start using Tallyo/);
assert.match(app, /An active Tallyo Pro subscription is required to create and manage invoices, customers and payments\./);
assert.match(app, /£8 monthly/);
assert.match(app, /£80 annually/);
assert.match(app, /View subscription options/);
assert.match(app, /@click="dismissSubscriptionWelcome"[^>]*>Not now</);

const guidanceMethod = app.match(/maybeShowSubscriptionWelcome\(\) \{([\s\S]*?)\n\s*\},\n\s*dismissSubscriptionWelcome/)?.[1] || '';
assert.match(guidanceMethod, /this\.subscriptionWelcomeShown/);
assert.match(guidanceMethod, /!this\.billing\.enabled/);
assert.match(guidanceMethod, /!this\.billing\.loaded/);
assert.match(guidanceMethod, /this\.billing\.error/);
assert.match(guidanceMethod, /this\.billing\.notice/);
assert.match(guidanceMethod, /this\.billing\.subscription/);
assert.match(guidanceMethod, /this\.billing\.entitlement/);
assert.match(guidanceMethod, /this\.subscriptionWelcomeOpen = true/);
assert.doesNotMatch(guidanceMethod, /openBillingCheckout|functions\.invoke|window\.location/);

assert.match(app, /this\.navigateTo\('account'\);[\s\S]*?this\.\$refs\.billingSection\.scrollIntoView/);
assert.match(app, /ref="billingSection" tabindex="-1"/);
assert.match(app, /this\.navigateTo\(this\.tabFromHash\(\), \{ replace: !window\.location\.hash \}\);\s*this\.maybeShowSubscriptionWelcome\(\);/);
assert.match(app, /this\.subscriptionWelcomeOpen = false;\s*this\.subscriptionWelcomeShown = false;[\s\S]*?this\.billing = \{/);
assert.doesNotMatch(guidanceMethod, /localStorage|sessionStorage|document\.cookie/);

console.log('Subscription welcome guidance harness passed.');
