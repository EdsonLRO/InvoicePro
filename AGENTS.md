# Tallyo repository working rules

## Default context

Read only:

1. `AGENTS.md`;
2. `APP_STATUS.md`;
3. `ROADMAP.md`;
4. `DECISIONS.md`;
5. `docs/INDEX.md`;
6. `tasks/ACTIVE.md`;
7. files directly affected by the task.

Use `docs/INDEX.md` to load specialist policies only when the task triggers them. Do not read `tasks/archive/` or `docs/archive/` by default.

## Safe autonomy

Codex may inspect, implement, test, document, create branches, commit, push and maintain pull requests within approved scope. Low-risk and qualifying medium-risk work may follow the standing merge policy in `AUTONOMOUS_EXECUTION_PERMISSION.md`.

Stop before spending, live payments or refunds, paid services, production provider/security changes, secrets, real-customer communications, legal publication, public launch, destructive production actions, identity/banking verification, irreversible changes, or any action reserved for the Owner.

Never expose or commit passwords, tokens, private keys, MFA values, recovery codes, customer data, bank details or provider secrets. Only public/publishable keys may appear in browser code.

Preserve Auth, MFA, sessions, recovery, RLS, tenant isolation, CSP, SRI, webhook verification, financial integrity, one-time recovery semantics and security-notification minimisation.

## Risk and model selection

- Low: spacing, spelling and static formatting.
- Medium: routine website, content, SEO, accessibility, ordinary UI, tests, documentation, archive work and design-only architecture.
- High: Auth, MFA, sessions, recovery, authorization, RLS, private data, secrets, Stripe runtime, subscriptions/entitlements, refunds, production, destructive work, public legal commitments and release decisions.

Use Sol Medium by default. Ask for Sol High only when a high-risk boundary is reached; continue unrelated Medium work meanwhile.

## Workflow

Use one objective → one branch → focused implementation → focused validation → authoritative-document update → one pull request. Do not create duplicate closeout or evidence documents for routine work.

Inspect affected source before editing. Preserve unrelated user changes. Prefer small, reviewable diffs. Update only authoritative documents whose state changed.

Before committing:

- run relevant formatting, lint, type, test, build, link, accessibility and security checks already present;
- run `git diff --check`;
- inspect the full diff;
- verify there are no secrets, private data or unrelated changes.

Use focused tests during implementation. Run the complete relevant suite once at milestone closure. Do not repeat already-passed high-risk regressions without a relevant source change.

## Reporting

Use:

```text
Completed:
Files changed:
Validation:
Material risks:
Owner approval required:
Commit:
Next action:
```

The authoritative approval, orchestration, security, legal and release policies remain routed through `docs/INDEX.md`.
