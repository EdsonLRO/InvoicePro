\set ON_ERROR_STOP on

update public.invoices
   set quote_auto_send_invoice = true,
       quote_auto_send_due_days = 14,
       quote_auto_send_recipient = 'fictional-recipient@example.invalid'
 where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
begin
    assert (
        select quote_auto_send_invoice
           and quote_auto_send_due_days = 14
           and quote_auto_send_recipient = 'fictional-recipient@example.invalid'
          from public.invoices
         where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
    ), 'server could not save the pre-acceptance automatic-delivery choice';

    begin
        update public.invoices
           set quote_auto_send_recipient = 'changed@example.invalid'
         where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
        raise exception 'browser changed the stored automatic-delivery recipient';
    exception when raise_exception then
        if sqlerrm = 'browser changed the stored automatic-delivery recipient' then raise; end if;
    end;

    begin
        update public.invoices
           set quote_auto_send_status = 'sending',
               quote_auto_send_attempted_at = now()
         where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
        raise exception 'browser changed server-managed automatic-delivery state';
    exception when raise_exception then
        if sqlerrm = 'browser changed server-managed automatic-delivery state' then raise; end if;
    end;

    begin
        update public.invoices
           set quote_auto_send_invoice = true,
               quote_auto_send_due_days = 14
         where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
        raise exception 'browser changed an accepted quote';
    exception when raise_exception then
        if sqlerrm = 'browser changed an accepted quote' then raise; end if;
    end;
end;
$$;

reset role;

do $$
begin
    begin
        update public.invoices
           set quote_auto_send_invoice = false,
               quote_auto_send_due_days = 14,
               quote_auto_send_recipient = null
         where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
        raise exception 'invalid disabled automatic-delivery settings were accepted';
    exception when check_violation then
        null;
    end;

    update public.invoices
       set quote_auto_send_invoice = true,
           quote_auto_send_due_days = 14,
           quote_auto_send_recipient = 'fictional-recipient@example.invalid',
           quote_auto_send_status = 'sending',
           quote_auto_send_attempted_at = now(),
           quote_auto_send_sent_at = null
     where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';

    update public.invoices
       set quote_auto_send_status = 'sent',
           quote_auto_send_sent_at = now()
     where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';

    assert (
        select quote_auto_send_status = 'sent'
           and quote_auto_send_attempted_at is not null
           and quote_auto_send_sent_at is not null
          from public.invoices
         where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
    ), 'server-managed delivery lifecycle could not reach sent';

    assert not has_function_privilege(
        'authenticated', 'public.protect_quote_acceptance_fields()', 'execute'
    ), 'authenticated can execute the protected-field trigger function';
    assert not has_function_privilege(
        'service_role', 'public.protect_quote_acceptance_fields()', 'execute'
    ), 'service_role can execute the protected-field trigger function directly';
end;
$$;

select 'Quote automatic invoice delivery database probes passed.' as result;
