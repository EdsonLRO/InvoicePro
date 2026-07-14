# Tallyo Product Completion Ledger

This ledger tracks product capability status. It complements `APP_STATUS.md`, which remains the short current-stage source of truth.

Statuses: Planned, Investigating, Confirmed, In Progress, Implemented, Verified, Blocked, Deferred, Not Applicable.

## Current App Scope

| Area | Status | Evidence / notes |
|---|---|---|
| Invoices, quotes, credit notes | Implemented | Create, edit, duplicate, delete, convert quote to invoice, export PDF/XLSX. |
| Customers | Implemented | Address book with bulk delete. |
| Saved items | Implemented | Catalogue with bulk delete and bulk price update. |
| Manual payments | Implemented | Record/remove manual payments; removal is confirmed and audited. |
| Stripe invoice payments | Implemented | Server-side Checkout, signed webhook confirmation, deposits, refunds, disputes/failures awareness. Still test/development until live mode is approved. |
| Recurring invoices | Implemented | Server-side scheduled generation and schedule management. |
| Recurring invoice email | Implemented | Opt-in per recurring schedule. |
| Manual document email | Implemented | Resend Edge Function with PDF attachment and payment links. |
| Email delivery status | Implemented | Signed Resend webhook writes provider events; app displays status badges. |
| Overdue reminders | Implemented | Manual reminders and opt-in scheduled automation per invoice. |
| Branding and PDF styling | Implemented | Brand colour, logo position/upload, app-style PDF attachments. |
| Activity history | Implemented | User-facing document/schedule activity history; not tamper-proof. |
| Append-only audit events | In Progress | Provider events and selected app actions covered, including settings saves by category. More automation/backups evidence remains. |
| Account security | In Progress | Supabase Auth, email confirmation, fail-closed TOTP MFA, backup-authenticator support, MFA-gated masked password recovery, password change AAL2 handling, and local/all-devices logout. Primary/backup sign-in, protected factor removal, one enrolled-factor-gated password-recovery path, wrong-code recovery rejection, email-only bypass rejection, and fail-closed lookup simulation passed on 2026-07-14; factor-specific recovery and an all-factors-lost support process remain. |
| Backup and restore | In Progress | Supabase Pro daily backups were listed as completed through 2026-07-13 and seven-day retention is documented in `BACKUP_RESTORE_RUNBOOK.md`; an Owner-approved timed non-production restore test remains. |
| Privacy/legal groundwork | Planned | Privacy policy, terms, retention/export/delete process, breach process. |
| Final mobile/PDF regression | Planned | Needed before treating app as customer-ready. |
| Multi-agent governance and computer-use controls | Verified | One Owner, one Master Orchestrator, nine specialist roles, ten AI functional roles including the Orchestrator, task queue, locks, handoffs, provider controls, and validation are documented. The active Legal, Privacy and Regulatory Agent correction passed repository consistency checks; Owner merge remains separate. |
| Public SaaS website/subscriptions | Deferred | Future phase after current app/security readiness. |

## Orchestrator Queue

The Master Orchestrator owns this queue. Detailed task fields, statuses, assignment, and locking rules are authoritative in `AUTOMATION_MODEL_ORCHESTRATION.md`.

| Task ID | Title | Priority | Status | Owner role | Work mode | Lock state | Evidence / next action |
|---|---|---|---|---|---|---|---|
| GOV-001 | Complete agent governance and computer-use controls | High | Verified | Master Orchestrator | Terra with Sol policy review | Released after commit | Hierarchy, queue, locks, handoffs, provider controls, cross-links, and validation completed. |
| GOV-002 | Correct active Legal, Privacy and Regulatory Agent governance | High | Verified | Legal, Privacy and Regulatory Agent | Terra with Sol legal-risk review | Released after focused corrective commit | Ninth specialist, legal triggers/workflow/dispositions, task fields, cross-review rules, release gate, external-advice limits, and repository-wide consistency checks completed. Owner merge remains separate. |
| OPS-001 | Backup and restore runbook | High | Verified | Release Agent | Terra with Sol review | Released after commit | Pro plan confirmed, seven-day daily-backup procedure documented, restore side effects and Owner cost/destructive boundaries recorded in `BACKUP_RESTORE_RUNBOOK.md`. |
| PAY-TEST-001 | Finish Stripe sandbox lifecycle replay evidence | High | In Progress | Payments Agent | Sol / Terra | Released with focused commit; remaining test subtask unlocked | Signature rejection, unknown-event binding, payment/refund duplicate replay, audit constraints, and Deno checks passed. Known-payment dispute and genuine `refund.failed` positive paths remain. |
| AUTH-001 | Harden MFA and define recovery process | High | In Progress | Security Agent | Sol / Terra | Implementation released on a focused branch; remaining recovery acceptance subtask is unlocked | Primary/backup sign-in, wrong-code sign-in and recovery rejection, email-only bypass rejection, protected backup removal, one-factor preservation, two-factor restoration, one enrolled-factor-gated masked password-recovery path, privacy-safe account-audit review, and fail-closed lookup simulation passed on 2026-07-14. Factor-specific recovery and the all-factors-lost support process remain. |
| DB-001 | Harden internal trigger helper functions | High | Implemented | Security Agent | Sol / Terra | Migration applied; signup acceptance remains unlocked | Empty search paths and least-privilege execution grants are applied. Security advisors are clear, all triggers remain attached, and append-only mutation rejection passed. Run one fresh-signup provisioning check before marking Verified. |
| DB-002 | Optimise RLS identity evaluation and foreign-key lookups | High | Verified | Security Agent | Sol / Terra | Migration applied and released | RLS init-plan and missing-index warnings cleared without changing policy commands, ownership conditions, table RLS state, or security-advisor status. |
| AUTO-001 | Authenticate privileged scheduled automation calls | High | Implemented | Security Agent | Sol / Terra | Migration/function deployed; scheduled acceptance remains unlocked | Current `generate-recurring` v13 retains unsigned-call rejection and both cron jobs use the Vault-backed automation secret. Confirm the next 06:00/09:00 UTC runs before marking Verified. |
| AUTO-002 | Make recurring generation idempotent across partial failures | High | Implemented | Security Agent | Sol / Terra | Migration/function deployed; scheduled acceptance remains unlocked | Per-occurrence uniqueness and conditional claims passed rolled-back live verification; `generate-recurring` v13 is active and unsigned calls fail closed. Confirm the first real run before marking Verified. |

## Current Next Priorities

1. Complete the remaining Stripe sandbox positive-path evidence for a known-payment dispute and genuine `refund.failed` event; duplicate and unknown-event rejection evidence is recorded.
2. Run an Owner-approved timed restore test into a separate environment; current scheduled-backup evidence is verified.
3. Complete AUTH-001 acceptance for factor-specific password recovery and define the all-factors-lost support process; MFA sign-in, backup-factor lifecycle, wrong-code and email-only recovery rejection, one successful MFA-gated recovery path, privacy-safe account-audit review, and fail-closed lookup simulation passed on 2026-07-14.
4. Complete the Supabase Auth policy decisions recorded in `DEFERRED_MANUAL_CONFIGURATION.md`. Leaked-password protection is enabled and advisor-verified.
5. Final mobile/PDF/PWA regression pass.
6. Data-protection/legal groundwork before real customers.

## Completion Rule

Do not mark an area Verified unless there is current test or operational evidence recorded in the relevant handoff, operations doc, or release readiness checklist.
