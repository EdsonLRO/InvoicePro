# Tallyo Agent Entry Point

This file is the compact persistent entry point for Codex work in this repository.

## Default context

Read by default only:

1. `AGENTS.md`;
2. `APP_STATUS.md`;
3. `docs/INDEX.md`;
4. the active task record, when one exists;
5. source files directly affected by the task.

Do not read the complete governance, security, legal, payments, release or website-planning documentation set by default.

Classify the task first, identify its risk and triggered specialist domains, then use `docs/INDEX.md` to load only the relevant policies and evidence. Read full specialist policies for high-risk work. Avoid archived, superseded and closed-task material unless it is needed to resolve a contradiction, investigate a regression, validate a historical claim or answer an explicit historical question.

## Permanent safety boundaries

- Preserve every Owner-approval boundary in `AUTONOMOUS_EXECUTION_PERMISSION.md` and the authoritative orchestration policy.
- Never expose or commit secrets, tokens, private keys, passwords, MFA seeds, recovery codes, private customer data, bank details or identity documents.
- Never place service-role credentials in browser code. Public/publishable keys are the only credentials permitted client-side.
- Do not weaken Auth, MFA, sessions, recovery, RLS, tenant isolation, CSP, SRI, webhook verification, payment integrity or append-only evidence.
- Stop before live payments, paid services or spending, real-customer communications, public launch, legal publication, identity or banking verification, destructive production operations, secret reveal/rotation requiring the Owner, or irreversible changes.
- A legal block cannot be silently overridden. Never claim Tallyo is GDPR compliant, fully compliant, certified, fully secure or equivalent.
- Keep task and file scopes isolated. Do not overwrite another active task's work or edit an overlapping locked scope.
- Do not rename the repository or live URL without the corresponding approved Auth URL migration.

## Risk and review

- **Low:** visual spacing, spelling, static formatting and test naming. Use focused implementation, focused checks and concise evidence.
- **Medium:** forms, routing, accessibility behaviour, ordinary public components and non-sensitive analytics names. Add QA and only the specialists triggered by scope.
- **High:** identity, Auth, MFA, sessions, recovery, authorization, RLS, tenant isolation, private data, PII, secrets, money, Stripe, subscriptions, refunds, legal commitments, AI access to private data, production and destructive actions. Load the full relevant specialist policies, use Sol-level analysis, require independent verification where practical, satisfy specialist gates and obtain Owner approval where required.

Do not simulate every specialist role for every task. Use only materially relevant roles; record others as `Not triggered`. The Master Orchestrator owns task classification, role selection, locks, evidence, approvals and closure. Functional roles may be performed sequentially when concurrent agents are unavailable.

## Working rules

- Inspect affected source before editing and prefer small, reviewable changes.
- Use deterministic formatting, lint, type, test, link, accessibility and secret-scanning checks where they already exist. Reason about failures instead of rereading every passing file.
- Update only authoritative documents whose state actually changed. Batch related documentation at task or milestone closure.
- Preserve historical evidence; do not include it in default context.
- Keep routine responses concise and use the completion format in `docs/INDEX.md`.
- A task closes only with focused validation, required independent review, honest evidence, no exposed secrets, a focused diff and released locks.

For task-specific routing, canonical sources and reporting rules, read `docs/INDEX.md`.
