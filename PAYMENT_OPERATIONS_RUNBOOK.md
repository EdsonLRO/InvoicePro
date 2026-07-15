# Tallyo Payment Operations Runbook

Internal operating procedure for invoice payments handled through Stripe. This is not a customer-facing refund policy, legal advice, or permission to enable Stripe live mode.

## Current Boundary

- Stripe remains in sandbox/test mode.
- Tallyo uses Stripe-hosted Checkout; Tallyo does not collect or store full card details.
- A payment changes an invoice only after a signed Stripe webhook is verified and matched to a Tallyo-created Checkout Session.
- A refund changes the invoice balance only after a signed Stripe refund webhook confirms the provider outcome.
- Live activation, real customer payment links, customer-facing terms, and public claims remain approval-gated.

## Roles

| Role | Responsibility |
|---|---|
| Seller/account owner | Confirms the invoice, customer request, amount, and business reason; communicates with the customer. |
| Tallyo app | Requests Checkout/refunds, records signed provider events, and updates invoice state. |
| Stripe | Hosts card entry, processes the payment/refund, and supplies signed lifecycle events. |
| Tallyo operator | Investigates technical failures using privacy-safe identifiers and escalates security incidents. |

## Refund Procedure

1. Open the invoice and verify the relevant Stripe-confirmed payment row.
2. Confirm the requested amount does not exceed the refundable amount and record a short business reason without unnecessary personal data.
3. Use Tallyo's Refund action. Do not call Stripe from browser code or manually edit the invoice payment JSON.
4. Treat the request as pending until the signed Stripe webhook records the confirmed refund.
5. Check the invoice balance, payment row, activity history, and append-only audit event.
6. If Stripe reports a failed refund, confirm Tallyo reverses any provisional state and preserves the failure evidence.
7. Tell the customer only what is verified. Do not promise an instant or guaranteed bank-credit date.

## Dispute And Chargeback Procedure

1. Record the date, amount, invoice, Stripe case status, response deadline, and owner without copying full card or unnecessary customer data.
2. Preserve the invoice, delivery evidence, customer communications, terms accepted at the time, payment event, and refund history.
3. Review the signed dispute event and Stripe dashboard; never mark an invoice paid or refunded from an email or screenshot alone.
4. Decide whether to accept or contest the dispute. A contested or material case requires external legal/accounting advice where appropriate.
5. Submit evidence only through the approved Stripe workflow and retain a privacy-safe decision record.
6. Reconcile the final `won`, `lost`, funds-withdrawn, or funds-reinstated event with Tallyo.

Card-not-present transactions carry chargeback risk. GOV.UK describes chargeback liability and common reasons at <https://www.gov.uk/invoicing-and-taking-payment-from-customers/payment-obligations>.

## Failure And Incident Handling

| Signal | Immediate action |
|---|---|
| Checkout creation fails | Do not create a manual paid entry. Retry only after checking configuration and invoice ownership. |
| Webhook signature fails | Reject it, preserve minimal technical evidence, and investigate destination/secret configuration. |
| Duplicate event | Confirm idempotency preserved one audit event and one invoice mutation. |
| Amount/currency/session mismatch | Fail closed and investigate; do not override the check in the browser. |
| Refund remains pending or fails | Reconcile with Stripe and keep the customer informed without promising an outcome. |
| Dispute/chargeback appears | Follow the dispute procedure and preserve evidence. |
| Suspected key compromise | Stop payment operations, contain access, preserve logs, and rotate secrets only with Owner approval. |

## Support Record

For each material case record: internal case reference, invoice reference, provider event type, amount/currency, status, timestamps, decision owner, customer communication status, and outcome. Do not record full card data, secret keys, webhook payloads, passwords, TOTP codes, or identity documents.

## Release Gate

Technical sandbox handling is verified, but real-customer use remains blocked until:

- the timed restore exercise is complete;
- the Auth/session/SMTP/abuse-control decisions are resolved;
- the privacy and rights processes in `LEGAL_PRIVACY_READINESS.md` are operational;
- customer-facing Terms, Privacy Notice, refund/support wording, and any required external professional review are complete;
- live Stripe configuration and signed live webhook testing receive explicit Owner approval.

**Legal Agent disposition, 2026-07-14:** `Blocked` for live/customer use. Internal technical runbook may be used for sandbox operations. Customer-facing refund, cancellation, liability, and dispute wording requires a later legally material review and may require external advice.
