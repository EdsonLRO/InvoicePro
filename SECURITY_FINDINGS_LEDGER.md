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
- **Verification:** Ran `git diff --check`; reviewed against Supabase MFA/AAL docs. Manual browser test still required on the deployed app.
- **Residual risk:** MFA recovery/backup flow is still not implemented; Auth-level password policy and breached-password protection still need dashboard confirmation.
- **Evidence:** This fix commit; manual browser test pending.

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
- Decide whether breached-password screening will be enabled through provider settings or a trusted server-side check.
- Add the future verified "log out from all devices" flow when account-safety work begins.
- Complete the remaining positive-path Stripe sandbox tests for a known Tallyo dispute and a genuine failed refund; current redacted evidence is in `STRIPE_SANDBOX_TEST_EVIDENCE.md`.
- Record backup and restore test evidence once a non-production restore is performed.
