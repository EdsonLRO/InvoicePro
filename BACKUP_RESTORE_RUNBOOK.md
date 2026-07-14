# Tallyo Backup and Restore Runbook

This runbook defines Tallyo's current database recovery procedure. It is an operational control, not proof that every restore path has been tested and not a compliance claim.

Follow `AUTOMATION_MODEL_ORCHESTRATION.md` and `AGENT_HIERARCHY_AND_COMPUTER_USE.md`. Restoring over the active project, enabling a paid add-on, or creating a billable restore project requires Owner approval.

## Current Recovery Posture

- **Provider:** Supabase.
- **Project:** `cuagwifetheefftleeup` (`EdsonLRO Project`).
- **Region:** West Europe (London / `eu-west-2`).
- **Plan:** Pro, confirmed through the Supabase organisation API on 2026-07-13.
- **Scheduled backups:** Supabase documents daily backups with seven days of retention for Pro projects.
- **PITR:** Point-in-Time Recovery is not part of this runbook and must not be enabled without Owner approval because it is a separately billed add-on.
- **Current RPO:** up to 24 hours with daily backups. RPO means Recovery Point Objective: the maximum expected data loss measured in time.
- **Current RTO:** unknown until a timed restore test is completed. RTO means Recovery Time Objective: how long recovery takes.
- **Restore test:** pending. It must use a separate non-production project or a controlled local environment, never overwrite the active project for testing.
- **Current evidence (checked 2026-07-14):** the Supabase CLI listed completed daily physical backups in the current visible window through 2026-07-14 in `eu-west-2`; WAL-G was enabled and PITR was disabled. This proves scheduled backup availability, not restore correctness.

Official references:

- [Supabase database backups](https://supabase.com/docs/guides/platform/backups)
- [Backup and restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Restore to a new project](https://supabase.com/docs/guides/platform/clone-project)

## What A Database Backup Does Not Fully Recover

A Supabase database backup covers database schemas and records, including Auth data when using a platform backup. It is not a complete Tallyo environment backup.

The following require separate recovery evidence or reconfiguration:

- Edge Function source and deployment state. Source is version-controlled under `supabase/functions/`.
- Edge Function secrets and provider credentials. Record names and rotation status only; never export values into the repository.
- Auth URLs, email templates, rate limits, password policy, and other dashboard settings.
- Resend and Stripe webhook destination configuration.
- GitHub Pages and repository settings.
- Cron safety after a clone. A restored database can contain `pg_cron`, `pg_net`, Vault references, and active schedules.
- Storage objects. Supabase database backups contain Storage metadata, not the underlying objects. Tallyo currently has no known Storage bucket dependency; logos are embedded or referenced by URL.

## Routine Checks

### Weekly

1. Open Supabase Dashboard > Database > Backups > Scheduled backups.
2. Confirm a recent successful backup exists and is inside the expected seven-day window.
3. Record only the backup date, status, project, plan, and check date. Do not capture secrets or customer data.
4. Confirm the project and organisation are correct before taking any action.

### Before A Database Or Edge Function Release

1. Confirm the latest scheduled backup is recent enough for the change risk.
2. Keep schema SQL, Edge Function source, and operational documentation committed.
3. Record migration order and rollback limits.
4. For a high-risk migration, take a separate logical export or wait for a fresh scheduled backup.
5. Do not treat a source-code commit as a data backup.

## Optional Logical Export

Logical exports provide an additional recovery artifact for development and major changes. They can contain customer and authentication-related data, so store them only in an encrypted, access-controlled location. Never commit them.

Use a local folder named `private-backups/`; it is excluded by `.gitignore`.

Example structure:

```text
private-backups/
  2026-07-13-before-change/
    roles.sql
    schema.sql
    data.sql
    manifest.txt
```

Use the current official Supabase commands and review `supabase db dump --help` before running them:

```powershell
supabase db dump --linked --file private-backups/<date-purpose>/roles.sql --role-only
supabase db dump --linked --file private-backups/<date-purpose>/schema.sql
supabase db dump --linked --file private-backups/<date-purpose>/data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
```

Security warning: do not run `supabase db dump --linked --dry-run` in captured terminals, CI logs, shared transcripts, or agent output. Current CLI passwordless flows print a short-lived `cli_login_postgres` credential in the generated script. This is not the permanent project password, but it is still a credential and must not be logged.

The machine currently has Supabase CLI and Docker available. `psql` was still not available on `PATH` on 2026-07-14, so a CLI restore cannot be claimed ready until PostgreSQL client tools are installed and verified.

## Restore-Test Procedure

This procedure is deliberately approval-gated because Supabase's restore-to-new-project flow creates a separately billed project. A platform restore test must stop before the final cost confirmation until the Owner approves it.

1. Select a known scheduled backup from before the test marker was created.
2. Review the displayed cost for restoring to a new project.
3. Obtain explicit Owner approval for that exact new project and recurring cost.
4. Restore to a new non-production project in the same region.
5. Immediately prevent external side effects in the restored project:
   - disable all restored `pg_cron` jobs;
   - block or remove outbound `pg_net` automation;
   - do not deploy email or Stripe functions with production secrets;
   - keep Stripe in sandbox/test mode;
   - do not send Resend messages.
6. Confirm Edge Functions, Auth settings, secrets, webhooks, and Storage objects were not assumed to be restored automatically.
7. Validate database integrity with test-only data:
   - company settings;
   - two tenant test accounts;
   - customers and saved items;
   - invoices, payments, and recurring templates;
   - audit events;
   - constraints and indexes.
8. Re-run tenant isolation tests: Account A must not read or modify Account B data through direct API calls.
9. Record row counts without copying customer content into reports.
10. Record elapsed restore time as the first measured RTO.
11. Delete the temporary project only after evidence has been collected and the Owner approves deletion if required by the provider flow.

## Incident Recovery Decision

Use the least destructive path:

1. **Single-record error:** repair the affected record after identifying the authoritative source and preserving audit evidence.
2. **Limited logical corruption:** restore into a separate environment, extract only the required records, validate ownership, then perform a reviewed repair.
3. **Broad corruption or data loss:** select the nearest backup from before the incident and prepare a full restore plan with expected RPO, downtime, and rollback limits.
4. **Compromised credentials:** contain the account, rotate affected credentials with Owner approval, review logs, and do not restore until the attack path is understood.

Never restore over the active project merely to troubleshoot. A platform restore makes the project unavailable and may discard changes newer than the selected backup.

## Required Evidence

A completed backup check or restore test records:

- date and operator;
- project and environment;
- backup timestamp and type;
- Supabase plan and retention window;
- restore target;
- approval reference for billable/destructive actions;
- RPO and measured RTO;
- row-count and tenant-isolation results;
- cron/outbound-automation state;
- failures and residual risk;
- deletion or retention decision for the test environment.

Do not record database passwords, temporary CLI credentials, access tokens, Vault values, customer documents, or unnecessary PII.

The remaining timed restore and its cost approval are tracked in `DEFERRED_MANUAL_CONFIGURATION.md`.
