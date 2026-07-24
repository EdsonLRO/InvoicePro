# Stripe Billing test-acceptance preparation evidence — 2026-07-24

## Disposition

BILL-003 repository preparation is implemented and locally verified. It adds a service-role-only, per-account Checkout claim; current-provider subscription verification before Session creation; signed Checkout lifecycle cleanup; repeatable local PostgreSQL probes; and an isolated test-acceptance runbook.

The migration remains unapplied to Supabase. The three Billing Edge Functions remain undeployed. Stripe Billing objects/settings/secrets do not exist, no provider request or Checkout was made, and public subscription Checkout remains disabled.

## Finding resolved

`SEC-PAY-002` showed that the disabled Checkout candidate included a browser-controlled request UUID in Stripe idempotency. Before the first webhook wrote subscription state, another request UUID could reach another Session-creation request.

The narrow fix:

- locks the account's immutable Billing Customer mapping;
- atomically permits one non-expired Checkout claim per account;
- treats a retry as the same attempt only when request ID and billing interval both match;
- blocks a different request or interval while the claim is active;
- verifies the mapped Stripe Customer has no non-terminal subscription before Session creation;
- sets a 30-minute Stripe Session expiry and keeps the database claim five minutes longer;
- completes the claim only when the returned test Session and expiry are valid;
- clears only a matching stored Session claim from a signed completion/expiration event;
- retains service-role-only privileges and `SECURITY INVOKER` execution.

Checkout is undeployed and disabled, so the finding had no current customer impact.

## Disposable PostgreSQL validation

- Official image: `postgres:17.6-alpine`.
- Exact container: `tallyo-billing-claim-pg17-20260724`.
- Network mode: `none`.
- Published ports and persistent volumes: none.
- PostgreSQL data: 256 MB temporary-memory mount.
- Fixture: synthetic roles, two synthetic Auth users and synthetic Stripe-format identifiers only.
- Cleanup: the exact `--rm` container was stopped and no container remained with that name.

The committed migration applied cleanly. The claim probes passed:

- RLS enabled with no browser policies or grants on Checkout claims;
- all three claim RPCs are service-role-only and `SECURITY INVOKER`;
- first request claimed;
- same request/interval retry accepted idempotently;
- different request rejected as `checkout_pending`;
- same request with a changed interval rejected;
- cross-account Customer claim rejected;
- wrong request unable to complete a claim;
- expired Session unable to complete a claim;
- matching test Session completed and cleared;
- cleared and expired claims recovered safely;
- separate accounts claimed independently;
- verified subscription state blocked a new Checkout;
- authenticated browser role could neither read claims nor execute the claim RPC.

Final deterministic probe result: two claims, one subscription, one event, `ALL BILLING CHECKOUT CLAIM PROBES PASSED`.

A separate two-connection probe held the first account transaction open. The second different request waited 2,509 ms for serialization, then returned `checkout_pending`; it did not create a second claim.

## Focused validation

Passed:

- `node tests/stripe-billing-foundation-harness.cjs`
- `node tests/stripe-payment-integrity-harness.cjs`
- `node tests/edge-dependency-pin-harness.cjs`
- `node tests/security-workflow-harness.cjs`
- `node tests/tenant-isolation-attribution-harness.cjs`
- `deno fmt --check` for all three Billing functions
- frozen `deno check` for all three Billing functions
- revised migration application on PostgreSQL 17.6
- committed Checkout-claim SQL probes
- real two-connection serialization probe
- `git diff --check`

The existing invoice-payment webhook remains unable to reference Billing tables/RPCs, and the Billing webhook remains unable to write invoices.

## Current-source review

Official documentation was checked on 2026-07-24:

- Stripe does not guarantee webhook delivery order, supporting current-state retrieval plus replay/stale handling.
- Stripe recommends actual sandbox subscriptions for reliable lifecycle testing; synthetic fixture events may not correlate to retrievable objects.
- Customer Portal sandbox configuration is separate from live configuration.
- Supabase recommends tracked migrations and explicit environment separation.
- Supabase warns that privileged functions can bypass RLS; every Billing RPC here uses caller privileges and explicit grants.

References are recorded in `STRIPE_BILLING_TEST_ACCEPTANCE_RUNBOOK.md`.

## Residual gates

This evidence does not approve:

- a Supabase project/branch or any associated cost;
- remote migration application or advisor execution;
- Stripe Product, Price, tax, Portal or webhook configuration;
- secret entry or rotation;
- Edge Function deployment;
- synthetic provider Checkout or test-clock simulation;
- entitlement connection to app write policies;
- public subscription Checkout, production Billing or release.

The high-risk implementation PR must stop for Owner ready/merge approval. Every later provider/runtime action remains a separate exact Owner gate.
