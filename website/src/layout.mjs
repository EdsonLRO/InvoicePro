import { footerGroups, navigation, siteConfig } from "./config.mjs";
import { faqs } from "./pages.mjs";

const escapeAttribute = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const absoluteUrl = (path) => `${siteConfig.canonicalOrigin}${path === "/" ? "/" : path}`;

const footerMarkup = footerGroups.map((group) => `
  <div class="footer-group">
    <h2>${group.title}</h2>
    ${group.links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}
  </div>`).join("");

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

export const renderPage = (page, { helperKnowledgeJson = "" } = {}) => {
  const canonical = absoluteUrl(page.route);
  const title = page.route === "/" ? siteConfig.defaultTitle : `${page.title} | Tallyo`;
  const robots = siteConfig.preview ? "noindex, nofollow, noarchive" : "index, follow";
  const socialImage = `${siteConfig.canonicalOrigin}${siteConfig.socialImagePath}`;
  const navMarkup = navigation.map((item) => `<a href="${item.href}"${page.route === item.href ? ' aria-current="page"' : ""}>${item.label}</a>`).join("");
  const verificationMarkup = [
    siteConfig.googleSiteVerification ? `<meta name="google-site-verification" content="${escapeAttribute(siteConfig.googleSiteVerification)}">` : "",
    siteConfig.bingSiteVerification ? `<meta name="msvalidate.01" content="${escapeAttribute(siteConfig.bingSiteVerification)}">` : ""
  ].filter(Boolean).join("\n  ");
  const content = page.content
    .replaceAll('data-signup-link href="#"', `data-signup-link href="${escapeAttribute(siteConfig.signupUrl)}"`)
    .replaceAll('data-login-link href="#"', `data-login-link href="${escapeAttribute(siteConfig.appUrl)}"`)
    .replace("__TALLYO_HELPER_KNOWLEDGE__", helperKnowledgeJson)
    .replaceAll("__TALLYO_AI_HELPER_ENABLED__", String(siteConfig.aiHelperEnabled))
    .replaceAll(
      "__TALLYO_HELPER_HERO_COPY__",
      siteConfig.aiHelperEnabled
        ? "Ask a general question in your own words. The assistant answers from reviewed public Tallyo guidance and falls back safely when it is unsure."
        : "Ask about current Tallyo features, documents, payments, installation and account protection. Answers come from a reviewed public knowledge base in this browser."
    )
    .replaceAll(
      "__TALLYO_HELPER_MODE_NOTE__",
      siteConfig.aiHelperEnabled
        ? "For questions that need a more flexible answer, your question is sent securely to OpenAI. Tallyo does not save this conversation."
        : "Answers are matched in this browser and are not sent to an AI provider."
    )
    .replaceAll(
      "__TALLYO_HELPER_PROVIDER_LIMIT__",
      siteConfig.aiHelperEnabled
        ? "The AI assistant receives only your current question and reviewed public Tallyo guidance. It has no account access or tools."
        : "It does not retain user-specific memory or send prompts to a third party."
    );
  const schema = JSON.stringify(schemaFor(page));
  const pageScripts = ["/assets/growth.js", ...(page.scripts || [])].map((src) => `<script type="module" src="${escapeAttribute(src)}"></script>`).join("\n  ");
  const inlineScripts = [schema, ...(page.helper ? [helperKnowledgeJson] : [])];

  return {
    html: `<!doctype html>
<html lang="en-GB" data-site-mode="${siteConfig.mode}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeAttribute(title)}</title>
  <meta name="description" content="${escapeAttribute(page.description)}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="${siteConfig.themeColor}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Tallyo">
  <meta property="og:locale" content="${siteConfig.locale}">
  <meta property="og:title" content="${escapeAttribute(title)}">
  <meta property="og:description" content="${escapeAttribute(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Tallyo — Professional invoices. Faster payments. Less admin.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttribute(title)}">
  <meta name="twitter:description" content="${escapeAttribute(page.description)}">
  <meta name="twitter:image" content="${socialImage}">
  ${verificationMarkup}
  <link rel="stylesheet" href="/assets/styles.css">
  <script type="application/ld+json">${schema}</script>
  <script src="/assets/site.js" defer></script>
  ${pageScripts}
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${siteConfig.preview ? '<div class="preview-banner" role="status">Private preview build — not for public indexing</div>' : ""}
  <header class="site-header" data-header>
    <div class="header-inner">
      <a class="brand" href="/" aria-label="Tallyo home"><img class="brand-mark" src="/assets/tallyo-mark.png" alt="" aria-hidden="true"><span>Tallyo</span></a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-navigation" data-menu-button><span class="sr-only">Open main menu</span><i></i><i></i><i></i></button>
      <nav class="primary-nav" id="primary-navigation" aria-label="Main navigation" data-navigation>
        <div class="nav-links">${navMarkup}</div>
        <div class="nav-actions"><a class="login-link" id="cta_login" data-login-link data-analytics-placement="header" href="${escapeAttribute(siteConfig.appUrl)}">Log in</a><a class="button button-primary button-small" id="cta_header_create_account" data-signup-link data-analytics-placement="header" href="${escapeAttribute(siteConfig.signupUrl)}">Create account</a></div>
      </nav>
    </div>
  </header>
  <main id="main-content" tabindex="-1">${content}</main>
  <footer class="site-footer">
    <div class="footer-main">
      <div class="footer-intro"><a class="brand brand-footer" href="/" aria-label="Tallyo home"><img class="brand-wordmark" src="/assets/tallyo-wordmark-white.png" alt="" aria-hidden="true"><span class="sr-only">Tallyo</span></a><p>Professional invoices, clearer payment tracking and less repeated admin for UK small businesses.</p></div>
      ${footerMarkup}
      <div class="footer-group"><h2>Account</h2><a data-login-link data-analytics-placement="footer" href="${escapeAttribute(siteConfig.appUrl)}">Log in</a><a data-signup-link data-analytics-placement="footer" href="${escapeAttribute(siteConfig.signupUrl)}">Create account</a><a href="/help/#install">Install Tallyo</a></div>
    </div>
    <div class="footer-bottom"><p>© <span data-current-year></span> Tallyo. Product preview.</p><p>Tallyo is not a full accounting suite and does not provide legal, tax or accounting advice.</p></div>
  </footer>
</body>
</html>`,
    schema,
    inlineScripts
  };
};
