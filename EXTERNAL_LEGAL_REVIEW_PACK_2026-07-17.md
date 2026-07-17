# Tallyo External Legal And Privacy Review Pack - 2026-07-17

Internal handoff index for a qualified UK adviser. It is not legal advice, a final instruction letter, or authorization to engage or pay an adviser. The Owner must approve the reviewer, disclosure scope, cost, and engagement.

## Review Objective

Determine the legal and privacy conditions for an initial UK real-customer release of the current single-user-per-account invoicing application. Review the implemented product, not a future SaaS website or subscription platform.

The desired output is a written disposition for each question: `approved`, `approved with conditions`, `blocked`, or `further specialist advice required`, with required wording/actions and cited legal basis.

## Product Facts To Verify

- Tallyo is a working browser-based invoicing workspace. The approved initial scope is UK business account holders aged 18 or over using it for ordinary business invoicing, with personal/household account use, sensitive case-record use, and non-UK onboarding excluded pending separate review.
- An account holder stores their business profile, customer contacts, invoices, quotes, credit notes, saved items, payment summaries, and delivery/audit events.
- Supabase provides Auth, Postgres, Edge Functions, scheduled jobs/Vault support, and managed backups in the documented London region, with possible provider/subprocessor processing elsewhere.
- Resend sends requested documents, opt-in reminders, and security notices. Email content, PDF attachments, recipient addresses, delivery events, and provider logs may contain personal data.
- Stripe Checkout/payment/refund/dispute handling is implemented and verified in sandbox only. Card data stays with Stripe. Live mode is disabled.
- GitHub Pages currently hosts static public assets. It intentionally stores no workspace database, but receives ordinary visitor request/usage metadata under the applicable GitHub terms.
- Google Workspace Business Standard is the selected candidate for controlled legal/privacy intake and restricted case operations, but no active Standard subscription is verified. Trial/purchase, contract acceptance, configuration and real case data remain blocked pending separate decisions.
- Cloudflare Turnstile support is present but dormant: no repository site key, no stored secret, and no Supabase enforcement. Production activation is separately blocked.
- Accounts use email confirmation, password controls, optional TOTP MFA, one-time MFA recovery codes, AAL enforcement, global sign-out during recovery, and forced authenticator re-enrolment. Raw passwords, TOTP secrets, recovery codes, and service secrets must not be disclosed for review.
- Tenant data is protected with RLS and scoped server-side authorization. Account-holder export is verified for controlled testing. Live correction, deletion, provider assistance, secure delivery, and restricted case operations are not yet verified.
- No advertising analytics, behavioural profiling, AI processing of private workspace data, special-category workflow, public subscription plan, or consumer-contract model is approved.
- Current disposition permits controlled portfolio/sandbox testing only. No real-customer processing is authorized.

## Repository Evidence Index

Provide only the current files needed for advice, after a secret/PII review:

- `APP_STATUS.md` - implemented product and remaining release conditions;
- `LEGAL_PRIVACY_READINESS.md` - current legal/privacy disposition, flows, roles, retention and claims controls;
- `LEGAL_OPERATIONS_RECORDS.md` - working ROPA, templates and DPIA screening;
- `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md` - fictional exercise evidence and operational gaps;
- `LEGAL_LAUNCH_DECISION_PACK_2026-07-17.md` - exact Owner decisions;
- `VENDOR_TRANSFER_EVIDENCE_2026-07-17.md` - dated official provider evidence and limitations;
- `PRIVACY_OPERATIONS_RUNBOOK.md` - required live-operating controls and synthetic acceptance gate;
- `PAYMENT_OPERATIONS_RUNBOOK.md` and current Stripe sandbox evidence - implemented payment/refund/dispute behaviour;
- `CLOUDFLARE_TURNSTILE_VENDOR_REVIEW_2026-07-15.md` and browser acceptance evidence - dormant abuse-control design;
- relevant Security findings and RLS/Auth summaries only if the adviser needs them to assess risk or wording.

Do not provide environment files, tokens, passwords, MFA/recovery material, private emails, identity documents, production exports, provider payloads, real cases, customer data, or payment details.

## Questions Requiring Written Advice

1. For each implemented processing activity, when is the contracting business/Tallyo a controller, joint controller, processor, or subprocessor, and what customer data-processing terms are required?
2. Is the recommended initial scope of UK business customers aged 18 or over, excluding consumer use, minors, regulated/special-category workflows, and non-UK onboarding, expressed and enforced adequately? What risks remain for sole traders or mixed-purpose users?
3. What lawful basis should apply to each purpose: account/service delivery, security and fraud prevention, audit evidence, document/reminder email, payment/refund/dispute handling, support, rights cases, incidents, backups, and dormant Turnstile?
4. What privacy information must Tallyo give account holders and non-account invoice recipients, and who is responsible for delivering it? Is a business-user notice template or contractual obligation needed?
5. What retention periods and deletion exceptions are appropriate for Auth/account, workspace/invoice, email/delivery, payment/refund/dispute, audit/security, support/rights/incident, and backup records, accounting for UK tax/company obligations and legal claims?
6. Are the Supabase, Resend, Stripe, GitHub Pages, pending Google Workspace Business Standard, and Turnstile contracts, roles, locations, subprocessors, UK transfer mechanisms, and proposed safeguards adequate for the exact use? What transfer risk assessments or supplementary measures are required before purchase or production use?
7. Does the current GitHub Pages arrangement provide adequate contractual/privacy terms for real-customer hosting, or is a different hosting contract required before launch?
8. Does the current DPIA screening require a formal DPIA, and are any additional assessments needed for legitimate interests, transfers, children/vulnerable people, invisible invoice-recipient processing, MFA recovery, or payments?
9. What restricted case-system, identity verification, secure delivery, processor-assistance, correction/deletion, backup, and incident-decision controls are legally necessary before onboarding?
10. How do the Data (Use and Access) Act 2025 provisions commenced in 2026 affect Tallyo, including data-protection complaints handling and privacy documentation?
11. Does Tallyo need to pay the ICO data protection fee, and what facts/exemptions control the answer?
12. What Terms, acceptable-use, support/complaints, suspension/termination, IP, availability, liability, payment, refund, failed-payment, chargeback, and dispute wording is appropriate for the initial model?
13. What Companies House, business-identity, invoice, tax/VAT, distance-selling, consumer, e-commerce, and email/PECR disclosures or controls apply to the selected legal form and customer scope?
14. Which residual risks must the Owner explicitly accept, and which cannot responsibly be accepted without a product/operational change?

## Current Authoritative Sources To Check

Sources below were checked on 2026-07-17. The reviewer must confirm currency and applicability:

- [ICO controllers and processors](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/controllers-and-processors/controllers-and-processors/)
- [ICO lawful-basis guide](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/)
- [ICO right to be informed](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-be-informed/)
- [ICO accountability and governance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/)
- [ICO international transfers](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/a-guide-to-international-transfers/)
- [ICO 72-hour breach response](https://ico.org.uk/for-organisations/advice-for-small-organisations/personal-data-breaches/72-hours-how-to-respond-to-a-personal-data-breach/)
- [ICO data protection fee information](https://ico.org.uk/for-organisations/data-protection-fee/)
- [GOV.UK Data (Use and Access) Act 2025 commencement plan](https://www.gov.uk/guidance/data-use-and-access-act-2025-plans-for-commencement)
- [GOV.UK business setup](https://www.gov.uk/set-up-business)
- [GOV.UK limited-company website and stationery disclosures](https://www.gov.uk/running-a-limited-company/signs-stationery-and-promotional-material)
- [GOV.UK required invoice content](https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include)
- [Google Workspace Business pricing and editions](https://workspace.google.com/intl/en_gb/business/)
- [Google Cloud Data Processing Addendum](https://workspace.google.com/terms/dpa_terms.html)
- [Google Workspace subprocessors](https://workspace.google.com/terms/subprocessors.html)

The Data (Use and Access) Act is a 2025 Act with staged commencement in 2025-2026. Sources or search summaries calling it the “Data Use and Access Act 2026” must not be relied on without checking GOV.UK and legislation.gov.uk.

## Requested Deliverables

1. activity-by-activity role and lawful-basis matrix;
2. approved retention schedule with deletion/backup/provider rules;
3. vendor/transfer disposition and required assessments;
4. reviewed Privacy Notice, Terms, business-user data terms, and payment/support/complaint wording;
5. ICO fee and DPIA/LIA decision;
6. operational control findings mapped to the synthetic acceptance gate;
7. launch blockers, conditions, accepted residual risks, review triggers, and approval signature/date.

## Handoff Gate

The Owner must approve the adviser, budget, engagement terms, and exact disclosure package. Advice must be reviewed against the final product and provider configuration immediately before legal publication and real-customer launch. A quotation or draft opinion does not authorize launch.
