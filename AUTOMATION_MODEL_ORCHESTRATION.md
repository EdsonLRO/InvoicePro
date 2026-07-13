# Tallyo Automation and Model-Orchestration Playbook

This file defines how Codex and supporting agents should continue Tallyo development without wasting effort, weakening controls, or stopping for approvals that have already been granted.

It is a governance document, not application runtime code. The model names below are orchestration labels. If the current Codex environment cannot explicitly switch models, use the labels as decision-making modes:

- **Luna** = low-risk formatting and summary work.
- **Terra** = normal development work.
- **Sol** = security-critical, payment-critical, data-critical, or release-critical work.

## 1. Core Principle

Work autonomously by default.

The normal loop is:

1. Inspect the current repository state.
2. Identify the next highest-priority task.
3. Choose the right work mode.
4. Implement the smallest complete change.
5. Test and verify it.
6. Update the relevant documentation.
7. Commit and push when authorised.
8. Continue to the next safe task.
9. Stop only when a real owner decision or manual action is required.

Keep the work evidence-driven, security-aware, and version-controlled.

## 2. Model / Work-Mode Roles

### Luna

Use Luna for low-risk, repetitive, text-heavy work:

- spelling and grammar fixes;
- Markdown formatting;
- simple documentation cleanup;
- log summaries;
- checklist extraction;
- commit-message drafts;
- small text comparisons.

Do not use Luna alone for authentication, authorization, RLS, payments, billing, migrations, destructive operations, architecture, release approval, or legal/compliance decisions.

### Terra

Use Terra as the default development mode:

- Vue/UI changes;
- routine features;
- normal debugging;
- Supabase Edge Function implementation;
- non-destructive database work;
- tests;
- documentation maintenance;
- deployment preparation;
- routine Git work.

Terra should handle most day-to-day implementation.

### Sol

Use Sol for high-risk or critical-boundary work:

- Auth, MFA, account recovery, and sessions;
- RLS, authorization, and tenant isolation;
- Stripe webhooks, refunds, disputes, chargebacks, and subscription billing;
- secrets, cryptography, or service-role decisions;
- destructive or major migrations;
- threat modelling and security scans;
- final release-gate review.

Use Sol when a mistake could expose data, move money incorrectly, weaken access control, or create a subtle production failure.

## 3. Selection Rule

Before each task, ask:

1. Does it affect identity, money, authorization, user data, secrets, production, or destructive operations? Use Sol for analysis and final verification.
2. Is it ordinary product development? Use Terra.
3. Is it repetitive, textual, or low-risk? Use Luna.
4. Is there uncertainty? Default to Terra, then escalate to Sol if a critical boundary appears.

## 4. Main Autonomous Loop

### Inspect

Read the shortest current sources of truth first:

- `APP_STATUS.md`
- `PRODUCT_COMPLETION_LEDGER.md`
- `SECURITY_FINDINGS_LEDGER.md`
- `PROJECT_HANDOFF.md`
- `SUPABASE_HANDOFF.md` when Supabase is involved
- latest Git diff and recent commits

Avoid rereading the whole repository unless needed.

### Plan

For non-trivial work, define:

- objective;
- affected component;
- selected work mode;
- security boundary;
- expected files;
- tests;
- documentation updates;
- rollback approach;
- approval requirement.

Do not over-plan trivial documentation or formatting work.

### Implement

Rules:

- make the smallest complete change;
- preserve intended behaviour;
- avoid unrelated refactors;
- keep secrets out of code and docs;
- prefer tracked migrations over undocumented database edits;
- enforce security server-side or in the database where required;
- never rely only on hiding UI controls for permissions, subscriptions, or security.

### Verify

Use the strongest verification that fits the risk:

1. syntax/build check;
2. focused test;
3. original bug reproduction where possible;
4. bypass or abuse-case check for security work;
5. legitimate workflow check;
6. integration test;
7. broader regression check;
8. Sol review for critical work.

Never mark a critical task verified without evidence.

### Document

Update relevant sources of truth:

- `APP_STATUS.md`
- `PROJECT_HANDOFF.md`
- `SUPABASE_HANDOFF.md`
- `SECURITY_STORY.md`
- `SECURITY_OPERATIONS.md`
- `SECURITY_FINDINGS_LEDGER.md`
- `PRODUCT_COMPLETION_LEDGER.md`
- `DECISION_LOG.md`
- `RELEASE_READINESS.md`

Use clear statuses:

- Planned
- Investigating
- Confirmed
- In Progress
- Implemented
- Verified
- Blocked
- Deferred
- Not Applicable

### Commit and Push

Before committing:

1. inspect the final diff;
2. remove unrelated changes;
3. run `git diff --check`;
4. run relevant tests;
5. confirm no secrets are included;
6. update documentation;
7. use a focused commit message.

After pushing, report:

- branch;
- commit hash;
- files changed;
- tests run;
- docs updated;
- remaining risks;
- next task.

## 5. Security Finding Loop

Use Sol for discovery and validation.

For each finding:

1. Identify vulnerable path, attacker-controlled input, broken control, affected asset, reachability, and evidence.
2. Validate the issue and classify it as reportable, suppressed, deferred, or not applicable.
3. Design the narrowest complete fix.
4. Implement with fail-closed behaviour.
5. Verify original issue no longer reproduces, alternate bypass fails, and legitimate behaviour still works.
6. Update `SECURITY_FINDINGS_LEDGER.md`, threat model notes, docs, and release checklist.

## 6. Supabase Loop

Use Terra for routine work and Sol for Auth, RLS, privileged functions, and destructive migrations.

Rules:

- never expose service-role keys;
- never use user-editable metadata for authorization;
- do not use `SECURITY DEFINER` casually;
- require ownership checks;
- use both `USING` and `WITH CHECK` for update policies;
- test direct API access when changing RLS;
- do not rely on front-end filtering.

Preferred flow:

1. Inspect migration history.
2. Compare repo schema with remote state when needed.
3. Create tracked migration files for schema changes.
4. Review RLS, grants, functions, triggers, views, indexes, and constraints.
5. Apply and test in development/test.
6. Run advisors where available.
7. Verify cross-user isolation for access-control changes.
8. Document and commit.
9. Stop before destructive production actions.

## 7. Stripe Loop

Use Sol for webhook/security design and Terra for scoped implementation.

Current expected sandbox event set:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
refund.created
refund.updated
refund.failed
charge.dispute.created
charge.dispute.updated
charge.dispute.closed
charge.dispute.funds_withdrawn
charge.dispute.funds_reinstated
```

Verify:

- test mode;
- endpoint and subscribed events;
- signature validation;
- idempotency;
- duplicate and out-of-order delivery;
- failed events;
- legitimate payment/refund/dispute flows;
- audit events and invoice state.

Never switch to live mode without owner approval.

## 8. SaaS Subscription Loop

This is future-phase work and must not interrupt current app finishing.

Before implementation, Sol must define:

- workspace model;
- membership and roles;
- plans and entitlements;
- usage limits;
- subscription states;
- grace periods;
- downgrade/cancellation rules;
- read-only mode;
- retention behaviour.

Implementation must enforce entitlements server-side or in the database, never only in the UI.

## 9. Documentation Loop

Maintain one source of truth for each purpose:

- current status: `APP_STATUS.md`;
- project handoff: `PROJECT_HANDOFF.md`;
- Supabase details: `SUPABASE_HANDOFF.md`;
- security story: `SECURITY_STORY.md`;
- operational readiness: `SECURITY_OPERATIONS.md`;
- product completion: `PRODUCT_COMPLETION_LEDGER.md`;
- decisions: `DECISION_LOG.md`;
- release gates: `RELEASE_READINESS.md`.

Update documentation whenever behaviour, UI wording, routes, security posture, plan limits, Stripe events, Supabase configuration, or release state changes.

## 10. Test Loop

Test layers:

1. unit or syntax checks;
2. integration checks;
3. database checks;
4. RLS checks;
5. webhook replay;
6. UI workflows;
7. mobile;
8. PDF;
9. PWA/cache;
10. release regression.

For critical changes, test the malicious case, the legitimate case, and at least one alternate bypass.

## 11. Release Loop

Preparation:

- tests;
- migrations;
- deployment checklist;
- rollback instructions;
- monitoring/logging;
- backup/restore procedure;
- user manual;
- support runbook;
- privacy/legal groundwork.

Final review uses Sol and must cover:

- open findings;
- RLS;
- Auth/MFA/sessions;
- Stripe;
- email;
- recurring jobs;
- secrets;
- backups;
- incident response;
- privacy workflows;
- release claims.

Stop before live Stripe, paid upgrades, public launch, production data migration, final legal publication, or irreversible changes.

## 12. Manual Approval Boundaries

Stop before:

- spending money;
- upgrading a paid service;
- purchasing/changing a domain;
- activating live payments;
- sending real customer communications;
- deleting or overwriting production data;
- rotating owner-controlled secrets;
- changing bank or payout settings;
- publishing final legal terms;
- choosing prices without owner decision;
- launching publicly;
- identity, tax, banking, or business verification;
- irreversible production migrations.

Do not stop for safe formatting, tests, routine docs, non-destructive inspection, authorised development migrations, authorised commits/pushes, or low-risk improvements.

## 13. Computer-Use Policy

Default mode:

```text
Inspect -> record evidence -> recommend -> stop before material change
```

Permission to inspect a dashboard is not permission to change it.

Before any dashboard change, confirm:

- provider;
- organisation/account;
- project;
- environment;
- test/live mode;
- target setting;
- approval boundary.

Never autonomously:

- reveal, copy, screenshot, or document secret values;
- accept charges or legal terms;
- bypass MFA, CAPTCHA, or identity checks;
- delete production data;
- send real customer communications;
- issue real refunds;
- change live DNS, payout, Auth, or payment settings without approval.

Evidence should record provider, project, environment, dashboard path, previous/new values when safe, date/time, redactions, validation, rollback, and remaining uncertainty.

## 14. Context-Efficiency Rules

To reduce wasted tokens:

- read status and ledgers first;
- inspect changed files;
- use Git diffs;
- avoid broad rescans after small changes;
- persist findings in files;
- commit often;
- use the lowest-risk work mode that can safely complete the task.

## 15. Completion Criteria

A task is complete only when:

- requirement is satisfied;
- code/docs exist;
- tests/checks pass;
- legitimate and failure paths are considered;
- critical boundaries are verified;
- documentation is updated;
- no secrets are exposed;
- diff is focused;
- commit is created and pushed when authorised;
- ledger/status is updated.

## 16. Final Principle

Use the least expensive mode that can safely complete the task:

- Luna handles small work.
- Terra builds the product.
- Sol protects critical boundaries.

The goal is not to minimize every individual step. The goal is to minimize wasted effort while preserving correctness, security, and product quality.
