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
| Backup and restore | Planned | Free-tier manual runbook needed now; Pro restore test needed before real customers. |
| Privacy/legal groundwork | Planned | Privacy policy, terms, retention/export/delete process, breach process. |
| Final mobile/PDF regression | Planned | Needed before treating app as customer-ready. |
| Public SaaS website/subscriptions | Deferred | Future phase after current app/security readiness. |

## Current Next Priorities

1. Backup/restore runbook for current Supabase free-tier limitations.
2. Stripe sandbox replay testing evidence for refund-failure, failed/asynchronous payment, and dispute events.
3. MFA recovery/backup-code planning or documented recovery process.
4. Supabase Auth password policy / breached-password checks when available on the selected plan.
5. Final mobile/PDF/PWA regression pass.
6. Data-protection/legal groundwork before real customers.

## Completion Rule

Do not mark an area Verified unless there is current test or operational evidence recorded in the relevant handoff, operations doc, or release readiness checklist.
