# Tallyo Legal And Privacy Readiness

Internal evidence and action register for the current app. It is not a public Privacy Notice, Terms of Service, legal advice, or a claim that Tallyo is GDPR compliant.

## Current Disposition

**Legal, Privacy and Regulatory Agent disposition, refreshed 2026-07-17:** `Approved with conditions` for internal preparation, portfolio demonstrations, sandbox payments, and controlled test-account use only. Paid/public or real-customer onboarding remains `Blocked`.

The technical app may continue in controlled portfolio/sandbox testing. Current official vendor and legal sources have been collected in `VENDOR_TRANSFER_EVIDENCE_2026-07-17.md`, but legal acceptance remains pending. Publication remains blocked because controller identity/contact details, user/contract model, final role and lawful-basis decisions, retention periods, customer-facing notices/terms, verified rights/incident operations, vendor/transfer dispositions, and qualified external review are unfinished.

## Data Flow Map

| Flow | Data categories | System | Current control / open point |
|---|---|---|---|
| Account signup/sign-in | Email, Auth identifiers, password verifier, MFA factor metadata, recovery-code HMAC values, minimal recovery state, session/security events | Supabase Auth, Tallyo Postgres, Resend security notices | Email confirmation, leaked-password screening, optional TOTP MFA, AAL2 checks. The all-factors-lost flow is verified for the controlled test/portfolio stage; it minimises stored recovery data, never stores/emails raw codes, globally signs out recovery use, preserves the AAL lock, and forces authenticator re-enrolment. This does not approve real-customer onboarding. |
| Prepared Auth CAPTCHA | IP address, TLS/browser fingerprint signals, user agent, sitekey/origin, challenge result/token | Cloudflare Turnstile in the browser, then Supabase Auth validation | Frontend support and narrow CSP/SRI exception are approved and implemented, but dormant: no site key/secret is configured and Supabase enforcement is off. Managed mode, no pre-clearance/invisible mode, feedback disabled, minimal logging, and exact-hostname restriction remain required. Notice/transfer/vendor evidence still blocks production activation. |
| Invoicing workspace | Business profile, customer contacts, invoice/quote/credit-note content, saved items, payment records | Supabase Postgres | Per-user RLS, two-account isolation tests, service-role attribution, append-only provider audit events. |
| Account-holder data export | Limited Auth profile fields plus company settings, customers, saved items, documents, recurring schedules, and audit events | Authenticated browser reads from Supabase Postgres, then local JSON download | Existing RLS, Auth-user revalidation, stable pagination, whole-export failure, session-generation check, metadata minimisation, trusted-device warning, no server staging. Frontend and JWT-protected `log-app-event` v7 are deployed; controlled desktop/mobile acceptance passed and corrected production events contain only format/version metadata. |
| Document/reminder email | Recipient email, document content/PDF, delivery metadata | Resend via Supabase Edge Functions | Server-side key, ownership checks, signed webhook, opt-in automation. Retention and processor terms need review. |
| Invoice card payment | Invoice reference, amount, currency, customer email, provider identifiers; card data remains with Stripe Checkout | Stripe via Supabase Edge Functions | Server-side key, signed/idempotent webhook, trusted Checkout binding, sandbox-only. |
| Public app hosting | Static app assets and ordinary hosting/request metadata | GitHub Pages | No intentional customer database storage in hosting. Response-header and future custom-domain position need review. |
| Backups | Supabase database content, including personal data | Supabase managed backups | Pro daily backups verified; seven-day operational window documented. Timed restore and deletion-in-backups handling remain open. |

## Provisional Role Matrix

This role split is a working hypothesis and requires external review before commercial launch:

- Tallyo is likely a controller for account, security, support, service billing, and product-operation data.
- A business user is likely the controller for customer/contact and invoice data they enter; Tallyo may act as processor for that data.
- Supabase, Resend, Stripe, and hosting providers may act as processors or independent controllers for specific provider purposes.
- Fraud, security, legal-obligation, tax/accounting, and dispute processing may change the role analysis.

## Vendor And Transfer Register

| Vendor | Purpose | Data | Contract/DPA, region, transfers, subprocessors | Status |
|---|---|---|---|---|
| Supabase | Auth, database, Edge Functions, backups, scheduler/Vault | Account and workspace data | June 2026 DPA, London region, UK Addendum/SCC route, subprocessors, deletion and incident terms recorded in `VENDOR_TRANSFER_EVIDENCE_2026-07-17.md`; current Pro plan exposes seven days of API/database and Auth audit logs; account incorporation and transfer-risk decision remain open | Evidence collected; legal acceptance pending |
| Resend | Transactional invoice/reminder/security email and delivery events | Recipient, message/PDF, delivery metadata | DPA, UK transfer route, 15 July 2026 subprocessor list, 30-day email-data statement, termination deletion statement, dashboard/export/share behaviour recorded; processing scope and transfer decision remain open | Evidence collected; legal acceptance pending |
| Stripe | Checkout, payment, refund, dispute lifecycle | Payment/customer identifiers; card data handled by Stripe | DPA role split, transfer addendum, subprocessors/affiliates and qualified deletion terms recorded; exact contracting entity, live-service scope, retention and transfer decision remain open | Evidence collected; sandbox only; legal acceptance pending |
| GitHub Pages | Static app hosting | Request/hosting metadata; no intended workspace database | Public terms/privacy evidence recorded. Current free/public Pages use has not been shown to be covered by the Enterprise DPA; contract, logs/retention and transfer suitability remain open | Evidence collected with material contract gap |
| Cloudflare Turnstile (selected; inactive) | Bot and automated Auth-abuse detection for sign-up, password sign-in, and reset requests | IP address, TLS/browser fingerprint signals, user agent, sitekey/origin and challenge data; no workspace/customer data intended | `CLOUDFLARE_TURNSTILE_VENDOR_REVIEW_2026-07-15.md` records the provider role split, DPA v6.4, UK Addendum/SCC route, public subprocessors, PECR issue, and hostname boundary. The Owner accepted the applicable account terms, reported creating the controlled test widget, and completed pre-enforcement browser acceptance on 2026-07-16. Product-specific retention, transfer-risk conclusions, final notice wording, and professional review remain open. | Internal evidence refreshed; pre-enforcement acceptance verified; production activation blocked |

No analytics, advertising, or non-essential cookie provider is approved in the current app. Turnstile frontend support is dormant and the provider is not contacted while the public site key is blank. Its statement that security signals are strictly necessary is evidence for review, not Tallyo's final PECR conclusion. Any future provider triggers a new privacy/PECR review.

## Retention Working Register

No final retention period is approved yet. Before launch, the Owner and Legal Agent must set and justify each period, including exceptions and deletion evidence.

`LEGAL_BASIS_RETENTION_OPTIONS_2026-07-17.md` contains the Owner-approved working D05/D06 position for qualified review. It separates Tallyo's own sole-trader tax records from business-user workspace records, proposes a 30-day account-closure/export window, category-specific operational periods, and seven-day backup expiry, and leaves all production deletion/migration work separately blocked. No period is final until qualified review and implementation acceptance.

| Category | Current position | Required decision |
|---|---|---|
| Account/Auth/security events | Supabase Pro provider logs currently expose seven days; Tallyo audit/recovery records have no approved category purge | Proposed 12-month routine and 24-month narrowly material-security periods require LIA, implementation and review |
| Customers and invoices | User-controlled active records; no approved closure deletion | Proposed 30-day export/closure window, then active deletion and seven-day backup expiry; user retains responsibility for their own accounting export |
| Payment/refund/dispute records | Tallyo summary plus Stripe provider record | Accounting, chargeback, fraud, tax and legal-claim periods |
| Email/delivery records | Tallyo audit/history plus Resend provider data; Resend states 30-day email-data retention | Keep message content at provider default; proposed Tallyo delivery history follows the underlying document unless a defined dispute hold applies |
| Append-only audit events | No final retention automation | Security evidence versus minimisation; access and deletion exceptions |
| Backups | Current Supabase Pro daily backup window | Restoration, deleted-data reappearance, expiry evidence and legal hold |
| Support/rights/incident records | Internal templates and a fictional tabletop exist; no restricted live case system is approved | Case access, closure, accountability, claims, secure delivery and deletion |

ICO storage-limitation guidance says retention should be necessary, documented, reviewed, and supported by deletion/anonymisation in practice: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/>.

## Rights Request Runbook

1. Log the request date, scope, contact route, identity-verification decision, deadline, owner, and status in a restricted register.
2. Decide whether Tallyo is acting as controller or should route the request to the business user acting as controller.
3. Verify identity proportionately. Do not collect identity documents by default or use email access alone for high-risk account recovery.
4. Search Supabase Auth/database/audit events, Stripe, Resend, support records, and relevant backup limitations.
5. Separate requester data from third-party data; obtain legal advice for exemptions, disputes, or complex redactions.
6. Approve and deliver the response securely in a clear, usable format.
7. Record downstream processor actions, refusal/extension reasons, delivery evidence, and closure.

ICO guidance says subject access requests can be verbal or written and normally require a response without undue delay and within one month: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/subject-access-requests/a-guide-to-subject-access/>.

## Incident And Breach Runbook

1. Detect, timestamp, triage, contain, and preserve evidence without spreading personal data into chat, tickets, or source control.
2. Identify systems, data categories, people, jurisdictions, encryption/access state, and continuing risk.
3. Distinguish a security incident from a personal-data breach and assess likelihood/severity of harm.
4. Engage provider incident channels and external security/legal advice when material or uncertain.
5. Decide and record whether regulator and affected-person notification is required; do not assume every incident is reportable.
6. Remediate, monitor, document lessons learned, and update controls/notices/registers.

ICO guidance requires records of personal-data breaches and, where the reporting threshold is met, notification without undue delay and where feasible within 72 hours: <https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/>.

## Internal Operations Evidence

`LEGAL_OPERATIONS_RECORDS.md` contains a working ROPA, rights/incident/vendor/retention templates, and a preliminary DPIA screening. `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md` records fictional rights-request and breach exercises with no real personal data. `LEGAL_LAUNCH_DECISION_PACK_2026-07-17.md` identifies the exact Owner decisions, `VENDOR_TRANSFER_EVIDENCE_2026-07-17.md` records current official provider evidence and limitations, `PRIVACY_OPERATIONS_RUNBOOK.md` defines the restricted-case and synthetic acceptance gate, and `EXTERNAL_LEGAL_REVIEW_PACK_2026-07-17.md` defines the qualified-review handoff.

The tabletop passed as a process-design exercise but identified blocking operational gaps. The account-holder workspace export is implemented and reviewed under `LEGAL_ACCOUNT_DATA_EXPORT_REVIEW_2026-07-15.md`. Controlled desktop and real-phone acceptance confirmed the trusted-device warning, local JSON download and readability; corrected production audit events contain only the approved format/version metadata. There is still no restricted case system, approved role/lawful-basis decision, verified correction/deletion/provider-assistance procedure, accepted vendor/transfer disposition, or approved incident escalation route. This is not evidence that live privacy operations work end to end.

## Claims Register

Allowed factual wording must remain evidence-backed, for example: "uses Supabase Auth", "RLS is enabled and isolation-tested", "Stripe webhook signatures are verified", and "built with data-protection principles in mind".

Blocked without explicit legal approval and suitable evidence: "GDPR compliant", "fully secure", "bank-grade", "legally compliant", "anonymous", "we never share data", "immediate deletion", and "instant/guaranteed refunds".

## Mandatory Work Before Launch

1. Resolve D01-D14 in `LEGAL_LAUNCH_DECISION_PACK_2026-07-17.md`, beginning with business/controller identity, legal contact, and eligible-customer model.
2. Obtain qualified acceptance or conditions for the provider, contract, and transfer evidence in `VENDOR_TRANSFER_EVIDENCE_2026-07-17.md`.
3. Approve role/lawful-basis and final retention decisions with active-system, provider, legal-hold, and backup deletion mechanics.
4. Keep the verified account-holder export current; approve a restricted case system; then pass every synthetic correction, deletion, provider-assistance, secure-delivery, and incident exercise in `PRIVACY_OPERATIONS_RUNBOOK.md`.
5. After the facts above are decided, draft and externally review product-specific Privacy Notice, Terms, business-user data terms where required, and payment/refund/support/complaint wording.
6. Complete the fuller DPIA-style assessment, ICO fee self-assessment, current-law review, and external professional review defined in `EXTERNAL_LEGAL_REVIEW_PACK_2026-07-17.md`.
7. Obtain separate Owner approval for legal publication, provider production changes, real-customer onboarding, live payments, and public/paid launch.
8. Re-run the Legal Agent and Release Agent gates immediately before each authorized launch action.
