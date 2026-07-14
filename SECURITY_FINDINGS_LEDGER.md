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
- **Verification:** Inline JavaScript syntax passed; focused static review confirmed every normal sign-in entry point uses `routeAfterAuth`; the local app loaded with no console errors. On 2026-07-14, an incorrect primary TOTP was rejected and current primary and backup factors each completed a fresh AAL2 sign-in. Simulated assurance-level/factor-list failure and the password-recovery path remain required by `MFA_RECOVERY_RUNBOOK.md`.
- **Residual risk:** The control is implemented client-side. High-risk future server operations should independently enforce recent AAL2 instead of trusting UI state.
- **Status:** Implemented; normal MFA paths accepted, fail-closed error simulation pending.

### SEC-AUTH-002 - Password recovery used an unmasked prompt and lacked an explicit MFA recovery gate

- **Date:** 2026-07-13
- **Classification:** vulnerable / account recovery
- **Finding:** The `PASSWORD_RECOVERY` handler collected the new password through `window.prompt`, which displays ordinary text rather than a masked password field, and called `updateUser` without an explicit application-level MFA challenge when verified factors existed.
- **Impact:** A new password could be exposed to someone viewing the screen. The recovery flow also relied on provider-side rejection rather than clearly preserving Tallyo's MFA requirement, creating ambiguity around whether access to email alone could bypass the enrolled second factor.
- **Change:** Replaced the prompt with masked password/confirmation fields and the existing local password policy. Recovery must positively complete factor discovery before the update button is enabled, and verified TOTP accounts must challenge a selected primary or backup factor. Added backup-factor management and privacy-safe recovery/factor audit event types.
- **Verification:** Static review confirms masked inputs, password match/strength checks, fail-closed factor discovery, TOTP validation, and no application initialisation before successful update. The recovery and two-factor management screens rendered at desktop and 390px widths with no horizontal overflow or console errors. On 2026-07-14, the backup factor completed sign-in, its removal required a fresh primary code, the remaining-factor read-back showed one verified primary factor, and re-enrolment restored two verified factors. Deno check passed for `log-app-event`; deployed version 4 remained JWT-protected and rejected an unauthenticated write with HTTP 401. Full reset-link, recovery wrong-code, email-only bypass, and successful password-update tests remain.
- **Residual risk:** An all-factors-lost user has no self-service bypass. A strong support identity-verification process remains a release requirement.
- **Status:** Implemented; factor-management acceptance passed, password-recovery acceptance pending.

### SEC-AUTH-003 - Supabase leaked-password protection was disabled

- **Date:** 2026-07-13
- **Classification:** defense-in-depth / provider Auth configuration
- **Finding:** The live Supabase security advisor reports that leaked-password protection is disabled even though the project is now on the Pro plan.
- **Impact:** Tallyo's client-side password checks can reject simple patterns but cannot reliably detect passwords present in known breach corpora. Client validation can also be bypassed by direct Auth API use.
- **Change:** Enabled `password_hibp_enabled` through the Supabase Auth Management API after Owner approval. The previous value was recorded as `false`, the returned/read-back value was `true`, and no credential was printed or written to the repository.
- **Verification:** The live Supabase security advisor was re-run on 2026-07-13 and the leaked-password warning cleared. A safe test-account rejection check with a known compromised password remains acceptance evidence; never record the password used.
- **Status:** Implemented; rejection-path acceptance pending.

### SEC-DB-001 - Trigger helper functions retain unnecessary API execution grants

- **Date:** 2026-07-13
- **Classification:** defense-in-depth / database privilege hygiene
- **Finding:** Supabase security advisors report that `public.handle_new_user()` is a `SECURITY DEFINER` trigger function executable by `anon` and `authenticated`, and `public.prevent_audit_event_mutation()` has no fixed `search_path`.
- **Impact:** Trigger helpers should not be exposed as user-callable RPC functions. A mutable function search path also creates avoidable object-resolution risk if the function is later expanded.
- **Change:** Applied `harden_internal_trigger_functions`: both helpers now use an empty fixed `search_path`, and direct execution is revoked from `PUBLIC`, `anon`, and `authenticated`. Source SQL was updated so fresh environments inherit the same posture.
- **Verification:** The live advisors returned no findings; both API roles report no EXECUTE privilege; the signup, update-prevention, and delete-prevention triggers remain attached; and a no-op audit-event update failed with `audit_events are append-only`.
- **Residual risk:** The trigger body and signup trigger were not changed, but one fresh test-account signup should still confirm automatic `company_settings` provisioning before this finding is marked Verified.
- **Status:** Implemented; fresh-signup acceptance pending.

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
- **Verification:** Deno check passed, deployed `generate-recurring` v12 is active, and an unsigned request returned HTTP 401. Both cron jobs remain active at their existing schedules and their stored commands use the Vault secret name without an anon key. The next scheduled runs on 2026-07-14 remain operational acceptance evidence.
- **Status:** Implemented; next scheduled-run acceptance pending.

### SEC-AUTO-002 - Recurring generation is not idempotent across partial failures

- **Date:** 2026-07-13
- **Classification:** vulnerable / automation integrity and customer-contact risk
- **Finding:** `generate-recurring` inserts and may email an invoice before advancing its recurring template, but it did not check whether the template update succeeded and invoices carried no unique schedule-occurrence marker.
- **Impact:** A database/update interruption or concurrent invocation could leave the same template occurrence due after an invoice was created, allowing a later run to create or email another invoice for the same period. The function could also report success even when schedule advancement failed.
- **Evidence:** Static control-flow review found the unchecked template update after invoice/email processing. Live schema inspection confirmed `invoices` had no `recurring_template_id` or `recurring_occurrence_date` columns and no recurrence idempotency index; zero templates were due when the remediation window was checked.
- **Change:** Applied migration `add_recurring_generation_idempotency`. Generated invoices now carry nullable `recurring_template_id` and `recurring_occurrence_date` attribution with a partial unique index. `generate-recurring` v13 handles uniqueness conflicts by reusing the existing occurrence, conditionally advances only the expected active schedule, sends email only after winning that claim, reports partial failures honestly, and writes privacy-safe success/failure/retry events to `audit_events`.
- **Verification:** Deno check passed. Live rolled-back transactions proved a second invoice for one occurrence is rejected, the first conditional claim affects one row, the second affects zero, ordinary invoices with null recurrence fields remain unaffected, and no test rows persist. The columns/index exist, invoice RLS remains enabled with four policies, security advisors are clear, and an unsigned function request returns HTTP 401. No template was due during deployment. The first real scheduled run remains operational acceptance evidence.
- **Residual risk:** A crash after the schedule claim but before Resend accepts the message can miss an automatic email; preventing both duplicates and missed sends under every crash point requires a transactional outbox/queue, which is a larger future design. The current choice prioritises avoiding duplicate invoices and customer emails.
- **Status:** Implemented; scheduled-run acceptance pending.

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
- **Verification:** Ran `git diff --check`; reviewed against Supabase MFA/AAL docs. Primary and backup factors each completed fresh AAL2 sign-in on 2026-07-14, but the deployed Change Password AAL2 flow still needs a focused browser test.
- **Residual risk:** The backup-authenticator sign-in and protected-removal lifecycle passed acceptance. The password-change path and remaining server-side password, session, rate-limit, and abuse-control settings still need review.
- **Evidence:** This fix commit; MFA factor acceptance dated 2026-07-14; Change Password browser test pending.

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
- **Change:** Duplicate and payment-intent lookup errors now fail closed for Stripe retry; audit insert failures fail closed except for the expected unique-event conflict; failed-payment, refund, and dispute handlers check provider markers before appending history.
- **Verification:** Deno check passed. Live schema inspection confirmed the unique provider-event index and append-only triggers. Replaying one completed payment preserved one audit row, one payment marker, and the original history markers. Replaying one successful refund preserved one audit row, unchanged payments/history hashes, and unchanged `updated_at`.
- **Residual risk:** Invoice payments and history are JSON arrays updated through read-modify-write operations. Fully atomic handling of distinct simultaneous events would require a transactional database processing design; this remains a release-risk item until stress-tested or redesigned.
- **Evidence:** Live `audit_events_provider_event_uidx` and append-only triggers confirmed on 2026-07-13; PAY-TEST-001.

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

## Open Follow-Ups

- Confirm Supabase Auth password policy, JWT/session expiry, and rate-limit settings.
- Complete the known-compromised-password rejection test for the enabled provider check.
- Add the future email-confirmed enhancement to the existing "log out from all devices" flow; do not treat email access alone as sufficient identity proof.
- Complete the remaining positive-path Stripe sandbox tests for a known Tallyo dispute and a genuine failed refund; current redacted evidence is in `STRIPE_SANDBOX_TEST_EVIDENCE.md`.
- Record backup and restore test evidence once a non-production restore is performed.
