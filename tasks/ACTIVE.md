# Active programme

Objective: BILL-001 implemented a disabled-by-default, test-mode-only Stripe Billing repository foundation for Tallyo Pro without applying a migration, configuring providers or secrets, deploying functions, making a payment, enabling checkout or publishing a release.
Status: Completed through merged PR #94.
Branch: `main` at merge commit `01d51ba77412eaae10bf24fc786dbc9ec684b251`.
Risk: High implementation completed under Payments, Supabase/backend, Security/Privacy and QA review.
Completed: Owner-scoped read RLS; service-role-only writes; composite account/customer ownership; atomic, append-only and out-of-order-safe event reconciliation; provider-derived entitlements; monthly/annual server Price allowlisting; confirmed Auth and MFA assurance; disabled/test-mode gates; separate Checkout, Portal and signed webhook functions; invoice-payment isolation; focused CI and evidence.
Runtime state: Migration unapplied; three Billing functions undeployed; Stripe products, Prices, secrets, webhook and Portal unconfigured; app write policies not connected to Billing; public checkout disabled.
Validation: GitHub `verify` and both protected Cloudflare preview checks passed on the final PR head. Focused Billing, invoice-payment isolation, dependency, workflow, tenant-attribution, Deno format/type, website fail-closed, secret-scan and diff checks passed. Evidence is in `STRIPE_BILLING_TEST_FOUNDATION_EVIDENCE_2026-07-24.md`.
Remaining: None within BILL-001. Applying the migration, configuring Stripe test mode, deploying functions, connecting write enforcement and conducting test Checkout/webhook/Portal acceptance form a separate High-risk programme.
Owner-only actions: Any migration application; Stripe product/Price, Portal, webhook or secret configuration; function deployment; Stripe request/payment; Billing activation; public checkout; production configuration or release.
Next action: Select and explicitly approve the isolated Stripe Billing test-environment application and acceptance stage. Keep High mode for that work.

## Lock

- Assigned role: Master Orchestrator, with Payments, Supabase/backend, Security/Privacy and QA responsibilities performed sequentially.
- Files or paths locked: Billing migration, Billing Edge Functions, focused tests and Billing authority/evidence.
- Lock acquired: 2026-07-24.
- Lock released: 2026-07-24 after PR #94 merged with all required checks passing.
