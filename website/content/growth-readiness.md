# Growth readiness — inactive foundation

This document prepares future work. It does not authorise tracking, advertising,
spend, price publication, public launch or provider configuration.

## Funnel and stable conversions

The intended funnel is acquisition → useful public content or free tool → account
CTA → signup → verified first use → first customer/document → repeat active use.
The authoritative event names, exact triggers, allowed properties and future
review status are in `analytics-events.json`.

Primary public conversions are a completed free document, print/PDF action and
Create account selection. Login, guide engagement, helper use and installation
guidance are secondary or diagnostic. Private application activation events stay
future-only until the relevant Auth, private-data, financial or payment review.

## Future search campaign structure

If paid search is later approved, start with tightly separated high-intent groups:

- simple invoicing software UK → homepage or sole-trader landing page;
- invoice software for sole traders → `/industries/sole-traders/`;
- recurring invoice software UK → recurring-invoice guide and product tour;
- invoice reminder app → overdue-reminder guide;
- invoice and quote software UK → features and product tour;
- Stripe invoice payment software → payment-link guide.

Do not target broad accounting, payroll, tax-return, free bookkeeping, CRM,
project-management or team-collaboration intent that Tallyo does not serve. Review
search-term reports before expanding any future campaign. No Display Network,
remarketing, social pixel, automated bidding configuration or budget belongs in
this repository foundation.

Suggested future naming is `UK_SEARCH_<INTENT>_<LANDING>_<VERSION>`. A landing
page must be distinct, accurate, useful without registration and mapped to one
main intent. It must not invent comparisons, customers, ratings, prices, trials or
availability.

## UTM convention and attribution boundary

Recognised names are `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
and `utm_term`. Suggested values are lowercase, hyphenated and contain no personal
or customer information. Example structure:

`?utm_source=google&utm_medium=cpc&utm_campaign=uk-invoicing&utm_content=sole-trader`

The current parser keeps recognised values in page memory only. It does not store,
transmit or append them to account, Auth, invoice, payment, support or redirect
URLs. Canonicals exclude query parameters. A future proportionate attribution
window and deletion behaviour require privacy and provider review before use.

## Future experiment process

1. define one factual hypothesis and one primary conversion;
2. verify the landing page and event already exist in reviewed form;
3. obtain provider, consent, privacy and spend approval;
4. confirm preview/development exclusion and default-denied consent;
5. run a small time-bounded test with no simultaneous uncontrolled change;
6. check event quality before interpreting results;
7. stop when guardrails fail or evidence is inconclusive;
8. record the decision without retaining private visitor data.

## Editorial system

Content pillars are getting paid, professional documents, saving time and staying
organised. A useful guide may be adapted into a help article, public Helper answer,
short social post or later email tip only after channel-specific review.

Every item must be accurate, useful, UK-focused, readable, supported by current
product behaviour and reviewed before publication. Legal, tax and accounting
subjects must not be presented as personalised advice. Do not mass-produce thin
pages or criticise competitors with unsupported claims.
