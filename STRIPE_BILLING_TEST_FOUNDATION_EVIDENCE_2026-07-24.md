# Stripe Billing test foundation evidence — 2026-07-24

## Disposition

Repository candidate only. The Stripe Billing foundation is disabled, unapplied, undeployed and unconfigured. It cannot create a Stripe Customer, Checkout Session, Portal Session, subscription or active entitlement in the current environment.

This evidence does not approve a migration, Stripe product/Price, secret, webhook destination, function deployment, test payment, public checkout, production configuration or release.

## Scope reviewed

- Unapplied migration `20260724111312_stripe_billing_test_foundation.sql`.
- Undeployed `create-billing-checkout`, `create-billing-portal` and `stripe-billing-webhook` Edge Functions.
- Focused Billing integrity harness and CI registration.
- Existing invoice-payment isolation.
- Authoritative status, roadmap, architecture and Supabase handoff updates.

## Security and payment controls

| Control | Repository evidence |
|---|---|
| Provider disabled by default | Checkout and Portal require both `STRIPE_BILLING_ENABLED=true` and `STRIPE_BILLING_TEST_MODE=true`; neither is configured by this task. |
| No live-mode use | All three functions require a test secret key. The webhook additionally requires `livemode` to be exactly `false`. |
| Server Price allowlist | The browser sends only `monthly` or `annual`; the server maps that choice to the two configured Price names. Arbitrary browser Price/amount fields are absent. |
| Auth and MFA | Checkout and Portal call `getUser`, require a confirmed account and require AAL2 whenever the session indicates an enrolled MFA factor. |
| Tenant ownership | Billing tables use `user_id`; authenticated grants are SELECT-only with own-row RLS. A composite foreign key enforces the account/customer pair at database level. |
| Service-role boundary | Browser writes are revoked. Atomic event application and entitlement checks are executable only by `service_role`. |
| Signed event trust | The Billing webhook verifies the signature against the untouched raw body before JSON parsing or mutation. |
| Current provider state | Known events retrieve the current subscription before applying state, with a signed deleted-event fallback only for provider lookup failure. |
| Replay and ordering | Unique event IDs provide idempotency. The atomic RPC locks the mapping/subscription and records delayed events as stale before any state/entitlement change. Equal-time events from a different subscription cannot replace the existing subscription. |
| Fail-closed entitlements | Active and past-due state require a period end. `active` derives `full`, `past_due` derives seven-day `grace`, and all other supported states derive `read_only`; the service helper also checks expiry. |
| Evidence integrity | Billing event rows are append-only and written in the same database transaction as subscription and entitlement state. |
| Duplicate subscription containment | Checkout refuses a second session while the verified record is not `canceled` or `incomplete_expired`; provider calls also carry deterministic idempotency keys. |
| Invoice-payment isolation | The existing `stripe-webhook` has no Billing table/RPC reference; the Billing webhook has no invoice-table write. |
| Secret and privacy minimisation | Only environment-variable names appear. No key, webhook value, Price/Product ID, card data or customer email is stored in Billing evidence tables or logged. |

## Focused validation

Passed locally:

- `node tests/stripe-billing-foundation-harness.cjs`
- `node tests/stripe-payment-integrity-harness.cjs`
- `node tests/edge-dependency-pin-harness.cjs`
- `node tests/security-workflow-harness.cjs`
- `node tests/tenant-isolation-attribution-harness.cjs`
- frozen `deno check` for all three new functions
- `deno fmt --check` for all three new functions
- `npm test` in `website` (26 routes, fail-closed build checks, disabled AI Helper/mock-provider suite)
- focused secret-pattern scan of the new Billing source, migration and harness: no matches
- `git diff --check`

The local Deno executable is 2.9.1. The required GitHub `verify` job uses the repository's pinned Deno 2.2.15 and frozen locks; that independent check must pass on the pull request before Owner review.

The migration was intentionally not executed against local or remote PostgreSQL, so no Supabase advisor result is claimed. SQL/RLS validation in this stage is deterministic source inspection only. Migration application, live RLS probes and Supabase advisors belong to the separately approved test-environment stage.

## Review finding resolved

Sequential security review found that webhook code checked the Tallyo-account/Stripe-Customer relationship, but the initial schema did not enforce the pair as a composite database foreign key. The migration now enforces `(user_id, stripe_customer_id)` directly and the harness prevents regression.

## Residual gates

Before even a test Checkout:

1. Owner approves the high-risk PR merge.
2. Owner separately approves applying the migration in the intended test environment.
3. The exact Stripe test product, monthly/annual Prices, API version, Portal settings, webhook destination and server-only secrets are reviewed and configured.
4. The three functions are deployed with the kill switch still off, then schema/RLS/advisor probes pass.
5. App write policies are reviewed and connected to the service-only entitlement predicate without locking out existing users.
6. Grace/read-only behaviour, tax presentation and retention are confirmed.
7. Only then may a controlled test-mode Checkout, webhook replay and Portal acceptance be separately approved.

Public checkout, live Billing, production provider configuration and production release remain later, distinct Owner gates.
