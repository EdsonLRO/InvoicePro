# PROJECT_HANDOFF.md — Tallyo

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
- **Domain owned:** **tallyo.co.uk** (registered; not yet configured for hosting or email).
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
- Record/remove payments (remove requires confirmation and is logged).
- Status: Draft / Sent / Paid / Cancelled (selector in the top toolbar); auto-marks Paid when balance reaches zero.
- Status badge shown in the invoices list.

**Recurring invoices**
- Set up via a **"Repeat this invoice"** toggle on an invoice (not a separate creation screen).
- Frequencies: weekly, monthly, quarterly, yearly, or custom "every N days/weeks/months".
- End-of-month clamps to the last valid day (e.g. Jan 31 → Feb 28 → Mar 31).
- The invoice being created covers the current period; the schedule generates the **next** one onward.
- Missed periods → one catch-up invoice, then realigns.
- Recurring page is a **management view** (list, due panel, "Generate all due", pause/resume, edit, delete). Schedules keep their own history log.
- **Server-side automation exists** (see section 14).

**Overdue reminders (in-app; sending not automated yet)**
- Overdue panel on the invoices list: overdue invoices, days overdue, outstanding amounts.
- Reminder modal: **drafts reminder text**, copy-to-clipboard, and "Log reminder as sent" (writes a history event).
- **The app cannot actually send email yet** — reminders are drafted for the user to send manually. Email sending is a planned phase.

**Records / other**
- Customers address book; Saved Items catalogue.
- Per-document **Activity History** (timestamped events: created, sent, converted, payment, payment removed, paid, cancelled, status change, recurring-generated, reminder, note; plus free-text notes). Explicitly labelled "activity history, not a tamper-proof audit log".
- Branding page: brand colour (presets + custom), logo position, **logo upload from computer** (resized, size-capped, embedded) or URL, live preview.
- Dashboard, mobile-tuned layouts, PWA (installable; service worker active over HTTPS).

---

## 6. Core user workflows

1. **Create & send an invoice:** New Invoice → pick customer → add line items (autocomplete, time or unit based) → set tax mode → save → mark Sent → export PDF → send manually.
2. **Quote then convert:** Create a quote → send → later open it → Convert to Invoice (in place) → save.
3. **Take payment:** Open invoice → Record Payment → status auto-updates; overpayment/removal handled with confirmation and logging.
4. **Set up recurring billing:** Create an invoice → toggle "Repeat this invoice" → choose frequency → save (schedule created, first future run set automatically). Manage/pause on the Recurring page.
5. **Chase overdue:** Invoices list → overdue panel → open reminder modal → copy drafted text → send manually → log reminder.
6. **Brand documents:** Branding page → set colour, upload logo, choose position → applies to documents and PDFs.
7. **Records/history:** Open any document → Activity History timeline; recurring schedules have their own Schedule History.

---

## 7. Current tech stack

- **Front-end:** Vue 3 (single `index.html` file; no build step for the app itself).
- **Styling:** Tailwind CSS, **self-hosted** compiled build (`tailwind.css`) generated via the Tailwind CLI (not the CDN).
- **Backend:** Supabase — Postgres, Supabase Auth, Row Level Security, Edge Functions, Vault, `pg_cron`, `pg_net`.
- **PDF/export:** client-side (jsPDF + html2canvas; SheetJS/xlsx for spreadsheets). **Unknown / needs confirmation:** exact library versions (pinned with SRI in the HTML).
- **Hosting:** GitHub Pages (static). PWA via `manifest.json` + `service-worker.js`.
- **Automation:** Supabase Edge Function (Deno/TypeScript) + `pg_cron` schedule.
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
| `service-worker.js` | PWA caching / offline. Caches aggressively (hard-refresh after deploy). |
| `icon-192.png`, `icon-512.png` | Tallyo PWA icons. |
| `schema.sql` | Full Postgres schema: tables, RLS policies, new-user trigger. |
| `supabase/audit_events.sql` | Draft append-only audit-events table for future email/payment/server-side events. Not wired into the app yet. |
| `recurring_setup.sql` | Creates `recurring_templates` table + its RLS (idempotent). |
| `supabase/functions/generate-recurring/index.ts` | Edge Function (Deno/TS) that generates due recurring invoices. Deployed to Supabase. |
| `SECURITY_OPERATIONS.md` | Practical backup, restore, data-protection, email, payment, and release gates before real users. |
| `EMAIL_PHASE.md` | Staged Resend email plan: DNS setup, manual sending, webhooks, then automation. |
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
- **Edge Functions** (Deno) for server-side recurring generation.
- **Vault** stores the scheduler's auth key (encrypted).
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

---

## 12. MFA flow

- **Optional TOTP MFA** (authenticator-app 6-digit rotating code) via Supabase Auth.
- User enrolls an authenticator; once enabled, sign-in requires password **and** the current TOTP code.
- Verified end-to-end, including that an incorrect code is rejected.
- **Not implemented:** MFA recovery/backup codes. SMS and email MFA are not implemented (and email MFA is considered weaker; not planned as a priority).

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
- `recurring_templates` key fields: `frequency` (weekly/monthly/quarterly/yearly/custom), `custom_interval`, `custom_unit` (days/weeks/months), `start_date`, `next_run`, `active`, `last_generated`, `generated_count`, plus snapshot of customer/items/currency/tax_mode/etc.

A trigger auto-creates an empty `company_settings` row on new user signup.

**Design note:** invoices store a **snapshot** of customer details so historical documents stay correct even if the customer is later edited or deleted.

---

## 14. Recurring invoice system summary

Two layers:

**Client-side (in the app):** define schedules, see what's due, and "Generate all due" while the app is open.

**Server-side automation (live):**
- **Edge Function** `generate-recurring` (`supabase/functions/generate-recurring/index.ts`, Deno/TS):
  - Finds active schedules where `next_run <= today`.
  - For each, generates one invoice (status **Sent**), stamped with the schedule owner's `user_id`, with history entries marking it auto-generated.
  - Advances `next_run` (end-of-month clamp + single catch-up for missed periods), updates `last_generated`/`generated_count`, appends to the schedule's history.
- **Scheduler:** `pg_cron` job `generate-recurring-daily`, cron `0 6 * * *` (06:00 UTC daily), using `pg_net` to POST to the function.
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

**Caveat:** Supabase free tier can pause inactive projects; a paused project won't run cron.

---

## 15. Security decisions already implemented

- **Server-side auth** (Supabase Auth); bcrypt-hashed passwords; the app never stores password hashes.
- **Real email verification** (server-sent link) — replaced an earlier fake client-side code.
- **Optional TOTP MFA**, verified including wrong-code rejection.
- **Row Level Security** on every table — DB-enforced per-user isolation; verified with a deliberate break-test (querying "all" returns only the caller's rows).
- **Front-end integrity:** third-party libraries pinned to exact versions with **Subresource Integrity (SRI)**; **Content-Security-Policy** in place; **self-hosted Tailwind** (removed a live CDN dependency).
- **Transport & at-rest:** HTTPS/TLS in transit; platform encryption at rest.
- **Customer snapshot model** keeps historical invoices correct and avoids live links to personal data that may later be erased.
- **Secrets hygiene:** only public/publishable keys in front-end (`config.js`); **service role key never in source** (runtime-injected). The scheduler uses only the publishable key (least privilege), stored **encrypted in Supabase Vault**, read at runtime by the cron job.
- **Activity history** per document and per recurring schedule (lightweight record; see limitations).

---

## 16. Known security limitations (state honestly; do not overclaim)

- **No GDPR-compliance claim.** The app is **not** certified or "fully compliant". Real data-protection groundwork (privacy policy, lawful basis, data-subject rights, consent/unsubscribe, breach process, registration) is **future work** and required before onboarding real paying customers.
- **Activity history is not a tamper-proof audit log** — it lives in editable records; a true append-only audit log is future work.
- **No formal backups** on the current free tier; no documented retention/restore.
- **MFA has no recovery/backup codes**; no password-strength/breach checks at signup yet.
- **CSP allows one permissive setting** the in-browser Vue template compilation requires (`unsafe-eval`) — a documented trade-off.
- **No email sending yet**, so no automated reminders/notifications; overdue reminders are drafted for manual sending.
- **Unknown / needs confirmation:** whether any clickjacking/frame-protection headers are set (GitHub Pages limits response headers).

Always describe security as "controls implemented + honest limitations", never as "secure/compliant".

---

## 17. Known bugs or rough edges

- **Historical naming remains:** repo/folder name and historical threat-model docs still reference InvoicePro; the visible UI, manifest, and icons use Tallyo.
- **Generated invoice numbering** was historically inconsistent (plain number vs prefixed); the Edge Function now prepends the user's prefix — verify consistency across app-generated and server-generated invoices.
- **Service-worker caching** can serve stale files after deploy; requires hard-refresh / Incognito to confirm changes. Easy to mistake for "deploy didn't work".
- **Mobile item row** was iteratively tuned (qty/unit stacking, price/disc/tax widths, suggestion-dropdown clipping). Re-test on small screens after any table/layout change.
- **Recurring-from-invoice** does not link the invoice to its spawned schedule; toggling "Repeat" again on the same invoice and re-saving can create a second schedule. No dedup guard.
- **Free-tier pause** can silently stop the daily cron.
- **Unknown / needs confirmation:** exact third-party library versions and the Tailwind input filename in the repo.

---

## 18. Product roadmap

Near-term (in rough order):
1. **Keep Tallyo rebrand hygiene**. Visible app text, manifest, and icons are done; keep repo/URL unchanged unless Supabase Auth URLs are updated at the same time.
2. **Safety foundation before real users:** follow `SECURITY_OPERATIONS.md` for backup/restore, basic data-protection groundwork, and trusted audit-event planning.
3. **Email phase. Provider chosen: Resend.** Follow `EMAIL_PHASE.md`.
   - Done: `mail.tallyo.co.uk` Resend sending domain and manual invoice/quote/credit-note email through `send-document-email`.
   - Done: `resend-webhook` delivery tracking writes `email_sent` and `email_delivered` audit events.
   - Next: polish user-visible delivery status in the app.
   - Later: automated recurring invoice emails and overdue reminders after manual sending and webhooks are stable.
4. **Compliance groundwork** before emailing real customers (privacy policy, consent/unsubscribe, data-subject rights).
5. Optional hardening: wire up append-only audit events, formal backups, MFA recovery codes, password-strength/breach checks.
6. Optional: link invoices to their recurring schedule (dedup guard); repo/URL rename to Tallyo (with Supabase Auth URL updates).

---

## 19. Website / landing page direction

- A public marketing/landing site does not yet exist. **Unknown / needs confirmation.**
- Suggested direction: a simple, fast landing page at **tallyo.co.uk** describing Tallyo as a secure invoicing + business-records workspace for small businesses, freelancers, tradespeople, consultants, and custom-order businesses.
- Lead with the real benefits: professional invoices/quotes, recurring billing, payment tracking, and honest security. Use custom printing only as one example, not the headline.
- Keep security claims honest (no "GDPR compliant"/"bank-grade"/"unhackable"). Describe actual controls.
- Include a clear call to action (sign up / try it) and a link to the app.

---

## 20. Pricing direction

- No pricing is implemented or finalised. **Unknown / needs confirmation.**
- Likely shape (to be decided): a free tier for basic single-user invoicing, with a low-cost paid tier unlocking recurring automation, email sending, branding, and higher limits.
- Note real underlying costs before pricing: domain, Supabase tier (free tier pauses on inactivity), and email provider (Resend free tier ~3,000 emails/month, paid from ~$20/month).
- Do not build billing/payment collection until the product and compliance basics are ready.

---

## 21. What Codex should do first

1. **Read `index.html`, `schema.sql`, `recurring_setup.sql`, and the Edge Function** to understand real structure before changing anything. Trust the code over assumptions.
2. **Confirm the unknowns**: exact Supabase project URL/keys location (`config.js`), Tailwind input filename, and third-party library versions.
3. **Verify Tallyo rebrand hygiene** after UI changes. Keep visible app text, `manifest.json`, and icons branded as Tallyo, and keep the "Change Password" wording exactly as specified.
4. **Re-verify the recurring automation** (function deploys; cron job registered/active) after any backend change.
5. **Set up the local/Codex workflow**: rebuild Tailwind when classes change; after deploy, hard-refresh/Incognito to bypass the service worker.
6. When touching invoices/templates, **respect the column-name mapping** in section 13 (`customer_snapshot`, `issue_date`, `grand_total`, `history`).

---

## 22. What Codex must avoid

- **Do not** put secrets in source: no service role key, DB password, or private credentials in `index.html`, `config.js`, the repo, or committed files. Only publishable/anon keys belong client-side.
- **Do not** claim GDPR compliance or "fully secure/compliant". Keep security wording honest (controls + limitations).
- **Do not** position the product as printing-only; custom printing is one example use case.
- **Do not** rename the GitHub repo / live URL without also updating Supabase Auth allowed/redirect URLs (it will break auth).
- **Do not** change the "Change Password" box wording (must reference the **Current Password**; note: *"Please enter your current password to confirm it's you."*).
- **Do not** break the DB column mapping (e.g. writing `customer` instead of `customer_snapshot`, `date` instead of `issue_date`, or a `totals` object instead of `grand_total`).
- **Do not** weaken Row Level Security, remove SRI/CSP, or run the Edge Function without stamping each generated invoice with the correct `user_id` (the service key bypasses RLS — attribution must be explicit).
- **Do not** assume email sending works — it is not built yet.
- **Do not** rely on the service worker serving fresh files; always account for cache after deploys.

