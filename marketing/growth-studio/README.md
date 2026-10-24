# Growth Studio visual library

`capture-real-screenshots.mjs` opens the current Tallyo application in the
repository's loopback-only preview and captures the actual rendered product
interface. It uses the fictional North & Stone and Willow & Pine Studio fixture,
blocks every external request, and performs no email, payment or account action.

The current captures are stored in
`website/public/assets/product/growth-studio/`. `render.mjs` places those real
screens inside the 1200 × 1200 Growth Studio additions in
`website/public/assets/social/linkedin/33-*.png` through `39-*.png`.

Growth Studio also exposes verbatim copies of the accepted-quote, Income
Insights and Income Pack captures as `40-product-*.png` through
`42-product-*.png`. Use those entries when a post calls for a raw product
screenshot rather than a branded campaign composition.

The visuals follow the existing Tallyo LinkedIn system and use only
`website/public/assets/tallyo-wordmark-white.png` for the public wordmark. The
product areas are screenshots of the real current app components, not drawn or
AI-generated interface mockups. They are not captures of a live customer
account.

The set covers accepted quote to invoice, Income Insights, Income Pack, four
document layouts, the real quote-email review, Google sign-in, and the
draft-first Owner Growth Studio workflow. The complete library also uses
feature-specific captures from the same current preview for the dashboard,
invoices, bulk actions, saved services, recurring schedule editing and history,
customer records, reminders, branding, business defaults, subscription and
account controls, deposits and activity.

Refresh the real captures first, then render the social cards with a
Playwright-compatible Node environment:

```powershell
node marketing/growth-studio/capture-real-screenshots.mjs
node marketing/linkedin/render.mjs
node marketing/growth-studio/render.mjs
```

Do not replace a capture with drawn interface markup. Do not add real customer
details, real inbox content, authentication secrets, or claims that Income
Insights includes expenses, profit, tax due, or HMRC filing.
