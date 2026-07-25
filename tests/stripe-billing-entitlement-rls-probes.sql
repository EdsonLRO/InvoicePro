\set ON_ERROR_STOP on

set role service_role;

insert into public.company_settings (id, user_id, value) values
    ('10000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'owner one'),
    ('20000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'owner two');
insert into public.customers (id, user_id, value) values
    ('10000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'owner one'),
    ('20000000-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'owner two');
insert into public.saved_items (id, user_id, value) values
    ('10000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'owner one'),
    ('20000000-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', 'owner two');
insert into public.invoices (id, user_id, value) values
    ('10000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'owner one'),
    ('20000000-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'owner two');
insert into public.recurring_templates (id, user_id, value) values
    ('10000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'owner one'),
    ('20000000-0000-4000-8000-000000000005', '22222222-2222-4222-8222-222222222222', 'owner two');

insert into public.billing_events (
    stripe_event_id,
    user_id,
    event_type,
    processing_result,
    provider_created_at
) values (
    'evt_TallyoEntitlementRls1',
    '11111111-1111-4111-8111-111111111111',
    'customer.subscription.updated',
    'applied',
    now()
);

reset role;

do $$
begin
    if not has_function_privilege(
        'authenticated',
        'private.current_account_entitlement_allows_write()',
        'EXECUTE'
    ) then
        raise exception 'authenticated cannot execute its identity-bound entitlement helper';
    end if;

    if has_function_privilege(
        'anon',
        'private.current_account_entitlement_allows_write()',
        'EXECUTE'
    ) then
        raise exception 'anonymous role can execute the entitlement helper';
    end if;

    if has_function_privilege(
        'service_role',
        'private.current_account_entitlement_allows_write()',
        'EXECUTE'
    ) then
        raise exception 'service role should bypass RLS rather than execute the authenticated helper';
    end if;

    if has_table_privilege(
        'service_role',
        'private.commercial_feature_flags',
        'UPDATE'
    ) or has_table_privilege(
        'authenticated',
        'private.commercial_feature_flags',
        'UPDATE'
    ) then
        raise exception 'non-owner role can change the commercial rollout gate';
    end if;
end;
$$;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

insert into public.customers (id, user_id, value) values (
    '10000000-0000-4000-8000-000000000011',
    '11111111-1111-4111-8111-111111111111',
    'rollout gate open'
);
delete from public.customers
 where id = '10000000-0000-4000-8000-000000000011';

reset role;

update private.commercial_feature_flags
   set enabled = true,
       updated_at = now()
 where feature_key = 'subscription_write_enforcement';

reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
declare
    v_visible integer;
begin
    select count(*) into v_visible from public.invoices;
    if v_visible <> 1 then
        raise exception 'owner-scoped reads changed before entitlement activation';
    end if;

    begin
        insert into public.customers (id, user_id, value) values (
            '10000000-0000-4000-8000-000000000012',
            '11111111-1111-4111-8111-111111111111',
            'no entitlement'
        );
        raise exception 'write succeeded without an entitlement';
    exception
        when insufficient_privilege then null;
    end;
end;
$$;

reset role;
set role service_role;

insert into public.account_entitlements (
    user_id,
    plan_key,
    access_state,
    effective_until,
    source_event_id
) values (
    '11111111-1111-4111-8111-111111111111',
    'tallyo_pro',
    'full',
    now() + interval '30 days',
    'evt_TallyoEntitlementRls1'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

insert into public.customers (id, user_id, value) values (
    '10000000-0000-4000-8000-000000000012',
    '11111111-1111-4111-8111-111111111111',
    'full entitlement'
);

update public.invoices
   set value = 'full entitlement'
 where id = '10000000-0000-4000-8000-000000000004';

do $$
begin
    begin
        insert into public.customers (id, user_id, value) values (
            '20000000-0000-4000-8000-000000000012',
            '22222222-2222-4222-8222-222222222222',
            'cross tenant'
        );
        raise exception 'cross-tenant insert succeeded with a full entitlement';
    exception
        when insufficient_privilege then null;
    end;
end;
$$;

reset role;
set role service_role;

update public.account_entitlements
   set access_state = 'grace',
       effective_until = now() + interval '7 days'
 where user_id = '11111111-1111-4111-8111-111111111111';

reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

delete from public.customers
 where id = '10000000-0000-4000-8000-000000000012';

reset role;
set role service_role;

update public.account_entitlements
   set access_state = 'read_only',
       effective_until = now() + interval '30 days'
 where user_id = '11111111-1111-4111-8111-111111111111';

reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
declare
    v_count integer;
begin
    update public.invoices
       set value = 'read-only bypass'
     where id = '10000000-0000-4000-8000-000000000004';
    get diagnostics v_count = row_count;
    if v_count <> 0 then
        raise exception 'read-only entitlement allowed an update';
    end if;

    delete from public.saved_items
     where id = '10000000-0000-4000-8000-000000000003';
    get diagnostics v_count = row_count;
    if v_count <> 0 then
        raise exception 'read-only entitlement allowed a delete';
    end if;

    select count(*) into v_count from public.invoices;
    if v_count <> 1 then
        raise exception 'read-only entitlement removed owner-scoped reads';
    end if;
end;
$$;

reset role;
set role service_role;

update public.account_entitlements
   set access_state = 'full',
       effective_until = now() - interval '1 second'
 where user_id = '11111111-1111-4111-8111-111111111111';

reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
declare
    v_count integer;
begin
    update public.company_settings
       set value = 'expired bypass'
     where id = '10000000-0000-4000-8000-000000000001';
    get diagnostics v_count = row_count;
    if v_count <> 0 then
        raise exception 'expired entitlement allowed an update';
    end if;
end;
$$;

reset role;
set role service_role;

update public.invoices
   set value = 'provider reconciliation retained'
 where id = '10000000-0000-4000-8000-000000000004';

reset role;

begin;
delete from private.commercial_feature_flags
 where feature_key = 'subscription_write_enforcement';
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-4222-8222-222222222222',
    true
);
do $$
begin
    begin
        insert into public.customers (id, user_id, value) values (
            '20000000-0000-4000-8000-000000000013',
            '22222222-2222-4222-8222-222222222222',
            'missing rollout gate'
        );
        raise exception 'missing rollout gate allowed a write';
    exception
        when insufficient_privilege then null;
    end;
end;
$$;
rollback;

select json_build_object(
    'entitlement_rls_probe', 'passed',
    'authenticated_write_states', array['full', 'grace'],
    'blocked_states', array['missing', 'read_only', 'expired'],
    'owner_reads_preserved', true,
    'cross_tenant_write_blocked', true,
    'service_role_reconciliation_preserved', true,
    'missing_rollout_gate_fails_closed', true
);
