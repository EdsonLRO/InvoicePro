# Active task: BILL-003 Stripe Billing test-acceptance preparation

Task ID: BILL-003
Title: Prepare the disabled Stripe Billing foundation for an isolated test-mode acceptance stage
Priority: High
Status: Implementation Complete; local verification passed and high-risk PR preparation is in progress
Phase: Repository-only implementation and verification
Owner role: Master Orchestrator
Assigned specialists: Payments, Backend/Supabase, Security and QA; Legal review limited to the subscription trigger
Model/work mode: Sol / High
Risk level: High

## Scope and locks

Objective: produce a provider-disabled acceptance runbook and deterministic controls for applying the already reviewed Billing foundation in a later, separately approved test environment. Remediate the pre-activation duplicate-Checkout race identified during source review.

Approved repository scope:

- preserve the existing test-mode and kill-switch gates;
- add a service-role-only, per-account Checkout claim so browser-controlled request IDs cannot create parallel subscription sessions;
- reconcile claims from signed Checkout lifecycle events;
- verify current-provider state before creating a session;
- add focused local concurrency, RLS, rollback and source-regression tests;
- document exact later deployment, rollback and acceptance order without using secret values.

Excluded:

- Supabase cloud access or mutation;
- Stripe Dashboard/API access, Product/Price/Portal/webhook configuration or provider requests;
- secret creation, entry, reveal, rotation or inspection;
- Edge Function deployment or migration application outside a disposable local database;
- Checkout, payment, email, customer data, public subscription activation, DNS or production release.

Files or paths locked:

- `tasks/ACTIVE.md`;
- `SECURITY_FINDINGS_LEDGER.md`;
- `supabase/migrations/20260724111312_stripe_billing_test_foundation.sql`;
- `supabase/functions/create-billing-checkout/`;
- `supabase/functions/stripe-billing-webhook/`;
- `tests/stripe-billing-foundation-harness.cjs`;
- focused BILL-003 test/runbook/evidence files;
- `docs/architecture/STRIPE_BILLING.md`;
- `APP_STATUS.md`;
- `SUPABASE_HANDOFF.md`;
- `website/content/subscription-readiness.json`.

Local resource released: disposable Docker container `tallyo-billing-claim-pg17-20260724`; it used disabled networking, no published port and temporary-memory PostgreSQL data, and the exact `--rm` container was removed after passing probes.

Lock acquired: 2026-07-24.
Release condition: focused runtime and source tests pass, the original race and bypass variants fail closed, legitimate single-session behavior remains, no disposable resource remains, evidence is complete, the diff is clean and the high-risk PR stops for Owner ready/merge approval.

## Security finding

Finding ID: BILL-003-F1
Title: Browser-controlled idempotency permits parallel subscription Checkout Sessions
Classification: Validated — approved to fix under the repository-only BILL-003 scope
Severity: High before Billing activation; no current runtime exposure because Billing is undeployed and disabled
Affected components: `create-billing-checkout`, Billing migration, signed Billing webhook and focused tests
Invariant: one Tallyo account must not be able to create or complete overlapping Tallyo Pro subscription Checkout Sessions
Evidence: the Checkout idempotency key includes a browser-supplied `requestId`, while the existing subscription lookup is populated only after signed webhook reconciliation. Changing the request ID before the first completion can produce another Stripe request.
Realistic impact if activated unchanged: duplicate subscriptions and charges, contradictory entitlement state and support/refund burden.
Narrow fix: atomically claim one active Checkout per account in PostgreSQL, keep claims service-role-only, use same-request idempotency, verify provider subscription state and clear the matching claim only from signed lifecycle handling.
Required verification: simultaneous different-request rejection, same-request retry safety, expired-claim recovery, existing-subscription rejection, cross-account isolation, anonymous/authenticated denial, signed lifecycle cleanup, rollback and existing Billing regression.

Verification completed: committed deterministic claim probes passed; a real two-connection different-request race serialized and returned `checkout_pending`; all focused Billing, payment-isolation, dependency, workflow, tenant-attribution and Deno checks passed. Evidence: `STRIPE_BILLING_TEST_ACCEPTANCE_PREPARATION_EVIDENCE_2026-07-24.md`.

## Legal review

Jurisdiction: United Kingdom.
Affected users/data subjects: synthetic test account only in this repository stage; no customer or payer.
Feature/data/money flow: internal technical preparation only; no provider object, personal data, card data, charge, renewal or communication.
Roles: existing controller/processor positions are unchanged.
Applicable sources: current official Stripe Billing/Checkout/webhook and Supabase migration/RLS/Edge Function guidance; customer-facing subscription law and tax conclusions are expressly deferred.
Foreseeable failure: duplicate charges if the race were activated, test/live mixing, unclear cancellation/tax presentation or premature public claims.
Mandatory controls: duplicate-session containment, signed provider-derived state, test-mode enforcement, simple cancellation path, evidence minimisation and continued public disablement.
User-facing wording: none changed or approved by this task.
Retention/rights/vendor implications: no new processing in this task; Billing records and Stripe retention remain subject to the later legal review.
Required evidence: synthetic local tests and provider-disabled repository checks only.
External-advice trigger: public subscriptions, final cancellation/refund/tax wording and production activation still require the recorded focused UK review.
Disposition: Approved with conditions for repository-only preparation; Blocked for provider configuration, customer testing, public checkout or production release.

## Approval boundary

The Owner authorised continuing repository development but has not authorised any Supabase cloud or Stripe action for BILL-003. Stop before applying the migration remotely, configuring provider objects/settings, entering secrets, deploying functions or making a test Checkout. The high-risk code PR must also stop for explicit Owner ready/merge approval.
