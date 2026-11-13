/* ShiftUp — site interactions */
(() => {
  "use strict";

  const CONFIG = {
    contactEmail: "hello@shiftup.co.th",
    // ใส่ URL ของ LINE OA (เช่น https://lin.ee/xxxx) เมื่อพร้อมใช้งาน
    lineUrl: "",
    // ถ้าต้องการเชื่อมฟอร์มกับ backend/Formspree ให้ใส่ endpoint ที่นี่
    // รูปแบบที่คาดหวัง: รับ POST JSON แล้วตอบกลับด้วย HTTP 2xx
    contactEndpoint: "",
    automationRate: 0.6,
    workingHoursPerMonth: 160,
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = prefersReducedMotion ? "auto" : "smooth";

  const toast = $("#toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const success = document.execCommand("copy");
      helper.remove();
      return success;
    } catch (error) {
      return false;
    }
  }

  /* ------------------------------------------------------------------------
     Header, scroll progress and navigation state
     ------------------------------------------------------------------------ */

  const header = $("#site-header");
  const progress = $("#scroll-progress");
  const navLinks = $$(".desktop-nav a[data-section]");
  const spySections = ["services", "approach", "work", "calculator", "faq"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const contactSection = document.getElementById("contact");

  let scrollTicking = false;

  function updateScrollUI() {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 12);

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) {
      const ratio = scrollable > 0 ? Math.min(Math.max(y / scrollable, 0), 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }

    let activeId = "";
    const offset = (header?.offsetHeight || 0) + 110;
    for (const section of spySections) {
      if (y >= section.offsetTop - offset) activeId = section.id;
    }

    if (contactSection && y >= contactSection.offsetTop - offset) activeId = "";

    for (const link of navLinks) {
      const isActive = link.dataset.section === activeId;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }

    scrollTicking = false;
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  }

  if (header) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateScrollUI();
  }

  /* ------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------ */

  const menuToggle = $("#menu-toggle");
  const mobileMenu = $("#mobile-menu");

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "ปิดเมนู" : "เปิดเมนู");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.inert = !open;
    mobileMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);

    if (open) {
      window.setTimeout(() => {
        const firstLink = $("a", mobileMenu);
        firstLink?.focus({ preventScroll: true });
      }, 60);
    } else {
      menuToggle.focus({ preventScroll: true });
    }
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  $$(".mobile-nav a, .mobile-menu-foot a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (!mobileMenu?.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false);
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = [
      menuToggle,
      ...$$(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        mobileMenu
      ).filter((element) => element.offsetParent !== null),
    ];
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const desktopBreakpoint = window.matchMedia("(min-width: 1041px)");
  desktopBreakpoint.addEventListener?.("change", (event) => {
    if (event.matches) setMenu(false);
  });

  /* ------------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------------ */

  const revealItems = $$("[data-reveal]");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------------
     Use-case tabs
     ------------------------------------------------------------------------ */

  const caseTabs = $$(".case-tab");
  const casePanels = $$(".case-panel");

  function activateCase(tab, focusTab = false) {
    if (!tab) return;
    const targetId = tab.getAttribute("aria-controls");

    caseTabs.forEach((candidate) => {
      const isSelected = candidate === tab;
      candidate.classList.toggle("is-active", isSelected);
      candidate.setAttribute("aria-selected", String(isSelected));
      candidate.tabIndex = isSelected ? 0 : -1;
    });

    casePanels.forEach((panel) => {
      const isTarget = panel.id === targetId;
      panel.hidden = !isTarget;
      panel.classList.toggle("is-active", isTarget);
    });

    if (focusTab) tab.focus();
  }

  caseTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateCase(tab));
    tab.addEventListener("keydown", (event) => {
      let targetIndex = null;
      if (event.key === "ArrowRight") targetIndex = (index + 1) % caseTabs.length;
      if (event.key === "ArrowLeft") targetIndex = (index - 1 + caseTabs.length) % caseTabs.length;
      if (event.key === "Home") targetIndex = 0;
      if (event.key === "End") targetIndex = caseTabs.length - 1;

      if (targetIndex !== null) {
        event.preventDefault();
        activateCase(caseTabs[targetIndex], true);
      }
    });
  });

  /* ------------------------------------------------------------------------
     FAQ accordion
     ------------------------------------------------------------------------ */

  const faqItems = $$(".faq-item");

  faqItems.forEach((item) => {
    const button = $(".faq-question", item);
    button?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      faqItems.forEach((other) => {
        const otherButton = $(".faq-question", other);
        const isCurrent = other === item;
        const isOpen = isCurrent ? willOpen : false;
        other.classList.toggle("is-open", isOpen);
        otherButton?.setAttribute("aria-expanded", String(isOpen));
      });
    });
  });

  /* ------------------------------------------------------------------------
     ROI calculator
     ------------------------------------------------------------------------ */

  const calc = {
    team: $("#team-size"),
    hours: $("#repeat-hours"),
    cost: $("#hourly-cost"),
    teamOutput: $("#team-output"),
    hoursOutput: $("#hours-output"),
    costOutput: $("#cost-output"),
    annual: $("#annual-value"),
    monthly: $("#monthly-hours"),
    fte: $("#fte-value"),
  };

  const numberFormat = new Intl.NumberFormat("en-US");
  const decimalFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  const currencyFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  function updateRangeFill(input) {
    if (!input) return;
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const value = Number(input.value) || 0;
    const percentage = ((value - min) / (max - min)) * 100;
    input.style.setProperty("--range-progress", `${percentage}%`);
  }

  function updateCalculator() {
    if (!calc.team || !calc.hours || !calc.cost) return;

    const team = Number(calc.team.value);
    const hours = Number(calc.hours.value);
    const cost = Number(calc.cost.value);
    const weeksPerMonth = 52 / 12;

    const monthlySaved = team * hours * weeksPerMonth * CONFIG.automationRate;
    const annualValue = monthlySaved * cost * 12;
    const fte = monthlySaved / CONFIG.workingHoursPerMonth;

    if (calc.teamOutput) calc.teamOutput.textContent = `${numberFormat.format(team)} คน`;
    if (calc.hoursOutput) calc.hoursOutput.textContent = `${numberFormat.format(hours)} ชม.`;
    if (calc.costOutput) calc.costOutput.textContent = `฿${numberFormat.format(cost)}`;
    if (calc.monthly) calc.monthly.textContent = decimalFormat.format(monthlySaved);
    if (calc.annual) calc.annual.textContent = currencyFormat.format(annualValue);
    if (calc.fte) calc.fte.textContent = decimalFormat.format(fte);

    [calc.team, calc.hours, calc.cost].forEach((input) => {
      updateRangeFill(input);
      input.setAttribute("aria-valuetext", input === calc.team ? `${team} คน` : input === calc.hours ? `${hours} ชั่วโมงต่อสัปดาห์` : `${cost} บาทต่อชั่วโมง`);
    });
  }

  [calc.team, calc.hours, calc.cost].forEach((input) => {
    input?.addEventListener("input", updateCalculator);
    if (input) updateRangeFill(input);
  });

  if (calc.team) updateCalculator();

  /* ------------------------------------------------------------------------
     Service intent → contact form
     ------------------------------------------------------------------------ */

  const topicSelect = $("#topic");
  const nameInput = $("#name");

  function prepareContact(topic) {
    if (topicSelect && topic) {
      const matchingOption = Array.from(topicSelect.options).find(
        (option) => option.value === topic || option.textContent.trim().startsWith(topic)
      );
      if (matchingOption) topicSelect.value = matchingOption.value;
    }

    contactSection?.scrollIntoView({ behavior: scrollBehavior, block: "start" });

    if (!prefersReducedMotion) {
      window.setTimeout(() => {
        nameInput?.focus({ preventScroll: true });
      }, 550);
    }
  }

  $$("[data-service]").forEach((button) => {
    button.addEventListener("click", () => prepareContact(button.dataset.service || "Not sure yet"));
  });

  $("[data-calc-cta]")?.addEventListener("click", (event) => {
    event.preventDefault();
    prepareContact("Bottleneck Audit");
  });

  /* ------------------------------------------------------------------------
     Contact form
     ------------------------------------------------------------------------ */

  const form = $("#contact-form");
  const formSuccess = $("#form-success");
  const resetFormButton = $("#reset-form");
  const copyEmailButton = $("#copy-email");
  const directMailLink = $(".success-actions a[href^='mailto:']");

  const validators = {
    name: (value) => (value.trim().length >= 2 ? "" : "กรุณากรอกชื่อของคุณ"),
    company: (value) => (value.trim().length >= 2 ? "" : "กรุณากรอกชื่อบริษัท"),
    email: (value) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      return emailPattern.test(value.trim()) ? "" : "กรุณากรอกอีเมลบริษัทให้ถูกต้อง";
    },
    topic: (value) => (value ? "" : "กรุณาเลือกหัวข้อที่อยากให้ช่วย"),
    message: (value) =>
      value.trim().length >= 10 ? "" : "เล่าโจทย์อย่างน้อย 10 ตัวอักษรเพื่อให้เราช่วยได้ตรงขึ้น",
    consent: (_, field) => (field.checked ? "" : "กรุณายินยอมให้เราใช้ข้อมูลเพื่อติดต่อกลับ"),
  };

  function getFieldValue(field) {
    return field.type === "checkbox" ? String(field.checked) : field.value;
  }

  function validateField(field) {
    const validator = validators[field.name];
    if (!validator) return true;

    const message = validator(getFieldValue(field), field);
    const errorElement = document.getElementById(`${field.id}-error`);
    const fieldWrapper = field.closest(".form-field");

    if (errorElement) errorElement.textContent = message;
    fieldWrapper?.classList.toggle("has-error", Boolean(message));
    form?.classList.toggle("has-error", Boolean(message) && field.name === "consent");
    field.setAttribute("aria-invalid", message ? "true" : "false");

    if (errorElement && message) field.setAttribute("aria-describedby", errorElement.id);
    else field.removeAttribute("aria-describedby");

    return !message;
  }

  function validateForm() {
    if (!form) return false;
    const fields = $$("input, select, textarea", form).filter((field) => field.name && validators[field.name]);
    let firstInvalid = null;

    fields.forEach((field) => {
      const valid = validateField(field);
      if (!valid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
      firstInvalid.scrollIntoView({ behavior: scrollBehavior, block: "center" });
    }

    return !firstInvalid;
  }

  if (form) {
    const fields = $$("input, select, textarea", form).filter((field) => validators[field.name]);

    fields.forEach((field) => {
      field.addEventListener("blur", () => {
        if (field.value || field.type === "checkbox") validateField(field);
      });

      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });

      field.addEventListener("change", () => {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validateForm()) return;

      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") || "").trim(),
        company: String(data.get("company") || "").trim(),
        email: String(data.get("email") || "").trim(),
        line: String(data.get("line") || "").trim(),
        topic: String(data.get("topic") || "").trim(),
        message: String(data.get("message") || "").trim(),
      };

      const subject = `[ShiftUp] ${payload.topic} — ${payload.company}`;
      const body = [
        `ชื่อ: ${payload.name}`,
        `บริษัท: ${payload.company}`,
        `อีเมล: ${payload.email}`,
        `LINE: ${payload.line || "-"}`,
        `สนใจ: ${payload.topic}`,
        "",
        "โจทย์ที่อยากให้ช่วย:",
        payload.message,
        "",
        "ส่งจากฟอร์มบน shiftup.co.th",
      ].join("\n");

      const mailtoHref = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (directMailLink) directMailLink.setAttribute("href", mailtoHref);

      const submitButton = $("button[type='submit']", form);
      submitButton?.setAttribute("disabled", "disabled");

      try {
        if (CONFIG.contactEndpoint) {
          const response = await fetch(CONFIG.contactEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error("Request failed");
          showFormSuccess("ส่งข้อความถึงทีมแล้ว", "เราได้รับโจทย์ของคุณแล้ว และจะติดต่อกลับภายใน 1 วันทำการ");
        } else {
          window.location.href = mailtoHref;
          showFormSuccess(
            "เกือบเสร็จแล้ว.",
            "เราเปิดอีเมลพร้อมรายละเอียดให้คุณแล้ว กรุณากด <strong>ส่ง</strong> ในแอปอีเมลอีกครั้งเพื่อให้ทีมได้รับข้อความ"
          );
        }
      } catch (error) {
        showToast("ส่งไม่สำเร็จ กรุณาส่งอีเมลโดยตรงมาที่ hello@shiftup.co.th");
      } finally {
        submitButton?.removeAttribute("disabled");
      }
    });
  }

  function showFormSuccess(title, message) {
    if (!form || !formSuccess) return;

    const heading = $("h3", formSuccess);
    if (heading) heading.textContent = title;

    const copy = $("p:not(.form-kicker)", formSuccess);
    if (copy) copy.innerHTML = message;

    const kicker = $(".form-kicker", formSuccess);
    if (kicker && CONFIG.contactEndpoint) kicker.textContent = "MESSAGE RECEIVED";

    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.setAttribute("tabindex", "-1");
    formSuccess.focus({ preventScroll: true });

    const offset = (header?.offsetHeight || 0) + 24;
    const top = formSuccess.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: scrollBehavior });
  }

  resetFormButton?.addEventListener("click", () => {
    if (!form || !formSuccess) return;
    formSuccess.hidden = true;
    form.hidden = false;
    form.querySelector("button[type='submit']")?.removeAttribute("disabled");
    nameInput?.focus({ preventScroll: true });
  });

  copyEmailButton?.addEventListener("click", async () => {
    const copied = await copyText(CONFIG.contactEmail);
    showToast(copied ? "คัดลอกอีเมลแล้ว" : `อีเมล: ${CONFIG.contactEmail}`);
  });

  /* ------------------------------------------------------------------------
     LINE handling
     ------------------------------------------------------------------------ */

  const lineLinks = $$("[data-line-link]");
  if (CONFIG.lineUrl) {
    lineLinks.forEach((link) => {
      link.setAttribute("href", CONFIG.lineUrl);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  } else {
    lineLinks.forEach((link) => {
      link.setAttribute("title", "คัดลอก LINE ID @shiftup");
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        const copied = await copyText("@shiftup");
        showToast(copied ? "คัดลอก LINE ID: @shiftup แล้ว" : "LINE ID: @shiftup");
      });
    });
  }

  /* ------------------------------------------------------------------------
     Privacy dialog
     ------------------------------------------------------------------------ */

  const privacyDialog = $("#privacy-dialog");
  const closePrivacyButton = $("#close-privacy");
  let privacyOpener = null;

  function openPrivacy(trigger) {
    if (!privacyDialog || typeof privacyDialog.showModal !== "function") return;
    privacyOpener = trigger || document.activeElement;
    privacyDialog.showModal();
    document.body.classList.add("dialog-open");
    closePrivacyButton?.focus({ preventScroll: true });
  }

  function closePrivacy() {
    privacyDialog?.close();
  }

  $$("[data-open-privacy]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPrivacy(trigger);
    });
  });

  closePrivacyButton?.addEventListener("click", closePrivacy);

  privacyDialog?.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    if (privacyOpener instanceof HTMLElement) {
      privacyOpener.focus({ preventScroll: true });
      privacyOpener = null;
    }
  });

  privacyDialog?.addEventListener("click", (event) => {
    if (event.target !== privacyDialog) return;
    const rect = privacyDialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) closePrivacy();
  });

  /* ------------------------------------------------------------------------
     Bottleneck scroll story
     ------------------------------------------------------------------------ */

  const bottleneckStory = $("#bottleneck-story");

  if (bottleneckStory) initBottleneckStory(bottleneckStory);

  function initBottleneckStory(story) {
    const stage = $(".bottleneck-sticky", story);
    const steps = $$(".story-step", story);
    const wiring = $(".flow-wiring", story);
    const bottleSvg = $(".bottle-svg", story);
    const percentOutput = $("[data-story-percent]", story);
    const desktopQuery = window.matchMedia("(min-width: 901px)");

    if (!stage || !steps.length || !wiring || !bottleSvg) return;

    if (prefersReducedMotion) {
      story.classList.add("is-static");
      return;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const thresholds = [0, 0.3, 0.58, 0.84];
    let activeIndex = -1;
    let currentProgress = 0;
    let lastPercent = -1;
    let wiringData = null;
    let rafId = 0;
    let resizeTimer = 0;
    let storyHeight = 0;
    let stageHeight = 0;
    let stickyTop = 0;

    function clamp(value, min = 0, max = 1) {
      return Math.min(Math.max(value, min), max);
    }

    function createSvgElement(tag, attributes = {}) {
      const element = document.createElementNS(svgNS, tag);
      for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
      }
      return element;
    }

    function measureStory() {
      storyHeight = story.offsetHeight;
      stageHeight = stage.offsetHeight;
      stickyTop = parseFloat(window.getComputedStyle(stage).top) || 0;
    }

    function updateBranchClasses() {
      if (!wiringData) return;
      wiringData.branches.forEach((path, index) => {
        const isLit = index < activeIndex || (index === activeIndex && currentProgress > 0.015);
        path.classList.toggle("is-lit", isLit);
      });
    }

    function setActiveStep(index) {
      if (index === activeIndex) return;
      activeIndex = index;

      steps.forEach((step, stepIndex) => {
        const isActive = stepIndex === index;
        step.classList.toggle("is-active", isActive);
        step.classList.toggle("is-done", stepIndex < index);
        if (isActive) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });

      updateBranchClasses();
    }

    function updateProgress(progress) {
      currentProgress = clamp(progress);

      if (Math.abs(currentProgress - (Number(story.dataset.renderedProgress) || 0)) > 0.0005) {
        story.dataset.renderedProgress = currentProgress.toFixed(4);
        story.style.setProperty("--story-progress", currentProgress.toFixed(4));
      }

      const percent = Math.round(currentProgress * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        if (percentOutput) percentOutput.textContent = String(percent).padStart(2, "0");
      }

      if (!wiringData) return;

      const isFlowing = currentProgress > 0.015;
      wiringData.main.classList.toggle("is-lit", isFlowing);
      wiringData.dot.classList.toggle("is-lit", isFlowing);
      wiringData.rail.style.strokeDashoffset = String(1 - currentProgress);

      const dotY = wiringData.railTop + (wiringData.railBottom - wiringData.railTop) * currentProgress;
      wiringData.dot.setAttribute("cx", wiringData.railX.toFixed(1));
      wiringData.dot.setAttribute("cy", dotY.toFixed(1));

      updateBranchClasses();
    }

    function buildWiring() {
      if (!desktopQuery.matches || prefersReducedMotion) {
        wiring.innerHTML = "";
        wiringData = null;
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const bottleRect = bottleSvg.getBoundingClientRect();
      const nodeRects = steps.map((step) => {
        const node = $(".story-node", step);
        return node ? node.getBoundingClientRect() : null;
      });

      if (nodeRects.some((rect) => !rect) || stageRect.width < 600) {
        wiring.innerHTML = "";
        wiringData = null;
        return;
      }

      const startX = bottleRect.left - stageRect.left + bottleRect.width * (170 / 340);
      const startY = bottleRect.top - stageRect.top + bottleRect.height * (468 / 540);
      const nodes = nodeRects.map((rect) => ({
        x: rect.left - stageRect.left + rect.width / 2,
        y: rect.top - stageRect.top + rect.height / 2,
      }));

      const nodeEdge = nodeRects[0].width / 2;
      const railX = Math.min(...nodes.map((node) => node.x)) - 64;
      const railTop = nodes[0].y - 17;
      const railBottom = nodes[nodes.length - 1].y + 17;

      if (railX < startX + 40 || railX < 12) {
        wiring.innerHTML = "";
        wiringData = null;
        return;
      }

      wiring.innerHTML = "";
      wiring.setAttribute("viewBox", `0 0 ${stageRect.width} ${stageRect.height}`);
      wiring.setAttribute("preserveAspectRatio", "none");

      const connectionY = clamp(startY, railTop + 16, railBottom - 16);
      const mainD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${(startX + 54).toFixed(1)} ${startY.toFixed(1)}, ${(railX - 54).toFixed(1)} ${connectionY.toFixed(1)}, ${railX.toFixed(1)} ${connectionY.toFixed(1)}`;
      const railD = `M ${railX.toFixed(1)} ${railTop.toFixed(1)} L ${railX.toFixed(1)} ${railBottom.toFixed(1)}`;

      wiring.appendChild(createSvgElement("path", { d: mainD, class: "wire-base" }));
      wiring.appendChild(createSvgElement("path", { d: railD, class: "wire-base" }));

      const branchBasePaths = nodes.map((node) =>
        createSvgElement("path", {
          d: `M ${railX.toFixed(1)} ${node.y.toFixed(1)} L ${(node.x - nodeEdge).toFixed(1)} ${node.y.toFixed(1)}`,
          class: "wire-base",
        })
      );
      branchBasePaths.forEach((path) => wiring.appendChild(path));

      const main = createSvgElement("path", { d: mainD, class: "wire-live wire-main" });
      wiring.appendChild(main);

      const rail = createSvgElement("path", {
        d: railD,
        class: "wire-live wire-rail",
        pathLength: "1",
      });
      wiring.appendChild(rail);

      const branches = nodes.map((node, index) => {
        const path = createSvgElement("path", {
          d: `M ${railX.toFixed(1)} ${node.y.toFixed(1)} L ${(node.x - nodeEdge).toFixed(1)} ${node.y.toFixed(1)}`,
          class: "wire-live wire-branch",
          pathLength: "1",
          "data-step": String(index + 1),
        });
        wiring.appendChild(path);
        return path;
      });

      const junction = createSvgElement("circle", {
        cx: railX.toFixed(1),
        cy: connectionY.toFixed(1),
        r: "3",
        class: "wire-junction",
      });
      wiring.appendChild(junction);

      const dot = createSvgElement("circle", {
        cx: railX.toFixed(1),
        cy: railTop.toFixed(1),
        r: "3.6",
        class: "wire-dot",
      });
      wiring.appendChild(dot);

      wiringData = { main, rail, branches, dot, railX, railTop, railBottom };
      updateProgress(currentProgress);
    }

    function updateStory(force = false) {
      if (prefersReducedMotion) return;

      if (desktopQuery.matches) {
        const travel = Math.max(1, storyHeight - stageHeight);
        const progress = clamp((stickyTop - story.getBoundingClientRect().top) / travel);
        let stepIndex = 0;
        thresholds.forEach((threshold, index) => {
          if (progress >= threshold) stepIndex = index;
        });
        setActiveStep(stepIndex);
        updateProgress(progress);
      } else {
        const triggerLine = window.innerHeight * 0.52;
        let stepIndex = 0;
        steps.forEach((step, index) => {
          if (step.getBoundingClientRect().top <= triggerLine) stepIndex = index;
        });
        setActiveStep(stepIndex);
        updateProgress(stepIndex / Math.max(1, steps.length - 1));
      }

      if (force) updateProgress(currentProgress);
    }

    function scheduleUpdate() {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateStory();
      });
    }

    function rebuild() {
      measureStory();
      buildWiring();
      updateStory(true);
    }

    setActiveStep(0);
    measureStory();
    buildWiring();
    updateStory(true);

    document.fonts?.ready.then(rebuild);
    window.addEventListener("load", rebuild);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 160);
    });
    desktopQuery.addEventListener?.("change", rebuild);
  }

  /* ------------------------------------------------------------------------
     Footer utilities
     ------------------------------------------------------------------------ */

  const year = $("#current-year");
  if (year) year.textContent = String(new Date().getFullYear() + 543);

  const bkkTime = $("#bkk-time");
  function updateBangkokTime() {
    if (!bkkTime) return;
    bkkTime.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  }
  updateBangkokTime();
  window.setInterval(updateBangkokTime, 30000);

  $("#back-to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: scrollBehavior });
    $(".brand")?.focus({ preventScroll: true });
  });
})();
