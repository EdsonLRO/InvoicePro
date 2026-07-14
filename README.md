# Tallyo

A secure invoice, customer, payment, recurring invoice, email, and business-records workspace for small businesses.

> The public brand is **Tallyo**. The original project/repo name **InvoicePro** still appears in historical docs and some non-user-facing internals. Domain: **tallyo.co.uk**.

---

## 1. Project summary

Tallyo helps small businesses and independent operators run the money-and-records side of their work in one place: create and manage invoices, quotes, and credit notes; keep a customer address book; record manual or Stripe-confirmed payments; run recurring invoices automatically; send invoice emails; chase overdue payments; and keep a timestamped activity history per document.

It is designed to be simple, mobile-friendly, and security-conscious. It suits freelancers, sole traders, service providers, consultants, tradespeople, and custom-order businesses. Custom printing is one example use case, not the whole product.

---

## 2. Current status

**Working app / active hardening stage.**

- Core invoicing, customers, saved items, payments, recurring billing, email, PDF export, and activity history are working.
- Recurring invoice generation runs through a scheduled Supabase Edge Function with per-occurrence idempotency and a Vault-backed caller gate.
- Document email is implemented through Resend.
- Email delivery tracking is implemented through signed Resend webhooks and `audit_events`.
- Overdue reminder email is implemented, with automation enabled per invoice.
- Stripe Checkout invoice payments are implemented for full-balance and seller-approved deposit flows.
- Stripe payment confirmation is handled by a signed webhook and Stripe-confirmed payments are locked from manual removal.
- In-app Stripe refund requests are implemented through a server-side Edge Function.
- Stripe should still be treated as test/development until explicitly moved to live mode.
- Visible rebrand from InvoicePro to Tallyo is complete in the app UI, PWA manifest, and app icons. The repo/URL has not been renamed.
- The app is not yet ready for real paid public use until backup/restore, privacy operations, payment lifecycle handling, and release gates are completed.

For the short current-stage source of truth, see `APP_STATUS.md`.
For authoritative agent hierarchy, task coordination, locks, handoffs, and autonomous development rules, see `AUTOMATION_MODEL_ORCHESTRATION.md`.
For the active Legal, Privacy and Regulatory Agent's triggers, evidence standard, dispositions, and professional-advice limits, see `TALLYO_LEGAL_COMPLIANCE_AGENT.md`.
For graphical-dashboard and computer-use safety controls, see `AGENT_HIERARCHY_AND_COMPUTER_USE.md`.
For completion and release tracking, see `PRODUCT_COMPLETION_LEDGER.md` and `RELEASE_READINESS.md`. Internal live-readiness procedures are in `PAYMENT_OPERATIONS_RUNBOOK.md` and `LEGAL_PRIVACY_READINESS.md`; neither file is a published customer policy or legal-compliance claim.
For owner, product, security, and operations decisions, see `DECISION_LOG.md`.
For laptop-, identity-, provider-, or cost-dependent work intentionally left for later, see `DEFERRED_MANUAL_CONFIGURATION.md`.

---

## 3. Features

- Invoices, quotes, and credit notes; convert a quote to an invoice in place.
- Line items with saved-item autocomplete, custom units, and time-based billing (`hrs` entered as `h:m`).
- Per-line tax with a per-invoice tax-exclusive / tax-inclusive toggle; global discount and shipping.
- Manual payment recording with automatic status updates.
- Stripe Checkout payment links for full balance and seller-approved deposits.
- Customer address book and reusable saved-item catalogue.
- Recurring invoices: weekly, monthly, quarterly, yearly, or custom "every N days/weeks/months"; end-of-month clamping and catch-up handling; managed from a dedicated page.
- Recurring invoice auto-email, enabled per schedule.
- Overdue tracking with manual reminder email and per-invoice automatic reminder settings.
- Per-document and per-schedule activity history.
- Provider-backed `audit_events` for email and Stripe events.
- Branding: brand colour, logo upload or URL, logo position; branded PDF export and email PDF attachment.
- XLSX export of the document list.
- Progressive Web App, installable with mobile-tuned layouts.

---

## 4. Tech stack

- **Front-end:** Vue 3 in a single `index.html` file.
- **Styling:** Tailwind CSS, self-hosted compiled `tailwind.css`.
- **Backend:** Supabase - Postgres, Auth, Row Level Security, Edge Functions, Vault, `pg_cron`, and `pg_net`.
- **Email:** Resend through Supabase Edge Functions and signed webhooks.
- **Payments:** Stripe Checkout through Supabase Edge Functions and signed webhooks.
- **Client-side export:** jsPDF + html2canvas for PDFs; SheetJS/xlsx for spreadsheets.
- **Hosting:** static site on GitHub Pages. PWA via `manifest.json` and `service-worker.js`.
- **Automation:** Supabase Edge Functions plus daily cron jobs.

---

## 5. Security overview

Security is a core focus. Implemented controls include:

- **Supabase Auth** with server-side bcrypt password hashing. The app never stores password hashes.
- **Email verification** required before an account is usable.
- **Optional MFA (TOTP)** through an authenticator app.
- **Explicit session controls** for logging out this device or all devices; all-devices logout requires current-password confirmation and MFA when required.
- **Row Level Security (RLS)** on user-owned tables. The database enforces that each user can only access their own data.
- **Content-Security-Policy (CSP)** and **Subresource Integrity (SRI)** on pinned third-party scripts, with self-hosted Tailwind.
- **TLS in transit** and platform-managed encryption at rest.
- **Server-side Edge Functions** for recurring generation, email sending, overdue reminders, Stripe Checkout creation, and provider webhooks.
- **Secrets hygiene:** only public/publishable keys are used client-side. Service role, Resend, Stripe, and webhook secrets stay server-side.
- **Signed webhooks** for Resend and Stripe provider events.
- **Provider-backed audit events** for email and Stripe activity.
- **Authenticated app audit events** for selected sensitive actions such as deletes, exports, payment removal, MFA changes, password changes, session logout scope, recurring schedule changes, and company/settings saves.

Honest limitations:

- The app is **built with data-protection principles in mind**, but it is **not** formally GDPR compliant and must not be described as such.
- Activity history is useful, but not a tamper-proof audit log.
- Append-only audit logging now covers provider events and selected sensitive app actions, but it is not yet a complete security monitoring or compliance audit system.
- Supabase Pro daily backups and a recovery runbook are in place; current-backup evidence is verified and a timed restore test remains required.
- Supabase does not provide recovery codes. Tallyo supports a second authenticator and blocks email-only MFA recovery. Primary-specific and backup-specific recovery acceptance passed on 2026-07-14. The interim all-factors-lost response is deny-by-default, and robust recovery is still required before paid/public onboarding.
- Stripe refund requests plus refund, dispute, chargeback, and failed-payment lifecycle handling are deployed and subscribed in the sandbox webhook destination, but still need broader replay testing and live-mode readiness before real customer use.
- CSP still has a documented permissive setting because of the current single-file Vue structure.

For the full plain-English security narrative, see `SECURITY_STORY.md`.

---

## 6. Local setup

Prerequisites: Node.js, the Supabase CLI, and Git.

1. Clone the repo and open it in your editor.
2. Provide front-end config. The app reads its public Supabase URL and publishable key from `config.js`. Do not commit private secrets.
3. Run the front-end as a static single-page app using your local dev flow.
4. Rebuild Tailwind when you add or change utility classes:

   ```text
   npx tailwindcss -c tailwind.config.js -i <tailwind-input.css> -o tailwind.css --minify
   ```

5. Supabase CLI basics:

   ```text
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase functions deploy <function-name>
   ```

After deploying front-end changes, hard-refresh or use a private window because the service worker caches aggressively.

---

## 7. Environment variables and secrets

Names only - never commit real values.

Front-end, public:

- Supabase project URL.
- Supabase publishable / anon key.

Edge Function runtime / Supabase secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `SUPABASE_DB_URL`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AUTOMATION_SECRET`
- `APP_BASE_URL`

Supabase Vault secret names:

- `automation_secret` - active scheduler caller secret.
- `project_anon_key` - legacy stored entry; no longer referenced by the automation cron commands.

Never commit real `.env` files, service role keys, API keys, webhook secrets, database passwords, Vault values, or private credentials.

---

## 8. Supabase setup notes

- Region: eu-west-2.
- Run the SQL setup/migration files in Supabase SQL Editor as needed:
  - `schema.sql`
  - `recurring_setup.sql`
  - `supabase/audit_events.sql`
  - `supabase/recurring_email_enabled.sql`
  - `supabase/invoice_overdue_reminders.sql`
  - `supabase/invoice_payment_options.sql`
- Keep RLS enabled and scoped to the owning user.
- Keep Supabase Auth allowed/redirect URLs in sync with the deployed site URL.
- `pg_cron` and `pg_net` are used for scheduled Edge Function calls.
- `generate-recurring-daily` runs recurring invoice generation through a Vault-backed custom-secret gate.
- `send-overdue-reminders-daily` runs opt-in overdue reminder automation through the same Vault-backed gate.
- The Supabase organisation is now Pro; scheduled jobs still require monitoring and must be disabled in restored clones.

For full details, see `SUPABASE_HANDOFF.md`.

---

## 9. Current roadmap

Current app/security work:

1. Define the operational refund, dispute, chargeback, and support process; the implemented Stripe sandbox lifecycle and duplicate replay behavior are Verified.
2. Run the documented Owner-approved non-production restore test in `BACKUP_RESTORE_RUNBOOK.md`; current daily-backup evidence is verified through 2026-07-14.
3. Expand append-only audit logging further, especially privileged automation failures and backup/restore evidence.
4. Preserve the Verified `MFA_RECOVERY_RUNBOOK.md` controls and approved deny-by-default all-factors-lost response; design robust recovery before paid/public onboarding. Consider upgrading all-devices logout with a server-side email-code confirmation flow.
5. Complete the remaining provider decisions in `DEFERRED_MANUAL_CONFIGURATION.md`; leaked-password rejection is already Verified.
6. Complete privacy/data-protection groundwork before real customer use.
7. Keep security docs, screenshots, and portfolio evidence in sync with the real app.

Future phase, deliberately deferred:

- Public marketing website at `tallyo.co.uk`.
- Paid Tallyo subscriptions.
- Plan tiers and server-enforced entitlements.
- Workspaces, teams, RBAC, and full SaaS billing architecture.

---

## 10. Important warning about secrets

- Never commit secrets.
- Only public/publishable keys may appear in client-side code.
- The service role key bypasses RLS and must stay strictly server-side.
- Vault secret names may be documented, but decrypted values must never appear in code, docs, screenshots, commits, or chat.
- If a real secret is ever committed or exposed, treat it as compromised and rotate it.

---

## 11. License

Unknown / needs confirmation. No license has been finalised yet.

Placeholder:

```text
Copyright (c) <year> <owner>. All rights reserved.
```
