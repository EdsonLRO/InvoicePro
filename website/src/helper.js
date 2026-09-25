import { createPublicAiAdapter, findHelperAnswer } from "/assets/helper-core.mjs?v=__TALLYO_ASSET_REVISION__";
import { trackEvent } from "/assets/growth.js?v=__TALLYO_ASSET_REVISION__";

const knowledgeElement = document.getElementById("helper-knowledge");

if (knowledgeElement) {
  const knowledge = JSON.parse(knowledgeElement.textContent || "{}");

  for (const root of document.querySelectorAll("[data-helper]")) {
    const form = root.querySelector("[data-helper-form]");
    const input = root.querySelector("[data-helper-input]");
    const conversation = root.querySelector("[data-helper-conversation]");
    const suggestions = root.querySelector("[data-helper-suggestions]");
    const reset = root.querySelector("[data-helper-reset]");
    const status = root.querySelector("[data-helper-status]");
    const submit = form?.querySelector('button[type="submit"]');
    if (!form || !input || !conversation || !submit) continue;

    const aiAdapter = createPublicAiAdapter({ enabled: root.dataset.aiEnabled === "true" });
    let requestSequence = 0;

    const serviceReplies = Object.freeze({
      rate_limited: {
        reason: "rate-limited",
        answer: "I’m glad you have questions. I just need a short pause before I can check another one—please wait a minute, then try again.",
        links: [{ label: "Browse the Help Centre now", href: "/help/" }]
      },
      assistant_unavailable: {
        reason: "unavailable",
        answer: "I’m having trouble checking that answer right now. Please try again in a moment, or use the Help Centre while I reconnect.",
        links: [{ label: "Open the Help Centre", href: "/help/" }]
      }
    });

    const resolveHref = (href) => {
      if (href === "app:signup") return document.querySelector("[data-signup-link]")?.href || "/";
      if (href === "app:login") return document.querySelector("[data-login-link]")?.href || "/";
      return href;
    };

    const setStatus = (message) => {
      if (status) status.textContent = message;
    };

    const addMessage = (speaker, message, links = []) => {
      const item = document.createElement("li");
      item.className = `helper-message helper-message-${speaker}`;
      const label = document.createElement("strong");
      label.textContent = speaker === "user" ? "You" : "Tallyo Helper";
      const copy = document.createElement("p");
      copy.textContent = message;
      item.append(label, copy);

      if (links.length) {
        const linkList = document.createElement("div");
        linkList.className = "helper-links";
        for (const link of links) {
          const anchor = document.createElement("a");
          anchor.href = resolveHref(link.href);
          anchor.textContent = link.label;
          linkList.append(anchor);
        }
        item.append(linkList);
      }

      conversation.append(item);
      conversation.scrollTop = conversation.scrollHeight;
    };

    const initialMessage = () => addMessage(
      "assistant",
      "Hi! I’m here to help you get to know Tallyo. Ask me about invoices, quotes, recurring work, reminders, payments, branding or getting started.",
      [{ label: "See what Tallyo can do", href: "/features/" }]
    );

    const ask = async (question, entryId = "") => {
      const trimmed = question.trim().slice(0, 240);
      if (!trimmed) return;
      const sequence = ++requestSequence;
      let reply = findHelperAnswer(knowledge, trimmed, entryId);
      if (reply.reason === "knowledge") trackEvent("helper_answer_found", { answer_key: reply.id });
      addMessage("user", reply.reason === "sensitive" ? "Sensitive information omitted" : trimmed);
      input.value = "";
      if (reply.reason === "no-answer" && aiAdapter.enabled) {
        setStatus("Tallyo Helper is checking reviewed public guidance.");
        submit.disabled = true;
        form.setAttribute("aria-busy", "true");
        try {
          reply = await aiAdapter.answer(trimmed) || reply;
        } catch (error) {
          reply = error?.publicAnswer
            ? { reason: error.code || "boundary", answer: error.publicAnswer, links: error.publicLinks || [] }
            : serviceReplies[error?.code] || serviceReplies.assistant_unavailable;
        } finally {
          submit.disabled = false;
          form.removeAttribute("aria-busy");
        }
      }
      if (sequence !== requestSequence) return;
      if (["no-answer", "unavailable", "rate-limited"].includes(reply.reason)) trackEvent("helper_answer_not_found");
      addMessage("assistant", reply.answer, reply.links || []);
      if (reply.reason === "ai") setStatus("Tallyo Helper answered from reviewed public guidance with AI.");
      else if (reply.reason === "no-answer") setStatus("Tallyo Helper needs a little more detail to answer.");
      else if (reply.reason === "rate-limited") setStatus("Please wait a minute before asking another question.");
      else if (reply.reason === "unavailable") setStatus("Tallyo Helper could not check that answer right now.");
      else if (reply.reason === "conversation") setStatus("Tallyo Helper is ready for your question.");
      else setStatus("Tallyo Helper answered using its reviewed guide.");
      input.focus();
    };

    if (suggestions) {
      const configuredLimit = Number.parseInt(root.dataset.helperSuggestionLimit || "", 10);
      const suggestedEntries = (knowledge.entries || []).filter((entry) => entry.suggested === true);
      const entries = Number.isFinite(configuredLimit)
        ? suggestedEntries.slice(0, Math.max(0, configuredLimit))
        : suggestedEntries;
      for (const entry of entries) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "helper-suggestion";
        button.textContent = entry.question;
        button.addEventListener("click", () => void ask(entry.question, entry.id));
        suggestions.append(button);
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void ask(input.value);
    });

    reset?.addEventListener("click", () => {
      requestSequence += 1;
      conversation.replaceChildren();
      initialMessage();
      setStatus("Conversation cleared. Nothing was saved.");
      input.value = "";
      input.focus();
    });

    initialMessage();
  }

  for (const widget of document.querySelectorAll("[data-helper-widget]")) {
    const panel = widget.querySelector("[data-helper]");
    const toggle = widget.querySelector("[data-helper-toggle]");
    const close = widget.querySelector("[data-helper-close]");
    const input = widget.querySelector("[data-helper-input]");
    if (!panel || !toggle || !close || !input) continue;

    const setOpen = (open, { returnFocus = false } = {}) => {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close Tallyo Helper" : "Open Tallyo Helper");
      widget.toggleAttribute("data-open", open);
      if (open) input.focus();
      else if (returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => setOpen(panel.hidden));
    close.addEventListener("click", () => setOpen(false, { returnFocus: true }));
    document.addEventListener("pointerdown", (event) => {
      if (!panel.hidden && !widget.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) setOpen(false, { returnFocus: true });
    });
  }
}
