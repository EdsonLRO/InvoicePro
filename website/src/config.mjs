const trimSlash = (value) => value.replace(/\/+$/, "");

const mode = process.env.TALLYO_SITE_MODE === "production" ? "production" : "preview";
const canonicalOrigin = trimSlash(process.env.TALLYO_CANONICAL_ORIGIN || "https://tallyo.co.uk");
const appUrl = trimSlash(process.env.TALLYO_APP_URL || "https://edsonlro.github.io/InvoicePro/");
const subscriptionCheckoutRequested = process.env.TALLYO_SUBSCRIPTIONS_ENABLED === "true";
const aiHelperRequested = process.env.TALLYO_PUBLIC_AI_HELPER_ENABLED === "true";

if (subscriptionCheckoutRequested) {
  throw new Error("Subscription checkout is blocked until the approved offer, Stripe Billing backend and server-enforced entitlements exist");
}
if (aiHelperRequested && process.env.TALLYO_AI_PRIVATE_PREVIEW_APPROVED !== "true") {
  throw new Error("AI Helper build blocked until the reviewed private-preview scope is approved");
}
if (aiHelperRequested && mode === "production" && process.env.TALLYO_AI_PUBLIC_RELEASE_APPROVED !== "true") {
  throw new Error("AI Helper production build blocked until public release is approved");
}

export const siteConfig = Object.freeze({
  name: "Tallyo",
  mode,
  canonicalOrigin,
  appUrl,
  signupUrl: trimSlash(process.env.TALLYO_SIGNUP_URL || appUrl),
  defaultTitle: "Tallyo — Professional invoices. Faster payments. Less admin.",
  defaultDescription:
    "Create quotes and invoices, accept card payments, automate recurring work and keep customer transactions organised in one straightforward workspace.",
  locale: "en_GB",
  themeColor: "#111a31",
  socialImagePath: "/assets/tallyo-social-card.webp",
  googleSiteVerification: process.env.TALLYO_GOOGLE_SITE_VERIFICATION || "",
  bingSiteVerification: process.env.TALLYO_BING_SITE_VERIFICATION || "",
  aiHelperEnabled: aiHelperRequested,
  subscriptionCheckoutEnabled: false,
  preview: mode !== "production"
});

export const navigation = Object.freeze([
  { label: "Features", href: "/features/" },
  { label: "Product Tour", href: "/product-tour/" },
  { label: "Free Invoice Maker", href: "/free-invoice-generator/" },
  { label: "Pricing", href: "/pricing/" },
  { label: "Security", href: "/security/" },
  { label: "Help", href: "/help/" }
]);

export const footerGroups = Object.freeze([
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features/" },
      { label: "Product Tour", href: "/product-tour/" },
      { label: "Free Invoice Maker", href: "/free-invoice-generator/" },
      { label: "Pricing", href: "/pricing/" },
      { label: "Security", href: "/security/" }
    ]
  },
  {
    title: "Learn",
    links: [
      { label: "Help Centre", href: "/help/" },
      { label: "Tallyo Helper", href: "/helper/" },
      { label: "FAQ", href: "/faq/" },
      { label: "About Tallyo", href: "/about/" },
      { label: "Install Tallyo", href: "/help/#install" }
    ]
  }
]);
