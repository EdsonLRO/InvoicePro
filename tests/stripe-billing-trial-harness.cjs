const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const migrationName = fs.readdirSync(path.join(root, 'supabase', 'migrations'))
  .find((name) => name.endsWith('_seven_day_billing_trial.sql'));
assert.ok(migrationName, 'timestamped seven-day trial migration must exist');

const migration = read('supabase', 'migrations', migrationName);
const checkout = read('supabase', 'functions', 'create-billing-checkout', 'index.ts');
const webhook = read('supabase', 'functions', 'stripe-billing-webhook', 'index.ts');
const app = read('index.html');
const publicConfig = read('config.js');
const build = read('scripts', 'build-app-pages.mjs');
const websiteConfig = read('website', 'src', 'config.mjs');
const websitePages = read('website', 'src', 'pages.mjs');
const commercialOffer = read('website', 'src', 'commercial-offer.mjs');
const review = read('docs', 'legal', 'TRIAL_SUBSCRIPTION_REVIEW.md');
const probes = read('tests', 'stripe-billing-trial-probes.sql');

assert.match(migration, /add column trial_used_at timestamptz/i);
assert.match(migration, /add column trial_days integer not null default 0[\s\S]*?trial_days in \(0, 7\)/i);
assert.match(migration, /provider_status in \([\s\S]*?'trialing'[\s\S]*?'active'/i);
assert.match(migration, /'customer\.subscription\.trial_will_end'/i);
assert.match(migration, /add column customer_notification_sent_at timestamptz/i);
assert.match(migration, /create or replace function public\.set_stripe_billing_checkout_trial[\s\S]*?security invoker/i);
assert.match(migration, /v_trial_used_at is not null[\s\S]*?return 'trial_used'/i);
assert.match(migration, /set trial_days = 7[\s\S]*?billing_interval = 'monthly'/i);
assert.match(migration, /grant execute on function public\.set_stripe_billing_checkout_trial[\s\S]*?to service_role/i);
assert.doesNotMatch(migration, /grant execute on function public\.set_stripe_billing_checkout_trial[\s\S]*?to (?:anon|authenticated)/i);
assert.doesNotMatch(migration, /security definer/i);
assert.match(migration, /p_provider_status = 'trialing' and p_billing_interval <> 'monthly'/i);
assert.match(migration, /p_provider_status in \('trialing', 'active'\)[\s\S]*?v_access_state := 'full'/i);
assert.match(migration, /set trial_used_at = coalesce\(trial_used_at, p_event_created_at\)/i);

assert.match(checkout, /interval === "monthly" &&[\s\S]*?STRIPE_BILLING_TRIAL_ENABLED/);
assert.match(checkout, /STRIPE_BILLING_TRIAL_LIVE_APPROVED/);
assert.match(checkout, /accountCanUseTrial\(admin, user\.id, customerId\)[\s\S]*?\? 7[\s\S]*?: 0/);
assert.match(checkout, /"set_stripe_billing_checkout_trial"/);
assert.match(checkout, /payment_method_collection", "always"/);
assert.match(checkout, /payment_method_types\[0\]", "card"/);
assert.match(checkout, /subscription_data\[trial_period_days\]", "7"/);
assert.match(checkout, /trial_settings\]\[end_behavior\]\[missing_payment_method\][\s\S]*?"cancel"/);
assert.match(checkout, /metadata\[trial_days\]", String\(trialDays\)/);
assert.match(checkout, /String\(trialDays\),[\s\S]*?requestId/);
assert.match(checkout, /claimedTrialDays === trialDays/);
assert.match(checkout, /session\?\.metadata\?\.trial_days[\s\S]*?String\(claimedTrialDays\)/);
assert.doesNotMatch(checkout, /body\.(?:trial|trialDays|price|priceId|amount)/);

assert.match(webhook, /"customer\.subscription\.trial_will_end"/);
assert.match(webhook, /"trialing"/);
assert.match(webhook, /subscription\?\.trial_end/);
assert.match(webhook, /verifyStripeSignature\([\s\S]*?rawBody/);
assert.match(webhook, /event\.type === "customer\.subscription\.trial_will_end"[\s\S]*?sendTrialEndingReminder/);
assert.match(webhook, /Idempotency-Key[\s\S]*?billing-trial-ending\/\$\{eventId\}/);
assert.match(webhook, /Your Tallyo Pro trial ends in 3 days/);
assert.match(webhook, /£8 per month/);
assert.match(webhook, /customer_notification_sent_at/);

assert.match(publicConfig, /window\.TALLYO_BILLING_TRIAL_ENABLED = false;/);
assert.match(build, /TALLYO_BILLING_TRIAL_ENABLED/);
assert.match(build, /The Billing trial requires an enabled Billing browser mode/);
assert.match(build, /TALLYO_BILLING_TRIAL_PUBLIC_RELEASE_APPROVED/);
assert.match(build, /The live Billing trial requires explicit public-release approval/);
assert.match(websiteConfig, /TALLYO_SUBSCRIPTION_TRIAL_ENABLED/);
assert.match(websiteConfig, /The subscription trial requires subscription Checkout to be enabled/);
assert.match(websiteConfig, /TALLYO_SUBSCRIPTION_TRIAL_PUBLIC_RELEASE_APPROVED/);
assert.match(websiteConfig, /subscriptionTrialEnabled: subscriptionTrialRequested/);
assert.match(websitePages, /siteConfig\.subscriptionTrialEnabled[\s\S]*?Start 7-day free trial/);
assert.match(websitePages, /isInvoice && siteConfig\.subscriptionTrialEnabled[\s\S]*?cta_generator_start_trial[\s\S]*?data-subscription-link[\s\S]*?Start 7-day free trial/);
assert.match(commercialOffer, /A card is required[\s\S]*?cancel online[\s\S]*?£8 per month[\s\S]*?email you 3 days before/i);
assert.match(app, /Start 7-day free trial · then £8\/month/);
assert.match(app, /A card is required/);
assert.match(app, /We will email you 3 days before the trial ends/);
assert.match(app, /Cancel online before the trial ends and you will not be charged/);
assert.match(app, /trialing: 'Free trial'/);
assert.match(app, /ends on \{\{ billingPeriodDate\(billing\.subscription\.current_period_end\) \}\}/);
assert.match(app, /\.from\('billing_customers'\)\.select\('trial_used_at'\)/);
assert.match(review, /Owner authorised for the bounded live release on 25 September 2026/i);
assert.match(review, /elected to proceed without external professional review/i);
assert.match(probes, /^\\set ON_ERROR_STOP on/i);
assert.match(probes, /begin;[\s\S]*?rollback;/i);
assert.match(probes, /'trialing'[\s\S]*?'full'/i);
assert.match(probes, /'trial_used'/i);
assert.match(probes, /'customer\.subscription\.trial_will_end'/i);

console.log('Stripe Billing seven-day trial harness passed.');
