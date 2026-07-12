# SUPABASE_HANDOFF.md — Tallyo (code name: InvoicePro)

> How Supabase is used in this app. For another developer or AI coding agent.
> Read before touching auth, the database, RLS, the Edge Function, or the scheduler.
> The public app brand is now **Tallyo**. The original **InvoicePro** name remains in the repo/URL context and some historical/internal references.
>
> Parts of this document were verified against the live database earlier (column list, RLS policies, and cron jobs). Newer email/payment migrations are documented from repo SQL files and should be confirmed against the target Supabase project after they are run.

---

## 1. Supabase project overview

- **Backend platform:** Supabase — Postgres database, Supabase Auth, Row Level Security (RLS), Edge Functions, Vault, and Postgres scheduling (`pg_cron` + `pg_net`).
- **Region:** eu-west-2 (West Europe / London).
- **Front-end connection:** the Vue 3 single-page app (`index.html`) talks directly to Supabase via the Supabase JS client, using the **public/publishable (anon) key**. All data access is scoped per user by RLS.
- **Server-side:** Edge Functions handle recurring invoice generation, email delivery, overdue reminders, and Stripe Checkout/webhooks using server-side secrets.
- **Project URL:** `https://cuagwifetheefftleeup.supabase.co` (public base URL; confirmed from the live cron job command). The publishable key and full config live in `config.js` in the repo.
- **Current boundary:** this handoff describes the current app. Future SaaS subscriptions, workspaces, teams, RBAC, and Tallyo platform billing are deferred and should not be mixed into ordinary app-finishing work.

---

## 2. Auth settings

- **Provider:** Supabase Auth with email + password.
- Passwords are hashed server-side by Supabase (bcrypt). The app never stores or sees password hashes.
- On sign-in, Supabase issues a short-lived signed **JWT** session token held client-side; the raw password is not retained by the app.
- **Email confirmation is required** before an account is usable (see §3).
- **Allowed / redirect URLs:** configured in Supabase Auth to match the deployed site URL. **Important:** if the site URL changes (e.g. a GitHub repo/URL rename during the Tallyo rebrand), these must be updated or auth breaks. **Unknown / needs confirmation** — exact configured URLs.
- **Unknown / needs confirmation:** exact session/JWT expiry, password policy, and rate-limit settings (Supabase defaults assumed).

---

## 3. Email confirmation flow

1. User signs up with email + password.
2. Supabase sends a **confirmation email with a verification link** (server-sent, not generated in the browser).
3. The account must be confirmed via that link before it can be used.
4. On the free tier, Supabase's built-in email sending has low rate limits; heavy testing can hit them. **Unknown / needs confirmation:** whether a custom SMTP provider is configured (assume default Supabase email unless the dashboard says otherwise).

---

## 4. Password reset flow

- Supabase Auth supports password reset via a reset email link.
- The app also has an in-app **"Change Password"** feature for a signed-in user. Its box asks for the user's **Current Password**, with the note *"Please enter your current password to confirm it's you."* — keep this wording consistent with the field.
- When MFA is enabled, Change Password must verify a fresh TOTP code after the current-password reauth. Supabase requires an AAL2 session before password updates on MFA accounts.
- **Unknown / needs confirmation:** whether the logged-out "forgot password" reset flow is wired in the UI, or only the signed-in change-password flow. Verify in `index.html`.

---

## 5. MFA / TOTP flow

- **Optional TOTP MFA** (authenticator-app 6-digit rotating code) via Supabase Auth's MFA (factors / AAL) support.
- Flow: user enrolls an authenticator app; once enabled, sign-in requires password **and** the current TOTP code.
- Verified end-to-end including rejection of an incorrect code.
- **Not implemented:** MFA recovery/backup codes. SMS and email MFA are not implemented.
- **Future account safety:** add "log out from all devices" through Edge Functions, not directly from the browser. The flow should send an email verification code/link, confirm it server-side, revoke active sessions/refresh tokens, and write an `account_sessions_revoked` audit event.
- **Unknown / needs confirmation:** exact enrollment/verification UI location in `index.html`.

---

## 6. Tables used by the app

All in the `public` schema. All have RLS enabled and are scoped to the owning user via `user_id`.

- `company_settings`
- `customers`
- `saved_items`
- `invoices`
- `recurring_templates`
- `audit_events`

---

## 7. Per-table details

> Column lists below are the **live** columns exported from the running database.

### `company_settings`
- **Purpose:** one row per user holding their business profile and defaults.
- **Owner field:** `user_id` (uuid, **primary key**, NOT NULL). One-to-one with the auth user.
- **Columns:** `user_id` (uuid, PK), `name`, `address`, `phone`, `mobile`, `email`, `tax_id`, `additional_info`, `logo_url` (all text), `invoice_prefix` (text, default `''`), `quote_prefix` (text, default `'QUO-'`), `credit_prefix` (text, default `'CN-'`), `default_currency` (text, default `'GBP'`), `payment_details`, `default_notes`, `default_terms`, `invoice_footer` (text), `updated_at` (timestamptz, default `now()`), `brand_color` (text, default `'#4f46e5'`), `logo_position` (text, default `'left'`).
- **Relationships:** one-to-one with the auth user; `invoice_prefix` is used when generating invoice numbers.
- **RLS:** select/insert/update/delete only where `auth.uid() = user_id`.
- **Note:** a signup trigger auto-creates an empty row for each new user. **Unknown / needs confirmation:** trigger presence in the live DB (defined in `schema.sql`; not re-verified by the exports provided).

### `customers`
- **Purpose:** the user's reusable customer address book.
- **Owner field:** `user_id` (uuid, NOT NULL, default `auth.uid()`).
- **Columns:** `id` (uuid, PK, default `gen_random_uuid()`), `user_id`, `name` (text, NOT NULL), `address`, `phone`, `mobile`, `email`, `tax_id`, `additional_info` (text), `created_at` (timestamptz, default `now()`).
- **Relationships:** referenced loosely by invoices; invoices store a **snapshot** of customer details rather than a hard dependency.
- **RLS:** own rows only (all four commands scoped to `auth.uid() = user_id`).

### `saved_items`
- **Purpose:** reusable line-item catalogue (autocomplete when adding invoice lines).
- **Owner field:** `user_id` (uuid, NOT NULL, default `auth.uid()`).
- **Columns:** `id` (uuid, PK, default `gen_random_uuid()`), `user_id`, `name` (text, NOT NULL), `description` (text), `price` (numeric, default `0`), `created_at` (timestamptz, default `now()`).
- **Relationships:** independent; used to populate invoice line items in the UI.
- **RLS:** own rows only.

### `invoices`
- **Purpose:** one row per document — invoice, quote, or credit note.
- **Owner field:** `user_id` (uuid, NOT NULL, default `auth.uid()`).
- **Columns:** `id` (uuid, PK, default `gen_random_uuid()`), `user_id`, `doc_type` (text, NOT NULL, default `'invoice'`), `number` (text, NOT NULL), `status` (text, NOT NULL, default `'Draft'`), `issue_date` (date), `due_date` (date), `po_number` (text), `currency` (text, default `'GBP'`), `customer_id` (uuid, nullable), **`customer_snapshot`** (jsonb, nullable), `items` (jsonb, NOT NULL, default `'[]'`), `payments` (jsonb, NOT NULL, default `'[]'`), `global_discount` (numeric, default `0`), `tax_rate` (numeric, default `0`), `shipping_cost` (numeric, default `0`), `tip` (numeric, default `0`), `notes` (text), `terms` (text), **`grand_total`** (numeric, default `0`), `created_at` (timestamptz, default `now()`), `updated_at` (timestamptz, default `now()`), `tax_mode` (text, default `'exclusive'`), **`history`** (jsonb, default `'[]'`).
- **Relationships:** optional soft link to `customers` via `customer_id`; the authoritative customer data is `customer_snapshot`, so historical documents stay correct if the customer is later edited/deleted.
- **RLS:** own rows only.
- **Column-name cautions (app field ≠ DB column):** customer is **`customer_snapshot`** (not `customer`); issue date is **`issue_date`** (not `date`); total is **`grand_total`** (not a `totals` object).
- **Notes:** a `tip` column exists (numeric, default 0) — legacy/optional; not prominently used in the current UI. Invoice numbering uses the user's `invoice_prefix`. **Unknown / needs confirmation:** the unique index on `(user_id, doc_type, number)` is defined in `schema.sql` but was not included in the exports provided — confirm with `pg_indexes` if needed.

**Newer invoice migrations:** if applied, `supabase/invoice_payment_options.sql` adds `online_payment_mode` and `deposit_amount`; `supabase/invoice_overdue_reminders.sql` adds `overdue_reminders_enabled`, `overdue_first_reminder_days`, `overdue_repeat_reminder_days`, and `overdue_max_reminders`.

**Payment/reminder notes:** `online_payment_mode` + `deposit_amount` control emailed Stripe payment links. The overdue reminder columns control per-invoice automatic reminder opt-in and cadence; Company Settings only provides defaults.

### `audit_events`
- **Purpose:** trusted server-side/provider event log for email and payments.
- **Writers:** Edge Functions and verified provider webhooks using the service role key. The browser should not insert/update/delete audit events.
- **Used by:** Resend send/delivery events, Stripe checkout-created/payment-completed events, and app-visible email status badges.
- **Security note:** invoice `history` remains a useful user-facing activity log, but it is not tamper-proof. Use `audit_events` for stronger provider-backed records.

### `recurring_templates`
- **Purpose:** recurring-billing schedules — a recipe that spawns invoices. NOT an invoice itself.
- **Owner field:** `user_id` (uuid, NOT NULL, default `auth.uid()`).
- **Columns:** `id` (uuid, PK, default `gen_random_uuid()`), `user_id`, `name` (text), `customer_snapshot` (jsonb), `items` (jsonb, NOT NULL, default `'[]'`), `currency` (text, default `'GBP'`), `global_discount` (numeric, default `0`), `tax_mode` (text, default `'exclusive'`), `shipping_cost` (numeric, default `0`), `notes` (text), `terms` (text), `frequency` (text, NOT NULL, default `'monthly'`), `custom_interval` (integer, default `1`), `custom_unit` (text, default `'months'`), `start_date` (date, NOT NULL, default `CURRENT_DATE`), **`next_run`** (date, NOT NULL, default `CURRENT_DATE`), `active` (boolean, NOT NULL, default `true`), `last_generated` (date), `generated_count` (integer, default `0`), `created_at` (timestamptz, default `now()`), `updated_at` (timestamptz, default `now()`), **`history`** (jsonb, default `'[]'`).
- **Relationships:** generates rows in `invoices` (each generated invoice is an independent document stamped with the same `user_id`).
- **RLS:** own rows only.
- **Note:** `next_run` is the key field the scheduled Edge Function reads to decide what's due. `frequency` ∈ {weekly, monthly, quarterly, yearly, custom}; `custom_unit` ∈ {days, weeks, months}.

---

## 8. RLS policies summary

**Verified against the live database for the original core user-owned tables.** RLS is enabled on the core business tables. Those tables use policies scoped to the current user:

| Command | Rule |
|---|---|
| SELECT | `using (auth.uid() = user_id)` |
| INSERT | `with check (auth.uid() = user_id)` |
| UPDATE | `using (auth.uid() = user_id)` **and** `with check (auth.uid() = user_id)` |
| DELETE | `using (auth.uid() = user_id)` |

Policy names follow the pattern `own <table> - <command>` where applicable, for example `own invoices - select`. Roles are evaluated against the authenticated `auth.uid()`.

- Core user-owned tables use the `auth.uid() = user_id` pattern.
- `auth.uid()` is the verified logged-in user's ID from Supabase Auth; it cannot be forged by the client.
- With RLS enabled and no matching policy, the default is deny-all.
- **Do not** disable RLS or broaden a policy without a clear, documented reason.
- **Service role caveat:** Edge Functions using the service role key bypass RLS entirely, which is why they must explicitly stamp `user_id` on every row they write.

`audit_events` is different by design:

- Users may read their own audit events.
- Browser clients should not insert, update, or delete audit events.
- Trusted Edge Functions and verified provider webhooks insert audit events with the service role key.
- Updates/deletes are blocked by trigger in `supabase/audit_events.sql`.
- `log-app-event` records selected authenticated user actions such as deletes, exports, payment removal, MFA/password changes, and recurring schedule changes with privacy-safe metadata.
- Reconfirm the live policy/trigger state after applying or changing this migration.

---
## 9. Storage buckets, if any

- **No Supabase Storage buckets are known to be in use.** Logos are handled either as a pasted URL or uploaded and **embedded** (base64) directly, not stored in a bucket.
- **Unknown / needs confirmation:** whether any bucket exists in the project dashboard. If file uploads move to real storage later, add a bucket with per-user path scoping and policies.

---

## 10. Edge functions, if any

- **Function:** `generate-recurring` (Deno / TypeScript), at `supabase/functions/generate-recurring/index.ts`.
- **Purpose:** server-side recurring invoice generation with no browser open.
- **Behaviour:** finds active `recurring_templates` where `next_run <= today`; for each, generates one invoice (status `Sent`) **stamped with the schedule owner's `user_id`**, appends history entries, then advances `next_run` (end-of-month clamp + single catch-up for missed periods) and updates `last_generated` / `generated_count` / the schedule's `history`. Invoice numbers use the user's `invoice_prefix`.
- **Auth model:** uses the **service role key** (bypasses RLS). The key is injected by the platform at runtime (`SUPABASE_SERVICE_ROLE_KEY`) and is **never in source or committed**.
- **Deploy:** `supabase functions deploy generate-recurring`.
- **Critical rule:** because RLS does not protect this path, correct per-user attribution (`user_id`) must be enforced in code for every write.

Other current Edge Functions:

- `send-document-email` - authenticated user function; sends documents through Resend, can attach a PDF, and can create Stripe payment links.
- `send-reminder-email` - authenticated user function; sends one manual overdue reminder and logs history.
- `send-overdue-reminders` - scheduled function protected by `AUTOMATION_SECRET`; sends only for invoices explicitly opted in to automatic reminders.
- `resend-webhook` - verifies Resend webhook signatures and records email lifecycle events.
- `create-stripe-checkout` - authenticated user function; creates Stripe Checkout sessions for the caller's own invoice.
- `create-stripe-refund` - authenticated user function; requests Stripe refunds for the caller's own confirmed Stripe payment rows.
- `log-app-event` - authenticated user function; writes allowlisted sensitive app-action events into `audit_events` without exposing direct browser writes.
- `stripe-webhook` - verifies Stripe signatures; records Checkout completion only when the Checkout session was created/logged by Tallyo; logs failed-payment/dispute/refund-failure lifecycle events; records successful refunds as locked negative Stripe payment entries.
- Current sandbox Stripe webhook events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `refund.created`, `refund.updated`, `refund.failed`, `charge.dispute.created`, `charge.dispute.updated`, `charge.dispute.closed`, `charge.dispute.funds_withdrawn`, and `charge.dispute.funds_reinstated`.

Deploy after edits:

```
supabase functions deploy <function-name>
```

---

## 11. Scheduled jobs / cron jobs

**Verified against the live database (`cron.job`).**

- **Extensions:** `pg_cron` (scheduling) and `pg_net` (HTTP calls from the database) are enabled.
- **Job:** `generate-recurring-daily` (jobid 1), schedule **`0 6 * * *`** (06:00 UTC daily), `active = true`.
- **What it runs:** a `net.http_post` to the Edge Function URL
  `https://cuagwifetheefftleeup.supabase.co/functions/v1/generate-recurring`,
  with the `Authorization: Bearer` header value read from **Supabase Vault at runtime** via
  `select decrypted_secret from vault.decrypted_secrets where name = 'project_anon_key'`,
  and an empty JSON body. **No key is written inline** in the job — only the Vault lookup.
- **Verify job registered/active:**
  ```sql
  select jobid, jobname, schedule, active from cron.job
  where jobname = 'generate-recurring-daily';
  ```
- **Verify recent runs:**
  ```sql
  select jobid, status, return_message, start_time, end_time
  from cron.job_run_details
  where jobid = (select jobid from cron.job where jobname = 'generate-recurring-daily')
  order by start_time desc limit 5;
  ```
- **Caveat:** on the Supabase free tier, a paused/inactive project will not run cron.

Additional scheduled job:

- **Job:** `send-overdue-reminders-daily`, schedule commonly **`0 9 * * *`** (09:00 UTC daily), calls `send-overdue-reminders`.
- It should send the `x-automation-secret` header using a secret value, never a committed value.
- Verify it separately with `cron.job` and `cron.job_run_details` after registering or changing it.

---

## 12. Supabase Vault usage

- **Vault** stores the key the cron job uses to invoke the Edge Function, encrypted at rest.
- **Secret name in use:** **`project_anon_key`** (holds the **publishable/anon** key — least privilege; only enough to trigger the function, not the service role key). This is the exact name referenced by the live cron job.
- The cron SQL reads it at runtime via `select decrypted_secret from vault.decrypted_secrets where name = 'project_anon_key'`.
- **Never** print, log, or commit the decrypted value. Vault secret **values** must never appear in code, docs, or commits (names are fine).

---

## 13. Environment variables needed

Names only — never commit real values.

**Edge Function runtime (provided automatically by Supabase; do not hardcode):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — **service role; server-side only; never client-side or committed**
- `SUPABASE_ANON_KEY`
- `SUPABASE_DB_URL`

**Front-end (public, safe to ship in client):**
- Supabase project URL (`https://cuagwifetheefftleeup.supabase.co`) and the publishable/anon key — supplied via `config.js`. Public by design; RLS protects the data.

**Vault (secret name, not a value):**
- `project_anon_key`

- e.g. `RESEND_API_KEY` — server-side only when added; never client-side or committed.

**Current custom Edge Function secrets (names only):**
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AUTOMATION_SECRET`
- `APP_BASE_URL`

Provide a `.env.example` with placeholders if env files are introduced; never commit a real `.env`.

---

## 14. Local development setup

- Tools: Node.js, the **Supabase CLI**, and Git. (Author's environment: Windows + VS Code.)
- Log in and link the project:
  ```
  supabase login
  supabase link --project-ref cuagwifetheefftleeup
  supabase projects list        # confirm the linked project shows ● in the LINKED column
  ```
- Deploy the function after edits:
  ```
  supabase functions deploy generate-recurring
  ```
- List custom secrets (reserved `SUPABASE_*` are auto-injected and won't appear here):
  ```
  supabase secrets list
  ```
- Notes: keep the working folder out of cloud-sync folders (OneDrive caused file-lock issues with `supabase link`); if a CLI command is "not recognized" right after install, reopen the terminal (PATH refresh); the CLI may warn "Docker is not running" — harmless for cloud deploys.

---

## 15. Deployment notes

- **Front-end** is a static site (GitHub Pages): deploy by committing `index.html` and `tailwind.css` (rebuild Tailwind when classes change). After deploy, hard-refresh / use Incognito — the service worker caches aggressively.
- **Edge Function** deploys via the Supabase CLI (above), independent of the front-end.
- **Database changes** are applied by running SQL in the Supabase SQL Editor (`schema.sql`, `recurring_setup.sql`, and any `alter table … add column if not exists …` migrations). Migrations should be idempotent.
- **Auth URLs:** if the site URL changes, update Supabase Auth allowed/redirect URLs to match.

---

## 16. Security risks and limitations

- **Service role key** grants full, RLS-bypassing access — it must stay server-side only; a leak would be critical. Never place it in client code or commits.
- **Activity history** (`history` columns) is a convenience log, **not a tamper-proof audit log** — it lives in user-editable rows.
- **Audit events** now cover provider events and selected sensitive app actions, but broader monitoring, alerting, and compliance evidence are still future work.
- **No formal backups** on the current free tier; free-tier projects can pause and stop cron.
- **MFA has no recovery/backup codes**; the app has local password-strength checks, but Supabase Auth password policy/rate-limit settings and breached-password screening still need confirmation.
- **No "log out from all devices" control yet**; this should be added as a verified server-side session-revocation flow.
- **CSP** allows one permissive setting the in-browser Vue template compiler needs (documented trade-off).
- **Data protection:** the app is **built with data protection principles in mind**, but is **not** certified or "GDPR compliant." Formal compliance work (privacy policy, lawful basis, data-subject rights, retention, breach process) is future work — do not claim compliance.
- **Unknown / needs confirmation:** custom SMTP config, exact JWT/session expiry, and whether any response security headers (e.g. frame protection) are set (GitHub Pages limits headers).

---

Additional current limitation: Stripe in-app refund requests and failed-payment/refund/dispute awareness are deployed and subscribed in the sandbox webhook destination, but still need broader replay testing, live-mode setup, and operational policy before real customer use.

## 17. What Codex must not break

- **RLS on any table** — never disable or broaden policies without a documented reason. Keep `auth.uid() = user_id` scoping.
- **Service-role boundary** — never move the service role key into client code; never commit it.
- **Edge Function attribution** — every generated row must carry the correct `user_id` (RLS won't catch mistakes here).
- **Cron schedule** — don't break `generate-recurring-daily`; re-verify after function changes.
- **Vault usage** — don't inline the invoke key into the cron job or expose the decrypted value; keep the `project_anon_key` lookup.
- **DB column mapping** — keep `customer_snapshot`, `issue_date`, `grand_total`, and `history` correct.
- **Unique invoice numbering** — respect `(user_id, doc_type, number)` uniqueness and the `invoice_prefix`.
- **Auth URLs** — don't change the site URL without updating Supabase Auth settings.
- **Change Password wording** — keep the Current Password field and its note.

---

## 18. Unknowns / needs confirmation

- Exact configured Auth allowed/redirect URLs.
- Whether a custom SMTP provider is configured (vs default Supabase email).
- Whether the logged-out "forgot password" reset flow is wired in the UI, or only the signed-in change-password flow.
- Exact session/JWT expiry, password policy, and rate-limit settings.
- Whether any Supabase Storage bucket exists (assumed none; logos are embedded/URL).
- Presence of the new-user trigger and the `(user_id, doc_type, number)` unique index in the live DB (defined in `schema.sql`; not covered by the exports provided — confirm with `pg_indexes` / `pg_trigger` if needed).
- Whether any security response headers are set at the hosting layer.
- Exact third-party library versions used in the front-end (pinned with SRI in `index.html`).

