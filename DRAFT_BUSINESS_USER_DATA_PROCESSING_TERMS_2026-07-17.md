# Tallyo Business-User Data Processing Terms

**Owner-approved source dated 28 July 2026 — focused provider verification complete and customer-facing publication approved**

These terms supplement the Tallyo Terms between Edson Oliveira, trading as Tallyo (`Tallyo`), and the business user identified in the applicable account or order (`Customer`).

Tallyo's public business/service address is `87 Coles Green Road, NW2 7JH, London, UK`. Privacy requests may be sent to `privacy@tallyo.co.uk`.

They apply only where the Customer is controller and Tallyo processes personal data on the Customer's behalf (`Covered Data`). Tallyo remains controller for its own account administration, subscriptions, security, support, legal compliance and other purposes described in the Tallyo Privacy Notice.

## 1. Processing schedule

| Item | Description |
|---|---|
| Subject matter | Hosting and operating the Customer's business profile, contacts, saved items, invoices, quotes, credit notes, recurring schedules, transactional document/reminder email, customer-payment status and account export |
| Duration | While the Customer uses the relevant Tallyo service and during the manual return/deletion process, subject to provider cycles and any lawful retention |
| Nature | Collection from the Customer; storage, organisation, retrieval, display, transmission, email delivery, payment-status reconciliation, export, correction, restriction, deletion and anonymisation |
| Purpose | Provide the Tallyo functions selected and instructed by the Customer |
| Data subjects | Customer personnel and representatives; the Customer's customers, invoice recipients, suppliers and other business contacts whose information the Customer lawfully enters |
| Data types | Identity, business and contact details; document descriptions, dates, references and amounts; email/PDF content and delivery events; payment/refund/dispute summaries and provider identifiers; Customer-selected free text |
| Excluded uses | Tallyo is not intended for special-category, criminal-offence, medical, safeguarding, legal-case or similarly regulated records, or services aimed at children |

## 2. Documented instructions

Tallyo will process Covered Data only:

- to provide the services selected by the Customer under the Tallyo Terms, these terms and the Customer's in-product actions;
- on another documented instruction accepted by Tallyo; or
- where UK law requires processing, in which case Tallyo will inform the Customer before processing unless the law prohibits that notice.

Tallyo will inform the Customer if, in Tallyo's reasonable view, an instruction infringes applicable data-protection law. Tallyo may suspend the affected instruction while the issue is resolved.

## 3. Customer responsibilities

The Customer:

- decides the purposes and lawful basis for Covered Data;
- gives affected people required privacy information;
- enters only information needed for legitimate business invoicing;
- keeps information accurate and responds to correction requests;
- avoids prohibited sensitive or regulated workflows;
- controls account access and protects credentials;
- gives lawful document, reminder, payment, retention and disclosure instructions;
- maintains its own statutory and accounting records; and
- tells Tallyo promptly about an unlawful, mistaken or disputed instruction.

## 4. Confidentiality

Tallyo limits Covered Data access to authorised people who need it to operate or support the service and who are bound by appropriate confidentiality duties. Access must be removed when no longer required.

## 5. Security

Taking account of the processing, available technology, cost and risk, Tallyo maintains proportionate technical and organisational measures including:

- Supabase account authentication and email confirmation;
- optional authenticator-app MFA, one-time recovery codes and session controls;
- row-level tenant isolation and server-side authorisation;
- protected provider secrets and no service-role credential in browser code;
- signed Stripe and Resend webhook verification;
- Cloudflare delivery, Access and Turnstile protections where configured;
- provider encryption in transit and at rest;
- managed backups and tested restore procedures;
- minimised security, delivery and payment-integrity evidence; and
- incident, rights-request and manual deletion procedures.

No measure is described as eliminating every risk. Tallyo reviews the measures after material product, provider or threat changes.

## 6. Subprocessors

The Customer gives general written authorisation for Tallyo to use the subprocessors needed for the selected service.

| Subprocessor | Relevant processing |
|---|---|
| Supabase | Authentication, database, tenant-isolated storage, Edge Functions, scheduled service operations, logs and managed backups |
| Resend and its email-delivery chain | Transactional document, reminder and security email, attachments and delivery events |
| Cloudflare | App/website delivery, Access, Turnstile, request security and related infrastructure metadata |
| Stripe | Customer-payment processing and reconciliation only to the extent Stripe processes on the Customer's instructions; Stripe also acts independently for regulated, fraud, identity, legal and financial purposes |
| Google Workspace | Restricted support/privacy case handling where Covered Data is included in a case; the Owner has designated Workspace as the official support/privacy record system |

OpenAI is not authorised to receive Covered Data under these terms. The public Helper is not designed to access account or customer records.

GitHub is used for source administration and rollback hosting; Tallyo does not intentionally place Covered Data in the repository.

Tallyo will:

- maintain a current subprocessor list;
- impose data-protection obligations appropriate to the delegated processing;
- remain responsible for subprocessor performance to the extent required by law;
- give reasonable advance notice of a new or replacement subprocessor where the change affects Covered Data; and
- consider a reasoned data-protection objection and, where no reasonable alternative is available, allow the affected service to end under the main Terms.

## 7. International transfers

Where Tallyo or a subprocessor makes a restricted transfer of Covered Data from the UK, the transfer must use:

- applicable UK adequacy regulations; or
- an appropriate safeguard such as the UK International Data Transfer Agreement or the UK Addendum to the European Commission Standard Contractual Clauses.

Provider subprocessor locations and safeguards are recorded in Tallyo's provider evidence register and may change. Tallyo will provide reasonable information about an applicable safeguard on request, subject to confidentiality and security restrictions.

## 8. Data-subject rights

Taking account of the nature of processing, Tallyo will provide reasonable assistance to help the Customer respond to requests for access, correction, deletion, restriction, objection or portability.

Tallyo will:

- route a request to the Customer where the Customer is the relevant controller;
- preserve only the information needed to assist;
- use the available tenant-scoped search, export, correction and deletion paths;
- record provider and backup limitations; and
- deliver information through an approved secure route.

The Customer remains responsible for verifying the requester, deciding the legal response and communicating it, unless Tallyo is separately controller for the relevant processing.

## 9. Security incidents and personal-data breaches

Tallyo will notify the Customer without undue delay after becoming aware of a personal-data breach affecting Covered Data.

As information becomes available, Tallyo will provide reasonable details about:

- the nature of the breach;
- affected data and people;
- likely consequences;
- containment and remediation; and
- a contact for coordination.

Tallyo will preserve appropriate evidence and assist the Customer with its assessment and required notifications. Tallyo will not notify the Customer's data subjects or regulator on the Customer's behalf unless instructed or legally required.

## 10. DPIAs and regulator assistance

Taking account of the processing and information available, Tallyo will provide reasonable assistance with the Customer's DPIA, prior-consultation or regulator obligations relating to Tallyo processing. This does not transfer the Customer's controller responsibilities to Tallyo.

## 11. Return, export and deletion

The Customer can use Tallyo's available account export while the account is active.

Account-closure and deletion requests must be submitted to `privacy@tallyo.co.uk`. Tallyo verifies and processes each request manually. Tallyo will delete, return or anonymise Covered Data when it is no longer necessary for the agreed service, unless applicable law requires retention.

Tallyo may retain limited information where necessary for tax, accounting, fraud prevention, payment disputes, regulatory duties, security incidents or legal claims. Tallyo records the reason and review date.

Provider copies and backups expire under their documented cycles and legal obligations. Tallyo does not promise an exact closed-account deletion deadline or immediate deletion from every provider backup.

## 12. Information and audit

Tallyo will make available information reasonably necessary to demonstrate the processor obligations in these terms.

Where that information is not sufficient, the Customer may request a proportionate audit. The parties will first use current documentation, test evidence, provider reports and remote review. Any further inspection must:

- be relevant to Covered Data and applicable law;
- use reasonable notice unless a regulator or urgent incident requires otherwise;
- protect other customers, security, confidentiality and service availability;
- avoid access to secrets or unrelated data; and
- respect non-excludable regulator powers.

Each party bears its own routine review costs. Exceptional external audit costs may be agreed in advance unless the audit identifies a material breach by Tallyo.

## 13. Precedence, duration and changes

These terms take effect only when approved, published and incorporated into the applicable Tallyo agreement. They continue while Tallyo processes Covered Data for the Customer.

If these terms conflict with the main Tallyo Terms on processor obligations, these terms take precedence for that conflict. Tallyo may update them where the service, providers or law changes and will give appropriate notice of a material change.

The Owner approved these terms on 28 July 2026, elected to proceed without professional legal review at this stage and separately authorised their clean customer-facing publication as part of the Tallyo account agreement. Focused launch-scope account verification is complete for Supabase (including the privately retained executed DPA), Resend, Stripe, Cloudflare, GitHub, OpenAI and Google Workspace. Workspace is Business Starter with administrator access, Gmail auto-deletion disabled, no Vault access and no Data Regions entitlement; its active subscription uses Google's incorporated public CDPA and subprocessor route. This internal source retains implementation evidence that is omitted from the public page.
