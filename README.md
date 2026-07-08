# Tallyo

A secure **invoice, customer, payment, recurring invoice, and business-records workspace** for small businesses.

> **Note:** the public brand is **Tallyo**. The original project/repo name **InvoicePro** still appears in historical docs and some non-user-facing internals. Domain: **tallyo.co.uk**.

---

## 1. Project summary

Tallyo helps small businesses and independent operators run the money-and-records side of their work in one place: create and manage invoices, quotes, and credit notes; keep a customer address book; record payments; run recurring invoices automatically; chase overdue payments; and keep a timestamped activity history per document.

It is designed to be simple, mobile-friendly, and secure. It suits freelancers, sole traders, service providers, consultants, tradespeople, and custom-order businesses (custom printing is one example use case, not the focus).

---

## 2. Current status

**Early-stage prototype / active development.**

- Core invoicing, customers, payments, recurring billing, and activity history are working.
- Recurring invoice generation runs automatically via a scheduled cloud function.
- Email sending is **not yet implemented** (invoice delivery and overdue reminders are currently manual — the app drafts the text for you to send).
- Visible rebrand from InvoicePro → Tallyo is complete in the app UI, PWA manifest, and app icons. The repo/URL has not been renamed.
- Not production-hardened for paying customers; see the security overview and roadmap.

---

## 3. Features

- Invoices, quotes, and credit notes; convert a quote to an invoice in place.
- Line items with saved-item autocomplete, custom units, and time-based billing (`hrs` entered as `h:m`).
- Per-line tax with a per-invoice tax-exclusive / tax-inclusive toggle; global discount and shipping.
- Payment recording with automatic status updates (Draft / Sent / Paid / Cancelled).
- Customer address book and reusable saved-item catalogue.
- Recurring invoices: weekly, monthly, quarterly, yearly, or custom "every N days/weeks/months"; end-of-month clamping and catch-up handling; managed from a dedicated page.
- Overdue tracking with a drafted reminder (manual send for now).
- Per-document and per-schedule activity history (a convenience log, not a tamper-proof audit trail).
- Branding: brand colour, logo upload or URL, logo position; branded PDF export (paginated A4).
- XLSX export of the document list.
- Progressive Web App (installable), mobile-tuned layouts.

---

## 4. Tech stack

- **Front-end:** Vue 3 (single `index.html`, no build step for the app itself).
- **Styling:** Tailwind CSS, self-hosted compiled `tailwind.css` (via the Tailwind CLI, not a CDN).
- **Backend:** Supabase — Postgres, Auth, Row Level Security, Edge Functions, Vault, `pg_cron` + `pg_net`.
- **Client-side export:** jsPDF + html2canvas (PDF), SheetJS/xlsx (spreadsheets).
- **Hosting:** static site (GitHub Pages). PWA via `manifest.json` + `service-worker.js`.
- **Automation:** Supabase Edge Function (Deno/TypeScript) + a daily `pg_cron` schedule.

---

## 5. Security overview

Security is a core focus. Implemented controls:

- **Supabase Auth** with server-side bcrypt password hashing (the app never stores password hashes).
- **Email verification** required before an account is usable (server-sent link).
- **Optional MFA (TOTP)** via an authenticator app.
- **Row Level Security (RLS)** on every table — the database enforces that each user can only access their own data (verified with a deliberate break-test).
- **Content-Security-Policy (CSP)** and **Subresource Integrity (SRI)** on pinned third-party scripts, with a self-hosted stylesheet.
- **Data encrypted in transit (TLS) and at rest** (platform-provided).
- **Recurring cloud function** uses a server-side service role key that is never exposed to the client; each generated record is explicitly attributed to the correct user.
- **Secrets hygiene:** only the public/publishable key is used client-side; the service role key stays server-side; the scheduler's invoke key is stored encrypted in Supabase Vault.

**Honest limitations:** this app is **built with data protection principles in mind**, but it is **not** formally "GDPR compliant" and should not be described as such. The activity history is not tamper-proof, there are no formal backups on the current tier, MFA has no recovery codes, and email/notifications are not yet automated. See the roadmap for planned hardening.

For the full plain-English security narrative, see `SECURITY_STORY.md`.

---

## 6. Local setup

**Prerequisites:** Node.js, the Supabase CLI, and Git.

1. **Clone the repo** and open it in your editor.
2. **Provide front-end config:** the app reads its public Supabase URL and publishable key from `config.js`. Create it from the example (see Environment variables) — do **not** commit real secrets.
3. **Run the front-end:** it's a static single-page app. Serve `index.html` with any static server (e.g. the VS Code Live Server extension) or open it via your local dev flow.
4. **Rebuild Tailwind** when you add or change utility classes:
   ```
   npx tailwindcss -c tailwind.config.js -i <tailwind-input.css> -o tailwind.css --minify
   ```
5. **Supabase CLI (for the cloud function):**
   ```
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase functions deploy generate-recurring
   ```

> Tip: after deploying, hard-refresh or use a private window — the service worker caches aggressively.

---

## 7. Environment variables

Names only — **never commit real values.** Provide a `.env.example` with placeholders if you introduce env files.

**Front-end (public, safe to ship):**
- Supabase project URL — public
- Supabase publishable / anon key — public (data is protected by RLS)

_(These are currently supplied via `config.js`.)_

**Edge Function runtime (provided automatically by Supabase — do not hardcode):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — **service role; server-side only; never in client code or commits**
- `SUPABASE_ANON_KEY`
- `SUPABASE_DB_URL`

**Supabase Vault (secret name only, never the value):**
- `project_anon_key` — the low-privilege key the scheduled job uses to invoke the function

**Future (email phase — not yet used):**
- e.g. `RESEND_API_KEY` — server-side only when added

---

## 8. Supabase setup notes

- **Region:** eu-west-2 (West Europe / London).
- **Database:** run the SQL setup files in the Supabase SQL Editor to create tables, RLS policies, and the new-user trigger:
  - `schema.sql` (core tables + RLS)
  - `recurring_setup.sql` (recurring templates table + RLS)
  - plus any idempotent `alter table ... add column if not exists ...` migrations.
- **Row Level Security** is enabled on every table; each policy scopes access to `auth.uid() = user_id`. Do not disable or broaden without a clear reason.
- **Auth URLs:** keep the Supabase Auth allowed/redirect URLs in sync with the deployed site URL. If the site URL changes (e.g. a repo rename during rebrand), update these or authentication will break.
- **Extensions:** `pg_cron` and `pg_net` must be enabled for the scheduled recurring job.
- **Scheduled job:** `generate-recurring-daily` (daily, 06:00 UTC) calls the `generate-recurring` Edge Function; the invoke key is read from Vault at runtime.
- **Free tier caveat:** inactive projects can pause, which stops the scheduled job.
- For full details, see `SUPABASE_HANDOFF.md`.

---

## 9. Development roadmap

1. **Keep Tallyo rebrand hygiene** — leave the repo/URL unchanged unless Supabase Auth URLs are updated at the same time.
2. **Email phase (largest remaining work), provider: Resend**
   - Connect `tallyo.co.uk`; add SPF, DKIM, DMARC; send a test email.
   - Auto-send invoices on creation/generation.
   - Automated overdue reminders (reuses the scheduled-function pattern).
   - Delivery tracking via webhooks → real "Delivered" events in activity history.
3. **Data-protection groundwork** before onboarding real customers (privacy policy, consent/unsubscribe, data-subject rights).
4. **Security hardening** — append-only audit log, formal backups, MFA recovery codes, password-strength/breach checks.
5. **Optional** — link invoices to their recurring schedule (dedup guard); public landing page at tallyo.co.uk.

---

## 10. Important warning about secrets

- **Never commit secrets.** No service role keys, database passwords, JWT secrets, email-provider API keys, Vault values, or `.env` files in the repository.
- Only **public/publishable** keys may appear in client-side code — this is safe because RLS protects the data.
- Use a `.env.example` with placeholder values; add real env files to `.gitignore`.
- The **service role key bypasses RLS** — keep it strictly server-side (Edge Function runtime / Supabase secrets). A leak would be critical.
- Vault: document secret **names** only, never decrypted values.
- If you ever find a real secret committed, treat it as compromised and rotate it.

---

## 11. License

**Unknown / needs confirmation.** No license has been finalised yet.

_Placeholder — choose and add a license before any public release._

```
Copyright (c) <year> <owner>. All rights reserved.
```

_(Replace with your chosen license, e.g. MIT, Apache-2.0, or a proprietary notice.)_

