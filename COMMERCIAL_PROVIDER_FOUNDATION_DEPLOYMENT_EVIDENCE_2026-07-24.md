# Commercial provider foundation deployment evidence

Date: 2026-07-24
Task: COMM-001
Environment: Supabase production project `cuagwifetheefftleeup`, region `eu-west-2`
Approved source: PR #101 head `63e590d`, merged to `main` as `a0e87e0`
Approval: Owner instructed the separately gated production-preparation stage to proceed after its migration, deployment and protected-configuration risk was identified.

## Scope

This stage applied the already merged additive Billing and Stripe Connect schemas and deployed only their seven new Edge Functions. It did not configure Stripe, enter a secret, enable a feature, create provider resources, alter the existing Owner invoice-payment functions, process money or publish the website.

Supabase migration ordering required the following three migrations to be applied together:

1. `20260724111312_stripe_billing_test_foundation.sql`
2. `20260724174500_stripe_connect_foundation.sql`
3. `20260724175920_stripe_connect_payments.sql`

New functions deployed:

- `create-billing-checkout` version 1, JWT verification enabled;
- `create-billing-portal` version 1, JWT verification enabled;
- `stripe-billing-webhook` version 1, JWT verification disabled for raw-body provider signatures;
- `manage-stripe-connect` version 1, JWT verification enabled;
- `create-connect-checkout` version 1, JWT verification enabled;
- `create-connect-refund` version 1, JWT verification enabled;
- `stripe-connect-webhook` version 1, JWT verification disabled for raw-body provider signatures.

## Pre-change evidence

- Project status: `ACTIVE_HEALTHY`, PostgreSQL `17.6.1.127`.
- Latest physical backup: completed at `2026-07-24T00:44:27.815Z`.
- PITR: not enabled or assumed.
- Supabase migration dry run listed exactly the three migrations above.
- The three migration versions were absent from remote history.
- The candidate tables did not exist.
- None of the seven new functions was deployed.
- No secret name containing `BILLING`, `CONNECT` or `STRIPE_OWNER_USER_ID` was configured.
- The production security advisor reported no warning or error.

## Post-change verification

- Remote migration history now matches all three local versions.
- RLS is enabled on all eight new tables:
  - `billing_customers`;
  - `billing_subscriptions`;
  - `billing_checkout_claims`;
  - `billing_events`;
  - `account_entitlements`;
  - `stripe_connected_accounts`;
  - `stripe_connect_events`;
  - `stripe_connect_checkout_claims`.
- Authenticated browser access is limited to owner-scoped `SELECT` on the intended readable Billing state and `stripe_connected_accounts`.
- Billing and Connect Checkout claims and Connect event evidence have no browser grant.
- Service-role grants and service-only RPCs remain the only write path.
- The production security advisor still reports no warning or error.
- Aggregate readback confirms all eight new commercial tables contain zero rows.
- All seven new functions are `ACTIVE` at version 1 with the reviewed JWT settings.
- No Billing, Connect or Owner-allowlist secret name was added.
- No-data endpoint probes passed:
  - the five JWT-protected functions rejected missing authorization with HTTP 401;
  - `stripe-billing-webhook` returned HTTP 503 because explicit test mode is absent;
  - `stripe-connect-webhook` returned HTTP 503 because the Connect webhook gate is disabled.

## Actions deliberately not taken

- no existing live invoice-payment, refund or email function was redeployed;
- no Stripe secret, webhook secret, Product, Price, Customer Portal, connected account, Account Link or event destination was created or changed;
- no Billing or Connect feature flag was configured;
- no live-release approval flag was configured;
- no Checkout Session, subscription, payment, refund or dispute was created;
- no frontend, DNS, AI or legal/publication state changed;
- no secret value, customer data, private email, bank detail, identity document or provider payload was inspected or recorded.

## Containment and rollback

The deployed functions remain fail-closed because their required feature gates and provider settings are absent. The new database objects are additive and currently contain no provider-created commercial state. If a later configuration or acceptance step fails, keep all commercial gates absent or false, preserve the schema and evidence, and investigate before retrying. Dropping tables/functions, changing secrets, or rolling back production requires a separate reviewed action and Owner approval.

## Next gate

Test-mode Stripe configuration remains separate. It must identify the exact sandbox account, Products/Prices, event destinations, secret names, feature-gate values, synthetic users/accounts, transaction amounts, validation and rollback. No live Stripe mode, public claim or production release is authorised by this evidence.
