# Post-launch market-evidence plan

Status: Provider-neutral design only. Analytics and non-essential tracking remain disabled.

## Questions

- Do visitors use the Free Invoice Maker and then consider Tallyo Pro?
- Where do new accounts stop before creating their first useful invoice?
- Which automation features are adopted and retained?
- Do customers prefer monthly or annual billing?
- Where do payment failure, cancellation and restricted access need improvement?

## Product signals

- account created;
- email confirmed;
- business profile completed;
- first customer created;
- first invoice created;
- first invoice downloaded or sent;
- return within seven days;
- recurring invoice enabled;
- reminder enabled;
- subscription started;
- monthly or annual selection;
- payment failure;
- cancellation;
- account restricted;
- reactivation.

## Data minimisation

Events must not contain customer names, invoice descriptions or amounts, recipient emails, document content, Stripe/Supabase identifiers, Auth tokens, MFA information, credentials or free-text fields.

Use stable allowlisted event names and low-cardinality properties only. The existing provider-neutral analytics adapter remains disabled until a provider, consent model, notice, retention period and production activation receive separate review and Owner approval.

## Review cadence

Review aggregate conversion and retention signals after enough traffic exists to avoid decisions from isolated sessions. Use evidence to revisit plan structure, onboarding and activation friction; do not introduce more paid tiers or invasive tracking without a recorded decision.
