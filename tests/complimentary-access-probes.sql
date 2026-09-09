\set ON_ERROR_STOP on

alter table auth.users add column email text;
alter table auth.users add column email_confirmed_at timestamptz;

update auth.users
   set email = case id
       when '11111111-1111-4111-8111-111111111111' then 'owner-one@example.invalid'
       else 'owner-two@example.invalid'
   end,
       email_confirmed_at = case id
           when '11111111-1111-4111-8111-111111111111' then now()
           else null
       end;

update private.commercial_feature_flags
   set enabled = true,
       updated_at = now()
 where feature_key = 'subscription_write_enforcement';

do $$
begin
    if exists (
        select 1
          from information_schema.columns
         where table_schema = 'private'
           and table_name = 'complimentary_access_grants'
           and column_name = 'email'
    ) then
        raise exception 'complimentary grant table stores an email address';
    end if;

    if not (select relrowsecurity from pg_class where oid = 'private.complimentary_access_grants'::regclass) then
        raise exception 'complimentary grant table does not have RLS enabled';
    end if;

    if exists (
        select 1
          from pg_policies
         where schemaname = 'private'
           and tablename = 'complimentary_access_grants'
    ) then
        raise exception 'complimentary grant table unexpectedly has a browser policy';
    end if;

    if has_table_privilege('service_role', 'private.complimentary_access_grants', 'INSERT')
       or has_table_privilege('service_role', 'private.complimentary_access_grants', 'UPDATE')
       or has_table_privilege('service_role', 'private.complimentary_access_grants', 'DELETE') then
        raise exception 'service role can mutate complimentary grants';
    end if;

    if has_function_privilege(
        'authenticated',
        'private.grant_complimentary_access_by_email(text,timestamp with time zone)',
        'EXECUTE'
    ) then
        raise exception 'authenticated role can grant complimentary access';
    end if;

    if has_function_privilege(
        'service_role',
        'private.revoke_complimentary_access_by_email(text)',
        'EXECUTE'
    ) then
        raise exception 'service role can revoke complimentary access';
    end if;
end;
$$;

do $$
begin
    begin
        perform private.grant_complimentary_access_by_email('owner-two@example.invalid');
        raise exception 'unconfirmed account received complimentary access';
    exception
        when others then
            if sqlerrm = 'unconfirmed account received complimentary access' then
                raise;
            end if;
    end;
end;
$$;

select private.grant_complimentary_access_by_email('  OWNER-ONE@EXAMPLE.INVALID  ');

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
begin
    if not public.current_account_has_complimentary_access() then
        raise exception 'granted account was not reported active';
    end if;

    begin
        perform private.grant_complimentary_access_by_email('owner-one@example.invalid');
        raise exception 'authenticated role can grant complimentary access';
    exception
        when insufficient_privilege then null;
    end;
end;
$$;

insert into public.customers (id, user_id, value) values (
    '10000000-0000-4000-8000-000000000021',
    '11111111-1111-4111-8111-111111111111',
    'complimentary access'
);

do $$
begin
    begin
        insert into public.customers (id, user_id, value) values (
            '20000000-0000-4000-8000-000000000021',
            '22222222-2222-4222-8222-222222222222',
            'cross tenant'
        );
        raise exception 'cross-tenant insert succeeded';
    exception
        when insufficient_privilege then null;
    end;
end;
$$;

reset role;
set role service_role;

do $$
begin
    if not public.account_entitlement_allows_write('11111111-1111-4111-8111-111111111111') then
        raise exception 'server entitlement helper rejected complimentary access';
    end if;
end;
$$;

reset role;
select private.revoke_complimentary_access_by_email('owner-one@example.invalid');

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
begin
    if public.current_account_has_complimentary_access() then
        raise exception 'revoked complimentary access was reported active';
    end if;

    begin
        insert into public.customers (id, user_id, value) values (
            '10000000-0000-4000-8000-000000000022',
            '11111111-1111-4111-8111-111111111111',
            'revoked access'
        );
        raise exception 'revoked complimentary access still allowed a write';
    exception
        when insufficient_privilege then null;
    end;
end;
$$;

reset role;

insert into private.complimentary_access_grants (user_id, granted_at, expires_at, revoked_at)
values (
    '11111111-1111-4111-8111-111111111111',
    now() - interval '2 hours',
    now() - interval '1 hour',
    null
)
on conflict (user_id) do update
   set granted_at = excluded.granted_at,
       expires_at = excluded.expires_at,
       revoked_at = null;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
begin
    if public.current_account_has_complimentary_access() then
        raise exception 'expired complimentary access was reported active';
    end if;
end;
$$;

reset role;

select json_build_object(
    'complimentary_access_probe', 'passed',
    'confirmed_account_required', true,
    'email_not_duplicated', true,
    'owner_only_grant_and_revoke', true,
    'authenticated_identity_bound_read', true,
    'cross_tenant_write_blocked', true,
    'revocation_immediate', true,
    'expiry_enforced', true,
    'service_guard_compatible', true
);
