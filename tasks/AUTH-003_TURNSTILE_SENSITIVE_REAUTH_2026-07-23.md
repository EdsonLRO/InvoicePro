# AUTH-003 — Turnstile-aware sensitive reauthentication

Task ID: AUTH-003

Title: Restore CAPTCHA-protected password reauthentication for sensitive account actions

Priority: High

Status: Implementation Complete — Production Acceptance Pending

Phase: Repository validation complete

Owner role: Master Orchestrator

Assigned specialist: Backend / Supabase, Security and QA

Model/work mode: Sol for Auth design and final review; focused implementation and deterministic QA within that reviewed boundary

Risk level: High — Supabase Auth, password reauthentication, MFA assurance and global session revocation

Affected files: `index.html`, `service-worker.js`, `.github/workflows/security-checks.yml`, focused Auth CAPTCHA/session/PWA/integration tests, `SECURITY_FINDINGS_LEDGER.md`, this task record, and only authoritative Auth/release records whose state changes

Files or paths locked: `index.html`, `service-worker.js`, `.github/workflows/security-checks.yml`, focused Auth CAPTCHA/session/PWA/integration tests, `SECURITY_FINDINGS_LEDGER.md`, and this task record

Lock acquired: 2026-07-23 by the Master Orchestrator for AUTH-003

Expected release condition: focused implementation committed with legitimate/failure/bypass validation, required independent Security/QA evidence, and no production deployment

Dependencies: Production Supabase CAPTCHA enforcement; reviewed Turnstile widget hostnames for GitHub Pages and the Access-protected Cloudflare app; draft PR #88

Security boundary: Preserve CAPTCHA enforcement, fresh one-time challenge semantics, current-password confirmation, MFA/AAL2 confirmation, audit ordering, global refresh-token revocation, local state clearing, throttling and neutral Auth errors. Never retain, log, inspect or record passwords, CAPTCHA tokens, TOTP values, recovery codes, JWTs or private account identifiers.

Legal materiality: Not triggered. This is a technical Auth correctness repair with no public claim, customer communication, retention, payment or legal-document change.

Acceptance criteria:

- sensitive password reauthentication supplies a fresh Turnstile token when CAPTCHA is enabled;
- `Sign Out Everywhere` still requires the current password, MFA when required, an audit event, and Supabase global sign-out;
- `Change Password` still requires the current password and fresh MFA/AAL2 when required;
- missing, expired, cancelled, provider-rejected and network-failed challenges fail closed and are not reused;
- an actual password failure remains distinguishable from a security-check or throttling failure without exposing provider internals or account existence;
- the frontend rollback switch preserves the prior no-CAPTCHA request shape when provider enforcement is disabled;
- no new runtime dependency, migration, RLS change, secret or production-provider mutation is introduced.

Required tests: focused CAPTCHA reauthentication harness; existing Auth CAPTCHA, session-expiry and security workflow harnesses; inline script syntax; `git diff --check`; scoped secret scan

Required documentation: pre/post remediation finding in `SECURITY_FINDINGS_LEDGER.md`; this active record; release/Auth status only after verified acceptance

Approval boundary: The Owner approved this exact High-risk Auth fix on 2026-07-23. Repository implementation, tests, commit and push may proceed. Production publication, marking PR #88 ready and merge remain separately Owner-gated.

Branch: `codex/cloudflare-private-preview-deployments`

Commits: `b07f8e3` (implementation) and `057f6cb` (required-workflow alignment) on draft PR #88; this final evidence update follows on the same branch

Evidence: The Owner reproduced `Current password is incorrect` using the same password that completed login. Shipped source shows ordinary login supplies `options.captchaToken`, while the password reauthentication calls for global sign-out and password change omit it and collapse every provider rejection into the password error. Current Supabase CAPTCHA documentation states that protected sign-in requests require a frontend CAPTCHA token. No relevant Auth breaking change was identified in the current changelog.

Finding disposition: `validated — approved to fix` as SEC-AUTH-005.

Implementation evidence: A shared signed-in Turnstile dialog obtains a fresh `password_reauth` token for `Sign Out Everywhere` and `Change Password`. The token is consumed once, cleared before password reauthentication, and protected from removed-widget callbacks by a monotonic challenge sequence. Password failure, CAPTCHA failure, throttling, cancellation and neutral request failure remain safely distinguishable. The rollback switch omits Auth `options` exactly as before. Existing current-password, MFA/AAL2, audit-before-revocation and `scope: 'global'` ordering remains intact. Candidate build and service-worker cache markers are `2026.07.23.1`; this candidate is not published.

Validation evidence: `node tests/sensitive-reauth-captcha-harness.cjs`; `node tests/auth-captcha-harness.cjs`; `node tests/session-expiry-harness.cjs`; `node tests/security-workflow-harness.cjs`; `node tests/scale-accessibility-safety-harness.cjs`; `node tests/pwa-update-harness.cjs`; and `node tests/app-public-integration-harness.cjs` all pass. The focused harnesses parse the inline application script. The required security workflow now executes the new sensitive-reauthentication harness. Final `git diff --check`, focused secret scan and final-diff inspection are required immediately before commit.

Remote evidence: GitHub required check `verify` passed in security run `29969200606` at head `057f6cb`. The automatically attempted Cloudflare website and app branch-preview checks failed externally; they are not treated as production acceptance, were not retried, and require a separately approved provider-configuration investigation if they are to be made green. PR #88 remains draft and no candidate build was published.

Independent review: Sequential Security/QA review found one stale-widget callback race in the first implementation. A monotonic challenge-instance guard and same-action stale-callback regression were added; the complete focused suite then passed. No migration, dependency, RLS, payment, secret or production-provider change is present.

Blocked reason: None for the reviewed repository commit and push. Production publication, marking PR #88 ready and merge remain blocked pending exact Owner approval and later live synthetic acceptance.

Next action: Stop before readying, merging or publishing. A later exact Owner-approved production stage must resolve or disposition the external preview checks, publish the reviewed candidate, and privately accept both sensitive actions before SEC-AUTH-005 can be marked live-verified.
