create table private.owner_mfa_recovery_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    token_hash text not null unique
        check (token_hash ~ '^[0-9a-f]{64}$'),
    requested_at timestamptz not null default now(),
    expires_at timestamptz not null,
    confirmed_at timestamptz,
    resolved_at timestamptz,
    resolution text
        check (resolution in ('approved', 'replaced', 'delivery_failed', 'expired')),
    approved_by uuid references auth.users(id) on delete set null,
    constraint owner_mfa_recovery_expiry_check
        check (expires_at > requested_at and expires_at <= requested_at + interval '1 hour'),
    constraint owner_mfa_recovery_confirmation_check
        check (confirmed_at is null or confirmed_at >= requested_at),
    constraint owner_mfa_recovery_resolution_check
        check (
            (resolved_at is null and resolution is null and approved_by is null)
            or
            (resolved_at is not null and resolution is not null)
        ),
    constraint owner_mfa_recovery_approval_check
        check (
            (approved_by is null or resolution = 'approved')
            and
            (resolution is distinct from 'approved' or (confirmed_at is not null and approved_by is not null))
        )
);

create index owner_mfa_recovery_requests_user_requested_idx
    on private.owner_mfa_recovery_requests(user_id, requested_at desc);

alter table private.owner_mfa_recovery_requests enable row level security;

revoke all on private.owner_mfa_recovery_requests
    from public, anon, authenticated, service_role;

create or replace function public.create_owner_mfa_recovery_request(
    p_user_id uuid,
    p_token_hash text,
    p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_request_id uuid;
begin
    if p_user_id is null
       or p_token_hash is null
       or p_token_hash !~ '^[0-9a-f]{64}$'
       or p_expires_at <= now() + interval '5 minutes'
       or p_expires_at > now() + interval '1 hour' then
        raise exception 'Invalid recovery request.';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(p_user_id::text, 0)
    );

    if not exists (
        select 1
          from auth.users
         where id = p_user_id
           and email_confirmed_at is not null
    ) or not exists (
        select 1
          from auth.mfa_factors
         where user_id = p_user_id
           and status = 'verified'
    ) then
        raise exception 'Account recovery is not available.';
    end if;

    if exists (
        select 1
          from private.owner_mfa_recovery_requests
         where user_id = p_user_id
           and requested_at > now() - interval '15 minutes'
           and coalesce(resolution, '') <> 'delivery_failed'
    ) then
        raise exception 'Please wait 15 minutes before requesting another confirmation email.';
    end if;

    update private.owner_mfa_recovery_requests
       set resolved_at = now(),
           resolution = 'replaced'
     where user_id = p_user_id
       and resolved_at is null;

    insert into private.owner_mfa_recovery_requests (
        user_id,
        token_hash,
        expires_at
    ) values (
        p_user_id,
        p_token_hash,
        p_expires_at
    )
    returning id into v_request_id;

    return v_request_id;
end;
$$;

create or replace function public.cancel_owner_mfa_recovery_request(
    p_user_id uuid,
    p_request_id uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
    update private.owner_mfa_recovery_requests
       set resolved_at = now(),
           resolution = 'delivery_failed'
     where id = p_request_id
       and user_id = p_user_id
       and resolved_at is null;
$$;

create or replace function public.confirm_owner_mfa_recovery_request(
    p_user_id uuid,
    p_token_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_request private.owner_mfa_recovery_requests%rowtype;
begin
    if p_user_id is null or p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
        return 'invalid';
    end if;

    select *
      into v_request
      from private.owner_mfa_recovery_requests
     where user_id = p_user_id
       and token_hash = p_token_hash
     for update;

    if v_request.id is null or v_request.resolved_at is not null then
        return 'invalid';
    end if;

    if v_request.expires_at <= now() then
        update private.owner_mfa_recovery_requests
           set resolved_at = now(),
               resolution = 'expired'
         where id = v_request.id;
        return 'expired';
    end if;

    if v_request.confirmed_at is null then
        update private.owner_mfa_recovery_requests
           set confirmed_at = now()
         where id = v_request.id;
    end if;

    return 'confirmed';
end;
$$;

create or replace function public.owner_console_account_by_email(
    p_email text
)
returns table (
    user_id uuid,
    account_email text,
    email_confirmed boolean,
    account_created_at timestamptz,
    verified_mfa_factors integer,
    complimentary_access_active boolean,
    complimentary_access_expires_at timestamptz,
    subscription_access_state text,
    recovery_request_status text,
    recovery_requested_at timestamptz,
    recovery_expires_at timestamptz,
    recent_owner_actions jsonb
)
language sql
security definer
stable
set search_path = ''
as $$
    select
        u.id,
        u.email::text,
        u.email_confirmed_at is not null,
        u.created_at,
        (
            select count(*)::integer
              from auth.mfa_factors f
             where f.user_id = u.id
               and f.status = 'verified'
        ),
        g.user_id is not null and g.revoked_at is null and (g.expires_at is null or g.expires_at > now()),
        g.expires_at,
        (
            select e.access_state::text
              from public.account_entitlements e
             where e.user_id = u.id
             limit 1
        ),
        case
            when r.id is null then 'none'
            when r.resolved_at is not null then r.resolution
            when r.expires_at <= now() then 'expired'
            when r.confirmed_at is not null then 'confirmed'
            else 'awaiting_confirmation'
        end,
        r.requested_at,
        r.expires_at,
        coalesce((
            select jsonb_agg(jsonb_build_object(
                'event_type', history.event_type,
                'created_at', history.created_at
            ) order by history.created_at desc)
              from (
                  select a.event_type, a.created_at
                    from public.audit_events a
                   where a.user_id = u.id
                     and a.event_type in (
                         'owner_complimentary_access_granted',
                         'owner_complimentary_access_revoked',
                         'owner_password_reset_sent',
                         'owner_mfa_recovery_approved',
                         'owner_mfa_recovery_ready'
                     )
                   order by a.created_at desc
                   limit 8
              ) history
        ), '[]'::jsonb)
      from auth.users u
      left join private.complimentary_access_grants g on g.user_id = u.id
      left join lateral (
          select request.*
            from private.owner_mfa_recovery_requests request
           where request.user_id = u.id
           order by request.requested_at desc
           limit 1
      ) r on true
     where lower(u.email) = lower(btrim(coalesce(p_email, '')))
     limit 1;
$$;

create or replace function public.owner_console_grant_complimentary_access(
    p_email text,
    p_expires_at timestamptz default null
)
returns text
language sql
security definer
set search_path = ''
as $$
    select private.grant_complimentary_access_by_email(p_email, p_expires_at);
$$;

create or replace function public.owner_console_revoke_complimentary_access(
    p_email text
)
returns text
language sql
security definer
set search_path = ''
as $$
    select private.revoke_complimentary_access_by_email(p_email);
$$;

create or replace function public.owner_console_begin_mfa_recovery(
    p_user_id uuid,
    p_actor_user_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_request private.owner_mfa_recovery_requests%rowtype;
begin
    if p_user_id is null or p_actor_user_id is null or p_user_id = p_actor_user_id then
        raise exception 'Invalid recovery approval.';
    end if;

    select *
      into v_request
      from private.owner_mfa_recovery_requests
     where user_id = p_user_id
       and confirmed_at is not null
       and resolved_at is null
       and expires_at > now()
     order by requested_at desc
     limit 1
     for update;

    if v_request.id is null then
        if exists (
            select 1
              from public.mfa_recovery_state
             where user_id = p_user_id
               and recovery_required = true
        ) and exists (
            select 1
              from private.owner_mfa_recovery_requests
             where user_id = p_user_id
               and resolution = 'approved'
               and resolved_at > now() - interval '1 hour'
        ) then
            return 'resume';
        end if;
        raise exception 'No confirmed recovery request is awaiting approval.';
    end if;

    delete from public.mfa_recovery_codes
     where user_id = p_user_id;

    insert into public.mfa_recovery_state (
        user_id,
        recovery_required,
        current_generation,
        codes_generated_at,
        recovery_started_at,
        recovery_completed_at,
        failed_attempts,
        attempt_window_started_at,
        locked_until,
        generation_notice_sent_at,
        recovery_notice_sent_at,
        completion_notice_sent_at,
        updated_at
    ) values (
        p_user_id,
        true,
        null,
        null,
        now(),
        null,
        0,
        null,
        null,
        null,
        null,
        null,
        now()
    )
    on conflict (user_id) do update set
        recovery_required = true,
        current_generation = null,
        codes_generated_at = null,
        recovery_started_at = now(),
        recovery_completed_at = null,
        failed_attempts = 0,
        attempt_window_started_at = null,
        locked_until = null,
        generation_notice_sent_at = null,
        recovery_notice_sent_at = null,
        completion_notice_sent_at = null,
        updated_at = now();

    update private.owner_mfa_recovery_requests
       set resolved_at = now(),
           resolution = 'approved',
           approved_by = p_actor_user_id
     where id = v_request.id;

    insert into public.audit_events (
        user_id,
        actor_user_id,
        event_type,
        object_type,
        source,
        metadata
    ) values (
        p_user_id,
        null,
        'owner_mfa_recovery_approved',
        'account',
        'edge_function',
        jsonb_build_object('confirmation', 'registered_email')
    );

    return 'approved';
end;
$$;

revoke all on function public.create_owner_mfa_recovery_request(uuid, text, timestamptz)
    from public, anon, authenticated, service_role;
revoke all on function public.cancel_owner_mfa_recovery_request(uuid, uuid)
    from public, anon, authenticated, service_role;
revoke all on function public.confirm_owner_mfa_recovery_request(uuid, text)
    from public, anon, authenticated, service_role;
revoke all on function public.owner_console_account_by_email(text)
    from public, anon, authenticated, service_role;
revoke all on function public.owner_console_grant_complimentary_access(text, timestamptz)
    from public, anon, authenticated, service_role;
revoke all on function public.owner_console_revoke_complimentary_access(text)
    from public, anon, authenticated, service_role;
revoke all on function public.owner_console_begin_mfa_recovery(uuid, uuid)
    from public, anon, authenticated, service_role;

grant execute on function public.create_owner_mfa_recovery_request(uuid, text, timestamptz)
    to service_role;
grant execute on function public.cancel_owner_mfa_recovery_request(uuid, uuid)
    to service_role;
grant execute on function public.confirm_owner_mfa_recovery_request(uuid, text)
    to service_role;
grant execute on function public.owner_console_account_by_email(text)
    to service_role;
grant execute on function public.owner_console_grant_complimentary_access(text, timestamptz)
    to service_role;
grant execute on function public.owner_console_revoke_complimentary_access(text)
    to service_role;
grant execute on function public.owner_console_begin_mfa_recovery(uuid, uuid)
    to service_role;

comment on table private.owner_mfa_recovery_requests is
    'Minimal registered-email confirmation state for Owner-approved MFA recovery; raw confirmation tokens are never stored.';
comment on function public.owner_console_account_by_email(text) is
    'Service-only exact-email account lookup for the Tallyo Owner Console. Returns no business records.';
comment on function public.owner_console_begin_mfa_recovery(uuid, uuid) is
    'Service-only transition into the existing forced MFA re-enrolment state after registered-email confirmation.';
