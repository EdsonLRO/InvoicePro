# Tallyo current status

## Product and deployment

- The authenticated invoicing app is feature-complete for its current one-business, one-user scope.
- Public app build `2026.07.23.2` is deployed on GitHub Pages. An Access-protected Cloudflare app preview is also available.
- The separate public website is implemented and privately previewed on Cloudflare Pages, but it is not published on `tallyo.co.uk`.
- PR #91 is merged. The privately tested public AI Helper remains disabled by default. Production AI activation is a separate decision.
- PR #92 is merged. Repository authority is simplified, the approved commercial offer is prepared, and general card-payment claims are qualified for the future multi-business boundary.
- PRs #94, #96 and #98 merged the reviewed Stripe Billing foundation and acceptance preparation.
- PRs #100 and #101 merged the reviewed Stripe Connect onboarding, direct-charge Checkout, connected-refund, signed-webhook and Owner-route-isolation foundations.
- After a completed 2026-07-24 physical backup and explicit Owner approval, the three additive Billing/Connect migrations were applied and the seven new functions were deployed at version 1. RLS, grants, migration history, JWT settings, disabled endpoint behavior and Supabase security advisors pass.
- Billing and Connect remain unavailable: no commercial feature gate, provider secret, Stripe Product/Price, event destination, Customer Portal, connected account or live-release gate is configured. Existing live invoice-payment, refund and email functions were not redeployed.

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
- Subscription checkout is not active. The Billing schema and disabled functions now exist in Supabase, but no Stripe Product, Price, Customer Portal, secret, feature gate, subscription or active entitlement exists.
- The current live Stripe invoice-payment path belongs to the Owner's controlled Tallyo account. It is not a merchant architecture for unrelated businesses and must not be marketed as generally available.
- Independent-business card payments now have an applied schema and disabled function foundation, but remain unavailable until separate Stripe sandbox configuration, synthetic multi-account acceptance and production release approvals pass.

## Immediate launch blockers

- The disabled Billing/Connect provider foundation is deployed. Configuring Stripe sandbox Products/Prices, event destinations, secrets and feature gates, then running controlled synthetic subscription and multi-account payment acceptance, is the next High-risk Owner gate.
- Existing Owner-route source changes remain undeployed until an exact `STRIPE_OWNER_USER_ID` is entered without exposing it and the affected live functions receive a separate deployment approval.
- Complete domain/DNS, final operational checks, approved legal/privacy publication and production release as separate Owner-gated stages.

No current task authorises public AI activation, provider secret changes, Stripe Billing/Connect activation, DNS cutover, legal publication or public launch.
