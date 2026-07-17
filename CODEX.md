# CODEX.md — Working Guide for Tallyo

> Instructions for an AI coding agent (Codex) working on this repository.
> Start with `AGENTS.md`, `APP_STATUS.md`, and `docs/INDEX.md`. Read this guide when routed here. When unsure, ask or mark **Unknown / needs confirmation** rather than guessing.
> Read the compact core context, classify the task, and use `docs/INDEX.md` to load only the specialist documents triggered by the task's scope and risk. A complete governance review is required only for governance, architecture, major cross-cutting changes, security-critical work, legally material work or release preparation.

---

## 1. Product summary

Tallyo is a **secure invoice, customer, payment, recurring invoice, and business-records workspace** for small businesses. It lets a user create and manage invoices, quotes, and credit notes; keep a customer address book; record payments; run recurring invoices (including server-side automation); chase overdue payments; and keep a timestamped activity history per document.

The app is currently a **Vue 3 single-page front-end** (one `index.html` file) backed by **Supabase** (Postgres, Auth, Row Level Security, Edge Functions). It is deployed as a static site (GitHub Pages) and is PWA-enabled.

**Current development boundary:** finish the existing app and its security hardening first. The public website, paid Tallyo subscriptions, plan tiers, workspaces/teams/RBAC, and SaaS billing are future-phase work and must not be started unless the user explicitly asks to begin that phase.

**Note:** the visible app brand is now **Tallyo**. The old name `InvoicePro` remains in the repo/folder name, historical docs, and some non-user-facing internals.

---

## 2. Brand rules

- Public brand name is **Tallyo**. Domain: **tallyo.co.uk**.
- User-facing branding should say **Tallyo**. Keep any remaining `InvoicePro` references only where they are historical, repo/URL-related, or clearly non-user-facing.
- Do **not** rename the GitHub repository or change the live URL without also updating Supabase Auth allowed/redirect URLs — doing so will break authentication.
- Keep wording **plain, professional, and direct**. No hype, no buzzwords, no exclamation-heavy copy.
- Do not change the "Change Password" box wording: it must ask for the user's **Current Password**, with the note *"Please enter your current password to confirm it's you."*

---

## 3. Target audience

Tallyo serves **small businesses broadly** — including freelancers, sole traders, service providers, consultants, tradespeople, and custom-order businesses.

- **Custom printing / apparel is only one example use case.** Never position the product as printing-only.
- Assume mostly UK-based users (GBP), non-technical, often on mobile. Keep flows simple and mobile-friendly.

---

## 4. Security rules

Security is a core part of this product. Treat it as a first-class requirement, not an afterthought.

- **Never expose secrets** in code, commits, logs, or client-side files.
- **Never use service role keys in client-side code.** Only the public/publishable (anon) Supabase key belongs in the front-end. The service role key is server-side only (Edge Function runtime / Supabase secrets).
- **Never remove or weaken Row Level Security (RLS) assumptions without explaining why** in the change description. Every table is scoped per user via `user_id` + RLS; the app relies on the database enforcing isolation.
- Preserve the existing controls: **Supabase Auth**, **MFA (TOTP)**, **Content-Security-Policy (CSP)**, and **Subresource Integrity (SRI)** on third-party scripts. Do not remove SRI hashes, loosen CSP, or unpin library versions without explanation.
- In the recurring Edge Function (which runs with a service key that bypasses RLS), **every generated row must be explicitly stamped with the correct `user_id`.** Do not rely on RLS to catch mistakes there.
- **Never claim "GDPR compliant"** in code, UI, marketing, or docs unless it has been formally reviewed. Use **"built with data protection principles in mind"** instead.
- Do not overclaim security generally (avoid "unhackable", "bank-grade", "fully secure"). Describe real controls plus honest limitations.

---

## 5. Supabase rules

- The backend is Supabase (Postgres + Auth + RLS + Edge Functions). Region: eu-west-2.
- Keep **RLS enabled on every table**; each policy scopes access to `auth.uid() = user_id`.
- Respect the existing **column-name mapping** (DB uses snake_case; some names differ from app fields). Known important ones:
  - Customer on an invoice is stored as **`customer_snapshot`** (JSONB), not `customer`.
  - Issue date column is **`issue_date`**, not `date`.
  - Document total is **`grand_total`** (a number), not a `totals` object.
  - `invoices` and `recurring_templates` each have a **`history`** JSONB column.
  - `items` and `payments` are JSONB arrays; `doc_type` ∈ {invoice, quote, credit}; `status` ∈ {Draft, Sent, Paid, Cancelled}.
- Invoice numbers are unique per `(user_id, doc_type, number)` and use the user's `invoice_prefix` from `company_settings`.
- SQL migrations should be **idempotent** where possible (`if not exists`, `drop policy if exists` before `create policy`).
- After changing the recurring Edge Function, redeploy it (`supabase functions deploy generate-recurring`) and re-verify the `pg_cron` job is still registered and active.
- **Unknown / needs confirmation:** exact project URL/keys — read them from `config.js` in the repo, do not assume.

---

## 6. Secrets / env rules

- **Never commit real `.env` files** or any file containing secrets. Add them to `.gitignore` if not already ignored.
- Only **public/publishable** Supabase keys may appear in client-side code (e.g. `config.js`) — this is acceptable because RLS protects the data.
- Service role keys, database passwords, email-provider API keys, and any private credentials must **never** be in the repo or client code. They live in Supabase secrets / Vault / provider dashboards.
- If example configuration is needed, provide a `.env.example` with placeholder values only.
- If you find a real secret committed anywhere, flag it clearly and treat it as needing rotation — do not silently ignore it.

---

## 7. Coding style

- Keep the existing structure unless there's a clear reason to change it: the front-end is a single `index.html` with an inline Vue app; Tailwind is compiled to a self-hosted `tailwind.css`.
- When adding Tailwind classes, **rebuild the stylesheet** (Tailwind CLI) — new classes won't work until `tailwind.css` is regenerated.
- **Do not rename internal variables unnecessarily.** Only rename identifiers when they are user-facing (e.g. brand text) or when a rename is genuinely needed for clarity/correctness — and explain why.
- Preserve the row↔object mapper pattern; keep DB column names correct (see Supabase rules).
- Make focused, minimal changes. Prefer small, reviewable diffs over large rewrites.
- Match the existing formatting and conventions already present in the file.
- Add brief comments only where intent is non-obvious.

---

## 8. UI/UX style

- Clean, simple, professional. Plain and direct wording; no marketing fluff inside the app.
- Mobile-first: the app is frequently used on phones. Test layouts at small widths (the item table, dropdowns, and forms have been tuned for mobile — don't regress them).
- Keep the current design language (Tailwind utility classes, existing spacing/typography, brand colour theming) consistent.
- Honest microcopy: label things for what they truly do (e.g. "activity history, not a tamper-proof audit log"; "reminder drafted for you to send" while email sending isn't built).
- Accessibility basics: readable contrast, sensible labels, keyboard-usable controls.

---

## 9. Marketing website direction

- A public landing site does not yet exist and is deliberately deferred until the app/security hardening work is finished.
- Future suggested direction for **tallyo.co.uk**: a simple, fast landing page describing Tallyo as a secure invoicing and business-records workspace for small businesses, freelancers, tradespeople, consultants, and custom-order businesses.
- Lead with real benefits: professional invoices/quotes, recurring billing, payment tracking, and honest security.
- Use custom printing only as **one example**, never the headline.
- Security wording must be honest: describe actual controls (Supabase Auth, MFA, RLS, CSP, SRI). Do **not** say "GDPR compliant"; use **"built with data protection principles in mind"**.
- Clear call to action (sign up / try the app) and a link to the app.

Do not introduce Tallyo subscription billing, workspaces, RBAC, or SaaS entitlements during ordinary app-finishing tasks. Those belong to the later SaaS conversion phase.

---

## 10. Things Codex must not break

- **RLS / per-user isolation** — never disable or bypass without explanation.
- **Auth, MFA, CSP, SRI** — don't remove or weaken these controls.
- **Secrets hygiene** — never move a secret into client code or commit one.
- **DB column mapping** — don't write `customer` instead of `customer_snapshot`, `date` instead of `issue_date`, or a `totals` object instead of `grand_total`.
- **Recurring automation** — the Edge Function must keep stamping the correct `user_id`; don't break the `pg_cron` schedule.
- **"Change Password" wording** — must reference the Current Password with the exact note.
- **Service worker / caching awareness** — after deploys, files are cached aggressively; don't assume a change is broken when it's just cached (hard-refresh / Incognito).
- **Repo/URL name** — don't rename without updating Supabase Auth URLs.
- **Existing mobile layout fixes** — don't regress the item row, price/disc/tax widths, or suggestion dropdown behaviour.

---

## 11. First tasks Codex should perform

1. **Load compact context:** read `AGENTS.md`, `APP_STATUS.md`, `docs/INDEX.md`, any real active-task record, and source files directly affected by the task.
2. **Classify and route:** identify task risk and specialist triggers, then load only the policies and evidence routed by `docs/INDEX.md`. Read complete relevant specialist policies for high-risk work.
3. **Read affected code before implementation:** inspect the files and mappings the change actually touches. Confirm anything marked "Unknown / needs confirmation" from source rather than assumptions.
4. **Maintain the visible Tallyo rebrand:**
   - Keep user-facing app text, `manifest.json`, and PWA icons branded as Tallyo.
   - Do **not** rename the repo/URL unless Supabase Auth allowed/redirect URLs are updated at the same time.
5. **Validate proportionately:** run focused checks for narrow changes and full regression only for cross-cutting or release work.
6. **Re-verify recurring automation** only when the relevant backend/function or scheduler boundary changed.
7. Keep SaaS subscriptions/website work deferred unless explicitly requested.

---

## 12. Definition of done for code changes

A change is "done" when all of the following hold:

- The app builds/loads and the affected flow works end to end (manually verified).
- **No secrets** added to the repo or client code; no real `.env` committed.
- **RLS, Auth, MFA, CSP, SRI** are intact (or any change is explicitly justified in the change description).
- **DB column names** are correct; row↔object mappers still line up.
- If Tailwind classes were added, **`tailwind.css` was rebuilt**.
- If the Edge Function changed, it was **redeployed** and the **cron job re-verified**.
- User-facing wording is plain, professional, honest, and uses **Tallyo** (not InvoicePro). No "GDPR compliant" claim — "built with data protection principles in mind" where relevant.
- The diff is focused and minimal; no unnecessary variable renames.
- Mobile layout still works; no regressions to previously tuned screens.
- Any assumptions or unresolved unknowns are called out in the change description.

---

## 13. Condensed agent governance

- Tallyo uses one Owner, one Master Orchestrator, nine specialist functional roles, and three work modes: Luna, Terra, and Sol. There are ten AI functional roles when the Orchestrator is included; the Owner is separate.
- The Orchestrator owns the queue, role assignment, mode selection, locks, evidence, approvals, and closure.
- The Legal, Privacy and Regulatory Agent is an active specialist. Assign it whenever a task meets a mandatory legal trigger or legal materiality is uncertain; a legal block cannot be silently overridden.
- Functional roles are responsibilities; work modes are reasoning levels. Do not claim concurrent/background agents unless the environment supports them.
- When concurrency is unavailable, perform roles sequentially and record material handoffs.
- One agent owns a file or overlapping edit scope at a time.
- Computer use defaults to Read only. Material dashboard changes stop at the Owner boundary.
- Never reveal secrets or cross financial, production-security, destructive, legal, identity, real-customer, or live-launch boundaries without approval.
- Close a task only after implementation, testing, required independent review, documentation, evidence, commit, and lock release.

