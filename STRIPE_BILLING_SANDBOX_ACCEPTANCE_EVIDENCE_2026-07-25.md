# Stripe Billing sandbox acceptance evidence — 2026-07-25

## Boundary

This evidence covers the Owner-approved Stripe sandbox and protected-preview acceptance stage. It records no secret values, payment-card data, password or MFA value, private email address, provider payload or customer data.

- Stripe remained in sandbox/test mode.
- The existing Supabase project was used only with the approved non-live Billing gates and synthetic acceptance account.
- The app UI was available only through the Cloudflare Access-protected preview.
- The public website and public subscription controls remained disabled.
- No live Billing or Connect object, real payment, real customer or production AI activation was used.
- Existing live invoice-payment, refund and email functions were not redeployed.

## Provider and deployment state

- The approved GBP 8 monthly and GBP 80 annual Tallyo Pro Prices exist in Stripe sandbox.
- The separate Billing webhook destination has the reviewed ten-event allowlist and verified signed delivery.
- The Stripe Customer Portal is configured for the approved end-of-period cancellation flow.
- The Owner entered the test Billing key and webhook signing secret directly in Supabase. Their values were not requested or inspected.
- `create-billing-checkout`, `create-billing-portal` and `stripe-billing-webhook` are active at version 9 with their existing JWT boundaries.
- Billing is enabled only for the protected non-live acceptance configuration. Stripe live mode and the public website remain disabled.

## Acceptance results

| Control | Result |
|---|---|
| Monthly/annual server Price allowlist and arbitrary input rejection | Passed by focused source harness and reviewed server mapping |
| Authenticated monthly sandbox Checkout | Passed; one synthetic GBP 8 subscription activated |
| Signed webhook entitlement activation | Passed; one customer mapping, subscription and `full` entitlement reconciled |
| Customer Portal ownership and protected-preview return | Passed |
| Cancellation at period end | Passed after correcting Stripe's `cancel_at == current_period_end` representation; access remains `full` through the verified period |
| Duplicate signed event | Passed; one dashboard resend remained HTTP 200 and the atomic RPC reported `duplicate` without a second mutation |
| Older/out-of-order event | Passed; the event was recorded `stale` and did not roll back the active entitlement |
| Renewal, payment failure, seven-day grace, `unpaid` read-only and payment recovery | Passed with rollback-only database lifecycle probes; the real accepted subscription state was restored unchanged |
| Cross-tenant Billing visibility and service-role privilege boundary | Passed in focused local and retained regression probes |
| Secret scan | Passed; no Stripe key or webhook-secret pattern exists in the evidence or focused test sources |

The actual Stripe subscription remains scheduled to cancel at the verified period end. It was not deleted or manually rewritten.

## Finding and correction candidate

The acceptance review found that the five core application tables still use ownership-only write RLS. The protected UI cannot grant entitlement, but restricted/read-only access is not yet a complete server boundary.

Draft PR #103 now includes, but does not apply or deploy:

- migration `20260725014434_enforce_subscription_write_entitlements.sql`;
- an authenticated identity-bound private helper that reveals no other account identifier;
- write-policy enforcement for `company_settings`, `customers`, `saved_items`, `invoices` and `recurring_templates`;
- service-side guards for document email, reminders, recurring generation, new invoice Checkout and Connect onboarding/Checkout;
- deliberate continued availability of refunds and signed provider reconciliation;
- PostgreSQL 17 probes for missing, `full`, `grace`, `read_only`, expired and cross-tenant states.

The disposable PostgreSQL 17 container passed all probes and was removed. The migration remains unapplied and the changed existing functions remain undeployed pending reviewed PR and exact Owner approval.

## Residual gates

1. Required PR checks and focused security review must pass.
2. Owner approval is required before marking the high-risk PR ready or merging it.
3. Applying the entitlement migration requires a reviewed deployment plan and rollback.
4. Redeploying existing live Checkout or email functions requires the exact function list, reason, evidence, rollback and availability confirmation immediately before deployment.
5. The focused Connect Checkout account-refresh correction, its reviewed deployment and two-account synthetic acceptance remain pending.
6. Live Billing/Connect, public subscription controls, public AI, DNS and public release remain separately gated.

## Connect onboarding diagnostic addendum

PR #106 merged the indexed Accounts v2 retrieval correction and only `manage-stripe-connect` was redeployed under exact approval. The subsequent protected synthetic request had a valid authenticated session, reached the function, retrieved the existing sandbox connected account and then received a controlled HTTP 502 after Stripe rejected the Account Links v2 request. Stripe's privacy-safe diagnostic stated that `account_update` is not valid for this not-yet-onboarded account and that `account_onboarding` is the accepted flow.

The focused correction derives the Account Link flow from trusted provider state. Non-active accounts use `account_onboarding`, including accounts currently reported as restricted while initial requirements are outstanding; `account_update` is reserved for an account already in the active state. The browser also requests onboarding consistently for every non-active state. Auth, MFA, entitlement, ownership, mode, return-URL and live-approval gates remain unchanged.

PR #107 passed its required checks, merged as `71e92fa` and was reconciled before deployment. Only `manage-stripe-connect` advanced from version 18 to 19, JWT verification remained enabled and all 16 other function versions and JWT settings were unchanged. No migration was applied. The single approved protected retry opened Stripe-hosted sandbox onboarding, and Stripe recorded HTTP 200 for Account Links v2. The Owner-private form fields were not inspected or changed. Onboarding completion, the second isolated account, connected payment/refund and remaining failure/replay acceptance are still pending.

The Owner subsequently completed the first synthetic account's Stripe-hosted onboarding privately. The protected app then reported both card payments and payouts ready. A fictional GBP 1 invoice was created with no real customer data. Its direct-charge request reached deployed `create-connect-checkout` version 15 and returned a controlled HTTP 502 before any Stripe Checkout page, payment or refund was created. Source reconciliation found that the shared `refreshActiveAccount` helper still used obsolete `include[]` query names even though Accounts v2 requires `include[0]`, `include[1]` and `include[2]`. The focused source-and-test correction is prepared; deployment remains separately gated.
