create table private.commercial_feature_flags (
    feature_key text primary key
        check (feature_key = 'subscription_write_enforcement'),
    enabled boolean not null default false,
    updated_at timestamptz not null default now()
);

insert into private.commercial_feature_flags (feature_key, enabled)
values ('subscription_write_enforcement', false);

revoke all on private.commercial_feature_flags
    from public, anon, authenticated, service_role;
grant select on private.commercial_feature_flags to service_role;

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
               and (
                   effective_until is null
                   or effective_until > now()
               )
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
               and (
                   effective_until is null
                   or effective_until > now()
               )
        );
$$;

revoke all on function public.account_entitlement_allows_write(uuid)
    from public, anon, authenticated;
grant execute on function public.account_entitlement_allows_write(uuid)
    to service_role;

alter policy "own company_settings - insert" on public.company_settings
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own company_settings - update" on public.company_settings
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    )
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own company_settings - delete" on public.company_settings
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );

alter policy "own customers - insert" on public.customers
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own customers - update" on public.customers
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    )
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own customers - delete" on public.customers
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );

alter policy "own saved_items - insert" on public.saved_items
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own saved_items - update" on public.saved_items
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    )
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own saved_items - delete" on public.saved_items
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );

alter policy "own invoices - insert" on public.invoices
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own invoices - update" on public.invoices
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    )
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own invoices - delete" on public.invoices
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );

alter policy "own recurring - insert" on public.recurring_templates
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own recurring - update" on public.recurring_templates
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    )
    with check (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );
alter policy "own recurring - delete" on public.recurring_templates
    using (
        (select auth.uid()) = user_id
        and (select private.current_account_entitlement_allows_write())
    );

comment on function private.current_account_entitlement_allows_write() is
    'Returns whether subscription enforcement is inactive or the authenticated account has a verified full or grace entitlement. Used by core write RLS policies without exposing another account identifier.';

comment on table private.commercial_feature_flags is
    'Private server-only commercial rollout gates. Subscription write enforcement defaults off and requires an explicit production activation.';
