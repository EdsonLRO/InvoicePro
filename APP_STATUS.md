# Tallyo - Current App Status

This is the short source-of-truth for where Tallyo is right now.

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
- Recurring invoices with server-side scheduled generation.
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

- Finish Stripe replay testing for refund-failure, failed/asynchronous payment, and dispute events in sandbox.
- Decide the operational chargeback/refund policy and customer support process.
- Formal backup and restore plan, with at least one restore test.
- Expand append-only audit logging to remaining sensitive actions, privileged automation failures, and backup/restore operations.
- MFA recovery/backup codes or a documented recovery process.
- Password-strength and breached-password checks where supported.
- Privacy policy, terms, retention position, export/deletion process, and breach process.
- Final mobile and PDF regression pass.
- Documentation/screenshots/portfolio evidence kept in sync with the real app.

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
- Real email confirmation.
- Optional TOTP MFA.
- Database-enforced Row Level Security.
- Public keys only in the browser; secrets stay server-side.
- Edge Functions for privileged email, recurring, and Stripe work.
- Signed Resend and Stripe webhooks.
- CSP, SRI, and self-hosted Tailwind.
- Honest activity history wording.

Known limits:

- Activity history is useful, but not tamper-proof.
- `audit_events` now covers provider events and selected sensitive app actions, but it is not a full compliance/SIEM audit system.
- MFA is implemented, but recovery codes and stronger recovery procedures are not finished.
- CSP still has a documented permissive setting because of the current single-file Vue structure.
- Formal backups, restore testing, privacy operations, and incident response are not complete.
- The app must not claim GDPR compliance or full security.

## Future SaaS / website phase

The public website, paid subscriptions, plan tiers, teams/workspaces, RBAC, and Tallyo-as-a-SaaS billing are deferred.

They remain valid future goals, but they should not interrupt the current flow:

1. Finish the app.
2. Finish current security hardening.
3. Prepare clean portfolio/security evidence.
4. Then design the SaaS website/subscription architecture as a separate phase.
