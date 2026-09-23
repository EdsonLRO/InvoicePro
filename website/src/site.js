(() => {
  "use strict";

  const button = document.querySelector("[data-menu-button]");
  const navigation = document.querySelector("[data-navigation]");
  const header = document.querySelector("[data-header]");
  const hero = document.querySelector("[data-home-hero]");
  const productStage = document.querySelector("[data-product-stage]");
  const workflowSteps = [...document.querySelectorAll(".home-how .workflow-steps li")];
  const horizontalFlow = document.querySelector("[data-horizontal-flow]");
  const horizontalViewport = horizontalFlow?.querySelector("[data-horizontal-viewport]");
  const horizontalTrack = horizontalFlow?.querySelector("[data-horizontal-track]");
  const horizontalProgress = horizontalFlow?.querySelector("[data-horizontal-progress]");
  const tourExplorer = document.querySelector("[data-tour-chapters]");
  const tourTabs = [...(tourExplorer?.querySelectorAll("[data-tour-tab]") || [])];
  const tourPanels = [...(tourExplorer?.querySelectorAll("[data-tour-panel]") || [])];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let previouslyFocused = null;
  let horizontalTravel = 0;

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
    if (event.target.closest("a, [data-cookie-settings]") && button?.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button?.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  const desktopQuery = window.matchMedia("(min-width: 62rem)");
  desktopQuery.addEventListener?.("change", (event) => {
    if (event.matches) setMenu(false);
  });

  const activateTourChapter = (chapterId, { focus = false } = {}) => {
    const activeTab = tourTabs.find((tab) => tab.dataset.tourTab === chapterId) || tourTabs[0];
    if (!activeTab) return;
    tourTabs.forEach((tab) => {
      const active = tab === activeTab;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    tourPanels.forEach((panel) => {
      panel.hidden = panel.id !== `tour-${activeTab.dataset.tourTab}`;
    });
    if (focus) activeTab.focus();
  };

  tourTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTourChapter(tab.dataset.tourTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tourTabs.length) % tourTabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tourTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tourTabs.length - 1;
      activateTourChapter(tourTabs[nextIndex].dataset.tourTab, { focus: true });
    });
  });

  if (tourTabs.length) {
    const requestedScene = window.location.hash.slice(1);
    const requestedPanel = requestedScene ? tourPanels.find((panel) => panel.querySelector(`#${CSS.escape(requestedScene)}`)) : null;
    activateTourChapter(requestedPanel?.id.replace("tour-", "") || tourTabs[0].dataset.tourTab);
  }

  const updateWorkflowState = () => {
    if (!workflowSteps.length) return;
    const focusLine = window.innerHeight * 0.52;
    let activeStep = null;
    let activeDistance = Number.POSITIVE_INFINITY;

    workflowSteps.forEach((step) => {
      const bounds = step.getBoundingClientRect();
      const distance = Math.abs(bounds.top + bounds.height / 2 - focusLine);
      step.toggleAttribute("data-seen", bounds.top < window.innerHeight * 0.78);
      if (bounds.bottom > 0 && bounds.top < window.innerHeight && distance < activeDistance) {
        activeStep = step;
        activeDistance = distance;
      }
    });

    workflowSteps.forEach((step) => step.toggleAttribute("data-active", step === activeStep));
  };

  const horizontalFlowIsActive = () => Boolean(horizontalFlow && horizontalViewport && horizontalTrack && window.innerWidth >= 1152 && !reduceMotion.matches);

  const updateHorizontalFlow = () => {
    if (!horizontalFlow || !horizontalTrack || !horizontalProgress) return;
    if (!horizontalFlowIsActive()) {
      horizontalTrack.style.removeProperty("transform");
      horizontalProgress.style.removeProperty("transform");
      return;
    }

    const availableScroll = Math.max(horizontalFlow.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-horizontalFlow.getBoundingClientRect().top / availableScroll, 0), 1);
    horizontalTrack.style.transform = `translate3d(${(-horizontalTravel * progress).toFixed(2)}px, 0, 0)`;
    horizontalProgress.style.transform = `scaleX(${progress.toFixed(4)})`;
  };

  const measureHorizontalFlow = () => {
    if (!horizontalFlow || !horizontalViewport || !horizontalTrack) return;
    if (!horizontalFlowIsActive()) {
      horizontalTravel = 0;
      horizontalFlow.style.removeProperty("height");
      updateHorizontalFlow();
      return;
    }

    horizontalTravel = Math.max(horizontalViewport.scrollWidth - horizontalViewport.clientWidth, 0);
    horizontalFlow.style.height = `${Math.round(window.innerHeight + horizontalTravel + 160)}px`;
    updateHorizontalFlow();
  };

  const updateScrollState = () => {
    const scrollTop = window.scrollY;
    header?.classList.toggle("is-condensed", scrollTop > 28);

    if (hero && !reduceMotion.matches) {
      const progress = Math.min(Math.max(scrollTop / Math.max(hero.offsetHeight, 1), 0), 1);
      hero.style.setProperty("--hero-shift", `${(progress * 22).toFixed(2)}px`);
      hero.style.setProperty("--hero-fade", String(Math.max(0.78, 1 - progress * 0.2)));
    }

    if (!reduceMotion.matches) updateWorkflowState();
    updateHorizontalFlow();
  };

  let scrollFrame = 0;
  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      updateScrollState();
      scrollFrame = 0;
    });
  }, { passive: true });
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      measureHorizontalFlow();
      resizeFrame = 0;
    });
  }, { passive: true });
  measureHorizontalFlow();
  updateScrollState();

  const revealTargets = document.querySelectorAll(".home-capability-strip, .home-benefits .section-heading, .home-benefits article, .home-how .section-heading, .home-product-tour .section-heading, .home-product-tour .product-demo, .feature-hero > *, .feature-detail-list article, .workflow-outcome .section-heading, .workflow-outcome-step, .tour-hero > *, .product-tour .product-demo");
  if (revealTargets.length && !reduceMotion.matches && "IntersectionObserver" in window) {
    document.documentElement.classList.add("motion-ready");
    revealTargets.forEach((target, index) => {
      target.setAttribute("data-reveal", "");
      target.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 70}ms`);
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute("data-revealed", "");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: 0.12 });

    window.requestAnimationFrame(() => revealTargets.forEach((target) => revealObserver.observe(target)));
  }

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const resetProductStage = () => {
    productStage?.style.setProperty("--tilt-x", "0deg");
    productStage?.style.setProperty("--tilt-y", "0deg");
    productStage?.style.setProperty("--depth-x", "0px");
    productStage?.style.setProperty("--depth-y", "0px");
  };

  if (productStage && finePointer.matches && !reduceMotion.matches) {
    productStage.addEventListener("pointermove", (event) => {
      const bounds = productStage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      productStage.style.setProperty("--tilt-x", `${(-y * 1.6).toFixed(2)}deg`);
      productStage.style.setProperty("--tilt-y", `${(x * 2.2).toFixed(2)}deg`);
      productStage.style.setProperty("--depth-x", `${(x * 7).toFixed(2)}px`);
      productStage.style.setProperty("--depth-y", `${(y * 5).toFixed(2)}px`);
    });
    productStage.addEventListener("pointerleave", resetProductStage);
  }

  reduceMotion.addEventListener?.("change", (event) => {
    if (event.matches) resetProductStage();
    measureHorizontalFlow();
  });

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
