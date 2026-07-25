# Tallyo current status

## Product and deployment

- The authenticated invoicing app is feature-complete for its current one-business, one-user scope.
- Public app build `2026.07.23.2` is deployed on GitHub Pages. An Access-protected Cloudflare app preview is also available.
- The separate public website is implemented and privately previewed on Cloudflare Pages, but it is not published on `tallyo.co.uk`.
- PR #91 is merged. The privately tested public AI Helper remains disabled by default. Production AI activation is a separate decision.
- PR #92 is merged. Repository authority is simplified, the approved commercial offer is prepared, and general card-payment claims are qualified for the future multi-business boundary.
- PRs #94, #96 and #98 merged the reviewed Stripe Billing foundation and acceptance preparation.
- PRs #100 and #101 merged the reviewed Stripe Connect onboarding, direct-charge Checkout, connected-refund, signed-webhook and Owner-route-isolation foundations.
- PR #102 merged the commercial provider-foundation evidence and controlled sandbox-acceptance preparation.
- After a completed 2026-07-24 physical backup and explicit Owner approval, the three additive Billing/Connect migrations were applied and the seven new functions were deployed at version 1. RLS, grants, migration history, JWT settings, disabled endpoint behavior and Supabase security advisors pass.
- Stripe Billing sandbox has the approved GBP 8 monthly and GBP 80 annual Prices, a separate Billing event destination, a configured Customer Portal and privately entered rotated test credentials. Billing is enabled only for the Access-protected non-live preview. One synthetic monthly subscription, signed entitlement activation, Portal return, cancellation-at-period-end, duplicate and stale-event handling pass; rollback-only probes cover renewal, failed payment, grace, read-only and recovery.
- PR #103 merged the unapplied entitlement-enforcement migration and server guards. Only `manage-stripe-connect` and `create-connect-checkout` were then deployed under exact approval; the entitlement migration and existing live functions remain untouched. The Owner privately configured the Connect key and webhook secret, the four sandbox gates are enabled, and live mode remains disabled. PRs #104-#106 corrected the Accounts v2 payout request, UK country and indexed retrieval parameters. PR #107 then corrected the trusted server-state Account Link flow and was merged as `71e92fa`; only `manage-stripe-connect` advanced from version 18 to 19 with JWT verification retained and every other function unchanged. The protected retry opened Stripe-hosted sandbox onboarding and Stripe recorded HTTP 200 for Account Links v2. Owner-private onboarding completion, the second isolated synthetic account, Connect payment/refund and failure/replay acceptance remain pending. Evidence: `STRIPE_BILLING_SANDBOX_ACCEPTANCE_EVIDENCE_2026-07-25.md`.

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
- Independent-business card payments now have an applied schema and disabled function foundation, but remain unavailable until separate Stripe sandbox configuration, synthetic multi-account acceptance and production release approvals pass.

## Immediate launch blockers

- Review, merge, apply and deploy the focused server-side restricted/read-only enforcement only through its remaining high-risk approval gates.
- Complete the Owner-private first Stripe-hosted onboarding form, then the approved synthetic multi-account Connect payment/refund and failure/replay acceptance.
- Existing Owner-route source changes remain undeployed until an exact `STRIPE_OWNER_USER_ID` is entered without exposing it and the affected live functions receive a separate deployment approval.
- Complete domain/DNS, final operational checks, approved legal/privacy publication and production release as separate Owner-gated stages.

No current task authorises public AI activation, live Stripe Billing/Connect configuration, existing live Owner-route redeployment, DNS cutover, legal publication or public launch.
