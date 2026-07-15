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
| Stripe invoice payments | Verified | Server-side Checkout, signed webhook confirmation, deposits, refunds, failed-refund reversal, and dispute awareness passed the recorded sandbox lifecycle and replay checks. Live mode remains disabled and approval-gated. |
| Recurring invoices | Implemented | Server-side scheduled generation and schedule management. |
| Recurring invoice email | Implemented | Opt-in per recurring schedule. |
| Manual document email | Implemented | Resend Edge Function with PDF attachment and payment links. |
| Email delivery status | Implemented | Signed Resend webhook writes provider events; app displays status badges. |
| Overdue reminders | Implemented | Manual reminders and opt-in scheduled automation per invoice. |
| Branding and PDF styling | Implemented | Brand colour, logo position/upload, app-style PDF attachments. |
| Activity history | Implemented | User-facing document/schedule activity history; not tamper-proof. |
| Append-only audit events | In Progress | Provider events and selected app actions covered. Failed-email audits were minimised on 2026-07-14 so they no longer retain recipient addresses or raw provider bodies; privacy-safe restore evidence is recorded separately. |
| Account security | In Progress | Supabase Auth, email confirmation, leaked-password protection, a verified 12-character provider minimum, fail-closed TOTP MFA, backup-authenticator support, MFA-gated masked password recovery, password change AAL2 handling, and local/all-devices logout. Primary/backup sign-in, protected factor removal, primary-specific and backup-specific recovery, wrong-code recovery rejection, email-only bypass rejection, and fail-closed lookup simulation passed on 2026-07-14. AUTH-001 is Verified. Broader provider policy decisions and robust all-factors-lost recovery remain paid/public-launch work. |
| Backup and restore | Verified | A selected daily backup restored to an isolated project on 2026-07-15. Exact row/schema counts matched, copied automation was disabled, and restored RLS read/write probes passed. Temporary-project deletion remains approval-gated cleanup. |
| Privacy/legal groundwork | In Progress | Internal data-flow, role, vendor, retention, rights, incident, claims, working ROPA, DPIA screening, case templates, and fictional tabletop evidence now exist. Public notices, a restricted case system, live operational testing, final decisions and external review remain. |
| Final mobile/PDF regression | In Progress | Public shell passed desktop and 390x844 layout checks. Authenticated workflows and long/mobile PDF downloads remain. |
| Multi-agent governance and computer-use controls | Verified | One Owner, one Master Orchestrator, nine specialist roles, ten AI functional roles including the Orchestrator, task queue, locks, handoffs, provider controls, validation, and the active Legal Agent correction are merged and documented. |
| Public SaaS website/subscriptions | Deferred | Future phase after current app/security readiness. |

## Orchestrator Queue

The Master Orchestrator owns this queue. Detailed task fields, statuses, assignment, and locking rules are authoritative in `AUTOMATION_MODEL_ORCHESTRATION.md`.

| Task ID | Title | Priority | Status | Owner role | Work mode | Lock state | Evidence / next action |
|---|---|---|---|---|---|---|---|
| GOV-001 | Complete agent governance and computer-use controls | High | Verified | Master Orchestrator | Terra with Sol policy review | Released after commit | Hierarchy, queue, locks, handoffs, provider controls, cross-links, and validation completed. |
| GOV-002 | Correct active Legal, Privacy and Regulatory Agent governance | High | Verified | Legal, Privacy and Regulatory Agent | Terra with Sol legal-risk review | Merged and released | Ninth specialist, legal triggers/workflow/dispositions, task fields, cross-review rules, release gate, external-advice limits, and repository-wide consistency checks completed. |
| OPS-001 | Backup and restore runbook | High | Verified | Release Agent | Terra with Sol review | Evidence complete; cleanup approval pending | Pro plan and daily-backup procedure documented. The 2026-07-15 isolated restore passed data, structure, automation-isolation, and tenant-boundary checks; evidence is in `BACKUP_RESTORE_TEST_EVIDENCE_2026-07-15.md`. |
| PAY-TEST-001 | Finish Stripe sandbox lifecycle replay evidence | High | Verified | Payments Agent | Sol / Terra | Released after focused evidence commit | Signature rejection, unknown-event binding, payment/refund replay, a known-payment dispute, a genuine asynchronous failed refund with balance restoration, and duplicate replay idempotency passed in Stripe sandbox. Privacy-safe evidence is recorded in `STRIPE_SANDBOX_TEST_EVIDENCE.md`. |
| AUTH-001 | Harden MFA and define recovery process | High | Verified | Security Agent | Sol / Terra | Acceptance evidence complete on focused branch | Primary/backup sign-in, wrong-code sign-in and recovery rejection, email-only bypass rejection, protected backup removal, one-factor preservation, two-factor restoration, primary-specific and backup-specific masked password recovery, privacy-safe account-audit review, fail-closed lookup simulation, and provider leaked-password rejection passed on 2026-07-14. The interim all-factors-lost process is approved; robust recovery remains a separate paid/public-launch condition. |
| DB-001 | Harden internal trigger helper functions | High | Verified | Security Agent | Sol / Terra | Migration and acceptance evidence complete | Empty search paths and least-privilege execution grants are applied. Security advisors are clear, all triggers remain attached, append-only mutation rejection passed, and a confirmed fresh signup created exactly one matching `company_settings` row on 2026-07-14 with no missing or orphan settings rows. |
| DB-002 | Optimise RLS identity evaluation and foreign-key lookups | High | Verified | Security Agent | Sol / Terra | Migration applied and released | RLS init-plan and missing-index warnings cleared without changing policy commands, ownership conditions, table RLS state, or security-advisor status. |
| AUTO-001 | Authenticate privileged scheduled automation calls | High | Verified | Security Agent | Sol / Terra | Scheduled acceptance complete | Both cron jobs use the Vault-backed automation secret; protected functions reached HTTP 200 on 2026-07-14 and unsigned recurring calls fail closed. |
| AUTO-002 | Make recurring generation idempotent across partial failures | High | In Progress | Security Agent | Sol / Terra | Function v14 deployed; natural timeout acceptance pending | Uniqueness/conditional claims and ownership checks passed; no duplicate, owner mismatch, or generated-event anomaly was present on 2026-07-14. Confirm the next natural run under the corrected timeout. |
| AUTO-003 | Preserve scheduled automation response evidence | Medium | In Progress | Security Agent | Sol / Terra | Live cron commands hardened; natural acceptance pending | Both active jobs retain schedules and Vault authentication with explicit 30-second pg_net timeouts. Confirm the next natural 06:00/09:00 UTC response evidence. |
| LEGAL-OPS-001 | Prepare privacy operations records and DPIA screening | High | In Progress | Legal, Privacy and Regulatory Agent | Sol / Terra | Internal records and tabletop complete; release lock retained | Working ROPA, rights/incident/vendor/retention templates, preliminary DPIA screening, and fictional tabletop evidence are recorded in `LEGAL_OPERATIONS_RECORDS.md` and `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md`. Restricted live case tooling, final legal decisions, verified operations, public documents, and professional review remain blocked. |

## Current Next Priorities

1. Obtain Owner approval and permanently delete the now-validated temporary restore project.
2. Complete the remaining Supabase Auth policy decisions recorded in `DEFERRED_MANUAL_CONFIGURATION.md`. AUTH-001 is Verified; leaked-password protection is enabled, advisor-verified, and rejection-tested, and the provider minimum is 12 characters. Robust all-factors-lost recovery remains a paid/public-launch condition.
3. Resolve and legally review the internal payment operations procedure in `PAYMENT_OPERATIONS_RUNBOOK.md` before real customers.
4. Complete authenticated mobile/PDF/PWA acceptance; the public shell checks are recorded.
5. Resolve the blocking gaps from `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md`, verify operations in a restricted system, and obtain approval for customer-facing documents.

## Completion Rule

Do not mark an area Verified unless there is current test or operational evidence recorded in the relevant handoff, operations doc, or release readiness checklist.
