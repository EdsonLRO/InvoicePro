create table private.complimentary_access_grants (
    user_id uuid primary key references auth.users(id) on delete cascade,
    granted_at timestamptz not null default now(),
    expires_at timestamptz,
    revoked_at timestamptz,
    constraint complimentary_access_expiry_check
        check (expires_at is null or expires_at > granted_at)
);

alter table private.complimentary_access_grants enable row level security;

revoke all on private.complimentary_access_grants
    from public, anon, authenticated, service_role;
grant select on private.complimentary_access_grants to service_role;

create or replace function private.grant_complimentary_access_by_email(
    p_email text,
    p_expires_at timestamptz default null
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_email text := lower(btrim(coalesce(p_email, '')));
    v_user_id uuid;
begin
    if v_email = '' or length(v_email) > 254 then
        raise exception 'Enter a valid account email.';
    end if;
    if p_expires_at is not null and p_expires_at <= now() then
        raise exception 'The complimentary-access expiry must be in the future.';
    end if;

    select id
      into v_user_id
      from auth.users
     where lower(email) = v_email
       and email_confirmed_at is not null;

    if v_user_id is null then
        raise exception 'No confirmed Tallyo account was found for that email.';
    end if;

    insert into private.complimentary_access_grants (
        user_id,
        granted_at,
        expires_at,
        revoked_at
    ) values (
        v_user_id,
        now(),
        p_expires_at,
        null
    )
    on conflict (user_id) do update
       set granted_at = excluded.granted_at,
           expires_at = excluded.expires_at,
           revoked_at = null;

    return 'granted';
end;
$$;

create or replace function private.revoke_complimentary_access_by_email(
    p_email text
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_email text := lower(btrim(coalesce(p_email, '')));
    v_user_id uuid;
begin
    if v_email = '' or length(v_email) > 254 then
        raise exception 'Enter a valid account email.';
    end if;

    select id
      into v_user_id
      from auth.users
     where lower(email) = v_email;

    if v_user_id is null then
        raise exception 'No Tallyo account was found for that email.';
    end if;

    update private.complimentary_access_grants
       set revoked_at = now()
     where user_id = v_user_id
       and revoked_at is null
       and (expires_at is null or expires_at > now());

    if not found then
        raise exception 'That account does not have active complimentary access.';
    end if;

    return 'revoked';
end;
$$;

revoke all on function private.grant_complimentary_access_by_email(text, timestamptz)
    from public, anon, authenticated, service_role;
revoke all on function private.revoke_complimentary_access_by_email(text)
    from public, anon, authenticated, service_role;

create or replace function public.current_account_has_complimentary_access()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
    select (select auth.uid()) is not null
       and exists (
            select 1
              from private.complimentary_access_grants
             where user_id = (select auth.uid())
               and revoked_at is null
               and (expires_at is null or expires_at > now())
       );
$$;

revoke all on function public.current_account_has_complimentary_access()
    from public, anon, authenticated, service_role;
grant execute on function public.current_account_has_complimentary_access()
    to authenticated;

create or replace function private.current_account_entitlement_allows_write()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
    select
        not coalesce((
            select enabled
              from private.commercial_feature_flags
             where feature_key = 'subscription_write_enforcement'
        ), true)
        or exists (
            select 1
              from public.account_entitlements
             where user_id = (select auth.uid())
               and access_state in ('full', 'grace')
               and (effective_until is null or effective_until > now())
        )
        or exists (
            select 1
              from private.complimentary_access_grants
             where user_id = (select auth.uid())
               and revoked_at is null
               and (expires_at is null or expires_at > now())
        );
$$;

revoke all on function private.current_account_entitlement_allows_write()
    from public, anon, authenticated, service_role;
grant execute on function private.current_account_entitlement_allows_write()
    to authenticated;

create or replace function public.account_entitlement_allows_write(
    p_user_id uuid
)
returns boolean
language sql
security invoker
stable
set search_path = ''
as $$
    select
        not coalesce((
            select enabled
              from private.commercial_feature_flags
             where feature_key = 'subscription_write_enforcement'
        ), true)
        or exists (
            select 1
              from public.account_entitlements
             where user_id = p_user_id
               and access_state in ('full', 'grace')
               and (effective_until is null or effective_until > now())
        )
        or exists (
            select 1
              from private.complimentary_access_grants
             where user_id = p_user_id
               and revoked_at is null
               and (expires_at is null or expires_at > now())
        );
$$;

revoke all on function public.account_entitlement_allows_write(uuid)
    from public, anon, authenticated;
grant execute on function public.account_entitlement_allows_write(uuid)
    to service_role;

comment on table private.complimentary_access_grants is
    'Database-owner-managed complimentary Tallyo access. Stores account identity and grant lifecycle only; email remains in Supabase Auth.';
comment on function private.grant_complimentary_access_by_email(text, timestamptz) is
    'Grants complimentary access to an existing confirmed Tallyo account selected by email. Database owner only.';
comment on function private.revoke_complimentary_access_by_email(text) is
    'Revokes active complimentary access for an existing Tallyo account selected by email. Database owner only.';
comment on function public.current_account_has_complimentary_access() is
    'Returns only whether the authenticated caller currently has an active complimentary-access grant.';
comment on function private.current_account_entitlement_allows_write() is
    'Returns whether write enforcement is inactive or the authenticated account has verified paid/grace or active complimentary access.';
comment on function public.account_entitlement_allows_write(uuid) is
    'Service-role helper for verified paid/grace or active complimentary write access while preserving the private rollout gate.';
