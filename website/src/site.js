(() => {
  "use strict";

  const button = document.querySelector("[data-menu-button]");
  const navigation = document.querySelector("[data-navigation]");
  let previouslyFocused = null;

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const setMenu = (open) => {
    if (!button || !navigation) return;
    button.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    const label = button.querySelector(".sr-only");
    if (label) label.textContent = open ? "Close main menu" : "Open main menu";
    if (open) {
      previouslyFocused = document.activeElement;
      navigation.querySelector(focusableSelector)?.focus();
    } else if (previouslyFocused === button) {
      button.focus();
    }
  };

  button?.addEventListener("click", () => setMenu(button.getAttribute("aria-expanded") !== "true"));
  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a") && button?.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button?.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  const desktopQuery = window.matchMedia("(min-width: 62rem)");
  desktopQuery.addEventListener?.("change", (event) => {
    if (event.matches) setMenu(false);
  });

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
