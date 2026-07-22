const trimSlash = (value) => value.replace(/\/+$/, "");

const mode = process.env.TALLYO_SITE_MODE === "production" ? "production" : "preview";
const canonicalOrigin = trimSlash(process.env.TALLYO_CANONICAL_ORIGIN || "https://tallyo.co.uk");
const appUrl = trimSlash(process.env.TALLYO_APP_URL || "https://edsonlro.github.io/InvoicePro/");

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
  preview: mode !== "production"
});

export const navigation = Object.freeze([
  { label: "Features", href: "/features/" },
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
      { label: "Free Invoice Maker", href: "/free-invoice-generator/" },
      { label: "Pricing", href: "/pricing/" },
      { label: "Security", href: "/security/" }
    ]
  },
  {
    title: "Learn",
    links: [
      { label: "Help Centre", href: "/help/" },
      { label: "FAQ", href: "/faq/" },
      { label: "About Tallyo", href: "/about/" },
      { label: "Install Tallyo", href: "/help/#install" }
    ]
  }
]);
