import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("playwright-core")); }

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const outputDir = path.join(repoRoot, "website", "public", "assets", "product", "growth-studio");
const { artifact, serve } = await import("../../dev/redesign/preview.mjs");

const viewport = { width: 1440, height: 900 };
const screenshot = async (page, name) => {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({
    path: path.join(outputDir, name),
    type: "png",
    clip: { x: 0, y: 0, width: viewport.width, height: viewport.height },
  });
};

const getVm = () => document.querySelector("#app").__vue_app__._container._vnode.component.proxy;

fs.mkdirSync(outputDir, { recursive: true });
const server = await serve(await artifact(), 0);
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true, ignoreDefaultArgs: ["--hide-scrollbars"] });
const context = await browser.newContext({ viewport, serviceWorkers: "block" });
const outsideRequests = [];
const pageErrors = [];

await context.route("**/*", (route) => {
  if (route.request().url().startsWith(`${origin}/`)) return route.continue();
  outsideRequests.push(route.request().url());
  return route.abort();
});

try {
  const page = await context.newPage();
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.clock.setFixedTime(new Date("2026-10-14T10:00:00Z"));

  const open = async (route) => {
    await page.goto(`${origin}/${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(document.querySelector("#app")?.__vue_app__?._container?._vnode?.component?.proxy));
    await page.evaluate(() => {
      const vm = document.querySelector("#app").__vue_app__._container._vnode.component.proxy;
      if (vm.documentEmailModal) vm.documentEmailModal.open = false;
      if (vm.documentCancellation) vm.documentCancellation.open = false;
      if (vm.stripeRefundModal) vm.stripeRefundModal.open = false;
    });
    if (await page.locator("#preview-warning").count()) {
      await page.locator("#preview-warning").evaluate((element) => element.remove());
    }
    await page.addStyleTag({ content: "#app{height:100dvh!important}.shell-sidebar{top:0!important}.shell-main{scrollbar-width:none}.shell-main::-webkit-scrollbar{display:none}" });
    await page.evaluate(() => {
      const main = document.querySelector(".shell-main");
      if (main) main.scrollTop = 0;
      window.scrollTo(0, 0);
    });
  };

  await open("#dashboard");
  await page.getByRole("heading", { name: /Good morning/ }).waitFor();
  await screenshot(page, "dashboard-overview.png");

  await open("#items");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    vm.savedItems.push(
      { id: "fictional-service-two", name: "On-site consultation", description: "Reusable fictional service", price: 95 },
      { id: "fictional-service-three", name: "Project materials", description: "Reusable fictional materials", price: 320 },
    );
  }, getVm.toString());
  await page.getByRole("heading", { name: "Products & services", exact: true }).waitFor();
  await screenshot(page, "products-services.png");

  await open("#recurring");
  await page.getByRole("heading", { name: "Recurring Invoices", exact: true }).waitFor();
  await screenshot(page, "recurring-invoices.png");
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  await page.getByRole("heading", { name: "Edit Schedule", exact: true }).waitFor();
  await screenshot(page, "recurring-edit.png");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    vm.recurringForm.history = [
      { type: "created", ts: "2026-09-14T09:00:00Z", text: "Fictional schedule created" },
      { type: "edited", ts: "2026-10-01T10:30:00Z", text: "Changed next invoice date" },
      { type: "generated", ts: "2026-10-14T08:00:00Z", text: "Generated fictional invoice INV-1047" },
    ];
  }, getVm.toString());
  const scheduleHistory = page.getByRole("heading", { name: "Schedule History", exact: true });
  await scheduleHistory.scrollIntoViewIfNeeded();
  await screenshot(page, "recurring-history.png");

  await open("#customers");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    vm.openCustomerContext(vm.customers[0]);
  }, getVm.toString());
  await page.getByRole("heading", { name: /Willow & Pine Studio/ }).waitFor();
  await screenshot(page, "customer-record.png");
  await page.getByRole("button", { name: "Edit customer", exact: true }).click();
  await page.getByRole("heading", { name: "Edit Customer", exact: true }).waitFor();
  await screenshot(page, "customer-details.png");

  await open("#edit");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    const invoice = vm.invoices.find((entry) => entry.docType === "invoice" && entry.status === "Sent" && new Date(entry.dueDate) > new Date());
    vm.loadInvoice(invoice || vm.invoices.find((entry) => entry.docType === "invoice"));
  }, getVm.toString());
  await page.getByRole("heading", { name: /Edit Invoice/ }).waitFor();
  await screenshot(page, "invoice-editor.png");

  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    vm.draft.overdueRemindersEnabled = true;
    vm.draft.overdueFirstReminderDays = 3;
    vm.draft.overdueRepeatReminderDays = 7;
    vm.draft.overdueMaxReminders = 3;
    vm.editorSections.reminders = true;
  }, getVm.toString());
  const reminders = page.locator("details.editor-aux").filter({ hasText: "Overdue reminders" });
  await reminders.scrollIntoViewIfNeeded();
  await screenshot(page, "automatic-reminders.png");

  await open("#invoices");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    vm.invoiceTypeFilter = "invoice";
    vm.invoiceStatusFilter = "Overdue";
    vm.invoices.filter((entry) => entry.docType === "invoice" && vm.effectiveStatus(entry) === "Overdue")
      .forEach((entry, index) => { entry.overdueRemindersEnabled = index === 0; });
  }, getVm.toString());
  await page.getByRole("heading", { name: "Invoices", exact: true }).waitFor();
  await screenshot(page, "overdue-invoices.png");

  await open("#invoices");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    vm.invoiceTypeFilter = "All";
    vm.invoiceStatusFilter = "All";
  }, getVm.toString());
  const documentsPage = page.locator(".documents-page");
  await documentsPage.locator("label.list-select-page input").check();
  await documentsPage.getByText(/\d+ selected/).waitFor();
  await screenshot(page, "invoice-list-actions.png");

  await open("#edit");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    const invoice = vm.invoices.find((entry) => entry.docType === "invoice" && entry.status === "Sent" && new Date(entry.dueDate) > new Date());
    vm.loadInvoice(invoice || vm.invoices.find((entry) => entry.docType === "invoice"));
    vm.draft.history.push(
      { type: "reminder", ts: "2026-10-13T08:30:00Z", text: "Fictional payment reminder recorded" },
      { type: "payment", ts: "2026-10-14T09:15:00Z", text: "Fictional part payment recorded" },
    );
    vm.editorSections.activity = true;
  }, getVm.toString());
  const activity = page.locator("details.editor-activity");
  await activity.scrollIntoViewIfNeeded();
  await screenshot(page, "activity-history.png");

  await open("#edit");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    const invoice = vm.invoices.find((entry) => entry.docType === "invoice" && entry.status === "Sent" && new Date(entry.dueDate) > new Date());
    vm.loadInvoice(invoice || vm.invoices.find((entry) => entry.docType === "invoice"));
    vm.stripeConnect = {
      available: true,
      busy: false,
      error: "",
      account: { onboarding_state: "active", card_payments_status: "active", payouts_status: "active" },
    };
    vm.draft.onlinePaymentMode = "deposit";
    vm.draft.depositAmount = 500;
    vm.documentEmailModal = {
      open: true,
      inv: vm.draft,
      to: vm.draft.customer.email,
      includeOnlinePayment: true,
      paymentKind: "deposit",
      autoSendOnAcceptance: false,
      autoSendDueDays: 14,
      sending: false,
      error: "",
    };
  }, getVm.toString());
  await page.getByRole("heading", { name: "Email Invoice", exact: true }).waitFor();
  await screenshot(page, "deposit-request.png");

  await open("#branding");
  await page.getByRole("heading", { name: "Branding", exact: true }).waitFor();
  await screenshot(page, "document-layouts.png");

  await open("#settings");
  await page.getByRole("heading", { name: "Business settings", exact: true }).waitFor();
  await screenshot(page, "business-settings.png");
  const defaults = page.getByRole("heading", { name: "Invoicing Defaults", exact: true });
  await defaults.scrollIntoViewIfNeeded();
  await screenshot(page, "business-defaults.png");

  await open("#account");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    vm.currentUser = { ...(vm.currentUser || {}), email: "owner@northstone.example" };
    vm.billing.enabled = true;
    vm.billing.complimentaryAccess = false;
    vm.billing.trialEnabled = true;
    vm.billing.trialAvailable = false;
    vm.billing.subscription = {
      billing_interval: "monthly",
      provider_status: "active",
      current_period_end: "2026-11-14T00:00:00Z",
    };
    vm.billing.entitlement = { access_state: "full" };
    vm.stripeConnect = {
      available: true,
      busy: false,
      error: "",
      account: { onboarding_state: "active", card_payments_status: "active", payouts_status: "active" },
    };
    vm.mfa.enabled = true;
    vm.mfa.step = "idle";
    vm.mfa.verifiedFactors = [{
      id: "fictional-primary-authenticator",
      factor_type: "totp",
      friendly_name: "Primary authenticator",
    }];
    vm.mfaRecovery.codesGeneratedAt = "2026-10-14T09:00:00Z";
  }, getVm.toString());
  const subscription = page.getByRole("heading", { name: "Tallyo Subscription", exact: true });
  await subscription.scrollIntoViewIfNeeded();
  await screenshot(page, "account-subscription.png");
  const accountSecurity = page.getByRole("heading", { name: "Two-Factor Authentication", exact: true });
  await accountSecurity.scrollIntoViewIfNeeded();
  await screenshot(page, "account-security.png");
  const signOut = page.getByRole("heading", { name: "Sign Out", exact: true });
  await signOut.scrollIntoViewIfNeeded();
  await screenshot(page, "account-data-sessions.png");

  await open("#dashboard");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    const quote = vm.invoices.find((entry) => entry.docType === "quote");
    quote.status = "Accepted";
    quote.quoteAcceptedAt = "2026-10-14T09:30:00Z";
    vm.invoices = [{
      ...JSON.parse(JSON.stringify(quote)),
      id: "00000000-0000-4000-8000-000000001048",
      number: "INV-1048",
      docType: "invoice",
      status: "Draft",
      sourceQuoteId: quote.id,
      date: "2026-10-14",
      dueDate: "2026-10-28",
      payments: [],
    }, ...vm.invoices];
    vm.$forceUpdate();
  }, getVm.toString());
  await page.getByText(/Quote accepted/).first().waitFor();
  await screenshot(page, "accepted-quote-invoice.png");

  await open("#finances");
  await page.getByRole("heading", { name: "Your finances", exact: true }).waitFor();
  await screenshot(page, "income-insights.png");

  await open("#finances-exports");
  await page.getByRole("heading", { name: "Prepare income records", exact: true }).waitFor();
  await screenshot(page, "income-pack.png");

  await open("#invoices");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    const quote = vm.invoices.find((entry) => entry.docType === "quote");
    vm.sendDocumentEmail(quote);
    vm.documentEmailModal.autoSendOnAcceptance = true;
    vm.documentEmailModal.autoSendDueDays = 14;
  }, getVm.toString());
  await page.getByRole("heading", { name: "Email Quote", exact: true }).waitFor();
  await screenshot(page, "quote-email-review.png");

  await open("#growth");
  await page.getByRole("heading", { name: "Tallyo Growth Studio", exact: true }).waitFor();
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    vm.growthDiscoveryError = "";
  }, getVm.toString());
  await page.getByRole("button", { name: "Content Studio", exact: true }).click();
  await page.getByRole("heading", { name: /Edit LinkedIn draft/ }).waitFor();
  await screenshot(page, "growth-studio.png");

  await open("");
  await page.evaluate(getVm => {
    const vm = Function(`return (${getVm})`)()();
    vm.authMode = "login";
    vm.isLoggedIn = false;
    vm.currentUser = null;
    vm.turnstile.enabled = false;
  }, getVm.toString());
  await page.getByRole("button", { name: "Continue with Google", exact: true }).waitFor();
  await screenshot(page, "google-sign-in.png");

  if (outsideRequests.length) throw new Error(`Screenshot capture attempted external requests: ${outsideRequests.join(", ")}`);
  if (pageErrors.length) throw new Error(`Screenshot capture page errors: ${pageErrors.join(" | ")}`);
} finally {
  await context.close();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

console.log(`Captured 26 current Tallyo interface screenshots with fictional preview data in ${outputDir}`);
