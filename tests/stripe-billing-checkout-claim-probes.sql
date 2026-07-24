\set ON_ERROR_STOP on

do $$
declare
    v_rls boolean;
begin
    select relrowsecurity
      into v_rls
      from pg_class
     where oid = 'public.billing_checkout_claims'::regclass;
    if v_rls is not true then
        raise exception 'billing_checkout_claims must enable RLS';
    end if;
    if exists (
        select 1
          from pg_policies
         where schemaname = 'public'
           and tablename = 'billing_checkout_claims'
    ) then
        raise exception 'billing_checkout_claims must not expose browser policies';
    end if;
    if has_table_privilege(
        'authenticated',
        'public.billing_checkout_claims',
        'SELECT'
    ) then
        raise exception 'authenticated must not read Checkout claims';
    end if;
    if has_table_privilege(
        'anon',
        'public.billing_checkout_claims',
        'SELECT'
    ) then
        raise exception 'anon must not read Checkout claims';
    end if;
end;
$$;

do $$
declare
    v_rpc regprocedure;
begin
    foreach v_rpc in array array[
        'public.claim_stripe_billing_checkout(uuid,text,uuid,text)'::regprocedure,
        'public.complete_stripe_billing_checkout_claim(uuid,text,uuid,text,timestamptz)'::regprocedure,
        'public.clear_stripe_billing_checkout_claim(text)'::regprocedure
    ]
    loop
        if has_function_privilege('authenticated', v_rpc, 'EXECUTE')
           or has_function_privilege('anon', v_rpc, 'EXECUTE') then
            raise exception 'browser role can execute privileged Checkout claim RPC';
        end if;
        if not has_function_privilege('service_role', v_rpc, 'EXECUTE') then
            raise exception 'service_role cannot execute Checkout claim RPC';
        end if;
        if (
            select prosecdef
              from pg_proc
             where oid = v_rpc
        ) then
            raise exception 'Checkout claim RPC must use SECURITY INVOKER';
        end if;
    end loop;
end;
$$;

set role service_role;

insert into public.billing_customers (user_id, stripe_customer_id)
values
    (
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne'
    ),
    (
        '22222222-2222-4222-8222-222222222222',
        'cus_TestAccountTwo'
    );

do $$
begin
    if public.claim_stripe_billing_checkout(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'monthly'
    ) <> 'claimed' then
        raise exception 'first Checkout request was not claimed';
    end if;

    if public.claim_stripe_billing_checkout(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'monthly'
    ) <> 'claimed' then
        raise exception 'same-request retry was not idempotently claimed';
    end if;

    if public.claim_stripe_billing_checkout(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        'monthly'
    ) <> 'checkout_pending' then
        raise exception 'different request bypassed the active claim';
    end if;

    if public.claim_stripe_billing_checkout(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'annual'
    ) <> 'checkout_pending' then
        raise exception 'same request changed billing interval';
    end if;

    if public.claim_stripe_billing_checkout(
        '22222222-2222-4222-8222-222222222222',
        'cus_TestAccountOne',
        'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        'monthly'
    ) <> 'customer_mismatch' then
        raise exception 'cross-account customer claim was not rejected';
    end if;
end;
$$;

do $$
begin
    if public.complete_stripe_billing_checkout_claim(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        'cs_test_WrongRequest',
        now() + interval '30 minutes'
    ) then
        raise exception 'wrong request completed the Checkout claim';
    end if;

    if public.complete_stripe_billing_checkout_claim(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'cs_test_ClaimedSession',
        now() - interval '1 minute'
    ) then
        raise exception 'expired Stripe Session completed the claim';
    end if;

    if not public.complete_stripe_billing_checkout_claim(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'cs_test_ClaimedSession',
        now() + interval '30 minutes'
    ) then
        raise exception 'valid Stripe Session did not complete the claim';
    end if;

    if public.clear_stripe_billing_checkout_claim(
        'cs_test_UnrelatedSession'
    ) then
        raise exception 'unrelated Session cleared a Checkout claim';
    end if;

    if not public.clear_stripe_billing_checkout_claim(
        'cs_test_ClaimedSession'
    ) then
        raise exception 'matching signed lifecycle could not clear the claim';
    end if;
end;
$$;

do $$
begin
    if public.claim_stripe_billing_checkout(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        'annual'
    ) <> 'claimed' then
        raise exception 'cleared claim did not permit a new Checkout';
    end if;

    update public.billing_checkout_claims
       set claim_expires_at = now() - interval '1 second'
     where user_id = '11111111-1111-4111-8111-111111111111';

    if public.claim_stripe_billing_checkout(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        'monthly'
    ) <> 'claimed' then
        raise exception 'expired claim did not recover';
    end if;

    if public.claim_stripe_billing_checkout(
        '22222222-2222-4222-8222-222222222222',
        'cus_TestAccountTwo',
        'ffffffff-ffff-4fff-8fff-ffffffffffff',
        'annual'
    ) <> 'claimed' then
        raise exception 'second account could not claim independently';
    end if;
end;
$$;

do $$
declare
    v_result text;
begin
    select public.apply_stripe_billing_event(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        'sub_TestSubscriptionOne',
        'price_TestMonthly',
        'monthly',
        'active',
        now() + interval '30 days',
        false,
        'evt_TestSubscriptionActive',
        'customer.subscription.created',
        'sub_TestSubscriptionOne',
        now()
    )
      into v_result;
    if v_result <> 'applied' then
        raise exception 'synthetic subscription was not applied';
    end if;

    if public.claim_stripe_billing_checkout(
        '11111111-1111-4111-8111-111111111111',
        'cus_TestAccountOne',
        '99999999-9999-4999-8999-999999999999',
        'monthly'
    ) <> 'subscription_exists' then
        raise exception 'verified subscription did not block new Checkout';
    end if;
end;
$$;

reset role;

begin;
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-4111-8111-111111111111',
    true
);
do $$
begin
    begin
        perform * from public.billing_checkout_claims;
        raise exception 'authenticated unexpectedly read Checkout claims';
    exception
        when insufficient_privilege then null;
    end;

    begin
        perform public.claim_stripe_billing_checkout(
            '11111111-1111-4111-8111-111111111111',
            'cus_TestAccountOne',
            '12121212-1212-4212-8212-121212121212',
            'monthly'
        );
        raise exception 'authenticated unexpectedly executed claim RPC';
    exception
        when insufficient_privilege then null;
    end;
end;
$$;
rollback;

select
    (select count(*) from public.billing_checkout_claims) as claims,
    (select count(*) from public.billing_subscriptions) as subscriptions,
    (select count(*) from public.billing_events) as events,
    'ALL BILLING CHECKOUT CLAIM PROBES PASSED' as result;
