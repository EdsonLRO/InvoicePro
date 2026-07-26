\set ON_ERROR_STOP on

set role service_role;

insert into public.invoices (id, user_id, grand_total)
values
    (
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        '11111111-1111-4111-8111-111111111111',
        10
    ),
    (
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
        '22222222-2222-4222-8222-222222222222',
        20
    );

insert into public.stripe_connected_accounts (
    user_id,
    stripe_account_id,
    livemode,
    onboarding_state,
    card_payments_status,
    payouts_status
)
values
    (
        '11111111-1111-4111-8111-111111111111',
        'acct_ConnectOne',
        false,
        'active',
        'active',
        'active'
    ),
    (
        '22222222-2222-4222-8222-222222222222',
        'acct_ConnectTwo',
        false,
        'active',
        'active',
        'active'
    );

insert into public.stripe_connect_checkout_claims (
    request_id,
    user_id,
    stripe_account_id,
    invoice_id,
    amount_minor,
    currency,
    livemode,
    claim_status,
    created_at,
    updated_at
)
values (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    '22222222-2222-4222-8222-222222222222',
    'acct_ConnectTwo',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    2000,
    'GBP',
    false,
    'claimed',
    now() - interval '6 minutes',
    now() - interval '6 minutes'
);

do $$
declare
    v_result text;
begin
    select public.claim_stripe_connect_checkout(
        '11111111-1111-4111-8111-111111111111',
        'acct_ConnectTwo',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
        1000,
        'GBP',
        false
    ) into v_result;
    if v_result <> 'account_unavailable' then
        raise exception 'cross-tenant connected account claim was accepted';
    end if;

    select public.claim_stripe_connect_checkout(
        '11111111-1111-4111-8111-111111111111',
        'acct_ConnectOne',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
        1000,
        'GBP',
        false
    ) into v_result;
    if v_result <> 'claimed' then
        raise exception 'valid connected Checkout was not claimed: %', v_result;
    end if;

    select public.claim_stripe_connect_checkout(
        '11111111-1111-4111-8111-111111111111',
        'acct_ConnectOne',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
        1000,
        'GBP',
        false
    ) into v_result;
    if v_result <> 'checkout_pending' then
        raise exception 'parallel connected Checkout was not rejected';
    end if;

    if not public.complete_stripe_connect_checkout_claim(
        '11111111-1111-4111-8111-111111111111',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
        'cs_test_ConnectOne',
        now() + interval '30 minutes'
    ) then
        raise exception 'connected Checkout claim was not completed';
    end if;
end;
$$;

do $$
declare
    v_result text;
    v_old_status text;
    v_new_status text;
begin
    select public.claim_stripe_connect_checkout(
        '22222222-2222-4222-8222-222222222222',
        'acct_ConnectTwo',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
        2000,
        'GBP',
        false
    ) into v_result;
    if v_result <> 'claimed' then
        raise exception 'expired connected Checkout claim did not recover: %', v_result;
    end if;

    select claim_status into v_old_status
      from public.stripe_connect_checkout_claims
     where request_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3';
    if v_old_status <> 'expired' then
        raise exception 'stale connected Checkout claim was not expired';
    end if;

    select claim_status into v_new_status
      from public.stripe_connect_checkout_claims
     where request_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4';
    if v_new_status <> 'claimed' then
        raise exception 'replacement connected Checkout claim was not reserved';
    end if;
end;
$$;

do $$
begin
    begin
        insert into public.stripe_connect_checkout_claims (
            request_id,
            user_id,
            stripe_account_id,
            invoice_id,
            amount_minor,
            currency,
            livemode,
            claim_status,
            stripe_checkout_session_id
        )
        values (
            'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
            '22222222-2222-4222-8222-222222222222',
            'acct_ConnectTwo',
            'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
            2000,
            'GBP',
            false,
            'expired',
            'cs_test_HalfBound'
        );
        raise exception 'half-bound expired connected Checkout claim was accepted';
    exception
        when check_violation then
            null;
    end;
end;
$$;

do $$
declare
    v_result text;
begin
    select public.apply_stripe_connect_invoice_event(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        '11111111-1111-4111-8111-111111111111',
        'acct_ConnectOne',
        0,
        '[{"amount":10,"provider":"stripe","providerChannel":"connect"}]'::jsonb,
        '[{"type":"payment","providerMarker":"stripe-connect:evt_ConnectPayment"}]'::jsonb,
        'Paid',
        'stripe_connect_payment_completed',
        'evt_ConnectPayment',
        '{"session_id":"cs_test_ConnectOne","amount":10,"currency":"GBP"}'::jsonb,
        now(),
        now(),
        false,
        'cs_test_ConnectOne',
        1000,
        'GBP'
    ) into v_result;
    if v_result <> 'applied' then
        raise exception 'valid connected payment was not applied: %', v_result;
    end if;

    select public.apply_stripe_connect_invoice_event(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        '11111111-1111-4111-8111-111111111111',
        'acct_ConnectOne',
        0,
        '[]'::jsonb,
        '[]'::jsonb,
        'Sent',
        'stripe_connect_payment_completed',
        'evt_ConnectPayment',
        '{}'::jsonb,
        now(),
        now(),
        false,
        'cs_test_ConnectOne',
        1000,
        'GBP'
    ) into v_result;
    if v_result <> 'duplicate' then
        raise exception 'duplicate connected event was not idempotent';
    end if;
end;
$$;

do $$
declare
    v_count integer;
    v_status text;
begin
    select count(*) into v_count
      from public.stripe_connect_events
     where stripe_event_id = 'evt_ConnectPayment';
    if v_count <> 1 then
        raise exception 'connected event evidence was not unique';
    end if;
    select claim_status into v_status
      from public.stripe_connect_checkout_claims
     where request_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
    if v_status <> 'completed' then
        raise exception 'connected Checkout claim did not complete atomically';
    end if;
    if not exists (
        select 1
          from public.audit_events
         where provider = 'stripe_connect'
           and provider_event_id = 'evt_ConnectPayment'
    ) then
        raise exception 'connected payment audit was not written';
    end if;
end;
$$;

reset role;
set role authenticated;
select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-4111-8111-111111111111',
    false
);

do $$
begin
    if has_table_privilege(
        'authenticated',
        'public.stripe_connect_checkout_claims',
        'SELECT'
    ) then
        raise exception 'authenticated can read private Checkout claims';
    end if;
    if has_function_privilege(
        'authenticated',
        'public.claim_stripe_connect_checkout(uuid,text,uuid,uuid,bigint,text,boolean)',
        'EXECUTE'
    ) then
        raise exception 'authenticated can invoke the service-only claim RPC';
    end if;
end;
$$;

reset role;
set role service_role;

do $$
begin
    begin
        update public.stripe_connect_checkout_claims
           set user_id = '22222222-2222-4222-8222-222222222222'
         where request_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
        raise exception 'connected Checkout tenant rebinding was accepted';
    exception
        when raise_exception then
            if sqlerrm <> 'Stripe Connect Checkout binding is immutable' then
                raise;
            end if;
    end;
end;
$$;

reset role;

select 'stripe-connect-payments-probes: ok' as result;
