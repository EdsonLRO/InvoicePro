# Tallyo Context Routing Index

Use this index after reading `AGENTS.md` and `APP_STATUS.md`.

> Do not read every linked document by default. Read only the documents triggered by the active task's scope and risk.

## Routing process

1. Define the objective, affected files and acceptance criteria.
2. Classify the task as low, medium or high risk using `AGENTS.md`.
3. Select only materially relevant specialist roles. Record unneeded roles as `Not triggered`.
4. Load the documents routed below, plus directly affected source files.
5. Run focused, risk-appropriate validation.
6. Update only authoritative documents whose state changed.

High-risk work must read the complete relevant specialist policies and use independent verification where practical. A narrow task does not become repository-wide merely because a routed policy links to other documents.

## Task routing

### Ordinary frontend and UI work

Examples: layout, spacing, typography, responsive behaviour and non-sensitive components.

Read `CODEX.md`, the affected source files, and relevant QA evidence when needed. Do not automatically load Payments, Legal, Security or Release policies unless the change touches those boundaries.

Roles: Frontend + QA. Risk is low or medium unless sensitive data, identity, money or legal wording is involved.

### Public website design and content

Read the website direction in `PROJECT_HANDOFF.md`, brand/content rules in `CODEX.md`, affected page specifications, and `TALLYO_SECURITY_SAAS_MASTER_PLAN.md` only when the work touches future SaaS architecture or security.

The repository contains the security and future-SaaS master plan, but the separately prepared Tallyo SaaS website planning pack has not yet been committed to this repository. Do not fabricate paths or block unrelated work because that pack is absent. When it is added, route each website task to only the relevant plan files.

Add Legal review for public claims, pricing, cookies, analytics, subscriptions, cancellation, refunds or privacy wording.

### Backend and Supabase

Read `SUPABASE_HANDOFF.md`, relevant schema/migration/function files and the Supabase working guidance applicable to the task. Read full `TALLYO_SECURITY_SAAS_MASTER_PLAN.md` and `AUTOMATION_MODEL_ORCHESTRATION.md` when authorization, secrets, service-role use or privileged functions are involved.

Roles: Backend/Supabase + QA; add Security for privileged or authorization-sensitive work. Use high-risk review for Auth, RLS, private data, secrets, privileged functions or destructive migrations.

### Auth, MFA, sessions and account recovery

Read full `TALLYO_SECURITY_SAAS_MASTER_PLAN.md` and `AUTOMATION_MODEL_ORCHESTRATION.md`, relevant Auth/recovery documents such as `MFA_RECOVERY_RUNBOOK.md`, affected source and migration/function files, relevant acceptance evidence, and `RELEASE_READINESS.md`.

Roles: Backend + Security + QA. Always high risk. Require independent verification and preserve fail-closed behaviour.

### RLS and tenant isolation

Read full `TALLYO_SECURITY_SAAS_MASTER_PLAN.md` and `AUTOMATION_MODEL_ORCHESTRATION.md`, `SUPABASE_HANDOFF.md`, relevant schema/migrations/policies and required isolation evidence.

Roles: Backend + Security + QA. Always high risk. Verify direct API behaviour, cross-user isolation and write paths independently.

### Stripe, payments, deposits, refunds and subscriptions

Read `ROADMAP_EMAIL_PAYMENTS.md`, `PAYMENT_OPERATIONS_RUNBOOK.md`, relevant Stripe implementation/evidence, full `TALLYO_SECURITY_SAAS_MASTER_PLAN.md`, and `RELEASE_READINESS.md`. Read full `TALLYO_LEGAL_COMPLIANCE_AGENT.md` when pricing, subscriptions, cancellation, refunds, disputes or customer commitments are involved.

Roles: Payments + Backend + Security + QA; add Legal when triggered. Always high risk. Live mode and real-money actions remain Owner-approved boundaries.

### Privacy, PII, cookies and analytics

Read full `TALLYO_LEGAL_COMPLIANCE_AGENT.md` and `TALLYO_SECURITY_SAAS_MASTER_PLAN.md`, relevant data-flow/privacy records and the applicable product or website specification.

Roles: Legal/Privacy + Security + Product/Frontend as applicable + QA. High risk when personal data, tracking, retention, export, deletion or customer communications are affected.

### Public AI assistant

Read the public-assistant specification if present, full `TALLYO_SECURITY_SAAS_MASTER_PLAN.md` and `TALLYO_LEGAL_COMPLIANCE_AGENT.md`, relevant public UI specification, data-flow documentation, and OWASP-aligned threat-model or red-team requirements when present.

Roles: Product + Backend + Security + Documentation + Legal + QA. Treat private-data access, tool use or automated decisions as high risk.

### Future authenticated AI assistant

Read full `TALLYO_SECURITY_SAAS_MASTER_PLAN.md` and `TALLYO_LEGAL_COMPLIANCE_AGENT.md`, the AI threat model, tool registry, private-data flow, Auth/RLS policies and release gates.

Roles: Product + Backend + Security + Legal + QA + Release. Always high risk; require independent verification and explicit release evidence.

### Legal and regulatory work

Read the full `TALLYO_LEGAL_COMPLIANCE_AGENT.md`, relevant source documents, `LEGAL_PRIVACY_READINESS.md`, `LEGAL_OPERATIONS_RECORDS.md`, and applicable release conditions. For `LEGAL-OPS-001` or real-customer preparation, also read `LEGAL_LAUNCH_DECISION_PACK_2026-07-17.md`, `LEGAL_BASIS_RETENTION_OPTIONS_2026-07-17.md`, `VENDOR_TRANSFER_EVIDENCE_2026-07-17.md`, `PRIVACY_OPERATIONS_RUNBOOK.md`, `RESTRICTED_CASE_SYSTEM_OPTIONS_2026-07-17.md`, `GOOGLE_WORKSPACE_PRIVACY_CASE_PLAN_2026-07-17.md` when the Google route is active, `PRIVACY_INCIDENT_ROLE_OPTIONS_2026-07-17.md`, `PROFESSIONAL_BACKUP_SERVICE_OPTIONS_2026-07-17.md` when no informal backup is available, `PROFESSIONAL_BACKUP_CANDIDATES_AND_DRAFTS_2026-07-17.md` when candidate comparison or contact drafting is active, and `EXTERNAL_LEGAL_REVIEW_PACK_2026-07-17.md`.

Roles: Legal/Privacy plus only triggered Product, Security, Payments, Documentation or Release roles. Use Sol-level review for legally material conclusions. A legal block cannot be silently overridden.

### Testing and QA

Read affected feature requirements, relevant test/QA files and evidence. Load Security, Payments, Legal or Release policies only when the tested boundary triggers them.

Roles: QA plus the implementation owner; add independent Security or Payments verification for high-risk boundaries.

### Provider dashboards and computer use

Read full `AGENT_HIERARCHY_AND_COMPUTER_USE.md`, the relevant provider policy, and `AUTONOMOUS_EXECUTION_PERMISSION.md` before changing external dashboard state. Read-only inspection remains the default.

Roles: the provider-owning specialist + QA or Security as triggered. Treat secret access, Auth/RLS changes, live payments, production changes, customer actions, identity verification, deletion, spending and irreversible actions as high risk and stop at the recorded Owner boundary.

### Governance and orchestration

Read full `AUTOMATION_MODEL_ORCHESTRATION.md`, `AUTONOMOUS_EXECUTION_PERMISSION.md`, relevant instruction files and current governance decisions. Add full `TALLYO_LEGAL_COMPLIANCE_AGENT.md` or `AGENT_HIERARCHY_AND_COMPUTER_USE.md` only when their boundaries are being changed.

Roles: Master Orchestrator + Documentation, with independent review from each materially affected specialist. Treat changes to approval boundaries, security/legal gates or production authority as high risk.

### Deployment and release

Read full `RELEASE_READINESS.md` and `TALLYO_SECURITY_SAAS_MASTER_PLAN.md`, deployment/rollback and backup documentation, and current release evidence. Add full `TALLYO_LEGAL_COMPLIANCE_AGENT.md` for public statements or customer commitments and Payments review when live payment capability is involved.

Roles: Release + QA + Security, with Legal/Payments when triggered, then Owner. Always high risk for production launch or irreversible operations.

### Documentation-only work

Read the documentation rule being changed and the authoritative source for each fact. Do not load unrelated specialist policies unless the wording affects their boundary.

Roles: Documentation. Add the specialist that owns a security, payment, legal or release claim. Formatting-only work is low risk; substantive claims inherit the source domain's risk.

### Historical evidence and archives

Read historical or superseded material only when investigating a regression, resolving a contradiction, validating a historical security/payment claim or answering an explicit historical question. Preserve historical records; do not make them default context.

## Specialist selection examples

| Task | Triggered roles |
|---|---|
| Visual-only UI change | Frontend + QA |
| Documentation formatting | Documentation |
| Pricing wording | Product + Payments + Legal |
| Auth or RLS | Backend + Security + QA |
| Public chatbot | Backend + Security + Documentation + Legal + QA |
| Production release | Release + Security + Legal + Owner |

Do not generate separate role reports for roles marked `Not triggered`.

## Canonical sources

| Fact or control | Authoritative source |
|---|---|
| Compact persistent instructions | `AGENTS.md` |
| Current product status | `APP_STATUS.md` |
| Context and task routing | `docs/INDEX.md` |
| Agent hierarchy, task routing and locks | `AUTOMATION_MODEL_ORCHESTRATION.md` |
| Legal triggers and dispositions | `TALLYO_LEGAL_COMPLIANCE_AGENT.md` |
| Computer-use controls | `AGENT_HIERARCHY_AND_COMPUTER_USE.md` |
| Standing autonomous permission | `AUTONOMOUS_EXECUTION_PERMISSION.md` |
| Capability and task status | `PRODUCT_COMPLETION_LEDGER.md` |
| Release gates | `RELEASE_READINESS.md` |
| Material decisions | `DECISION_LOG.md` |
| Meaningful handoff state | `PROJECT_HANDOFF.md` |
| Supabase implementation handoff | `SUPABASE_HANDOFF.md` |
| Security findings | `SECURITY_FINDINGS_LEDGER.md` |
| Legal/privacy readiness disposition | `LEGAL_PRIVACY_READINESS.md` |
| Privacy operations records and gate | `LEGAL_OPERATIONS_RECORDS.md`, `PRIVACY_OPERATIONS_RUNBOOK.md` |

Other documents should link to these sources rather than repeat their complete rules when practical. Verified code and test evidence override stale narrative documentation; reconcile material contradictions explicitly.

## Documentation update frequency

Keeping documents synchronised means: update a document when its authoritative state changes.

It does not mean: rewrite every listed document after every minor task.

- Active task record: during the task.
- `APP_STATUS.md`: only when current product status materially changes.
- `DECISION_LOG.md`: only for a genuine decision, exception, override or conflict.
- `PRODUCT_COMPLETION_LEDGER.md`: only when a capability or tracked task status changes.
- `RELEASE_READINESS.md`: only when a release condition changes.
- `PROJECT_HANDOFF.md`: at a meaningful milestone, ownership transfer or material session handoff.
- Help documentation: when user-visible behaviour changes.
- Security evidence: when a security claim, test result or finding changes.
- Payment evidence: when payment behaviour or verification changes.

Related documentation updates may be batched at task or milestone closure.

## Deterministic validation

Prefer existing scripts for formatting, linting, type checking, tests, link checking, allowed statuses, prohibited security claims, accessibility, builds and secret scanning. Do not invent a check and report it as available. Use focused checks for narrow changes and reserve full regression for cross-cutting or release work.

## Routine completion response

Use this compact format unless additional safety detail is required:

```text
Completed:
Files changed:
Validation:
Material risks:
Owner approval required:
Commit:
Next action:
```

Do not reproduce complete files, repeat the full governance model, generate reports for untriggered roles, paste successful test output in full or provide a repository-wide summary unless requested.
