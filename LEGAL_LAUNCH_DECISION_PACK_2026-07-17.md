# Tallyo Legal And Operational Launch Decision Pack - 2026-07-17

Internal decision aid for `LEGAL-OPS-001`. It is not legal advice, a public notice, approved customer wording, or evidence of compliance. Real-customer processing, legal publication, live payments, paid-service commitments, and public launch remain blocked.

## Decision Standard

Each decision below requires the named Owner decision and, where stated, qualified UK legal/privacy review. A recommendation is a risk-reducing starting point only; it is not approved merely because it appears here.

Do not put private email addresses, identity documents, customer data, secrets, payment details, or live case material in this repository. Approved public business and legal-contact wording belongs in the future customer-facing documents only after review.

## Exact Decisions Required

| ID | Decision | Risk-reducing recommendation | Required evidence / reviewer | Release effect |
|---|---|---|---|---|
| D01 | Contracting business and controller identity | Use the actual registered or sole-trader identity consistently across notices, terms, invoices, support, and provider accounts. | Owner evidence outside Git; qualified review of required disclosures | Blocks legal drafting and publication |
| D02 | Public legal/privacy contact route | Use a controlled business route with MFA, monitoring, absence handling and retention defined. A second operator is optional for the initial sole-trader scope. Do not publish a private personal address by default. | Owner choice; test with synthetic mail only after approval | Blocks rights and complaint operations |
| D03 | Eligible customers and contracting model | Start with UK-based business account holders aged 18 or over using Tallyo for ordinary business invoicing; exclude personal/household use, sensitive case-record use, and non-UK onboarding until separately reviewed. This does not by itself prohibit invoicing an individual customer. | Owner product decision; consumer/B2B legal review | Blocks Terms and onboarding design |
| D04 | Controller/processor allocation by activity | Treat Tallyo as likely controller for accounts, security, support, service operations, and its own payment/fraud obligations; treat the business user as likely controller for customer/contact and invoice content, with Tallyo potentially acting as processor. | Qualified review against the implemented service and contracts | Blocks notice, terms/DPA and rights routing |
| D05 | Lawful basis for each purpose | Map one basis to each purpose before collection. Consider contract for necessary account/service processing, legitimate interests for proportionate security with a documented assessment, and legal obligation only where a specific duty applies. Do not use consent as a catch-all. | Owner purpose decisions; qualified review; legitimate-interests assessment where used | Blocks privacy wording and activation of new processing |
| D06 | Retention schedule and deletion exceptions | Approve purpose-led periods for account, workspace, email, payment, security/audit, support/rights/incident, and backup records. State start event, deletion method, provider path, backup expiry, legal hold, and review date for each. | Owner and qualified review; tax/accounting input where relevant | Blocks deletion promises and live operations |
| D07 | Restricted rights/incident case system | Use a system that provides proportionate restricted access, MFA, auditability, deadline tracking, secure attachments/delivery, export/deletion, retention and tested account recovery. Vault, e-discovery and a second operator are risk-triggered controls, not automatic launch requirements. Git and ordinary chat/email are not approved case stores. | Owner/provider decision; Security and Privacy review; synthetic exercise | Blocks real requests and incident handling |
| D08 | Rights-request authority and secure delivery | Name the Owner as intake, identity, case and response authority for straightforward cases; define qualified escalation triggers, any optional alternate, and the approved secure-delivery method. | Owner operating decision; synthetic access/correction/deletion/processor-assistance exercise | Blocks real customer data |
| D09 | Incident authority and out-of-hours escalation | Name the Owner as incident lead and decision authority; define monitoring, absence handling and ad-hoc legal/security escalation for material or uncertain incidents. | Owner operating decision; synthetic 72-hour exercise | Blocks real customer data |
| D10 | Vendor and transfer acceptance | Confirm applicable contracts and account tiers; complete role, subprocessor, location, transfer-mechanism, transfer-risk, deletion, support, and breach-notification review for Supabase, Resend, Stripe, GitHub Pages, and dormant Turnstile. | Owner contract acceptance; qualified transfer review | Blocks provider production use where unresolved |
| D11 | Customer-facing commitments | Approve a product-specific Privacy Notice, Terms, business-user data-processing terms where required, support/complaints wording, and payment/refund/dispute wording that matches actual behaviour. | Qualified legal review; Product, Payments, Privacy and Release verification | Blocks legal publication and onboarding |
| D12 | ICO fee and accountability records | Complete the ICO fee self-assessment using the real organisation and processing facts; approve the ROPA, DPIA-style assessment outcome, and review calendar. | Owner facts; qualified advice if uncertain | Blocks launch sign-off |
| D13 | Focused external legal review and risk acceptance | Obtain a proportionate one-off UK review of the materially uncertain controller/processor, transfer, retention and customer-document conclusions, or record any policy-compliant Owner risk decision. This is a Tallyo governance requirement for the current uncertainty, not a claim that every small business must retain counsel. | Owner approval and reviewer evidence, or a fully recorded policy-compliant risk decision where permitted | Blocks legal publication and real-customer onboarding |
| D14 | Final launch authorization | After all preceding gates and release checks pass, separately approve legal publication, real-customer onboarding, live Stripe, production abuse controls, and public/paid launch as distinct actions. | Owner approval at each existing boundary | No implicit or bundled approval |

## Owner Decisions Recorded On 2026-07-17

| Decision | Recorded outcome | Remaining condition |
|---|---|---|
| D01 - legal form | The Owner confirmed that Tallyo will initially be operated as a sole trader. | The actual contracting/controller identity and required public or contractual disclosures must be supplied through an appropriate secure route and reviewed. Do not record private identity/address details in this repository. Re-open this decision before incorporation or another operator change. |
| D02 - legal/privacy contact route | The Owner declined a separate dedicated privacy mailbox and approved using the existing business/support email for legal and privacy requests. The address itself is not recorded in this repository. | Before real customers, confirm the public wording and Owner access; require MFA, monitoring/absence handling, request recognition/routing, deadline tracking, retention, and synthetic intake testing. A second operator is optional initially. The contact route does not replace any legally required identity or address disclosure. |
| D03 - initial customer scope | Approved: UK business account holders aged 18 or over, using Tallyo for ordinary business invoicing; no personal/household account use, sensitive case-record use, or non-UK onboarding for the initial release. | Qualified review must confirm the wording and treatment of sole traders, mixed-purpose users, invoice recipients, and regulated professionals performing ordinary invoicing. |
| D04 - working role model | Approved for qualified review: Tallyo is the likely controller for account, security, support, service-operation, and its own payment/fraud processing; the business user is the likely controller for customer/contact and invoice content, with Tallyo potentially acting as processor. | This is a working model, not a final legal determination. Qualified review must confirm it per activity and determine required customer data-processing terms and rights routing. |
| D05/D06 - lawful basis and retention | The Owner approved `LEGAL_BASIS_RETENTION_OPTIONS_2026-07-17.md` as the working position for qualified UK legal/privacy and accounting review. | This is not final legal acceptance and does not authorize production deletion, migration, customer wording, legal publication, real-customer processing, or spending. Specific bases/periods remain subject to qualified correction. |

The D07 system decision is recorded in `RESTRICTED_CASE_SYSTEM_OPTIONS_2026-07-17.md`. On 2026-07-17, the Owner selected the existing business-domain Google Workspace Business Standard edition as the proportionate candidate for restricted case operations. Standard does not include Vault, but Vault is no longer treated as an automatic launch requirement; `GOOGLE_WORKSPACE_PRIVACY_CASE_PLAN_2026-07-17.md` defines the restricted-access, audit, deadline, secure-delivery, manual retention/deletion and synthetic-acceptance conditions that remain open. D08-D09 use the Owner as the initial operator, with ad-hoc qualified escalation when a complex legal or material technical trigger occurs. A second operator, paid Workspace continuity service and cyber-response retainer are optional contingencies. The public comparison research and unsent drafts in `PROFESSIONAL_BACKUP_CANDIDATES_AND_DRAFTS_2026-07-17.md` are retained for future use; no candidate has been selected or contacted.

## Facts The Owner Can Decide Without Sharing Sensitive Data Here

The next Owner response can be limited to:

1. legal form: `limited company`, `sole trader`, or `other / adviser to confirm`;
2. initial customer scope: recommended `UK businesses only, 18+, no consumer use` or a different scope;
3. whether the provisional controller/processor model in D04 may be sent to external counsel as the working model;
4. approval to configure and synthetically test the selected Business Standard case area without real data;
5. whether an optional alternate operator should be added later, using role names rather than private contact details; and
6. authority to seek a focused external legal-review quote, which does not itself authorize purchase or engagement.

## Drafting Gate

Privacy Notice, Terms, refund/support wording, and any customer-facing DPA must remain unpublished and visibly marked `DRAFT - NOT APPROVED` until D01-D06 and D10 are sufficiently decided for accurate drafting. The drafts then require qualified review and a separate Owner publication approval.

## Current Disposition

`Approved with conditions` for internal preparation only. `Blocked` for legal publication, real-customer processing, live payments, and public/paid launch.
