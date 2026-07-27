# Tallyo current status

## Product and deployment

- The authenticated invoicing app is feature-complete for its current one-business, one-user scope.
- Public app build `2026.07.23.2` remains deployed on GitHub Pages as the rollback route.
- PR #113 merged release build `2026.07.25.1`. The approved `https://app.tallyo.co.uk` recovery origin is deployed in `mfa-recovery` with JWT verification retained; GitHub Pages and both local development origins remain allowlisted. The custom app domain is active on Cloudflare Pages with SSL and remains protected by Cloudflare Access.
- The separate public website is implemented and privately previewed on Cloudflare Pages, but it is not published on `tallyo.co.uk`.
- PR #91 is merged. The privately tested public AI Helper remains disabled by default. Production AI activation is a separate decision.
- PR #108 merged the fail-closed website subscription signup CTA gate. Subscription controls remain disabled by default; the current website-readiness change routes an enabled Tallyo Pro action to Account settings and adds a separate fail-closed customer-payment publication gate.
- PR #92 is merged. Repository authority is simplified, the approved commercial offer is prepared, and general card-payment claims are qualified for the future multi-business boundary.
- PRs #94, #96 and #98 merged the reviewed Stripe Billing foundation and acceptance preparation.
- PRs #100 and #101 merged the reviewed Stripe Connect onboarding, direct-charge Checkout, connected-refund, signed-webhook and Owner-route-isolation foundations.
- PR #102 merged the commercial provider-foundation evidence and controlled sandbox-acceptance preparation.
- After a completed 2026-07-24 physical backup and explicit Owner approval, the three additive Billing/Connect migrations were applied and the seven new functions were deployed at version 1. RLS, grants, migration history, JWT settings, disabled endpoint behavior and Supabase security advisors pass.
- Stripe Billing sandbox has the approved GBP 8 monthly and GBP 80 annual Prices, a separate Billing event destination, a configured Customer Portal and privately entered rotated test credentials. Billing is enabled only for the Access-protected non-live preview. One synthetic monthly subscription, signed entitlement activation, Portal return, cancellation-at-period-end, duplicate and stale-event handling pass; rollback-only probes cover renewal, failed payment, grace, read-only and recovery.
- PRs #103-#112 completed the reviewed entitlement, Accounts v2 onboarding, Checkout/refund, provider-unavailable and live-Billing readiness work. Two isolated synthetic owners have separate ready sandbox connected accounts with zero live-mode commercial rows. One fictional GBP 1 direct charge, full refund and exact duplicate-event replay passed with signed reconciliation and no duplicate mutation. Evidence: `STRIPE_BILLING_SANDBOX_ACCEPTANCE_EVIDENCE_2026-07-25.md`.
- After the completed 2026-07-25 physical backup and exact Owner approval, migrations `20260725014434` and `20260725160000` were applied. The private database-owner-controlled `subscription_write_enforcement` switch exists and remains `false`; authenticated and service roles cannot change it. The eight approved Billing/entitlement functions are active from merge `2c313f0` with their prior JWT settings preserved. The Owner allowlist was entered privately before the guarded Owner Checkout and document-email sources were activated. Migration history is synchronized and the Supabase security advisor reports no warnings.
- The exact production website and app configurations build successfully with live subscription, connected-payment and AI controls enabled. The website still has no custom domain and builds in preview mode with commercial/AI gates off. The app custom domain is attached only behind Access, and its live Billing UI remains off.
- Under exact Owner approval on 2026-07-26, Stripe live mode now has the approved GBP 8 monthly and GBP 80 annual Tallyo Pro Prices, separate Billing and connected-account webhook destinations, and a configured Customer Portal. The Owner entered the Billing/Connect restricted key and both webhook signing secrets directly into Supabase; their values were not requested, inspected or stored. The five live Billing/Connect server gates are enabled, while the website/app publication gates and `subscription_write_enforcement` remain off. Empty unauthenticated requests to all five protected actions and unsigned requests to both webhook endpoints returned HTTP 401 without creating a Stripe object or transaction.
- PR #117 recorded the completed live provider configuration. Under separate exact approvals, one controlled live monthly subscription completed and has an active provider-derived full entitlement. One isolated synthetic live connected business completed Stripe-hosted onboarding and identity verification; no private identity, banking or payment details were inspected or stored by Codex. PRs #118 and #119 repaired the stale-claim and completion-readback paths. One GBP 1 direct connected-account payment then reconciled through the signed connected-account destination, and one separately approved full GBP 1 refund reconciled exactly once. Synthetic invoice #0002 returned to Sent with GBP 1 outstanding; aggregate readback shows one connected payment, one connected refund, zero net paid, one refund request audit and one refund success audit.

## Implemented capabilities

Invoices, quotes, credit notes, customers, saved items, branded multi-page PDFs, email sending and delivery status, manual payment records, recurring invoices, optional recurring email, opt-in overdue reminders, activity history, account export, responsive/PWA use, Supabase Auth, optional TOTP MFA, recovery codes, global sign-out, RLS, CSP and SRI are implemented and verified for the current app.

## Active production providers

- Supabase: Auth, PostgreSQL/RLS, Edge Functions and scheduled work.
- Resend: transactional document email and delivery events.
- Stripe: controlled Owner-account invoice payments and refunds.
- Cloudflare Turnstile: public Auth abuse protection.
- Cloudflare authoritative DNS, DNSSEC, Access and Pages: protected `app.tallyo.co.uk` release candidate.
- GitHub Pages: current public authenticated app and rollback route.

## Known limitations

- Tallyo is focused invoicing and payment tracking, not bookkeeping, tax filing, payroll, bank reconciliation or a complete accounting system.
- The authenticated frontend remains concentrated in one large `index.html`; incremental modularisation is post-launch technical debt.
- Activity history is useful product evidence, not a tamper-proof audit system.
- Authenticated business records require an internet connection.

## Commercial and payment boundary

- Launch offer: Free Invoice Maker without an account, plus one Tallyo Pro plan at £8 monthly or £80 annually for one business and one user.
- Subscription Checkout is configured server-side for live Stripe mode, and one controlled live monthly acceptance subscription completed with active full access. It remains unavailable to visitors because the app and website publication gates are off and the custom app domain remains behind Access.
- The current live Stripe invoice-payment path belongs to the Owner's controlled Tallyo account. It is not a merchant architecture for unrelated businesses and must not be marketed as generally available.
- Independent-business card payments have an applied schema, accepted multi-account sandbox path, enabled server-side live configuration, one completed live onboarding, one reconciled GBP 1 direct charge and one reconciled full refund. The feature remains publicly unavailable.

## Immediate launch blockers

- Keep `app.tallyo.co.uk` behind Access until the separately approved public-app release. Supabase Auth intentionally retains the GitHub Pages Site URL and rollback redirects; any final Site URL switch or Access removal is a new release approval.
- Prepare and approve the final production app/website build flags, subscription write-enforcement decision, hostname/Auth cutover, Access removal and public release smoke tests. Any further live transaction or refund remains separately approval-gated.
- Configure the production AI Helper variables and existing rate-limiter binding only after separate activation approval.
- Activate the website subscription, customer-payment and AI release gates only after their production provider, budget, notice and release checks are approved.
- Complete final operational checks, approved legal/privacy publication and production release as separate Owner-gated stages.

No current task authorises removing Access, switching the Supabase Site URL, publishing the website, public AI activation, another live Stripe transaction or refund, existing live Owner-route redeployment, legal publication or public launch.
