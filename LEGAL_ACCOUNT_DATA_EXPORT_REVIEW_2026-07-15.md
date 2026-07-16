# Tallyo Account Data Export Legal And Privacy Review - 2026-07-15

Internal implementation review for the self-service account-data export. This is not legal advice, an approved public Privacy Notice, or evidence that every individual-rights request can be completed automatically.

**Legal Agent disposition:** `Approved with conditions` for implementation and controlled test-account use. Paid/public onboarding remains `Blocked` by the wider conditions in `LEGAL_PRIVACY_READINESS.md`.

## 1. Jurisdiction And Intended Use

- Primary jurisdiction: United Kingdom.
- Current use: portfolio demonstrations, sandbox payments, and controlled test accounts.
- Public or paid customer onboarding is not authorised by this review.

## 2. Affected People

The export is requested by an authenticated Tallyo account holder. It can also contain personal data about that user's customers, invoice recipients, and contacts. Those third parties are not authenticated by this flow and may have separate rights that require a restricted support case and a controller/processor decision.

## 3. Feature, Data, And Money Flow

1. The signed-in account holder chooses **Download Account Data** on the Account page.
2. Tallyo warns that the file contains sensitive business and customer information.
3. The browser revalidates the current Supabase user.
4. The browser reads only rows visible through the existing RLS-protected authenticated client from `company_settings`, `customers`, `saved_items`, `invoices`, `recurring_templates`, and `audit_events`.
5. Results are paginated and assembled into JSON in browser memory.
6. The browser downloads the JSON directly to the user's device. Tallyo does not create a second server-side export copy.
7. The allowlisted `account_data_exported` event records format and export-version metadata only.

The export does not initiate, refund, or change a payment.

## 4. Controller And Processor Boundary

Tallyo's final controller/processor position remains unresolved. The account holder may control customer and invoice-recipient data while Tallyo acts as a processor for that workspace content. The self-service export therefore supports the account holder's access to their workspace but must not be described as automatically resolving every third-party subject-access or portability request.

## 5. Current Authoritative Guidance

Checked 15 July 2026:

- ICO right of access guidance says a person may obtain a copy of their personal information and supplementary information: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/right-of-access/what-is-the-right-of-access/>.
- ICO data-portability guidance describes structured, commonly used, machine-readable formats and identifies JSON as an open, machine-readable interchange format. It also requires secure transmission and warns that individuals may store received files less securely: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-data-portability/>.
- ICO access-request guidance permits existing authentication measures, such as a username and password, to help verify identity where appropriate: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/right-of-access/what-should-we-consider-when-responding-to-a-request/>.
- Supabase documents that RLS policies restrict rows returned through the Data API; Tallyo's tenant ownership policies and two-account isolation evidence remain the technical access boundary: <https://supabase.com/docs/guides/database/postgres/row-level-security>.

Applicability, lawful basis, exemptions, third-party disclosure, and the exact scope of a real request remain case-specific and may require qualified advice.

## 6. Current Product Evidence

- All six exported tables have per-user RLS read policies.
- Two-account RLS isolation was verified on 14 July 2026.
- The browser uses the public Supabase client and current authenticated session; no service-role credential is available to the export code.
- The account block contains only ID, email, and limited account timestamps. Password verifiers, access/refresh tokens, TOTP secrets, unrestricted `app_metadata`, `user_metadata`, and Auth identities are excluded.
- A focused harness verifies pagination, dataset scope, metadata exclusion, file creation, and the audit event.

## 7. Foreseeable Failures And Affected People

| Scenario | Risk | Required response |
|---|---|---|
| Export saved on a shared or compromised device | Customer and business data disclosure | Show a clear warning; user must choose a trusted device and protect or delete the file after use. |
| Session changes during export | Data could be packaged under a stale UI state | Abort unless the same authenticated user and session generation remain current. |
| A table query fails | Incomplete export presented as complete | Fail the whole export; do not download a partial package. |
| More than 1,000 rows exist | Silent truncation | Paginate each table with a stable unique ordering column. |
| Workspace contains another person's data | Excess or unfair disclosure | Treat real third-party requests through the restricted rights process; review third-party and confidential content before disclosure. |
| Browser or extension observes the file | Device-side exposure outside Tallyo's control | Avoid server staging, warn the user, and document the boundary honestly. |

## 8. Mandatory Controls

- Revalidate the Auth user before reading data.
- Use the authenticated public client and existing RLS; never use a service-role key in the browser.
- Abort when the user/session changes or any dataset fails.
- Paginate every dataset and keep ordering stable.
- Exclude Auth secrets, tokens, TOTP material, unrestricted metadata, and identities.
- Warn before downloading and use a filename that does not contain an email address or customer identifier.
- Create and download the file locally without a new server-side export store.
- Record only minimal append-only evidence of successful export.
- Keep account deletion separate and approval-gated because it is destructive and has retention, accounting, payment, backup, and third-party implications.

## 9. User-Facing Wording

The Account page may factually say what datasets are included, that JSON is structured, and that the file is created in the browser. It must warn that the file can contain sensitive business, customer, invoice, payment, and security-event information. It must not claim that the feature makes Tallyo GDPR compliant or automatically satisfies every rights request.

## 10. Retention, Rights, Vendor, And Transfer Implications

The feature creates no additional Tallyo server-side retention location. Existing Supabase, Resend, Stripe, backup, and audit retention questions remain open. The downloaded copy is controlled by the account holder after delivery. Invoice-recipient rights, provider-held records, exemptions, secure support delivery, and deletion remain part of the restricted case process.

## 11. Required Verification

- Focused automated test of exact dataset scope, pagination, Auth metadata minimisation, download, and audit emission.
- Full repository security checks and Edge Function type check.
- Test-account browser acceptance on desktop and mobile, including warning, file readability, dataset counts, and no cross-account rows.
- Production readback showing the allowlisted audit event after the source deployment.

Do not use real customer data for acceptance evidence.

### Controlled Desktop Acceptance - 2026-07-16

- A dedicated test account displayed the sensitive-data warning and completed the browser download.
- The version-1 JSON was readable and contained only the expected top-level account/data structure and six approved datasets.
- Dataset counts matched the same tenant's database counts after accounting for the audit event written after file creation.
- Twenty-five exported rows carrying `user_id` were checked with zero ownership mismatches.
- No password, password verifier, access/refresh token, TOTP secret, unrestricted metadata, or Auth identity field was present.
- One append-only `account_data_exported` event was recorded with no provider identifiers.

The event also contained generic `user_agent` enrichment, which exceeded this review's format/version-only metadata boundary. `SEC-LOG-006` records the focused omission fix. Desktop acceptance therefore remains conditional until the corrected function is deployed and one corrected event is read back; mobile acceptance also remains pending.

## 12. Uncertainty And External-Advice Triggers

Qualified review remains required before public onboarding for controller/processor roles, lawful bases, third-party data disclosure, exemptions, retention, secure support delivery, accounting/tax records, and deletion. A request from an invoice recipient, authorised representative, child, vulnerable person, regulator, court, or person in another jurisdiction must not be routed through this account-holder export without case-specific review.

## 13. Release Conditions

`Approved with conditions` means the technical export may ship in the controlled portfolio app after tests and source review. It does not remove the legal release block. Before paid/public onboarding, Tallyo must still select a restricted rights-case system, approve roles and lawful bases, verify correction/deletion/provider-assistance operations, approve retention and secure-delivery procedures, publish reviewed notices/terms, and complete any required external professional review.
