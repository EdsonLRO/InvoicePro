import { bindAnalyticsConsentUi, createGa4ConsentClient } from "./analytics-consent.mjs";

const analytics = createGa4ConsentClient({
  enabled: window.TALLYO_GA4_ENABLED === true,
  environment: "production",
  measurementId: String(window.TALLYO_GA4_MEASUREMENT_ID || "")
});

const bind = () => bindAnalyticsConsentUi({ client: analytics });
const initialise = () => {
  const noticeLink = document.querySelector("[data-cookie-notice-link]");
  try {
    const publicSite = new URL(String(window.TALLYO_PUBLIC_SITE_URL || ""));
    if (publicSite.protocol !== "https:" && publicSite.hostname !== "localhost" && publicSite.hostname !== "127.0.0.1") {
      throw new Error("Unsupported public site");
    }
    noticeLink.href = new URL("cookies/", publicSite.href.endsWith("/") ? publicSite.href : `${publicSite.href}/`).href;
    noticeLink.hidden = false;
  } catch {
    noticeLink?.remove();
  }
  bind();
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
else initialise();

window.TallyoAnalytics = Object.freeze({
  trackEvent(name) {
    return analytics.trackEvent(name);
  },
  consentState() {
    return analytics.getConsentState();
  }
});
