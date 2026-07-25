create or replace function private.current_account_entitlement_allows_write()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
    select exists (
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
    'Returns whether the authenticated account has a verified full or grace entitlement. Used by core write RLS policies without exposing another account identifier.';
