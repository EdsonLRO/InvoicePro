# Tallyo Product Completion Ledger

This ledger tracks product capability status. It complements `APP_STATUS.md`, which remains the short current-stage source of truth.

Statuses: Planned, Investigating, Confirmed, In Progress, Implemented, Verified, Blocked, Deferred, Not Applicable.

## Current App Scope

| Area | Status | Evidence / notes |
|---|---|---|
| Invoices, quotes, credit notes | Implemented | Create, edit, duplicate, delete, convert quote to invoice, export PDF/XLSX. |
| Customers | Implemented | Address book with bulk delete. |
| Saved items | Implemented | Catalogue with bulk delete and bulk price update. |
| Manual payments | Implemented | Record/remove manual payments; removal is confirmed, and both recording and removal produce privacy-safe append-only audit events. |
| Stripe invoice payments | Verified | Server-side Checkout, signed webhook confirmation, deposits, refunds, failed-refund reversal, and dispute awareness passed the recorded sandbox lifecycle and replay checks. Live mode remains disabled and approval-gated. |
| Recurring invoices | Implemented | Server-side scheduled generation and schedule management. |
| Recurring invoice email | Implemented | Opt-in per recurring schedule. |
| Manual document email | Implemented | Resend Edge Function with PDF attachment and payment links. |
| Email delivery status | Implemented | Signed Resend webhook writes provider events; app displays status badges. |
| Overdue reminders | Implemented | Manual reminders and opt-in scheduled automation per invoice. |
| Branding and PDF styling | Implemented | Brand colour, logo position/upload, app-style PDF attachments. |
| Activity history | Implemented | User-facing document/schedule activity history; not tamper-proof. |
| Append-only audit events | In Progress | Provider events and selected app actions covered. Failed-email and overdue-reminder failure evidence is minimised. Deployed `log-app-event` v5 also covers manual payment recording/removal and manual status changes without customer or free-text payment data. Privacy-safe restore evidence is recorded separately. |
| Account security | In Progress | Supabase Auth, email confirmation, leaked-password protection, a verified 12-character provider minimum, fail-closed TOTP MFA, backup-authenticator support, MFA-gated masked password recovery, password change AAL2 handling, and local/all-devices logout. Primary/backup sign-in, protected factor removal, recovery rejection/acceptance, and fail-closed lookup simulation passed. Unexpected provider sign-out clears in-memory business data while intentional logout stays quiet; merged deployment acceptance passed on 2026-07-15. The Owner-approved 7-day timebox and 24-hour inactivity timeout are active and were read back from production. AUTH-001 is Verified. Robust all-factors-lost recovery remains paid/public-launch work. |
| Backup and restore | Verified | A selected daily backup restored to an isolated project on 2026-07-15. Exact row/schema counts matched, copied automation was disabled, restored RLS read/write probes passed, and the temporary project was deleted after approval. |
| Privacy/legal groundwork | In Progress | Internal data-flow, role, vendor, retention, rights, incident, claims, working ROPA, DPIA screening, case templates, and fictional tabletop evidence now exist. Public notices, a restricted case system, live operational testing, final decisions and external review remain. |
| Final mobile/PDF regression | Verified | Public shell layout, authenticated real-phone PDF download, PWA installation, offline shell fallback, and reconnection passed. The 689,481-byte, three-page A4 fixture had no cuts or split rows and was about 98.1% smaller than the previous export. PWA update-across-deployment is tracked separately. |
| Multi-agent governance and computer-use controls | Verified | One Owner, one Master Orchestrator, nine specialist roles, ten AI functional roles including the Orchestrator, task queue, locks, handoffs, provider controls, validation, and the active Legal Agent correction are merged and documented. |
| Public SaaS website/subscriptions | Deferred | Future phase after current app/security readiness. |

## Orchestrator Queue

The Master Orchestrator owns this queue. Detailed task fields, statuses, assignment, and locking rules are authoritative in `AUTOMATION_MODEL_ORCHESTRATION.md`.

| Task ID | Title | Priority | Status | Owner role | Work mode | Lock state | Evidence / next action |
|---|---|---|---|---|---|---|---|
| GOV-001 | Complete agent governance and computer-use controls | High | Verified | Master Orchestrator | Terra with Sol policy review | Released after commit | Hierarchy, queue, locks, handoffs, provider controls, cross-links, and validation completed. |
| GOV-002 | Correct active Legal, Privacy and Regulatory Agent governance | High | Verified | Legal, Privacy and Regulatory Agent | Terra with Sol legal-risk review | Merged and released | Ninth specialist, legal triggers/workflow/dispositions, task fields, cross-review rules, release gate, external-advice limits, and repository-wide consistency checks completed. |
| OPS-001 | Backup and restore runbook | High | Verified | Release Agent | Terra with Sol review | Evidence and cleanup complete | Pro plan and daily-backup procedure documented. The 2026-07-15 isolated restore passed data, structure, automation-isolation, and tenant-boundary checks; the temporary project was deleted after approval. Evidence is in `BACKUP_RESTORE_TEST_EVIDENCE_2026-07-15.md`. |
| PAY-TEST-001 | Finish Stripe sandbox lifecycle replay evidence | High | Verified | Payments Agent | Sol / Terra | Released after focused evidence commit | Signature rejection, unknown-event binding, payment/refund replay, a known-payment dispute, a genuine asynchronous failed refund with balance restoration, and duplicate replay idempotency passed in Stripe sandbox. Privacy-safe evidence is recorded in `STRIPE_SANDBOX_TEST_EVIDENCE.md`. |
| AUTH-001 | Harden MFA and define recovery process | High | Verified | Security Agent | Sol / Terra | Acceptance evidence complete on focused branch | Primary/backup sign-in, wrong-code sign-in and recovery rejection, email-only bypass rejection, protected backup removal, one-factor preservation, two-factor restoration, primary-specific and backup-specific masked password recovery, privacy-safe account-audit review, fail-closed lookup simulation, and provider leaked-password rejection passed on 2026-07-14. The interim all-factors-lost process is approved; robust recovery remains a separate paid/public-launch condition. |
| DB-001 | Harden internal trigger helper functions | High | Verified | Security Agent | Sol / Terra | Migration and acceptance evidence complete | Empty search paths and least-privilege execution grants are applied. Security advisors are clear, all triggers remain attached, append-only mutation rejection passed, and a confirmed fresh signup created exactly one matching `company_settings` row on 2026-07-14 with no missing or orphan settings rows. |
| DB-002 | Optimise RLS identity evaluation and foreign-key lookups | High | Verified | Security Agent | Sol / Terra | Migration applied and released | RLS init-plan and missing-index warnings cleared without changing policy commands, ownership conditions, table RLS state, or security-advisor status. |
| AUTO-001 | Authenticate privileged scheduled automation calls | High | Verified | Security Agent | Sol / Terra | Scheduled acceptance complete | Both cron jobs use the Vault-backed automation secret; protected functions completed their next natural HTTP 200 runs on 2026-07-15 and unsigned recurring calls fail closed. |
| AUTO-002 | Make recurring generation idempotent across partial failures | High | Verified | Security Agent | Sol / Terra | Natural acceptance complete | The protected v14 function completed its natural 2026-07-15 06:00 UTC run. The cron run succeeded, pg_net retained HTTP 200, and database checks found zero duplicate occurrence groups and zero generated-owner mismatches. No schedule was due, so no invoice or email was expected. |
| AUTO-003 | Preserve scheduled automation response evidence | Medium | Verified | Security Agent | Sol / Terra | Natural acceptance complete | Both active jobs completed naturally on 2026-07-15 at 06:00/09:00 UTC. Cron recorded success and retained pg_net responses were HTTP 200 with no timeout or transport error. |
| LEGAL-OPS-001 | Prepare privacy operations records and DPIA screening | High | In Progress | Legal, Privacy and Regulatory Agent | Sol / Terra | Internal records and tabletop complete; release lock retained | Working ROPA, rights/incident/vendor/retention templates, preliminary DPIA screening, and fictional tabletop evidence are recorded in `LEGAL_OPERATIONS_RECORDS.md` and `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md`. Restricted live case tooling, final legal decisions, verified operations, public documents, and professional review remain blocked. |
| SUPPLY-001 | Enforce Edge Function and security-harness checks in CI | Medium | Verified | Security Agent | Terra with Sol review | PR #25 remote run passed | Immutable action pins, exact Deno `2.2.15` LTS, frozen v4 per-function locks, all nine checks, workflow self-audit, and focused Node harnesses pass locally. GitHub `Security checks` run `29417705148` also completed successfully without secrets or write permissions. |
| SUPPLY-002 | Require the verified security gate on `main` | Medium | Verified | Security Agent | Sol review | PR #26 run `29423597762` passed | Owner-approved GitHub ruleset `18994100` is active for default `main`, has no bypass actors, blocks deletion/force-push, requires pull requests with zero approvals, and enforced the successful GitHub Actions `verify` job on PR #26's latest branch state. |

## Current Next Priorities

1. Complete the remaining Supabase Auth SMTP/rate-limit and abuse-control decisions recorded in `DEFERRED_MANUAL_CONFIGURATION.md`. AUTH-001 is Verified; leaked-password protection is enabled and rejection-tested, the provider minimum is 12 characters, and the 7-day/24-hour session policy is active. Robust all-factors-lost recovery remains a paid/public-launch condition.
2. Resolve and legally review the internal payment operations procedure in `PAYMENT_OPERATIONS_RUNBOOK.md` before real customers.
3. Observe the installed PWA updating across a later deployment. Phone PDF, installation, offline shell fallback, and reconnection are verified; offline authentication and customer data are intentionally unsupported.
4. Resolve the blocking gaps from `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md`, verify operations in a restricted system, and obtain approval for customer-facing documents.

## Completion Rule

Do not mark an area Verified unless there is current test or operational evidence recorded in the relevant handoff, operations doc, or release readiness checklist.
