# Tallyo Overview — desktop design reference

Design only. No production UI, behaviour, configuration or provider change.

`desktop-overview.png` is a 3200 × 2240 PNG rendered at 2× from a 1600 × 1120 desktop layout. Editable source: `desktop-overview.html`; local renderer: `render-overview.cjs`. The renderer uses bundled Playwright and Lucide, blocks all HTTP requests and does not load Tallyo application scripts.

The live app HTML and current dashboard source were inspected before design. This concept keeps the unmodified official `tallyo-wordmark-white.png`, system sans typography, #0f172a navy, #4f46e5 indigo, white surfaces and restrained slate borders. No generated logo or replacement wordmark is used.

Design priorities: grouped navigation, a global New action, four compact KPIs, a dominant four-row attention queue with one action each, six concise activity events, and one decision-oriented ageing visual. Fictional GBP data reconciles: £5,000 not due + £1,250 + £590 overdue = £6,840 outstanding.

The setup card is explicitly labelled a first-run preview: it demonstrates the new-account variant alongside an established-account overview, not an assertion that the fictional business is simultaneously new and established. It would appear contextually for new accounts, not as a mandatory wizard. A business/workspace label is context only, not a proposal for multi-business switching.

All account, customer, document, payment and activity values are fictional. Quote acceptance and automatic accepted-quote conversion are included as requested design examples; their production availability was not established from the inspected dashboard source. The mockup does not implement or certify these workflows. The global New menu, grouped navigation, action aggregation, recurring-week metric and setup card are proposed interface elements only.

No live email, analytics, payment, account lookup or database request is made by this reference. Review the design before any production implementation. No deployment is authorised by this artifact.

## Invoice editor reference

`desktop-invoice-editor.png` is an individual 3200 × 2240 reference, with editable source in `desktop-invoice-editor.html` and a reproducible local renderer in `render-invoice-editor.cjs`. `desktop-invoice-editor-more.png` shows the open More menu separately so it does not obscure the editor. The same untouched official wordmark, typography and navigation family are retained.

Inspected the actual editor in `index.html`: document header/status/currency, customer context, reusable item suggestions, custom units and hours/minutes, row discounts, exclusive/inclusive tax, global discount and shipping, terms and company payment details, recurring and reminder settings, manual/provider payment records, full-balance/deposit selection and optional payment inclusion in the email flow.

Design mapping:

- Customer, document details, items, payment terms and notes form one clear editing surface; printable branding stays in Preview.
- Row options retain discounts, saving a product/service and removal; unit details retain custom units and hours/minutes. Global discounts/shipping and tax mode are progressively disclosed rather than removed.
- The right rail provides stable summary, payment, automation and document-activity context. Manual payment recording remains available; payment-history details, provider refunds and dispute attention must remain conditional on the underlying records in a future implementation.
- Online payment remains off by default. Configure retains both full outstanding balance and a valid predefined deposit, with fees disclosed. Save & send is a proposed entry to the existing recipient/payment review, not permission to send immediately or create a Checkout object.
- Draft, Sent and Cancelled are the proposed user-controlled states. Partially paid/Paid derive from payment records; Overdue derives from eligibility, unpaid balance and due date. This changes no existing production status logic. A last-saved indicator does not introduce autosave.
- The unpaid draft More menu contains Duplicate, Download PDF and Delete draft. Cancel belongs to an eligible issued invoice; Issue credit must not imply automatic reconciliation, since the inspected editor explicitly warns that credit notes are standalone. Eligibility needs review before implementation.
- This independent fictional draft is not the overdue invoice in the Overview sample. All names and values are fictional; the only customer email uses the reserved `.example` domain. No real account, bank or provider identifiers are included.

Validation: rendered and visually inspected at 1600 × 1120, 2× pixel density; official logo loaded; 46 icons rendered; two lines and four rail sections; no horizontal text clipping, page errors or external requests. Amounts reconcile: 8 × £95 + £240 = £1,000 subtotal; 20% tax = £200; line totals £912 + £288 = £1,200; paid £0; balance £1,200. No production files or behaviour changed.

## Accepted quote reference

`desktop-accepted-quote.png` is the individual 3200 × 2240 desktop reference. Editable source: `desktop-accepted-quote.html`; isolated renderer: `render-accepted-quote.cjs`.

Inspected the existing quote header, `convertToInvoice` and Activity History in `index.html`. The current conversion changes the quote record in place. This design deliberately shows the requested future workflow instead: preserve QUO-0217 as Accepted, capture Sarah Jones's customer-confirmed name and a server-side acceptance timestamp, create a separate INV-1048 automatically, link both records and record acceptance and invoice creation as separate Activity History events. There is no manual conversion action. The invoice is depicted as a draft, not automatically emailed or paid; its £6,800 total matches the preserved quote. The three useful primary actions are View invoice, Download quote and Send copy.

The screen is a static proposal, not evidence that acceptance, server-side timestamps, quote-page view recording or automatic separate-record invoice creation exist today. Customer-confirmed name is not presented as verified identity. Precise fictional activity timestamps are chronological, displayed explicitly in BST (UTC+1), with acceptance at 2026-09-11T18:42:16Z and creation one second later. Production implementation, privacy implications and retry/idempotency handling require separate review; no workflow, schema, provider, tracking or email change is made here.

Validation: official logo retained; 36 icons; five chronological events; two related documents; no manual conversion button, horizontal text clipping, overflowing panels, page errors or external requests. Quote scope reconciles: £3,200 + £2,400 + £1,200 = £6,800, with £0 example tax. All records, people and amounts are fictional. Visual QA includes the complete related-document note and preserved-quote statement.

## Customer detail reference

`desktop-customer-detail.png` is the individual 3200 × 2080 desktop reference, rendered at 2× from 1600 × 1040. Editable source: `desktop-customer-detail.html`; local renderer: `render-customer-detail.cjs`.

Inspected the current customer form and list in `index.html`: name/company, address, phone, mobile, email, tax ID and additional information. The proposed detail page surfaces only name and contact information; Edit customer retains access to the other existing fields. It adds no CRM fields, lead stages, pipelines, tasks, campaigns, opportunities or notes system.

The page contains three summary figures, four recent document links, four customer-only activity updates and one compact active recurring schedule. Each document identifier has a distinct illustrative local fragment, not a production route. The screenshot does not implement navigation or record lookup. Quote acceptance and automatic linked-invoice creation are proposed-workflow examples, not claims about current production capability.

This is an independent fictional scenario using the requested £240 overdue invoice, £380 paid invoice and £800 accepted quote. A fourth document, the £800 generated draft invoice, keeps the proposed acceptance workflow explicit. Document count is 3 invoices + 1 preserved quote; outstanding is £240, excluding drafts and quotes; paid is £380. These sample amounts/dates are intentionally not the same records as the separate accepted-quote and editor mockups. The email uses `.example`, the phone is illustrative and the address is explicitly fictional. No customer account or production data was read.

Validation: official logo loaded; three KPIs, four distinct document links, four activity entries, one recurring schedule; no horizontal clipping, panel overflow, page errors or external requests. Visually checked at full desktop layout, including the activity-footer spacing. No production files, behaviour or CRM functionality changed.

## Mobile Overview reference

`mobile-overview.png` is a 780 × 1688 screenshot rendered at 2× from an actual 390 × 844 mobile viewport with touch emulation, not a scaled desktop screen or a device-frame composite. Editable source: `mobile-overview.html`; renderer: `render-mobile-overview.cjs`.

Inspected the existing viewport, responsive navigation and mobile rules in `index.html`. The proposal replaces the desktop sidebar with Overview / Documents / New / Customers / More bottom navigation. It retains the exact official wordmark and established navy/indigo/slate palette. Four full-width, 46px summary rows replace tiny KPI tiles. One prioritised overdue-invoice card has a 44px full-width Send reminder action; the latest two activity entries have a View all route. Other outstanding records are not all shown in this compact preview. Values and names are fictional, independent of the desktop examples.

The central + opens an isolated local New menu (Invoice, Quote, Credit note, Customer), with close and Escape handling. All other controls are visual references only: no navigation to production, data access, sending, tracking or mutations. No production navigation or app behaviour is changed.

Validation: genuine 390px layout; official logo loaded; four summary rows; two activity items; all visible buttons at least 44 × 44 CSS pixels; no clipped text or horizontal scrolling at 360px and 390px; activity above the bottom navigation at 390 × 844; New menu opens and closes; no page errors or external requests. The final phone-sized export was visually inspected.

## Mobile Documents reference

`mobile-documents.png` is the individual 780 × 1720 screenshot from a true 390 × 860 touch-enabled viewport at 2×. Editable source: `mobile-documents.html`; renderer: `render-mobile-documents.cjs`.

Inspected the current document search, type/status/sort filters and wide invoice table in `index.html`. This proposal replaces that table with four full-card document links, clear Invoice/Quote labels, consistent amount/status placement, and a separate 44px overflow control. The overdue record includes its due date, age and delivered-email status. Search and All/Draft/Sent/Paid/Overdue filters are compact; accepted quotes remain visible under All. Additional existing type/status/sort/export/bulk capabilities are not implemented or removed by this reference; their secondary placement would need consideration during implementation.

Navigation matches the mobile Overview, with Documents selected and a central + opening the local New menu. Whole-card links use distinct illustrative local fragments, not production routes or implemented document views. Search/status filtering, overflow and New-menu previews operate only on the four fictional records embedded in this file. No email, PDF export, duplication or record creation occurs when previewing these menus. Accepted-quote status remains a proposed-workflow example, not a production assertion.

Validation: four cards, zero tables, four unique document-link targets; all visible buttons, links and search input at least 44 × 44 CSS pixels; no text clipping or horizontal scrolling at 360px and 390px; all cards visible above navigation at the reference viewport. Local search, Overdue filter, overflow and New-menu checks pass. Official logo loaded; no page errors or external requests. Production files and behaviour unchanged.

## Section-based mobile invoice editor exploration

`mobile-invoice-editor-sections.png` is the individual 780 × 1880 reference rendered at 2× from a real 390 × 940 touch-enabled viewport. Editable source: `mobile-invoice-editor-sections.html`; renderer: `render-mobile-invoice-sections.cjs`.

The six section entry points are Customer, Invoice details, Items, Payment, Automation and Notes. Each summarises its state and has a chevron and a full-card touch target. No desktop table or long field form is rendered. The total, paid amount and balance are visible above the sticky Preview / Save & send bar. More holds only suitable draft secondary actions. Section editors and saving/sending are deliberately not implemented; only the local More-menu preview opens and closes.

The screenshot follows the supplied independent sample: three items, £1,250 subtotal, £250 example tax, £1,500 total/balance and £0 paid. The supplied customer email is displayed as illustrative content only; its ownership is not asserted and no communication or lookup occurs. Online payment enabled depicts an explicit opt-in for this example, not a new default; the requested full balance is visible. A future Payment section must retain full/deposit choice, deposit validation, payment terms, bank instructions and fee information; final sending must preserve recipient and payment-option review. Friendly is the requested proposed reminder label, not evidence of an existing selectable tone feature. The existing source exposes reminder timing rather than a tone selector. Last saved and Ready to review are static demo states, not implemented autosave or validation promises.

Assessment: preferable as a mobile starting point because it provides an immediately scannable document outline and reduces simultaneous controls. This is a design judgement, not user-test evidence. Key concerns are extra navigation taps, validation errors hidden inside sections, preserving edits and scroll position when returning, explaining the two dates, and a keyboard-safe action bar. Future section screens should show actionable error badges on the overview, preserve pending edits, label issue/due dates explicitly and keep payment/recipient review before actual sending. Users making many line-item changes may prefer a dedicated Items editor; the overview must not restrict existing units, tax and discount capabilities.

Validation: six sections, zero tables, all visible buttons at least 44 × 44 CSS pixels; no clipped text or horizontal scrolling at 360px/390px; the summary remains reachable above the sticky action bar at 844px height after scrolling. The primary screenshot shows all sections and totals. More opens and closes. Official logo loaded, no external requests or page errors; totals reconcile. Production UI and behaviour remain untouched.

## Mobile item editor reference

`mobile-edit-items.png` is the individual 780 × 1880 reference rendered from a true 390 × 940 touch-enabled viewport at 2×. Editable source: `mobile-edit-items.html`; renderer: `render-mobile-edit-items.cjs`.

Inspected the current item table, reusable-item suggestions, quantity/custom-unit/hour controls, price, row discount, tax and calculated line totals in `index.html`. This exploration replaces table columns with one expanded item card at a time. Description stays full-width; quantity, unit and price share a labelled compact row; tax and the line total sit below. Row discount and Remove stay secondary. The second card exposes a useful quantity/price/tax summary and expands on tap. Add item and Add from Products & services remain distinct, full-width touch actions; Done stays in a sticky footer.

The Service unit illustrates the existing custom-unit capability. Descriptive card headings are illustrative product labels, not a new persisted database field. Future implementation must preserve hours/minutes, other units, inclusive/exclusive tax, discounts and item reuse. Keyboard behaviour, long descriptions, validation and an undo/confirmation for removal need real-device testing. Done should return to the section overview without sending the invoice; Back must not silently discard edits.

This is a two-item independent fictional example: £800 + £200 subtotal = £1,000; 20% tax = £200; line totals £960 + £240 = £1,200. It is not the three-item £1,500 example in the section overview. The screenshot uses initial static totals; typing in the illustrative inputs does not implement recalculation, saving, removal, product lookup or invoice edits. Only the local accordion interaction is wired. No production code or data is used.

Validation: two cards, one expanded; zero tables; all visible controls at least 44 × 44 CSS pixels; no clipped text or horizontal scrolling at 360px/390px. Opening the second item closes the first; totals remain accessible above Done on an 844px-tall screen after scrolling. Official logo loaded, no page errors or external requests. Visually checked at full mobile resolution.

## Customer-facing mobile quote acceptance

`mobile-customer-quote-acceptance.png` shows the customer approval form; `mobile-customer-quote-accepted.png` separately shows the completed state. Both are individual 780 × 1800 screenshots from a true 390 × 900 mobile viewport at 2×. Source: `mobile-customer-quote-acceptance.html`; renderer: `render-mobile-customer-quote.cjs`.

This is deliberately not the authenticated admin interface: no sidebar, bottom app navigation, owner account controls or global New menu. Fictional North & Stone branding leads the page, with a simple sample N&S text monogram; the unmodified official Tallyo wordmark appears in a restrained Powered by footer. The supplied bathroom-refurbishment quote, Sarah Jones, £6,800 total, scope and expiry are clearly visible. The acceptance explanation uses the exact short wording supplied by the Owner. Name confirmation, Accept quote, Decline quote and Download PDF are shown without heavy terms or unsupported security badges.

The separate success screenshot removes the form/decision actions, marks the quote Accepted, shows Sarah Jones and the fictional acceptance timestamp, and provides a link to INV-1048. It explicitly distinguishes acceptance/invoice creation from taking payment. The renderer selects this static state locally; no actual acceptance handler, request, invoice generation, payment, download or email exists. A future implementation must use a server-recorded timestamp, preserve the original quote, create/link the invoice once, and record the two events, as described in the accepted-quote reference. Name confirmation is not verified identity. The sample View invoice target is only a local fragment.

Validation: official Tallyo logo loaded; zero admin navigation; all visible form controls at least 44 × 44 CSS pixels; no text clipping or horizontal overflow at 390px or 360px in either state. Success state replaces the form and contains the invoice route. All three scope amounts sum to £6,800. Both complete screenshots were visually inspected, including business header and Tallyo footer. No external requests, page errors or production changes.
