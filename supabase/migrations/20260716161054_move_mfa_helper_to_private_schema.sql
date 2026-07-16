-- Keep the RLS helper outside the exposed Data API schema.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.current_user_has_verified_mfa()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from auth.mfa_factors
        where user_id = auth.uid()
          and status = 'verified'
    );
$$;

revoke all on function private.current_user_has_verified_mfa()
    from public, anon, authenticated;
grant execute on function private.current_user_has_verified_mfa()
    to authenticated, service_role;

do $$
declare
    tenant_table text;
begin
    foreach tenant_table in array array[
        'company_settings',
        'customers',
        'saved_items',
        'invoices',
        'recurring_templates',
        'audit_events'
    ] loop
        execute format($policy$
            alter policy %I on public.%I
            using (
                not (select private.current_user_has_verified_mfa())
                or ((select auth.jwt())->>'aal') = 'aal2'
            )
            with check (
                not (select private.current_user_has_verified_mfa())
                or ((select auth.jwt())->>'aal') = 'aal2'
            )
        $policy$, 'MFA assurance required for opted-in accounts', tenant_table);
    end loop;
end;
$$;

drop function public.current_user_has_verified_mfa();

comment on function private.current_user_has_verified_mfa() is
    'Returns whether the authenticated caller has a verified MFA factor without exposing auth schema rows.';
