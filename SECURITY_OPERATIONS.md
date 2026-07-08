# SECURITY_OPERATIONS.md - Tallyo

Operational security checklist for moving Tallyo from a working prototype into a safer product. This is not a compliance claim; it is the working list of controls to put in place before real customer email and payments.

## Current Priority

Before adding Resend or Stripe, keep the current app stable and make sure there is a recovery path if data is lost or a privileged automation misbehaves.

## Backup And Restore

Minimum before real users:

- Confirm the Supabase plan includes scheduled database backups.
- Document backup frequency and retention.
- Run a restore test into a separate non-production Supabase project.
- Keep production, test, and local data clearly separated.
- Export a small user-owned dataset and confirm invoices, customers, saved items, company settings, payments, and recurring templates can be recovered.

Manual restore test checklist:

1. Create a test account with company settings, a customer, a saved item, an invoice, a payment, and a recurring schedule.
2. Take or identify the backup snapshot.
3. Restore into a separate project, never over production during a test.
4. Confirm row counts and sample records match.
5. Confirm RLS still blocks cross-user reads.
6. Confirm Edge Function secrets are not copied into source or logs.

## Data Protection Groundwork

Needed before inviting real users:

- Privacy policy.
- Terms of service.
- Data retention position.
- User data export process.
- User deletion/erasure process.
- Breach response checklist.
- Subprocessor list: Supabase, GitHub Pages, Resend, Stripe, and any future analytics provider.
- Clear wording that Tallyo is built with data protection principles in mind, not a GDPR-compliance claim.

## Audit Events

The existing per-invoice and per-schedule `history` fields are useful activity history, but they are not tamper-proof. For email and payments, add trusted server-side events in `public.audit_events`.

Design rule:

- The browser may read its own audit events.
- The browser should not insert, update, or delete audit events.
- Edge Functions and verified provider webhooks should insert audit events with the service role key.
- Events should be append-only.
- Provider webhooks should use unique provider event IDs to prevent duplicate processing.

Draft SQL lives in `supabase/audit_events.sql`.

## Email Phase Gates

Do not automate emails until manual sending is reliable.

Manual email gate:

- Resend domain is verified for `tallyo.co.uk`.
- SPF, DKIM, and DMARC DNS records are in place.
- Resend API key is stored only as a Supabase secret.
- A server-side Edge Function sends emails.
- The function checks invoice ownership before sending.
- Failed sends are visible and do not create false "sent" events.

Automation gate:

- Delivery/failure webhooks are verified and idempotent.
- Reminder rules are defined.
- Paid and cancelled invoices are excluded.
- Rate limits or abuse controls exist.

## Payments Phase Gates

Do not build Stripe until the account model is decided.

Decision needed:

- Single Stripe account for one business, or Stripe Connect for many businesses.
- Whether Tallyo takes platform fees.
- Supported currencies.
- Partial payment policy.
- Refund and dispute handling.

Payment security requirements:

- Stripe secret key stays server-side only.
- Checkout sessions are created in an Edge Function.
- Webhook signatures are verified.
- Webhooks are idempotent.
- Every payment event is tied to both `invoice_id` and `user_id`.
- Already-paid invoices cannot be accidentally paid twice without clear handling.

## Secret Handling

- Never commit real `.env` files.
- Never put service role, Resend, or Stripe secret keys in `index.html`, `config.js`, or docs.
- Keep `.env.example` as placeholders only.
- Store production secrets in Supabase secrets or provider dashboards.
- Rotate any secret that is accidentally printed, committed, or pasted into a shared place.

## Release Checks

Before deploying a security-sensitive change:

1. Confirm no secrets were added to source.
2. Confirm CSP and SRI are unchanged unless deliberately reviewed.
3. Confirm RLS policies are not weakened.
4. Confirm privileged functions stamp the correct `user_id`.
5. Confirm service-worker cache changes are intentional.
6. Test success, failure, wrong-user access, duplicate events, and missing-data paths.
