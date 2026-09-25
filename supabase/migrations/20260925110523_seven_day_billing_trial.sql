-- Additive, fail-closed support for one seven-day monthly-plan trial.
-- Applying this migration does not enable Checkout or change Stripe settings.

alter table public.billing_customers
    add column trial_used_at timestamptz;

alter table public.billing_checkout_claims
    add column trial_days integer not null default 0
        check (trial_days in (0, 7));

alter table public.billing_subscriptions
    drop constraint billing_subscriptions_provider_status_check,
    add constraint billing_subscriptions_provider_status_check
        check (provider_status in (
            'incomplete',
            'incomplete_expired',
            'trialing',
            'active',
            'past_due',
            'unpaid',
            'canceled',
            'paused'
        ));

alter table public.billing_events
    drop constraint billing_events_event_type_check,
    add constraint billing_events_event_type_check
        check (event_type in (
            'checkout.session.completed',
            'checkout.session.expired',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
            'customer.subscription.paused',
            'customer.subscription.resumed',
            'customer.subscription.trial_will_end',
            'invoice.paid',
            'invoice.payment_failed',
            'invoice.payment_action_required'
        ));

create or replace function public.claim_stripe_billing_checkout(
    p_user_id uuid,
    p_stripe_customer_id text,
    p_request_id uuid,
    p_billing_interval text
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_claimed_request_id uuid;
    v_existing_request_id uuid;
    v_existing_interval text;
begin
    perform 1
      from public.billing_customers
     where user_id = p_user_id
       and stripe_customer_id = p_stripe_customer_id
     for update;
    if not found then
        return 'customer_mismatch';
    end if;

    if exists (
        select 1
          from public.billing_subscriptions
         where user_id = p_user_id
           and provider_status not in ('canceled', 'incomplete_expired')
    ) then
        return 'subscription_exists';
    end if;

    insert into public.billing_checkout_claims (
        user_id,
        stripe_customer_id,
        request_id,
        billing_interval,
        trial_days,
        claim_expires_at
    )
    values (
        p_user_id,
        p_stripe_customer_id,
        p_request_id,
        p_billing_interval,
        0,
        now() + interval '35 minutes'
    )
    on conflict (user_id) do update
        set stripe_customer_id = excluded.stripe_customer_id,
            request_id = excluded.request_id,
            billing_interval = excluded.billing_interval,
            trial_days = 0,
            stripe_checkout_session_id = null,
            session_expires_at = null,
            claim_expires_at = excluded.claim_expires_at
        where public.billing_checkout_claims.claim_expires_at <= now()
    returning request_id into v_claimed_request_id;

    if v_claimed_request_id = p_request_id then
        return 'claimed';
    end if;

    select request_id, billing_interval
      into v_existing_request_id, v_existing_interval
      from public.billing_checkout_claims
     where user_id = p_user_id;

    if v_existing_request_id = p_request_id
       and v_existing_interval = p_billing_interval then
        return 'claimed';
    end if;

    return 'checkout_pending';
end;
$$;

revoke all on function public.claim_stripe_billing_checkout(
    uuid, text, uuid, text
) from public, anon, authenticated;
grant execute on function public.claim_stripe_billing_checkout(
    uuid, text, uuid, text
) to service_role;

create or replace function public.set_stripe_billing_checkout_trial(
    p_user_id uuid,
    p_stripe_customer_id text,
    p_request_id uuid
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_trial_used_at timestamptz;
    v_claim_user_id uuid;
begin
    select trial_used_at
      into v_trial_used_at
      from public.billing_customers
     where user_id = p_user_id
       and stripe_customer_id = p_stripe_customer_id
     for update;
    if not found then
        return 'customer_mismatch';
    end if;

    if v_trial_used_at is not null then
        return 'trial_used';
    end if;

    update public.billing_checkout_claims
       set trial_days = 7
     where user_id = p_user_id
       and stripe_customer_id = p_stripe_customer_id
       and request_id = p_request_id
       and billing_interval = 'monthly'
       and claim_expires_at > now()
       and stripe_checkout_session_id is null
    returning user_id into v_claim_user_id;

    if v_claim_user_id = p_user_id then
        return 'trial_set';
    end if;
    return 'claim_mismatch';
end;
$$;

revoke all on function public.set_stripe_billing_checkout_trial(
    uuid, text, uuid
) from public, anon, authenticated;
grant execute on function public.set_stripe_billing_checkout_trial(
    uuid, text, uuid
) to service_role;

create or replace function public.apply_stripe_billing_event(
    p_user_id uuid,
    p_stripe_customer_id text,
    p_stripe_subscription_id text,
    p_stripe_price_id text,
    p_billing_interval text,
    p_provider_status text,
    p_current_period_end timestamptz,
    p_cancel_at_period_end boolean,
    p_event_id text,
    p_event_type text,
    p_stripe_object_id text,
    p_event_created_at timestamptz
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_existing_event_at timestamptz;
    v_existing_subscription_id text;
    v_access_state text;
    v_effective_until timestamptz;
begin
    if p_user_id is null
       or p_stripe_customer_id is null
       or p_stripe_subscription_id is null
       or p_stripe_price_id is null
       or p_event_id is null
       or p_stripe_customer_id !~ '^cus_[A-Za-z0-9]+$'
       or p_stripe_subscription_id !~ '^sub_[A-Za-z0-9]+$'
       or p_stripe_price_id !~ '^price_[A-Za-z0-9]+$'
       or p_event_id !~ '^evt_[A-Za-z0-9]+$'
       or p_event_created_at is null then
        raise exception 'invalid Stripe Billing event parameters';
    end if;

    if p_billing_interval not in ('monthly', 'annual')
       or p_provider_status not in (
           'incomplete',
           'incomplete_expired',
           'trialing',
           'active',
           'past_due',
           'unpaid',
           'canceled',
           'paused'
       )
       or p_event_type not in (
           'checkout.session.completed',
           'checkout.session.expired',
           'customer.subscription.created',
           'customer.subscription.updated',
           'customer.subscription.deleted',
           'customer.subscription.paused',
           'customer.subscription.resumed',
           'customer.subscription.trial_will_end',
           'invoice.paid',
           'invoice.payment_failed',
           'invoice.payment_action_required'
       ) then
        raise exception 'unsupported Stripe Billing state or event';
    end if;

    if p_provider_status = 'trialing' and p_billing_interval <> 'monthly' then
        raise exception 'trials are supported only for monthly Billing';
    end if;

    if p_provider_status in ('trialing', 'active', 'past_due')
       and p_current_period_end is null then
        raise exception 'trial, paid or grace Billing state requires a period end';
    end if;

    perform 1
      from public.billing_customers
     where user_id = p_user_id
       and stripe_customer_id = p_stripe_customer_id
     for update;
    if not found then
        return 'customer_mismatch';
    end if;

    if exists (
        select 1
          from public.billing_events
         where stripe_event_id = p_event_id
    ) then
        return 'duplicate';
    end if;

    select provider_event_created_at, stripe_subscription_id
      into v_existing_event_at, v_existing_subscription_id
      from public.billing_subscriptions
     where user_id = p_user_id
     for update;

    if found and (
        p_event_created_at < v_existing_event_at
        or (
            p_event_created_at = v_existing_event_at
            and p_stripe_subscription_id <> v_existing_subscription_id
        )
    ) then
        insert into public.billing_events (
            stripe_event_id,
            user_id,
            event_type,
            stripe_object_id,
            processing_result,
            provider_created_at
        ) values (
            p_event_id,
            p_user_id,
            p_event_type,
            nullif(btrim(p_stripe_object_id), ''),
            'stale',
            p_event_created_at
        );
        return 'stale';
    end if;

    insert into public.billing_events (
        stripe_event_id,
        user_id,
        event_type,
        stripe_object_id,
        processing_result,
        provider_created_at
    ) values (
        p_event_id,
        p_user_id,
        p_event_type,
        nullif(btrim(p_stripe_object_id), ''),
        'applied',
        p_event_created_at
    );

    insert into public.billing_subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        plan_key,
        billing_interval,
        provider_status,
        current_period_end,
        cancel_at_period_end,
        provider_event_created_at,
        provider_event_id
    ) values (
        p_user_id,
        p_stripe_customer_id,
        p_stripe_subscription_id,
        p_stripe_price_id,
        'tallyo_pro',
        p_billing_interval,
        p_provider_status,
        p_current_period_end,
        coalesce(p_cancel_at_period_end, false),
        p_event_created_at,
        p_event_id
    )
    on conflict (user_id) do update set
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_subscription_id = excluded.stripe_subscription_id,
        stripe_price_id = excluded.stripe_price_id,
        plan_key = excluded.plan_key,
        billing_interval = excluded.billing_interval,
        provider_status = excluded.provider_status,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = excluded.cancel_at_period_end,
        provider_event_created_at = excluded.provider_event_created_at,
        provider_event_id = excluded.provider_event_id;

    if p_provider_status = 'trialing' then
        update public.billing_customers
           set trial_used_at = coalesce(trial_used_at, p_event_created_at)
         where user_id = p_user_id
           and stripe_customer_id = p_stripe_customer_id;
    end if;

    if p_provider_status in ('trialing', 'active') then
        v_access_state := 'full';
        v_effective_until := p_current_period_end;
    elsif p_provider_status = 'past_due' then
        v_access_state := 'grace';
        v_effective_until := p_event_created_at + interval '7 days';
    else
        v_access_state := 'read_only';
        v_effective_until := p_current_period_end;
    end if;

    insert into public.account_entitlements (
        user_id,
        plan_key,
        access_state,
        effective_until,
        source_event_id
    ) values (
        p_user_id,
        'tallyo_pro',
        v_access_state,
        v_effective_until,
        p_event_id
    )
    on conflict (user_id) do update set
        plan_key = excluded.plan_key,
        access_state = excluded.access_state,
        effective_until = excluded.effective_until,
        source_event_id = excluded.source_event_id;

    return 'applied';
end;
$$;

revoke all on function public.apply_stripe_billing_event(
    uuid, text, text, text, text, text, timestamptz, boolean,
    text, text, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.apply_stripe_billing_event(
    uuid, text, text, text, text, text, timestamptz, boolean,
    text, text, text, timestamptz
) to service_role;
