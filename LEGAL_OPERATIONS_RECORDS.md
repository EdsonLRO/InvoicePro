# Tallyo Legal And Privacy Operations Records

Internal working records for privacy and legal operations. This file is not a public notice, legal advice, or evidence that Tallyo is GDPR compliant.

Do not record live cases, customer personal data, identity documents, secrets, payment details, or provider payloads in this repository. Real cases require a restricted case system with access controls, retention, and deletion procedures.

## Current Disposition

**Legal, Privacy and Regulatory Agent disposition, refreshed 2026-07-17:** `Approved with conditions` for internal preparation, portfolio demonstrations, sandbox payments, and controlled test-account use only.

Paid/public onboarding and real-customer processing remain `Blocked` until the open legal and operational conditions in `LEGAL_PRIVACY_READINESS.md` are resolved and approved by the Owner, including focused professional advice where Tallyo's current material-uncertainty policy requires it. A retained DPO, backup operator, Workspace support service, Vault licence and cyber-response retainer are not automatic prerequisites for the approved initial scope.

## Working Record Of Processing Activities

This is a preparation aid for a Record of Processing Activities (ROPA), not an approved Article 30 record. Controller/processor roles, lawful bases, retention periods, transfer safeguards, and legal obligations remain decisions for the Owner and qualified advisers.

| Processing activity | Data and people | Purpose and systems | Working role / lawful basis | Recipients and transfers | Retention / deletion | Status |
|---|---|---|---|---|---|---|
| Account and security administration | User email, Auth identifiers, MFA metadata, session and security events | Create and protect accounts in Supabase Auth | Role and lawful basis not approved | Supabase; current DPA/transfer evidence collected, acceptance pending | Period not approved; provider and app deletion paths need testing | Open |
| Public Auth abuse detection (prepared; inactive) | Account applicants and users; IP address, TLS/browser fingerprint signals, user agent, sitekey/origin and challenge result | Distinguish automated abuse from legitimate sign-up, sign-in and password-reset requests using Cloudflare Turnstile and Supabase Auth validation | Tallyo likely controller for selecting the control; Cloudflare states processor for site protection and controller for service improvement; lawful basis not approved | Cloudflare global processing and subprocessors; DPA/UK Addendum evidence recorded, transfer-risk decision open | Product-specific signal/analytics retention is not established; do not activate until decided | Open / inactive |
| Invoicing workspace | Business profile, customer contacts, invoice/quote/credit-note content, saved items | User-requested invoicing in Supabase Postgres | Business user likely controller for entered customer data; Tallyo role requires review | Supabase; current DPA/transfer evidence collected, acceptance pending | Accounting, closure, correction and deletion periods not approved | Open |
| Document and reminder email | Recipient address, document/PDF, message and delivery metadata | Send requested documents and opt-in reminders through Resend | Roles and lawful basis not approved | Resend and email-chain providers; current DPA/subprocessor/transfer evidence collected, acceptance pending | Delivery, suppression and deletion periods not approved | Open |
| Invoice card payment | Customer email, invoice reference, amount, currency and provider identifiers; card data stays with Stripe Checkout | Accept and reconcile invoice payments and refunds | Controller split and lawful bases require review | Stripe; role/transfer/subprocessor evidence collected, acceptance pending; sandbox only | Accounting, fraud, chargeback and provider retention not approved | Open |
| Security and operational audit | User/account reference, action category, object reference, provider event ID and minimised metadata | Detect misuse, investigate incidents and prove sensitive actions | Role and lawful basis not approved | Supabase; no intentional public disclosure | Security value must be balanced against minimisation; period not approved | Open |
| Managed backup and recovery | Database content, including personal data present at snapshot time | Resilience, restoration and incident recovery | Mirrors underlying processing roles; legal basis not separately approved | Supabase managed backups | Seven-day technical window and isolated timed restore verified; deletion-in-backups procedure still needs testing | Open |
| Privacy and incident case operations (proposed) | Request/case identity, correspondence, evidence, decisions, delivery and incident records | Recognise and handle rights requests and personal-data incidents | Tallyo likely controller for its accountability records and may handle processor-assistance material; requires qualified confirmation | Google Workspace Business Standard candidate; no active subscription or case configuration verified | Manual case schedule and provider deletion/recovery limitations require approval and synthetic testing | Pending purchase and D07/D10 acceptance |

ICO documentation guidance: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/documentation/>.

## Rights Request Case Template

Store completed cases outside Git in a restricted system.

| Field | Record |
|---|---|
| Case reference | Non-identifying internal reference |
| Received at / channel | Date, time, and controlled intake route |
| Request type and scope | Access, correction, deletion, restriction, objection, portability, or other |
| Tallyo role decision | Controller response, processor assistance, or route to business user |
| Identity verification | Proportionate method, evidence decision, and rejected excess data |
| Deadline and owner | Calculated deadline, responsible person, and escalation point |
| Systems searched | Auth, database, audit events, Resend, Stripe, support, backup limitations |
| Third-party data / exemptions | Redaction, exemption, extension, or legal-advice decision |
| Processor actions | Requests sent, references, responses, and completion evidence |
| Outcome and delivery | Decision, secure delivery method, refusal/extension reasons |
| Closure and retention | Closed at, review notes, retention trigger, deletion due date |

## Incident And Personal-Data Breach Case Template

| Field | Record |
|---|---|
| Incident reference | Non-identifying internal reference |
| Detected / reported | Date, time, source, and reporting person or system |
| Systems and data | Affected services, data categories, people, scale, and jurisdictions |
| Containment | Immediate actions, preserved evidence, and continuing exposure |
| Breach determination | Security incident only or personal-data breach, with reasoning |
| Risk assessment | Likelihood and severity of harm, vulnerable people, encryption/access state |
| Provider escalation | Supabase, Resend, Stripe, hosting, insurer, legal or security contacts |
| Notification decision | ICO and affected-person threshold, decision time, reasons, approver |
| 72-hour timeline | Key timestamps and reasons for any incomplete notification information |
| Remediation | Eradication, recovery, monitoring, control changes, and lessons learned |
| Closure and retention | Closure approval, follow-up owner, review date, and record retention |

ICO breach guidance: <https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/>.

## Vendor And International Transfer Review Template

| Review area | Required evidence |
|---|---|
| Service and purpose | Exact product, processing purpose, data categories, data subjects |
| Role allocation | Controller, processor, subprocessor, or independent-controller position |
| Contract | Current terms, DPA, instructions, confidentiality and audit provisions |
| Locations and access | Storage, processing, remote support and subprocessor countries |
| Transfer mechanism | UK adequacy, IDTA, UK Addendum, exception, or other approved mechanism |
| Transfer risk | Destination laws, technical/contractual safeguards, residual risk decision |
| Security and incidents | Security evidence, breach notification, deletion, continuity and support |
| Approval and review | Owner, legal reviewer, decision, conditions, review trigger and date |

ICO international-transfer guidance: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/a-guide-to-international-transfers/>.

## Retention Decision Template

For each data category, record the purpose, start event, proposed period, legal/operational justification, exceptions, active-system deletion method, backup expiry behaviour, provider deletion process, evidence, owner, approval date, and review date. No period becomes approved merely because it appears in a provider default or this repository.

## Operational Acceptance Gate

`PRIVACY_OPERATIONS_RUNBOOK.md` is the implementable operating authority for rights, correction, deletion, provider assistance, secure delivery, and personal-data incidents. Business Standard is the selected candidate and the Owner-led role model is accepted, but no Standard subscription is verified active. Contract/purchase approval, restricted fictional-data configuration, all four synthetic exercises and recovery/absence checks remain outstanding. Repository templates and the 2026-07-15 tabletop do not by themselves satisfy this gate.

`LEGAL_LAUNCH_DECISION_PACK_2026-07-17.md`, `LEGAL_BASIS_RETENTION_OPTIONS_2026-07-17.md`, `VENDOR_TRANSFER_EVIDENCE_2026-07-17.md`, and `EXTERNAL_LEGAL_REVIEW_PACK_2026-07-17.md` define the remaining decisions, current lawful-basis/retention proposal, provider evidence, and qualified-review deliverables.

## DPIA Screening

This screening is preliminary and is not a completed Data Protection Impact Assessment (DPIA).

| Screening factor | Current observation |
|---|---|
| Evaluation, scoring or significant automated decisions | Not implemented. |
| Systematic monitoring or tracking | No advertising analytics or behavioural profiling is approved; security and delivery events are recorded. |
| Special-category or criminal-offence data | Not intended. Free-text invoice fields could still receive unexpected sensitive data and need user guidance/minimisation. |
| Scale | Current testing is small; public scale is not approved. |
| Invisible processing | Customer recipients may not hold Tallyo accounts and need appropriate notice from the relevant controller. |
| Vulnerable people | Not a target user group; not conclusively excluded by technical controls. |
| Innovative or intrusive technology | Standard cloud, email, TOTP MFA and hosted payment services; no biometric or AI profiling. |
| Data matching or enrichment | Not implemented. |
| Denial of service or rights | Account access, invoicing and payment records could materially affect a user if unavailable or incorrect. |
| International/vendor complexity | Multiple cloud providers and email/payment chains require role, DPA and transfer review. |
| Tenant or credential failure impact | RLS, Auth, webhook and secret failures could expose or corrupt business/customer records. |

**Screening outcome:** perform a fuller DPIA-style assessment before public onboarding because of invisible customer-recipient processing, payment/account records, multi-provider transfers, and the impact of tenant-isolation or recovery failure. This is a precautionary engineering recommendation, not a legal conclusion that the statutory high-risk threshold is met.

ICO DPIA guidance: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-impact-assessments/>.

## Exercise And Review Schedule

1. Run a fictional rights-request and breach tabletop before public onboarding and after material architecture or vendor changes.
2. Preserve the completed isolated timed-restore evidence; test approved deleted-data expiry/reappearance handling separately before real-customer processing.
3. Test approved export, correction, deletion and processor-assistance procedures before real customer data.
4. Review vendor/transfer evidence before enabling a provider or changing region/service scope.
5. Review retention decisions at least annually and after legal, tax, product or incident changes.
6. Re-run the Legal Agent release gate before publishing notices, accepting payment, or onboarding real customers.
