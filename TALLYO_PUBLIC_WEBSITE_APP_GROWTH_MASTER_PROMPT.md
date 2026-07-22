# Tallyo Public Website, App Deployment, Free Tools, Public Helper, SEO, Analytics and Growth Foundations

## Mission

Build the public Tallyo website, integrate it with the existing authenticated Tallyo application, prepare both for deployment on Cloudflare, implement the public free invoice generator and Tallyo Helper, and establish complete SEO, analytics, conversion and marketing foundations.

The existing Tallyo invoicing application is functionally ready for public use.

Do not restart the completed application-readiness programme. Do not repeat verified Auth, MFA, RLS, payment, refund, email, recurring-invoice, PDF, mobile or PWA acceptance work unless this task changes the relevant source code or configuration.

Do not return only a plan.

Begin implementation, work through the safe work packages autonomously, test each stage, create focused commits and pull requests, and continue until reaching a genuine Owner-only boundary.

## Required final structure

```text
tallyo.co.uk
Public marketing website, public help centre, free tools and Tallyo Helper

www.tallyo.co.uk
Redirect to tallyo.co.uk

app.tallyo.co.uk
Existing authenticated Tallyo application and installable PWA
```

The public website and authenticated application must remain separate deployments and separate security boundaries.

Do not:

- embed the application in an iframe;
- merge the marketing website into the authenticated application;
- rebuild the working application as part of this website task;
- expose authenticated application data to the public website;
- give the public Tallyo Helper access to private accounts.

## Main customer journey

The intended journey is:

```text
Visitor finds Tallyo through search, content, recommendation or advertising
→ visits tallyo.co.uk
→ understands what Tallyo does
→ explores features, security, pricing or help
→ optionally uses the free invoice generator
→ optionally asks Tallyo Helper a question
→ clicks Create account
→ arrives at app.tallyo.co.uk
→ creates and verifies an account
→ completes business details
→ creates the first customer
→ creates the first invoice
→ sends, downloads or adds a payment link
→ returns to manage future invoicing
→ optionally installs Tallyo on the device
```

The website must support this full conversion journey without deceptive marketing practices.

---

# 1. Approved Product Direction

Treat these facts as approved.

## Product

Tallyo is a straightforward invoicing and business-records workspace for small businesses and independent operators.

It helps users:

- create invoices;
- create quotes;
- create credit notes;
- manage customers;
- save products and services;
- add branding;
- export documents to PDF;
- export lists to Excel;
- send documents by email;
- track delivery status;
- record manual payments;
- accept Stripe-hosted card payments;
- request deposits;
- process supported refunds;
- see paid, due and overdue balances;
- create recurring invoices;
- automatically email recurring invoices when enabled;
- send overdue reminders;
- view document activity history;
- export their Tallyo workspace;
- use optional TOTP multi-factor authentication;
- install the application as a PWA.

## Audience

Tallyo is initially aimed at:

- UK small businesses;
- sole traders;
- freelancers;
- consultants;
- cleaners;
- tutors;
- photographers;
- designers;
- electricians;
- plumbers;
- decorators;
- tradespeople;
- independent professionals;
- service companies;
- custom-order and printing businesses as one use case, not the whole product.

Do not position Tallyo only as a custom-printing application.

## Positioning

Use this general positioning:

> Professional invoices. Faster payments. Less admin.

Supporting message:

> Create quotes and invoices, accept card payments, automate recurring work and keep every customer transaction organised in one straightforward workspace.

Longer positioning:

> Tallyo helps UK small businesses create professional documents, track what has been paid and automate repetitive invoicing work—without the complexity of a full accounting suite.

## Honest limitations

Communicate clearly that:

- authenticated business records require an internet connection;
- Tallyo is not a full accounting suite;
- Tallyo does not prepare tax returns;
- Tallyo does not provide legal, tax or accounting advice;
- Stripe handles card entry on Stripe-hosted pages;
- Tallyo does not store full card details;
- email delivery status reflects available provider evidence;
- multi-user Teams workspaces are not currently implemented;
- exact public prices and plan limits are not yet approved.

Do not claim:

- “100% secure”;
- “unhackable”;
- “bank-grade security” without a defined supported basis;
- “fully GDPR compliant”;
- “certified compliant”;
- “guaranteed payment”;
- “guaranteed email delivery”;
- “works fully offline”;
- unsupported uptime guarantees;
- fake customer counts;
- fake ratings;
- fake reviews;
- fake awards;
- fake testimonials;
- fake partnerships.

---

# 2. Repository and Context Discipline

Begin by reading only:

1. `AGENTS.md`;
2. `APP_STATUS.md`;
3. `docs/INDEX.md`;
4. `PROJECT_HANDOFF.md`;
5. `CODEX.md`;
6. `AUTONOMOUS_EXECUTION_PERMISSION.md`;
7. directly affected website, app, PWA, testing and deployment files;
8. the active task record created for this programme.

Load specialist policies only when their domains are triggered.

Do not read the entire legal, security, payment, historical or governance archive by default.

Use existing verified evidence.

Do not rerun expensive full regressions after:

- documentation-only edits;
- image compression;
- static marketing copy changes;
- low-risk CSS adjustments.

Run focused validation proportionate to the changed scope.

---

# 3. Autonomy

The Owner authorises Codex to proceed autonomously with safe, reversible work including:

- repository inspection;
- website architecture;
- visual design;
- responsive design;
- content structure;
- ordinary marketing copy based on approved product facts;
- SEO implementation;
- structured data;
- public help content;
- public free tools;
- deterministic Tallyo Helper;
- provider-neutral analytics foundations;
- consent-state foundations;
- conversion event design;
- landing-page templates;
- app navigation integration;
- PWA installation UX;
- local and preview testing;
- accessibility improvements;
- performance improvements;
- synthetic screenshots;
- test fixtures;
- branches;
- commits;
- pushes;
- pull requests;
- autonomous merge where the existing repository policy permits it.

Do not ask the Owner to decide:

- spacing;
- ordinary typography;
- card layout;
- section order;
- responsive breakpoints;
- normal colour variations;
- icon position;
- file names;
- component names;
- ordinary copy variants;
- internal folder organisation;
- routine accessibility fixes;
- routine performance improvements.

Choose sensible options consistent with this specification and continue.

## Stop only before Owner-only actions

Stop before:

- spending money;
- enabling a paid plan;
- purchasing a provider product;
- changing live DNS;
- connecting production domains;
- deleting the existing GitHub Pages deployment;
- changing production Supabase Auth URLs;
- changing production Stripe URLs or webhooks;
- changing production Resend configuration;
- activating production Turnstile;
- entering, revealing or rotating secrets;
- creating live Stripe products or subscriptions;
- sending real customer communications;
- using real customer data;
- publishing unfinished legal documents;
- publishing private identity or address information;
- activating Google Analytics;
- activating Google Tag Manager;
- activating Google Ads tracking;
- activating advertising cookies;
- activating remarketing;
- adding marketing pixels;
- starting paid advertising;
- making irreversible production changes;
- performing the final public cutover.

When one action is blocked:

1. stop only that action;
2. document exactly what is required;
3. continue every independent safe task;
4. provide exact Owner instructions at the end.

---

# 4. Technical Architecture

## Repository model

Default to one repository with two independently deployable projects.

### Public website

Create a dedicated directory:

```text
website/
```

The website must be independently deployable to Cloudflare Pages.

Prefer a simple maintainable architecture.

A semantic HTML, CSS and JavaScript implementation is acceptable.

A lightweight build system may be introduced only where it clearly improves:

- reusable pages;
- metadata generation;
- testing;
- content management;
- accessibility;
- performance;
- deployment.

Do not introduce a large framework merely to create static marketing pages.

Avoid unnecessary runtime dependencies.

### Authenticated app

Preserve the current authenticated application initially.

Do not move or rewrite the complete app in the first pull request.

Prepare it for a separate deployment serving:

```text
app.tallyo.co.uk
```

If moving the app into a directory becomes beneficial, make that a separate focused migration after verifying:

- all relative asset paths;
- configuration loading;
- service-worker scope;
- manifest scope;
- PWA `start_url`;
- Auth callback URLs;
- payment return URLs;
- password reset links;
- CSP;
- tests;
- rollback.

## Expected Cloudflare projects

```text
Project: tallyo-website
Source/output: website/

Project: tallyo-app
Source/output: current app root or later approved app directory
```

Do not create another repository without Owner approval.

---

# 5. Visual Design Direction

Create a polished and trustworthy small-business SaaS presentation.

Use:

- modern minimal layout;
- generous spacing;
- existing Tallyo navy or dark-slate identity;
- soft neutral backgrounds;
- accessible blue, mint or lilac accents;
- strong readable typography;
- restrained borders and shadows;
- consistent rounded corners;
- useful product screenshots;
- subtle motion;
- reduced-motion support;
- clear hierarchy;
- prominent but not aggressive calls to action.

Avoid:

- clutter;
- generic corporate stock images;
- fake office-team photographs;
- autoplay video;
- excessive gradients;
- oversized animations;
- aggressive popups;
- fake urgency;
- fake countdown timers;
- confusing technical jargon;
- designs that resemble gambling or financial-trading products.

The website must feel simple enough for a non-technical sole trader.

---

# 6. Public Website Routes

Implement these routes or equivalent accessible pages:

```text
/
Home

/features
Features

/free-invoice-generator
Free Invoice Generator

/free-quote-generator
Free Quote Generator or generator mode landing page

/pricing
Pricing

/security
Security

/help
Help Centre

/help/[article]
Individual help article

/faq
Frequently Asked Questions

/about
About Tallyo
```

Prepare but do not publicly expose unfinished legal routes until approved.

## Header

Include:

- Tallyo logo;
- Features;
- Free Invoice Maker;
- Pricing;
- Security;
- Help;
- Log in;
- Create account.

On mobile, provide an accessible menu with:

- correct ARIA state;
- keyboard support;
- Escape handling;
- focus management;
- no background scroll where inappropriate.

## Footer

Include:

- Product;
- Features;
- Free Invoice Maker;
- Pricing;
- Security;
- Help;
- FAQ;
- About;
- Log in;
- Create account;
- Install Tallyo;
- approved legal links when available;
- public business contact only after approved.

Do not publish private Owner information from repository placeholders.

---

# 7. Homepage

Build the homepage in the following general order.

## Hero

Include:

- main headline;
- supporting copy;
- primary Create account CTA;
- secondary Free invoice maker CTA;
- real or synthetic-data Tallyo product screenshot;
- concise trust points.

Suitable trust points:

- Stripe-hosted card payments;
- optional two-factor authentication;
- installable on supported devices;
- built for UK small businesses.

Do not present trust points as certifications.

## Benefits

Explain:

- create professional invoices and quotes;
- track what is paid, due and overdue;
- accept card payments;
- organise customers;
- automate recurring invoices;
- send reminders;
- reduce repetitive administration;
- use Tallyo on phone, tablet or computer.

## How it works

Use:

```text
Set up your business
→ Add a customer
→ Create a quote or invoice
→ Send it or share a payment link
→ Track payment and follow up
→ Automate recurring work
```

## Product presentation

Show actual supported workflows:

- Dashboard;
- Invoice editor;
- Quote creation;
- Quote conversion;
- Customer management;
- Saved items;
- Recurring invoices;
- Overdue panel;
- Payment status;
- Activity history;
- Branding;
- Security settings;
- mobile interface.

## Feature groups

### Create and send

- invoices;
- quotes;
- credit notes;
- branded PDFs;
- email delivery;
- Excel export.

### Get paid

- Stripe-hosted payment links;
- deposits;
- payment status;
- manual payment records;
- supported refund workflow.

### Save time

- saved customers;
- saved products and services;
- recurring invoices;
- automatic recurring email;
- overdue reminders.

### Stay organised

- outstanding balances;
- statuses;
- customer history;
- document history;
- account export.

### Protect access

- email confirmation;
- optional TOTP MFA;
- account recovery controls;
- row-level tenant isolation;
- server-side sensitive operations.

Use plain-language benefits before technical descriptions.

## Industry examples

Create useful cards or sections for:

- freelancers;
- consultants;
- cleaners;
- electricians;
- plumbers;
- decorators;
- tutors;
- photographers;
- designers;
- custom-order businesses;
- independent service companies.

Do not imply industry-specific functions that do not exist.

## Installation section

Explain:

> Use Tallyo in your browser or install it on a supported phone, tablet or computer for quick access.

State clearly:

> An internet connection is required to access and update authenticated business records.

Provide installation guidance for:

- Chrome desktop;
- Microsoft Edge;
- Android Chrome;
- iPhone Safari;
- iPad Safari.

## Security section

Use a heading such as:

> Built with account and customer-data protection in mind

Explain implemented protections honestly and link to `/security`.

## Pricing preview

Use a reusable pricing configuration.

Prepare the following identities:

- Free — Getting started;
- Essentials — Regular invoicing;
- Automate — Recurring work and payment follow-up;
- Teams — Growing businesses with staff.

Exact prices, limits and availability are not approved.

Until approved:

- do not invent prices;
- do not invent trials;
- do not invent usage limits;
- do not show Teams as available;
- do not enable checkout;
- show neutral wording such as “Plans and pricing are being finalised”;
- keep pricing data centralised.

## FAQ preview

Include factual questions about:

- what Tallyo is;
- who it is for;
- browser use;
- installation;
- internet requirement;
- invoices and quotes;
- recurring invoices;
- reminders;
- card payments;
- card-data storage;
- refunds;
- mobile use;
- security;
- exports;
- support;
- whether Tallyo replaces accounting software.

## Final CTA

Link to the configurable app/signup destination.

During preview development, use a safe preview or current application URL.

Do not hardcode production URLs throughout page templates.

---

# 8. Lessons Learned from Bloom

Use relevant product-growth lessons without copying Bloom’s:

- branding;
- design;
- wording;
- layouts;
- proprietary content;
- assets.

## Give useful value before registration

The free invoice generator must provide real value without requiring an account.

## Use contextual conversion

After a useful action, show relevant suggestions.

Examples:

After adding a customer:

> Create an account to save this customer for next time.

After adding a due date:

> Tallyo can help you follow up when an invoice becomes overdue.

After creating a monthly invoice:

> Tallyo can automatically create your next recurring invoice.

After downloading:

> Keep the customer, invoice and payment status organised in Tallyo.

Do not interrupt the user before they receive the free value.

## Show the whole outcome

Present:

```text
Customer
→ Quote
→ Invoice
→ Payment
→ Status
→ Reminder
→ Recurring work
```

Advertise only existing functions.

## Avoid all-in-one scope creep

Do not expand this task into:

- CRM development;
- booking;
- project management;
- contract management;
- website building;
- full bookkeeping;
- payroll;
- tax filing;
- team collaboration;
- AI access to private account data.

---

# 9. Free Invoice Generator

Implement a polished public generator at:

```text
/free-invoice-generator
```

It must work without authentication.

## Required functions

- Invoice, Quote or Estimate document type;
- sender/business details;
- customer details;
- invoice/reference number;
- issue date;
- due date;
- line items;
- description;
- quantity;
- unit;
- unit price;
- discount;
- tax;
- shipping or additional cost;
- currency;
- GBP default;
- notes;
- payment instructions;
- optional locally selected logo;
- live preview;
- print;
- save as PDF;
- clear/reset;
- responsive editing.

Reuse appropriate tested calculation logic where safe.

Do not connect the generator to private account data.

## Privacy

By default:

- keep entered data in the browser;
- do not send data to Supabase;
- do not send data to Tallyo Helper;
- do not send data to analytics;
- do not create a server copy;
- do not create an automatic cloud draft;
- keep uploaded logos browser-local;
- do not automatically persist customer details.

Display an accurate privacy message.

Suitable wording:

> Your invoice details stay in this browser while you create the document. Tallyo does not save this free-generator document unless you later enter it in your Tallyo account.

Verify this claim against actual code.

When local persistence is implemented:

- make it opt-in;
- explain the device/browser storage;
- include “Clear saved draft”;
- exclude sensitive details from unnecessary logs.

## Conversion

After print/download, show:

- Create your Tallyo account;
- Save customers and services;
- Track payments;
- Accept card payments;
- Create recurring invoices;
- Send reminders.

Do not automatically transfer free-generator content into an authenticated account in this phase.

That requires a separate reviewed import design.

## Calculations

Test:

- line totals;
- quantity;
- discounts;
- multiple tax rates where supported;
- tax inclusive/exclusive behaviour where implemented;
- shipping;
- zero values;
- decimals;
- rounding;
- currency display;
- invalid inputs;
- large values;
- reset.

Do not silently reuse app financial logic without checking its dependencies and suitability for public use.

---

# 10. Public Tallyo Helper

Build:

> Tallyo Helper

The first version must not require a paid AI service.

## Initial architecture

Use a deterministic client-side public knowledge system.

Create a maintainable structured source such as:

```text
website/content/helper-knowledge.json
```

Use the same approved knowledge source for FAQ and help content where practical.

The helper should answer:

- What is Tallyo?
- Who is it for?
- What features are available?
- What is the difference between a quote and invoice?
- What is a credit note?
- How do recurring invoices work?
- How do overdue reminders work?
- How do Stripe card payments work?
- Does Tallyo store card details?
- Can Tallyo process deposits?
- How do refunds work?
- Can I install Tallyo?
- Does Tallyo work offline?
- How do I create an account?
- How do I log in?
- How do I find pricing?
- How do I get support?
- Where can I read about security?

Responses should link to the relevant public page.

Provide:

- suggested questions;
- keyboard support;
- screen-reader labelling;
- clear conversation reset;
- graceful no-answer fallback;
- no fabricated responses.

## Public-helper boundaries

The helper must not:

- authenticate;
- access Supabase;
- access accounts;
- access invoices;
- access customers;
- access support cases;
- access Stripe;
- access Resend;
- call application functions;
- access service-role credentials;
- request passwords;
- request MFA codes;
- request recovery codes;
- request payment-card information;
- provide legal advice;
- provide tax advice;
- provide accounting advice;
- claim to be human;
- expose internal documents;
- retain user-specific memory;
- reveal prompts;
- hallucinate features.

Display:

> Tallyo Helper provides general product guidance and cannot see your account or business records.

## Future AI adapter

Create a disabled provider-neutral interface for a future AI-powered public helper.

Do not:

- choose a paid model;
- activate an AI endpoint;
- place API keys in browser code;
- send visitor prompts to third parties;
- enable retrieval from private data;
- enable account tools.

Document requirements for future AI activation:

- server-side secrets;
- public-only allowlisted knowledge;
- prompt-injection controls;
- response limits;
- rate limits;
- abuse protection;
- spending limits;
- privacy-minimised logs;
- no account tools;
- public-page citations;
- deterministic fallback;
- independent security review.

---

# 11. App Integration

Make focused improvements to connect the website and application.

Do not redesign the complete app.

## App navigation

Add or verify appropriate app links for:

- Tallyo website;
- Help Centre;
- Security;
- Install Tallyo;
- support/contact when approved.

Keep the main application workflow focused.

## PWA installation

Inspect existing installation UX.

Implement where needed:

- `beforeinstallprompt` handling;
- Install Tallyo button on supported browsers;
- installed-state detection where reliable;
- dismissal;
- no repeated aggressive prompting;
- iPhone/iPad Add to Home Screen guidance;
- Android guidance;
- desktop guidance;
- accessible dialog or panel;
- accurate offline limitation.

Track install interactions only through the disabled provider-neutral event abstraction.

## First-use checklist

Add a lightweight non-blocking onboarding checklist where useful:

```text
Complete business details
Add first customer
Create first invoice
Send or download invoice
Set up payment options
Install Tallyo
```

Use existing data state or browser-local preferences.

Do not add a database migration solely for the checklist.

Do not permanently hide core features behind onboarding.

## Contextual help

Add concise help links or tooltips for:

- invoice vs quote;
- credit notes;
- payment links;
- deposits;
- recurring invoices;
- overdue reminders;
- refunds;
- email delivery status;
- activity history;
- installation.

Link to public help articles.

## Preserve verified behaviour

Do not change:

- Auth;
- MFA;
- account recovery;
- RLS;
- tenant ownership;
- schema;
- financial calculations;
- Stripe payment handling;
- refund handling;
- webhook handling;
- recurring generation;
- reminder automation;
- email delivery;

unless a separately recorded defect or domain migration makes it necessary.

Any such change must follow the appropriate high-risk specialist path.

---

# 12. Product Screenshots and Demonstrations

Create screenshots using only fictional data.

Use consistent fictional examples such as:

```text
Business: Northstar Home Services
Customer: Willow & Pine Studio
Invoice: INV-DEMO-1042
```

Requirements:

- no real customer information;
- no private email addresses;
- no real postal addresses;
- no live payment links;
- no Stripe IDs;
- no Supabase IDs;
- no real business financial records;
- no secrets;
- no authentication tokens.

Include:

- desktop screenshots;
- mobile screenshots;
- dashboard;
- invoice editor;
- quote;
- recurring invoices;
- overdue invoices;
- payments;
- activity history;
- branding;
- security/account settings.

Use:

- compressed WebP or AVIF where practical;
- responsive sizes;
- descriptive alt text;
- lazy loading below the fold.

Do not create fake feature screens.

---

# 13. SEO Foundations

SEO must be built into the initial website.

## Technical SEO

Implement:

- unique title per route;
- unique meta description;
- canonical URL;
- clean lowercase paths;
- semantic HTML;
- one clear page topic;
- logical heading hierarchy;
- descriptive internal links;
- crawlable text;
- descriptive image alt text;
- `robots.txt`;
- `sitemap.xml`;
- Open Graph metadata;
- social metadata;
- favicon;
- icons;
- canonical-host redirects;
- trailing-slash consistency;
- useful 404 page;
- correct missing-page status behaviour;
- preview `noindex, nofollow`.

Create a central metadata source.

Do not duplicate titles and descriptions throughout templates.

## Structured data

Add accurate structured data where appropriate:

- Organisation or relevant business identity only when public facts are approved;
- SoftwareApplication or WebApplication;
- BreadcrumbList;
- FAQPage only when visible FAQ content matches;
- HowTo only for genuinely instructional pages.

Do not include:

- fake ratings;
- fake reviews;
- invented prices;
- invented availability;
- invented customer counts.

## Search Console readiness

Prepare configurable support for:

- Google Search Console verification;
- Bing Webmaster Tools;
- final sitemap hostname;
- canonical hostname.

Do not commit private or unapproved verification values.

Document production steps:

1. connect the final domain;
2. verify the domain property;
3. submit sitemap;
4. inspect priority pages;
5. confirm indexability;
6. review structured-data reports;
7. review security/manual actions;
8. monitor search queries and click-through rates.

## Content architecture

Create reusable templates or components for:

- feature pages;
- industry pages;
- educational guides;
- comparisons;
- free tools;
- help articles;
- FAQs.

Do not generate hundreds of low-value pages.

Every published page must be distinct and useful.

## Initial future SEO content map

Prepare content specifications for:

- Free invoice generator UK;
- Free quote generator UK;
- Invoice template for UK sole traders;
- How to create an invoice UK;
- What an invoice must include;
- Quote vs invoice;
- Credit note explained;
- How invoice deposits work;
- How to chase an overdue invoice;
- Recurring invoice software UK;
- Invoice reminder software;
- Invoicing software for freelancers;
- Invoicing software for cleaners;
- Invoicing software for electricians;
- Invoicing software for consultants;
- Invoicing software for photographers;
- Invoicing software for custom-printing businesses;
- Simple invoicing software for sole traders;
- Invoice payment-link software;
- How to install Tallyo.

Do not publish unfinished generic articles.

---

# 14. Growth and Marketing Foundations

Build the website so future marketing can be activated without architectural restructuring.

Do not activate paid advertising or tracking in this task.

## Marketing funnel

Use:

```text
Acquisition
→ Website engagement
→ Free-tool or feature engagement
→ Account CTA
→ Signup start
→ Signup completion
→ Email verification
→ First login
→ First customer
→ First invoice
→ Invoice sent or payment link created
→ Returning active user
```

Design stable identifiers for conversion actions.

Examples:

```text
cta_header_create_account
cta_hero_create_account
cta_hero_free_invoice
cta_pricing_create_account
cta_generator_create_account
cta_footer_create_account
cta_login
```

Do not use customer or private information in IDs.

## Landing-page system

Create reusable landing-page components for future campaigns.

Each landing page should support:

- specific headline;
- specific audience problem;
- relevant benefit;
- relevant screenshots;
- proof based on actual product capability;
- feature details;
- FAQs;
- free-tool CTA;
- Create account CTA;
- internal guide links;
- reduced navigation where appropriate;
- unique metadata.

Do not create misleading comparison pages or criticise competitors with unsupported claims.

## Future advertising readiness

Prepare for future Google Search campaigns targeting high-intent terms such as:

- simple invoicing software UK;
- invoice software for sole traders;
- recurring invoice software UK;
- invoice reminder app;
- invoice and quote software UK;
- Stripe invoice payment software.

Do not create or launch advertising campaigns.

Do not add:

- broad untargeted campaign logic;
- remarketing;
- Display Network;
- social advertising pixels;
- automated bidding configurations;
- campaign budget.

Create documentation describing:

- recommended campaign structure;
- landing-page mapping;
- negative keyword strategy;
- primary conversions;
- secondary conversions;
- naming conventions;
- UTM conventions;
- testing process.

---

# 15. Analytics Architecture

Build analytics foundations now, but keep all tracking disabled.

## Guiding rule

The public website and app may call a provider-neutral event API.

No analytics data may leave the browser until:

- an approved provider is selected;
- the consent mechanism is implemented;
- privacy wording is approved;
- tracking is explicitly enabled.

## Analytics abstraction

Create a small module with an interface such as:

```text
trackEvent(eventName, allowedProperties)
```

Default behaviour:

```text
No operation
No network call
No cookie
No identifier
No storage
```

The module must:

- be disabled by default;
- fail safely;
- never block a user action;
- use an event allowlist;
- use property allowlists;
- reject free-text properties;
- reject unknown events;
- support future consent checks;
- support provider replacement;
- distinguish development, preview and production;
- be testable.

All future tracking calls should use this abstraction.

Do not call GA4, Google Ads or another provider directly throughout components.

## Event dictionary

Create an authoritative documented event dictionary.

### Website events

```text
view_home
view_features
view_pricing
view_security
view_help_article
view_industry_page
open_tallyo_helper
helper_answer_found
helper_answer_not_found
start_free_invoice
complete_free_invoice
download_free_invoice
print_free_invoice
click_create_account
click_login
view_install_instructions
click_install_app
```

### Application activation events

Prepare identifiers and implementation points, but do not add sensitive tracking without review:

```text
signup_started
signup_completed
email_verified
first_login
business_profile_completed
first_customer_created
first_invoice_created
first_invoice_sent
payment_link_created
recurring_invoice_enabled
pwa_install_prompt_shown
pwa_installed
```

For each event document:

- description;
- exact trigger;
- route/component;
- allowed properties;
- prohibited properties;
- consent category;
- primary/secondary/diagnostic classification;
- whether implemented now or future.

## Analytics data prohibition

Never send:

- names;
- emails;
- phone numbers;
- addresses;
- customer IDs;
- invoice IDs;
- invoice numbers;
- document descriptions;
- item descriptions;
- notes;
- support messages;
- customer data;
- invoice content;
- payment amounts;
- Stripe IDs;
- Resend IDs;
- Supabase user IDs;
- Auth tokens;
- password data;
- MFA codes;
- recovery codes;
- free text;
- full URLs containing private parameters;
- payment or password reset links.

Analytics measures product progress, not business-record contents.

## Google Analytics readiness

Prepare central configuration placeholders for:

- GA4 Measurement ID;
- Google Tag Manager container ID;
- Google Ads conversion ID;
- Search Console verification;
- environment;
- consent state.

Do not activate or hardcode real IDs.

Do not load the Google script in this task.

## Google Tag Manager readiness

Prepare an integration point, but do not add GTM to the active website yet.

Future GTM use must not bypass:

- consent;
- event allowlists;
- property minimisation;
- testing;
- privacy documentation;
- development exclusions.

## UTM readiness

Recognise future campaign fields:

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

Do not persist them indefinitely.

Ensure:

- canonical URLs exclude UTM parameters;
- UTM parameters do not create duplicate indexable pages;
- they do not enter invoices;
- they do not enter Auth URLs;
- they do not enter payment links;
- they do not enter support cases;
- they do not leak through redirects.

Document a future proportionate attribution window.

---

# 16. Consent Architecture

Prepare consent foundations but do not display an unnecessary cookie banner.

Use categories:

```text
necessary
analytics
advertising
preferences
```

Only `necessary` may be active by default.

Do not activate:

- analytics cookies;
- advertising cookies;
- remarketing;
- personalisation;
- non-essential persistent identifiers.

Create a consent-state interface that future providers can query.

## Future Google Consent Mode

Prepare documentation and configuration points.

Do not enable Google Consent Mode in this task because no Google tracking is active.

Future activation must verify:

- default denied state;
- user choice;
- withdrawal;
- consent update;
- no tags before required consent;
- region behaviour;
- consent logging proportionality;
- privacy notice;
- cookie notice.

## Current website storage inventory

Inventory:

- cookies;
- localStorage;
- sessionStorage;
- IndexedDB;
- service-worker cache;
- PWA storage;
- free-generator draft storage;
- helper state;
- preferences.

Classify each item as:

- necessary;
- security;
- preference;
- analytics;
- advertising.

Do not label something necessary merely because it is convenient.

---

# 17. Content Marketing Foundations

Prepare a content system that can turn one useful topic into multiple channels.

Example workflow:

```text
Detailed guide
→ SEO page
→ Help article
→ LinkedIn post
→ short video script
→ FAQ answer
→ Tallyo Helper answer
→ email tip later
```

Prepare content pillars.

## Getting paid

- payment terms;
- deposits;
- overdue invoices;
- reminders;
- card payment links;
- refunds.

## Professional documents

- invoices;
- quotes;
- credit notes;
- branding;
- PDF exports;
- invoice numbering.

## Saving time

- recurring invoices;
- saved customers;
- saved services;
- automatic reminders.

## Organisation

- payment status;
- customer records;
- activity history;
- exports.

Do not produce mass AI-generated thin content.

Document editorial quality requirements:

- accurate;
- useful;
- UK-focused;
- readable;
- supported by actual product features;
- reviewed before publication;
- no tax/legal claims presented as advice.

---

# 18. Security and Privacy

## Public website

Ordinary marketing pages should not require Supabase.

Do not include application configuration in the website unless a separately reviewed feature requires it.

## Headers

Prepare Cloudflare-compatible security headers.

Evaluate:

- Content-Security-Policy;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy;
- frame restrictions;
- cross-origin policies where compatible;
- HSTS after custom-domain HTTPS is accepted;
- caching.

Use the narrowest practical public-site CSP.

Do not blindly copy the app CSP.

## Third parties

Default to no active third-party:

- analytics;
- advertising;
- marketing pixels;
- social embeds;
- chat widgets;
- session replay;
- heatmaps;
- behavioural tracking.

Build provider-neutral foundations but keep integrations inactive.

## Contact forms

Do not create a public contact form that stores or emails personal data unless:

- backend is approved;
- anti-spam is approved;
- privacy notice is ready;
- support route is approved;
- retention is defined;
- delivery is tested.

A safe public email link may be used after the address is approved.

## Repository safety

Assume every committed file is public.

Never commit:

- secrets;
- private legal identity;
- home address;
- customer data;
- private support content;
- real emails not approved for publication;
- tokens;
- unredacted provider payloads;
- screenshots containing private information.

---

# 19. Search and Social Sharing

Implement:

- social preview metadata;
- Open Graph images;
- descriptive titles;
- route descriptions;
- canonical URLs;
- sitemap;
- robots;
- structured data;
- favicon;
- PWA icons;
- share-image assets.

Preview sites must be `noindex`.

Do not accidentally index:

- Cloudflare preview URLs;
- old GitHub Pages duplicates;
- test pages;
- private app routes;
- Auth callback routes;
- generator draft URLs;
- campaign parameter variants.

---

# 20. Performance

Establish a public-site performance baseline.

Monitor:

- initial JavaScript;
- CSS size;
- image size;
- external origins;
- layout shifts;
- blocking resources;
- mobile render;
- cache behaviour.

Use:

- compressed images;
- responsive images;
- lazy loading;
- modern image formats;
- minimal scripts;
- self-hosted assets where practical;
- font-display controls;
- stable dimensions;
- code splitting only where justified.

Do not chase a perfect score by harming accessibility or functionality.

Record actual results.

Do not claim a Lighthouse score not measured.

---

# 21. Accessibility

Test and fix:

- keyboard navigation;
- skip link;
- landmarks;
- heading order;
- visible focus;
- colour contrast;
- mobile menu;
- form labels;
- error messages;
- screen-reader status messages;
- helper accessibility;
- generator table accessibility;
- modal focus;
- focus return;
- Escape closing;
- reduced motion;
- 200% zoom;
- 320px width;
- 390px width;
- no horizontal overflow;
- no keyboard traps;
- touch target size;
- link purpose;
- image alt text.

Do not treat accessibility as a documentation-only exercise.

---

# 22. Domain and Hosting Migration

Audit every dependency on the existing GitHub Pages URL or `/InvoicePro/` path.

Inspect:

- `index.html`;
- `config.js`;
- `manifest.json`;
- `service-worker.js`;
- icons;
- asset paths;
- PWA `start_url`;
- PWA `scope`;
- Supabase Auth redirects;
- password reset links;
- email confirmation links;
- MFA recovery links;
- application base URL;
- Stripe success and cancel URLs;
- payment-link URLs;
- Resend links;
- Turnstile hostname;
- CSP;
- cache keys;
- automated tests;
- deployment scripts;
- documentation;
- canonical URLs.

Classify each:

```text
Already domain independent
Repository change required
Provider dashboard change required
Secret/config action required
Owner approval required
```

Implement safe repository changes.

Prepare exact instructions for external changes.

Keep the existing GitHub Pages deployment as rollback until Cloudflare acceptance and Owner cutover approval.

---

# 23. Cloudflare Preview Preparation

Prepare two preview deployments.

## Website

Expected project:

```text
tallyo-website
```

Expected preview pattern:

```text
tallyo-website.pages.dev
```

## App

Expected project:

```text
tallyo-app
```

Expected preview pattern:

```text
tallyo-app.pages.dev
```

Actual available names may differ.

Codex may create free preview projects only where:

- authorised Cloudflare access already exists;
- no paid upgrade occurs;
- no billing is added;
- no live DNS changes;
- no private secret is exposed;
- applicable terms are already accepted;
- rollback is recorded;
- the action is reversible.

Otherwise prepare exact dashboard instructions.

For previews:

- use fictional data;
- set website `noindex`;
- do not treat preview as public launch;
- retain existing deployment;
- verify HTTPS;
- verify routing;
- verify refresh;
- verify headers;
- verify PWA behaviour;
- verify install;
- verify mobile;
- verify generator;
- verify helper;
- verify app links.

---

# 24. Testing

Inspect existing scripts before adding tooling.

Add focused automated tests for:

## Website

- all public routes;
- navigation;
- broken links;
- mobile menu;
- metadata;
- canonical URLs;
- sitemap;
- robots;
- structured data;
- preview `noindex`;
- 404 behaviour;
- CTA identifiers;
- image paths;
- accessibility basics;
- prohibited claims;
- fake social proof absence.

## Free generator

- totals;
- discounts;
- tax;
- shipping;
- currency;
- PDF/print mode;
- reset;
- local-only behaviour;
- no network transmission;
- responsive layout;
- accessibility.

## Helper

- approved-answer matches;
- fallback;
- public links;
- restricted questions;
- private-account questions;
- password/MFA rejection;
- legal/tax/accounting refusal;
- no network call;
- no memory;
- keyboard support.

## Analytics

- disabled by default;
- no analytics request;
- no tracking cookie;
- unknown event rejected;
- prohibited property rejected;
- free text rejected;
- approved event accepted by no-op layer;
- campaign parameters excluded from canonicals.

## App integration

- website links;
- help links;
- install prompt;
- install dismissal;
- iOS instructions;
- checklist state;
- no Auth/payment regression from integration.

## Domain readiness

- old URL references;
- path assumptions;
- service-worker scope;
- manifest;
- callback mapping;
- deployment configuration.

Test widths:

- 320px;
- 390px;
- tablet;
- 1280px;
- large desktop.

Check available browsers:

- Chrome;
- Edge;
- Firefox;
- Android Chrome;
- Safari or suitable emulation with limitations documented.

Do not run new live Stripe payments or refunds for this work.

---

# 25. Work Packages

Proceed through focused pull requests.

## PR 1 — Website foundation

Implement:

- active task;
- `website/`;
- architecture;
- design tokens;
- header;
- footer;
- responsive navigation;
- Home;
- Features;
- Pricing placeholder;
- Security;
- Help;
- FAQ;
- About;
- SEO metadata system;
- robots;
- sitemap;
- structured-data foundation;
- security headers;
- redirects;
- tests.

Suggested branch:

```text
codex/tallyo-website-foundation
```

Suggested commit:

```text
feat(website): build Tallyo public website foundation
```

## PR 2 — Product presentation and content system

Implement:

- synthetic screenshots;
- workflows;
- feature groups;
- industry examples;
- installation content;
- help articles;
- content templates;
- landing-page system;
- SEO content map;
- accessibility refinement;
- performance refinement.

Suggested commit:

```text
feat(website): add Tallyo product journeys and content system
```

## PR 3 — Free invoice generator

Implement:

- generator;
- calculations;
- live preview;
- print/PDF;
- privacy behaviour;
- contextual account conversion;
- tests.

Suggested commit:

```text
feat(website): add privacy-first free invoice generator
```

## PR 4 — Public Tallyo Helper

Implement:

- knowledge base;
- deterministic helper;
- fallback;
- public links;
- boundaries;
- accessibility;
- disabled future AI adapter;
- tests.

Suggested commit:

```text
feat(website): add public Tallyo Helper
```

## PR 5 — SEO and growth foundations

Implement:

- metadata audit;
- structured-data validation;
- landing-page framework;
- event dictionary;
- analytics abstraction;
- consent-state abstraction;
- UTM handling;
- Search Console readiness;
- GTM/GA4 placeholders;
- marketing documentation;
- tracking-disabled tests.

Suggested commit:

```text
feat(growth): add SEO analytics and conversion foundations
```

## PR 6 — App integration

Implement:

- public website links;
- help links;
- security links;
- install UX;
- iOS instructions;
- first-use checklist;
- contextual help;
- safe app event integration using disabled abstraction.

Suggested commit:

```text
feat(app): integrate website help onboarding and PWA install
```

## PR 7 — Cloudflare readiness

Implement:

- website Pages config;
- app Pages config;
- headers;
- redirects;
- domain-independence changes;
- manifest/service-worker updates where needed;
- preview deployment docs;
- rollback;
- provider action checklist;
- old URL audit;
- tests.

Suggested commit:

```text
chore(deploy): prepare Tallyo website and app for Cloudflare
```

## PR 8 — Preview acceptance

Record:

- preview URLs;
- build evidence;
- route checks;
- accessibility;
- performance;
- generator;
- helper;
- analytics disabled;
- PWA installation;
- domain action list;
- rollback state.

Do not perform production cutover.

---

# 26. Autonomous Continuation

After each safe work package:

1. inspect the diff;
2. remove unrelated changes;
3. run focused tests;
4. run `git diff --check`;
5. scan for secrets and private data;
6. update only authoritative documents whose state changed;
7. commit;
8. push;
9. open or update the pull request;
10. merge only where existing repository policy permits;
11. begin the next independent package.

Do not stop after PR 1 merely to ask whether to continue.

Do not create long duplicate specialist reports.

Use only relevant roles.

---

# 27. Acceptance Criteria

The programme is implementation-complete when:

- a polished responsive public website exists;
- public website and app are separate;
- Home works;
- Features works;
- Pricing placeholder works;
- Security works;
- Help Centre works;
- FAQ works;
- About works;
- product screenshots use fictional data;
- Create account and Login CTAs are configurable;
- free invoice generator works without an account;
- free-generator data is not transmitted by default;
- Tallyo Helper works without private data or AI fees;
- helper answers only approved public information;
- future AI adapter remains disabled;
- app has useful website/help links;
- app has a clear install experience;
- offline limitations are stated honestly;
- SEO foundations are complete;
- sitemap and robots are valid;
- Search Console readiness exists;
- landing-page architecture exists;
- analytics abstraction exists;
- analytics is disabled by default;
- no Google tracking script loads;
- event dictionary exists;
- consent abstraction exists;
- necessary is the only default category;
- UTM parameters do not create duplicate canonicals;
- no customer/private data enters analytics;
- growth and paid-ad readiness documentation exists;
- no paid campaign is activated;
- no fake proof appears;
- accessibility tests pass;
- responsive tests pass;
- performance baseline is recorded;
- Cloudflare preview is prepared or safely completed;
- app domain migration dependencies are fully mapped;
- existing deployment remains rollback;
- no live DNS changed;
- no live provider configuration changed;
- no private identity/address is exposed;
- no unfinished legal document is published;
- no unapproved pricing is published;
- no production tracking is activated.

---

# 28. Final Owner Actions

At the end, provide exact steps for any remaining Owner actions, including as applicable:

- Cloudflare access;
- creating free preview projects;
- reviewing preview URLs;
- approving final screenshots;
- approving final marketing wording;
- approving pricing;
- approving public legal documents;
- choosing public support contact;
- entering public business identity;
- Search Console verification;
- Bing verification;
- Supabase Auth domain updates;
- Stripe return URL updates;
- Resend link updates;
- Turnstile hostname;
- custom-domain DNS;
- final deployment;
- analytics provider selection;
- consent activation;
- GA4 activation;
- Google Tag Manager activation;
- Google Ads activation;
- public launch.

Do not bundle these into one implicit approval.

---

# 29. Completion Format

At the end of every work package report:

```text
Completed:
Files changed:
Validation:
Preview:
SEO/growth status:
Tracking status:
Material risks:
Owner approval required:
Branch:
Commit:
Pull request:
Next autonomous work package:
```

At the end of the programme report:

```text
Public website:
Free invoice generator:
Tallyo Helper:
SEO:
Search Console readiness:
Analytics foundations:
Consent foundations:
Advertising readiness:
App integration:
PWA installation:
Cloudflare preview:
Production domain blockers:
Tracking status:
Rollback:
Owner actions:
Branches and commits:
Remaining material risks:
```

Start now with PR 1 and continue through every safe work package without waiting for repeated general permission.
