\set ON_ERROR_STOP on

insert into auth.users (id) values
    ('11111111-1111-4111-8111-111111111111'),
    ('22222222-2222-4222-8222-222222222222');

insert into public.company_settings (user_id, name, invoice_prefix)
values
    ('11111111-1111-4111-8111-111111111111', 'North & Stone (fictional)', 'INV-'),
    ('22222222-2222-4222-8222-222222222222', 'Other business (fictional)', 'INV-');

insert into public.invoices (
    id, user_id, doc_type, number, status, issue_date, due_date, currency,
    customer_snapshot, items, grand_total,
    quote_access_token_hash, quote_access_created_at,
    quote_access_expires_at, quote_link_version
) values
(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '11111111-1111-4111-8111-111111111111',
    'quote', 'QUO-0217', 'Sent', current_date, current_date + 10, 'GBP',
    '{"name":"Willow & Pine Studio (fictional)"}',
    '[{"name":"Website design","qty":1,"price":1000,"tax":20}]',
    1200,
    repeat('a', 64), now(), now() + interval '10 days', 1
),
(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '11111111-1111-4111-8111-111111111111',
    'quote', 'QUO-0218', 'Sent', current_date, current_date + 10, 'GBP',
    '{"name":"Decline example (fictional)"}', '[]', 100,
    repeat('b', 64), now(), now() + interval '10 days', 1
),
(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '11111111-1111-4111-8111-111111111111',
    'quote', 'QUO-0219', 'Sent', current_date, current_date + 10, 'GBP',
    '{"name":"Edit example (fictional)"}', '[]', 100,
    repeat('c', 64), now(), now() + interval '10 days', 1
),
(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    '22222222-2222-4222-8222-222222222222',
    'quote', 'QUO-0001', 'Sent', current_date, current_date + 10, 'GBP',
    '{"name":"Other tenant (fictional)"}', '[]', 100,
    repeat('d', 64), now(), now() + interval '10 days', 1
),
(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    '11111111-1111-4111-8111-111111111111',
    'quote', 'QUO-0220', 'Sent', current_date, current_date + 10, 'GBP',
    '{"name":"Rollback example (fictional)"}', '[]', 100,
    repeat('e', 64), now(), now() + interval '10 days', 1
),
(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
    '11111111-1111-4111-8111-111111111111',
    'quote', 'QUO-0221', 'Sent', current_date, current_date + 10, 'GBP',
    '{"name":"Concurrent acceptance example (fictional)"}', '[]', 250,
    repeat('f', 64), now(), now() + interval '10 days', 1
);

do $$
declare
    v_result jsonb;
    v_repeat jsonb;
    v_invoice public.invoices%rowtype;
begin
    assert not has_function_privilege(
        'anon', 'public.quote_public_action(text,text,text)', 'execute'
    ), 'anon can execute quote_public_action';
    assert not has_function_privilege(
        'authenticated', 'public.quote_public_action(text,text,text)', 'execute'
    ), 'authenticated can execute quote_public_action';
    assert has_function_privilege(
        'service_role', 'public.quote_public_action(text,text,text)', 'execute'
    ), 'service_role cannot execute quote_public_action';

    -- The exact function privilege is checked above. The disposable database
    -- owner invokes it here so the probe can inspect the resulting rows.
    select public.quote_public_action(repeat('a', 64), 'view', null)
      into v_result;
    assert v_result->>'state' = 'active', 'active quote could not be viewed';

    select public.quote_public_action(repeat('a', 64), 'accept', ' Sarah Jones ')
      into v_result;
    assert v_result->>'state' = 'accepted', 'quote was not accepted';
    assert v_result->'invoice'->>'number' = 'INV-0001', 'invoice number was not allocated';

    select * into v_invoice from public.invoices
     where source_quote_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
    assert found, 'linked invoice was not created';
    assert v_invoice.status = 'Draft', 'linked invoice is not Draft';
    assert v_invoice.due_date is null, 'linked invoice has an automatic due date';
    assert v_invoice.payments = '[]'::jsonb, 'linked invoice copied payments';
    assert not v_invoice.overdue_reminders_enabled, 'linked invoice enabled reminders';
    assert v_invoice.grand_total = 1200, 'linked invoice total changed';

    select public.quote_public_action(repeat('a', 64), 'accept', 'Different Name')
      into v_repeat;
    assert v_repeat->'invoice'->>'number' = 'INV-0001', 'accept replay changed invoice';
    assert (select count(*) from public.invoices
             where source_quote_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1') = 1,
           'accept replay created a duplicate invoice';
    assert (select quote_response_name from public.invoices
             where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1') = 'Sarah Jones',
           'accept replay changed confirmed name';
    assert (select count(*) from public.audit_events
             where event_type = 'quote_accepted') = 1,
           'accept replay duplicated acceptance audit';

    select public.quote_public_action(repeat('b', 64), 'decline', null)
      into v_result;
    assert v_result->>'state' = 'declined', 'quote was not declined';
    assert not exists (
        select 1 from public.invoices
         where source_quote_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
    ), 'decline created an invoice';
end;
$$;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
begin
    begin
        update public.invoices
           set quote_response = 'accepted',
               quote_response_name = 'Browser change',
               quote_responded_at = now(),
               status = 'Accepted'
         where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
        raise exception 'browser changed server-owned response fields';
    exception when raise_exception then
        if sqlerrm = 'browser changed server-owned response fields' then raise; end if;
    end;

    update public.invoices
       set notes = 'Owner edited quote'
     where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
    assert (select quote_access_token_hash is null from public.invoices
             where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'),
           'quote edit did not invalidate token';
    assert (select quote_access_version = 2 from public.invoices
             where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'),
           'quote edit did not advance version';

    begin
        update public.invoices set notes = 'Changed after acceptance'
         where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
        raise exception 'browser edited responded quote';
    exception when raise_exception then
        if sqlerrm = 'browser edited responded quote' then raise; end if;
    end;

    begin
        delete from public.invoices
         where source_quote_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
        raise exception 'browser deleted linked invoice';
    exception when raise_exception then
        if sqlerrm = 'browser deleted linked invoice' then raise; end if;
    end;

    update public.invoices set notes = 'Cross-tenant attempt'
     where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4';
    assert not found, 'RLS allowed a cross-tenant update';
end;
$$;

reset role;

do $$
begin
    begin
        insert into public.invoices (
            user_id, doc_type, number, status, source_quote_id
        ) values (
            '11111111-1111-4111-8111-111111111111',
            'invoice', 'INV-CROSS', 'Draft',
            'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4'
        );
        raise exception 'cross-owner source quote was accepted';
    exception when foreign_key_violation then
        null;
    end;
end;
$$;

alter table public.audit_events
    add constraint quote_acceptance_rollback_probe
    check (event_type <> 'quote_accepted') not valid;

do $$
begin
    begin
        perform public.quote_public_action(repeat('e', 64), 'accept', 'Rollback Test');
        raise exception 'forced audit failure did not abort acceptance';
    exception when check_violation then
        null;
    end;
    assert (select quote_response is null from public.invoices
             where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'),
           'failed transaction persisted the response';
    assert not exists (
        select 1 from public.invoices
         where source_quote_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'
    ), 'failed transaction persisted an invoice';
end;
$$;

alter table public.audit_events
    drop constraint quote_acceptance_rollback_probe;

select 'Quote acceptance database probes passed.' as result;
