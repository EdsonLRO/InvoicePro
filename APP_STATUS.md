# Tallyo - Current App Status

This is the short source-of-truth for where Tallyo is right now.

For the authoritative agent hierarchy, task queue, locks, handoffs, model/work-mode routing, and approval boundaries, see `AUTOMATION_MODEL_ORCHESTRATION.md`.
For legally material task triggers, review conditions, and external-professional-advice boundaries, see `TALLYO_LEGAL_COMPLIANCE_AGENT.md`.
For detailed graphical-dashboard and computer-use controls, see `AGENT_HIERARCHY_AND_COMPUTER_USE.md`.
For capability tracking and release gates, see `PRODUCT_COMPLETION_LEDGER.md` and `RELEASE_READINESS.md`.

## Current focus

Finish the existing app and its security hardening before starting the future SaaS website/subscription platform.

The current product is a single-user-per-account invoicing workspace backed by Supabase. It is a real working app and a security-focused portfolio project. It is not yet a public paid SaaS platform.

## Current app stage

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
- Authenticated app-action `audit_events` for selected sensitive actions.
- Supabase Auth, email confirmation, optional TOTP MFA, RLS, CSP, SRI, and server-side secrets.
- Stripe failed-payment, refund, refund-failure, and dispute lifecycle awareness in the webhook.

Still to finish before treating the app as customer-ready:

- Stripe sandbox lifecycle verification is complete for signature rejection, unrelated-event rejection, successful payment/refund replay, a known-payment dispute, and a genuine failed-refund reversal. Live mode remains disabled and approval-gated.
- Review and operationally test the internal chargeback/refund/support procedure in `PAYMENT_OPERATIONS_RUNBOOK.md`; customer-facing policy remains legally blocked.
- Complete at least one Owner-approved timed non-production restore test. Supabase Pro daily-backup evidence is verified through 2026-07-14 in `BACKUP_RESTORE_RUNBOOK.md`.
- Expand append-only audit logging to remaining sensitive actions, privileged automation failures, and backup/restore operations. Company/settings saves are now covered at a privacy-safe category level.
- MFA browser acceptance is complete for fail-closed routing, primary/backup factor lifecycle, primary-specific and backup-specific recovery, wrong-code rejection, and email-only bypass rejection. Robust all-factors-lost recovery remains a paid/public-launch condition.
- Future upgrade to all-devices logout with email-code confirmation and stronger server-side revocation evidence.
- Resolve the recorded Supabase session, SMTP/rate-limit, and abuse-control decisions in `DEFERRED_MANUAL_CONFIGURATION.md`. Leaked-password protection and a verified 12-character provider minimum are enabled; the live advisor was clear on 2026-07-13.
- Complete the blocked legal/privacy actions in `LEGAL_PRIVACY_READINESS.md`. Working records, a preliminary DPIA screening, and a fictional tabletop now exist, but restricted case tooling, public notices, retention/role decisions, verified rights operations, vendor evidence, and external review remain.
- Complete authenticated mobile, long/mobile PDF, and real-browser PWA regression. The deployed public shell already passed desktop and 390x844 overflow checks.
- Documentation/screenshots/portfolio evidence kept in sync with the real app.
- Keep `DECISION_LOG.md`, `PRODUCT_COMPLETION_LEDGER.md`, and `RELEASE_READINESS.md` updated as the app moves toward live readiness.

## Current payment status

Stripe invoice payments are implemented and the handled lifecycle is verified in sandbox, but the feature must still be treated as test/development until explicitly switched to live mode.

Do not send payment links to real customers until:

- Stripe live keys and live webhook secret are configured intentionally.
- The live webhook destination is verified.
- Refund, dispute, failed-payment, and chargeback behavior is tested and documented for the approved live configuration.
- Terms, privacy, refund, and support processes are ready.
- Backup/restore and incident response basics are in place.

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
- Honest activity history wording.

Known limits:

- Activity history is useful, but not tamper-proof.
- `audit_events` now covers provider events and selected sensitive app actions, but it is not a full compliance/SIEM audit system.
- Supabase does not provide recovery codes. Tallyo supports a second authenticator and prevents email-only MFA bypass. AUTH-001 acceptance is Verified. The interim all-factors-lost support response is approved and deny-by-default; robust recovery is still required before paid/public onboarding.
- All-devices logout exists, but a future email-code confirmation flow would be stronger for production account recovery/security UX.
- CSP still has a documented permissive setting because of the current single-file Vue structure.
- Supabase Pro daily backups are verified through 2026-07-14 and the recovery runbook is in place, but a timed restore test and tested privacy/incident operations are not complete.
- The app must not claim GDPR compliance or full security.

## Future SaaS / website phase

The public website, paid subscriptions, plan tiers, teams/workspaces, RBAC, and Tallyo-as-a-SaaS billing are deferred.

They remain valid future goals, but they should not interrupt the current flow:

1. Finish the app.
2. Finish current security hardening.
3. Prepare clean portfolio/security evidence.
4. Then design the SaaS website/subscription architecture as a separate phase.
