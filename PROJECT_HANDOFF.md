# PROJECT_HANDOFF.md — Tallyo

> Mandatory governance reading before taking ownership: `AUTOMATION_MODEL_ORCHESTRATION.md`, `TALLYO_LEGAL_COMPLIANCE_AGENT.md`, `AGENT_HIERARCHY_AND_COMPUTER_USE.md`, and `AUTONOMOUS_EXECUTION_PERMISSION.md`.
> `AUTOMATION_MODEL_ORCHESTRATION.md` is authoritative for hierarchy, queue, locks, handoffs, and closure. `TALLYO_LEGAL_COMPLIANCE_AGENT.md` is authoritative for the active legal/privacy/regulatory role. `AGENT_HIERARCHY_AND_COMPUTER_USE.md` is authoritative for graphical-dashboard operations.

> Handoff for an AI coding agent (e.g. ChatGPT / Codex) taking over development.
> Read this fully before editing. Where facts are uncertain they are marked **Unknown / needs confirmation**.

---

## 1. Project overview

Tallyo is a secure, single-page web application for running the money-and-records side of a small business: creating and managing **invoices, quotes, and credit notes**, keeping a **customer** address book, recording **payments**, running **recurring invoices** automatically, chasing **overdue payments**, and keeping timestamped **business records / activity history** per document.

It is built as a real, working product **and** as a security-focused portfolio piece. The security engineering is deliberately thorough and documented (before/after threat models exist separately). The app started life as an insecure browser-only prototype and was hardened into a proper client + backend architecture.

**The public brand is now `Tallyo`.** The visible app UI, PWA manifest, and app icons have been rebranded. The original `InvoicePro` name still exists in the repo/folder name, historical docs, and some non-user-facing internals.

---

## 2. Product name and rebrand status

- **Visible app brand:** `Tallyo` in `index.html`, `manifest.json`, and PWA icons.
- **New public brand:** **Tallyo**
- **Domain owned:** **tallyo.co.uk** (registered; Resend sending domain is configured as `mail.tallyo.co.uk`; hosting still uses the current GitHub Pages URL).
- **Rebrand status:** visible UI text, PWA metadata, and app icons are rebranded to Tallyo. The repo/live URL is deliberately unchanged.
- **GitHub repo / live URL:** currently uses the `InvoicePro` repo name (GitHub Pages). **Deliberately not renamed yet** — renaming the repo changes the live URL and would require updating Supabase Auth allowed/redirect URLs. Treat repo/URL rename as a separate, careful task.

**Rebrand checklist:**
- Done: replaced visible "InvoicePro" → "Tallyo" in `index.html` (`<title>`, `apple-mobile-web-app-title` meta, header `<h1>`, sidebar wordmark, the "could not start" message, and the logout/clear-data confirm dialogs).
- Done: updated `manifest.json` app name/short_name.
- Done: replaced app icons `icon-192.png` and `icon-512.png` with Tallyo icons.
- Do **not** rename the GitHub repo/URL yet without also updating Supabase Auth URLs.

---

## 3. Current product positioning

Tallyo is a **secure invoicing and business-records workspace** for small operators who need to look professional and get paid, without the bloat of full accounting suites.

- Position it broadly, **not** as a custom-printing tool.
- Custom printing (e.g. a print/apparel shop invoicing customers for custom orders) is a **valid example use case**, not the whole product.
- The differentiator is **honest, real security** plus a clean, fast, single-page workflow — invoices, customers, payments, recurring billing, and records in one place.
- Security wording must stay **honest**: describe the controls actually implemented; **do not claim GDPR compliance** or "fully compliant/secure". Compliance groundwork is future work.

---

## 4. Target users

Primary audience is small businesses and independent operators, including:
- Freelancers and sole traders
- Service providers and consultants
- Tradespeople (electricians, plumbers, decorators, etc.)
- Custom-order businesses (e.g. custom printing/apparel — as one example, not the focus)
- Small businesses that send invoices/quotes and need recurring billing + payment tracking

Assumed context: mostly UK-based (GBP, UK-oriented), non-technical users, often on mobile.

---

## 5. What the app currently does

**Documents**
- Create/edit **invoices, quotes, credit notes**.
- Convert a **quote → invoice in place** (the quote becomes the invoice; no duplicate). Convert available from the list and the open document.
- Save button + page title adapt to document type.
- Duplicate, delete, and **PDF export** per document (PDF captures at a fixed desktop width and paginates across A4 pages).
- XLSX export of the document list.

**Line items & totals**
- Per line: description with **saved-item autocomplete**, qty, unit, price, discount, tax %.
- **Time-based billing:** unit `hrs` gives an `h : m` entry converted to a decimal quantity.
- Custom units.
- **Per-line tax** with per-invoice toggle: tax-exclusive ("add on top") vs tax-inclusive ("prices include tax"); tax grouped by rate in totals.
- Global discount, shipping cost.

**Payments & status**
- Record/remove manual payments (remove requires confirmation; both actions are append-only audited with minimised metadata).
- Stripe Checkout payment links are implemented through server-side Edge Functions.
- App Pay by Card creates a full-balance Checkout session.
- Invoice emails can include full-balance links and seller-approved deposit links.
- Customers cannot choose arbitrary partial-payment amounts; deposit amounts are seller-controlled.
- Signed Stripe webhook records confirmed payments, supports deposit + remaining balance flows, and locks Stripe-confirmed payments from manual removal.
- In code: users can request full or partial Stripe refunds from the invoice payment list; Stripe still confirms the refund through the signed webhook before Tallyo changes invoice balance.
- Status: Draft / Sent / Paid / Cancelled (selector in the top toolbar); auto-marks Paid when balance reaches zero.
- Status badge shown in the invoices list.

**Recurring invoices**
- Set up via a **"Repeat this invoice"** toggle on an invoice (not a separate creation screen).
- Frequencies: weekly, monthly, quarterly, yearly, or custom "every N days/weeks/months".
- End-of-month clamps to the last valid day (e.g. Jan 31 → Feb 28 → Mar 31).
- The invoice being created covers the current period; the schedule generates the **next** one onward.
- Missed periods → one catch-up invoice, then realigns.
- Recurring page is a **management view** (list, due panel, "Generate all due", pause/resume, edit, delete). Schedules keep their own history log and an opt-in automatic email setting.
- **Server-side automation exists** (see section 14).

**Email and overdue reminders**
- Manual document email is live through Resend for saved invoices/quotes/credit notes.
- Email delivery tracking is live through signed Resend webhooks and the app shows delivery status badges.
- Opt-in recurring invoice auto-email exists through `recurring_templates.email_enabled`.
- Overdue panel on the invoices list: overdue invoices, days overdue, outstanding amounts.
- Reminder modal: drafts reminder text, can email it through Resend or copy it. The email action logs activity history automatically.
- Scheduled overdue reminder automation exists through `send-overdue-reminders`.
- Overdue reminders are opt-in per invoice, not a global company-wide switch. Company Settings only stores reminder defaults used to pre-fill new invoices.

**Records / other**
- Customers address book; Saved Items catalogue.
- Per-document **Activity History** (timestamped events: created, sent, converted, payment, payment removed, paid, cancelled, status change, recurring-generated, reminder, note; plus free-text notes). Explicitly labelled "activity history, not a tamper-proof audit log".
- Account holders can download a structured JSON copy of their RLS-visible workspace from the Account page. The browser revalidates the Auth user, paginates all six tenant datasets, limits Auth metadata, aborts on session/query failure, creates no new server-side export copy, and records only minimal success metadata.
- Branding page: brand colour (presets + custom), logo position, **logo upload from computer** (resized, size-capped, embedded) or URL, live preview.
- Dashboard, mobile-tuned layouts, PWA (installable; service worker active over HTTPS).

---

## 6. Core user workflows

1. **Create & send an invoice:** New Invoice → pick customer → add line items (autocomplete, time or unit based) → set tax mode → save → Email or export PDF.
2. **Quote then convert:** Create a quote → send → later open it → Convert to Invoice (in place) → save.
3. **Take payment:** Open invoice → Record Payment → status auto-updates; overpayment/removal handled with confirmation and logging.
4. **Set up recurring billing:** Create an invoice → toggle "Repeat this invoice" → choose frequency → optionally enable automatic email → save (schedule created, first future run set automatically). Manage/pause on the Recurring page.
5. **Chase overdue:** Invoices list → overdue panel → open reminder modal → email the reminder through Tallyo, or copy drafted text and log manual sending.
6. **Brand documents:** Branding page → set colour, upload logo, choose position → applies to documents and PDFs.
7. **Records/history:** Open any document → Activity History timeline; recurring schedules have their own Schedule History.

---

**Current payment/reminder note:** payments can now be manual or Stripe-confirmed. Stripe payments are recorded by a signed webhook and locked from manual removal. Overdue reminders are now opt-in per invoice, with company settings used only as schedule defaults.

## 7. Current tech stack

- **Front-end:** Vue 3 (single `index.html` file; no build step for the app itself).
- **Styling:** Tailwind CSS, **self-hosted** compiled build (`tailwind.css`) generated via the Tailwind CLI (not the CDN).
- **Backend:** Supabase — Postgres, Supabase Auth, Row Level Security, Edge Functions, Vault, `pg_cron`, `pg_net`.
- **PDF/export:** client-side (jsPDF + html2canvas; SheetJS/xlsx for spreadsheets). **Unknown / needs confirmation:** exact library versions (pinned with SRI in the HTML).
- **Hosting:** GitHub Pages (static). PWA via `manifest.json` + `service-worker.js`.
- **Automation:** Supabase Edge Function (Deno/TypeScript) + `pg_cron` schedule.
- **Edge dependency control:** all ten repository function sources, including the undeployed `mfa-recovery` candidate, pin `@supabase/supabase-js` to exact version `2.110.1`; each function has a Deno v4 lockfile with the remote-module digest. `tests/edge-dependency-pin-harness.cjs` rejects floating versions or missing/incompatible locks. Production currently has nine active functions.
- **Automated security gate:** `.github/workflows/security-checks.yml` uses immutable action SHAs, read-only permissions, no secrets, and Deno `2.2.15` LTS to run all ten frozen checks plus the focused Node security harnesses on pull requests and `main`.
- **Local dev (current author):** Windows + VS Code + Supabase CLI. Node.js installed.

---

## 8. Current app architecture

- **Single-page app in one HTML file.** All UI, Vue app logic, and inline `<script>` live in `index.html`. State is held in a single Vue instance (data + computed + methods). There is no module bundler for the front-end.
- **Data layer:** the app talks directly to Supabase (Postgres via the Supabase JS client) for CRUD, scoped by the logged-in user through Row Level Security. The browser holds a short-lived session token, never the password.
- **Mapping layer:** JS "row ↔ object" mappers convert between DB snake_case columns and the app's camelCase objects (e.g. `rowToInvoice` / `invoiceToRow`, and template equivalents). **Important:** DB column names differ from app field names in several places (see section 13).
- **Server automation:** a Supabase Edge Function runs recurring generation on a schedule, independent of the browser.
- **Config:** public/publishable Supabase keys live in a separate `config.js` (safe to be public because RLS protects the data). No secret keys in front-end code.

---

## 9. Important files and what they do

| File | Purpose |
|---|---|
| `index.html` | The entire front-end app (Vue 3 markup + inline logic). Source of truth for UI/behaviour. |
| `tailwind.css` | Compiled, self-hosted Tailwind stylesheet. Must be rebuilt when new classes are added. |
| `config.js` | Holds public Supabase URL + publishable/anon key. **No secret keys.** |
| `manifest.json` | PWA metadata (name, icons). Rebranded to Tallyo. |
| `service-worker.js` | Versioned same-origin PWA shell cache with network-first refresh and safe offline navigation fallback. Supabase/CDN traffic is not intercepted. |
| `icon-192.png`, `icon-512.png` | Tallyo PWA icons. |
| `APP_STATUS.md` | Short current-stage source of truth: what is implemented, what remains, and what is deferred to future SaaS work. |
| `AUTONOMOUS_EXECUTION_PERMISSION.md` | Standing owner permission for autonomous safe development, testing, documentation, Supabase, Git, and deployment-preparation work, plus manual-approval boundaries. |
| `AUTOMATION_MODEL_ORCHESTRATION.md` | Autonomous development loop, model/work-mode selection, computer-use policy, approval boundaries, and completion criteria. |
| `TALLYO_LEGAL_COMPLIANCE_AGENT.md` | Active Legal, Privacy and Regulatory Agent scope, mandatory triggers, evidence, dispositions, release conditions, and external-advice limits. |
| `PRODUCT_COMPLETION_LEDGER.md` | Capability-by-capability completion status and current next priorities. |
| `DECISION_LOG.md` | Accepted, deferred, and pending product/security/operations decisions. |
| `RELEASE_READINESS.md` | Release gates and evidence needed before real customer use. |
| `FINAL_APP_REGRESSION_EVIDENCE_2026-07-16.md` | Final current-scope automated and deployed route-regression evidence, with explicit live-release exclusions. |
| `SECURITY_FINDINGS_LEDGER.md` | Working record of security findings, fixes, verification evidence, and residual risk. |
| `schema.sql` | Full Postgres schema: tables, RLS policies, new-user trigger. |
| `supabase/audit_events.sql` | Append-only audit-events table used by provider events and selected sensitive app actions. |
| `recurring_setup.sql` | Creates `recurring_templates` table + its RLS (idempotent). |
| `supabase/recurring_email_enabled.sql` | Small idempotent migration that adds opt-in automatic email to recurring schedules. |
| `supabase/invoice_overdue_reminders.sql` | Adds per-invoice overdue reminder opt-in and cadence columns. |
| `supabase/invoice_payment_options.sql` | Adds invoice payment-link options for full balance vs seller-approved deposit. |
| `supabase/functions/generate-recurring/index.ts` | Edge Function (Deno/TS) that generates due recurring invoices. Deployed to Supabase. |
| `supabase/functions/send-document-email/index.ts` | Edge Function (Deno/TS) that sends invoices/quotes/credit notes by Resend and can attach PDFs/payment links. |
| `supabase/functions/send-reminder-email/index.ts` | Edge Function (Deno/TS) that sends one authenticated overdue payment reminder via Resend. |
| `supabase/functions/send-overdue-reminders/index.ts` | Scheduled Edge Function (Deno/TS) that sends per-invoice opt-in overdue reminders and records minimised processing-failure evidence. |
| `supabase/functions/resend-webhook/index.ts` | Signed Resend webhook receiver for delivery/failure/open/click events. |
| `supabase/functions/create-stripe-checkout/index.ts` | Authenticated Edge Function (Deno/TS) that creates Stripe Checkout sessions from the app. |
| `supabase/functions/create-stripe-refund/index.ts` | Authenticated Edge Function (Deno/TS) that requests Stripe refunds for the user's own confirmed Stripe payment rows. |
| `supabase/functions/log-app-event/index.ts` | Authenticated Edge Function (Deno/TS), deployed as version 7, that records allowlisted sensitive app-action audit events including format/version-only account-export success evidence. |
| `supabase/functions/stripe-webhook/index.ts` | Signed Stripe webhook receiver that records verified Checkout payments. |
| `SECURITY_OPERATIONS.md` | Practical backup, restore, data-protection, email, payment, and release gates before real users. |
| `BACKUP_RESTORE_RUNBOOK.md` | Supabase Pro backup posture, logical export safety, restore-test procedure, side-effect controls, evidence, and approval boundaries. |
| `PAYMENT_OPERATIONS_RUNBOOK.md` | Internal Stripe sandbox refund, dispute, chargeback, failure, support, and escalation procedure; not a customer-facing policy. |
| `LEGAL_PRIVACY_READINESS.md` | Internal data-flow, role, vendor, retention, rights, breach, claims, legal disposition, and launch-block register. |
| `LEGAL_OPERATIONS_RECORDS.md` | Internal working ROPA, privacy case templates, vendor/retention review templates, preliminary DPIA screening, and exercise schedule. |
| `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md` | Fictional, privacy-safe rights-request and breach tabletop evidence with blocking operational gaps. |
| `LEGAL_ACCOUNT_DATA_EXPORT_REVIEW_2026-07-15.md` | Legal/privacy scope, mandatory controls, evidence limits, and release conditions for the RLS-scoped account-holder JSON export. |
| `RELEASE_EVIDENCE_2026-07-15.md` | Privacy-safe evidence, deployed versions, limitations, and remaining gates from the current readiness pass. |
| `DEFERRED_MANUAL_CONFIGURATION.md` | Laptop/identity/provider/cost-dependent acceptance and configuration decisions that automation must not perform silently. |
| `EMAIL_PHASE.md` | Staged Resend email plan: DNS setup, manual sending, webhooks, then automation. |
| `ROADMAP_EMAIL_PAYMENTS.md` | Current implementation state, deploy checks, and remaining work for email/payments. |
| Tailwind build inputs | `tailwind.config.js` + a Tailwind input CSS file used by the CLI to produce `tailwind.css`. **Unknown / needs confirmation:** exact input filename in the repo. |
| Threat model docs | Separate before/after STRIDE threat models + a plain-English security write-up exist as project artifacts. |

**Tailwind rebuild command (when classes change):**
```
npx tailwindcss -c tailwind.config.js -i <tailwind-input.css> -o tailwind.css --minify
```

---

## 10. Supabase usage overview

- **Project region:** eu-west-2 (West Europe / London).
- **Postgres** with Row Level Security on every table.
- **Supabase Auth** for accounts, email confirmation, and MFA.
- **Edge Functions** (Deno) for server-side recurring generation and email delivery tracking.
- **Vault** stores the scheduler's dedicated automation secret (encrypted).
- **`pg_cron` + `pg_net`** extensions enabled for scheduling and HTTP calls from the DB.
- Public/publishable key is used by the browser app; the **service role key is never in source** — it is injected into the Edge Function at runtime by the platform.
- **Unknown / needs confirmation:** exact project ref/URL should be read from `config.js` in the repo, not assumed.

---

## 11. Authentication flow

1. User signs up with email + password via **Supabase Auth**. Passwords are hashed server-side (bcrypt); the app never stores or sees password hashes.
2. **Real email confirmation:** Supabase sends a verification link; the account must be confirmed before use.
3. On sign-in, Supabase issues a short-lived signed **JWT** session token held client-side. The app never keeps the raw password.
4. All data requests run as the authenticated user; **Row Level Security** restricts every query to that user's own rows.
5. A "Change Password" flow exists in the app.
   - **Preserved wording (do not change):** the Change Password box asks for the user's **Current Password**, and its note reads: *"Please enter your current password to confirm it's you."* Keep the title "Change Password" and keep the note consistent with the field.
   - If MFA is enabled, changing password prompts for a fresh authenticator code after current-password reauth so Supabase can upgrade the session to AAL2 before `updateUser`.
   - The logged-out password-reset flow uses masked password fields. It loads the account's verified factors first and requires TOTP when MFA is enrolled; factor-discovery failure stops recovery.
6. Account session controls are explicit:
   - **Log Out This Device** calls Supabase sign-out with `scope: 'local'`.
   - **Log Out All Devices** asks for the current password, asks for MFA when the account/session requires AAL2, records an audit event, then calls global sign-out to revoke refresh tokens across devices.
   - Unexpected provider sign-out clears loaded invoices, customers, drafts, schedules, form/security state, and navigation before returning to login. Session-generation checks discard initial business-data, audit, and MFA responses that complete after sign-out.
7. Account data export uses the same authenticated public client and database RLS as the app. It revalidates the current Auth user, exports only RLS-visible rows, excludes Auth secrets/tokens/TOTP material/unrestricted metadata, and fails without downloading when any dataset or session check fails.

---

## 12. MFA flow

- **Optional TOTP MFA** (authenticator-app 6-digit rotating code) via Supabase Auth.
- User enrolls a primary authenticator; once enabled, sign-in requires password **and** the current TOTP code. Assurance-level and factor-list errors fail closed before application data loads.
- Primary and backup sign-in, incorrect-code rejection, fail-closed assurance/factor lookup, protected factor replacement/removal, AAL2 password change, and MFA-gated password recovery were verified end to end on 2026-07-14.
- A user can enrol one backup authenticator and use either verified factor for sign-in or password recovery. Either factor can be retired only while the other remains, using a fresh code from the remaining factor; disabling MFA also requires a fresh code.
- Supabase does not provide recovery codes. SMS and email MFA are not implemented, and a password-reset email does not bypass an enrolled authenticator. See `MFA_RECOVERY_RUNBOOK.md`.
- **Implemented account safety:** "Log Out All Devices" exists in the Account page and uses current-password reauth plus MFA when required before Supabase global sign-out.
- **Future account safety:** consider upgrading all-devices logout to a server-side email verification code/link flow before revocation. Keep this separate from normal local logout and record a dedicated `account_sessions_revoked`-style audit event if added.

---

## 13. Database / data model summary

Tables (all have `user_id` and RLS; a user can only access their own rows):

- **`company_settings`** — one row per user: business profile, prefixes (`invoice_prefix`, `quote_prefix`, `credit_prefix`), `default_currency`, branding (`brand_color`, `logo_position`, `logo_url`), default notes/terms/footer, payment details.
- **`customers`** — address book (name, address, phone, mobile, email, tax_id, additional_info).
- **`saved_items`** — reusable line-item catalogue (name, description, price).
- **`invoices`** — one row per document (invoice/quote/credit note).
- **`recurring_templates`** — recurring schedules (the recipe that spawns invoices).

**Critical column-name notes (app field ≠ DB column) — must be respected when editing queries or the Edge Function:**
- Customer is stored as **`customer_snapshot`** (JSONB snapshot at issue time), NOT `customer`.
- Issue date column is **`issue_date`**, NOT `date`.
- Totals are stored as a single number **`grand_total`**, NOT a `totals` object.
- Both `invoices` and `recurring_templates` have a **`history`** JSONB column (activity log).
- `invoices` line `items` and `payments` are JSONB arrays.
- `doc_type` is one of `invoice` / `quote` / `credit`; `status` is one of `Draft` / `Sent` / `Paid` / `Cancelled`.
- Invoice numbers are unique per `(user_id, doc_type, number)`; the app/function prepend the user's `invoice_prefix` from `company_settings`.
- `recurring_templates` key fields: `frequency` (weekly/monthly/quarterly/yearly/custom), `custom_interval`, `custom_unit` (days/weeks/months), `start_date`, `next_run`, `active`, `email_enabled`, `last_generated`, `generated_count`, plus snapshot of customer/items/currency/tax_mode/etc.
- Generated invoices use nullable `recurring_template_id` plus `recurring_occurrence_date`; a partial unique index prevents a retry/concurrent run from creating a second attributed invoice for the same occurrence.

A hardened trigger auto-creates an empty `company_settings` row on new user signup. A confirmed fresh-signup acceptance test passed on 2026-07-14 with matched aggregate counts and no missing/orphan settings rows.

**Design note:** invoices store a **snapshot** of customer details so historical documents stay correct even if the customer is later edited or deleted.

---

## 14. Recurring invoice system summary

Two layers:

**Client-side (in the app):** define schedules, see what's due, and "Generate all due" while the app is open.
The manual "Generate all due" path creates Sent invoices in the browser and does not send automatic emails.

**Server-side automation (live):**
- **Edge Function** `generate-recurring` (`supabase/functions/generate-recurring/index.ts`, Deno/TS):
  - Finds active schedules where `next_run <= today`.
  - For each occurrence, inserts or reuses one uniquely attributed invoice (status **Sent**) stamped with the schedule owner's `user_id`.
  - Conditionally advances the expected `next_run`; only the invocation that wins this claim may email, preventing concurrent/retry duplicate contact.
  - If `email_enabled = true` and the customer snapshot has a valid email, sends through Resend after the claim and records `document_email_sent`.
  - Updates `last_generated`/`generated_count`, schedule history, and privacy-safe append-only generation/failure events.
- **Scheduler:** `pg_cron` job `generate-recurring-daily`, cron `0 6 * * *` (06:00 UTC daily), using `pg_net` to POST with a Vault-backed `x-automation-secret`. The function validates it before creating the service-role client; unsigned requests return HTTP 401.
- **Number generation:** reads the user's `invoice_prefix` and increments the max existing invoice number for that user/doc type.

**Verify it's registered / ran:**
```sql
select jobid, jobname, schedule, active from cron.job
where jobname = 'generate-recurring-daily';

select jobid, status, return_message, start_time, end_time
from cron.job_run_details
where jobid = (select jobid from cron.job where jobname = 'generate-recurring-daily')
order by start_time desc limit 5;
```

**Redeploy the function after edits:**
```
supabase functions deploy generate-recurring
```

**Plan note:** the Supabase organisation is now Pro, so the former Free-tier inactivity-pause limitation no longer applies. Cron health still needs operational monitoring.

---

## 15. Security decisions already implemented

- **Server-side auth** (Supabase Auth); bcrypt-hashed passwords; the app never stores password hashes.
- **Real email verification** (server-sent link) — replaced an earlier fake client-side code.
- **Optional TOTP MFA**, verified including wrong-code rejection.
- **Row Level Security** on every table — DB-enforced per-user isolation; verified with a deliberate break-test (querying "all" returns only the caller's rows).
- **RLS-scoped account export** — workspace JSON is assembled only in the authenticated browser, with stable pagination, whole-export failure, minimized Auth metadata, no service-role access, and no new server-side export store.
- **Front-end integrity:** third-party libraries pinned to exact versions with **Subresource Integrity (SRI)**; **Content-Security-Policy** in place; **self-hosted Tailwind** (removed a live CDN dependency).
- **Transport & at-rest:** HTTPS/TLS in transit; platform encryption at rest.
- **Customer snapshot model** keeps historical invoices correct and avoids live links to personal data that may later be erased.
- **Secrets hygiene:** only public/publishable keys are in front-end `config.js`; the **service role key is never in source** and is runtime-injected. Both cron jobs use a dedicated `automation_secret`, stored **encrypted in Supabase Vault** and read only at runtime. This secret authenticates the caller but grants no direct database role by itself.
- **Email secrets hygiene:** Resend API and webhook signing secrets live only as Supabase Edge Function secrets; browser code never sees them.
- **Payment secrets hygiene:** Stripe secret and webhook signing secrets live only as Supabase Edge Function secrets; browser code never sees them.
- **Stripe webhook hardening:** invoice payment updates come only from signed Checkout completion events, and the webhook checks that the Checkout session was created/logged by Tallyo before recording payment. Refund, refund-failure, failed-payment, and dispute lifecycle events are logged only when they map back to a known Tallyo Stripe payment.
- **Customer-contact automation is opt-in:** recurring auto-email is schedule-level opt-in; overdue reminder automation is invoice-level opt-in.
- **Activity history** per document and per recurring schedule (lightweight record; see limitations).

---

## 16. Known security limitations (state honestly; do not overclaim)

- **No GDPR-compliance claim.** The app is **not** certified or "fully compliant". Real data-protection groundwork (privacy policy, lawful basis, data-subject rights, consent/unsubscribe, breach process, registration) is **future work** and required before onboarding real paying customers.
- **Activity history is not a tamper-proof audit log** — it lives in editable records. Provider events and selected sensitive app actions now use append-only `audit_events`; company/settings saves are logged by category only, without storing the actual settings values. Full monitoring/compliance audit coverage is still future work.
- **Backup posture is in progress:** Supabase Pro daily backups were verified through 2026-07-14 and seven-day operational retention is documented in `BACKUP_RESTORE_RUNBOOK.md`; an Owner-approved timed restore test remains.
- **Supabase has no native recovery codes.** Tallyo supports a second authenticator and blocks email-only MFA recovery. A server-managed one-time recovery-code candidate is implemented on `codex/mfa-recovery-codes` with HMAC-only storage, throttling, factor/session cleanup, database-enforced recovery lock, and forced TOTP re-enrolment. Local checks pass, but production still uses the approved deny-by-default response until the migration, secret, Edge Function, live probes, and browser acceptance are completed. Supabase leaked-password protection remains enabled and tested.
- **CSP allows one permissive setting** the in-browser Vue template compilation requires (`unsafe-eval`) — a documented trade-off.
- **Stripe sandbox lifecycle is technically verified, not live-approved:** trusted Checkout binding, successful payment/refund processing, genuine failed-refund reversal, known-payment dispute awareness, unknown-event rejection, and duplicate replay passed. Operational policy, legal/privacy readiness, and explicit live-mode approval are still required before real customer use.
- **Email/payment automation depends on external configuration:** DNS, Resend/Stripe secrets, webhooks, and cron jobs must stay correctly configured.
- **Unknown / needs confirmation:** whether any clickjacking/frame-protection headers are set (GitHub Pages limits response headers).

Always describe security as "controls implemented + honest limitations", never as "secure/compliant".

---

## 17. Known bugs or rough edges

- **Historical naming remains:** repo/folder name and historical threat-model docs still reference InvoicePro; the visible UI, manifest, and icons use Tallyo.
- **Generated invoice numbering** was historically inconsistent (plain number vs prefixed); the Edge Function now prepends the user's prefix — verify consistency across app-generated and server-generated invoices.
- **PWA updates are evidence-backed, not magic.** Build `2026.07.16.1` passed existing-install update acceptance. Keep the visible build marker and increment both build/cache versions for material frontend releases; do not claim future releases updated until observed.
- **Mobile item row** was iteratively tuned (qty/unit stacking, price/disc/tax widths, suggestion-dropdown clipping). Re-test on small screens after any table/layout change.
- **Recurring-from-invoice** does not link the invoice to its spawned schedule; toggling "Repeat" again on the same invoice and re-saving can create a second schedule. No dedup guard.
- **Free-tier pause** can silently stop the daily cron.
- **Unknown / needs confirmation:** exact third-party library versions and the Tailwind input filename in the repo.

---

## 18. Product roadmap

Near-term (in rough order):
1. **Finish the current app, not the future SaaS website.** Keep the app stable and secure before starting Tallyo subscription billing, team workspaces, RBAC, or the public marketing site.
2. **Keep Tallyo rebrand hygiene.** Visible app text, manifest, and icons are done; keep repo/URL unchanged unless Supabase Auth URLs are updated at the same time.
3. **Email/payment phase is implemented for the current app.** Follow `EMAIL_PHASE.md` and `ROADMAP_EMAIL_PAYMENTS.md` for current status and tests.
   - Done: `mail.tallyo.co.uk` Resend sending domain and manual invoice/quote/credit-note email through `send-document-email`.
   - Done: PDF attachment in document emails, using the app-style invoice format.
   - Done: `resend-webhook` delivery tracking writes Resend email lifecycle audit events.
   - Webhook listens for `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.clicked`, `email.failed`, `email.opened`, and `email.received`.
   - Done: user-visible delivery status in the invoice list and document activity panel.
   - Done: opt-in automatic recurring invoice email.
   - Done: manual overdue reminder email through `send-reminder-email`.
   - Done: scheduled overdue reminder automation, opt-in per invoice.
   - Done: Stripe Checkout full-balance and seller-approved deposit payments.
   - Done: hardened Stripe webhook records verified Checkout payments and includes refund/dispute/failed-payment awareness.
   - Done: in-app Stripe refund requests through a server-side Edge Function.
   - Current payment caveat: Stripe should still be treated as test/development until explicitly moved to live mode.
4. **Current hardening priorities:** deploy and accept the implemented all-factors-lost MFA recovery candidate in the backend-first order in `MFA_RECOVERY_RUNBOOK.md`; operationally test and legally review `PAYMENT_OPERATIONS_RUNBOOK.md`; complete the blocked legal/privacy work in `LEGAL_PRIVACY_READINESS.md`; and finish provider decisions in `DEFERRED_MANUAL_CONFIGURATION.md`. Controlled desktop/mobile account-export acceptance, corrected production audit metadata, and PWA update-across-deployment behaviour are Verified.
5. **Data-protection groundwork** before real customer use: privacy policy, terms, retention position, correction/deletion/provider-assistance and restricted-case processes, consent/unsubscribe where relevant, and breach response notes. The account-holder JSON export is one control, not the whole rights-request process.
6. Optional app polish: link invoices to their recurring schedule (dedup guard); clearer payment-state wording; repo/URL rename to Tallyo only with Supabase Auth URL updates.
7. Future phase, deliberately deferred: public website, paid Tallyo subscriptions, plan tiers, server-enforced entitlements, workspaces/teams/RBAC, and SaaS billing.

---

## 19. Website / landing page direction

- A public marketing/landing site does not yet exist and is deliberately deferred until the current app and security hardening work are finished.
- Future suggested direction: a simple, fast landing page at **tallyo.co.uk** describing Tallyo as a secure invoicing + business-records workspace for small businesses, freelancers, tradespeople, consultants, and custom-order businesses.
- Lead with the real benefits: professional invoices/quotes, recurring billing, payment tracking, and honest security. Use custom printing only as one example, not the headline.
- Keep security claims honest (no "GDPR compliant"/"bank-grade"/"unhackable"). Describe actual controls.
- Include a clear call to action (sign up / try it) and a link to the app.

---

## 20. Pricing direction

- No Tallyo subscription pricing is implemented or finalised.
- Pricing and SaaS entitlements are future-phase product decisions, not current app-finishing work.
- Do not build Tallyo subscription billing, platform-fee collection, team workspaces, or plan enforcement until the current app security work and compliance basics are ready.
- Stripe customer invoice payments already exist for the current app flow, but should be treated as test/development until live mode is explicitly approved and configured.

---

## 21. What Codex should do first

1. **Read governance and current sources of truth first:** `AUTOMATION_MODEL_ORCHESTRATION.md`, `TALLYO_LEGAL_COMPLIANCE_AGENT.md`, `AGENT_HIERARCHY_AND_COMPUTER_USE.md`, `AUTONOMOUS_EXECUTION_PERMISSION.md`, `APP_STATUS.md`, `PRODUCT_COMPLETION_LEDGER.md`, `DECISION_LOG.md`, and `RELEASE_READINESS.md`.
2. **Use the hierarchy and locks:** the Master Orchestrator assigns one owner role and work mode, records the task, and acquires a file/path lock before non-trivial edits. Do not edit a file or overlapping scope owned by another active task.
3. **Read `index.html`, `schema.sql`, `recurring_setup.sql`, and the relevant Edge Function** to understand real structure before changing implementation. Trust the code over assumptions.
4. **Confirm the unknowns**: exact Supabase project URL/keys location (`config.js`), Tailwind input filename, and third-party library versions.
5. **Verify Tallyo rebrand hygiene** after UI changes. Keep visible app text, `manifest.json`, and icons branded as Tallyo, and keep the "Change Password" wording exactly as specified.
6. **Re-verify the recurring automation** (function deploys; cron job registered/active) after any backend change.
7. **Set up the local/Codex workflow**: rebuild Tailwind when classes change; after deploy, hard-refresh/Incognito to bypass the service worker.
8. When touching invoices/templates, **respect the column-name mapping** in section 13 (`customer_snapshot`, `issue_date`, `grand_total`, `history`).

### Required handoff

Every material role or session handoff must identify the task ID, source and receiving roles, current status, changed and locked files, branch/commit, tests complete and remaining, security boundary, risks, evidence, next action, and approval need. Do not hand off hidden uncommitted work. Critical verification should be independent from implementation when practical.

---

## 22. What Codex must avoid

- **Do not** put secrets in source: no service role key, DB password, or private credentials in `index.html`, `config.js`, the repo, or committed files. Only publishable/anon keys belong client-side.
- **Do not** claim GDPR compliance or "fully secure/compliant". Keep security wording honest (controls + limitations).
- **Do not** position the product as printing-only; custom printing is one example use case.
- **Do not** rename the GitHub repo / live URL without also updating Supabase Auth allowed/redirect URLs (it will break auth).
- **Do not** change the "Change Password" box wording (must reference the **Current Password**; note: *"Please enter your current password to confirm it's you."*).
- **Do not** break the DB column mapping (e.g. writing `customer` instead of `customer_snapshot`, `date` instead of `issue_date`, or a `totals` object instead of `grand_total`).
- **Do not** weaken Row Level Security, remove SRI/CSP, or run the Edge Function without stamping each generated invoice with the correct `user_id` (the service key bypasses RLS — attribution must be explicit).
- **Do not** assume automation should run globally; recurring email and overdue reminders are explicit opt-ins. Overdue reminders are per invoice.
- **Do not** rely on the service worker serving fresh files; always account for cache after deploys.

