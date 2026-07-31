import { calculateDocument, formatMoney } from "./document-calculator.mjs?v=__TALLYO_ASSET_REVISION__";
import { buildOverviewRequest, createPreparedDownloadController } from "./marketing-overview.mjs?v=__TALLYO_ASSET_REVISION__";

const roots = document.querySelectorAll("[data-generator]");
const emitAnalyticsEvent = (name) => window.dispatchEvent(new CustomEvent("tallyo:analytics", { detail: { name } }));

const isoDate = (date) => {
  const local = new Date(date.getTime() - (date.getTimezoneOffset() * 60_000));
  return local.toISOString().slice(0, 10);
};

const displayDate = (value) => value
  ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`))
  : "Not set";

const setText = (root, selector, value) => { root.querySelector(selector).textContent = value; };

const appendLines = (element, values, fallback) => {
  element.replaceChildren();
  const lines = values.filter((value) => String(value).trim());
  for (const [index, value] of (lines.length ? lines : [fallback]).entries()) {
    if (index) element.append(document.createElement("br"));
    element.append(document.createTextNode(value));
  }
};

const itemTemplate = (number) => {
  const row = document.createElement("div");
  row.className = "generator-item";
  row.dataset.item = "";
  row.innerHTML = `
    <div class="item-heading"><strong>Item ${number}</strong><button class="text-button" type="button" data-remove-item>Remove</button></div>
    <label class="item-description">Description<input name="description" maxlength="180" autocomplete="off"></label>
    <label>Quantity<input name="quantity" type="number" min="0" max="100000" step="0.001" value="1" inputmode="decimal"></label>
    <label>Unit<input name="unit" maxlength="30" value="each" autocomplete="off"></label>
    <label>Unit price<input name="unitPrice" type="number" min="0" max="1000000" step="0.01" value="0.00" inputmode="decimal"></label>
    <label>Discount (%)<input name="discountRate" type="number" min="0" max="100" step="0.01" value="0" inputmode="decimal"></label>
    <label>Tax (%)<input name="taxRate" type="number" min="0" max="100" step="0.01" value="0" inputmode="decimal"></label>`;
  return row;
};

for (const root of roots) {
  const form = root.querySelector("[data-generator-form]");
  const itemsRoot = root.querySelector("[data-items]");
  const status = root.querySelector("[data-generator-status]");
  const preview = root.querySelector("[data-preview]");
  const logoInput = form.elements.logo;
  const logoPreview = preview.querySelector("[data-preview-logo]");
  const removeLogo = root.querySelector("[data-remove-logo]");
  const conversionDialog = document.querySelector("[data-generator-conversion]");
  const overviewForm = conversionDialog?.querySelector("[data-overview-form]");
  let logoUrl = "";
  let makerUseTracked = false;

  const rows = () => [...itemsRoot.querySelectorAll("[data-item]")];
  const renumber = () => {
    rows().forEach((row, index) => {
      row.querySelector(".item-heading strong").textContent = `Item ${index + 1}`;
      row.querySelector("[data-remove-item]").disabled = rows().length === 1;
    });
  };
  const addItem = () => {
    if (rows().length >= 50) {
      status.textContent = "This free document maker supports up to 50 items.";
      return;
    }
    itemsRoot.append(itemTemplate(rows().length + 1));
    renumber();
    update();
  };

  const itemValues = () => rows().map((row) => ({
    description: row.querySelector('[name="description"]').value,
    quantity: row.querySelector('[name="quantity"]').value,
    unit: row.querySelector('[name="unit"]').value,
    unitPrice: row.querySelector('[name="unitPrice"]').value,
    discountRate: row.querySelector('[name="discountRate"]').value,
    taxRate: row.querySelector('[name="taxRate"]').value
  }));

  const update = () => {
    const type = form.elements.documentType.value;
    const currency = form.elements.currency.value;
    setText(preview, "[data-preview-type]", type);
    setText(preview, "[data-preview-reference]", `${type} ${form.elements.reference.value.trim() || "—"}`);
    const dates = [`Issued ${displayDate(form.elements.issueDate.value)}`];
    if (type === "Invoice") dates.push(`Supply ${displayDate(form.elements.supplyDate.value)}`, `Due ${displayDate(form.elements.dueDate.value)}`);
    else dates.push(`Valid until ${displayDate(form.elements.dueDate.value)}`);
    setText(preview, "[data-preview-dates]", dates.join(" · "));
    appendLines(preview.querySelector("[data-preview-sender]"), [form.elements.senderName.value, form.elements.senderLegalName.value, ...form.elements.senderAddress.value.split("\n"), form.elements.senderContact.value, form.elements.vatNumber.value ? `VAT: ${form.elements.vatNumber.value}` : ""], "Your business details");
    appendLines(preview.querySelector("[data-preview-customer]"), [form.elements.customerName.value, ...form.elements.customerAddress.value.split("\n")], "Customer details");
    appendLines(preview.querySelector("[data-preview-notes]"), form.elements.notes.value.split("\n"), "No notes added.");
    appendLines(preview.querySelector("[data-preview-payment]"), form.elements.paymentInstructions.value.split("\n"), "No payment instructions added.");

    const values = itemValues();
    try {
      const result = calculateDocument({ items: values, additionalCost: form.elements.additionalCost.value || "0", additionalTaxRate: form.elements.additionalTaxRate.value || "0" });
      const body = preview.querySelector("[data-preview-items]");
      body.replaceChildren();
      values.forEach((item, index) => {
        const line = result.lines[index];
        const tr = document.createElement("tr");
        const cells = [item.description.trim() || `Item ${index + 1}`, `${item.quantity || "0"} ${item.unit.trim() || "units"}`, formatMoney(line.unitPrice, currency), `${item.discountRate || "0"}%`, `${item.taxRate || "0"}%`, formatMoney(line.net, currency), formatMoney(line.total, currency)];
        for (const value of cells) { const td = document.createElement("td"); td.textContent = value; tr.append(td); }
        body.append(tr);
      });
      setText(preview, "[data-preview-subtotal]", formatMoney(result.subtotal, currency));
      setText(preview, "[data-preview-discount]", `−${formatMoney(result.discount, currency)}`);
      setText(preview, "[data-preview-additional]", formatMoney(result.additionalCost, currency));
      setText(preview, "[data-preview-net]", formatMoney(result.net, currency));
      setText(preview, "[data-preview-tax]", formatMoney(result.tax, currency));
      setText(preview, "[data-preview-total]", formatMoney(result.total, currency));
      preview.querySelector("[data-preview-discount-row]").hidden = result.discount === 0n;
      preview.querySelector("[data-preview-additional-row]").hidden = result.additionalCost === 0n;
      status.textContent = "";
    } catch (error) {
      status.textContent = error.message;
    }
  };

  const initialise = () => {
    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 14);
    form.elements.documentType.value = root.dataset.defaultType || "Invoice";
    form.elements.issueDate.value = isoDate(today);
    form.elements.supplyDate.value = isoDate(today);
    form.elements.dueDate.value = isoDate(due);
    itemsRoot.replaceChildren(itemTemplate(1));
    renumber();
    update();
  };

  root.querySelector("[data-add-item]").addEventListener("click", addItem);
  itemsRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-item]");
    if (!button || rows().length === 1) return;
    button.closest("[data-item]").remove();
    renumber();
    update();
  });
  const updateFromUser = () => {
    if (!makerUseTracked && root.dataset.defaultType === "Invoice") {
      makerUseTracked = true;
      emitAnalyticsEvent("use_invoice_maker");
    }
    update();
  };
  form.addEventListener("input", updateFromUser);
  form.addEventListener("change", updateFromUser);
  form.addEventListener("reset", () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    logoUrl = "";
    logoPreview.hidden = true;
    logoPreview.removeAttribute("src");
    removeLogo.hidden = true;
    queueMicrotask(initialise);
  });
  logoInput.addEventListener("change", () => {
    const file = logoInput.files?.[0];
    if (!file) return;
    if (!/^image\/(?:png|jpeg|webp)$/.test(file.type) || file.size > 2_000_000) {
      logoInput.value = "";
      status.textContent = "Choose a PNG, JPG or WebP logo smaller than 2 MB.";
      return;
    }
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    logoUrl = URL.createObjectURL(file);
    logoPreview.src = logoUrl;
    logoPreview.hidden = false;
    removeLogo.hidden = false;
    status.textContent = "Logo added to this browser preview only.";
  });
  removeLogo.addEventListener("click", () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    logoUrl = "";
    logoInput.value = "";
    logoPreview.hidden = true;
    logoPreview.removeAttribute("src");
    removeLogo.hidden = true;
    status.textContent = "Logo removed.";
  });
  const prepareDocument = () => {
    update();
    const required = [
      [form.elements.reference, "reference number"], [form.elements.issueDate, "issue date"],
      [form.elements.senderName, "business or trading name"], [form.elements.senderAddress, "business address"],
      [form.elements.customerName, "customer name"], [form.elements.customerAddress, "customer address"]
    ];
    if (form.elements.documentType.value === "Invoice") required.push([form.elements.supplyDate, "supply date"], [form.elements.dueDate, "due date"]);
    const missing = required.filter(([field]) => !field.value.trim()).map(([, label]) => label);
    if (!itemValues().some((item) => item.description.trim())) missing.push("at least one item description");
    if (form.elements.documentType.value === "Invoice" && form.elements.vatNumber.value.trim() && form.elements.currency.value !== "GBP") {
      status.textContent = "This free maker cannot produce a foreign-currency VAT invoice because the VAT totals must also be shown in sterling. Choose GBP or use suitable accounting software.";
      status.scrollIntoView({ block: "center" });
      return false;
    }
    if (missing.length || status.textContent) {
      status.textContent = missing.length ? `Add ${missing.join(", ")} before printing.` : status.textContent;
      status.scrollIntoView({ block: "center" });
      return false;
    }
    return true;
  };

  const performDownload = () => {
    conversionDialog?.close();
    try {
      if (root.dataset.defaultType === "Invoice") emitAnalyticsEvent("download_invoice");
      window.print();
      status.textContent = "Your browser's PDF save window opened. Choose ‘Save as PDF’ to finish the download.";
    } catch {
      status.textContent = "The PDF save window could not open. Try Continue download again.";
    }
  };

  const downloadController = createPreparedDownloadController({
    prepare: prepareDocument,
    showPanel: () => {
      if (conversionDialog?.showModal) {
        conversionDialog.showModal();
        conversionDialog.querySelector("[data-conversion-continue]")?.focus();
        return true;
      }
      return false;
    },
    download: performDownload
  });

  root.querySelector("[data-print]").addEventListener("click", () => {
    downloadController.begin();
  });

  conversionDialog?.querySelector("[data-conversion-continue]")?.addEventListener("click", () => downloadController.complete());
  conversionDialog?.querySelector("[data-conversion-dismiss]")?.addEventListener("click", () => downloadController.complete());
  conversionDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    downloadController.complete();
  });
  conversionDialog?.querySelector("[data-conversion-register]")?.addEventListener("click", () => {
    emitAnalyticsEvent("start_registration");
  });

  overviewForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = overviewForm.querySelector("[data-overview-email]");
    const consent = overviewForm.querySelector("[data-overview-consent]");
    const submit = overviewForm.querySelector("[data-overview-submit]");
    const overviewStatus = overviewForm.querySelector("[data-overview-status]");
    const request = buildOverviewRequest({ email: email.value, consent: consent.checked });
    if (!request.ok) {
      overviewStatus.textContent = request.message;
      return;
    }
    const endpoint = conversionDialog.dataset.overviewEndpoint;
    if (!endpoint) {
      overviewStatus.textContent = "The email overview is temporarily unavailable. You can still continue your download.";
      return;
    }
    submit.disabled = true;
    overviewStatus.textContent = "Requesting your one overview email…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(request.body)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "request_failed");
      overviewStatus.textContent = result.status === "already_requested"
        ? "That address has already requested the one overview email. You can continue your download."
        : "Your one Tallyo overview email has been requested. You can continue your download.";
      email.value = "";
      consent.checked = false;
    } catch (error) {
      overviewStatus.textContent = error.message === "rate_limited"
        ? "Too many requests were made from this connection. Please try again later or continue your download."
        : "The overview email could not be requested right now. You can still continue your download.";
    } finally {
      submit.disabled = false;
    }
  });
  window.addEventListener("beforeunload", () => { if (logoUrl) URL.revokeObjectURL(logoUrl); });
  initialise();
}
