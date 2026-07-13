# Tallyo Agent Hierarchy and Computer-Use Controls

This is the authoritative detailed policy for operating graphical browsers and desktop dashboards on behalf of Tallyo. The role hierarchy and task lifecycle are authoritative in `AUTOMATION_MODEL_ORCHESTRATION.md`.

Computer use means operating an interactive browser or desktop interface like a human, including Stripe, Supabase, GitHub, DNS, Resend or another email provider, hosting dashboards, OAuth screens, and screenshot collection.

Prefer CLI, API, migrations, connectors, and version-controlled configuration when they provide the required control and evidence.

## 1. Operating Classifications

Every computer-use task is classified as one of the following. When unspecified, default to Read only.

### Read only

Inspect and report. Make no change.

### Safe reversible change

Allowed only when all are true:

- the action is explicitly authorised by standing or task-specific permission;
- it is in development, test, or staging;
- it creates no charge or paid commitment;
- it has no real customer impact;
- it exposes no secret or unnecessary personal data;
- the previous value is recorded safely;
- rollback is known;
- immediate independent validation is available.

### Sensitive change

The agent may inspect, prepare, and navigate to the final confirmation, but must stop before the material action until the Owner approves it.

### Prohibited autonomous action

The action requires live Owner participation and cannot be completed autonomously.

## 2. Required Task Fields

```text
Objective:
Provider:
Account / organisation:
Project:
Environment:
Test/live mode:
Starting page:
Permitted actions:
Prohibited actions:
Stop boundary:
Evidence required:
Validation:
Rollback:
Completion report:
```

## 3. Read-Only Loop

1. Confirm provider, account, project, environment, and test/live mode.
2. Navigate to the required setting or evidence.
3. Read without changing.
4. Capture only redacted, necessary evidence.
5. Cross-check with official documentation, CLI, API, or repository state where practical.
6. Record date, dashboard path, safe value/state, uncertainty, and evidence.
7. Make no change.

## 4. Safe Reversible-Change Loop

1. Record the current value without exposing secrets.
2. Capture safe pre-change evidence.
3. Confirm authorisation and non-production/test context.
4. Confirm no cost or customer impact.
5. State the intended value and rollback.
6. Make only the authorised change.
7. Save once.
8. Reopen and verify the saved state.
9. Validate outside the dashboard where possible.
10. Capture safe post-change evidence.
11. Roll back on failure when safe and authorised.
12. Update the task/change record.

## 5. Owner-Approval Boundaries

Owner approval is required before:

- Stripe live mode, live payment methods, live products/prices, payouts, bank changes, charges, or real refunds;
- paid plans, upgrades, trials, billable backup/restore, or paid provider features;
- production Auth, JWT, session, rate-limit, RLS, public/private access, or privileged-admin changes;
- revealing, copying, or rotating production secrets;
- deleting users, projects, databases, buckets, functions, webhooks, domains, or production records;
- restoring over an existing project;
- live DNS, nameserver, sender-identity, or production OAuth changes;
- organisation ownership or administrator changes;
- disabling MFA or another security control;
- irreversible migrations;
- real customer communications;
- legal acceptance or publication;
- identity, tax, banking, business, or payout verification;
- public launch.

## 6. Prohibited Autonomous Actions

Never autonomously:

- reveal, copy, paste, screenshot, transcribe, or document secrets;
- send secrets to chat, logs, commits, screenshots, reports, or clipboard history;
- weaken controls for convenience;
- bypass MFA, CAPTCHA, identity checks, approvals, or protected-branch requirements;
- impersonate the Owner or accept legal declarations;
- enter false identity, tax, bank, or business information;
- store card details;
- approve charges without consent;
- delete production data as an error-recovery shortcut;
- use real customer data for demos or tests;
- download production datasets to uncontrolled storage;
- alter audit evidence or conceal failure;
- continue after detecting the wrong account, project, environment, or mode;
- guess what an ambiguous destructive control does;
- expose unrelated credentials through browser autofill.

## 7. Secret and Sensitive-Data Handling

- Keep secret fields masked.
- Do not select Reveal, Show, Copy secret, or equivalent without explicit Owner approval.
- Never capture API secrets, service-role keys, webhook secrets, database passwords, access/refresh tokens, MFA seeds, recovery codes, private customer data, bank details, or identity documents.
- Record only configured yes/no, secret name, environment, creation/rotation date, and rotation status.
- Last four characters may be recorded only when necessary, safe, and not sufficient to weaken the secret.
- Redact unrelated account and personal data from screenshots.

If exposure occurs, stop, preserve non-secret incident evidence, avoid repeating the value, identify affected systems, and tell the Owner that rotation is required.

## 8. Provider Rules

### Stripe

Allowed under standing permission in sandbox/test mode:

- inspect destinations and deliveries;
- inspect selected event types;
- replay already-authorised test events;
- verify signatures indirectly through successful function processing;
- capture redacted test evidence.

Owner approval required:

- any live-mode action;
- live products, prices, payment methods, endpoints, or subscriptions;
- payout/bank changes;
- real charges or refunds;
- live secret display, copy, rotation, or replacement;
- paid features.

### Supabase

Allowed under standing permission:

- inspect project, Auth, rate-limit, backup, log, database, and Edge Function settings;
- inspect development/test configuration;
- perform already-authorised development/test CLI, migration, and function work under the orchestration policy;
- capture redacted evidence.

Owner approval required:

- paid-plan upgrades, PITR, paid backup, or billable restore projects;
- restore over a project;
- production user/data deletion;
- material production Auth/session/RLS/security changes;
- secret reveal or owner-controlled rotation;
- project or organisation ownership changes.

### GitHub

Allowed under standing permission:

- inspect repository settings and branch protection;
- create focused development branches;
- commit and push safe scoped changes;
- open pull requests when useful.

Owner approval required:

- repository deletion or visibility changes;
- branch-protection removal or protected force-push;
- ownership transfer;
- secret display/copy;
- merge when repository rules require human approval.

### DNS and domains

Allowed:

- inspect records;
- draft intended records without saving;
- verify public propagation.

Owner approval required:

- purchase or transfer;
- nameserver or production DNS changes;
- deletion/weakening of SPF, DKIM, or DMARC records;
- paid domain products.

### Email providers

Allowed:

- inspect domain status, webhook deliveries, and non-secret configuration;
- verify test delivery evidence without exposing customer content.

Owner approval required:

- production sender-identity changes;
- secret display/rotation;
- real customer campaigns or communications;
- paid-plan upgrades;
- deletion of production domains or webhooks.

## 9. Role Handoff for Computer Use

```text
Sol -> define risk, expected setting, validation, and stop boundary
Terra -> inspect read only
Owner -> approve material change
Terra -> perform only the approved change
QA / Terra -> validate outside the dashboard
Sol -> review sensitive evidence
Luna -> format the redacted report
Orchestrator -> update the task and release locks
```

One Codex process may perform these transitions sequentially, but must not claim independent agents were active when they were not.

## 10. Failure Handling

1. Stop repeated clicking or repeated submission.
2. Record the exact error without secrets.
3. Reconfirm provider, account, project, environment, and mode.
4. Check logs and provider status.
5. Determine whether the action partially applied.
6. Avoid duplicate resources or duplicate financial events.
7. Roll back only when safe and authorised.
8. Preserve redacted evidence.
9. Escalate security/payment-sensitive failure to Sol.
10. Request Owner approval for destructive, billable, production, or irreversible recovery.

Never blindly retry charges, refunds, deployments, webhook creation, project creation, restore, or destructive operations. First establish whether the previous attempt succeeded partially or asynchronously.

## 11. Completion Report

```text
COMPUTER-USE TASK REPORT

Task ID:
Objective:
Provider:
Account / organisation:
Project:
Environment:
Test/live mode:
Mode:
Dashboard path:

Actions taken:
Actions deliberately not taken:

Previous values:
New values:

Evidence:
- Screenshots:
- Event/delivery IDs:
- Logs:
- Validation:

Secrets exposed:
- No / Incident details

Result:
- Verified / Failed / Blocked / Partially Complete

Rollback:
Documentation updated:
Owner approval reference:
Remaining manual action:
```

## 12. Completion Criteria

A computer-use task is complete only when the correct account/project/environment/mode was confirmed, permitted actions stayed within scope, secret and PII handling was safe, the saved state was independently validated where possible, evidence was redacted, failures/partial application were resolved or documented, the task record was updated, and the Orchestrator released any lock.
