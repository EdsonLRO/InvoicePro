# Growth Studio visual library

`render.mjs` generates the Growth Studio additions in
`website/public/assets/social/linkedin/33-*.png` through `39-*.png`.

The visuals follow the existing 1200 × 1200 Tallyo LinkedIn system and use the
canonical Tallyo wordmark. Product views contain fictional North & Stone and
Willow & Pine Studio data only. They are deterministic interface previews based
on released workflows; they are not captures of a real customer account.

The set covers accepted quote to invoice, Income Insights, Income Pack, four
document layouts, branded customer email presentation, Google sign-in, and the
draft-first Owner Growth Studio workflow.

Render with a Playwright-compatible Node environment:

```powershell
node marketing/growth-studio/render.mjs
```

Do not add real customer details, real inbox content, authentication secrets, or
claims that Income Insights includes expenses, profit, tax due, or HMRC filing.
