-- Permit a claimed Stripe Connect Checkout reservation to expire before a
-- provider Session exists. The original constraint required every non-claimed
-- state except `failed` to carry Session fields, so the five-minute stale-claim
-- cleanup rolled back and left the invoice blocked indefinitely.

alter table public.stripe_connect_checkout_claims
    drop constraint if exists stripe_connect_checkout_claim_completion_check;

alter table public.stripe_connect_checkout_claims
    add constraint stripe_connect_checkout_claim_completion_check check (
        (
            claim_status = 'claimed'
            and stripe_checkout_session_id is null
            and session_expires_at is null
        )
        or (
            claim_status in ('created', 'completed')
            and stripe_checkout_session_id is not null
            and session_expires_at is not null
        )
        or (
            claim_status in ('expired', 'failed')
            and (
                (
                    stripe_checkout_session_id is null
                    and session_expires_at is null
                )
                or (
                    stripe_checkout_session_id is not null
                    and session_expires_at is not null
                )
            )
        )
    );
