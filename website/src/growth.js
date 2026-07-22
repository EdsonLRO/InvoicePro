import { analyticsConfiguration, createAnalytics, parseCampaignParameters } from "/assets/analytics.mjs";
import { eventPolicy } from "/assets/analytics-policy.mjs";

const analytics = createAnalytics({
  policy: eventPolicy,
  enabled: analyticsConfiguration.enabled,
  environment: document.documentElement.dataset.siteMode || "preview",
  provider: analyticsConfiguration.provider
});

export const trackEvent = analytics.trackEvent;
export const campaignParameters = parseCampaignParameters(window.location.href);

const route = window.location.pathname.replace(/\/+$/, "/") || "/";
const pageEvent = (() => {
  if (route === "/") return ["view_home", {}];
  if (route === "/features/") return ["view_features", {}];
  if (route === "/pricing/") return ["view_pricing", {}];
  if (route === "/security/") return ["view_security", {}];
  if (route === "/helper/") return ["open_tallyo_helper", {}];
  if (route.startsWith("/help/") && route !== "/help/") return ["view_help_article", { content_key: route.split("/")[2] }];
  if (route.startsWith("/industries/")) return ["view_industry_page", { content_key: route.split("/")[2] }];
  return null;
})();

if (pageEvent) trackEvent(...pageEvent);
if (route === "/help/install-tallyo/") trackEvent("view_install_instructions", { placement: "guide" });

const createAccountPlacement = Object.freeze({
  cta_header_create_account: "header",
  cta_hero_create_account: "hero",
  cta_pricing_create_account: "pricing",
  cta_generator_create_account: "generator",
  cta_footer_create_account: "footer"
});

document.addEventListener("click", (event) => {
  const link = event.target?.closest?.("a");
  if (!link) return;
  const createPlacement = link.dataset.analyticsPlacement || createAccountPlacement[link.id];
  if (link.matches("[data-signup-link]") && createPlacement) trackEvent("click_create_account", { placement: createPlacement });
  if (link.matches("[data-login-link]") && createPlacement) trackEvent("click_login", { placement: createPlacement });
});
