# Tallyo current status

## Product and deployment

- The authenticated invoicing app is feature-complete for its current one-business, one-user scope.
- Public app build `2026.07.23.2` is deployed on GitHub Pages. An Access-protected Cloudflare app preview is also available.
- The separate public website is implemented and privately previewed on Cloudflare Pages, but it is not published on `tallyo.co.uk`.
- PR #91 is merged. The privately tested public AI Helper remains disabled by default. Production AI activation is a separate decision.
- PR #92 is merged. Repository authority is simplified, the approved commercial offer is prepared, and general card-payment claims are qualified for the future multi-business boundary.
- PR #94 is merged. The Stripe Billing test foundation is repository-only: its migration remains unapplied, its three Edge Functions remain undeployed, no provider settings exist, and Checkout remains disabled.
- PR #96 is merged. The Billing migration passed disposable PostgreSQL 17.6 RLS, privilege, ownership, replay, rollback and entitlement probes; its service-role-only RPCs now use caller privileges. This did not apply or deploy Billing.
- BILL-003 repository preparation adds one service-only Checkout claim per account, current-provider subscription verification, signed lifecycle cleanup, repeatable local claim probes and an isolated test-acceptance runbook. It does not apply or deploy anything, and public Checkout remains disabled.

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
- Subscription checkout is not active. No Stripe Billing product or price exists, and no Billing migration, function or entitlement is active in Supabase.
- The current live Stripe invoice-payment path belongs to the Owner's controlled Tallyo account. It is not a merchant architecture for unrelated businesses and must not be marketed as generally available.
- Independent Tallyo businesses will require a separate Stripe Connect programme before public card-payment links can be offered.

## Immediate launch blockers

- The repository and disposable-local Billing review is complete. Applying the migration, configuring test-mode Stripe, deploying functions and running a controlled test Checkout remain separate High-risk Owner gates.
- Design, implement and verify Stripe Connect separately before public business payment claims.
- Complete domain/DNS, final operational checks, approved legal/privacy publication and production release as separate Owner-gated stages.

No current task authorises public AI activation, provider secret changes, Stripe Billing/Connect activation, DNS cutover, legal publication or public launch.
