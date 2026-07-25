alter table public.billing_checkout_claims
    drop constraint billing_checkout_claims_stripe_checkout_session_id_check;

alter table public.billing_checkout_claims
    add constraint billing_checkout_claims_stripe_checkout_session_id_check
    check (
        stripe_checkout_session_id is null
        or stripe_checkout_session_id ~ '^cs_(test|live)_[A-Za-z0-9]+$'
    );
