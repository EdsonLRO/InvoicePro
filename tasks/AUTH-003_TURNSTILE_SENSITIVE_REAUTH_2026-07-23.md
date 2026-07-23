# AUTH-003 — Turnstile-aware sensitive reauthentication

Task ID: AUTH-003

Title: Restore CAPTCHA-protected password reauthentication for sensitive account actions

Priority: High

Status: Release approved — checks and production publication pending

Phase: Protected preview acceptance complete for global sign-out

Owner role: Master Orchestrator

Assigned specialist: Backend / Supabase, Security and QA

Model/work mode: Sol for Auth design and final review; focused implementation and deterministic QA within that reviewed boundary

Risk level: High — Supabase Auth, password reauthentication, MFA assurance and global session revocation

Affected files: `index.html`, `service-worker.js`, `.github/workflows/security-checks.yml`, focused Auth CAPTCHA/session/PWA/integration tests, `deployment/cloudflare/pages-projects.json`, `SECURITY_FINDINGS_LEDGER.md`, this task record, and only authoritative Auth/release records whose state changes

Files or paths locked: `index.html`, `service-worker.js`, `.github/workflows/security-checks.yml`, focused Auth CAPTCHA/session/PWA/integration tests, `deployment/cloudflare/pages-projects.json`, `SECURITY_FINDINGS_LEDGER.md`, and this task record

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

Approval boundary: The Owner approved this exact High-risk Auth fix on 2026-07-23. On 2026-07-23 the Owner explicitly approved the AUTH-003 Change Password test disposition, pushing the remaining evidence, marking PR #88 ready, merging it and publishing build `2026.07.23.1`.

Branch: `codex/cloudflare-private-preview-deployments`

Commits: `b07f8e3` (implementation) and `057f6cb` (required-workflow alignment) on draft PR #88; this final evidence update follows on the same branch

Evidence: The Owner reproduced `Current password is incorrect` using the same password that completed login. Shipped source shows ordinary login supplies `options.captchaToken`, while the password reauthentication calls for global sign-out and password change omit it and collapse every provider rejection into the password error. Current Supabase CAPTCHA documentation states that protected sign-in requests require a frontend CAPTCHA token. No relevant Auth breaking change was identified in the current changelog.

Finding disposition: `validated — approved to fix` as SEC-AUTH-005.

Implementation evidence: A shared signed-in Turnstile dialog obtains a fresh `password_reauth` token for `Sign Out Everywhere` and `Change Password`. The token is consumed once, cleared before password reauthentication, and protected from removed-widget callbacks by a monotonic challenge sequence. Password failure, CAPTCHA failure, throttling, cancellation and neutral request failure remain safely distinguishable. The rollback switch omits Auth `options` exactly as before. Existing current-password, MFA/AAL2, audit-before-revocation and `scope: 'global'` ordering remains intact. Candidate build and service-worker cache markers are `2026.07.23.1`; this candidate is not published.

Validation evidence: `node tests/sensitive-reauth-captcha-harness.cjs`; `node tests/auth-captcha-harness.cjs`; `node tests/session-expiry-harness.cjs`; `node tests/security-workflow-harness.cjs`; `node tests/scale-accessibility-safety-harness.cjs`; `node tests/pwa-update-harness.cjs`; and `node tests/app-public-integration-harness.cjs` all pass. The focused harnesses parse the inline application script. The required security workflow now executes the new sensitive-reauthentication harness. Final `git diff --check`, focused secret scan and final-diff inspection are required immediately before commit.

Remote evidence: GitHub required check `verify` passed in security run `29969272788` at head `1f5b7c8`. The automatic app and website Preview builds failed because Preview did not inherit the approved production Access-confirmation variable; the app also requires its existing browser-publishable configuration. With exact Owner approval, Preview received the same six reviewed browser-publishable app variables with Stripe live mode remaining false, and the website received only `TALLYO_CLOUDFLARE_ACCESS_CONFIRMED=true`. Exactly one app retry was performed. Deployment `99d5895c-56a5-4c37-b1f3-508f6c563eac` succeeded from `1f5b7c8` in 15 seconds and exposed the Access-protected branch alias. The website was not retried. PR #88 remains draft and no public production build was published.

Protected preview acceptance: The Access-protected branch alias rendered Tallyo build `2026.07.23.1` with Turnstile present. The Owner privately entered the synthetic account password, completed the fresh sensitive-action security challenge and completed MFA without disclosing any value. `Sign Out Everywhere` succeeded and returned the preview to the clean signed-out shell; read-only browser inspection confirmed only the sign-in controls, Turnstile group and build marker remained visible. No password, CAPTCHA response, TOTP value, recovery code, JWT, private email or account data was read or recorded.

Independent review: Sequential Security/QA review found one stale-widget callback race in the first implementation. A monotonic challenge-instance guard and same-action stale-callback regression were added; the complete focused suite then passed. No migration, dependency, RLS, payment, secret or production-provider change is present.

Change Password acceptance disposition: A separate password mutation was deliberately not performed. The Change Password action uses the same reviewed fresh Turnstile/current-password/MFA reauthentication path that passed the Owner-operated protected-preview Sign Out Everywhere test, and its action-specific continuation and failure paths passed deterministic regression coverage. The Owner explicitly accepted this disposition on 2026-07-23. This minimises unnecessary Auth-state mutation while retaining shared-path manual evidence and action-specific automated evidence.

Blocked reason: None within the approved release scope. Required checks, branch protection and production verification remain mandatory.

Next action: Commit and push this final disposition, confirm all required checks and preview protections, then mark PR #88 ready, merge and publish candidate build `2026.07.23.1` under the recorded Owner approval.
