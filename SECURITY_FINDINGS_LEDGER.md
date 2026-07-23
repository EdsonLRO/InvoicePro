# SECURITY_FINDINGS_LEDGER.md - Tallyo

This is the working record for security findings, remediation decisions, verification, and residual risk.

It is not a formal compliance audit log. It is a practical engineering ledger so Tallyo's security work can be explained, reviewed, and followed up without relying on memory.

## How to use this ledger

For each meaningful security finding or hardening item, record:

- **Finding:** what was wrong or risky.
- **Impact:** what could go wrong if ignored.
- **Classification:** vulnerable, defense-in-depth, not vulnerable, or accepted risk.
- **Change:** what was changed.
- **Verification:** what was tested or checked.
- **Residual risk:** what still remains.
- **Evidence:** commit, file, SQL, deployment, or manual test reference.

Do not store secrets, tokens, customer PII, full exported invoices, or provider payloads here.

## Entries

### SEC-AUTH-001 - MFA assurance checks failed open

- **Date:** 2026-07-13
- **Classification:** vulnerable / authentication boundary
- **Finding:** `routeAfterAuth` caught MFA assurance-level or factor-list errors and continued into `onSignedIn`. It also continued when an AAL2 session was required but no verified factor could be loaded.
- **Impact:** A transient Auth/API failure or inconsistent factor response could let an AAL1 session reach the signed-in application UI instead of stopping at the MFA gate. Database RLS still limited rows to that authenticated user, but the app's promised second-factor boundary was not fail-closed.
- **Change:** Assurance-level and factor-list failures now locally sign out the incomplete session. A required AAL2 session cannot initialise app data without a verified factor, and challenge completion is followed by an explicit AAL2 check.
- **Verification:** Inline JavaScript syntax passed; focused static review confirmed every normal sign-in entry point uses `routeAfterAuth`; the local app loaded with no console errors. On 2026-07-14, an incorrect primary TOTP was rejected, current primary and backup factors each completed a fresh AAL2 sign-in, and an enrolled-factor-gated password recovery produced a password that completed a fresh AAL2 sign-in using the backup factor. A controlled extraction test ran the actual shipped `routeAfterAuth` method through five scenarios. Assurance lookup failure, factor lookup failure, and missing verified factors each forced local sign-out, cleared signed-out state, and never called `onSignedIn`; valid MFA routing and an existing AAL2 session still followed their intended paths.
- **Residual risk:** The control is implemented client-side. High-risk future server operations should independently enforce recent AAL2 instead of trusting UI state.
- **Status:** Verified.

### SEC-AUTH-002 - Password recovery used an unmasked prompt and lacked an explicit MFA recovery gate

- **Date:** 2026-07-13
- **Classification:** vulnerable / account recovery
- **Finding:** The `PASSWORD_RECOVERY` handler collected the new password through `window.prompt`, which displays ordinary text rather than a masked password field, and called `updateUser` without an explicit application-level MFA challenge when verified factors existed.
- **Impact:** A new password could be exposed to someone viewing the screen. The recovery flow also relied on provider-side rejection rather than clearly preserving Tallyo's MFA requirement, creating ambiguity around whether access to email alone could bypass the enrolled second factor.
- **Change:** Replaced the prompt with masked password/confirmation fields and the existing local password policy. Recovery must positively complete factor discovery before the update button is enabled, and verified TOTP accounts must challenge a selected primary or backup factor. Added backup-factor management and privacy-safe recovery/factor audit event types.
- **Verification:** Static review confirms masked inputs, password match/strength checks, fail-closed factor discovery, TOTP validation, and no application initialisation before successful update. The recovery and two-factor management screens rendered at desktop and 390px widths with no horizontal overflow or console errors; a later clipped desktop recovery viewport was corrected with a scrollable signed-out shell. On 2026-07-14, backup-factor sign-in and protected removal/re-enrolment passed. Primary-specific and backup-specific reset flows each completed independently, and the resulting password completed sign-in. A wrong recovery TOTP was rejected, an email-only recovery submission was blocked, and the existing password remained valid after those rejected attempts. Deno check passed for `log-app-event`; deployed version 4 remained JWT-protected and rejected an unauthenticated write with HTTP 401. A live review of recent account-security rows found only `user_agent` metadata, no sensitive metadata keys, no password/TOTP/token terms, and no email-like values.
- **Residual risk:** Production still has no all-factors-lost recovery until AUTH-002 is deployed and live-accepted. The approved interim support response remains deny-by-default and prevents an informal administrator bypass.
- **Status:** Verified for AUTH-001. AUTH-002 is implemented and locally verified, with production migration, secret, function, RLS/provider probes, browser acceptance, and Legal Agent condition closure pending.

### SEC-AUTH-003 - Supabase leaked-password protection was disabled

- **Date:** 2026-07-13
- **Classification:** defense-in-depth / provider Auth configuration
- **Finding:** The live Supabase security advisor reports that leaked-password protection is disabled even though the project is now on the Pro plan.
- **Impact:** Tallyo's client-side password checks can reject simple patterns but cannot reliably detect passwords present in known breach corpora. Client validation can also be bypassed by direct Auth API use.
- **Change:** Enabled `password_hibp_enabled` through the Supabase Auth Management API after Owner approval. The previous value was recorded as `false`, the returned/read-back value was `true`, and no credential was printed or written to the repository.
- **Verification:** The live Supabase security advisor was re-run on 2026-07-13 and the leaked-password warning cleared. On 2026-07-14, a known-compromised candidate passed Tallyo's local format checks, reached Supabase after current-password and MFA verification, and was rejected as weak/easy to guess. Only the pass/fail outcome was recorded, not the candidate value.
- **Status:** Verified.

### SEC-AUTH-004 - Expired sessions could leave customer data in browser memory

- **Date:** 2026-07-15
- **Classification:** defense-in-depth / session and customer-data protection
- **Finding:** The Supabase Auth listener handled password recovery but did not explicitly handle `SIGNED_OUT`. An expired or remotely revoked session could therefore leave the current Vue state visible until a refresh, and an initial business-data, audit, or MFA response already in flight could repopulate state after logout.
- **Impact:** On a shared or unattended device, invoices, customer details, drafts, payment context, recurring schedules, and account-security form data could remain visible after the server-side session had ended. RLS would still block new unauthorised database access, but it cannot erase data already loaded into browser memory.
- **Change:** Unexpected `SIGNED_OUT` events now immediately clear all user and business state, reset navigation to login, and show a concise reauthentication message. Intentional local/global logout remains quiet. Session-generation guards discard initial business-data, audit, and MFA responses that return after sign-out.
- **Verification:** The inline application script parsed successfully. A controlled Node/VM harness exercised idempotent full-state clearing, unexpected expiry, intentional logout, failed logout, and expiry during delayed business-data, audit-event, and MFA requests. All cases passed, and no delayed response repopulated signed-out state. After deployment, the public source contained the `SIGNED_OUT` handler and session-generation guard, and the unauthenticated sign-in shell rendered normally. The Owner-approved seven-day maximum session age and 24-hour inactivity timeout were then enabled and read back from Supabase on 2026-07-15.
- **Residual risk:** Supabase applies the session limits on token refresh, so effective sign-out may occur up to the one-hour JWT lifetime later. Recheck browser-state clearing after material Auth-session or bootstrap changes.
- **Evidence:** `index.html`; `tests/session-expiry-harness.cjs`; `DEFERRED_MANUAL_CONFIGURATION.md`; `RELEASE_EVIDENCE_2026-07-15.md`.
- **Status:** Verified.

### SEC-AUTH-005 - Turnstile enforcement broke sensitive password reauthentication

- **Date:** 2026-07-23
- **Classification:** vulnerable / authentication and session-revocation correctness
- **Status before remediation:** Validated — approved to fix.
- **Finding:** Production Supabase CAPTCHA enforcement applies to every password `signInWithPassword` request. Tallyo's normal login supplies `options.captchaToken`, but the current-password reauthentication used by `Sign Out Everywhere` and `Change Password` does not. The frontend maps every provider rejection to `Current password is incorrect`, so a missing CAPTCHA token is misreported as a bad password.
- **Affected boundary:** `index.html` sensitive reauthentication, password changes, MFA/AAL2 restoration and Supabase global sign-out. No RLS, service-role, database, payment or customer-data boundary is changed.
- **Evidence:** The Owner reproduced the false password error with the same password used for login after Turnstile was enabled on the protected Cloudflare app hostname. Source review confirms the two sensitive reauthentication calls omit a CAPTCHA token while the accepted login call includes one. Current Supabase CAPTCHA guidance requires a frontend token for protected sign-in requests; the current Auth/breaking-change changelog contains no conflicting change.
- **Impact:** MFA-enabled users cannot complete all-devices sign-out or in-app password changes while CAPTCHA enforcement is active. Refresh-token revocation therefore cannot be completed through the intended control, and the misleading error may encourage repeated attempts and throttling.
- **Existing controls:** Normal signup, password sign-in and password reset already fail closed behind Turnstile; global sign-out still requires a native confirmation, current password, MFA when required, audit-before-revocation and Supabase `scope: 'global'`; no credential or CAPTCHA token is stored intentionally.
- **Approved narrow fix:** Add a shared, explicit Turnstile challenge immediately before sensitive password reauthentication; pass the fresh token only in that `signInWithPassword` request; discard the widget/token after one attempt; preserve the disabled-switch request shape; classify CAPTCHA, throttling and credential failures without exposing provider internals; retain all MFA, AAL, audit and global-sign-out ordering.
- **Alternatives rejected:** Disabling Supabase CAPTCHA would weaken the production abuse boundary. Reusing the login token violates one-time challenge semantics. Removing password reauthentication weakens the approved sign-out and password-change controls. Upgrading the pinned browser Auth dependency or adopting a new email reauthentication flow is broader than this defect.
- **Required verification:** Missing/cancelled/expired/provider-rejected/network-failed challenge tests; one-time token forwarding and disposal; wrong-password and throttling classification; rollback-switch request compatibility; retained MFA/AAL2 and global sign-out sequencing; existing Auth CAPTCHA and session-expiry regression; focused secret scan and diff review.
- **Residual risk before repair:** Users cannot reliably revoke every refresh token or change a password through Tallyo while CAPTCHA enforcement is enabled. Local sign-out remains available but is not equivalent to global revocation.
- **Remediation:** A separate signed-in Turnstile dialog now obtains a fresh `password_reauth` token immediately before either sensitive password sign-in. The token is copied into only that request and the widget, token and resolver are cleared before the request starts. A monotonic challenge sequence rejects callbacks from removed or retried widgets. CAPTCHA, throttling, credential, cancellation and neutral request failures are classified without returning raw provider errors. The disabled switch still omits `options` entirely.
- **Repository verification:** `tests/sensitive-reauth-captcha-harness.cjs` covers missing, cancelled, expired, provider-error, stale-callback, one-use forwarding, rollback, CAPTCHA rejection, throttling, wrong-password and network paths, plus retained password-change and global-sign-out/MFA/audit ordering. The required security workflow executes this harness. `tests/auth-captcha-harness.cjs`, `tests/session-expiry-harness.cjs`, `tests/security-workflow-harness.cjs`, `tests/scale-accessibility-safety-harness.cjs`, `tests/pwa-update-harness.cjs` and `tests/app-public-integration-harness.cjs` pass. Inline script parsing is included in the focused harnesses. Diff/secret validation is recorded in the task.
- **Independent Security/QA review:** Sequential final-diff review retained current-password confirmation, MFA/AAL2, audit-before-global-revocation, `scope: 'global'`, one-use token disposal, session-state clearing and the provider rollback shape. The review identified and closed the stale-widget callback race before validation.
- **Status after remediation:** Repository implementation verified; required GitHub security run `29969200606` passed at `057f6cb`; production publication and live acceptance remain pending exact Owner approval. Automatic external Cloudflare branch-preview checks failed and were not retried or treated as acceptance.
- **Residual risk after repository repair:** Public and protected preview deployments continue to run the previous implementation until the reviewed build is published. The fix must not be described as live until the Owner-approved deployment and private synthetic acceptance pass.
- **Task:** `tasks/AUTH-003_TURNSTILE_SENSITIVE_REAUTH_2026-07-23.md`.

### SEC-DB-001 - Trigger helper functions retain unnecessary API execution grants

- **Date:** 2026-07-13
- **Classification:** defense-in-depth / database privilege hygiene
- **Finding:** Supabase security advisors report that `public.handle_new_user()` is a `SECURITY DEFINER` trigger function executable by `anon` and `authenticated`, and `public.prevent_audit_event_mutation()` has no fixed `search_path`.
- **Impact:** Trigger helpers should not be exposed as user-callable RPC functions. A mutable function search path also creates avoidable object-resolution risk if the function is later expanded.
- **Change:** Applied `harden_internal_trigger_functions`: both helpers now use an empty fixed `search_path`, and direct execution is revoked from `PUBLIC`, `anon`, and `authenticated`. Source SQL was updated so fresh environments inherit the same posture.
- **Verification:** The live advisors returned no findings; both API roles report no EXECUTE privilege; the signup, update-prevention, and delete-prevention triggers remain attached; and a no-op audit-event update failed with `audit_events are append-only`. On 2026-07-14, the live signup trigger was enabled, `handle_new_user()` remained security-definer with an empty search path, and neither `anon` nor `authenticated` could execute it directly. A confirmed fresh signup created one matching `company_settings` row; aggregate Auth/settings counts matched with no missing or orphan settings rows. No test address or account identifier was recorded.
- **Residual risk:** A future change to the trigger or `company_settings` schema could break signup transactionally; repeat this acceptance check after either changes.
- **Status:** Verified.

### SEC-DB-002 - RLS identity checks and foreign-key lookups are not optimised

- **Date:** 2026-07-13
- **Classification:** defense-in-depth / database performance
- **Finding:** Supabase performance advisors report that tenant policies call `auth.uid()` per row, and the `audit_events.actor_user_id` and `invoices.customer_id` foreign keys lack covering indexes.
- **Impact:** Tenant isolation remains enforced, but larger tables would repeatedly evaluate the same identity function and could scan foreign-key columns during joins or parent-row changes.
- **Change:** Applied migration `optimize_rls_and_foreign_key_indexes`. Every live ownership policy keeps the same condition but evaluates `(select auth.uid())` once per statement, and narrow indexes now cover `audit_events.actor_user_id` and `invoices.customer_id`. Canonical setup SQL was updated to match the live schema.
- **Verification:** The missing-index and RLS init-plan advisor warnings cleared. RLS remains enabled on all six public data tables, policy counts and commands are unchanged, and the live security advisor remains clear. The remaining unused-index notices are informational on low-volume/new indexes and are not a reason to remove them prematurely.
- **Status:** Verified.

### SEC-AUTO-001 - Recurring generation endpoint lacks caller authentication

- **Date:** 2026-07-13
- **Classification:** vulnerable / privileged automation boundary
- **Finding:** `generate-recurring` disables platform JWT verification for `pg_cron` but did not independently authenticate the request before creating a service-role client.
- **Impact:** Anyone who discovered the public function URL could invoke privileged recurring processing. Due-date checks limit when rows are generated, but repeated or deliberately timed calls could create invoices or trigger configured customer email outside the trusted scheduler.
- **Change:** `generate-recurring` now requires the existing `AUTOMATION_SECRET` in `x-automation-secret` before creating its service-role client. Migration `secure_scheduled_automation_calls` changed both automation jobs to read that secret from Vault at runtime; the former anon-key and inline-secret scheduler patterns are no longer used.
- **Verification:** Deno check passed, the current deployed function retains the authentication control, and an unsigned request returned HTTP 401. On 2026-07-14, the natural 06:00 recurring and 09:00 reminder schedules both reached their protected Edge Functions and received HTTP 200 there, proving the Vault-backed scheduler credential was accepted. Both cron jobs remain active at their existing schedules and their stored commands use the Vault secret name without an anon key. The recurring database-side response timed out under the former pg_net default even though the function completed; that separate observability issue is tracked as `SEC-AUTO-003`.
- **Status:** Verified.

### SEC-AUTO-002 - Recurring generation is not idempotent across partial failures

- **Date:** 2026-07-13
- **Classification:** vulnerable / automation integrity and customer-contact risk
- **Finding:** `generate-recurring` inserts and may email an invoice before advancing its recurring template, but it did not check whether the template update succeeded and invoices carried no unique schedule-occurrence marker.
- **Impact:** A database/update interruption or concurrent invocation could leave the same template occurrence due after an invoice was created, allowing a later run to create or email another invoice for the same period. The function could also report success even when schedule advancement failed.
- **Evidence:** Static control-flow review found the unchecked template update after invoice/email processing. Live schema inspection confirmed `invoices` had no `recurring_template_id` or `recurring_occurrence_date` columns and no recurrence idempotency index; zero templates were due when the remediation window was checked.
- **Change:** Applied migration `add_recurring_generation_idempotency`. Generated invoices now carry nullable `recurring_template_id` and `recurring_occurrence_date` attribution with a partial unique index. `generate-recurring` v13 handles uniqueness conflicts by reusing the existing occurrence, conditionally advances only the expected active schedule, sends email only after winning that claim, reports partial failures honestly, and writes privacy-safe success/failure/retry events to `audit_events`.
- **Verification:** Deno check passed. Live rolled-back transactions proved a second invoice for one occurrence is rejected, the first conditional claim affects one row, the second affects zero, ordinary invoices with null recurrence fields remain unaffected, and no test rows persist. The columns/index exist, invoice RLS remains enabled with four policies, security advisors are clear, and an unsigned function request returns HTTP 401. The protected function completed its natural 2026-07-15 06:00 UTC run; cron succeeded, retained pg_net evidence was HTTP 200, and post-run checks found zero duplicate occurrence groups and zero generated-owner mismatches. No schedule was due, so no invoice or email was expected.
- **Residual risk:** A crash after the schedule claim but before Resend accepts the message can miss an automatic email; preventing both duplicates and missed sends under every crash point requires a transactional outbox/queue, which is a larger future design. The current choice prioritises avoiding duplicate invoices and customer emails.
- **Status:** Verified.

### SEC-AUTO-003 - Scheduled HTTP calls can time out before successful functions return

- **Date:** 2026-07-14
- **Classification:** vulnerable / automation reliability and observability
- **Finding:** Both pg_cron commands relied on pg_net's default HTTP timeout. The 06:00 recurring run completed successfully in the Edge Function, but its database-side request timed out before the response was recorded.
- **Impact:** Operators could see an ambiguous or failed scheduler result even when privileged work completed. Retrying an uncertain result increases duplicate-processing risk; recurring idempotency limits that risk but does not make the missing response acceptable.
- **Change:** Set `timeout_milliseconds := 30000` explicitly on both Vault-authenticated scheduled calls. Schedules, endpoints, request bodies, authentication, and Edge Function behavior remain unchanged.
- **Verification:** The canonical SQL and generated migration both set the explicit timeout, and migration `20260714161421` is recorded as applied in the linked project. Live read-back confirmed both jobs remain active at their original `0 6 * * *` and `0 9 * * *` schedules, retain the custom authentication header and Vault secret lookup, and store the 30-second timeout. The next natural runs on 2026-07-15 both succeeded; retained pg_net responses were HTTP 200 with no timeout or transport error. Post-run duplicate, ownership, opt-in, and unintended-communication checks passed.
- **Residual risk:** A 30-second timeout cannot distinguish every network interruption from a completed remote action. Idempotent processing and audit events remain necessary controls.
- **Status:** Verified.

### SEC-LOG-001 - Stripe test/development state was too easy to miss

- **Date:** 2026-07-12
- **Classification:** defense-in-depth / operational safety
- **Finding:** Stripe invoice payments were correctly documented as test/development, but the payment panel did not show a nearby operator-facing reminder.
- **Impact:** During testing, a user could mistake sandbox payment links for live-ready payment links.
- **Change:** Added a Stripe test-mode notice in the invoice payments panel and updated the email/payments roadmap.
- **Verification:** Ran `git diff --check`; reviewed the focused diff.
- **Residual risk:** Live Stripe mode still requires explicit approval, live secrets, replay testing, refund/dispute policy, backup/restore evidence, and legal/privacy groundwork.
- **Evidence:** Commit `f24df16` (`Polish Stripe payment readiness messaging`).

### SEC-LOG-002 - New-password checks were too weak locally

- **Date:** 2026-07-12
- **Classification:** defense-in-depth / account security
- **Finding:** The app only checked for 8-character passwords in signup/change-password/recovery flows.
- **Impact:** Weak passwords are easier to guess, reuse, or crack if compromised elsewhere.
- **Change:** Added local password checks for 12+ characters, obvious common terms, email-name inclusion, and weak short composition; updated user-facing hints and documentation.
- **Verification:** Ran `git diff --check`; searched for old `8 characters` wording; reviewed the focused diff.
- **Residual risk:** Client-side checks are not a replacement for Supabase Auth password policy, rate limiting, breached-password screening, MFA recovery planning, or monitoring.
- **Evidence:** Commit `02ee05e` (`Strengthen local password checks`).

### SEC-LOG-003 - MFA password change failed without AAL2 re-verification

- **Date:** 2026-07-12
- **Classification:** vulnerable / account security correctness
- **Finding:** Change Password rechecked the current password with `signInWithPassword`, but on MFA-enabled accounts that creates an AAL1 session. The app then called `updateUser` before completing a fresh MFA challenge, so Supabase rejected the password update with an AAL2-required error.
- **Impact:** MFA-protected users could not change their password from the app, and the failure was confusing.
- **Change:** Added an authenticator-code popup when MFA is enabled and completed a Supabase MFA challenge/verify step after current-password reauth and before `updateUser`.
- **Verification:** Ran `git diff --check`; reviewed against Supabase MFA/AAL docs. Primary and backup factors each completed fresh AAL2 sign-in on 2026-07-14. The deployed Change Password flow then requested a fresh authenticator code and completed the password update successfully.
- **Residual risk:** The backup-authenticator sign-in, protected-removal, replacement-factor, and AAL2 password-change paths passed acceptance. Remaining server-side password, session, rate-limit, abuse-control, and password-recovery settings still need review.
- **Evidence:** This fix commit; MFA factor and Change Password acceptance dated 2026-07-14.

### SEC-LOG-004 - Supabase dump dry-run printed a temporary CLI credential

- **Date:** 2026-07-13
- **Classification:** defense-in-depth / secrets handling
- **Finding:** `supabase db dump --linked --dry-run` printed the password for Supabase's short-lived `cli_login_postgres` role in generated command output.
- **Impact:** Capturing or sharing the output could disclose temporary database access even though it is not the permanent project password.
- **Change:** Stopped using the command in captured output and documented a prohibition in `BACKUP_RESTORE_RUNBOOK.md`. No credential value was stored in source or documentation.
- **Verification:** Confirmed through live `pg_roles` metadata that the role used an explicit same-day expiry and was expired when rechecked; confirmed through current Supabase documentation that the passwordless CLI flow uses a temporary login role.
- **Residual risk:** Future Supabase CLI versions may change this behaviour. Operators must review command output handling and avoid verbose/dry-run database commands in shared logs.
- **Evidence:** `BACKUP_RESTORE_RUNBOOK.md`; Supabase CLI v2.109.0 observation on 2026-07-13.

### SEC-PAY-001 - Asynchronous payment failure did not verify a Tallyo-created Checkout Session

- **Date:** 2026-07-13
- **Classification:** defense-in-depth / payment event integrity
- **Finding:** The signed Stripe webhook accepted `checkout.session.async_payment_failed` metadata after checking UUID format and invoice ownership, but it did not match the Session ID, amount, user, and invoice against Tallyo's trusted `stripe_checkout_created` event.
- **Impact:** A Stripe-account operator, compromised Stripe API credential, or incorrectly generated event carrying known Tallyo identifiers could add a false payment-failure entry to an invoice activity history. It could not record a successful payment because that path already verifies the Checkout Session.
- **Change:** Required the same trusted Checkout Session binding used by successful payments, plus positive amount and matching currency validation, before recording a failure.
- **Verification:** Deno check passed. A signed Stripe sandbox asynchronous-failure fixture for an unrelated Session returned HTTP 200 but created no Stripe audit event or invoice mutation.
- **Residual risk:** Stripe account/API-key access remains security-sensitive; the webhook must continue to verify signatures and use a narrow event subscription.
- **Evidence:** `supabase/functions/stripe-webhook/index.ts`; PAY-TEST-001.

### SEC-PAY-002 - Webhook duplicate lookup failed open

- **Date:** 2026-07-13
- **Classification:** defense-in-depth / payment state consistency
- **Finding:** If the initial `audit_events` duplicate lookup failed, the webhook logged a warning and continued processing. The live database has a unique `(provider, provider_event_id)` index, but the audit row is written after invoice state changes.
- **Impact:** A transient database lookup failure could weaken duplicate protection, and concurrent or unordered webhook deliveries could produce repeated history or overwrite another near-simultaneous JSON-array update.
- **Change:** Duplicate and payment-intent lookup errors fail closed for Stripe retry. PAY-LIVE-001 adds a service-role-only transactional function that locks the invoice, rejects stale snapshots, inserts the provider audit event, and updates invoice payment/history/status state in one transaction. Each handler reloads and retries a bounded stale result. Refund events reconcile the current Stripe Refund before computing a mutation, and Checkout creation now uses deterministic provider idempotency with required trusted-session audit evidence.
- **Verification:** Deno checks and the focused Stripe payment-integrity harness pass. Static privilege and transaction-order checks cover row locking, stale detection, provider-event uniqueness, service-role-only execution, audit-before-invoice ordering, four bounded webhook retries, out-of-order refund reconciliation, Checkout idempotency, test/live key matching, and the live kill switch. Existing live append-only/index evidence and prior sandbox replay evidence remain valid; the new migration and functions are not yet deployed.
- **Residual risk:** The transactional redesign removes the known lost-update window once deployed. Production migration/deployment, a signed sandbox replay against the deployed candidate, and the separately approved live configuration/acceptance test remain pending.
- **Evidence:** `supabase/migrations/20260717165044_atomic_stripe_invoice_events.sql`; `tests/stripe-payment-integrity-harness.cjs`; PAY-LIVE-001; prior PAY-TEST-001 and live append-only/index evidence.

### SEC-PAY-003 - Stripe test/live mode was implicit in secret selection

- **Date:** 2026-07-13
- **Classification:** defense-in-depth / financial safety
- **Finding:** The webhook verified Stripe's signature but did not independently compare the event's `livemode` flag with an explicit Tallyo environment setting.
- **Impact:** A future endpoint or secret misconfiguration could make the intended test/live boundary harder to detect during deployment review.
- **Change:** The function now defaults to sandbox events and requires an explicit server-side `STRIPE_LIVE_MODE=true` setting before a live event can be processed.
- **Verification:** Deno format/check passed; signed sandbox fixtures continued to reach deployed function version 9 successfully. Live-mode testing was intentionally not performed.
- **Residual risk:** Activating live Stripe still requires Owner approval, separate live keys and webhook secret, destination verification, legal/privacy readiness, and final release checks.
- **Evidence:** `supabase/functions/stripe-webhook/index.ts`; PAY-TEST-001.

### SEC-PAY-004 - Missing expected Checkout amount failed open

- **Date:** 2026-07-13
- **Classification:** vulnerable / payment event integrity
- **Finding:** `verifiedCheckoutSession` returned true when the trusted `stripe_checkout_created` audit row existed but its expected amount was missing or non-numeric.
- **Impact:** Corrupt or incomplete trusted audit metadata could bypass the expected-amount comparison and allow a signed payment event with a different amount to be recorded against the invoice.
- **Change:** Reject missing, non-numeric, or non-positive expected amounts instead of treating them as compatible.
- **Verification:** Live compatibility query found zero existing `stripe_checkout_created` rows with a missing or non-numeric amount. Deno format/check passed, function version 9 deployed, and a signed sandbox fixture completed without creating an unrelated audit event.
- **Residual risk:** The trusted Checkout audit row remains part of the payment authorization chain and must stay service-role-only and append-only.
- **Evidence:** `supabase/functions/stripe-webhook/index.ts`; PAY-TEST-001.

### SEC-LOG-005 - Failed email audit events retained unnecessary provider data

- **Date:** 2026-07-14
- **Classification:** defense-in-depth / privacy-safe logging
- **Finding:** Failed Resend sends stored the recipient address and complete provider response body in append-only audit metadata even though the invoice reference and HTTP status were sufficient for diagnosis.
- **Impact:** Error-path audit records could retain unnecessary customer contact data or provider-supplied diagnostic fields for the lifetime of the audit event.
- **Change:** Preserve only the HTTP status, a stable generic failure reason, and non-personal workflow context. Successful-send events continue to retain the intended recipient because the app uses that evidence for user-visible delivery history.
- **Verification:** All nine Edge Functions passed Deno type checking; focused source search found no failed-email audit retaining a raw provider response; `send-document-email` v19, `send-reminder-email` v8, `send-overdue-reminders` v7, and `generate-recurring` v14 were deployed active on 2026-07-14.
- **Residual risk:** Invoice and delivery records still contain customer contact data needed for the invoicing service. Retention and deletion rules remain a legal/privacy release gate.
- **Evidence:** `supabase/functions/send-document-email/index.ts`; `send-reminder-email/index.ts`; `send-overdue-reminders/index.ts`; `generate-recurring/index.ts`.

### SEC-LOG-006 - Account-export audit event retained unnecessary browser metadata

- **Date:** 2026-07-16
- **Classification:** defense-in-depth / privacy-safe logging
- **Finding:** The first controlled production account export correctly emitted `account_data_exported`, but the generic audit writer appended a truncated `user_agent` field even though the approved export design requires format and export-version metadata only.
- **Impact:** The append-only event retained browser fingerprint detail that was not needed to prove export completion and contradicted the documented data-minimisation boundary.
- **Change:** Exclude `user_agent` enrichment only for `account_data_exported`; other existing security and operational events retain their current diagnostic behavior. Add a focused regression assertion to the account-export harness.
- **Verification:** The controlled desktop export produced readable version-1 JSON with the six expected datasets, database-matching counts, zero ownership mismatches across 25 tenant-owned rows, and no forbidden Auth/token fields. The original production event proved the finding by containing `format`, `export_version`, and `user_agent`. Frozen Deno type checking, the account-export harness, the security-workflow harness, and dependency-lock verification passed. After PR #37 merged, `log-app-event` version 7 was deployed with JWT verification preserved. Fresh desktop and real-phone production export events at 2026-07-16 11:13:24 and 11:25:02 UTC contained only `export_version` and `format`; `user_agent`, `provider`, and `provider_event_id` were absent. The real-phone warning, download, and local JSON readability also passed.
- **Residual risk:** Other audit-event types continue to retain truncated user-agent data. Their purpose and retention still require the wider legal/privacy review; this focused fix does not make a general compliance claim.
- **Evidence:** `supabase/functions/log-app-event/index.ts`; `tests/account-data-export-harness.cjs`; `LEGAL_ACCOUNT_DATA_EXPORT_REVIEW_2026-07-15.md`.
- **Status:** Verified for the focused account-export metadata and dedicated-test-account desktop/mobile acceptance scope. The wider audit-retention legal review remains separate.

### SEC-SUPPLY-001 - Edge Function checks and dependency integrity were not enforced in CI

- **Date:** 2026-07-15
- **Classification:** defense-in-depth / software supply chain and release assurance
- **Finding:** The nine Edge Functions could be changed without an automated Deno type check, and no committed Deno lockfiles protected the integrity of transitive remote modules. Existing focused Node security harnesses also ran only when invoked manually.
- **Impact:** A pull request could introduce a type error, floating dependency, broken security invariant, or unexpected transitive dependency change without an automatic repository signal before merge.
- **Intended change:** Add a read-only GitHub Actions workflow with immutable third-party action SHAs and exact Deno `2.2.15` LTS; commit a Supabase-compatible frozen lockfile for each function; run all nine Deno checks and all focused Node security harnesses on pull requests and pushes to `main`.
- **Change:** Added one frozen v4 lockfile per function, a read-only workflow with immutable action commit SHAs and disabled checkout credential persistence, and a workflow self-audit harness. The dependency harness now also rejects missing, incompatible, or unhashed locks.
- **Verification:** Verified Deno `2.2.15` against its official SHA-256 release checksum. All nine frozen checks and all four focused Node harnesses pass locally. Static checks confirm exact action SHAs, `contents: read`, no secret context, no write permission, and frozen lock enforcement. PR #25 GitHub `Security checks` run `29417705148` completed successfully.
- **Residual risk:** CI detects known repository invariants but is not a substitute for code review, provider testing, vulnerability monitoring, or production acceptance.
- **Evidence:** `.github/workflows/security-checks.yml`, `supabase/functions/*/deno.lock`, `tests/edge-dependency-pin-harness.cjs`, and `tests/security-workflow-harness.cjs`.
- **Status:** Verified.

### SEC-SUPPLY-002 - Main does not require the verified security gate

- **Date:** 2026-07-15
- **Classification:** defense-in-depth / repository change control
- **Finding:** GitHub repository settings showed no classic branch protection or branch ruleset for `main`. The verified `Security checks / verify` job reports failures, but a direct push or merge is not currently blocked when that check is absent or unsuccessful.
- **Impact:** The automated dependency, type, and focused security checks remain advisory rather than an enforced merge boundary.
- **Change:** After Owner approval, GitHub branch ruleset `18994100` was created as `Protect main with verified security checks`. It is active, targets the default `main` branch, has an empty bypass list, blocks deletion and force pushes, requires pull requests with zero approving reviews, and requires the GitHub Actions `verify` check against the latest branch state.
- **Verification:** Saved-settings readback confirmed every intended target and rule. PR #26 was initially reported not mergeable, then GitHub `Security checks` run `29423597762`, job `verify`, completed successfully on its latest head commit and satisfied the required gate.
- **Rollback:** Disable or remove only the new ruleset after Owner approval if it blocks recovery unexpectedly; do not force-push or remove unrelated protections.
- **Residual risk:** Repository administrators retain platform-level recovery powers. Zero required reviews is intentional for the current solo-owner workflow, so the rule enforces automated checks and pull-request change control but does not provide independent human review.
- **Evidence:** GitHub ruleset `18994100` settings readback; PR #26; run `29423597762`; job `verify` (`87380131589`).
- **Status:** Verified.

## Open Follow-Ups

- Keep the verified Supabase Auth policy evidence current after material provider changes: 12-character minimum, leaked-password rejection, one-hour JWT lifetime, refresh rotation, seven-day maximum session age, 24-hour inactivity timeout, custom SMTP, and the initial Auth rate limits.
- Add the future email-confirmed enhancement to the existing "log out from all devices" flow; do not treat email access alone as sufficient identity proof.
- Keep the verified Stripe sandbox lifecycle evidence current after material payment-handler changes; live activation remains separately approval-gated.
- Keep the verified isolated backup/restore evidence current after material schema, RLS, automation, or backup-policy changes.
- Keep account-export desktop/mobile acceptance current after material scope, RLS, Auth, or audit-writer changes. Do not record exported content in evidence.
- Keep PWA update acceptance current after material service-worker, cache-version, manifest, or hosting changes.
