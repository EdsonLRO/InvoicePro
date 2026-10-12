# Stripe-hosted branding review packet

## Release identity

- Project: Tallyo
- Environment: local design reference plus read-only Stripe Sandbox inspection
- Provider mode: Stripe-hosted Checkout and Customer Portal; no provider value saved
- Branch: `codex/stripe-hosted-branding`
- Commit and pull request: pending review

## Approved scope

- User-visible behaviour: prepare review images for a Tallyo-branded subscription Checkout and Customer Portal, plus a connected-business invoice-payment Checkout that keeps the business receiving the payment primary.
- Financial behaviour: none. These files do not create Checkout Sessions, subscriptions, payments, refunds, emails or entitlements.
- Code and database changes: none.
- Provider and environment changes: none. Stripe showed the correct Tallyo account and Sandbox banner, but hid the branding editor because the values affect the live integration. Nothing was entered or saved.
- Explicit exclusions: live Stripe branding, prices, trials, payment methods, subscription rules, Portal features, connected-account settings, webhooks, secrets and customer communication.

## Design decision

Tallyo subscription pages use the official Tallyo mark, a light content surface, `#4f46e5` primary actions, Tallyo navy `#0b1224`, system/Inter-style typography and restrained rounded controls. Stripe's attribution stays visible.

Invoice payments are different. Tallyo uses direct charges for connected businesses, so the business receiving the payment is the merchant and must remain the primary name and identity. The invoice-payment reference uses the same calm layout language without presenting Tallyo as the seller.

Candidate provider values, subject to a separate live-setting approval:

- official logo: `website/public/assets/tallyo-mark.png`;
- primary action colour: `#4f46e5`;
- background: light slate/white, consistent with the authenticated app;
- text: Tallyo navy/slate;
- type: Inter where Stripe supports it, otherwise Stripe's closest system sans-serif;
- shape: rounded, not pill-shaped;
- hosted footer: retain `Powered by Stripe`.

[Stripe's Checkout appearance guidance](https://docs.stripe.com/payments/checkout/customization/appearance) and [Customer Portal configuration guidance](https://docs.stripe.com/customer-management/configure-portal) describe account-level logo/icon, background, button, font and shape controls. Stripe's own Dashboard warning establishes that the available Tallyo branding settings affect the live integration, so they are not saved during this design phase.

## Evidence and validation

- `subscription-checkout.png`: Tallyo Pro seven-day trial Checkout reference.
- `customer-portal.png`: subscription-management reference.
- `invoice-payment.png`: fictional connected-business invoice-payment reference.
- All amounts, names, dates and card digits are fictional.
- The renderer uses the repository's official Tallyo mark, blocks every HTTP request, loads no Tallyo application script and creates no provider event.
- Desktop reference size: 1440 × 960. All three references are also checked at 390px with no horizontal overflow.

## Recovery and next safe step

No rollback is required because no provider or production state changed. After Owner review, the next gated step is to inspect the current live values read only, record them for rollback, enter only the approved Tallyo values, stop before **Save changes**, and request exact approval for that live provider action.
