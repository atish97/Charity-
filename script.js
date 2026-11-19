document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Mobile Navbar Toggle */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* 2. Smooth Desktop-Only Fade-In & Counter Animations */
  const revealEls = document.querySelectorAll(".reveal");

  if (isMobile || prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -30px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    // Smooth stat counter animation on desktop
    const statValues = document.querySelectorAll(".stat-item__value[data-target]");
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.target || "0", 10);
          const suffix = el.dataset.suffix || "";
          const duration = 1100;
          const startTime = performance.now();

          const updateCount = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            el.textContent = current.toLocaleString("en-US") + suffix;
            if (progress < 1) {
              requestAnimationFrame(updateCount);
            }
          };

          requestAnimationFrame(updateCount);
          observer.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );

    statValues.forEach((el) => statsObserver.observe(el));
  }

  /* 3. Hero Cause Search */
  const causeSearchForm = document.getElementById("causeSearchForm");
  const causeSearchInput = document.getElementById("causeSearchInput");
  const causeCards = document.querySelectorAll("#causesGrid .cause-card");

  const filterCauses = (query) => {
    const q = query.trim().toLowerCase();
    causeCards.forEach((card) => {
      if (!q) {
        card.classList.remove("cause-card--dimmed");
        return;
      }
      const keywords = (card.dataset.keywords || "") + " " + card.textContent.toLowerCase();
      if (keywords.includes(q)) {
        card.classList.remove("cause-card--dimmed");
      } else {
        card.classList.add("cause-card--dimmed");
      }
    });
  };

  if (causeSearchForm && causeSearchInput) {
    causeSearchInput.addEventListener("input", (e) => {
      filterCauses(e.target.value);
    });

    causeSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      filterCauses(causeSearchInput.value);
      const causesSection = document.getElementById("causes");
      if (causesSection) {
        causesSection.scrollIntoView({ behavior: isMobile ? "auto" : "smooth" });
      }
    });
  }

  /* 4. Donation Form Tabs & Inline Submission (No Modal) */
  const donateTabs = document.querySelectorAll(".donate-form__tab");
  const donateIndicator = document.getElementById("donateTabIndicator");
  const donateForm = document.getElementById("donateForm");
  const donateFeedback = document.getElementById("donateFeedback");
  let activeDonationType = "General donation";

  donateTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      donateTabs.forEach((t) => {
        t.classList.remove("donate-form__tab--active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("donate-form__tab--active");
      tab.setAttribute("aria-selected", "true");

      const isSpecific = tab.dataset.tab === "specific";
      activeDonationType = isSpecific ? "Specific cause donation" : "General donation";
      if (donateIndicator) {
        donateIndicator.classList.toggle("donate-form__tab-indicator--right", isSpecific);
      }
    });
  });

  if (donateForm && donateFeedback) {
    donateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("donorEmail").value.trim();
      const amount = document.getElementById("donateAmount").value.trim();
      const frequency = document.getElementById("donateFrequency").value;

      donateFeedback.classList.remove("donate-form__feedback--error");

      if (!email || !email.includes("@")) {
        donateFeedback.classList.add("donate-form__feedback--error");
        donateFeedback.textContent = "Please enter a valid email address.";
        return;
      }

      if (!amount || Number(amount) <= 0) {
        donateFeedback.classList.add("donate-form__feedback--error");
        donateFeedback.textContent = "Please enter a valid donation amount.";
        return;
      }

      const freqLabel = frequency === "monthly" ? "monthly" : "one-time";
      donateFeedback.textContent = `Thank you! Your $${Number(amount).toLocaleString("en-US")} ${freqLabel} ${activeDonationType.toLowerCase()} is ready.`;
      donateForm.reset();
    });
  }

  /* 5. Stories Carousel Controls */
  const storiesGrid = document.getElementById("storiesGrid");
  const storiesPrev = document.getElementById("storiesPrev");
  const storiesNext = document.getElementById("storiesNext");

  if (storiesGrid && storiesPrev && storiesNext) {
    storiesNext.addEventListener("click", () => {
      const first = storiesGrid.firstElementChild;
      if (first) storiesGrid.appendChild(first);
    });

    storiesPrev.addEventListener("click", () => {
      const last = storiesGrid.lastElementChild;
      if (last) storiesGrid.prepend(last);
    });
  }

  /* 6. FAQ Pills & Accordion */
  const faqPills = document.querySelectorAll(".faq__pill");
  faqPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      faqPills.forEach((p) => p.classList.remove("faq__pill--active"));
      pill.classList.add("faq__pill--active");
    });
  });

  const faqItems = document.querySelectorAll("#faqList .faq-item");
  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-item__trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("faq-item--open");
      faqItems.forEach((other) => {
        other.classList.remove("faq-item--open");
        const otherBtn = other.querySelector(".faq-item__trigger");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("faq-item--open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
});
