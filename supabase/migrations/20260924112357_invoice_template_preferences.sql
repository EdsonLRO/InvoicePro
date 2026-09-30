alter table public.company_settings
  add column if not exists invoice_template text not null default 'tallyo',
  add column if not exists alternate_item_rows boolean not null default true;

alter table public.company_settings
  drop constraint if exists company_settings_invoice_template_check;

alter table public.company_settings
  add constraint company_settings_invoice_template_check
  check (invoice_template in ('tallyo', 'basic', 'modern', 'professional'));

comment on column public.company_settings.invoice_template is
  'Business-wide document layout used for invoices, quotes and credit notes.';

comment on column public.company_settings.alternate_item_rows is
  'Whether document line items use alternating white and tinted row backgrounds.';
