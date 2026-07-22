# Tallyo - Current App Status

This is the short source-of-truth for where Tallyo is right now.

For the authoritative agent hierarchy, task queue, locks, handoffs, model/work-mode routing, and approval boundaries, see `AUTOMATION_MODEL_ORCHESTRATION.md`.
For legally material task triggers, review conditions, and external-professional-advice boundaries, see `TALLYO_LEGAL_COMPLIANCE_AGENT.md`.
For detailed graphical-dashboard and computer-use controls, see `AGENT_HIERARCHY_AND_COMPUTER_USE.md`.
For capability tracking and release gates, see `PRODUCT_COMPLETION_LEDGER.md` and `RELEASE_READINESS.md`.

## Current focus

Keep the verified invoicing app stable while building the separate public website and free tools through isolated, risk-routed stages. Public website launch, Cloudflare production configuration, DNS and unrestricted onboarding remain separately gated.

**Closed handoff:** `tasks/AUTH-002_THREAD_HANDOFF_2026-07-17.md` records the four completed MFA recovery acceptance gates, Owner approval, merged PR #44, and verified controlled test/portfolio publication.

**Closed functional release:** `tasks/FUNC-READY-002_PUBLIC_SELF_SERVICE_CLOSEOUT_2026-07-18.md` records the clean synthetic journey, focused customer/item validation, expanded refund consequence matrix, exact Owner approval, merged PR #68, successful post-merge security/Pages runs, and verified public build `2026.07.18.9`.

**Closed UX release:** `tasks/UX-001_CUSTOMER_FRIENDLY_RESPONSIVE_UI_2026-07-18.md` records responsive navigation and customer-facing status improvements, exact Owner approval, merged PR #72, successful post-merge security/Pages runs, and verified public build `2026.07.18.10`.

**Closed account-copy release:** `tasks/UX-002_CUSTOMER_FRIENDLY_COPY_2026-07-19.md` records removal of the customer-facing status panel, clearer account and workflow wording, exact Owner approval, merged PR #74, successful post-merge security/Pages runs, and verified public build `2026.07.19.1`.

**Closed website-foundation/app-brand release:** `tasks/WEB-001_PUBLIC_WEBSITE_PROGRAMME_2026-07-22.md` records the merged PR #76–#83 programme foundation, shared Owner-approved Tallyo branding, exact release approval, passed required/post-merge security runs, successful GitHub Pages deployment and verified public app build `2026.07.22.2`. The separate public website was not launched.

**Closed free-document-generator release:** `tasks/WEB-002_FREE_DOCUMENT_GENERATOR_2026-07-22.md` records the reviewed browser-only generator merged in PR #84. It is present in source, but the separate public website remains unpublished.

**Active Cloudflare preview task:** `tasks/WEB-003_CLOUDFLARE_PRIVATE_PREVIEW_2026-07-22.md` records the repository-scoped GitHub integration and two free Pages projects. Their initial builds stopped at the fail-closed guard and neither project has a production deployment. Wildcard preview restriction now reports enabled on both projects, while main `pages.dev` Access is blocked on private Zero Trust billing activation. Deployment variables, custom domains, DNS and any successful deployment remain separately gated.

The current product is a single-user-per-account invoicing workspace backed by Supabase. It is a real working app and a security-focused portfolio project. It is not yet a public paid SaaS platform.

## Current app stage

**Current invoicing-app scope:** feature-complete and regression-verified on public build `2026.07.22.2`, with controlled live Stripe invoice payments activated and acceptance-tested. This functional activation is not a legal-compliance or unrestricted customer-onboarding approval; the remaining legal, privacy and operational conditions below still apply.

Implemented:

- Invoices, quotes, and credit notes.
- Customers and saved items.
- Manual payments and Stripe-confirmed invoice payments.
- Stripe Checkout payment links for full balance and seller-approved deposits.
- In-app Stripe refund requests through a server-side Edge Function.
- Recurring invoices with authenticated, per-occurrence-idempotent server-side scheduled generation.
- Resend email sending for documents and overdue reminders.
- Signed Resend webhook delivery tracking.
- Per-invoice opt-in overdue reminder automation.
- Branded PDF invoices and email PDF attachments.
- Activity history for documents and recurring schedules.
- Provider-backed `audit_events` for email and Stripe events.
- Authenticated app-action `audit_events` for selected sensitive actions, including manual payment recording/removal and manual document-status changes.
- RLS-scoped account data export to structured JSON, created locally in the signed-in user's browser with minimised Auth metadata and no new server-side export copy.
- Versioned PWA app-shell updates with network-first refresh, offline login-shell fallback, and an observable build marker. Existing-install update acceptance passed for build `2026.07.16.1`.
- Supabase Auth, email confirmation, optional TOTP MFA, RLS, CSP, SRI, and server-side secrets.
- Active Cloudflare Turnstile protection for public sign-up, password sign-in, and reset requests, with exact-origin CSP, a public production Site Key, an explicit rollback switch, Supabase enforcement, and focused/live acceptance.
- Stripe failed-payment, refund, refund-failure, and dispute lifecycle awareness in the webhook.
- Public build `2026.07.22.2` retains the verified functional/UX baseline and adds the customer-facing Help/install integration plus the shared folded blue-and-mint Tallyo identity across website, app and PWA artwork. Required security run `29922330142`, post-merge security run `29922434061`, Pages run `29922431260`, and HTTPS build/service-worker/brand-asset readback passed.

Still to finish before treating the app as customer-ready:

- The authenticated live refund procedure is operationally verified. Continue the separate chargeback/support exercises; customer-facing policy remains legally blocked.
- The Owner-approved non-production restore test passed on 2026-07-15. The isolated temporary project was deleted after approval and production remained healthy; evidence is in `BACKUP_RESTORE_TEST_EVIDENCE_2026-07-15.md`.
- Expand append-only audit logging to remaining sensitive actions and operational monitoring. Recurring-generation failures and overdue-reminder provider/history failures now have privacy-safe evidence; company/settings saves are covered at a category level, while backup/restore evidence remains a separate controlled record.
- MFA browser acceptance is complete for fail-closed routing, primary/backup factor lifecycle, primary-specific and backup-specific recovery, wrong-code rejection, and email-only bypass rejection. The all-factors-lost backend is deployed and has passed boundary, privilege, AAL, rolled-back RLS, authenticated lifecycle, audit-minimisation, rollback-only live-throttling, notification-delivery/minimisation, and real-Android recovery acceptance. A mobile recovery-code modal clipping issue was corrected and retested on the phone. After explicit Owner approval, PR #44 merged and the controlled test/portfolio frontend was published successfully. External UK legal/privacy review remains required before paid/public onboarding.
- Future upgrade to all-devices logout with email-code confirmation and stronger server-side revocation evidence.
- Resolve the remaining Supabase SMTP/rate-limit and abuse-control decisions in `DEFERRED_MANUAL_CONFIGURATION.md`. Leaked-password protection and a verified 12-character provider minimum are enabled. Graceful unexpected-session expiry handling is implemented, harness-tested, merged, and present in the public deployment. The Owner-approved 7-day session timebox and 24-hour inactivity timeout were enabled and read back from production on 2026-07-15; the one-hour JWT lifetime, refresh rotation, and multi-device sessions remain unchanged.
- Production Turnstile activation completed on 2026-07-18 for `edsonlro.github.io`. The public Site Key is published, the Owner entered the secret privately in Supabase Auth, and enforcement is active. Live signup, confirmation, password sign-in, local sign-out, password-reset delivery, fresh challenge creation and the same-tab sign-out rerender pass on build `2026.07.18.8`; PRs #65 and #66, their required checks, both Pages deployments, and `TURNSTILE_PRODUCTION_ACCEPTANCE_2026-07-18.md` record the evidence. The secret is not stored in Tallyo. Rollback must disable Supabase CAPTCHA first, then disable and publish the frontend switch.
- The account-holder export and JWT-protected `log-app-event` v7 are deployed. Controlled desktop/mobile acceptance and corrected production event readback are Verified. Complete the separate blocked legal/privacy actions in `LEGAL_PRIVACY_READINESS.md`: restricted case tooling, public notices, retention/role decisions, correction/deletion/provider-assistance operations, vendor evidence, and external review.
- Documentation/screenshots/portfolio evidence kept in sync with the real app.
- Keep `DECISION_LOG.md`, `PRODUCT_COMPLETION_LEDGER.md`, and `RELEASE_READINESS.md` updated as the app moves toward live readiness.

## Current payment status

Stripe invoice payments are implemented, live mode is active, and the minimum controlled live-payment path is verified. The public GitHub Pages configuration now selects live mode, while the server-side kill switch, signed webhook validation, mode matching, idempotency and atomic invoice/audit settlement remain enforced.

Completed functional activation:

- The Owner entered the live provider credentials directly in Supabase; value-free readback confirmed the required configuration names.
- The PAY-LIVE-001 migration and matching Edge Functions were reviewed, deployed in order, and replay-verified in sandbox.
- The active live webhook destination is pinned to the reviewed API version and only the eleven handled events.
- A fictional GBP 1.00 live Checkout recorded one payment, Paid status, zero balance and the expected append-only audit evidence.
- The same acceptance payment was later refunded in full through Tallyo after separate approval. Signed webhook processing recorded one negative GBP 1.00 refund plus one request and one success audit, reopened the invoice to Sent, and restored the GBP 1.00 balance.
- Refund-acceptance evidence PR #56 merged as `ad90c9e` after its required check passed.
- PAY-LIVE-003 found that the first automatic refund receipt was not delivered because Checkout did not attach the charge to a Stripe Customer. PR #70 added Stripe Customer creation without future card saving, rotated Checkout idempotency after reconciled financial events, passed its required check, merged as `31829e1`, and deployed only the two reviewed Checkout-producing Edge Functions. A second separately approved GBP 1.00 payment/refund cycle reconciled without duplicates, and the Owner confirmed that Stripe delivered the automatic refund receipt with a customer-facing reference. No inbox content, address or reference value was inspected or recorded; Tallyo does not send a duplicate Resend refund email.
- PR #54 merged after its required check passed; GitHub Pages serves `window.STRIPE_LIVE_MODE=true` over HTTPS with no live-secret pattern in the public file.

Still separately gated: each future refund, any real-customer link/email outside the provider receipt that follows an approved refund, legal/privacy publication, and unrestricted public onboarding. The Owner may use the now-functional live app directly within those retained boundaries.

## Current email status

Email sending is implemented through Resend and Supabase Edge Functions.

Current email automation is intentionally opt-in:

- Recurring invoice auto-email is enabled per recurring schedule.
- Overdue reminder automation is enabled per invoice.
- Company settings provide defaults only; they do not globally email every overdue invoice.

## Security posture summary

Strong controls already implemented:

- Supabase Auth with server-side password hashing.
- Supabase leaked-password protection, checked server-side against known breach data.
- A 12-character Supabase Auth provider minimum aligned with the client-side rule.
- Real email confirmation.
- Optional TOTP MFA with fail-closed assurance checks and support for one backup authenticator.
- Explicit local logout and all-devices logout, with password confirmation and MFA when required for all-devices logout.
- Database-enforced Row Level Security.
- Public keys only in the browser; secrets stay server-side.
- Edge Functions for privileged email, recurring, and Stripe work.
- Vault-backed scheduler authentication for recurring and overdue automation; the privileged recurring endpoint rejects unsigned calls.
- Signed Resend and Stripe webhooks.
- CSP, SRI, and self-hosted Tailwind.
- All ten repository Edge Functions, including deployed `mfa-recovery` version 1, pin `@supabase/supabase-js` to exact version `2.110.1`; production currently has ten active functions.
- A read-only GitHub Actions security gate uses immutable action commit SHAs, exact Deno `2.2.15` LTS, and per-function frozen dependency locks. It type-checks all ten repository functions and runs the focused security harnesses without repository write permission or secrets.
- Honest activity history wording.

Known limits:

- Activity history is useful, but not tamper-proof.
- `audit_events` now covers provider events and selected sensitive app actions, including manual financial-state changes, but it is not a full compliance or SIEM audit system.
- Supabase does not provide native recovery codes. Tallyo supports backup authenticators and its own one-time recovery-code flow without permitting email-only MFA bypass. AUTH-001 and AUTH-002 acceptance are Verified for the controlled test/portfolio stage. Paid/public onboarding remains subject to the separate legal, privacy, provider, and launch gates.
- All-devices logout exists, but a future email-code confirmation flow would be stronger for production account recovery/security UX.
- CSP still has a documented permissive setting because of the current single-file Vue structure.
- Supabase Pro daily backups and one isolated timed restore are verified. Complete service recovery still needs manual Auth/provider reconfiguration, and tested privacy/incident operations remain unfinished.
- The app must not claim GDPR compliance or full security.

## Future SaaS / website phase

The public website, paid subscriptions, plan tiers, teams/workspaces, RBAC, and Tallyo-as-a-SaaS billing are deferred.

They remain valid future goals, but they should not interrupt the current flow:

1. Finish the app.
2. Finish current security hardening.
3. Prepare clean portfolio/security evidence.
4. Then design the SaaS website/subscription architecture as a separate phase.
