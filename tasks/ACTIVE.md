# Active task: BILL-002 local Billing migration validation

Objective: Apply and exercise the merged Stripe Billing migration only inside a disposable local PostgreSQL 17 container, correct any validation finding within the unapplied migration and focused harness, then remove that exact container.
Status: Closed. PR #96 merged on 2026-07-24 as `bfe7afd6f5b6cdaddfec9c29fd73d82d33c1716e`.
Branch: `codex/billing-local-migration-validation`, merged.
Risk: High review because the test covers RLS, privileged functions, tenant ownership and payment entitlements. Runtime impact is locally isolated and reversible.
Approved scope: Start the already available Docker engine; create the network-unpublished container `tallyo-billing-pg17-validation-20260724`; build a minimal Supabase-compatible role/Auth fixture; apply only `20260724111312_stripe_billing_test_foundation.sql`; run schema, RLS, grant, ownership, atomicity, replay, ordering, entitlement and rollback probes; correct only a confirmed migration finding and its focused regression assertion; verify the exact container identity; stop/remove only that container; record privacy-safe evidence.
Excluded: Supabase cloud changes; remote SQL; migration history changes; Edge Function deployment; provider settings or secrets; Stripe writes; customer/payment data; public checkout; production release; deletion of any pre-existing Docker container, image, volume or user data.

## Roles and gates

- Master Orchestrator: scope, exact-target safety, evidence and closure.
- Supabase/backend specialist: PostgreSQL fixture, migration execution and RLS/privilege probes.
- Payments/Security specialist: atomic state, replay/order and entitlement review.
- QA specialist: deterministic pass/fail assertions and cleanup verification.
- Production Release, Stripe Provider, Legal and Customer Data: Not triggered; explicitly excluded.

## Lock

- Files or paths released: `tasks/ACTIVE.md`, `supabase/migrations/20260724111312_stripe_billing_test_foundation.sql`, `tests/stripe-billing-foundation-harness.cjs` and `STRIPE_BILLING_LOCAL_MIGRATION_EVIDENCE_2026-07-24.md`.
- Local resource released: Docker container name `tallyo-billing-pg17-validation-20260724`; the exact container was removed after the passing run and no container remains with that name.
- Lock acquired: 2026-07-24.
- Repository locks released: 2026-07-24 after Owner-approved merge. Every local probe passed, the exact disposable container was removed and the evidence is focused.

## Approval boundary

The completed local validation grants no runtime authority. The next Billing stage requires separate High-risk Owner approval before any Supabase cloud mutation, Stripe configuration/write, secret handling, function deployment, provider request, payment or public/production activation.
