begin;

do $$
declare
    v_subscription public.billing_subscriptions%rowtype;
    v_event_at timestamptz;
    v_period_end timestamptz;
    v_result text;
    v_status text;
    v_access_state text;
    v_effective_until timestamptz;
begin
    select *
      into v_subscription
      from public.billing_subscriptions
     order by created_at
     limit 1;

    if not found then
        raise exception 'Billing lifecycle probe requires one synthetic subscription';
    end if;

    v_event_at := greatest(v_subscription.provider_event_created_at, now())
        + interval '1 hour';
    v_period_end := coalesce(
        v_subscription.current_period_end,
        v_event_at + interval '30 days'
    ) + interval '1 month';

    select public.apply_stripe_billing_event(
        v_subscription.user_id,
        v_subscription.stripe_customer_id,
        v_subscription.stripe_subscription_id,
        v_subscription.stripe_price_id,
        v_subscription.billing_interval,
        'active',
        v_period_end,
        false,
        'evt_TallyoRenewalProbe',
        'invoice.paid',
        v_subscription.stripe_subscription_id,
        v_event_at
    )
    into v_result;

    select provider_status
      into v_status
      from public.billing_subscriptions
     where user_id = v_subscription.user_id;
    select access_state
      into v_access_state
      from public.account_entitlements
     where user_id = v_subscription.user_id;

    if v_result <> 'applied'
       or v_status <> 'active'
       or v_access_state <> 'full'
       or public.account_entitlement_allows_write(v_subscription.user_id)
          is not true then
        raise exception 'renewal did not preserve full write access';
    end if;

    select public.apply_stripe_billing_event(
        v_subscription.user_id,
        v_subscription.stripe_customer_id,
        v_subscription.stripe_subscription_id,
        v_subscription.stripe_price_id,
        v_subscription.billing_interval,
        'past_due',
        v_period_end,
        false,
        'evt_TallyoPaymentFailedProbe',
        'invoice.payment_failed',
        v_subscription.stripe_subscription_id,
        v_event_at + interval '1 second'
    )
    into v_result;

    select access_state, effective_until
      into v_access_state, v_effective_until
      from public.account_entitlements
     where user_id = v_subscription.user_id;

    if v_result <> 'applied'
       or v_access_state <> 'grace'
       or v_effective_until <> v_event_at + interval '7 days 1 second'
       or public.account_entitlement_allows_write(v_subscription.user_id)
          is not true then
        raise exception 'failed payment did not create seven-day grace access';
    end if;

    select public.apply_stripe_billing_event(
        v_subscription.user_id,
        v_subscription.stripe_customer_id,
        v_subscription.stripe_subscription_id,
        v_subscription.stripe_price_id,
        v_subscription.billing_interval,
        'unpaid',
        v_period_end,
        false,
        'evt_TallyoReadOnlyProbe',
        'customer.subscription.updated',
        v_subscription.stripe_subscription_id,
        v_event_at + interval '2 seconds'
    )
    into v_result;

    select access_state
      into v_access_state
      from public.account_entitlements
     where user_id = v_subscription.user_id;

    if v_result <> 'applied'
       or v_access_state <> 'read_only'
       or public.account_entitlement_allows_write(v_subscription.user_id)
          is not false then
        raise exception 'unpaid subscription did not enter read-only access';
    end if;

    select public.apply_stripe_billing_event(
        v_subscription.user_id,
        v_subscription.stripe_customer_id,
        v_subscription.stripe_subscription_id,
        v_subscription.stripe_price_id,
        v_subscription.billing_interval,
        'active',
        v_period_end + interval '1 month',
        false,
        'evt_TallyoRecoveryProbe',
        'invoice.paid',
        v_subscription.stripe_subscription_id,
        v_event_at + interval '3 seconds'
    )
    into v_result;

    select access_state
      into v_access_state
      from public.account_entitlements
     where user_id = v_subscription.user_id;

    if v_result <> 'applied'
       or v_access_state <> 'full'
       or public.account_entitlement_allows_write(v_subscription.user_id)
          is not true then
        raise exception 'payment recovery did not restore full write access';
    end if;
end;
$$;

rollback;

select
    'passed' as lifecycle_probe,
    s.provider_status,
    s.cancel_at_period_end,
    e.access_state
from public.billing_subscriptions s
join public.account_entitlements e using (user_id);
