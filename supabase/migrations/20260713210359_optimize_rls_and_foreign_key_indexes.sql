create index if not exists audit_events_actor_user_id_idx
    on public.audit_events(actor_user_id);

create index if not exists invoices_customer_id_idx
    on public.invoices(customer_id);

alter policy "own audit_events - select" on public.audit_events
    using ((select auth.uid()) = user_id);

alter policy "own company_settings - select" on public.company_settings
    using ((select auth.uid()) = user_id);
alter policy "own company_settings - insert" on public.company_settings
    with check ((select auth.uid()) = user_id);
alter policy "own company_settings - update" on public.company_settings
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
alter policy "own company_settings - delete" on public.company_settings
    using ((select auth.uid()) = user_id);

alter policy "own customers - select" on public.customers
    using ((select auth.uid()) = user_id);
alter policy "own customers - insert" on public.customers
    with check ((select auth.uid()) = user_id);
alter policy "own customers - update" on public.customers
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
alter policy "own customers - delete" on public.customers
    using ((select auth.uid()) = user_id);

alter policy "own saved_items - select" on public.saved_items
    using ((select auth.uid()) = user_id);
alter policy "own saved_items - insert" on public.saved_items
    with check ((select auth.uid()) = user_id);
alter policy "own saved_items - update" on public.saved_items
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
alter policy "own saved_items - delete" on public.saved_items
    using ((select auth.uid()) = user_id);

alter policy "own invoices - select" on public.invoices
    using ((select auth.uid()) = user_id);
alter policy "own invoices - insert" on public.invoices
    with check ((select auth.uid()) = user_id);
alter policy "own invoices - update" on public.invoices
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
alter policy "own invoices - delete" on public.invoices
    using ((select auth.uid()) = user_id);

alter policy "own recurring - select" on public.recurring_templates
    using ((select auth.uid()) = user_id);
alter policy "own recurring - insert" on public.recurring_templates
    with check ((select auth.uid()) = user_id);
alter policy "own recurring - update" on public.recurring_templates
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
alter policy "own recurring - delete" on public.recurring_templates
    using ((select auth.uid()) = user_id);;
