# Stripe Billing seven-day trial sandbox acceptance evidence

Date: 25 September 2026  
Provider mode: Stripe sandbox only  
Live charge or customer communication: none

## Scope

This run verified Stripe's trial lifecycle independently of the existing live Billing configuration. It used fictional customers without email addresses, a sandbox-only Product and GBP 8 monthly Price, test PaymentMethods and Stripe test clocks. It did not change a live Product, Price, Customer, subscription, payment, webhook secret or customer record.

The sandbox Product is `prod_VKDAChcdJeXxwC` and Price is `price_1UJYkUPQOTo2QZSIWOFCnPh6`. They are labelled for Tallyo trial release acceptance and are not referenced by production configuration.

## Results

- Created subscription `sub_1UJYlbPQOTo2QZSIB5vWrKQm` with a seven-day trial, a saved Stripe test card, GBP 8 monthly Price and cancel-on-missing-payment-method behavior. Stripe reported `trialing`, `livemode=false` and a seven-day `trial_end`.
- Advanced test clock `clock_1UJYkVPQOTo2QZSIua7eUIC9` to exactly three days before trial end. Stripe emitted one `customer.subscription.trial_will_end` event, `evt_1UJYluPQOTo2QZSIHawNiTM3`, with `livemode=false`.
- Advanced the same clock past trial end. The subscription became `active`; the first GBP 8 sandbox invoice reached `paid` with amount due and amount paid both 800 minor units.
- Created subscription `sub_1UJYnWPQOTo2QZSIacWIb3Ja`, requested cancellation at period end during its trial and advanced test clock `clock_1UJYnRPQOTo2QZSI81ZGLlS5` past trial end. The subscription became `canceled`; no invoice with a positive paid amount existed.
- A separate no-payment-method sandbox subscription used cancel-on-missing-payment-method behavior. This was an auxiliary provider check only; public Tallyo Checkout still requires card collection server-side.

## Tallyo-specific controls

- Static and type checks cover server-fixed seven-day duration, monthly-only eligibility, card collection, missing-payment-method cancellation, Price allowlisting, one pending Checkout per account, live/test gates and signed event handling.
- Rollback-only SQL probes cover `trialing` full access, one-trial enforcement, repeat-event handling, payment-failure grace, read-only transition and recovery. The local Docker runtime was unavailable, so the exact production migration is scheduled to be applied dormant after a successful Supabase dry run and the probes will run inside a transaction before public gates are enabled.
- The signed three-day event triggers the Tallyo reminder through Resend. The Stripe event ID is the provider idempotency key, and a successful submission timestamp is stored on the Billing event to suppress later retries.
- The Free Invoice Maker remains outside Auth and Billing.

## Limitations

The sandbox test used direct subscription creation to exercise Stripe's lifecycle rather than completing Tallyo's hosted Checkout UI. The reviewed function and build harnesses cover the Checkout request parameters and fail-closed public controls. No sandbox email was sent because the fictional test customers deliberately had no email address. Production reminder delivery will be verified by configuration/readback and monitored from the signed event path; no real customer trial is created as release evidence.
