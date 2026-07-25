# Tallyo current status

## Product and deployment

- The authenticated invoicing app is feature-complete for its current one-business, one-user scope.
- Public app build `2026.07.23.2` is deployed on GitHub Pages. An Access-protected Cloudflare app preview is also available.
- The separate public website is implemented and privately previewed on Cloudflare Pages, but it is not published on `tallyo.co.uk`.
- PR #91 is merged. The privately tested public AI Helper remains disabled by default. Production AI activation is a separate decision.
- PR #108 merged the fail-closed website subscription signup CTA gate. Subscription controls remain disabled by default; the current website-readiness change routes an enabled Tallyo Pro action to Account settings and adds a separate fail-closed customer-payment publication gate.
- PR #92 is merged. Repository authority is simplified, the approved commercial offer is prepared, and general card-payment claims are qualified for the future multi-business boundary.
- PRs #94, #96 and #98 merged the reviewed Stripe Billing foundation and acceptance preparation.
- PRs #100 and #101 merged the reviewed Stripe Connect onboarding, direct-charge Checkout, connected-refund, signed-webhook and Owner-route-isolation foundations.
- PR #102 merged the commercial provider-foundation evidence and controlled sandbox-acceptance preparation.
- After a completed 2026-07-24 physical backup and explicit Owner approval, the three additive Billing/Connect migrations were applied and the seven new functions were deployed at version 1. RLS, grants, migration history, JWT settings, disabled endpoint behavior and Supabase security advisors pass.
- Stripe Billing sandbox has the approved GBP 8 monthly and GBP 80 annual Prices, a separate Billing event destination, a configured Customer Portal and privately entered rotated test credentials. Billing is enabled only for the Access-protected non-live preview. One synthetic monthly subscription, signed entitlement activation, Portal return, cancellation-at-period-end, duplicate and stale-event handling pass; rollback-only probes cover renewal, failed payment, grace, read-only and recovery.
- PR #103 merged the unapplied entitlement-enforcement migration and server guards; the migration and existing live Owner-route functions remain untouched. PRs #104-#110 completed the reviewed Accounts v2 onboarding, Checkout/refund retrieval and provider-unavailable corrections. Two isolated synthetic owners have separate ready sandbox connected accounts with zero live-mode commercial rows. One fictional GBP 1 direct charge, full refund and exact duplicate-event replay passed with signed reconciliation and no duplicate mutation. Under exact approval, only `create-connect-checkout` and `create-connect-refund` were advanced from merge `0e390eb` to versions 17 and 16 with JWT verification retained; existing live Checkout, refund and email functions remained unchanged. Evidence: `STRIPE_BILLING_SANDBOX_ACCEPTANCE_EVIDENCE_2026-07-25.md`.

## Implemented capabilities

Invoices, quotes, credit notes, customers, saved items, branded multi-page PDFs, email sending and delivery status, manual payment records, recurring invoices, optional recurring email, opt-in overdue reminders, activity history, account export, responsive/PWA use, Supabase Auth, optional TOTP MFA, recovery codes, global sign-out, RLS, CSP and SRI are implemented and verified for the current app.

## Active production providers

- Supabase: Auth, PostgreSQL/RLS, Edge Functions and scheduled work.
- Resend: transactional document email and delivery events.
- Stripe: controlled Owner-account invoice payments and refunds.
- Cloudflare Turnstile: public Auth abuse protection.
- GitHub Pages: current public authenticated app.

## Known limitations

- Tallyo is focused invoicing and payment tracking, not bookkeeping, tax filing, payroll, bank reconciliation or a complete accounting system.
- The authenticated frontend remains concentrated in one large `index.html`; incremental modularisation is post-launch technical debt.
- Activity history is useful product evidence, not a tamper-proof audit system.
- Authenticated business records require an internet connection.

## Commercial and payment boundary

- Launch offer: Free Invoice Maker without an account, plus one Tallyo Pro plan at £8 monthly or £80 annually for one business and one user.
- Subscription checkout is active only in the protected sandbox acceptance preview. It is not available on the public website or in live Stripe mode.
- The current live Stripe invoice-payment path belongs to the Owner's controlled Tallyo account. It is not a merchant architecture for unrelated businesses and must not be marketed as generally available.
- Independent-business card payments have an applied schema and accepted multi-account sandbox path, but remain publicly unavailable until live Stripe Connect configuration and production release approvals pass.

## Immediate launch blockers

- Apply the reviewed subscription-entitlement migration and deploy its affected server guards only through a separate exact approval and rollback plan.
- Complete live Stripe Billing/Connect configuration and controlled live acceptance only through separate exact payment approvals.
- Activate the website subscription, customer-payment and AI release gates only after their production provider, budget, notice and release checks are approved.
- Existing Owner-route source changes remain undeployed until an exact `STRIPE_OWNER_USER_ID` is entered without exposing it and the affected live functions receive a separate deployment approval.
- Complete domain/DNS, final operational checks, approved legal/privacy publication and production release as separate Owner-gated stages.

No current task authorises public AI activation, live Stripe Billing/Connect configuration, existing live Owner-route redeployment, DNS cutover, legal publication or public launch.
