# Tallyo MFA Recovery Legal, Privacy And Security Review

**Review date:** 16 July 2026; final disposition 17 July 2026
**Jurisdiction:** United Kingdom
**Final internal disposition:** Approved with conditions for Owner-approved merge and controlled test/portfolio frontend publication. All mandatory AUTH-002 technical, notification, and real-device acceptance conditions are verified. External qualified UK legal/privacy review remains required before paid/public onboarding or real-customer use, including final lawful-basis, retention, support wording, public Privacy Notice, and vendor-record decisions.

This review supports risk management and does not claim legal compliance, NIST certification, or that account recovery is risk-free.

## 1. Territory And Affected People

The current intended territory is the United Kingdom. The feature affects Tallyo account holders, whose accounts may contain business records and personal data about their own customers. It can also affect customer contacts if an unauthorised recovery exposes their invoice or payment data.

## 2. Feature, Data And Money Flows

An account holder who has access to both their password and an AAL2 session may generate ten one-time recovery codes. The raw codes are shown in that authenticated browser once. Tallyo sends a separate security notice to the registered account email, but the email never contains a recovery code.

If all TOTP authenticators are later unavailable, the account holder first signs in with the existing password and then submits one recovery code. The server validates a keyed hash, applies attempt limits, consumes the code, revokes the remaining codes, removes all verified MFA factors through Supabase Auth, and thereby invalidates active sessions. On the next password sign-in, database policy blocks business data until a new authenticator is enrolled and verified. Completion clears the recovery lock and sends a second security notice.

The feature does not move money or modify Stripe state.

## 3. Roles

Tallyo acts as controller for account-security and recovery records. Supabase processes authentication, database, Edge Function, and session data on Tallyo's behalf. Resend processes the minimum account email and security-notification content needed to alert the account holder.

## 4. Sources And Classification

- **Best-practice security benchmark:** NIST SP 800-63B Revision 4, account recovery. It recognises saved recovery codes, requires at least 64 bits of random entropy, hashed storage, throttling, invalidation after use, recovery notification, and risk analysis. Tallyo is not claiming NIST conformance: https://pages.nist.gov/800-63-4/sp800-63b.html
- **Current platform behaviour:** Supabase Auth does not natively issue recovery codes, permits multiple MFA factors, exposes AAL checks, and provides a privileged factor-deletion API that logs the user out of active sessions when a verified factor is deleted: https://supabase.com/docs/reference/javascript/auth-mfa and https://supabase.com/docs/reference/javascript/auth-admin-deletefactor
- **Confirmed UK privacy principles:** ICO guidance identifies data minimisation, integrity and confidentiality, storage limitation, and accountability as core data-protection principles: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/

## 5. Current Behaviour And Evidence

Tallyo supports primary and backup TOTP factors and deliberately refuses email-only MFA bypass. The recovery backend is deployed with server-only HMAC storage, atomic one-time consumption, attempt locking, global factor/session cleanup, restrictive recovery-state RLS, minimal audit metadata, and forced re-enrolment. Boundary, privilege, AAL, tenant-isolation, throttling, notification-delivery/minimisation, and physical-Android recovery/re-enrolment acceptance passed with privacy-safe evidence. The browser cannot use the Supabase service role. The recovery frontend remains unpublished pending Owner approval for PR #44.

## 6. Foreseeable Failure Scenarios

- A stolen password plus a stolen recovery code could recover the account.
- A plaintext code stored in the database, logs, email, browser storage, analytics, or support records could be misused.
- Unlimited guesses could permit online brute force.
- A valid code reused concurrently could recover more than once.
- Factor removal without global session revocation could leave an attacker signed in.
- Frontend-only forced re-enrolment could be bypassed by calling the Data API directly.
- Recovery notification failure could delay detection of fraud.
- An administrator bypass or informal identity-document check could expose customer data to an impostor.
- A lost recovery-code file could leave the legitimate user with no supported recovery route.

## 7. Mandatory Controls

1. Generate codes with the Web Crypto API using at least 64 bits of entropy per code; Tallyo will use 100 bits per code.
2. Show raw codes only in the AAL2 browser response and never store or email them.
3. Store only HMAC-SHA256 values using a server-only `MFA_RECOVERY_PEPPER` secret.
4. Require an authenticated password session at AAL1 plus a valid recovery code. A code alone is insufficient.
5. Consume a code atomically, invalidate the remaining set, and reject concurrent reuse.
6. Apply a maximum of five failed attempts in a rolling 15-minute window, with generic errors that do not reveal account or code state.
7. Remove verified MFA factors server-side and rely on Supabase's global-session invalidation behaviour.
8. Keep a database recovery lock until a new TOTP factor is verified at AAL2.
9. Enforce the lock with restrictive RLS on all six tenant-data tables, not only in the interface.
10. Send a minimal security notice after code generation, successful recovery, and completion. Notices must contain no code, password, token, customer, invoice, or payment content.
11. Record privacy-safe audit events without raw codes, hashes, email addresses, tokens, user agents, or business content.
12. Do not add an administrator, support, email-only, security-question, or identity-document bypass.

## 8. Recommended Safeguards

- Encourage a separately stored backup authenticator in addition to recovery codes.
- Ask the user to print or save codes in an encrypted password manager and warn that each set replaces the previous one.
- Provide a clear route for reporting an unrecognised recovery event.
- Review recovery failures and lockouts operationally without storing attempted codes.

## 9. User-Facing Wording

The interface must say that recovery codes are one-time secrets, are shown once, and should be kept offline or in a trusted password manager. It must state that generating a new set invalidates the old set. Recovery notices must say that the account holder should change their password and contact Tallyo if they did not perform the action. No wording may claim guaranteed recovery or complete security.

## 10. Retention, Rights, Vendors And Transfers

Used and replaced code hashes should be removed immediately rather than retained. Recovery state keeps only timestamps, attempt counters, and a current lock flag. Privacy-safe audit events follow the audit retention decision already required by the legal-readiness plan. Supabase and Resend remain existing vendors; no new vendor is introduced. The Privacy Notice and vendor register must describe account-security notifications and the final retention periods before public launch.

## 11. Required Evidence

- Deno type checks and dependency locks for the new Edge Function.
- Migration review confirming RLS, grants, fixed search paths, and service-role-only privileged functions.
- Tests proving AAL2 generation, AAL1-plus-code recovery, one-time use, throttling, concurrent-use resistance, global logout, forced re-enrolment, and tenant-data denial while locked.
- Tests proving raw codes and attempted codes are absent from database rows, audit metadata, function logs, and notification content.
- Delivery evidence for generation, recovery, and completion notices.
- Two-account isolation regression and the existing RLS/security regression suite.

## 12. Uncertainty And External Advice

NIST is used as a security benchmark, not as a binding UK legal standard for Tallyo. Final lawful bases, retention periods, customer-support wording, incident handling, and the public Privacy Notice should receive qualified UK legal/privacy review before paid public launch. A future support-assisted identity-proofing route would require a separate design and external professional review.

## 13. Release Conditions

The migration, server-only secret, Edge Function, and required acceptance evidence are complete. PR #44 may be marked ready, merged, and published only after explicit Owner approval. Any regression in atomic consumption, restrictive RLS, session revocation, throttling, notification minimisation, or forced re-enrolment blocks release. Paid/public onboarding and real-customer use remain blocked pending the external UK legal/privacy review and broader launch conditions recorded in `RELEASE_READINESS.md`.
