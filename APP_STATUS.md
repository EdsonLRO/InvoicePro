# Tallyo - Current App Status

This is the short source-of-truth for where Tallyo is right now.

For the authoritative agent hierarchy, task queue, locks, handoffs, model/work-mode routing, and approval boundaries, see `AUTOMATION_MODEL_ORCHESTRATION.md`.
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

- Complete the remaining Stripe positive-path sandbox tests for a known-payment dispute and genuine failed refund. Signature rejection, unrelated-event rejection, and payment/refund duplicate replay have passed.
- Decide the operational chargeback/refund policy and customer support process.
- Complete at least one Owner-approved timed non-production restore test. Current Supabase Pro daily-backup evidence is verified in `BACKUP_RESTORE_RUNBOOK.md`.
- Expand append-only audit logging to remaining sensitive actions, privileged automation failures, and backup/restore operations. Company/settings saves are now covered at a privacy-safe category level.
- Complete browser acceptance testing of the new fail-closed MFA, backup-authenticator, and password-recovery paths documented in `MFA_RECOVERY_RUNBOOK.md`.
- Future upgrade to all-devices logout with email-code confirmation and stronger server-side revocation evidence.
- Resolve the recorded Supabase server-side password, session, SMTP/rate-limit, and abuse-control decisions in `DEFERRED_MANUAL_CONFIGURATION.md`. Leaked-password protection is enabled and the live advisor was clear on 2026-07-13.
- Privacy policy, terms, retention position, export/deletion process, and breach process.
- Final mobile and PDF regression pass.
- Documentation/screenshots/portfolio evidence kept in sync with the real app.
- Keep `DECISION_LOG.md`, `PRODUCT_COMPLETION_LEDGER.md`, and `RELEASE_READINESS.md` updated as the app moves toward live readiness.

## Current payment status

Stripe invoice payments are implemented for the app flow, but should be treated as test/development until explicitly switched to live mode.

Do not send payment links to real customers until:

- Stripe live keys and live webhook secret are configured intentionally.
- The live webhook destination is verified.
- Refund, dispute, failed-payment, and chargeback behavior is tested and documented in live mode.
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
- Supabase does not provide recovery codes. Tallyo now supports a second authenticator and prevents email-only MFA bypass, but the new recovery paths still need browser acceptance testing and an all-factors-lost support procedure.
- All-devices logout exists, but a future email-code confirmation flow would be stronger for production account recovery/security UX.
- CSP still has a documented permissive setting because of the current single-file Vue structure.
- Supabase Pro daily backups are verified and the recovery runbook is in place, but a timed restore test, privacy operations, and incident response are not complete.
- The app must not claim GDPR compliance or full security.

## Future SaaS / website phase

The public website, paid subscriptions, plan tiers, teams/workspaces, RBAC, and Tallyo-as-a-SaaS billing are deferred.

They remain valid future goals, but they should not interrupt the current flow:

1. Finish the app.
2. Finish current security hardening.
3. Prepare clean portfolio/security evidence.
4. Then design the SaaS website/subscription architecture as a separate phase.
