(() => {
  "use strict";

  /* ===== SECURITY ===== */
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I","J","C","U"].includes(e.key)) ||
      (e.ctrlKey && e.key === "U")
    ) e.preventDefault();
  });

  /* ===== HEADER SCROLL ===== */
  const header = document.getElementById("header");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ===== MOBILE NAV ===== */
  const navToggle = document.getElementById("nav-toggle");
  const navList   = document.getElementById("nav-list");

  // Overlay for closing menu when clicking outside
  const overlay = document.createElement("div");
  overlay.className = "nav__overlay";
  document.body.appendChild(overlay);

  const openNav = () => {
    navList.classList.add("open");
    overlay.classList.add("open");
    navToggle.innerHTML = '<i class="bx bx-x"></i>';
    document.body.style.overflow = "hidden";
  };
  const closeNav = () => {
    navList.classList.remove("open");
    overlay.classList.remove("open");
    navToggle.innerHTML = '<i class="bx bx-menu"></i>';
    document.body.style.overflow = "";
  };

  navToggle?.addEventListener("click", () => {
    navList.classList.contains("open") ? closeNav() : openNav();
  });
  overlay.addEventListener("click", closeNav);
  navList.querySelectorAll(".nav__link").forEach((l) => l.addEventListener("click", closeNav));

  /* ===== ACTIVE NAV ON SCROLL ===== */
  const sections = document.querySelectorAll("section[id]");
  const navLinks  = document.querySelectorAll(".nav__link");

  const highlightNav = () => {
    const y = window.scrollY + 80;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const bot = top + sec.offsetHeight;
      const id  = sec.getAttribute("id");
      const link = document.querySelector(`.nav__link[href="#${id}"]`);
      if (link) link.classList.toggle("active", y >= top && y < bot);
    });
  };
  window.addEventListener("scroll", highlightNav, { passive: true });

  /* ===== HERO SLIDESHOW ===== */
  const slides    = document.querySelectorAll(".hero__slide");
  const dotsWrap  = document.getElementById("hero-dots");
  let current = 0, timer;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "hero__dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = () => dotsWrap.querySelectorAll(".hero__dot");

  const goTo = (n) => {
    slides[current].classList.remove("active");
    dots()[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots()[current].classList.add("active");
  };

  const next = () => goTo(current + 1);

  const startTimer = () => { timer = setInterval(next, 5000); };
  const stopTimer  = () => clearInterval(timer);

  startTimer();
  document.querySelector(".hero")?.addEventListener("mouseenter", stopTimer);
  document.querySelector(".hero")?.addEventListener("mouseleave", startTimer);

  /* ===== STATS COUNTER ===== */
  const counters = document.querySelectorAll(".stats__num");
  let counted = false;

  const runCounters = () => {
    counters.forEach((el) => {
      const target = +el.dataset.target;
      const duration = 1800;
      const step = target / (duration / 16);
      let val = 0;
      const tick = () => {
        val = Math.min(val + step, target);
        el.textContent = Math.floor(val);
        if (val < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };

  // Trigger when stats section enters viewport
  const statsSection = document.querySelector(".stats");
  if (statsSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !counted) {
          counted = true;
          runCounters();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(statsSection);
  }

  /* ===== SCROLL REVEAL (fade-up) ===== */
  const revealEls = document.querySelectorAll(
    ".services__card, .portfolio__item, .about__img-wrap, .about__content, .contact__info, .contact__form, .stats__item"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = `opacity .6s ease ${i * 0.07}s, transform .6s ease ${i * 0.07}s`;
    revealObserver.observe(el);
  });

  /* ===== CONTACT FORM ===== */
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const original = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending… <i class='bx bx-loader-alt bx-spin'></i>";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        submitBtn.innerHTML = "Sent! <i class='bx bx-check'></i>";
        submitBtn.style.background = "#16a34a";
        form.reset();
        setTimeout(() => {
          submitBtn.innerHTML = original;
          submitBtn.style.background = "";
          submitBtn.disabled = false;
        }, 3500);
      } else {
        throw new Error();
      }
    } catch {
      submitBtn.innerHTML = "Failed — try again <i class='bx bx-error'></i>";
      submitBtn.style.background = "#b91c1c";
      setTimeout(() => {
        submitBtn.innerHTML = original;
        submitBtn.style.background = "";
        submitBtn.disabled = false;
      }, 3000);
    }
  });

  /* ===== RESPECT REDUCED MOTION ===== */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelector(".marquee__inner")?.style.setProperty("animation", "none");
    revealEls.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.transition = "none";
    });
  }

})();