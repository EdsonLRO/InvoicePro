import { footerGroups, navigation, siteConfig } from "./config.mjs";
import { applyConnectPaymentCopy } from "./commercial-offer.mjs";
import { faqs } from "./pages.mjs";

const escapeAttribute = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const absoluteUrl = (path) => `${siteConfig.canonicalOrigin}${path === "/" ? "/" : path}`;
const versionedAssetUrl = (path, revision) => {
  if (!/^[a-f0-9]{12}$/.test(revision)) throw new Error("A content-derived asset revision is required");
  return `${path}?v=${revision}`;
};

const footerMarkup = footerGroups.map((group) => `
  <div class="footer-group">
    <h2>${group.title}</h2>
    ${group.links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}
  </div>`).join("");

const cookieConsentMarkup = `
  <section class="cookie-banner" data-cookie-banner hidden aria-labelledby="cookie-banner-title">
    <h2 id="cookie-banner-title">Optional analytics</h2>
    <p>With your permission, Tallyo uses Google Analytics to understand a small set of product and website actions. Analytics stays off until you accept. Read the <a href="/cookies/">Cookie Notice</a>.</p>
    <div class="cookie-actions">
      <button class="cookie-choice" type="button" data-cookie-accept>Accept analytics</button>
      <button class="cookie-choice" type="button" data-cookie-reject>Reject analytics</button>
      <button class="cookie-choice" type="button" data-cookie-settings>Manage preferences</button>
    </div>
  </section>
  <dialog class="cookie-dialog" data-cookie-dialog aria-labelledby="cookie-dialog-title">
    <div class="cookie-dialog-inner">
      <h2 id="cookie-dialog-title">Cookie preferences</h2>
      <p>Choose whether Tallyo may use optional Analytics. You can change this choice later.</p>
      <div class="cookie-category">
        <span><strong>Necessary</strong>Used for the consent choice and essential service or security features. Always on.</span>
        <input type="checkbox" checked disabled aria-label="Necessary storage is always on">
      </div>
      <label class="cookie-category">
        <span><strong>Analytics</strong>Allows the consent-controlled Google tag and the limited events described in the Cookie Notice.</span>
        <input type="checkbox" data-cookie-analytics aria-label="Allow Analytics">
      </label>
      <div class="cookie-actions">
        <button class="cookie-choice" type="button" data-cookie-save>Save preferences</button>
        <button class="cookie-choice" type="button" data-cookie-reject>Reject analytics</button>
        <button class="cookie-choice" type="button" data-cookie-cancel>Cancel</button>
      </div>
    </div>
  </dialog>`;

const schemaFor = (page) => {
  const base = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: absoluteUrl(page.route),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: `${siteConfig.canonicalOrigin}/`
    }
  };

  if (page.schema === "software") {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: siteConfig.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: page.description,
      url: absoluteUrl(page.route)
    };
  }

  if (page.schema === "faq") {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer }
      }))
    };
  }

  const graph = [base];
  if (page.breadcrumbs) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path)
      }))
    });
  }

  if (page.schema === "howto") {
    graph.push({
      "@type": "HowTo",
      name: page.title,
      description: page.description,
      step: page.steps.map(([name, text], index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name,
        text,
        url: `${absoluteUrl(page.route)}#step-${index + 1}`
      }))
    });
  }

  if (graph.length > 1) return { "@context": "https://schema.org", "@graph": graph.map(({ "@context": ignored, ...item }) => item) };

  return base;
};

export const renderPage = (page, { helperKnowledgeJson = "", assetRevision = "" } = {}) => {
  const assetUrl = (path) => versionedAssetUrl(path, assetRevision);
  const canonical = absoluteUrl(page.route);
  const title = page.route === "/" ? siteConfig.defaultTitle : `${page.title} | Tallyo`;
  const description = applyConnectPaymentCopy(page.description, siteConfig.connectPaymentsEnabled);
  const robots = siteConfig.preview || page.noindex ? "noindex, nofollow, noarchive" : "index, follow";
  const socialImage = `${siteConfig.canonicalOrigin}${assetUrl(siteConfig.socialImagePath)}`;
  const navMarkup = navigation.map((item) => `<a href="${item.href}"${page.route === item.href ? ' aria-current="page"' : ""}>${item.label}</a>`).join("");
  const verificationMarkup = [
    siteConfig.googleSiteVerification ? `<meta name="google-site-verification" content="${escapeAttribute(siteConfig.googleSiteVerification)}">` : "",
    siteConfig.bingSiteVerification ? `<meta name="msvalidate.01" content="${escapeAttribute(siteConfig.bingSiteVerification)}">` : ""
  ].filter(Boolean).join("\n  ");
  const content = applyConnectPaymentCopy(page.content
    .replaceAll('data-signup-link href="#"', `data-signup-link href="${escapeAttribute(siteConfig.signupUrl)}"`)
    .replaceAll('data-subscription-link href="#"', `data-subscription-link href="${escapeAttribute(siteConfig.subscriptionUrl)}"`)
    .replaceAll('data-login-link href="#"', `data-login-link href="${escapeAttribute(siteConfig.appUrl)}"`)
    .replaceAll("__TALLYO_ASSET_REVISION__", assetRevision)
    .replaceAll("__TALLYO_MARKETING_OVERVIEW_ENDPOINT__", escapeAttribute(siteConfig.marketingOverviewEndpoint))
    .replace("__TALLYO_HELPER_KNOWLEDGE__", helperKnowledgeJson)
    .replaceAll("__TALLYO_AI_HELPER_ENABLED__", String(siteConfig.aiHelperEnabled))
    .replaceAll(
      "__TALLYO_HELPER_HERO_COPY__",
      siteConfig.aiHelperEnabled
        ? "Ask a general question in your own words. The assistant uses current reviewed Tallyo features and guides, and says when that information is not enough."
        : "Ask about current Tallyo features, documents, payments, installation and account protection. Answers come from a reviewed public knowledge base in this browser."
    )
    .replaceAll(
      "__TALLYO_HELPER_MODE_NOTE__",
      siteConfig.aiHelperEnabled
        ? "For questions that need a more flexible answer, your question is sent securely to OpenAI with selected reviewed guidance. Tallyo does not save this conversation."
        : "Answers are matched in this browser and are not sent to an AI provider."
    )
    .replaceAll(
      "__TALLYO_HELPER_PROVIDER_LIMIT__",
      siteConfig.aiHelperEnabled
        ? "The AI assistant receives only your current question and selected reviewed public Tallyo guidance. It has no account access or tools."
        : "It does not retain user-specific memory or send prompts to a third party."
    ), siteConfig.connectPaymentsEnabled);
  const schema = applyConnectPaymentCopy(
    JSON.stringify(schemaFor({ ...page, description })),
    siteConfig.connectPaymentsEnabled
  );
  const pageScripts = [...new Set(["/assets/growth.js", "/assets/helper.js", ...(page.scripts || [])])]
    .map((src) => `<script type="module" src="${escapeAttribute(assetUrl(src))}"></script>`)
    .join("\n  ");
  const inlineScripts = [schema, helperKnowledgeJson];
  const helperWidgetMarkup = page.helper ? "" : `
  <aside class="helper-widget" data-helper-widget>
    <section class="helper-widget-panel" id="tallyo-helper-widget" data-helper data-ai-enabled="${String(siteConfig.aiHelperEnabled)}" role="dialog" aria-modal="false" aria-labelledby="helper-widget-title" hidden>
      <header class="helper-widget-header">
        <div><span class="helper-widget-mark" aria-hidden="true">T</span><div><h2 id="helper-widget-title">Tallyo Helper</h2><p>Public product guidance</p></div></div>
        <button class="helper-widget-close" type="button" data-helper-close aria-label="Close Tallyo Helper"><span aria-hidden="true">×</span></button>
      </header>
      <p class="helper-widget-boundary">Ask about Tallyo features and workflows. The Helper cannot see your account or records.</p>
      <ol class="helper-conversation helper-widget-conversation" data-helper-conversation aria-label="Tallyo Helper conversation" aria-live="polite" aria-relevant="additions"></ol>
      <form class="helper-form helper-widget-form" data-helper-form>
        <label class="sr-only" for="helper-widget-question">Ask a general question about Tallyo</label>
        <div><input id="helper-widget-question" data-helper-input name="question" type="text" maxlength="240" autocomplete="off" spellcheck="true" placeholder="Ask a question…" required><button class="button button-primary" type="submit">Send</button></div>
      </form>
      <div class="helper-widget-footer"><span>Do not share passwords or private business information.</span><a href="/helper/">Open full Helper</a></div>
      <p class="sr-only" data-helper-status role="status" aria-live="polite"></p>
    </section>
    <button class="helper-fab" type="button" data-helper-toggle aria-expanded="false" aria-controls="tallyo-helper-widget" aria-label="Open Tallyo Helper"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 4.5h13A2.5 2.5 0 0 1 21 7v7a2.5 2.5 0 0 1-2.5 2.5h-7L7 20v-3.5H5.5A2.5 2.5 0 0 1 3 14V7a2.5 2.5 0 0 1 2.5-2.5Z"></path><circle cx="8" cy="10.5" r="1"></circle><circle cx="12" cy="10.5" r="1"></circle><circle cx="16" cy="10.5" r="1"></circle></svg><span class="helper-fab-label">Ask Tallyo</span></button>
  </aside>`;

  return {
    html: `<!doctype html>
<html lang="en-GB" data-site-mode="${siteConfig.mode}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeAttribute(title)}</title>
  <meta name="description" content="${escapeAttribute(description)}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="${siteConfig.themeColor}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" sizes="192x192" href="${assetUrl("/assets/icon-192.png")}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Tallyo">
  <meta property="og:locale" content="${siteConfig.locale}">
  <meta property="og:title" content="${escapeAttribute(title)}">
  <meta property="og:description" content="${escapeAttribute(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Tallyo — Professional invoices. Faster payments. Less admin.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttribute(title)}">
  <meta name="twitter:description" content="${escapeAttribute(description)}">
  <meta name="twitter:image" content="${socialImage}">
  ${verificationMarkup}
  <link rel="stylesheet" href="${assetUrl("/assets/styles.css")}">
  <link rel="stylesheet" href="${assetUrl("/assets/analytics-consent.css")}">
  <script type="application/ld+json">${schema}</script>
  <script src="${assetUrl("/assets/site.js")}" defer></script>
  ${pageScripts}
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${siteConfig.preview ? '<div class="preview-banner" role="status">Private preview build — not for public indexing</div>' : ""}
  <header class="site-header" data-header>
    <div class="header-inner">
      <a class="brand" href="/" aria-label="Tallyo home"><span class="brand-wordmark-dark" aria-hidden="true"><img class="brand-wordmark-dark-base" src="${assetUrl("/assets/tallyo-wordmark-white.png")}" alt=""><img class="brand-wordmark-dark-colour" src="${assetUrl("/assets/tallyo-wordmark-white.png")}" alt=""></span></a>
      <a class="header-install-shortcut" href="/help/install-tallyo/" aria-label="Install Tallyo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v10"></path><path d="m8.5 9.5 3.5 3.5 3.5-3.5"></path><path d="M5 16.5v2A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-2"></path></svg><span>Install</span></a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-navigation" data-menu-button><span class="sr-only">Open main menu</span><i></i><i></i><i></i></button>
      <nav class="primary-nav" id="primary-navigation" aria-label="Main navigation" data-navigation>
        <div class="nav-links"><button class="nav-cookie-settings" type="button" data-cookie-settings hidden aria-label="Cookie settings" title="Cookie settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 13.1A8.5 8.5 0 0 1 10.9 3.8 8.5 8.5 0 1 0 20.2 13.1Z"></path><circle cx="8.2" cy="12.1" r="1"></circle><circle cx="12.3" cy="16" r="1"></circle><circle cx="7.3" cy="17.2" r=".8"></circle></svg><span>Cookie settings</span></button>${navMarkup}</div>
        <a class="nav-install-link" href="/help/install-tallyo/"${page.route === "/help/install-tallyo/" ? ' aria-current="page"' : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v10"></path><path d="m8.5 9.5 3.5 3.5 3.5-3.5"></path><path d="M5 16.5v2A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-2"></path></svg><span>Install Tallyo</span></a>
        <div class="nav-actions"><a class="login-link" id="cta_login" data-login-link data-analytics-placement="header" href="${escapeAttribute(siteConfig.appUrl)}">Log in</a><a class="button button-primary button-small" id="cta_header_create_account" data-signup-link data-analytics-placement="header" href="${escapeAttribute(siteConfig.signupUrl)}">Create account</a></div>
      </nav>
    </div>
  </header>
  <main id="main-content" tabindex="-1">${content}</main>
  ${helperWidgetMarkup}
  <footer class="site-footer">
    <div class="footer-main">
      <div class="footer-group footer-account"><h2>Account</h2><a data-login-link data-analytics-placement="footer" href="${escapeAttribute(siteConfig.appUrl)}">Log in</a><a data-signup-link data-analytics-placement="footer" href="${escapeAttribute(siteConfig.signupUrl)}">Create account</a><a href="/help/install-tallyo/">Install Tallyo</a></div>
      ${footerMarkup}
      <div class="footer-intro"><a class="brand brand-footer" href="/" aria-label="Tallyo home"><img class="brand-wordmark" src="${assetUrl("/assets/tallyo-wordmark-white.png")}" alt="" aria-hidden="true"><span class="sr-only">Tallyo</span></a><p>Professional invoices, clearer payment tracking and less repeated admin for your business.</p></div>
    </div>
    <div class="footer-bottom"><p>© <span data-current-year></span> Tallyo.</p><p>Tallyo is not a full accounting suite and does not provide legal, tax or accounting advice.</p></div>
  </footer>
  <script type="application/json" id="helper-knowledge">${helperKnowledgeJson}</script>
  ${cookieConsentMarkup}
</body>
</html>`,
    schema,
    inlineScripts
  };
};
