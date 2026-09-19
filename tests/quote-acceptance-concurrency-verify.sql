\set ON_ERROR_STOP on

do $$
begin
    assert (
        select count(*) = 1
          from public.invoices
         where source_quote_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6'
    ), 'concurrent acceptance created duplicate invoices';

    assert (
        select count(*) = 1
          from public.audit_events
         where event_type = 'quote_accepted'
           and object_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6'
    ), 'concurrent acceptance created duplicate acceptance audits';

    assert (
        select quote_response = 'accepted'
           and quote_response_name = 'Concurrent Test'
           and quote_responded_at is not null
          from public.invoices
         where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6'
    ), 'concurrent acceptance did not preserve the confirmed response';
end;
$$;

select 'Quote acceptance concurrency probe passed.' as result;
