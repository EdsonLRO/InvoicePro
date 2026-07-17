alter function public.handle_new_user()
    set search_path = '';

revoke execute on function public.handle_new_user()
    from public, anon, authenticated;

alter function public.prevent_audit_event_mutation()
    set search_path = '';

revoke execute on function public.prevent_audit_event_mutation()
    from public, anon, authenticated;;
