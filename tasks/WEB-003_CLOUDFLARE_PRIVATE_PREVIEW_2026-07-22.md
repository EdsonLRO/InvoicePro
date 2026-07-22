# WEB-003 — Cloudflare access-controlled preview

Task ID: WEB-003

Title: Cloudflare fail-closed private-preview preparation

Objective: Prepare website and app builds so Cloudflare projects can be created
without publishing content before access controls are verified.

Risk level: High because later stages change provider authorization, hosting and
production-adjacent configuration; this repository-only guard is reversible.

Phase: Access-protected deployments created; authenticated acceptance pending

Owner role: Master Orchestrator

Assigned specialist: Release, Security, QA, Legal and Cloudflare provider owner

Required reviewers: Independent Security/QA review before provider action

Affected files: Cloudflare build scripts, readiness tests and authoritative
Cloudflare readiness records

Files or paths locked: `scripts/build-app-pages.mjs`,
`scripts/cloudflare-access-build-guard.mjs`, `website/scripts/build.mjs`,
`website/scripts/test.mjs`, `deployment/cloudflare/`, focused readiness tests and
this record

Documents to read: `AGENTS.md`, `APP_STATUS.md`, `docs/INDEX.md`, this record,
`AUTONOMOUS_EXECUTION_PERMISSION.md`, `AUTOMATION_MODEL_ORCHESTRATION.md`,
`AGENT_HIERARCHY_AND_COMPUTER_USE.md`, `RELEASE_READINESS.md`,
`TALLYO_SECURITY_SAAS_MASTER_PLAN.md`, `TALLYO_LEGAL_COMPLIANCE_AGENT.md` and
the affected Cloudflare readiness files

Documents explicitly not required: Historical Auth, payment and closed-task
evidence; no Auth, MFA, RLS, Stripe or customer-data change is in scope

Dependencies: PR #85 merged at
`ce5bccfb80b0cb4cc67e48e54aeb367c4658e47a`; current GitHub Pages app remains
the rollback; Cloudflare GitHub access is limited to `EdsonLRO/InvoicePro`

Acceptance criteria: Both builds fail before writing output when `CF_PAGES=1`
unless `TALLYO_CLOUDFLARE_ACCESS_CONFIRMED=true`; repository records state that
`noindex` is not access control; the approved builds remain Access-protected;
authenticated preview acceptance remains pending

Required tests: Website test suite, Cloudflare Pages readiness harness, preview
acceptance harness, workflow policy, secret scan and `git diff --check`

Security boundary: The approved provider mutation includes Zero Trust Free
activation performed privately by the Owner, four Owner-policy Access
applications covering both projects' main and wildcard `pages.dev` hostnames,
documented browser-publishable build variables and one bounded successful retry
per project. No secret, Auth change, DNS, public release, tracking or real data

Privacy/legal materiality: UK technical preview intended only for the Owner and
approved reviewers. Cloudflare would host static public-product content and
GitHub would disclose the selected repository to the Cloudflare GitHub app. No
consumer service, real-customer data, tracking, legal publication or subscription
flow is approved. Legal disposition is Approved with conditions for the
repository guard and read-only provider inspection only: the eventual preview
must be access-controlled before content is served, use fictional or synthetic
data, remain unpromoted and obtain a fresh legal/Owner decision before public
launch. External professional review is not required for this isolated technical
preview but remains required for final public legal documents and paid terms.

Payment impact: None; live Stripe remains unchanged and disabled in preview

Production impact: Cloudflare created Access-protected `pages.dev` production
deployments from the merged evidence commit; current GitHub Pages stays live and
custom-domain DNS remains unchanged

Owner permission required: GitHub authorization, project creation, Owner-only
Access configuration, browser-publishable variables and one retry per build were
approved and completed. Owner interaction is now required only to sign in through
Cloudflare Access for authenticated acceptance without sharing identity or codes

Approval boundary: Project creation is not approval for Access, variables,
successful deployment, Auth/MFA origins, Turnstile, Stripe/email links, custom
domains, DNS, legal publication or final release

Implementation result: The shared repository guard is merged. Cloudflare
projects `tallyo-website` and `tallyo-app` were created with the reviewed build
settings; both initial builds stopped at that guard. Owner-policy Access
applications protect the main and wildcard hostnames for both projects. After
the Owner approved the documented browser-publishable variables and one retry
per build, both retries of merged commit
`9fc3f9063527057aa04b9c4544290b0095fc043e` succeeded. Unauthenticated requests
to all four deployed destinations still redirected to Cloudflare Access sign-in;
no variable value, identity value or login code is recorded.

Review result: PR #85 required GitHub Security `verify` run `29927989825`,
post-merge Security run `29928624196` and post-merge GitHub Pages run
`29928621947` passed. Provider readback confirmed the exact project settings,
empty deployment-variable sections and no production deployment. PR #86 merged
the provider-project evidence as `ab3f7b81b865d23e2dd8f6dbf61d6253e9844b17`.
PR #87 then merged the completed Access evidence as
`9fc3f9063527057aa04b9c4544290b0095fc043e`; its required Security check passed,
while the two pre-variable Cloudflare guard failures remained expected evidence.

Evidence: Cloudflare documentation current on 2026-07-22 states Pages URLs are
public by default and documents separate Access policies for the main and
wildcard preview hostnames. The Owner authorized the GitHub app for the selected
repository only. Provider readback confirmed both named projects, their exact
build/root/output settings, both guard failures and no production deployment.
Both project settings subsequently reported wildcard previews restricted by an
Access policy. Main-host applications were duplicated from those Owner-policy
configurations without re-entering an identity. All four destinations redirected
unauthenticated requests to Access sign-in. No identity, private account
identifier or billing detail is recorded here. The successful deployment records
reported assets published and site deployed for both projects; the immutable
Access-protected preview URLs are recorded in
`deployment/cloudflare/preview-acceptance.md`. Public readback also confirmed the
GitHub Pages rollback remains reachable on build `2026.07.22.2`.

Focused validation passed: all 26 website routes plus 404, fail-closed website
and app build behavior including preservation of existing output, Cloudflare
Pages packaging, preview acceptance state, security workflow policy,
`git diff --check` and a scoped secret-pattern scan.

Branch: `codex/cloudflare-private-preview-deployments`

Commit: This evidence branch records the successful private deployments; the
deployed source commit is `9fc3f9063527057aa04b9c4544290b0095fc043e`

Blocked reason: Authenticated content acceptance requires the Owner to complete
Cloudflare Access sign-in privately

Next action: The Owner signs in to both previews through Cloudflare Access without
sharing the identity value or login code; Codex then runs the focused authenticated
website/app acceptance matrix with fictional data.
