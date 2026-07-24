# Stripe Connect repository foundation evidence

Date: 2026-07-24
Task: COMM-001
Branch: `codex/stripe-connect-foundation`
Scope: Unapplied and undeployed Stripe Connect account/onboarding foundation only

## Delivered

- tenant-bound `stripe_connected_accounts` state with owner-only browser reads;
- private append-only `stripe_connect_events` evidence;
- fixed database constraints for the approved Accounts v2, full Dashboard, Stripe-fees and Stripe-losses model;
- disabled-by-default `manage-stripe-connect` Edge Function;
- confirmed Auth, email and current MFA assurance for provider actions;
- stable per-owner Stripe account idempotency;
- server-derived connected-account mapping with provider metadata verification;
- Stripe-hosted onboarding/update links with exact application return URLs and Stripe-only redirect validation;
- Account-page connection, setup, capability and refresh states;
- focused source, RLS, privilege, cross-tenant and workflow checks.

## Local PostgreSQL acceptance

PostgreSQL image: `postgres:17.6-alpine`
Disposable container: `tallyo-connect-pg17-20260724`
Network: disabled
Published ports: none
Database storage: temporary memory
Final state: removed

The migration applied from a clean synthetic Supabase role/Auth bootstrap. Probes passed:

- both Connect tables have RLS enabled;
- authenticated users can select only their own connected-account state;
- authenticated and anonymous roles cannot write mapping state;
- browser roles cannot read private Connect events;
- dashboard, fee and loss responsibility constraints fail closed;
- cross-tenant account/event attribution is rejected by the composite foreign key;
- Connect evidence cannot be updated or deleted, including by the service role.

The first probe run set the synthetic JWT claim transaction-locally, so it expired before the RLS query. The migration had applied successfully; the probe was corrected to session scope and the isolated run then passed. No product code was weakened.

## Focused validation

- `node tests/stripe-connect-foundation-harness.cjs`
- `node tests/edge-dependency-pin-harness.cjs`
- `node tests/security-workflow-harness.cjs`
- `node tests/app-public-integration-harness.cjs`
- `node tests/core-lifecycle-harness.cjs`
- `node tests/stripe-payment-integrity-harness.cjs`
- `node tests/tenant-isolation-attribution-harness.cjs`
- `deno check --frozen --lock=deno.lock index.ts` in `manage-stripe-connect`
- `git diff --check`

All passed.

## Security and privacy disposition

- no browser input selects a Stripe account identifier;
- no service-role key or Stripe key is present in browser code;
- no secret value, identity document, bank detail or provider payload is stored or logged;
- the provider account must carry the authenticated Tallyo owner identifier in metadata;
- test/live key mode and account mode must agree;
- live mode requires an additional explicit release gate;
- the function contains no payment, refund, transfer, application-fee or disconnection operation.

## Boundary

No Supabase migration was applied outside the disposable local database. No Edge Function was deployed. No Stripe key, account, Account Link, provider configuration, payment, refund, webhook or public claim was created. The current production app and Owner payment route were not changed.

Customer Checkout, refunds, connected-account webhooks, disconnection and operational acceptance remain separate reviewed work.
