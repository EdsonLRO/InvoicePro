\set ON_ERROR_STOP on

do $$
begin
    if not (
        select relrowsecurity
          from pg_class
         where oid = 'public.stripe_connected_accounts'::regclass
    ) then
        raise exception 'stripe_connected_accounts must enable RLS';
    end if;
    if not (
        select relrowsecurity
          from pg_class
         where oid = 'public.stripe_connect_events'::regclass
    ) then
        raise exception 'stripe_connect_events must enable RLS';
    end if;
    if exists (
        select 1
          from pg_policies
         where schemaname = 'public'
           and tablename = 'stripe_connect_events'
    ) then
        raise exception 'connect events must have no browser policy';
    end if;
    if has_table_privilege(
        'authenticated',
        'public.stripe_connected_accounts',
        'INSERT'
    ) or has_table_privilege(
        'authenticated',
        'public.stripe_connected_accounts',
        'UPDATE'
    ) or has_table_privilege(
        'authenticated',
        'public.stripe_connected_accounts',
        'DELETE'
    ) then
        raise exception 'authenticated can mutate connected-account state';
    end if;
    if has_table_privilege(
        'authenticated',
        'public.stripe_connect_events',
        'SELECT'
    ) then
        raise exception 'authenticated can read private Connect events';
    end if;
end;
$$;

set role service_role;

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
        'acct_TestAccountOne',
        false,
        'active',
        'active',
        'active'
    ),
    (
        '22222222-2222-4222-8222-222222222222',
        'acct_TestAccountTwo',
        false,
        'pending',
        'pending',
        'pending'
    );

insert into public.stripe_connect_events (
    stripe_event_id,
    user_id,
    stripe_account_id,
    event_type,
    processing_result,
    livemode,
    provider_created_at
)
values (
    'evt_TestConnectOne',
    '11111111-1111-4111-8111-111111111111',
    'acct_TestAccountOne',
    'v2.core.account.updated',
    'applied',
    false,
    now()
);

reset role;
set role authenticated;
select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-4111-8111-111111111111',
    false
);

do $$
declare
    v_count integer;
begin
    select count(*) into v_count
      from public.stripe_connected_accounts;
    if v_count <> 1 then
        raise exception 'RLS did not isolate the connected-account row';
    end if;
    if not exists (
        select 1
          from public.stripe_connected_accounts
         where stripe_account_id = 'acct_TestAccountOne'
    ) then
        raise exception 'owner cannot read their connected-account state';
    end if;
end;
$$;

reset role;

do $$
begin
    begin
        insert into public.stripe_connected_accounts (
            user_id,
            stripe_account_id,
            livemode,
            dashboard_access
        )
        values (
            '11111111-1111-4111-8111-111111111111',
            'acct_InvalidDashboard',
            false,
            'none'
        );
        raise exception 'invalid Dashboard responsibility was accepted';
    exception
        when check_violation then null;
    end;

    begin
        insert into public.stripe_connected_accounts (
            user_id,
            stripe_account_id,
            livemode,
            fees_collector
        )
        values (
            '11111111-1111-4111-8111-111111111111',
            'acct_InvalidFees',
            false,
            'application'
        );
        raise exception 'platform fee responsibility was accepted';
    exception
        when check_violation then null;
    end;

    begin
        insert into public.stripe_connect_events (
            stripe_event_id,
            user_id,
            stripe_account_id,
            event_type,
            processing_result,
            livemode,
            provider_created_at
        )
        values (
            'evt_CrossTenant',
            '22222222-2222-4222-8222-222222222222',
            'acct_TestAccountOne',
            'v2.core.account.updated',
            'rejected',
            false,
            now()
        );
        raise exception 'cross-tenant Connect event was accepted';
    exception
        when foreign_key_violation then null;
    end;
end;
$$;

set role service_role;

do $$
begin
    begin
        update public.stripe_connect_events
           set processing_result = 'stale'
         where stripe_event_id = 'evt_TestConnectOne';
        raise exception 'Connect event update was accepted';
    exception
        when raise_exception then
            if sqlerrm <> 'stripe_connect_events are append-only' then
                raise;
            end if;
    end;

    begin
        delete from public.stripe_connect_events
         where stripe_event_id = 'evt_TestConnectOne';
        raise exception 'Connect event delete was accepted';
    exception
        when raise_exception then
            if sqlerrm <> 'stripe_connect_events are append-only' then
                raise;
            end if;
    end;
end;
$$;

reset role;

select 'stripe-connect-foundation-probes: ok' as result;
