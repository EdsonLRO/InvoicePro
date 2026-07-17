# SUPABASE_HANDOFF.md — Tallyo (code name: InvoicePro)

> How Supabase is used in this app. For another developer or AI coding agent.
> Read before touching auth, the database, RLS, the Edge Function, or the scheduler.
> Also read `AUTOMATION_MODEL_ORCHESTRATION.md` for Backend/Supabase ownership, Sol review boundaries, task locks, and handoffs. Supabase changes affecting personal data, retention, deletion, exports, vendors, transfers, incidents, or public launch also require the active review defined in `TALLYO_LEGAL_COMPLIANCE_AGENT.md`. Dashboard inspection or change follows `AGENT_HIERARCHY_AND_COMPUTER_USE.md`.
> The public app brand is now **Tallyo**. The original **InvoicePro** name remains in the repo/URL context and some historical/internal references.
>
> Parts of this document were verified against the live database earlier (column list, RLS policies, and cron jobs). Newer email/payment migrations are documented from repo SQL files and should be confirmed against the target Supabase project after they are run.

---

## 1. Supabase project overview

- **Backend platform:** Supabase — Postgres database, Supabase Auth, Row Level Security (RLS), Edge Functions, Vault, and Postgres scheduling (`pg_cron` + `pg_net`).
- **Organisation plan:** Pro, confirmed through the Supabase organisation API on 2026-07-13. Pro scheduled database backups are documented in `BACKUP_RESTORE_RUNBOOK.md`; PITR is not approved or assumed enabled.
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
- **Leaked-password protection is enabled** (`password_hibp_enabled=true`), the live security advisor cleared its warning on 2026-07-13, and a safe known-compromised-password rejection test passed on 2026-07-14.
- **Allowed / redirect URLs:** configured in Supabase Auth to match the deployed site URL. **Important:** if the site URL changes (e.g. a GitHub repo/URL rename during the Tallyo rebrand), these must be updated or auth breaks. Exact URL review remains an Owner acceptance item.
- **Live provider snapshot (updated 2026-07-15):** JWT lifetime 3600 seconds; refresh-token rotation enabled with a 10-second reuse interval; session timebox 168 hours; inactivity timeout 24 hours; single-session enforcement disabled; provider minimum password length 12 with no required character classes; email confirmation required; leaked-password protection enabled; email OTP expiry 3600 seconds with 8 digits; CAPTCHA not configured; email/token-refresh/verification rate limits 2/150/30. The active session values were saved and read back after a production dashboard reload.

---

## 3. Email confirmation flow

1. User signs up with email + password.
2. Supabase sends a **confirmation email with a verification link** (server-sent, not generated in the browser).
3. The account must be confirmed via that link before it can be used.
4. The live built-in email-send limit was 2 per hour on 2026-07-13. Custom SMTP configuration and final onboarding limits remain an Owner decision in `DEFERRED_MANUAL_CONFIGURATION.md`.

---

## 4. Password reset flow

- Supabase Auth supports password reset via a reset email link.
- The app also has an in-app **"Change Password"** feature for a signed-in user. Its box asks for the user's **Current Password**, with the note *"Please enter your current password to confirm it's you."* — keep this wording consistent with the field.
- When MFA is enabled, Change Password prompts for and verifies a fresh TOTP code after the current-password reauth. Supabase requires an AAL2 session before password updates on MFA accounts.
- The logged-out reset flow is wired in `index.html` with masked new-password and confirmation fields. It must successfully list verified factors before enabling the update and requires a selected TOTP factor when MFA exists.
- Email recovery is not an MFA bypass. If factor discovery fails, the app stops recovery. If every authenticator is lost, there is no self-service shortcut; see `MFA_RECOVERY_RUNBOOK.md`.

---

## 5. MFA / TOTP flow

- **Optional TOTP MFA** (authenticator-app 6-digit rotating code) via Supabase Auth's MFA (factors / AAL) support.
- Flow: user enrolls a primary authenticator app; once enabled, sign-in requires password **and** the current TOTP code. MFA assurance and factor-list failures now stop sign-in instead of continuing at AAL1.
- Primary and backup sign-in, incorrect-code rejection, protected factor replacement/removal, AAL2 password change, and MFA-gated password recovery were verified end to end on 2026-07-14.
- The Account page supports one backup authenticator. Either verified TOTP factor can complete sign-in or password recovery. Either factor can be retired only while the other remains, using a fresh code from the remaining factor; MFA disablement also requires a fresh code. These actions are audit-event allowlisted.
- Supabase does not provide native recovery codes. SMS and email MFA are not implemented, and email possession alone does not bypass TOTP.
- **Backend-deployed recovery candidate:** `mfa-recovery` version 1, the server-only pepper, and migrations through `20260716161054` are deployed. Boundary, privilege, AAL, rolled-back RLS, authenticated code lifecycle, audit-minimisation, two-account, and rollback-only live-throttling probes pass. Notification delivery, final legal disposition, and real-device acceptance remain required before publishing the frontend; production user support remains deny-by-default meanwhile.
- **Implemented account safety:** the Account page now separates local sign-out from all-devices sign-out. Local sign-out uses Supabase `scope: 'local'`. All-devices sign-out requires the current password, asks for MFA when AAL2 is required, writes an app audit event, then uses Supabase global sign-out to revoke refresh tokens across devices.
- **Session-expiry handling:** the browser handles unexpected Supabase `SIGNED_OUT` events by clearing all loaded customer/business state and returning to login. Session-generation checks prevent delayed initial business-data, audit, or MFA responses from repopulating state after sign-out. Intentional logout remains quiet.
- **Future account safety:** optionally upgrade all-devices sign-out to an Edge Function backed email verification code/link flow before revocation, with a dedicated `account_sessions_revoked`-style audit event.
- Enrollment and backup-factor management are in the Account Security section of `index.html`. Operational handling is documented in `MFA_RECOVERY_RUNBOOK.md`.

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
- **Note:** a live signup trigger auto-creates an empty row for each new user. Its helper was hardened with an empty search path and trigger-only execution privileges on 2026-07-13. A confirmed fresh signup created one matching `company_settings` row on 2026-07-14, with aggregate counts matched and no missing/orphan settings rows.

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
- **Relationships:** optional soft link to `customers` via `customer_id`; the authoritative customer data is `customer_snapshot`, so historical documents stay correct if the customer is later edited/deleted. Generated recurring invoices additionally carry nullable `recurring_template_id` and `recurring_occurrence_date`; their partial unique index permits only one attributed invoice per schedule occurrence.
- **RLS:** own rows only.
- **Column-name cautions (app field ≠ DB column):** customer is **`customer_snapshot`** (not `customer`); issue date is **`issue_date`** (not `date`); total is **`grand_total`** (not a `totals` object).
- **Notes:** a `tip` column exists (numeric, default 0) — legacy/optional; not prominently used in the current UI. Invoice numbering uses the user's `invoice_prefix`. The schema includes unique `(user_id, doc_type, number)` enforcement and an index on `customer_id` for the foreign key.

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
- `log-app-event` records selected authenticated user actions such as deletes, document/account exports, manual payment recording/removal, manual document-status changes, MFA/password changes, session logout scope, recurring schedule changes, and company/settings saves with privacy-safe metadata. The account-export event contains format/version only; exported content, counts, filenames, customer data, and Auth metadata are not sent to the function.
- Reconfirm the live policy/trigger state after applying or changing this migration.

---
## 9. Storage buckets, if any

- **No Supabase Storage buckets are known to be in use.** Logos are handled either as a pasted URL or uploaded and **embedded** (base64) directly, not stored in a bucket.
- **Unknown / needs confirmation:** whether any bucket exists in the project dashboard. If file uploads move to real storage later, add a bucket with per-user path scoping and policies.

---

## 10. Edge functions, if any

- **Function:** `generate-recurring` (Deno / TypeScript), at `supabase/functions/generate-recurring/index.ts`.
- **Purpose:** server-side recurring invoice generation with no browser open.
- **Behaviour:** finds active `recurring_templates` where `next_run <= today`; for each, creates or reuses the uniquely attributed schedule occurrence, then conditionally advances the expected `next_run`. Only the invocation that wins that claim may email. The invoice is status `Sent`, stamped with the schedule owner's `user_id`, and the schedule updates `last_generated`, `generated_count`, and history. Invoice numbers use the user's `invoice_prefix`.
- **Auth model:** uses the **service role key** (bypasses RLS). The key is injected by the platform at runtime (`SUPABASE_SERVICE_ROLE_KEY`) and is **never in source or committed**.
- **Caller gate:** platform JWT verification is intentionally disabled for the scheduler, so the function requires `x-automation-secret` to match the server-side `AUTOMATION_SECRET` before creating the service-role client. Unsigned calls fail with HTTP 401.
- **Deploy:** `supabase functions deploy generate-recurring`.
- **Critical rule:** because RLS does not protect this path, correct per-user attribution (`user_id`) must be enforced in code for every write.

Other current Edge Functions:

- `send-document-email` - authenticated user function; sends documents through Resend, can attach a PDF, and can create Stripe payment links.
- `send-reminder-email` - authenticated user function; sends one manual overdue reminder and logs history.
- `send-overdue-reminders` - scheduled function protected by `AUTOMATION_SECRET`; sends only for invoices explicitly opted in to automatic reminders. Deployed version 8 records minimised provider/history failure evidence and returns a non-success response if any eligible invoice fails.
- `mfa-recovery` - **version 1 deployed, frontend withheld pending acceptance**; authenticated recovery-code generation/recovery/completion function. It uses the service role only after user JWT validation, requires AAL2 for generation/completion, and requires a password-authenticated AAL1 session plus a saved one-time code to start all-factors-lost recovery.
- `resend-webhook` - verifies Resend webhook signatures and records email lifecycle events.
- `create-stripe-checkout` - authenticated user function; creates Stripe Checkout sessions for the caller's own invoice.
- `create-stripe-refund` - authenticated user function; requests Stripe refunds for the caller's own confirmed Stripe payment rows.
- `log-app-event` - authenticated user function; deployed version 7 writes allowlisted sensitive app-action events, including format/version-only account-export success evidence, into `audit_events` without exposing direct browser writes.
- `stripe-webhook` - verifies Stripe signatures; records Checkout completion only when the Checkout session was created/logged by Tallyo; logs failed-payment/dispute/refund-failure lifecycle events; records successful refunds as locked negative Stripe payment entries.
- Current sandbox Stripe webhook events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `refund.created`, `refund.updated`, `refund.failed`, `charge.dispute.created`, `charge.dispute.updated`, `charge.dispute.closed`, `charge.dispute.funds_withdrawn`, and `charge.dispute.funds_reinstated`.

Dependency rule: every function source pins `@supabase/supabase-js` to `2.110.1`, and every function directory carries a Deno v4 lockfile with the matching remote-module digest. Do not replace the exact version with `@2`, `latest`, a caret, or another floating specification. Review and regenerate all locks with the repository's Deno `2.2.15` LTS compatibility line before an intentional dependency deployment. `tests/edge-dependency-pin-harness.cjs` enforces the pin and lock rule; `.github/workflows/security-checks.yml` runs frozen checks for all ten repository functions with read-only permissions and no secrets.

Live deployment snapshots: on 2026-07-13 the original nine functions were active; `generate-recurring` was v13 and `resend-webhook` was v11 after the hardening/type-check deployments. On 2026-07-16, JWT-protected `mfa-recovery` version 1 became the tenth active function. JWT verification is enabled for user-authenticated functions and intentionally disabled only for signature-verified provider webhooks or custom-secret scheduled functions.

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
  with `x-automation-secret` read from **Supabase Vault at runtime** via
  `select decrypted_secret from vault.decrypted_secrets where name = 'automation_secret'`,
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
- **Plan note:** the organisation is now Pro, so the former Free-tier inactivity-pause limitation no longer applies. Daily physical backups were verified through 2026-07-14. Cron jobs must still be monitored and disabled immediately in any restored clone.

Additional scheduled job:

- **Job:** `send-overdue-reminders-daily` (jobid 3), schedule **`0 9 * * *`** (09:00 UTC daily), `active = true`, calls `send-overdue-reminders`.
- It sends `x-automation-secret` by retrieving `automation_secret` from Vault at runtime, never from committed or inline plaintext.
- Both protected functions returned HTTP 200 on 2026-07-14. The recurring pg_net request exhausted its former short response timeout even though the function completed; both cron commands now use a 30-second response timeout. Confirm the next natural response rows as recorded in `DEFERRED_MANUAL_CONFIGURATION.md`.

---

## 12. Supabase Vault usage

- **Vault** stores the custom scheduler secret used to invoke scheduled Edge Functions, encrypted at rest.
- **Secret name in use:** **`automation_secret`**. This is a dedicated caller-authentication secret, not the service role key and not a browser key.
- Both cron commands read it at runtime via `select decrypted_secret from vault.decrypted_secrets where name = 'automation_secret'` and send it as `x-automation-secret`.
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
- `automation_secret`

- e.g. `RESEND_API_KEY` — server-side only when added; never client-side or committed.

**Current custom Edge Function secrets (names only):**
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AUTOMATION_SECRET`
- `APP_BASE_URL`
- `MFA_RECOVERY_PEPPER` - required by the deployed `mfa-recovery` Edge Function; server-side only, never display, log, or commit its value.

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
- **Audit events** now cover provider events, selected sensitive app actions, recurring-generation failures, and minimised overdue-reminder provider/history failures. Broader monitoring, alerting, backup/restore evidence integration, and compliance evidence are still future work.
- **Backup posture is verified for the current scope:** Pro daily backups through 2026-07-14 and the operating procedure are documented in `BACKUP_RESTORE_RUNBOOK.md`. A selected backup restored to an isolated project on 2026-07-15; schema/data counts and RLS probes passed, copied automation was disabled, and the temporary project was deleted after approval.
- **MFA recovery backend is deployed but not fully accepted.** Existing primary/backup-factor recovery remains Verified and email-only bypass remains blocked. Schema, secret, function, boundary, privilege, rolled-back AAL/RLS, authenticated lifecycle, audit-minimisation, and rollback-only live-throttling probes pass; notification delivery, final legal disposition, and real-device acceptance remain before frontend publication.
- **Supabase Auth posture reviewed through 2026-07-15:** email confirmation and leaked-password protection are enabled; the provider minimum is 12 characters; anonymous sign-in and phone/social providers are disabled; JWT lifetime remains one hour with refresh rotation. The 168-hour session timebox and 24-hour inactivity timeout are active; single-session enforcement remains disabled. Rate-limit, SMTP, and abuse-control decisions remain open.
- **Internal trigger functions were hardened on 2026-07-13 and accepted on 2026-07-14:** `handle_new_user()` and `prevent_audit_event_mutation()` use fixed empty search paths and are not directly executable by `anon` or `authenticated`. Advisors are clear, append-only enforcement passed, and fresh-signup provisioning produced one matching settings row with no missing/orphan rows.
- **All-devices logout exists** with current-password confirmation, MFA when required, an app audit event, and Supabase global sign-out. A stronger future version could add email-code confirmation and server-side revocation evidence.
- **CSP** allows one permissive setting the in-browser Vue template compiler needs (documented trade-off).
- **Data protection:** the app is **built with data protection principles in mind**, but is **not** certified or "GDPR compliant." Formal compliance work (privacy policy, lawful basis, data-subject rights, retention, breach process) is future work — do not claim compliance.
- **Deferred manual configuration:** custom SMTP, CAPTCHA, rate limits, Auth connection strategy, and exact redirect URL acceptance are recorded in `DEFERRED_MANUAL_CONFIGURATION.md`. The session timebox/inactivity policy is active and evidence-backed. GitHub Pages still limits response-header control.

---

Additional current limitation: Stripe in-app refund requests and failed-payment/refund/dispute awareness are deployed and subscribed in the sandbox webhook destination, but still need broader replay testing, live-mode setup, and operational policy before real customer use.

## 17. What Codex must not break

- **RLS on any table** — never disable or broaden policies without a documented reason. Keep `auth.uid() = user_id` scoping.
- **Service-role boundary** — never move the service role key into client code; never commit it.
- **Edge Function attribution** — every generated row must carry the correct `user_id` (RLS won't catch mistakes here).
- **Cron schedule** — don't break `generate-recurring-daily`; re-verify after function changes.
- **Vault usage** — don't inline the invoke secret into a cron job or expose the decrypted value; keep the `automation_secret` lookup and `x-automation-secret` gate.
- **DB column mapping** — keep `customer_snapshot`, `issue_date`, `grand_total`, and `history` correct.
- **Unique invoice numbering** — respect `(user_id, doc_type, number)` uniqueness and the `invoice_prefix`.
- **Auth URLs** — don't change the site URL without updating Supabase Auth settings.
- **Change Password wording** — keep the Current Password field and its note.
- **Governance boundary** — Supabase Auth, RLS, service-role, Vault, secret, restore, and destructive work requires the assigned Backend/Supabase role, task/path lock, evidence, and Sol review where defined. Computer use defaults to Read only.

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

