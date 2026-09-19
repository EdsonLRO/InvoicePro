# Tallyo quote acceptance — focused product and security rules

Status: specification and isolated-preview candidate only. Nothing in this document is implemented in the production app, database or Supabase project.

Reviewed: 19 September 2026 against production source at merge `6fcf675`, the approved quote mockups, current Supabase Edge Function/RLS guidance and current ICO privacy guidance.

## 1. Intended outcome

A Tallyo business user can create a secure customer link for one saved quote. The recipient can view that quote and either accept it with a confirmed name or decline it. Acceptance preserves the quote, records the server time, and creates exactly one separate linked draft invoice. It never sends the invoice, takes payment or subscribes the recipient.

This is a small invoicing workflow, not an electronic-signature platform, customer portal, CRM, approval chain or contract-management system.

## 2. Current behaviour that must change later

The current `convertToInvoice` browser method changes a quote row in place, gives it an invoice number, resets it to Draft and adds a browser-generated history timestamp. The database has no public-link, recipient-response or source-quote fields. That behaviour cannot satisfy the approved rule to preserve the accepted quote and create exactly one linked invoice.

The runtime phase must replace the manual conversion action for an accepted quote. It must not silently reinterpret existing converted documents or fabricate historical acceptances.

## 3. Product rules

1. Only a saved quote in Sent state can receive an acceptance link.
2. The link covers one exact saved version of one quote owned by one Tallyo account.
3. The URL carries a 256-bit random token in the fragment so the raw token is not sent in the page request or Referer. The public page posts it to the quote function only.
4. Tallyo stores only a one-way SHA-256 token hash. Regenerating a link invalidates the previous token.
5. The default expiry is the earlier of the quote's valid-until date and 30 days after link creation. If there is no future valid-until date, use 30 days.
6. Editing the quote invalidates its outstanding link. The owner must review the changed quote and generate a new link.
7. Accept requires a trimmed customer-confirmed name of 2–100 characters. The interface says “Your name”; it does not claim identity verification or a qualified electronic signature.
8. Decline requires a confirmation but no reason and no mandatory name. Tallyo does not collect unnecessary free-text feedback.
9. The response timestamp comes from the database transaction, never the customer device.
10. The first valid response is final. An accepted or declined quote cannot be accepted again through another link.
11. Acceptance keeps the quote unchanged, derives its displayed state as Accepted, and creates one separate Draft invoice with the same currency, customer snapshot, items, discounts, tax mode, shipping, notes, terms and total.
12. The generated invoice has a server-allocated invoice number, the acceptance date as its issue date, no payment records, online payment disabled for sending, reminders off and no due date. The owner reviews the due date and payment option before sending.
13. Acceptance records the source quote on the invoice and the generated invoice on the acceptance result. A uniqueness constraint permits at most one generated invoice per quote.
14. A repeat or concurrent Accept request returns the already-created invoice and creates nothing else.
15. Decline creates no invoice. The owner may duplicate the declined quote into a new quote through the normal authenticated workflow.
16. After acceptance, the same scoped token may display the linked invoice read-only until the link expires or the owner revokes it. It cannot edit, send or pay the invoice.
17. Download quote produces the accepted/pending quote PDF from the already-returned server snapshot. It makes no additional record mutation.
18. No acceptance action automatically sends email, creates Stripe Checkout, takes payment, records marketing consent or emits personal data to Analytics.

## 4. Customer-visible states

| State | Customer page | Available action |
|---|---|---|
| Active | Quote, business identity, scope, total, valid-until date and short confirmation wording | Accept with name; Decline; Download quote |
| Accepted | Accepted name and server timestamp; linked draft invoice number; “No payment has been taken” | View invoice; Download quote |
| Declined | Calm confirmation that the quote was declined | Download quote only |
| Expired | “This quote link has expired. Ask the business for a new link.” | None |
| Revoked | “This quote link is no longer available. Ask the business for a new link.” | None |
| Changed | “This quote was updated after this link was created. Ask the business for a new link.” | None |
| Not found | Generic unavailable message; never reveal whether a quote or account exists | None |

Owner-side actions remain deliberately small: create/copy link, revoke link, download quote, send copy through the existing reviewed email flow, and view the generated invoice. An accepted/declined quote is preserved and read-only; there is no Undo acceptance control.

## 5. Minimum runtime shape — not implemented in this slice

The smallest complete implementation is:

- one tracked additive migration extending the existing `invoices` row with protected quote-link/response fields and a nullable `source_quote_id` on generated invoices;
- one private, service-role-only transaction function that validates the response and creates the linked invoice atomically;
- one JWT-protected `manage-quote-access` Edge Function for the signed-in owner to create, copy-status and revoke links;
- one public `quote-public` Edge Function with platform JWT verification disabled, whose only authority is a valid scoped token;
- one static customer page at `/quote/` and a small authenticated quote-detail integration;
- focused database, function, browser and abuse-path tests.

No new vendor, secret, background job, payment integration, email workflow, analytics event or customer account is required.

### Protected invoice fields

The migration should add only the fields needed for this workflow:

- quote token hash, created/expiry/revocation timestamps and saved quote-version marker;
- first-view timestamp;
- response outcome, confirmed name and server response timestamp;
- generated invoice `source_quote_id`.

Raw tokens are never stored. `anon` receives no table grant or policy. Authenticated users retain their existing owner-scoped document access, but a trigger must reject browser changes to service-owned link/response/source fields and reject modification or deletion of a responded quote. The service role remains server-only. A partial unique index on `source_quote_id` enforces one generated invoice per quote.

### Public function contract

`quote-public` accepts bounded JSON and only these actions:

- `view`: validate token and return a minimal quote/company snapshot; record the first viewed time once;
- `accept`: validate the name and call the atomic database operation;
- `decline`: call the same atomic response operation without collecting a reason;
- `invoice`: after acceptance, return the linked invoice snapshot scoped by the same token.

It permits POST and OPTIONS only, enforces an exact production-page origin in browsers, rejects oversized/non-JSON requests, escapes all returned text at rendering, and returns the same generic unavailable response for invalid tokens. CORS is defense in depth; possession of the high-entropy token is the actual customer authorization.

### Atomic acceptance transaction

The private database operation must:

1. hash/resolve the token and lock the matching quote row;
2. verify quote owner, type, Sent lifecycle state, saved-version marker, expiry and revocation;
3. return the existing result without mutation if already accepted;
4. reject a conflicting prior decline;
5. allocate a unique invoice number under a per-owner transaction lock;
6. insert the linked Draft invoice from the stored quote snapshot;
7. write the response fields using database time;
8. append factual owner-visible history and trusted `audit_events` for `quote_accepted` and `invoice_created_from_quote` without putting the customer name or token in audit metadata;
9. commit all changes together or none of them.

The transaction must be tested with duplicate sequential calls and two concurrent calls. A unique constraint is the final duplicate guard, not the only idempotency mechanism.

## 6. Activity wording

Supported factual events:

- Quote created
- Quote emailed (only when the existing email provider evidence exists)
- Quote viewed
- Quote accepted by the confirmed name
- Invoice `INV-…` automatically created
- Quote declined
- Quote link revoked

The owner-facing activity can display the confirmed name from the response row. Append-only audit metadata must not duplicate that name. Existing document `history` remains convenience activity rather than tamper-proof evidence.

## 7. Privacy and legal review

Initial territory: UK businesses. Data subjects may include sole traders and customer employees/contacts. The quote content, confirmed name, access token relationship and timestamps may be personal data.

For the business user's customer workflow, the business user determines the quote and recipient purpose; Tallyo operates the service as processor under the existing Business-User Data Processing Terms. Tallyo remains controller for its narrowly necessary security and service-operation records. The runtime review must confirm the published Privacy Notice and DPA already describe this processing accurately; this specification does not publish new legal wording.

Conditions:

- collect only the confirmed name needed to evidence the recipient's action; no IP address, device fingerprint, signature drawing or decline reason;
- show the business identity, quote, purpose and short confirmation wording before acceptance;
- use the existing account/document retention framework rather than inventing a permanent independent acceptance archive;
- include quote/response/link data in account export and verified deletion/retention handling when implemented;
- do not claim that the name is verified, that the workflow is a qualified electronic signature, or that acceptance alone forms a binding contract in every factual scenario;
- perform a fresh legal review before changing launch territory or making stronger contract-enforceability claims.

Legal disposition: **Approved with conditions** for this specification and fictional preview. Runtime implementation and release remain conditional on the controls above and a final privacy/legal consistency check.

Current sources checked 19 September 2026:

- ICO, [Data minimisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/)
- ICO, [Purpose limitation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/purpose-limitation)
- ICO, [Data protection by design and by default](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/)
- ICO, [Controller or processor](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/controllers-and-processors/controllers-and-processors/how-do-you-determine-whether-you-are-a-controller-or-processor/)
- Supabase, [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Supabase, [Authorization headers](https://supabase.com/docs/guides/functions/auth-headers)

## 8. Threat and failure checklist

- guessed or malformed token → generic unavailable response;
- token in logs/Referer → prevented by URL fragment and `Referrer-Policy: no-referrer`;
- link forwarded to another person → possession grants access; owner can revoke/regenerate, and the page makes no identity-verification claim;
- quote edited after sharing → old link becomes Changed and cannot respond;
- expired/revoked link → view and response fail closed;
- response replay/concurrent clicks → same response and same linked invoice;
- accept after decline or decline after accept → conflict, no mutation;
- cross-tenant quote/invoice substitution → token resolves the server-owned quote and owner; client supplies no owner or invoice ID;
- HTML/script in customer or item text → text output is escaped; CSP blocks external scripts and connections except the exact function origin in production;
- database/function partial failure → one transaction rolls back response, invoice and events;
- number collision → per-owner lock plus unique constraint and bounded retry;
- analytics leakage → customer page contains no GA4 or other analytics;
- payment/email side effect → none in acceptance transaction.

## 9. Test plan for the runtime phase

Database tests: grants/RLS, protected-column trigger, cross-owner denial, active/expired/revoked/changed links, accepted/declined state, quote freeze, snapshot equality, number allocation, unique source quote, rollback on failure, sequential replay and concurrent acceptance.

Function tests: exact-origin browser requests, non-browser token handling, method/content-type/body limits, invalid token uniformity, name validation, escaped output, no raw token logging, owner JWT/ownership checks, entitlement/write checks for link management, revocation and no service-role leakage.

Browser tests: 360/390px and desktop layout, keyboard submission, focus/error announcement, pending/accepted/declined/unavailable states, PDF action, linked invoice view, no admin navigation on the customer page, no horizontal overflow and no Analytics personal data.

Regression tests: current authenticated quote editing/email/PDF, invoice calculations, customer snapshots, status rules, invoice numbering, activity, account export, delete guards, PWA update and all existing Auth/RLS/payment boundaries.

## 10. Controlled delivery steps

1. **This slice:** specification plus isolated fictional-data preview. Stop for Owner review.
2. **Runtime design:** exact migration/RPC/function contracts and failing tests, still unapplied and undeployed. Stop for security/privacy review.
3. **Repository implementation:** migration and functions locally tested; production app wiring behind a disabled gate. Stop before push/merge if the final sensitive review has unresolved findings.
4. **Review preview:** protected, fictional acceptance flow with providers blocked. Owner reviews customer and owner views.
5. **Release preparation:** focused PR, migration order, exact function list, gate/configuration, rollback and bounded acceptance plan.
6. **Production:** requires exact Owner approval for migration, functions, configuration, merge and public activation. No real customer communication or payment test is implied.
