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
| Account security | In Progress | Supabase Auth, email confirmation, TOTP MFA, password change AAL2 handling, local/all-devices logout. MFA recovery remains. |
| Backup and restore | In Progress | Supabase Pro daily backups and seven-day retention are documented in `BACKUP_RESTORE_RUNBOOK.md`; scheduled-backup evidence and a timed non-production restore test remain. |
| Privacy/legal groundwork | Planned | Privacy policy, terms, retention/export/delete process, breach process. |
| Final mobile/PDF regression | Planned | Needed before treating app as customer-ready. |
| Multi-agent governance and computer-use controls | Verified | One Owner, one Master Orchestrator, eight specialist roles, task queue, locks, handoffs, provider controls, and validation are documented in the authoritative governance files. |
| Public SaaS website/subscriptions | Deferred | Future phase after current app/security readiness. |

## Orchestrator Queue

The Master Orchestrator owns this queue. Detailed task fields, statuses, assignment, and locking rules are authoritative in `AUTOMATION_MODEL_ORCHESTRATION.md`.

| Task ID | Title | Priority | Status | Owner role | Work mode | Lock state | Evidence / next action |
|---|---|---|---|---|---|---|---|
| GOV-001 | Complete agent governance and computer-use controls | High | Verified | Master Orchestrator | Terra with Sol policy review | Released after commit | Hierarchy, queue, locks, handoffs, provider controls, cross-links, and validation completed. |
| OPS-001 | Backup and restore runbook | High | Verified | Release Agent | Terra with Sol review | Released after commit | Pro plan confirmed, seven-day daily-backup procedure documented, restore side effects and Owner cost/destructive boundaries recorded in `BACKUP_RESTORE_RUNBOOK.md`. |
| PAY-TEST-001 | Finish Stripe sandbox lifecycle replay evidence | High | In Progress | Payments Agent | Sol / Terra | Released with focused commit; remaining test subtask unlocked | Signature rejection, unknown-event binding, payment/refund duplicate replay, audit constraints, and Deno checks passed. Known-payment dispute and genuine `refund.failed` positive paths remain. |
| AUTH-001 | Define MFA recovery process | Medium | Planned | Security Agent | Sol | Unlocked | Product/security decision and recovery runbook required. |

## Current Next Priorities

1. Complete the remaining Stripe sandbox positive-path evidence for a known-payment dispute and genuine `refund.failed` event; duplicate and unknown-event rejection evidence is recorded.
2. Verify a current scheduled backup and run an Owner-approved timed restore test into a separate environment.
3. MFA recovery/backup-code planning or documented recovery process.
4. Supabase Auth password policy / breached-password checks on the Pro plan.
5. Final mobile/PDF/PWA regression pass.
6. Data-protection/legal groundwork before real customers.

## Completion Rule

Do not mark an area Verified unless there is current test or operational evidence recorded in the relevant handoff, operations doc, or release readiness checklist.
