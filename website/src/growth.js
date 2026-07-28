import { bindAnalyticsConsentUi, createGa4ConsentClient } from "/assets/analytics-consent.mjs?v=__TALLYO_ASSET_REVISION__";
import { analyticsConfiguration } from "/assets/analytics-config.mjs?v=__TALLYO_ASSET_REVISION__";

const analytics = createGa4ConsentClient({
  enabled: analyticsConfiguration.enabled,
  environment: analyticsConfiguration.environment,
  measurementId: analyticsConfiguration.measurementId
});

export const trackEvent = analytics.trackEvent;
window.TallyoAnalytics = analytics;

const route = window.location.pathname.replace(/\/+$/, "/") || "/";
bindAnalyticsConsentUi({
  client: analytics,
  onConsentChange(choice) {
    if (choice === "granted" && route === "/pricing/") trackEvent("view_pricing");
  }
});
if (route === "/pricing/") trackEvent("view_pricing");

document.addEventListener("click", (event) => {
  const link = event.target?.closest?.("a");
  if (!link) return;
  if (link.href === "mailto:main@tallyo.co.uk" || link.getAttribute("href") === "mailto:main@tallyo.co.uk") {
    trackEvent("contact_support");
  }
});

window.addEventListener("tallyo:analytics", (event) => {
  if (typeof event.detail?.name === "string") trackEvent(event.detail.name);
});
