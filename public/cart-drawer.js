/**
 * Cart drawer – slide-in panel. Single source: GET /api/cart (session).
 * New add-to-cart: POST /cart/add then open drawer and render from response.
 */
(function () {
  'use strict';

  var overlay = document.getElementById('cartDrawerOverlay');
  var panel = document.getElementById('cartDrawerPanel');
  var titleEl = document.getElementById('cartDrawerTitle');
  var closeBtn = document.getElementById('cartDrawerClose');
  var emptyEl = document.getElementById('cartDrawerEmpty');
  var itemsEl = document.getElementById('cartDrawerItems');
  var totalsEl = document.getElementById('cartDrawerTotals');
  var subtotalEl = document.getElementById('cartDrawerSubtotalAmount');
  var totalEl = document.getElementById('cartDrawerTotalAmount');
  var checkoutBtn = document.getElementById('cartDrawerCheckout');
  var cartLink = document.querySelector('.headIcon--cart, [data-cart-toggle]');
  var badgeEl = document.querySelector('.headIcon__badge');
  var headerStockCount = document.getElementById('headerStockCount');
  var headerStockTotal = document.getElementById('headerStockTotal');

  if (!overlay || !panel || !cartLink) return;

  var IMG_BASE = '/assets/images/';

  function setBadge(count) {
    if (badgeEl) badgeEl.textContent = String(count);
  }

  function updateHeaderStock(cartCount, totalEurFormatted, totalBgnFormatted) {
    if (headerStockCount) headerStockCount.textContent = String(cartCount);
    if (headerStockTotal) headerStockTotal.textContent = '(' + (totalEurFormatted || '0,00 €') + ' | ' + (totalBgnFormatted || '0,00 лв.') + ')';
  }

  function openDrawer() {
    overlay.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    loadCart();
  }

  function closeDrawer() {
    overlay.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showEmpty() {
    if (titleEl) titleEl.textContent = 'Количката е празна';
    if (emptyEl) emptyEl.hidden = false;
    if (itemsEl) { itemsEl.hidden = true; itemsEl.innerHTML = ''; }
    if (totalsEl) totalsEl.hidden = true;
    if (checkoutBtn) checkoutBtn.hidden = true;
  }

  function renderCart(data) {
    var cart = Array.isArray(data && data.cart) ? data.cart : [];
    var cartCount = data && typeof data.cartCount === 'number' ? data.cartCount : cart.reduce(function (s, i) { return s + (i.quantity || 0); }, 0);
    var totalEur = (data && data.totalEurFormatted) ? data.totalEurFormatted : '0,00 €';
    var totalBgn = (data && data.totalBgnFormatted) ? data.totalBgnFormatted : '0,00 лв.';

    setBadge(cartCount);
    updateHeaderStock(cartCount, totalEur, totalBgn);

    if (cart.length === 0) {
      showEmpty();
      return;
    }

    if (titleEl) titleEl.textContent = cartCount === 1 ? '1 продукт в количката' : cartCount + ' продукта в количката';
    if (emptyEl) emptyEl.hidden = true;
    if (itemsEl) itemsEl.hidden = false;
    if (totalsEl) totalsEl.hidden = false;
    if (checkoutBtn) checkoutBtn.hidden = false;
    if (subtotalEl) subtotalEl.textContent = totalEur + ' / ' + totalBgn;
    if (totalEl) totalEl.textContent = totalEur + ' / ' + totalBgn;

    var html = '';
    cart.forEach(function (item) {
      var idx = item.index != null ? item.index : 0;
      var img = (item.img && item.img.indexOf('/') < 0) ? IMG_BASE + item.img : (item.img || IMG_BASE + 'kmta-400x267.jpg.webp');
      var href = '/product/' + (item.productId || '');
      var displayName = (item.modelLabel != null ? item.modelLabel : item.title) || '';
      var title = displayName.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      var qty = item.quantity || 1;
      var unit = item.unitPriceFormatted || '';
      var line = item.lineTotalFormatted || '';
      html += '<div class="cart-drawer-item" data-index="' + idx + '">';
      html += '<a href="' + href + '" class="cart-drawer-item__img-wrap"><img src="' + img + '" alt="" class="cart-drawer-item__img" width="56" height="56"></a>';
      html += '<div class="cart-drawer-item__info">';
      html += '<h3 class="cart-drawer-item__title"><a href="' + href + '">' + title + '</a></h3>';
      html += '<div class="cart-drawer-item__meta">' + unit + '</div>';
      html += '<div class="cart-drawer-item__qty-line"><span class="cart-drawer-item__qty">Кол.: ' + qty + '</span><span class="cart-drawer-item__line-total">' + line + '</span></div>';
      html += '</div>';
      html += '<button type="button" class="cart-drawer-item__remove" data-remove-index="' + idx + '" aria-label="Премахни">×</button>';
      html += '</div>';
    });
    if (itemsEl) itemsEl.innerHTML = html;

    if (itemsEl) {
      itemsEl.querySelectorAll('[data-remove-index]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          removeItem(btn.getAttribute('data-remove-index'));
        });
      });
    }
  }

  function loadCart() {
    fetch('/api/cart?_=' + Date.now(), {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then(function (res) {
        if (!res.ok) throw new Error('cart fetch failed');
        return res.json();
      })
      .then(function (json) {
        renderCart(json || {});
      })
      .catch(function () {
        renderCart({ cart: [], cartCount: 0 });
      });
  }

  /** New add-to-cart: POST then update drawer and open it. */
  function addToCart(productId, quantity) {
    var body = new URLSearchParams();
    body.append('productId', String(productId));
    body.append('quantity', String(Math.max(1, parseInt(quantity, 10) || 1)));
    return fetch('/cart/add', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    }).then(function (res) {
      if (!res.ok) throw new Error('add failed');
      return res.json();
    });
  }

  function removeItem(index) {
    var body = new URLSearchParams();
    body.append('index', String(index));
    fetch('/cart/remove', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('remove failed');
        return res.json();
      })
      .then(function (json) {
        renderCart(json || {});
      })
      .catch(function () {
        loadCart();
      });
  }

  function triggerAddFeedback() {
    if (!cartLink) return;
    cartLink.classList.add('headIcon--just-added');
    clearTimeout(cartLink._cartFeedbackTimer);
    cartLink._cartFeedbackTimer = setTimeout(function () {
      cartLink.classList.remove('headIcon--just-added');
    }, 600);
  }

  cartLink.addEventListener('click', function (e) {
    e.preventDefault();
    openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeDrawer();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeDrawer();
  });

  /* New add-to-cart: only forms with data-add-to-cart or action="/cart/add" */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    var isAddForm = form.getAttribute('data-add-to-cart') !== null ||
      (String(form.getAttribute('action') || '').indexOf('/cart/add') !== -1);
    if (!isAddForm) return;

    e.preventDefault();

    var productIdInput = form.querySelector('input[name="productId"]');
    var quantityInput = form.querySelector('input[name="quantity"]');
    var productId = productIdInput ? productIdInput.value : '';
    var quantity = quantityInput ? quantityInput.value : 1;

    if (!productId) {
      loadCart();
      return;
    }

    addToCart(productId, quantity)
      .then(function (json) {
        renderCart(json);
        openDrawer();
        triggerAddFeedback();
      })
      .catch(function () {
        loadCart();
        openDrawer();
      });
  });

  loadCart();

  if (window.location.hash === '#cart') {
    openDrawer();
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
})();
