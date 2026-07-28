# Tallyo ICO And Accountability Preparation - 2026-07-17

Internal working record for `LEGAL-OPS-001`. It is not legal advice, a completed ICO registration, a final DPIA, or evidence of compliance. It uses no real customer data. The Owner approved the document content, elected to proceed without professional legal review at this stage and separately approved the clean customer-facing privacy publication on 28 July 2026. Focused launch-scope account-specific provider verification is complete; unrestricted public release remains separately gated.

## Official Basis Checked

- The ICO states that organisations, including sole traders, which use personal information must pay the data-protection fee unless exempt: <https://ico.org.uk/for-organisations/data-protection-fee/>.
- The official fee checker determines whether a fee is due and the amount: <https://ico.org.uk/fee-checker>.
- ICO guidance says a DPIA is required for processing likely to result in high risk and describes a process of screening, describing processing, consulting where appropriate, assessing necessity/proportionality, identifying risks, controls, and conclusions: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/>.
- ICO legitimate-interests guidance requires a purpose, necessity, and balancing assessment rather than using legitimate interests as a default: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/legitimate-interests/>.
- From 19 June 2026, the ICO says organisations must provide a data-protection complaint route, acknowledge within 30 days, investigate/respond and keep the complainant informed without undue delay, and communicate the outcome without undue delay: <https://ico.org.uk/for-organisations/how-to-deal-with-data-protection-complaints/>.

## ICO Fee Self-Assessment Worksheet

Do not complete private answers in Git. The Owner should use the official fee checker with the real facts and retain the dated result in the restricted legal record.

| Official-checker fact to confirm | Private/Owner answer | Preparation note |
|---|---|---|
| Exact sole-trader/controller identity and trading name | `[COMPLETE OUTSIDE GIT]` | Must match contracts and required public disclosures |
| Business/contact address and whether an alternative public address is used | `[COMPLETE OUTSIDE GIT]` | ICO records may publish controller contact information; obtain advice before using a home address |
| Is personal information processed electronically for business purposes? | Expected `Yes`; Owner to confirm | Tallyo accounts, support and service operations use electronic personal information |
| Is Tallyo acting as a controller for any processing? | Working answer `Yes`; qualified confirmation required | Account, security, support, service operations and accountability are likely controller activities |
| Do all controller purposes fall only within a fee exemption? | `[OFFICIAL CHECKER / ADVISER TO DETERMINE]` | Do not assume the accounts-and-records exemption covers operating a cloud service, security, support or complaints |
| Staff count and annual turnover for the fee tier | `[COMPLETE OUTSIDE GIT]` | Private financial/operating fact; do not record here |
| Public authority, charity, pension scheme or other special status | Working answer `No`; Owner to confirm | Sole-trader status alone does not determine exemption |
| CCTV used for crime prevention | `[OWNER TO CONFIRM OUTSIDE GIT]` | Can affect fee outcome; unrelated private premises facts are not needed in the repository |
| Official checker outcome and date | `[RESTRICTED RECORD]` | Record due/exempt, fee tier if due, reasons, checker version/date |
| Registration/payment or exemption action | `[OWNER ACTION]` | Spending/submission and private facts require Owner action |
| Renewal/reassessment date | `[SET AFTER OUTCOME]` | Reassess at least annually and after entity, purpose, scale or status change |

**Current disposition:** fee outcome `Undetermined`. The app's processing facts make it unsafe to assume exemption. Running the checker and any registration/payment remain pre-launch Owner actions.

## Provisional DPIA-Style Assessment

### Scope and purpose

The assessment covers the initial UK business-only, single-user-per-account Tallyo invoicing application: account/Auth and MFA recovery; business profiles and workspace records; customer/invoice content; requested email/reminders; Tallyo subscription Billing; Stripe Connect onboarding and customer payments/refunds/disputes; support, privacy requests and incidents; audit events; backups; and Cloudflare Pages hosting. It excludes future consumer/non-UK use, team workspaces, advertising analytics, AI access to private data, special-category workflows and unrestricted public AI.

### Screening conclusion

No large-scale special-category processing, profiling, significant automated decisions, biometric identification, or intended vulnerable-person processing is implemented. Risks nevertheless justify completing this precautionary assessment because invoice recipients may not interact directly with Tallyo, multiple providers/transfers are involved, tenant/Auth failure could expose business and recipient information, and payment/security/account-recovery records could materially affect people.

**Provisional statutory outcome:** `Formal DPIA requirement not conclusively determined`. Qualified review must decide whether the legal high-risk threshold is met. The safeguards and open actions below apply regardless of that classification.

### Necessity and proportionality

| Processing element | Necessity/proportionality position | Open condition |
|---|---|---|
| Account identity and Auth | Necessary to provide and protect an account; collect only essential identifiers and state | Approve closure/deletion and unverified-account handling |
| TOTP MFA and recovery | Optional MFA and one-time recovery reduce lockout/account-compromise risk without storing raw recovery codes | Preserve AAL, global sign-out, one-time semantics, minimal notices, forced re-enrolment and event retention |
| Customer/invoice workspace | Core requested function; business user chooses content and purpose | Final controller/processor terms, recipient transparency and sensitive-data prohibition |
| Transactional email/reminders | Needed only when a user requests sending or opts into reminders | No marketing reuse; minimise provider/content retention and provide recipient notice route |
| Stripe payments | Optional user-requested feature; hosted card entry avoids Tallyo card storage | Live activation, provider contract, roles, customer wording and retention remain blocked |
| Audit/security events | Needed in limited categories for abuse investigation and accountability | Approved LIA, minimised event fields, 12/24-month criteria and documented manual review |
| Backups | Needed for resilience; the documented seven-day Supabase Pro window is proportionate when manual deletion and post-restore reconciliation are followed | Confirm the actual account setting and record provider-cycle limits in each deletion case |
| Support/rights/incidents | Needed for service, legal and accountability duties | Verified privacy/support mailboxes, primary and backup monitor, synthetic manual-request acceptance and minimised case schedule |
| Static hosting | Necessary to serve the browser application | Confirm Cloudflare account DPA, products, log settings and publication configuration |

### Risks and measures

Scale: likelihood and severity are qualitative until production volumes and contracts are known.

| Risk to people | Inherent risk | Existing/prepared measures | Residual/open action |
|---|---|---|---|
| Cross-tenant disclosure or unauthorized write | High | RLS, scoped server authorization, two-account isolation tests, append-only evidence controls | Re-run relevant gates after affected source/schema change; do not weaken RLS/Auth |
| Account takeover or recovery abuse | High | Email confirmation, session controls, optional TOTP, AAL enforcement, one-time recovery, throttling, global sign-out, forced re-enrolment, minimised notifications | Maintain tested controls; approve retention and incident response |
| Invoice recipient lacks transparency or cannot find controller | Medium/High | Draft notice, business-user terms and routing model prepared | Finalise who delivers notice, exceptions, document/email layering and rights routing |
| Unexpected sensitive/free-text content | High | Initial scope prohibition and minimisation wording | Add final onboarding/in-product warning; define restricted handling/deletion/escalation |
| Excessive or indefinite retention | High | Privacy-lean category schedule, manual deletion/anonymisation process, export and documented provider cycles | Owner approval, dated manual reviews, provider actions, legal holds and fictional acceptance test |
| Provider/subprocessor or international-transfer exposure | High | Dated official evidence collected for current providers | Accept exact contracts/accounts, complete transfer assessment and supplementary measures |
| Email sent to wrong recipient | Medium/High | User-initiated send, visible recipient, transactional scope | Final confirmation UX/process, correction/incident procedure and minimised logs |
| Incorrect payment/refund/dispute status | High | Hosted Checkout, trusted object binding, signed webhook verification, replay controls and protected live acceptance | Public payment availability remains a separate release decision; preserve reconciliation and incident procedures |
| Lost access to privacy/incident cases | High | Owner-led runbook and proposed monitored mailboxes | Verify the primary and backup monitor and complete an absence/read-back exercise |
| Privacy case evidence leaks through Git/chat/email | High | Permanent prohibition and minimised case procedure | Use only the confirmed operational mailbox/record system; train any future alternate before access |
| Deleted data reappears after backup restore | Medium/High | Documented provider backup cycle and manual deletion record | Reapply the deletion decision after any restore made within the provider cycle and record completion |
| Service outage or provider closure causes loss | Medium/High | Export, managed backups, recovery evidence | Final continuity/closure wording; user export warning; no unapproved uptime guarantee |
| Complaint or rights deadline missed | High | Owner authority, templates, complaint process draft | Controlled monitored route, deadline system, synthetic test and absence handling |

### Consultation

- Internal product, Security, Payments, Privacy, and Release facts are represented by current repository evidence.
- No real customer or public consultation is authorized before legal wording and intake controls are approved.
- Qualified UK legal/privacy advice is required for the role split, invisible recipient processing, transfers, retention, complaint procedure, fee/DPIA conclusion and customer wording.
- A later usability test may use synthetic personas and no personal data after the draft wording is approved for testing.

### Provisional conclusion

Focused launch-scope provider facts are verified and the approved manual retention/case procedure has passed its non-personal rehearsal. The Privacy Notice and Business-User Data Processing Terms are approved for focused customer-facing publication; unrestricted public release remains separately gated. The Owner elected to proceed without professional legal review at this stage; that decision does not establish compliance. Consult the ICO before processing only if the final DPIA identifies unmitigated high risk and applicable law requires prior consultation.

## Focused Legitimate-Interests Assessments

Updated 27 July 2026 for the minimum manual-launch scope. These are completed working assessments for Owner and qualified review; they do not authorise publication or override the business-user controller/Tallyo processor split.

### LIA-01 - proportionate account and service security

- **Purpose:** protect users, recipients, Tallyo and providers from account compromise, abuse, fraud and unauthorized access; investigate material events.
- **Benefit:** reduces disclosure, financial, service and identity harm and supports reliable security response.
- **Necessity:** authentication alone cannot detect or investigate every misuse. Use limited session/recovery/audit signals; avoid content inspection and broad behavioural profiling.
- **Alternatives:** shorter/no logs reduce investigation ability; contractual basis may cover essential login but not every defensive investigation; consent would be inappropriate and withdrawable.
- **Expectations and impact:** business users reasonably expect proportionate security. Network/device and account-event data can still be intrusive or misinterpreted.
- **Safeguards:** minimised event schema; role-limited access; RLS; 12-month routine and 24-month narrowly material proposals; no advertising reuse; objection/complaint handling; legal hold only when documented; dormant Turnstile separately assessed.
- **Objection handling:** record and assess an objection; restrict non-essential investigation processing where appropriate while preserving processing required for account security or legal claims.
- **Working conclusion:** supportable for the stated launch purpose because the data and use are limited, security benefits are substantial and less intrusive alternatives do not provide equivalent protection. Adopt only with the stated minimisation, manual retention review, transparency and Owner approval.

### LIA-02 - operational audit and fraud/dispute defence

- **Purpose:** establish whether sensitive actions, payment/refund/dispute events and provider confirmations occurred; prevent duplicate/replayed actions; investigate claims.
- **Necessity:** a minimal event trail is needed because interface state or an assertion alone cannot prove a money/security event. Full payloads or indefinite histories are unnecessary.
- **Expectations and impact:** business users and payers expect payment integrity but may not expect extensive profiling. Incorrect evidence can affect money or access.
- **Safeguards:** signed webhook verification; trusted object binding; provider IDs and limited metadata; append-only protection; restricted access; category-specific retention; dispute/legal-hold review; no card data or raw provider payload in routine audit.
- **Objection handling:** assess objections against the need to preserve payment integrity, prevent replay and defend an active dispute; remove or anonymise evidence when that need ends.
- **Working conclusion:** supportable for narrowly defined event and idempotency evidence. It does not justify full provider payloads, card/bank/identity data, general behavioural profiling or a blanket six-year period for all activity events.

### LIA-03 - transactional email delivery and service support

- **Purpose:** deliver Tallyo's necessary account/security message, operate support and diagnose delivery failures. A business user's customer document/reminder is processed on that business user's instruction rather than under Tallyo's own legitimate interest.
- **Necessity:** recipient address/content must pass through an email provider for the requested transmission; limited delivery metadata helps diagnose failure. Marketing or indefinite message-body retention is unnecessary.
- **Expectations and impact:** recipients may expect an invoice from the business user but may not know Tallyo or Resend. Wrong-address delivery can expose financial/contact data.
- **Safeguards:** user-selected recipient; transactional-only use; opt-in overdue reminders; visible privacy route; provider 30-day content position; minimal Tallyo event history; correction/incident process; no advertising use.
- **Objection handling:** stop optional follow-up and review the support record where an objection applies; necessary security notices and legal-claim records may still be retained under the documented basis.
- **Working conclusion:** supportable for Tallyo's own necessary service/security delivery and proportionate operational support. Customer documents/reminders remain processor activity governed by the business user's instructions and Article 28 terms.

### LIA adoption conditions

- Owner confirms the purposes and adopts the working conclusions.
- The Privacy Notice identifies the interests and objection route.
- The manual retention schedule and quarterly review are operated.
- No marketing, advertising analytics, private-data AI access or unrelated profiling is added under these LIAs.
- Reassess after a new purpose, provider, data category, user group, material complaint or security incident.

## Accountability Review Calendar

| Trigger / cadence | Required review | Owner/evidence |
|---|---|---|
| Before first real customer | Final role/basis/retention, fee outcome, DPIA decision, vendors/transfers, legal documents, complaint/case operations, release gates | Owner plus qualified reviewer; dated restricted evidence |
| At least annually | ROPA, retention schedule, LIAs, DPIA screening, fee/registration, provider contracts/subprocessors/transfers, public notices and complaint process | Owner; record changes and next date |
| Before a new provider or material account-tier/region change | Contract/DPA, role, data, location, transfer, security, incident, deletion, support and exit review | Vendor record and separate approval |
| Before new purpose, data category or customer group | Lawful basis, transparency, necessity, DPIA/LIA, terms, consent/PECR and operational controls | Legal/Privacy disposition before implementation |
| After material security/privacy incident | Root cause, notifications, safeguards, retention, vendors, DPIA/LIA and notice changes | Restricted incident record; qualified escalation as triggered |
| After relevant law/guidance change | Update affected records and customer wording; do not silently rely on old advice | Dated official source and review disposition |
| After Auth, RLS, payment, recovery, deletion or backup change | Focused security/privacy tests and evidence; reassess risks and wording | Specialist and release evidence |
| Before incorporation/entity/address change | Contracting/controller identity, invoice/public disclosures, contracts, fee, notices and Auth URLs if affected | Owner/private evidence and qualified review |

## Completion Record

Prepared autonomously with public official sources and repository product evidence only. No submission, payment, provider change, external contact, legal publication, private fact collection, or real-customer processing occurred.
