# Tallyo advertising creative set

This folder contains the current square advertising set for the refreshed Tallyo website and app. The creative uses the same visual system as the earlier approved social images: navy-to-purple header, mint accent, large plain-language headline and a framed product view.

## Deliverables

All images are 1200 × 1200 PNG files in `assets/`.

1. Free Invoice Maker
2. Finished invoice
3–7. Five-part quote-to-payment carousel
8. Recurring invoice setup
9. Recurring invoice overview
10. Business overview
11. Deposits and remaining balances
12. Overdue reminders
13. Seven-day Tallyo Pro trial
14. Online cancellation

The quote carousel follows the real product order: send the quote, customer accepts, one linked invoice is created, payment is recorded and the activity stays together. Automatic invoice email is described as an owner choice, not a default.

The trial images state the current offer: seven days with every Tallyo Pro feature, card required, reminder three days before the trial ends, then £8 per month unless cancelled. The cancellation image makes online cancellation clear.

## Source policy

- Product captures come from `website/public/assets/product/` and use fictional businesses and customers.
- The Free Invoice Maker capture is cropped to the editor and preview so the older navigation is not part of the creative.
- The quote-send and recurring-setup views are focused code-native recreations of the released choices so the important wording remains readable at social-image size.
- Trial and cancellation screens are clean code-native recreations of the released interface. They do not contain a test account, real email address, live Stripe session or changing trial date.
- No live checkout, email, payment, customer record or provider action is used to render these images.

## Regenerate

Run:

```powershell
node marketing/advertising/render.mjs
```

The renderer requires Playwright or Playwright Core and Google Chrome. It overwrites only the PNG files in `marketing/advertising/assets/`.
