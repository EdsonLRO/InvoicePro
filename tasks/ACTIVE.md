# Active task: BILL-001 Stripe Billing test foundation

Objective: Implement a disabled-by-default, test-mode-only Stripe Billing repository foundation for Tallyo Pro without applying a migration, configuring Stripe or Supabase providers, changing secrets, deploying functions, enabling checkout, making a paid request or publishing a release.
Status: Repository implementation and High review complete. Draft PR #94 is open, its required `verify` check passes, and the task is waiting only for exact Owner approval to mark ready and merge.
Branch: `codex/stripe-billing-test-foundation`.
Risk: High — subscriptions, money, Stripe, entitlements, RLS, service-role writes and an unapplied database migration.
Current scope: Reviewed billing schema and RLS; atomic webhook reconciliation; server-derived entitlements; authenticated monthly/annual Checkout and Customer Portal endpoints; signed test-mode webhook handling; failure-path and isolation tests; authoritative implementation evidence.
Excluded: Stripe products or prices; provider dashboard changes; secret creation/reveal/rotation; migration application; function deployment; test or live Checkout; production configuration; public website checkout; Stripe Connect; invoice-payment changes; legal publication; DNS; production release.

## Acceptance gates

1. The browser can select only `monthly` or `annual`; trusted server configuration maps that choice to a Price identifier.
2. Checkout and Portal creation fail closed unless the Billing kill switch and explicit test-mode guard are both enabled.
3. Signed, test-mode-only webhook events are allowlisted, idempotent and reconciled atomically; delayed events cannot roll verified state backward.
4. Entitlements are derived only from verified provider state and are never browser writable.
5. Every new public table has account-scoped read RLS, explicit grants and service-role-only writes.
6. Subscription Billing remains isolated from existing customer invoice-payment and refund paths.
7. Focused dependency, schema, RLS, webhook, ownership, state-machine, failure-path and secret-safety checks pass.
8. The final diff is focused and contains no provider identifiers, secrets, personal data, runtime dependency changes or unrelated edits.

## Roles and review

- Master Orchestrator: scope, locks, approvals, evidence and closure.
- Payments specialist: Stripe mode separation, allowlist, webhook, lifecycle, idempotency and rollback review.
- Supabase/backend specialist: schema, grants, RLS, atomic RPC and Edge Function review.
- Security/Privacy specialist: ownership, service-role boundary, logging and secret-safety review.
- QA specialist: focused deterministic harnesses and failure-path review.
- Legal, Marketing, SEO and Production Release: Not triggered by this repository-only foundation.

## Lock

- Assigned role: Master Orchestrator, with Payments, Supabase/backend, Security/Privacy and QA responsibilities performed sequentially.
- Files or paths locked: `tasks/ACTIVE.md`, `supabase/config.toml`, the new Billing migration, new Billing Edge Function directories, Billing-focused tests, `.github/workflows/security-checks.yml`, `docs/architecture/STRIPE_BILLING.md`, `SUPABASE_HANDOFF.md`, `APP_STATUS.md`, `ROADMAP.md`, and focused Billing evidence.
- Lock acquired: 2026-07-24.
- Lock released: 2026-07-24 after draft PR #94 opened and the required independent `verify` check passed.

## Approval boundary

Implementation, focused local validation, commit, push and a draft pull request are approved. Stop for exact Owner approval before marking the PR ready or merging it. Separate exact approval remains required before applying the migration, configuring Stripe products/prices/webhooks/Portal or secrets, deploying functions, making a Stripe request, enabling public subscription checkout, or publishing a production release.

## Validation completed

- Billing foundation, existing invoice-payment isolation, dependency-pin, security-workflow and tenant-attribution harnesses pass.
- All three new functions pass frozen Deno type-check and format checks.
- The website's 26-route, fail-closed build and disabled AI Helper/mock-provider suite passes after the internal readiness-state update.
- Focused secret-pattern scan has no matches; `git diff --check` passes.
- High review found and resolved a missing composite account/customer database foreign key.
- Draft PR #94 is mergeable; GitHub `verify` and both protected Cloudflare preview checks pass. The previews do not apply the migration or enable Billing.
- Full findings, limitations and the next Owner gates are recorded in `STRIPE_BILLING_TEST_FOUNDATION_EVIDENCE_2026-07-24.md`.
