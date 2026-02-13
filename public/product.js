(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const safeText = (v) => (typeof v === "string" ? v.trim() : "");

  const dataRaw = sessionStorage.getItem("nc_product");
  let data = null;
  try {
    data = dataRaw ? JSON.parse(dataRaw) : null;
  } catch {
    data = null;
  }

  const elTitle = qs("#pdpTitle");
  const elCrumb = qs("#pdpCrumbCurrent");
  const elEuro = qs("#pdpPriceEuro");
  const elBgn = qs("#pdpPriceBgn");
  const elRibbons = qs("#pdpRibbons");

  // Only overwrite with sessionStorage when we have product data there; otherwise keep server-rendered content (price, title, etc.)
  if (data && typeof data === "object") {
    const title = safeText(data.title) || "Продукт";
    const priceEuro = safeText(data.priceEuro);
    const priceBgn = safeText(data.priceBgn);
    const ribbons = Array.isArray(data.ribbons) ? data.ribbons.map(safeText).filter(Boolean) : [];

    if (elTitle) elTitle.textContent = title;
    if (elCrumb) elCrumb.textContent = title;
    document.title = `${title} • NesebarClima`;
    if (elEuro && priceEuro) elEuro.textContent = priceEuro;
    if (elBgn && priceBgn) elBgn.textContent = priceBgn;

    if (elRibbons && ribbons.length) {
    const toTagClass = (t) => {
      const v = t.toLowerCase();
      if (v.includes("монтаж")) return "tag tag--red";
      if (v.includes("лихва")) return "tag tag--mint";
      if (v.includes("wifi")) return "tag tag--violet";
      if (v.includes("отопление")) return "tag tag--orange";
      return "tag tag--blue";
    };

    elRibbons.innerHTML = ribbons
      .slice(0, 4)
      .map((t) => `<span class="${toTagClass(t)}">${t}</span>`)
      .join("");
    }
  }

  // Gallery thumbs: switch hero image by data-src
  const hero = qs("#pdpHeroImg");
  const thumbs = qsa(".pdpThumb");
  const applyThumb = (idx) => {
    thumbs.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.img) === idx));
    const src = thumbs[idx]?.dataset.src;
    if (hero && src) hero.src = src;
  };
  thumbs.forEach((b) => {
    b.addEventListener("click", () => applyThumb(Number(b.dataset.img) || 0));
  });
  applyThumb(0);

  // Qty stepper
  const qtyInput = qs("#qtyInput");
  const btnMinus = qs("#qtyMinus");
  const btnPlus = qs("#qtyPlus");
  const clampQty = (n) => Math.max(1, Math.min(99, n));

  const setQty = (n) => {
    if (!qtyInput) return;
    qtyInput.value = String(clampQty(n));
  };

  btnMinus?.addEventListener("click", () => setQty((Number(qtyInput?.value) || 1) - 1));
  btnPlus?.addEventListener("click", () => setQty((Number(qtyInput?.value) || 1) + 1));
  qtyInput?.addEventListener("change", () => setQty(Number(qtyInput.value) || 1));
})();

