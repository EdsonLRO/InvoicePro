# Stripe Billing local migration evidence — 2026-07-24

## Disposition

The previously unapplied Stripe Billing migration was applied only to a disposable local PostgreSQL 17.6 database. Validation found and corrected an unnecessary privileged-function boundary: the two service-role-only Billing RPCs now run as `SECURITY INVOKER`, while their existing explicit revokes and service-role grants remain in place.

The corrected migration passed the complete local probe suite. It remains unapplied to Supabase, the Billing Edge Functions remain undeployed and Billing remains disabled and unconfigured.

## Isolation and cleanup

- Image: official `postgres:17.6-alpine`, digest `sha256:ef257d85f76e48da1c64832459b59fcaba1a4dac97bf5d7450c77753542eee94`.
- Exact container: `tallyo-billing-pg17-validation-20260724`.
- Network mode: `none`.
- Published ports: none.
- Persistent Docker volumes: none on the final run; PostgreSQL data used a 256 MB temporary-memory mount.
- Fixture data: two synthetic Auth users and synthetic Stripe identifiers only.
- Cleanup: the exact `--rm` container was stopped and Docker returned no remaining container with that name.

The first failed-test container inherited an anonymous volume declared by the official image. Stopping its exact `--rm` container removed both the container and that anonymous volume before the clean rerun.

## Finding and correction

The initial runtime probe passed schema, RLS, grant, ownership, replay, ordering, entitlement and rollback checks, then failed because:

- `public.apply_stripe_billing_event(...)` used `SECURITY DEFINER`;
- `public.account_entitlement_allows_write(uuid)` used `SECURITY DEFINER`.

Both functions are executable only by `service_role`, which already has the required explicit table privileges and bypasses RLS. Owner-level execution was therefore unnecessary. The migration now declares both functions `SECURITY INVOKER`, and the focused repository harness prevents regression to `SECURITY DEFINER`.

## Runtime probes

The corrected migration passed:

- all four Billing tables exist with RLS enabled;
- authenticated users receive SELECT only and can read only their own Billing rows;
- anonymous access is denied;
- browser roles cannot insert Billing rows or execute privileged Billing RPCs;
- `service_role` can execute the two privileged RPCs;
- customer/account ownership and the composite subscription foreign key reject cross-account state;
- a valid active event atomically creates subscription and full entitlement state;
- duplicate event replay is idempotent;
- older and equal-time conflicting events are recorded as stale without replacing current state;
- customer mismatch is rejected;
- `past_due` derives a seven-day grace period;
- `unpaid` derives read-only access and disables the write helper;
- a later valid `active` event restores full access;
- invalid active state without a period end rolls back without recording an event;
- unique-subscription conflicts roll back event and entitlement changes;
- Billing events reject update and delete operations;
- both privileged RPCs execute as invoker, not definer.

Final synthetic state:

| Customers | Subscriptions | Events | Entitlements | Result |
|---:|---:|---:|---:|---|
| 2 | 1 | 6 | 1 | All Billing migration probes passed |

## Focused repository validation

Passed:

- `node tests/stripe-billing-foundation-harness.cjs`
- `node tests/stripe-payment-integrity-harness.cjs`
- `node tests/edge-dependency-pin-harness.cjs`
- `git diff --check`

No cloud database, migration history, Supabase configuration, Stripe configuration, secret, Edge Function, deployment, provider request, payment or customer data was accessed or changed.

## Remaining approval boundary

This branch may be committed, pushed and opened as a draft PR. Because it changes a high-risk Billing migration and privilege boundary, the Owner must separately approve marking the PR ready and merging it. Applying the migration anywhere outside the disposable local database remains a later, separate Owner gate.
