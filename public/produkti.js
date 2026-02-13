/**
 * Produkti (All Products) page – КЛАС filter behavior (same as hyperinverter)
 * Filters product cards by energy efficiency class: Висок (A+++), Междинен (A+/A), Начален (B/C)
 */
(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const grid = qs("#productsGrid");
  const countEl = qs("#resultsCount");
  const klassCheckboxes = qsa('input[name="klass"]');
  const clearBtn = qs("#filtersClear");

  if (!grid) return;

  const cards = qsa(".card", grid);
  const total = cards.length;

  function getSelectedKlass() {
    return klassCheckboxes
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
  }

  function applyKlassFilter() {
    const selected = getSelectedKlass();

    let visible = 0;
    cards.forEach((card) => {
      const klass = card.dataset.klass || "";
      const match = selected.length === 0 || selected.includes(klass);
      card.style.display = match ? "" : "none";
      card.hidden = !match;
      if (match) visible++;
    });

    if (countEl) {
      if (selected.length === 0) {
        countEl.textContent = `Показани са всички ${total} продукти`;
      } else {
        countEl.textContent = `Показани са ${visible} от ${total} продукти`;
      }
    }
  }

  klassCheckboxes.forEach((cb) => {
    cb.addEventListener("change", applyKlassFilter);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      klassCheckboxes.forEach((cb) => {
        cb.checked = false;
      });
      qsa('.filters input[type="checkbox"]').forEach((cb) => {
        cb.checked = false;
      });
      applyKlassFilter();
    });
  }

  applyKlassFilter();
})();
