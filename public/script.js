/* eslint-disable no-console */
(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Full-page loader: show only if loading takes longer than 2s ----------
  const pageLoader = qs("#pageLoader");
  let loaderWasShown = false;

  const showLoaderIfStillLoading = () => {
    if (document.readyState !== "complete" && pageLoader) {
      pageLoader.classList.add("page-loader--visible");
      loaderWasShown = true;
    }
  };
  const loaderTimer = setTimeout(showLoaderIfStillLoading, 2000);

  const onPageFullyLoaded = () => {
    clearTimeout(loaderTimer);
    if (!pageLoader) return;
    if (loaderWasShown) {
      pageLoader.classList.remove("page-loader--visible");
      pageLoader.classList.add("is-hidden");
      pageLoader.addEventListener("transitionend", () => pageLoader.remove(), { once: true });
    } else {
      pageLoader.remove();
    }
  };
  if (document.readyState === "complete") {
    onPageFullyLoaded();
  } else {
    window.addEventListener("load", onPageFullyLoaded);
  }

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // ---------- Drawer (mobile menu) ----------
  const drawer = qs("#drawer");
  const overlay = qs("#overlay");
  const btnMenu = qs("#btnMenu");
  const btnCloseMenu = qs("#btnCloseMenu");

  const setOverlayVisible = (visible) => {
    if (!overlay) return;
    overlay.hidden = !visible;
    overlay.style.pointerEvents = visible ? "auto" : "none";
  };

  const openDrawer = () => {
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    btnMenu?.setAttribute("aria-expanded", "true");
    setOverlayVisible(true);
    document.body.classList.add("no-scroll");
  };

  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    btnMenu?.setAttribute("aria-expanded", "false");
    setOverlayVisible(false);
    document.body.classList.remove("no-scroll");
  };

  btnMenu?.addEventListener("click", () => {
    const isOpen = drawer?.classList.contains("is-open");
    isOpen ? closeDrawer() : openDrawer();
  });
  btnCloseMenu?.addEventListener("click", closeDrawer);
  overlay?.addEventListener("click", closeDrawer);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // ---------- Sticky header shadow + toTop ----------
  const masthead = qs(".masthead");
  const toTop = qs("#toTop");

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (masthead) masthead.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.hidden = y < 520;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  // ---------- Carousel ----------
  const carousel = qs(".carousel");
  const track = qs("#carouselTrack");
  const dots = qsa(".carousel__dots .dot");
  const slides = track ? Array.from(track.children) : [];

  let index = 0;
  let timer = null;
  let lastUserActionAt = 0;

  const clampIndex = (i) => {
    const n = slides.length || 1;
    return ((i % n) + n) % n;
  };

  const setActiveDot = (i) => {
    dots.forEach((d, di) => {
      const active = di === i;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-selected", active ? "true" : "false");
    });
  };

  const goTo = (i, { user = false } = {}) => {
    if (!track || slides.length === 0) return;
    index = clampIndex(i);
    track.style.transform = `translateX(-${index * 100}%)`;
    setActiveDot(index);
    if (user) lastUserActionAt = Date.now();
  };

  dots.forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-slide") || 0);
      goTo(i, { user: true });
    });
  });

  const startAutoplay = () => {
    if (!track || slides.length <= 1 || prefersReducedMotion) return;
    stopAutoplay();
    timer = window.setInterval(() => {
      // Give user a short "cooldown" after manual interaction
      if (Date.now() - lastUserActionAt < 5000) return;
      goTo(index + 1);
    }, 5200);
  };

  const stopAutoplay = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  // Pause on hover/focus (desktop) to feel less robotic
  carousel?.addEventListener("mouseenter", stopAutoplay);
  carousel?.addEventListener("mouseleave", startAutoplay);
  carousel?.addEventListener("focusin", stopAutoplay);
  carousel?.addEventListener("focusout", startAutoplay);

  // Swipe / drag (mobile)
  if (carousel && track && slides.length > 1) {
    let down = false;
    let startX = 0;
    let currentX = 0;
    let base = 0;

    const onDown = (clientX) => {
      down = true;
      startX = clientX;
      currentX = clientX;
      base = -index * carousel.clientWidth;
      track.classList.add("is-dragging");
      stopAutoplay();
    };

    const onMove = (clientX) => {
      if (!down) return;
      currentX = clientX;
      const dx = currentX - startX;
      track.style.transform = `translateX(${base + dx}px)`;
    };

    const onUp = () => {
      if (!down) return;
      down = false;
      track.classList.remove("is-dragging");

      const dx = currentX - startX;
      const threshold = Math.max(44, carousel.clientWidth * 0.12);
      if (dx > threshold) goTo(index - 1, { user: true });
      else if (dx < -threshold) goTo(index + 1, { user: true });
      else goTo(index); // snap back

      startAutoplay();
    };

    carousel.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      onDown(e.clientX);
      carousel.setPointerCapture?.(e.pointerId);
    });
    carousel.addEventListener("pointermove", (e) => onMove(e.clientX));
    carousel.addEventListener("pointerup", onUp);
    carousel.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", () => goTo(index), { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  goTo(0);
  startAutoplay();

  // ---------- Partners carousel (dots + drag/swipe) ----------
  const partnersCarousel = qs("#partnersCarousel");
  const partnersTrack = qs("#partnersTrack");
  const partnersSlides = partnersTrack ? Array.from(partnersTrack.querySelectorAll(".partners__slide")) : [];
  const partnersDots = qsa(".partners__dot");

  let partnersIndex = 0;
  let partnersTimer = null;
  let partnersLastUserAt = 0;

  const clampPartnersIndex = (i) => {
    const n = partnersSlides.length || 1;
    return ((i % n) + n) % n;
  };

  const setPartnersDot = (i) => {
    partnersDots.forEach((d, di) => {
      const active = di === i;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-selected", active ? "true" : "false");
    });
  };

  const getPartnersSlideWidth = () => (partnersCarousel ? partnersCarousel.clientWidth : 0);

  const goToPartners = (i, { user = false } = {}) => {
    if (!partnersTrack || partnersSlides.length === 0) return;
    partnersIndex = clampPartnersIndex(i);
    const slideWidth = getPartnersSlideWidth();
    partnersTrack.style.transform = slideWidth ? `translateX(-${partnersIndex * slideWidth}px)` : "translateX(0)";
    setPartnersDot(partnersIndex);
    if (user) partnersLastUserAt = Date.now();
  };

  partnersDots.forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => e.stopPropagation(), true);
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-slide") || 0);
      goToPartners(idx, { user: true });
    });
  });

  const btnPartnersPrev = qs("#partnersPrev");
  const btnPartnersNext = qs("#partnersNext");
  [btnPartnersPrev, btnPartnersNext].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("pointerdown", (e) => e.stopPropagation(), true);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (btn === btnPartnersPrev) goToPartners(partnersIndex - 1, { user: true });
      else goToPartners(partnersIndex + 1, { user: true });
    });
  });

  const startPartnersAutoplay = () => {
    if (!partnersTrack || partnersSlides.length <= 1 || prefersReducedMotion) return;
    if (partnersTimer) window.clearInterval(partnersTimer);
    partnersTimer = window.setInterval(() => {
      if (Date.now() - partnersLastUserAt < 5000) return;
      goToPartners(partnersIndex + 1);
    }, 4800);
  };

  const stopPartnersAutoplay = () => {
    if (partnersTimer) window.clearInterval(partnersTimer);
    partnersTimer = null;
  };

  partnersCarousel?.addEventListener("mouseenter", stopPartnersAutoplay);
  partnersCarousel?.addEventListener("mouseleave", startPartnersAutoplay);
  partnersCarousel?.addEventListener("focusin", stopPartnersAutoplay);
  partnersCarousel?.addEventListener("focusout", startPartnersAutoplay);

  if (partnersCarousel && partnersTrack && partnersSlides.length > 1) {
    let pDown = false;
    let pStartX = 0;
    let pCurrentX = 0;
    let pBase = 0;

    const onPDown = (clientX) => {
      pDown = true;
      pStartX = clientX;
      pCurrentX = clientX;
      pBase = -partnersIndex * partnersCarousel.clientWidth;
      partnersTrack.classList.add("is-dragging");
      stopPartnersAutoplay();
    };

    const onPMove = (clientX) => {
      if (!pDown) return;
      pCurrentX = clientX;
      const dx = clientX - pStartX;
      partnersTrack.style.transform = `translateX(${pBase + dx}px)`;
    };

    const onPUp = () => {
      if (!pDown) return;
      pDown = false;
      partnersTrack.classList.remove("is-dragging");
      const dx = pCurrentX - pStartX;
      const threshold = Math.max(44, partnersCarousel.clientWidth * 0.12);
      if (dx > threshold) goToPartners(partnersIndex - 1, { user: true });
      else if (dx < -threshold) goToPartners(partnersIndex + 1, { user: true });
      else goToPartners(partnersIndex);
      startPartnersAutoplay();
    };

    partnersCarousel.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target.closest(".partners__btn, .partners__dots")) return;
      onPDown(e.clientX);
      partnersCarousel.setPointerCapture?.(e.pointerId);
    });
    partnersCarousel.addEventListener("pointermove", (e) => onPMove(e.clientX));
    partnersCarousel.addEventListener("pointerup", onPUp);
    partnersCarousel.addEventListener("pointercancel", onPUp);
    window.addEventListener("resize", () => goToPartners(partnersIndex), { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPartnersAutoplay();
    else startPartnersAutoplay();
  });

  goToPartners(0);
  startPartnersAutoplay();

  // ---------- Reviews slider: 1 card per page on mobile, 3 per page on desktop (DB-driven) ----------
  const reviewsTrack = qs("#reviewsTrack");
  const reviewsSliderEl = qs("#reviewsSlider");
  const reviewsDots = qsa(".reviews__dot", reviewsSliderEl);
  const reviewsSlides = qsa(".reviews__slide", reviewsSliderEl);
  const totalReviewsSlides = reviewsSlides.length;
  const REVIEWS_MOBILE_BREAKPOINT = 760;
  let reviewsIndex = 0;

  const reviewsIsMobile = () => window.matchMedia(`(max-width: ${REVIEWS_MOBILE_BREAKPOINT}px)`).matches;

  const reviewsMaxIndex = () => {
    if (totalReviewsSlides <= 0) return 0;
    return reviewsIsMobile()
      ? Math.max(0, totalReviewsSlides - 1)
      : Math.max(0, Math.ceil(totalReviewsSlides / 3) - 1);
  };

  const reviewsTranslatePct = (index) => {
    if (totalReviewsSlides <= 0) return 0;
    return reviewsIsMobile()
      ? (index * 100) / totalReviewsSlides
      : (index * 3 * 100) / totalReviewsSlides;
  };

  const updateReviewsTrackWidth = () => {
    if (!reviewsTrack || totalReviewsSlides <= 0) return;
    const pct = reviewsIsMobile()
      ? totalReviewsSlides * 100
      : (totalReviewsSlides * 100) / 3;
    reviewsTrack.style.width = pct + "%";
  };

  const goToReviews = (index) => {
    if (!reviewsTrack) return;
    const max = reviewsMaxIndex();
    reviewsIndex = Math.max(0, Math.min(index, max));
    const pct = reviewsTranslatePct(reviewsIndex);
    reviewsTrack.style.transform = `translateX(-${pct}%)`;

    reviewsDots.forEach((dot) => {
      const i = Number(dot.getAttribute("data-index") ?? -1);
      const active = i === reviewsIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
  };

  reviewsDots.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-index") ?? 0);
      goToReviews(idx);
    });
  });

  const btnRPrev = qs("#reviewsPrev");
  const btnRNext = qs("#reviewsNext");
  btnRPrev?.addEventListener("click", (e) => {
    e.preventDefault();
    goToReviews(reviewsIndex - 1);
  });
  btnRNext?.addEventListener("click", (e) => {
    e.preventDefault();
    goToReviews(reviewsIndex + 1);
  });

  window.addEventListener("resize", () => {
    updateReviewsTrackWidth();
    goToReviews(reviewsIndex);
  }, { passive: true });

  let reviewsTouchStartX = 0;
  reviewsSliderEl?.addEventListener(
    "touchstart",
    (e) => {
      reviewsTouchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );
  reviewsSliderEl?.addEventListener(
    "touchend",
    (e) => {
      const x = e.changedTouches[0].clientX;
      const delta = x - reviewsTouchStartX;
      if (delta > 50) goToReviews(reviewsIndex - 1);
      else if (delta < -50) goToReviews(reviewsIndex + 1);
    },
    { passive: true }
  );

  if (totalReviewsSlides > 0) {
    updateReviewsTrackWidth();
    goToReviews(0);
  }

  // ---------- Scroll reveal (subtle, non-flashy) ----------
  const revealTargets = [
    ...qsa(".tiles .tile"),
    ...qsa(".partners__slide"),
    ...qsa(".reviews__card"),
    ...qsa(".products .card"),
    ...qsa(".about .panel"),
    ...qsa(".footer__nav"),
  ];

  revealTargets.forEach((el, i) => {
    el.classList.add("reveal");
    // Slightly stagger within each section to feel more "hand-made"
    const delay = Math.min(140, (i % 8) * 18);
    el.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Product page navigation (click any .card) ----------
  // Behavior:
  // - Clicking a card (but NOT its buttons/links/inputs) opens product.html
  // - We pass the card data via sessionStorage so product.html can render it
  const shouldIgnoreCardClick = (target) =>
    !!target?.closest?.("button, a, input, select, textarea, label, .card__actions, .buy, .btn, .btnBuy");

  const extractCardData = (cardEl) => {
    const text = (sel) => (cardEl.querySelector(sel)?.textContent || "").trim();
    return {
      brand: text(".card__brand"),
      title: text(".card__title"),
      priceEuro: (cardEl.querySelector(".card__price strong")?.textContent || "").trim(),
      priceBgn: (cardEl.querySelector(".card__price span")?.textContent || "").trim(),
      ribbons: Array.from(cardEl.querySelectorAll(".card__ribbons .ribbon"))
        .map((r) => (r.textContent || "").trim())
        .filter(Boolean),
    };
  };

  document.addEventListener("click", (e) => {
    const card = e.target.closest?.(".card");
    if (!card) return;
    if (shouldIgnoreCardClick(e.target)) return;

    const payload = extractCardData(card);
    try {
      sessionStorage.setItem("nc_product", JSON.stringify(payload));
    } catch {
      // If storage is blocked, fall back to just navigation.
    }

    window.location.href = "./product.html";
  });

  // ---------- Sidebar mega menu (desktop) ----------
  // Helps on touch devices + click-outside closing (matches real ecommerce behavior).
  const megaItems = qsa(".sidebarItem--hasMega");
  if (megaItems.length) {
    const closeAll = () => megaItems.forEach((it) => it.classList.remove("is-open"));

    document.addEventListener(
      "pointerdown",
      (e) => {
        const inside = e.target.closest?.(".sidebarItem--hasMega");
        if (!inside) closeAll();
      },
      { passive: true }
    );

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });

    megaItems.forEach((item) => {
      const link = item.querySelector(".sidebarLink");
      link?.addEventListener("click", (e) => {
        // On touch/coarse pointers, toggle mega instead of navigating immediately.
        const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
        if (!coarse) return;
        e.preventDefault();
        const open = item.classList.toggle("is-open");
        if (open) megaItems.filter((x) => x !== item).forEach((x) => x.classList.remove("is-open"));
      });
    });
  }

  // ---------- Pagination (category pages: inverter, hyperinverter, floor) ----------
  const paginationNav = qs(".pagination");
  if (paginationNav) {
    const pageBtns = qsa(".pagination .pageBtn");
    const totalPages = Number(paginationNav.dataset.totalPages) || 1;
    let currentPage = 1;

    const setPage = (page) => {
      const p = Math.max(1, Math.min(totalPages, page));
      if (p === currentPage) return;
      currentPage = p;
      let anyNumberActive = false;
      pageBtns.forEach((btn) => {
        const pageNum = Number(btn.dataset.page);
        const isNum = !Number.isNaN(pageNum);
        const isActive = isNum && pageNum === currentPage;
        if (isActive) anyNumberActive = true;
        btn.classList.toggle("is-active", isActive);
        if (isActive) btn.setAttribute("aria-current", "page");
        else btn.removeAttribute("aria-current");
      });
      if (!anyNumberActive) {
        const lastLink = pageBtns.find((b) => (b.getAttribute("aria-label") || "").toLowerCase().includes("последна") || b.textContent.trim() === "»");
        if (currentPage === totalPages && lastLink) {
          lastLink.classList.add("is-active");
          lastLink.setAttribute("aria-current", "page");
        }
      }
      const resultsEl = qs(".results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
    };

    paginationNav.addEventListener("click", (e) => {
      const link = e.target.closest("a.pageBtn");
      if (!link) return;
      e.preventDefault();
      const pageNum = Number(link.dataset.page);
      if (!Number.isNaN(pageNum)) {
        setPage(pageNum);
        return;
      }
      const label = (link.getAttribute("aria-label") || "").toLowerCase();
      if (label.includes("следваща") || link.textContent.trim() === "›") {
        setPage(currentPage + 1);
      } else if (label.includes("последна") || link.textContent.trim() === "»") {
        setPage(totalPages);
      }
    });
  }
})();

