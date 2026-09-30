\set ON_ERROR_STOP on

-- Run only against an isolated database with the Billing foundation and
-- seven-day trial migration applied. Every mutation is rolled back.
begin;

do $$
declare
    v_subscription public.billing_subscriptions%rowtype;
    v_event_at timestamptz;
    v_trial_end timestamptz;
    v_result text;
    v_access_state text;
    v_effective_until timestamptz;
    v_trial_used_at timestamptz;
begin
    select *
      into v_subscription
      from public.billing_subscriptions
     where billing_interval = 'monthly'
     order by created_at
     limit 1;

    if not found then
        raise exception 'Trial probe requires one synthetic monthly subscription';
    end if;

    v_event_at := greatest(v_subscription.provider_event_created_at, now())
        + interval '1 hour';
    v_trial_end := v_event_at + interval '7 days';

    update public.billing_customers
       set trial_used_at = null
     where user_id = v_subscription.user_id;

    select public.apply_stripe_billing_event(
        v_subscription.user_id,
        v_subscription.stripe_customer_id,
        v_subscription.stripe_subscription_id,
        v_subscription.stripe_price_id,
        'monthly',
        'trialing',
        v_trial_end,
        false,
        'evt_TallyoTrialStartProbe',
        'customer.subscription.created',
        v_subscription.stripe_subscription_id,
        v_event_at
    ) into v_result;

    select access_state, effective_until
      into v_access_state, v_effective_until
      from public.account_entitlements
     where user_id = v_subscription.user_id;
    select trial_used_at
      into v_trial_used_at
      from public.billing_customers
     where user_id = v_subscription.user_id;

    if v_result <> 'applied'
       or v_access_state <> 'full'
       or v_effective_until <> v_trial_end
       or v_trial_used_at <> v_event_at
       or public.account_entitlement_allows_write(v_subscription.user_id)
          is not true then
        raise exception 'trialing did not create bounded full access';
    end if;

    insert into public.billing_checkout_claims (
        user_id,
        stripe_customer_id,
        request_id,
        billing_interval,
        claim_expires_at
    ) values (
        v_subscription.user_id,
        v_subscription.stripe_customer_id,
        '77777777-7777-4777-8777-777777777777',
        'monthly',
        now() + interval '35 minutes'
    )
    on conflict (user_id) do update set
        request_id = excluded.request_id,
        billing_interval = excluded.billing_interval,
        trial_days = 0,
        stripe_checkout_session_id = null,
        session_expires_at = null,
        claim_expires_at = excluded.claim_expires_at;

    select public.set_stripe_billing_checkout_trial(
        v_subscription.user_id,
        v_subscription.stripe_customer_id,
        '77777777-7777-4777-8777-777777777777'
    ) into v_result;
    if v_result <> 'trial_used' then
        raise exception 'a used trial was not rejected';
    end if;

    select public.apply_stripe_billing_event(
        v_subscription.user_id,
        v_subscription.stripe_customer_id,
        v_subscription.stripe_subscription_id,
        v_subscription.stripe_price_id,
        'monthly',
        'trialing',
        v_trial_end,
        false,
        'evt_TallyoTrialReminderProbe',
        'customer.subscription.trial_will_end',
        v_subscription.stripe_subscription_id,
        v_event_at + interval '4 days'
    ) into v_result;
    if v_result <> 'applied' then
        raise exception 'trial-ending event was not recorded';
    end if;
end;
$$;

rollback;

select 'passed' as seven_day_trial_probe;
