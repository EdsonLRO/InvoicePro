# ROADMAP_EMAIL_PAYMENTS.md - Tallyo

Current roadmap and status for customer email, reminders, and Stripe invoice payments in the existing app.

This is a working implementation note, not a compliance claim. Do not put API keys, webhook secrets, or live credentials in this file.

Current boundary: this document covers invoice/customer payment features inside the current Tallyo app. It does not cover future Tallyo SaaS subscription billing, plan tiers, teams, RBAC, or the public marketing website.

## Current status

### Email

- Done: Resend sending domain `mail.tallyo.co.uk`.
- Done: manual document email via `send-document-email`.
- Done: PDF attachment in document emails.
- Done: signed Resend webhook receiver `resend-webhook`.
- Done: delivery, failure, bounce, complaint, open, click, and received events are stored in `audit_events`.
- Done: invoice list and activity history show email status.
- Done: manual overdue reminder email through `send-reminder-email`.
- Done: recurring invoices can auto-email generated invoices when the schedule is opted in.
- Done: overdue reminder automation is opt-in per invoice, with per-invoice cadence and maximum-reminder settings.

### Payments

- Done: Stripe Checkout session creation via `create-stripe-checkout`.
- Done: invoice emails can include Stripe payment links.
- Done: seller-approved deposits are supported in email payment links.
- Done: customers cannot choose arbitrary partial-payment amounts.
- Done: signed Stripe webhook receiver `stripe-webhook`.
- Done: Stripe-confirmed payments are recorded on the invoice and locked from manual removal.
- Done: in-app Stripe refund requests through `create-stripe-refund`.
- Done: Stripe webhook hardening checks the signature, explicit test/live mode, event type, invoice/user metadata, Tallyo-created checkout audit event, amount, currency, and duplicate events.
- Done: Stripe async payment failure, refund, refund-failure, and dispute lifecycle awareness.
- Done: successful Stripe refunds are recorded as locked negative payment entries and can reopen the invoice balance.
- Done: Stripe sandbox webhook destination is subscribed to the 11 events Tallyo currently handles.
- Current caveat: Stripe should still be treated as test/development unless live mode is explicitly approved and configured.

## Required deploy/setup checks

Database:

- `supabase/audit_events.sql` must be applied.
- `supabase/recurring_email_enabled.sql` must be applied before recurring auto-email is used.
- `supabase/invoice_overdue_reminders.sql` must be applied before per-invoice overdue reminder settings are used.
- `supabase/invoice_payment_options.sql` must be applied before seller-approved deposit settings are used.

Edge Functions:

- `send-document-email`
- `resend-webhook`
- `send-reminder-email`
- `send-overdue-reminders`
- `generate-recurring`
- `create-stripe-checkout`
- `create-stripe-refund`
- `stripe-webhook`

Stripe webhook destination events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `refund.created`
- `refund.updated`
- `refund.failed`
- `charge.dispute.created`
- `charge.dispute.updated`
- `charge.dispute.closed`
- `charge.dispute.funds_withdrawn`
- `charge.dispute.funds_reinstated`

Secrets:

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AUTOMATION_SECRET`
- `APP_BASE_URL`

Never commit secret values.

## Current testing checklist

Email:

- Send an invoice to a valid customer email.
- Confirm PDF is attached and matches the app invoice format closely enough.
- Confirm activity history records the email send.
- Confirm Resend webhook updates delivery status.
- Confirm invalid or missing email fails without false success history.

Overdue reminders:

- Create one overdue invoice with automatic reminders enabled.
- Create one overdue invoice with automatic reminders disabled.
- Run or wait for `send-overdue-reminders`.
- Confirm only the opted-in invoice is emailed.
- Confirm paid, draft, and cancelled invoices are skipped.
- Confirm manual reminder button remains available for non-opted-in overdue invoices.

Stripe:

- Create a full-balance Checkout session from the app.
- Complete payment in Stripe test mode.
- Confirm the invoice payment is recorded once.
- Replay the Stripe event and confirm it is treated idempotently.
- Test an email deposit link and then a remaining-balance link.
- Confirm Stripe payments are locked from manual removal.
- Confirm the webhook only updates invoices for Checkout sessions Tallyo created and logged.
- Request a partial refund from inside Tallyo and confirm Stripe creates the refund.
- Trigger or replay a Stripe refund event and confirm the invoice balance reopens correctly.
- Trigger or replay a `refund.failed` event and confirm it logs without creating a false successful refund.
- Trigger or replay a failed/asynchronous payment event and confirm it logs history without marking the invoice paid.
- Trigger or replay a dispute event and confirm it logs awareness without changing paid status automatically.

## Remaining work

Near term:

- Update screenshots and portfolio notes to include email, per-invoice reminders, deposits, and hardened Stripe webhooks.
- Done: added a concise payment threat model section to the security story.
- Done: payment list shows clearer remaining-balance wording after a seller-approved deposit.
- Partial: payment/refund duplicate replay and unrelated asynchronous-failure/dispute rejection passed on 2026-07-13. A known-payment dispute and genuine `refund.failed` event still need positive-path evidence before real customer use; see `STRIPE_SANDBOX_TEST_EVIDENCE.md`.
- Done: app payment panel shows a private/admin-facing reminder that Stripe is in test/development until live mode is intentionally configured.
- Keep README, handoff, security story, Supabase handoff, and operations docs in sync with the real app state.

Later:

- Formal backup and restore testing.
- Further append-only audit log hardening for settings changes, automation failures, and backup/restore evidence.
- Complete acceptance testing of backup-authenticator recovery and define the all-factors-lost support process; Supabase recovery codes are not available.
- Supabase Auth password policy confirmation and breached-password checks.
- Privacy policy, terms, data export/erasure process, retention policy, and breach process before real customer onboarding.
- Future SaaS subscription billing, plan tiers, workspaces, teams, RBAC, and public website.

## Production caveats

- Stripe is still being used in test/development context unless explicitly changed.
- Tallyo should not claim GDPR compliance.
- Activity history is useful, but not tamper-proof.
- Email and payment automation depend on correctly configured DNS, secrets, webhooks, and scheduled jobs.
- Supabase free-tier pause can stop cron jobs.
