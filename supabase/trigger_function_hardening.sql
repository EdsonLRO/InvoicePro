-- SEC-DB-001: keep internal trigger helpers out of the API execution surface.
-- Both function bodies use schema-qualified objects or no database objects, so
-- an empty search path is safe and removes mutable object-resolution risk.

alter function public.handle_new_user()
    set search_path = '';

revoke execute on function public.handle_new_user()
    from public, anon, authenticated;

alter function public.prevent_audit_event_mutation()
    set search_path = '';

revoke execute on function public.prevent_audit_event_mutation()
    from public, anon, authenticated;
