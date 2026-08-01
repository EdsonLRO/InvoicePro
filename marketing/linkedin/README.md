# Tallyo LinkedIn campaign

Six standalone organic LinkedIn posts, backed by a complete 26-image promotional
library. Every graphic uses one real Tallyo product screenshot, the exact
repository wordmark and the website's Inter font stack. Nothing in this folder
publishes content or connects to LinkedIn.

Suggested cadence: two posts per week for three weeks, in the numbered order.

## 01 — Free Invoice Maker

**Image:** `assets/01-free-invoice-maker.png`

Not every invoice needs another account or subscription.

Tallyo's Free Invoice Maker lets you create an invoice or quote directly in
your browser, preview the finished document and download it as a PDF.

No account required. No payment card required.

Try it here: https://tallyo.co.uk/free-invoice-generator/

#Invoicing #SmallBusiness #SoleTrader

**Alt text:** Tallyo's free invoice maker displayed beside a live invoice
preview, with the message that no account is required.

## 02 — Dashboard clarity

**Image:** `assets/02-dashboard-clarity.png`

What's outstanding? What's overdue? What has been paid?

Tallyo's dashboard gives you a quick view of the figures that matter,
including an ageing breakdown of outstanding balances.

Less searching through documents. A clearer starting point for your day.

See the features: https://tallyo.co.uk/features/

#CashFlow #Invoicing #SmallBusinessUK

**Alt text:** Tallyo dashboard showing fictional outstanding, overdue, paid
and draft invoice totals.

## 03 — Create invoices

**Image:** `assets/03-create-invoices.png`

Creating an invoice shouldn't turn into a long admin session.

With Tallyo, you can select a saved customer, add line items, choose how tax
is handled and see the total clearly before saving.

Invoices, quotes and credit notes stay together in one practical workspace.

Explore Tallyo: https://tallyo.co.uk/product-tour/

#InvoiceSoftware #Freelancers #UKBusiness

**Alt text:** Tallyo's invoice editor showing clearly fictional customer
details, one item and the invoice total.

## 04 — Saved items

**Image:** `assets/04-saved-items.png`

The fastest invoice is the one you don't have to type from scratch.

Save the products and services you use regularly, including their default
prices, then reuse them on future documents.

It's a small feature that can remove a lot of repetitive work.

Learn more: https://tallyo.co.uk/features/

#Productivity #SmallBusinessTools #Invoicing

**Alt text:** Tallyo's saved-items screen showing two fictional sample items
and their default prices.

## 05 — Recurring invoices

**Image:** `assets/05-recurring-invoices.png`

Recurring work shouldn't create recurring admin.

Turn a saved invoice into a recurring schedule, choose when the next invoice
should be created and decide whether generated invoices should be emailed
automatically.

You stay in control and can pause or manage the schedule whenever needed.

Explore recurring invoices: https://tallyo.co.uk/help/recurring-invoices/

#RecurringInvoices #Automation #FreelanceBusiness

**Alt text:** Tallyo recurring-invoice settings showing a monthly schedule and
the optional automatic-email setting.

## 06 — Optional online payments

**Image:** `assets/06-optional-online-payments.png`

Card payment should be an option, not something forced onto every invoice.

When a business connects its Stripe account, Tallyo can optionally include
online payment for the full outstanding balance or a predefined deposit.

Payment status and the remaining balance stay with the invoice. Stripe
processing fees may apply.

See how Tallyo works: https://tallyo.co.uk/features/

#OnlinePayments #Stripe #InvoiceManagement

**Alt text:** Tallyo payment panel showing a fictional recorded payment,
outstanding balance and the optional full-balance card-payment choice.

## Rendering

Run `render.mjs` with Node.js, Playwright available on `NODE_PATH`, and a local
Chrome installation. The script produces deterministic 1200 by 1200 PNGs from
the exact wordmark and screenshot sources; it does not call any external API.

The six curated launch images are written to `marketing/linkedin/assets`. The
complete library is written beside the source screenshots in
`website/public/assets/App Screenshots/LinkedIn Promos`. Source screenshots are
never overwritten.
