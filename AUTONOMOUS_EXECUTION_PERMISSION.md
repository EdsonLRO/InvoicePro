# Autonomous Execution Permission

This document records the owner's standing permission for Codex to continue Tallyo development, remediation, testing, documentation, Supabase, Git and deployment-preparation work autonomously.

## Permitted Work

Codex may:

- inspect the entire repository;
- implement previously identified security fixes;
- run required tests, builds, linters and type checks;
- run necessary Supabase CLI and database commands;
- create and apply migrations;
- update Supabase Edge Functions;
- update application code and configuration;
- update security, architecture, handoff and governance documentation;
- create commits;
- push changes to the appropriate repository branch;
- continue through multiple work stages without asking for repeated permission.

## Security Finding Record

For each meaningful security finding, record before making the fix:

- what the issue is;
- the affected files or components;
- available evidence;
- severity and impact;
- the intended fix;
- the validation that will prove the issue is resolved.

This assessment may be recorded in the working report, security findings ledger or progress documentation. It does not require separate approval before implementation unless the change meets one of the manual-approval conditions below.

After implementing each finding, update the same record with:

- files changed;
- commands executed;
- tests performed;
- whether the original issue still reproduces;
- whether legitimate behaviour remains working;
- remaining uncertainty or follow-up work.

## Stop And Request Approval Before

- Spending money or enabling a paid service.
- Purchasing or changing a domain.
- Creating or activating live Stripe products, prices or subscriptions.
- Switching Stripe, payment processing or another external service into live mode.
- Sending real emails, invoices or notifications to customers.
- Deleting production data.
- Resetting or removing real user accounts.
- Disabling security protections.
- Exposing, rotating or replacing production secrets when the owner must provide or approve the new value.
- Making irreversible production changes.
- Changing legal terms, privacy policy commitments or regulated business claims that require owner or legal review.
- Merging into a protected production branch when repository rules require human approval.
- Deploying publicly when the application has not passed the agreed release gates.
- Encountering a material product decision with multiple valid options and no existing repository decision.
- Encountering an action that requires interactive identity verification, payment confirmation, MFA approval or access that only the owner can provide.

When approval is required:

1. Stop only the blocked action.
2. Explain exactly what requires approval.
3. State the recommended option and alternatives.
4. Provide the exact command, configuration or action that will follow approval.
5. Continue all other safe and independent work where possible.
6. After approval is received, resume automatically and continue until the next genuine manual step.

## Do Not Stop For

- Minor formatting fixes.
- Trailing whitespace.
- Documentation corrections.
- Safe refactoring.
- Normal dependency installation.
- Local tests.
- Non-destructive Supabase inspection.
- Approved migrations in development environments.
- Creating development branches.
- Commits and pushes already covered by this permission.
- Security fixes that preserve existing intended behaviour.
- Routine updates to project documentation.

## Documentation Continuity

Keep the following documents synchronised with the actual repository state:

- `APP_STATUS.md`
- `PROJECT_HANDOFF.md`
- `SECURITY_STORY.md`
- `SUPABASE_HANDOFF.md`
- `TALLYO_SECURITY_SAAS_MASTER_PLAN.md`
- the current threat model
- the security findings and remediation ledger
- relevant roadmap and deployment documentation

Do not mark planned controls as implemented unless they are present in the repository and have been validated.

Use clear statuses:

- Planned
- Investigating
- Confirmed
- In progress
- Implemented
- Verified
- Blocked
- Deferred
- Not applicable

## Git Rules

Before committing:

- inspect the final diff;
- remove unrelated changes;
- run `git diff --check`;
- run the relevant tests and validation;
- confirm no secrets or sensitive values are included;
- update the relevant documentation.

Use focused commits with meaningful messages.

After pushing, report:

- branch name;
- commit hash;
- files changed;
- tests and commands run;
- security findings resolved;
- unresolved issues;
- any manual action required next.

## Final Operating Principle

Work autonomously by default.

Do not request approval merely because a change is important. Request approval only when the owner must make a business, legal, financial, production, identity or irreversible decision.

If a safe reversible option is clearly supported by the repository and existing project decisions, implement it, test it, document it, commit it and continue.
