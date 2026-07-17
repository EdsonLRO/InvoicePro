# Tallyo Lawful-Basis And Retention Options - 2026-07-17

Internal decision proposal for `LEGAL-OPS-001`. Sources were checked on 2026-07-17. On 2026-07-17, the Owner approved this as the working D05/D06 position for qualified UK legal/privacy and accounting review. It is not legal advice, a final retention policy, customer-facing wording, or authorization to delete or retain production data.

The recommended baseline is deliberately privacy-lean: keep identifiable data only for a defined purpose, use short operational periods, and extend a record only for a documented tax, dispute, incident, legal-hold, or provider obligation. Qualified UK legal/privacy review remains required before these positions become final.

## Important Separation

Tallyo's own sole-trader tax and business records are not the same as the invoices and customer records entered by a Tallyo user.

- The sole trader operating Tallyo must retain Tallyo's own applicable tax/business records for the legally required period.
- A business user remains responsible for retaining their own invoices and accounting records. Tallyo should provide export and clear closure warnings, but should not retain every closed user's workspace merely because that user may have tax duties.
- Where Tallyo acts as processor for a business user's customer/invoice data, Tallyo follows the approved contract and lawful instructions, subject to any specific law that applies directly to Tallyo.

GOV.UK currently says a self-employed person must keep applicable records for at least five years after the 31 January submission deadline for the relevant tax year. The exact records and exceptional periods require accounting/legal confirmation: <https://www.gov.uk/self-employed-records/how-long-to-keep-your-records>.

## Proposed Lawful-Basis Map

`Proposed` below means suitable for qualified review, not legally approved.

| Processing purpose | Tallyo's working role | Proposed basis / instruction | Why this is the narrow proposal | Conditions before approval |
|---|---|---|---|---|
| Create and administer a Tallyo account | Controller | Contract where the account holder is the contracting individual and the information is necessary to provide the account; legitimate interests may instead be needed for a representative of a company or other separate business entity | Email, account identity and essential settings are integral to providing the service, but a contract with a company is not automatically a contract with its human representative | Confirm contracting identity, representative handling, eligible-user wording, necessity, LIA where applicable, and privacy notice |
| Authenticate users and enforce sessions, MFA, recovery locks and security notices | Controller | Contract for the authentication needed to provide the account; legitimate interests for proportionate abuse detection, security investigation and evidentiary logging | Separates essential account access from broader defensive monitoring | Complete a legitimate-interests assessment (LIA), minimise logs, honour applicable objection rights, and confirm recovery retention |
| Store business profile, customers, invoices, quotes, credit notes and saved items | Business user likely controller; Tallyo potentially processor | Business user's documented instructions under customer data-processing terms; contract between Tallyo and the account holder for providing the workspace | The business user chooses the people, content, purposes and sending actions | Qualified role review; customer DPA/processor terms; recipient transparency and rights routing |
| Send documents and opt-in overdue reminders | Business user likely controller; Tallyo/Resend processor chain | Business user's documented instruction; Tallyo's contract basis applies to providing the sending function to the account holder | Tallyo should not claim that invoice recipients consented merely because the business user entered an address | Confirm that messages remain transactional, not marketing; give users notice/instruction duties; define suppression and delivery retention |
| Send account-security and service-operation messages | Controller | Contract where necessary to operate/protect the account; legitimate interests for additional proportionate security warnings | These messages support account integrity and are not marketing | Minimise contents; maintain notification controls; review any optional/non-essential message separately |
| Create Stripe Checkout, record payment/refund/dispute status and reconcile invoices | Mixed: Tallyo controller for its service/payment operations; possible processor activity for the business user; Stripe has processor and controller roles | Contract for user-requested payment functionality; legitimate interests for fraud/dispute defence; legal obligation only where a specific UK duty applies | Avoids treating every payment record as a generic legal obligation | Payments and qualified legal review; identify contracting Stripe entity; document each legal obligation; live mode remains separately blocked |
| Provide routine support and handle service complaints | Controller | Contract where support is necessary for a contract with that individual; legitimate interests for company representatives, service quality, abuse prevention and proportionate claim defence | Support is needed to operate the service, but the contracting person/entity must be identified and indefinite ticket retention is not justified | Controlled intake, minimisation, retention, access and escalation; current business/support route must pass synthetic intake |
| Handle privacy rights and controller complaints | Controller for Tallyo-controlled data; processor assistance for business-user-controlled data | Legal obligation where data-protection law requires Tallyo to act; documented processor instruction where Tallyo assists the business user | Legal obligation must be tied to an actual law, not used as a catch-all | Restricted case system, authority, identity checks, rights routing, secure delivery and qualified review |
| Detect, investigate and document security incidents and personal-data breaches | Controller for Tallyo's assessment/records; processor assistance where applicable | Legitimate interests for proportionate security investigation; legal obligation for records, assessment or notification specifically required by law | Distinguishes defensive investigation from mandatory regulatory actions | LIA, restricted incident case, notification authority, raw-evidence minimisation and legal-hold controls |
| Maintain routine audit evidence | Controller for Tallyo operational/security evidence; possible processor evidence for user actions | Legitimate interests, subject to necessity and balancing; contract only where the event is integral to the service | Audit value does not justify indefinite retention of every event | Event-category schedule, LIA, access controls, deletion capability and exception approval |
| Maintain managed backups and recover service | Mirrors the underlying role | Same underlying contract/instruction purposes plus legitimate interests in resilience and security | A backup does not create an independent purpose to keep expired data forever | Seven-day expiry, restore reconciliation, deletion-reappearance test, no unapproved production restore |
| Serve the public static application | Tallyo likely controller for choosing the host and public service; GitHub role unresolved | Legitimate interests may support necessary hosting/security metadata, subject to provider role and transparency review | Public hosting is needed, but provider analytics/cookies and DPA applicability remain unresolved | Decide whether GitHub Pages is contractually suitable for real customers; document visitor data and transfers |
| Use Cloudflare Turnstile for Auth abuse control | Tallyo likely controller for selecting the control; Cloudflare role split per vendor record | Legitimate interests proposed for proportionate network/account security; PECR analysis is separate | Security may be a legitimate interest, but that does not automatically settle device-access/cookie rules | Complete LIA, PECR/notice/transfer review, final hostname and separate activation approval; remains dormant |
| Optional marketing, advertising analytics or non-essential cookies | Not approved | No basis selected | These purposes are outside the current product scope | Separate product, PECR, consent, vendor and legal review before implementation |

### Lawful-Basis Rules

1. Use contract only where processing is genuinely necessary to provide the service requested by that person; putting a purpose in Terms does not make it necessary.
2. Use legal obligation only when a specific UK law, common-law duty, court order or adequately sourced regulatory obligation requires the processing.
3. Before relying on legitimate interests, record the purpose, necessity, less-intrusive alternatives, reasonable expectations, impact, safeguards, outcome, approver and review date.
4. Do not use consent as a general fallback or make unnecessary consent a condition of the account. Optional marketing/non-essential tracking would require a separate review.
5. If unexpected special-category or criminal-offence data appears, restrict access and escalate; an Article 6 basis alone is insufficient.
6. Record the selected purpose and basis in the ROPA and future Privacy Notice before the processing becomes part of a real-customer service.

Current ICO guidance: [lawful basis](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/), [contract](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/contract/), [legal obligation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/legal-obligation/), and [legitimate interests](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/legitimate-interests/).

## Recommended Provisional Retention Schedule

These are proposed product/operational periods for Owner and qualified review. They are not claims about what current code automatically deletes.

| Category | Recommended provisional period | Start / deletion outcome | Reason and conditions |
|---|---|---|---|
| Unverified or abandoned account application | Shortest supported period, target 30 days | From application; delete or anonymise if not verified | Confirm Supabase Auth behaviour and whether a shorter period is practical before implementation |
| Active account identity and essential settings | Life of active account | Verified closure starts the closure schedule | Needed to provide the account; separate any records retained for another purpose |
| Business profile, customers, saved items, invoices, quotes and credit notes | While account is active, then a proposed 30-day export/closure window | After the window, delete active workspace data; allow seven further days for normal managed-backup expiry | User remains responsible for exporting records they must keep; deletion workflow and contract wording are not implemented/approved yet |
| Tallyo's own sole-trader tax/business records | At least five years after the 31 January submission deadline for the relevant tax year, subject to exceptional rules | Delete/anonymise after the applicable obligation and hold expire | Applies only to records that are genuinely Tallyo's own business/tax evidence; accounting advice must identify the exact records |
| Minimal Tallyo payment/refund/dispute evidence | Proposed six years from transaction or final dispute/claim closure, whichever is later, only for fields needed for tax, accounting or legal claims | Delete unnecessary customer/contact detail earlier; retain a restricted minimal record under the approved purpose | Six years is a cautious claims/tax option, not yet approved; qualified legal/accounting and Payments review required. Stripe keeps separate provider records under its own duties |
| Resend-held email content and metadata | Provider states 30 days across standard plans | Provider expiry; no public share links or routine exports | Verify the exact account behaviour. Tallyo should not create a longer message-body store merely for convenience |
| Tallyo document-delivery history and minimal delivery events | With the underlying active document, then the workspace closure schedule | Delete with document unless a defined dispute/legal hold requires a minimal event record | The invoice/document already contains the business record; keep provider IDs and event metadata minimal |
| Account-security notices and routine Auth/operational audit events | Proposed 12 months from event | Automated expiry unless attached to an active incident, abuse investigation or legal hold | Balances investigation value and minimisation; requires event-category deletion and an LIA |
| MFA recovery-code hashes | Until used, replaced, revoked or account closure | Existing flow deletes the set on successful use, replacement/revocation or recovery completion; verify closure deletion | Raw codes are never stored. Minimal recovery state may remain while the account is active; timestamps follow approved security-event retention where separable |
| Material recovery, global-sign-out or confirmed security-event evidence | Proposed 24 months from event | Expire unless a linked incident/claim hold remains | Longer than routine logs only for a narrowly defined material-security category; requires LIA and category controls |
| Routine support cases | Proposed 24 months after case closure | Delete case content/attachments; retain only anonymised service metrics if needed | Allows repeat-issue and service-defence review without indefinite mailbox retention |
| Privacy rights and formal complaints | Proposed three years after case closure | Delete case evidence after period unless a documented dispute/regulatory/legal hold applies | Operational option for qualified review; keep the identity evidence and response package as small as possible |
| Confirmed personal-data breach or material legal dispute record | Proposed six years after final closure | Preserve a minimised decision/evidence record; delete raw duplicates sooner where safe | Aligns with a cautious simple-contract/claim horizon but must be tailored by qualified advice; not every support/security case belongs here |
| Supabase Pro API/database and Auth audit logs | Provider plan currently exposes seven days | Provider expiry unless an approved incident case preserves a minimised extract | Do not buy Log Drains or extend retention without a separate need, privacy review, cost approval and secure destination |
| Supabase managed backups | Seven days under the current Pro plan | Deleted active data may remain until backup expiry; restored data requires deletion reconciliation | Existing timed restore is verified; deleted-data expiry/reappearance still needs a synthetic test |
| Stripe provider records | Provider-determined according to service, legal, fraud, tax and financial-partner duties | Tallyo records provider limitation and routes rights/deletion requests; no promise of immediate Stripe deletion | Confirm exact service/account contract before live mode; keep Tallyo's copy independently minimised |
| GitHub Pages request/usage metadata | Unresolved provider-defined period | Provider process; no Tallyo workspace database is intentionally hosted | Blocks real-customer hosting acceptance until applicable terms, role, cookies/logs, transfers and retention are resolved |
| Restricted rights/incident case-system audit | Proposed six years for material access/action audit; case content follows its category | Delete/anonymise after the case and applicable hold period | Provider selection must support category-specific retention and deletion without erasing required accountability evidence |

## Retention Implementation Gate

No period is accepted until all of the following are recorded:

1. exact data fields and purpose;
2. Tallyo's role and lawful basis/instruction;
3. start event and approved period;
4. active-system deletion or anonymisation method;
5. Auth, provider, export and subprocessor action where applicable;
6. backup expiry and restore-reconciliation behaviour;
7. legal-hold authority, scope, review and release process;
8. user notice/export warning and secure delivery where needed;
9. synthetic verification with no real customer data; and
10. Owner, qualified reviewer, approval date and annual/material-change review trigger.

The current app has no approved account-closure/deletion automation or category-based audit purge. Adopting this schedule will therefore require separately scoped design, migration/runtime work, rollback, Security/RLS review, and Owner approval before production changes.

## Sources And Provider Facts

- ICO storage limitation: personal data must not be kept longer than necessary; organisations should justify and document standard periods and erase/anonymise data when no longer needed: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/>.
- GOV.UK self-employed record retention: <https://www.gov.uk/self-employed-records/how-long-to-keep-your-records>.
- Limitation Act 1980, section 5, provides a six-year period for an action founded on simple contract; this does not by itself justify retaining every record for six years: <https://www.legislation.gov.uk/ukpga/1980/58/section/5>.
- Supabase current pricing/docs show seven-day Pro API/database log retention, seven-day Pro Auth audit logs, and seven-day backups: <https://supabase.com/pricing>, <https://supabase.com/docs/guides/telemetry/logs>.
- Resend states email data is retained for 30 days across standard plans: <https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data>.
- Stripe states it may retain data after service/account/transaction completion for legal/regulatory, fraud, tax, accounting, financial reporting and payment-method obligations: <https://stripe.com/gb/privacy>.

## Decisions Requested From The Owner

**Owner decision, 2026-07-17:** `Approved as the working baseline for qualified review.` This does not approve production deletion, migration, customer wording, legal publication, real-customer processing, or spending. Specific bases and periods may be changed after professional advice.

Requested decision:

> The proposed lawful-basis map and privacy-lean retention schedule may be sent as the working position for qualified UK legal/privacy and accounting review, while every production, migration, deletion, legal-publication and real-customer action remains separately blocked.
