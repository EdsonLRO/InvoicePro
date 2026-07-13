# Tallyo Automation and Agent-Orchestration Policy

This is the authoritative repository policy for autonomous task selection, agent roles, work-mode routing, task ownership, locks, handoffs, evidence, and closure.

Detailed graphical-dashboard controls are authoritative in `AGENT_HIERARCHY_AND_COMPUTER_USE.md`. Standing owner permission is recorded in `AUTONOMOUS_EXECUTION_PERMISSION.md`. If these documents appear to conflict, use the stricter approval boundary and record the conflict before continuing.

This policy is governance, not application runtime code. It does not activate background workers or prove that multiple agents are running.

## 1. Condensed Operating Rule

Tallyo uses one Owner, one Master Orchestrator, eight specialist functional agents, and three model/work modes.

The Orchestrator owns the task queue, role assignment, work-mode selection, task locks, evidence review, approval boundaries, and task closure.

A functional agent is a responsibility and decision boundary. Luna, Terra, and Sol are work modes, not automatically separate agents. When concurrent agents are unavailable, Codex performs the roles sequentially and records each material handoff or role transition.

No two agents may edit the same file or overlapping scope at the same time. Computer use defaults to read-only inspection. Secrets must remain masked. Agents must stop before charges, live-mode changes, production security changes, deletion, real customer actions, legal acceptance, identity verification, or irreversible actions.

A task is closed only after implementation, testing, independent review when required, documentation updates, evidence, lock release, and Orchestrator confirmation.

## 2. Roles and Work Modes Are Different

```text
Functional agent = a responsibility and decision boundary.
Model/work mode = the reasoning level used to perform that responsibility.
```

- Luna, Terra, and Sol are model or work-mode labels.
- Functional agents are responsibility-based roles.
- One functional agent may use different work modes as task risk changes.
- Several roles may be performed by one Codex process when concurrent agents are unavailable.
- Model labels do not mean three separately running agents.
- The hierarchy is a coordination model, not proof of simultaneous background workers.
- Never claim an agent exists or is running unless the environment actually supports it.
- In a single-agent environment, execute the hierarchy sequentially and record material role transitions in task evidence.

## 3. Hierarchy and Count

```text
1 Owner
1 Master Orchestrator
8 Specialist Agents
3 Model / Work Modes
```

There are nine AI functional roles when the Master Orchestrator is included. The Owner is separate and is not an AI agent. Luna, Terra, and Sol are not additional functional agents. Actual concurrency depends on environment capability.

```text
Owner
  |
  v
Master Orchestrator
  |
  +-- Product Agent
  +-- Frontend Agent
  +-- Backend / Supabase Agent
  +-- Security Agent
  +-- Payments Agent
  +-- QA Agent
  +-- Documentation Agent
  +-- Release Agent
```

Cross-review path:

```text
Implementing Specialist
        |
        v
QA Agent
        |
        v
Security / Payments Review when required
        |
        v
Documentation Agent
        |
        v
Master Orchestrator closure
```

### Level 0 - Owner

The Owner is above all agents and alone approves:

- spending money or upgrading paid plans;
- subscription prices and final commercial decisions not already documented;
- Stripe live activation, live products, prices, payment methods, payouts, and banking changes;
- production launch and legal publication;
- identity, tax, banking, and business verification;
- irreversible production changes;
- deletion, overwrite, or restore-over of production data;
- production security changes that require an owner decision.

### Level 1 - Master Orchestrator

The Master Orchestrator:

- reads status, decisions, ledgers, diffs, and recent commits;
- maintains and prioritises the task queue;
- selects the next Ready task and classifies risk;
- assigns one owner role and a specialist;
- selects the work mode;
- defines acceptance criteria, tests, documentation, and approval boundaries;
- acquires and releases task/file locks;
- prevents duplicate or conflicting work;
- resolves dependencies, handoff conflicts, and documentation contradictions;
- reviews evidence and decides whether safe autonomous work can continue;
- identifies owner-blocked actions;
- closes tasks only with evidence;
- selects the next task after closure.

Default work mode: Terra. Use Sol for critical planning, architecture, security, payment state, destructive-risk analysis, and release decisions.

### Level 2 - Specialist Agents

#### Product Agent

Owns requirements, workflows, acceptance criteria, backlog priority, onboarding, approved product decisions, scope clarification, and user-facing behaviour.

Default: Terra. Use Sol when behaviour affects permissions, money, identity, privacy, or destructive actions.

#### Frontend Agent

Owns the Vue interface, page structure, forms, state, responsive layout, accessibility, client validation, PWA behaviour, frontend tests, and safe user messaging.

Default: Terra. Luna may handle wording, formatting, and repetitive UI text. Sol reviews changes interacting with authentication, authorization, payment state, security warnings, or sensitive data.

#### Backend / Supabase Agent

Owns schema, tracked migrations, Edge Functions, constraints, RLS, triggers, cron jobs, Vault usage, Auth configuration, server validation, APIs, database tests, and Supabase documentation.

Default: Terra. Sol is required for Auth, RLS, authorization, tenant isolation, privileged functions, service-role use, destructive migrations, sessions, and recovery flows.

#### Security Agent

Owns threat modelling, finding discovery and validation, attack-path analysis, security invariants, fix review, bypass testing, Auth, MFA, sessions, secrets, RLS, release security, and residual-risk documentation.

Default: Sol. When practical, final security verification must be independent from the implementing role.

#### Payments Agent

Owns Stripe Checkout and future Billing, deposits, refunds, disputes, chargebacks, asynchronous payments, webhook signatures, event subscriptions, idempotency, reconciliation, payment state, audit evidence, and test replay.

Use Sol for architecture, state machines, abuse review, and final verification; Terra for scoped implementation and integration tests; Luna only for formatting payment documentation.

#### QA Agent

Owns test planning, regression, unit/integration/database/RLS tests, webhook replay, mobile, PDF, PWA/cache, accessibility, release regression, and failure-path verification.

Default: Terra. Use Sol for malicious test design, bypass tests, security-sensitive assertions, and payment-consistency tests.

#### Documentation Agent

Owns status, handoffs, manuals, operations guides, decisions, completion/release ledgers, screenshot indexes, help content, release notes, and documentation consistency.

Use Luna for formatting, Terra for substantive content, and Sol for security-, payment-, or compliance-sensitive claims. Never promote a planned control to Implemented or Verified without code and evidence.

#### Release Agent

Owns release-candidate preparation, deployment checklists, environment review, migration order, rollback, smoke tests, monitoring, backup/restore readiness, release evidence, and the final owner-action list.

Default: Terra. Sol is required for final security, payment, Auth/session, destructive-risk, and production-readiness gates.

## 4. Model / Work-Mode Routing

### Luna

Use for low-risk formatting, spelling, summaries, checklist extraction, commit-message drafts, and repetitive text work. Luna cannot independently approve security, payments, migrations, architecture, or releases.

### Terra

Use for routine product work, Vue changes, normal debugging, scoped Edge Functions, non-destructive database work, tests, documentation, deployment preparation, and Git work.

### Sol

Use when mistakes could expose data, move money incorrectly, weaken access control, or create subtle production failure. This includes Auth, MFA, sessions, RLS, tenant isolation, Stripe webhooks/refunds/disputes, secrets, privileged functions, destructive migrations, threat modelling, and final release gates.

Selection rule:

1. Identity, money, authorization, private data, secrets, production, or destructive operations: Sol for analysis and final review.
2. Ordinary product development: Terra.
3. Repetitive low-risk text: Luna.
4. Uncertainty: start with Terra, escalate to Sol when a critical boundary appears.

Material disagreement is resolved as follows:

- Sol controls critical security, payment, and data-integrity decisions.
- Terra controls routine implementation when no critical concern exists.
- The Owner decides unresolved product, commercial, legal, or financial ambiguity.
- Material disagreement and its resolution go in `DECISION_LOG.md`.

## 5. Orchestrator Task Queue

The Orchestrator maintains the queue in `PRODUCT_COMPLETION_LEDGER.md` or a task-specific working record. Every active task must include:

```text
Task ID:
Title:
Priority:
Status:
Phase:
Owner role:
Assigned specialist:
Model/work mode:
Risk level:
Affected files:
Dependencies:
Security boundary:
Acceptance criteria:
Required tests:
Required documentation:
Approval boundary:
Lock state:
Branch:
Commit:
Evidence:
Blocked reason:
Next action:
```

Allowed statuses:

```text
Planned
Ready
Assigned
Investigating
In Progress
Implementation Complete
Verification In Progress
Blocked
Owner Approval Required
Verified
Deferred
Not Applicable
Closed
```

Queue rules:

- Only the Orchestrator assigns tasks.
- A task has exactly one owner role at a time.
- Priority changes require a recorded reason.
- Blocked tasks state the exact blocker.
- Owner Approval Required states the exact decision, button, charge, or action.
- Deferred tasks include rationale and a review trigger.
- Closed tasks include evidence, documentation status, commit, and released locks.

## 6. Task and File Locks

Before editing, record:

```text
Task ID:
Assigned role:
Files or paths locked:
Lock acquired:
Expected release condition:
```

Rules:

- One agent owns a file or overlapping range at a time.
- Agents must not concurrently edit the same file or scope.
- Directory locks are preferred for migrations, Auth, Stripe webhooks, and shared configuration.
- Read-only review does not require an edit lock.
- The Orchestrator resolves lock conflicts.
- Release locks after commit, rollback, or reassignment.
- Abandoned locks require a reason and recovery note.
- Lock state is visible in the task record or completion ledger.

High-conflict paths:

```text
index.html
schema.sql
supabase/migrations/
supabase/functions/stripe-webhook/
supabase/functions/create-stripe-checkout/
supabase/functions/create-stripe-refund/
supabase/functions/log-app-event/
APP_STATUS.md
PROJECT_HANDOFF.md
AUTOMATION_MODEL_ORCHESTRATION.md
PRODUCT_COMPLETION_LEDGER.md
RELEASE_READINESS.md
```

## 7. Standard Agent Flow

```text
Owner-approved roadmap
        |
        v
Master Orchestrator
        +-- reads status and ledgers
        +-- chooses next task
        +-- classifies risk
        +-- acquires task/file locks
        +-- assigns specialist and work mode
        |
        v
Specialist Agent
        +-- inspects
        +-- plans
        +-- implements
        +-- runs focused tests
        |
        v
QA Agent
        +-- verifies expected behaviour
        +-- verifies failure behaviour
        +-- runs regression tests
        |
        v
Security or Payments Review
        +-- required for critical boundaries
        |
        v
Documentation Agent
        +-- updates sources of truth
        |
        v
Master Orchestrator
        +-- reviews evidence
        +-- releases locks
        +-- commits and pushes when authorised
        +-- closes or blocks task
        +-- selects next task
```

## 8. Model-Interchange Patterns

### Low-risk documentation

```text
Luna -> format or clean
Terra -> quick factual review
Documentation Agent -> update source of truth
Orchestrator -> commit and close
```

### Normal feature

```text
Terra -> plan and implement
QA Agent using Terra -> test
Luna -> documentation cleanup
Orchestrator -> review, commit, continue
```

### Security-sensitive feature

```text
Sol -> define risk and invariant
Terra -> implement scoped change
QA Agent -> legitimate, malicious, and bypass tests
Sol -> independently verify boundary
Luna -> format evidence
Documentation Agent -> update ledgers and handoff
Orchestrator -> close only after evidence
```

### Payment feature

```text
Payments Agent using Sol -> define state machine, events, risks, approval boundary
Backend Agent using Terra -> implement
QA Agent using Terra/Sol -> replay duplicates, failures, and out-of-order events
Payments Agent using Sol -> verify financial consistency
Documentation Agent -> update payment operations
Orchestrator -> commit and continue
```

### Major migration

```text
Backend Agent using Sol -> assess data and rollback risk
Backend Agent using Terra -> implement tracked migration
QA Agent -> apply in development/test and verify
Security Agent using Sol -> review access and integrity
Owner -> approve production action
Release Agent -> execute approved production procedure
```

### Release

```text
Release Agent using Terra -> prepare release candidate
QA Agent -> regression
Documentation Agent using Luna/Terra -> consistency review
Security Agent using Sol -> final gate
Payments Agent using Sol -> final payment gate
Master Orchestrator -> compile owner actions
Owner -> approve launch
```

## 9. Task Execution Loops

### Main loop

1. Inspect current status, queue, decisions, diff, commits, and relevant code.
2. Plan the smallest complete change with risk, tests, rollback, docs, and approval boundary.
3. Acquire locks and implement within scope.
4. Verify syntax, legitimate flow, failure flow, and bypass cases appropriate to risk.
5. Update sources of truth.
6. Inspect the final diff and scan for secrets.
7. Commit and push when authorised.
8. Release locks, close or block the task, and select the next Ready task.

### Security finding loop

Use Sol to identify the source, attacker-controlled input, broken control, affected asset, reachability, evidence, and severity. Record the finding before fixing. Implement fail-closed behaviour, verify the original path and alternate bypasses, preserve legitimate behaviour, and update `SECURITY_FINDINGS_LEDGER.md`.

### Supabase loop

Use Terra for routine work and Sol for Auth, RLS, privileged functions, and destructive migrations. Never expose service-role keys, use user-editable metadata for authorization, or rely on frontend filtering. Prefer tracked migrations, review grants/policies/functions/triggers, test direct API access and cross-user isolation, and stop before destructive production action.

### Stripe loop

Use Sol for design and final review. Verify test/live mode, signatures, idempotency, known app-created sessions, invoice/user binding, amounts, currencies, duplicate and out-of-order events, failed events, refunds, disputes, audit evidence, and invoice state. Never activate live mode without Owner approval.

### Documentation loop

Maintain these authorities:

- current stage: `APP_STATUS.md`;
- orchestration: this file;
- computer use: `AGENT_HIERARCHY_AND_COMPUTER_USE.md`;
- owner permission: `AUTONOMOUS_EXECUTION_PERMISSION.md`;
- project handoff: `PROJECT_HANDOFF.md`;
- Supabase: `SUPABASE_HANDOFF.md`;
- security story: `SECURITY_STORY.md`;
- operations: `SECURITY_OPERATIONS.md`;
- findings: `SECURITY_FINDINGS_LEDGER.md`;
- capability/queue: `PRODUCT_COMPLETION_LEDGER.md`;
- decisions: `DECISION_LOG.md`;
- release gates: `RELEASE_READINESS.md`.

Do not promote Planned to Implemented or Verified without evidence.

### Release loop

Prepare tests, migrations, deployment and rollback instructions, monitoring, backup/restore, support, privacy/legal groundwork, and release evidence. Sol reviews open findings, RLS, Auth/MFA/sessions, payments, email, cron, secrets, backups, incident response, privacy workflows, and claims. Stop before live Stripe, paid upgrades, public launch, final legal publication, production data migration, or irreversible changes.

## 10. Handoffs

Every material handoff includes:

```text
Task ID:
From role:
To role:
Reason:
Current status:
Files changed:
Files locked:
Branch:
Commit:
Tests completed:
Tests remaining:
Security boundary:
Known risks:
Evidence:
Required next action:
Approval needed:
```

Rules:

- No handoff without current status.
- No hidden uncommitted changes.
- Incomplete work is labelled clearly.
- The receiving role confirms scope before editing.
- The Orchestrator resolves conflicting handoffs.
- Final critical verification cannot rely only on the implementer's claim when independent review is practical.

## 11. Conflicts and Failure Handling

### Task conflict

The Orchestrator orders tasks affecting the same boundary, usually placing the higher-risk dependency first. Both records name the dependency and locks prevent concurrent edits.

### Documentation conflict

Resolve conflicts in this order:

1. verified code and test evidence;
2. current status ledger;
3. current decision log;
4. specialised handoff;
5. roadmap;
6. historical documentation.

Do not silently select the convenient version. Record material reconciliation.

### Implementation failure

Stop repeated attempts, preserve the exact error and current state, identify partial application, avoid duplicate resources, roll back only when safe and authorised, and escalate sensitive failures to Sol. Production, destructive, billable, or irreversible recovery requires Owner approval.

Computer-use failure rules are in `AGENT_HIERARCHY_AND_COMPUTER_USE.md`.

## 12. Approval Boundaries

Standing permission allows safe repository work, tests, documentation, authorised development changes, commits, and pushes. It never overrides the Owner-only boundaries in section 3 or `AUTONOMOUS_EXECUTION_PERMISSION.md`.

When approval is required:

1. Stop only the blocked action.
2. Name the exact decision, button, charge, or action.
3. State the recommended option and alternatives.
4. Continue independent safe work.
5. Resume automatically after approval until the next real boundary.

## 13. Completion and Validation

A task is complete only when:

- requirements and acceptance criteria are satisfied;
- code or documentation exists;
- focused and risk-appropriate tests pass;
- legitimate and failure paths are considered;
- critical boundaries receive required independent review;
- sources of truth are updated;
- no secrets or unnecessary personal data are exposed;
- the diff is focused and `git diff --check` passes;
- evidence, branch, and commit are recorded;
- locks are released;
- the Orchestrator confirms closure.

Governance changes additionally require:

- valid internal links and closed Markdown code fences;
- no duplicate headings or contradictory agent counts;
- no conflicting Luna/Terra/Sol definitions;
- no contradictory approval boundary;
- correct operation in concurrent and single-agent sequential environments;
- no claim that unavailable background agents are running.

## 14. Context Efficiency

- Read status and ledgers before broad scans.
- Inspect diffs and changed files first.
- Persist evidence in repository documents.
- Avoid rescanning unchanged scope.
- Use the lowest-risk mode that can safely complete the task.
- Keep task records concise but sufficient for another role to continue.

## 15. Final Principle

Luna handles low-risk cleanup. Terra builds the product. Sol protects critical boundaries. Functional agents own responsibilities; the Orchestrator owns coordination and evidence. The aim is to reduce wasted effort without sacrificing security, correctness, or honest reporting.
