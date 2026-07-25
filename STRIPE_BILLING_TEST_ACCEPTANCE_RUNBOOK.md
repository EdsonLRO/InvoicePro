# Stripe Billing isolated test-acceptance runbook

Status: The 2026-07-25 Owner-approved protected sandbox execution is recorded in `STRIPE_BILLING_SANDBOX_ACCEPTANCE_EVIDENCE_2026-07-25.md`. This runbook does not authorise a later Supabase or Stripe change, secret entry, deployment, Checkout, payment or public release.

## Purpose and boundary

Use this procedure only after the Owner approves an isolated Stripe sandbox and the exact Supabase/test-app target. It validates Tallyo subscription Billing for a synthetic Tallyo account. It must not touch live Stripe mode, existing invoice-payment configuration, real customer data or the public website.

The 2026-07-25 execution used the existing Supabase project only because the Owner's exact approval named the protected, non-live feature gates and synthetic acceptance scope. That exception does not authorise reuse for another test. Without an exact recorded exception, the procedure must not touch the production Supabase project. Prefer a separately approved non-production project or isolated Supabase branch with synthetic data only. Any new paid project, add-on or billable branch requires separate Owner approval before creation.

The committed local bootstrap creates synthetic Auth roles/users and is for a disposable local PostgreSQL database only. Never run `tests/stripe-billing-local-bootstrap.sql` against Supabase.

## Required approvals before provider work

Record all of the following before changing either dashboard:

1. exact non-production Supabase target and whether it has any cost;
2. exact Stripe sandbox;
3. the reviewed repository commit;
4. tax behaviour for both sandbox Prices;
5. Customer Portal cancellation and billing-information settings;
6. exact synthetic test account and approved test-app return URL;
7. permission to apply the migration, enter secret values directly in provider controls, deploy the three functions and create the sandbox Product/Prices/webhook;
8. separate permission for the controlled test Checkout and any test-clock simulation.

Do not paste secret values into chat, shell history, source, screenshots or evidence. Record variable names and masked provider identifiers only.

## Fixed repository controls

- Public website subscription Checkout remains disabled.
- `create-billing-checkout` and `create-billing-portal` require both `STRIPE_BILLING_ENABLED=true` and `STRIPE_BILLING_TEST_MODE=true`.
- Billing functions accept only a Stripe test or restricted test key.
- Monthly/annual Price identifiers come only from server configuration.
- One active per-account Checkout claim serialises different browser request IDs.
- The server checks existing Stripe subscriptions before creating a Session.
- Checkout Sessions expire after 30 minutes; their database claims remain five minutes longer.
- Signed `checkout.session.completed` and `checkout.session.expired` lifecycle handling clears only the matching stored Session claim.
- Billing webhook processing requires explicit test mode, a valid raw-body signature and `livemode=false`.
- Billing writes and RPCs remain `service_role` only and use caller privileges.
- Billing state remains separate from customer invoice payments.

## Configuration names

Names only:

- `STRIPE_BILLING_ENABLED`
- `STRIPE_BILLING_TEST_MODE`
- `STRIPE_BILLING_SECRET_KEY`
- `STRIPE_BILLING_WEBHOOK_SECRET`
- `STRIPE_BILLING_API_VERSION`
- `STRIPE_BILLING_MONTHLY_PRICE_ID`
- `STRIPE_BILLING_ANNUAL_PRICE_ID`
- `APP_BASE_URL`

Do not reuse the invoice-payment key, webhook secret or endpoint by assumption. The Billing webhook is a separate destination.

## Repository and local preflight

From the reviewed commit:

1. run `node tests/stripe-billing-foundation-harness.cjs`;
2. run `node tests/stripe-payment-integrity-harness.cjs`;
3. run `node tests/edge-dependency-pin-harness.cjs`;
4. run frozen Deno checks and formatting for all three Billing functions;
5. apply the migration to a disposable PostgreSQL 17 database;
6. run `tests/stripe-billing-checkout-claim-probes.sql`;
7. run a two-connection claim race: the first request must return `claimed`; the different concurrent request must serialise and return `checkout_pending`;
8. verify the disposable database/container is removed;
9. review the complete diff and run `git diff --check` plus the focused secret scan.

## Later test-environment sequence

Every step below remains Owner-gated.

### 1. Confirm target and migration history

- Authenticate the Supabase CLI without printing its token.
- Link only to the approved test target.
- Run `supabase migration list` and reconcile any drift before applying anything.
- Stop if the target is production, contains real customer data, or has unexpected migration history.
- Apply the tracked migration through the normal migration workflow. Do not paste it into the remote SQL editor and do not use migration repair without a separately reviewed diagnosis.
- Run Supabase security and performance advisors.

Verify:

- five Billing tables exist and have RLS enabled;
- browser roles have owner-scoped SELECT only on the four user-visible Billing tables;
- `billing_checkout_claims` has no browser policy or browser table grant;
- all Billing mutation/RPC execution is `service_role` only;
- all Billing RPCs are `SECURITY INVOKER`;
- Billing events remain append-only;
- core app tables and policies are unchanged.

### 2. Deploy with Checkout disabled

Deploy from one reviewed commit, in this order:

1. `stripe-billing-webhook`;
2. `create-billing-checkout`;
3. `create-billing-portal`.

JWT verification must remain enabled for Checkout and Portal and disabled only for the signature-verified webhook. Keep `STRIPE_BILLING_ENABLED` false or absent. A direct Checkout/Portal request must return a disabled response.

### 3. Configure the Stripe sandbox

Only after the provider-configuration approval:

- create one sandbox Product for Tallyo Pro;
- create one recurring GBP monthly Price for the approved £8 amount;
- create one recurring GBP annual Price for the approved £80 amount;
- use the same explicit, Owner-approved tax behaviour on both Prices;
- do not create a trial, coupon, promotion code, metered quantity or additional tier;
- pin one reviewed Stripe API version consistently in server settings and the webhook destination;
- configure the Customer Portal for payment-method management, invoice history and the approved end-of-period cancellation behaviour;
- keep plan switching, quantity changes, promotions and retention coupons off unless separately approved.

Create a dedicated Billing webhook destination subscribed only to:

- `checkout.session.completed`;
- `checkout.session.expired`;
- `customer.subscription.created`;
- `customer.subscription.updated`;
- `customer.subscription.deleted`;
- `customer.subscription.paused`;
- `customer.subscription.resumed`;
- `invoice.paid`;
- `invoice.payment_failed`;
- `invoice.payment_action_required`.

Enter secret values directly in the approved Supabase test target. Set explicit test mode, the two sandbox Price identifiers, the reviewed API version and the approved test-app base URL. Keep `STRIPE_BILLING_ENABLED=false`.

### 4. Disabled and malicious-path acceptance

Before enabling Checkout:

- missing/false enable switch returns a disabled response;
- missing or non-test Billing key fails closed;
- missing Price/API version/webhook configuration fails closed;
- a live-mode event is rejected;
- an invalid, expired or missing signature is rejected;
- an unknown event returns success without mutation;
- browser roles cannot read Checkout claims or call any Billing mutation RPC;
- one account cannot read another account's visible Billing rows;
- invoice-payment webhook fixtures cannot alter Billing state.

### 5. Controlled synthetic Checkout

After separate approval, set `STRIPE_BILLING_ENABLED=true` only in the isolated test target.

For one confirmed synthetic account with MFA enrolled:

1. verify AAL1 is rejected;
2. complete AAL2;
3. submit two different request IDs concurrently and confirm exactly one reaches Session creation while the other receives `checkout_pending`;
4. retry the winning request ID and confirm Stripe idempotency returns the same Session;
5. complete one monthly sandbox Checkout;
6. confirm one Customer mapping, one subscription, one active entitlement and privacy-minimised event evidence;
7. replay the signed event and confirm no duplicate state;
8. deliver an older event and confirm it is recorded stale without entitlement rollback;
9. attempt another request while the subscription exists and confirm both database and current-provider checks block it.

Repeat with a separate synthetic account for annual billing. Do not reuse or expose real account/customer details.

### 6. Portal and lifecycle acceptance

- Portal creation resolves only the authenticated account's Customer.
- Cross-account Customer input is impossible because the function accepts no Customer ID.
- Cancellation at period end preserves full access through the verified period.
- A signed deletion/end event changes access to read-only without deleting records.
- A later active event restores full access.
- `past_due` produces the configured seven-day grace state.
- `unpaid` produces read-only and disables the service write helper.
- Use an actual Stripe sandbox subscription for webhook acceptance. Stripe-generated fixture events that do not correlate to a retrievable subscription are insufficient.
- Use a Stripe sandbox Billing simulation/test clock where appropriate to exercise renewal and payment failure. Finishing a simulation deletes its sandbox objects and must be separately approved as a destructive provider action.

### 7. Evidence and exit criteria

Record only:

- reviewed commit;
- masked test target/provider identifiers;
- migration list/advisor result;
- function versions and JWT settings;
- configured event names and API version;
- synthetic test case references;
- expected/actual state transitions and counts;
- duplicate/replay/out-of-order results;
- rollback result and residual gates.

Never record credentials, webhook payloads, card data, password/MFA values, customer email, full provider response bodies or real customer data.

The stage passes only when all required checks are known, no high/critical finding remains, the public website still has Checkout disabled, and the Owner approves the resulting high-risk PR and any subsequent provider action separately.

## Rollback and containment

1. Set `STRIPE_BILLING_ENABLED=false` first to stop new Checkout and Portal Sessions.
2. Leave the signed Billing webhook available while reconciling already-created sandbox subscriptions, unless webhook integrity itself is compromised.
3. Do not delete Billing rows or manually edit entitlement state.
4. Preserve privacy-minimised event evidence and reconcile sandbox subscriptions before retrying.
5. Fix code/configuration from a reviewed commit, then replay genuine sandbox events where supported.
6. Rotate a suspected secret only through the Owner/provider process.
7. Archive or delete test provider objects, Supabase branches/projects or synthetic accounts only with exact destructive-action approval.
8. Public Checkout, production configuration and live Billing remain later release gates.

## Official technical references

- Stripe subscription webhooks: <https://docs.stripe.com/billing/subscriptions/webhooks>
- Stripe Billing testing and simulations: <https://docs.stripe.com/billing/testing>
- Stripe webhook signatures, retries and ordering: <https://docs.stripe.com/webhooks>
- Stripe Customer Portal configuration: <https://docs.stripe.com/customer-management/configure-portal>
- Supabase database migrations: <https://supabase.com/docs/guides/deployment/database-migrations>
- Supabase Edge Function configuration: <https://supabase.com/docs/guides/functions/function-configuration>
- Supabase RLS: <https://supabase.com/docs/guides/database/postgres/row-level-security>
