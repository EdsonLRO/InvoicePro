const trimSlash = (value) => value.replace(/\/+$/, "");

const mode = process.env.TALLYO_SITE_MODE === "production" ? "production" : "preview";
const canonicalOrigin = trimSlash(process.env.TALLYO_CANONICAL_ORIGIN || "https://tallyo.co.uk");
const appUrl = trimSlash(process.env.TALLYO_APP_URL || "https://edsonlro.github.io/InvoicePro/");
const subscriptionCheckoutRequested = process.env.TALLYO_SUBSCRIPTIONS_ENABLED === "true";
const aiHelperRequested = process.env.TALLYO_PUBLIC_AI_HELPER_ENABLED === "true";
const connectPaymentsRequested = process.env.TALLYO_CONNECT_PAYMENTS_ENABLED === "true";
const analyticsRequested = process.env.TALLYO_GA4_ENABLED === "true";
const ga4MeasurementId = String(process.env.TALLYO_GA4_MEASUREMENT_ID || "").trim();
const marketingOverviewRequested = process.env.TALLYO_MARKETING_OVERVIEW_ENABLED === "true";
const marketingOverviewEndpoint = String(process.env.TALLYO_MARKETING_OVERVIEW_ENDPOINT || "").trim();

if (
  subscriptionCheckoutRequested &&
  mode !== "production" &&
  process.env.TALLYO_SUBSCRIPTION_PRIVATE_PREVIEW_APPROVED !== "true"
) {
  throw new Error("Subscription preview build blocked until the reviewed private-preview scope is approved");
}
if (
  subscriptionCheckoutRequested &&
  mode === "production" &&
  process.env.TALLYO_SUBSCRIPTION_PUBLIC_RELEASE_APPROVED !== "true"
) {
  throw new Error("Subscription production build blocked until public release is approved");
}
if (aiHelperRequested && process.env.TALLYO_AI_PRIVATE_PREVIEW_APPROVED !== "true") {
  throw new Error("AI Helper build blocked until the reviewed private-preview scope is approved");
}
if (aiHelperRequested && mode === "production" && process.env.TALLYO_AI_PUBLIC_RELEASE_APPROVED !== "true") {
  throw new Error("AI Helper production build blocked until public release is approved");
}
if (
  connectPaymentsRequested &&
  mode !== "production" &&
  process.env.TALLYO_CONNECT_PRIVATE_PREVIEW_APPROVED !== "true"
) {
  throw new Error("Customer card-payment preview build blocked until the reviewed private-preview scope is approved");
}
if (
  connectPaymentsRequested &&
  mode === "production" &&
  process.env.TALLYO_CONNECT_PUBLIC_RELEASE_APPROVED !== "true"
) {
  throw new Error("Customer card-payment production build blocked until public release is approved");
}
if (analyticsRequested && ga4MeasurementId !== "G-PZFZKCWZ7M") {
  throw new Error("The reviewed Tallyo GA4 Measurement ID is required when Analytics is enabled");
}
if (
  analyticsRequested &&
  mode !== "production" &&
  process.env.TALLYO_GA4_PRIVATE_PREVIEW_APPROVED !== "true"
) {
  throw new Error("Analytics preview build blocked until the reviewed private-preview scope is approved");
}
if (
  analyticsRequested &&
  mode === "production" &&
  process.env.TALLYO_GA4_PUBLIC_RELEASE_APPROVED !== "true"
) {
  throw new Error("Analytics production build blocked until public release is approved");
}
if (marketingOverviewRequested) {
  let endpoint;
  try {
    endpoint = new URL(marketingOverviewEndpoint);
  } catch {
    throw new Error("A valid marketing overview endpoint is required when the feature is enabled");
  }
  if (endpoint.protocol !== "https:") {
    throw new Error("The marketing overview endpoint must use HTTPS");
  }
  if (mode !== "production" && process.env.TALLYO_MARKETING_OVERVIEW_PRIVATE_PREVIEW_APPROVED !== "true") {
    throw new Error("Marketing overview preview build blocked until the reviewed private-preview scope is approved");
  }
  if (mode === "production" && process.env.TALLYO_MARKETING_OVERVIEW_PUBLIC_RELEASE_APPROVED !== "true") {
    throw new Error("Marketing overview production build blocked until public release is approved");
  }
}

export const siteConfig = Object.freeze({
  name: "Tallyo",
  mode,
  canonicalOrigin,
  appUrl,
  signupUrl: trimSlash(process.env.TALLYO_SIGNUP_URL || appUrl),
  subscriptionUrl: trimSlash(process.env.TALLYO_SUBSCRIPTION_URL || `${appUrl}/#account`),
  defaultTitle: "Tallyo — Professional invoices. Clearer payment tracking. Less admin.",
  defaultDescription:
    "Create quotes and invoices, track payments, automate recurring work and keep customer transactions organised in one straightforward workspace.",
  locale: "en_GB",
  themeColor: "#111a31",
  socialImagePath: "/assets/tallyo-social-card.webp",
  googleSiteVerification: process.env.TALLYO_GOOGLE_SITE_VERIFICATION || "",
  bingSiteVerification: process.env.TALLYO_BING_SITE_VERIFICATION || "",
  aiHelperEnabled: aiHelperRequested,
  subscriptionCheckoutEnabled: subscriptionCheckoutRequested,
  connectPaymentsEnabled: connectPaymentsRequested,
  analyticsEnabled: analyticsRequested,
  ga4MeasurementId: analyticsRequested ? ga4MeasurementId : "",
  marketingOverviewEnabled: marketingOverviewRequested,
  marketingOverviewEndpoint: marketingOverviewRequested ? marketingOverviewEndpoint : "",
  marketingOverviewOrigin: marketingOverviewRequested ? new URL(marketingOverviewEndpoint).origin : "",
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
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms/" },
      { label: "Privacy Notice", href: "/privacy/" },
      { label: "Cookie Notice", href: "/cookies/" },
      { label: "Data Processing Terms", href: "/data-processing-terms/" }
    ]
  }
]);
