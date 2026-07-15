# Tallyo Backup Restore Test Evidence - 2026-07-15

This record documents a controlled Supabase restore exercise. It verifies a specific database-recovery path; it does not prove every disaster-recovery scenario, complete application recovery, legal compliance, or zero data loss.

## Scope And Approval

- The Owner explicitly approved restoring a selected production backup into a separate non-production Supabase project after the restore screen showed `$0` additional monthly compute, `$0` additional monthly disk, and `$0` total.
- The active production project was not restored over, modified, or taken offline.
- The selected completed backup was dated `2026-07-15 00:44:45 UTC`.
- The temporary target was named `Tallyo Restore Test 2026-07-15` in `eu-west-2`.
- The restored project was first observed as healthy approximately four minutes after creation. This is a measured platform restore-to-healthy time, limited by the polling interval; it is not a full application RTO.
- The selected backup was approximately nine minutes old when the target project was created. The documented daily-backup RPO remains up to 24 hours.

## Side-Effect Isolation

The restored database contained two copied scheduled jobs. Both were disabled before validation:

| Job | Schedule | Restored state after isolation |
|---|---|---|
| `generate-recurring-daily` | `0 6 * * *` | Inactive |
| `send-overdue-reminders-daily` | `0 9 * * *` | Inactive |

Additional controls:

- The `pg_net` HTTP request queue was empty and was cleared defensively.
- The restored project contained no deployed Edge Functions.
- No Resend, Stripe, Auth API key, webhook, or production-secret configuration was added.
- No email, recurring generation, payment, or refund workflow was intentionally invoked.
- Production remained healthy during the exercise.

## Database Integrity

Exact privileged row counts matched between production and the restored project:

| Relation | Production | Restored |
|---|---:|---:|
| `company_settings` | 6 | 6 |
| `customers` | 10 | 10 |
| `saved_items` | 70 | 70 |
| `invoices` | 18 | 18 |
| `recurring_templates` | 4 | 4 |
| `audit_events` | 179 | 179 |
| `auth.users` | 6 | 6 |

Structural counts also matched:

| Control | Production | Restored |
|---|---:|---:|
| Public tables | 6 | 6 |
| RLS-enabled public tables | 6 | 6 |
| RLS policies | 21 | 21 |
| Public indexes | 17 | 17 |
| Public constraints | 66 | 66 |
| Public triggers | 2 | 2 |

The same five recorded migrations were present in both environments, including internal-function hardening, RLS/index optimisation, scheduled-automation authentication, recurring idempotency, and automation timeout hardening.

## Tenant Isolation

Two independent authenticated test contexts were evaluated on the restored project without recording account identifiers or customer content.

- Each context saw exactly its expected owned rows across all six tenant tables.
- All 12 read-isolation comparisons passed.
- A rolled-back own-row update was allowed.
- Rolled-back foreign update, foreign delete, and foreign insert probes were blocked.
- No probe data persisted.

## Expected Reconfiguration Gaps

The restored project reported Auth warnings for leaked-password protection and insufficient MFA options. This was expected because dashboard-level Auth settings are not restored with the database backup. Edge Functions, function secrets, provider webhooks, API keys, Storage objects, and other dashboard configuration also require separate recovery steps.

No changes were made to those temporary-project settings because the exercise tested database recovery and the project was isolated from external providers.

## Outcome And Residual Risk

**Outcome:** the selected Supabase backup restored successfully into a separate project; exact data and structural counts matched; copied automation was isolated; and restored RLS tenant boundaries passed read and write probes.

**Residual risk:** complete service recovery still depends on source-controlled Edge Functions plus manual restoration of Auth, secrets, provider webhooks, API keys, and any future Storage objects. Daily backups permit up to 24 hours of data loss, and the approximately four-minute observation covers platform restore-to-healthy only. PITR remains disabled and approval-gated.

No passwords, temporary database credentials, access tokens, Vault values, customer documents, account addresses, or unnecessary personal data were copied into this evidence.

After evidence collection, the Owner explicitly approved permanent deletion. The temporary restore project was deleted successfully on 2026-07-15, and a follow-up project listing showed only the production project, still `ACTIVE_HEALTHY`.
