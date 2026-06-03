// ===== HOME PAGE =====
App.renderHome = async function(main) {
  main.innerHTML = `
    <section class="hero">
      <img src="./logo.jpg" alt="BATI Nova">
      <h1>BATI <span>Nova</span></h1>
      <p>${LANG.t('hero_tagline')}</p>
      <div class="search-bar" style="max-width:500px;margin:0 auto">
        <input type="text" id="homeSearch" placeholder="${LANG.t('search_placeholder')}" onkeydown="if(event.key==='Enter'){window.location.hash='search?q='+encodeURIComponent(this.value)}">
        <span class="search-icon">${App.iconSpan('search')}</span>
      </div>
    </section>
    <div class="container">
      <div class="section-header">
        <h2>${App.iconSpan('clock', 'sm')} ${LANG.t('latest_products')}</h2>
        <a href="#search">${LANG.t('see_all')} ${App.iconSpan('arrowLeft', 'sm')}</a>
      </div>
      <div class="products-grid" id="productsGrid">
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">${LANG.t('loading')}</div>
      </div>
    </div>
  `;

  try {
    var data = await api.getProducts({ limit: 12 });
    var grid = document.getElementById('productsGrid');
    var userWilaya = App.currentUser?.wilaya;
    var filtered = data.products.filter(function(p) { return App.isProductAvailable(p, userWilaya); });
    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">'+LANG.t('no_products')+'</div>';
    } else {
      grid.innerHTML = filtered.map(function(p) { return App.renderProductCard(p); }).join('');
    }
  } catch (e) {
    var grid = document.getElementById('productsGrid');
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--error)">'+LANG.t('load_error')+'</div>';
  }
};

// ===== PRODUCT CARD (overrides app.js version) =====
App.renderProductCard2 = function(product) {
  const imgUrl = product.images && product.images.length > 0
    ? product.images.find(i => i.is_primary)?.image_url || product.images[0].image_url
    : './assets/placeholder.svg';

  var isFav = api.isFavorite(product.id);
  var rating = api.getProductRating(product.id);

  var starsHtml = '';
  if (rating.count > 0) {
    starsHtml = '<div class="rating-display" style="margin:4px 0">' +
      '<div class="stars">' +
        Array(5).fill(0).map(function(_, i) {
          var fill = i < Math.round(rating.avg) ? 'fill="#F59E0B"' : 'fill="none"';
          return '<svg viewBox="0 0 24 24" style="width:12px;height:12px" ' + fill + ' stroke="#F59E0B" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        }).join('') +
      '</div>' +
      '<span style="font-size:11px;color:var(--gray-400)">(' + rating.count + ')</span>' +
    '</div>';
  }

  return `
    <div class="product-card" onclick="window.location.hash='product/${product.id}'">
      <div class="product-card-image">
        <img src="${imgUrl}" alt="${product.name}" loading="lazy" onerror="this.src='./assets/placeholder.svg'">
        ${App.getProductBadge(product.type)}
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation();App.toggleFavorite(${product.id})">
          ${App.icon(isFav ? 'heartFilled' : 'heart')}
        </button>
      </div>
      <div class="product-card-body">
        <div class="product-card-title">${product.name}</div>
        ${starsHtml}
        <div class="product-card-price">
          ${App.formatPrice(product.price)}
          ${product.rent_price ? `<small>| ${App.iconSpan('clock', 'sm')} ${App.formatPrice(product.rent_price)}/jr</small>` : ''}
        </div>
      </div>
      <div class="product-card-actions">
        ${product.type === 'sell' || product.type === 'both' ? `<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();App.buyProduct(${product.id})">${App.iconSpan('cart', 'sm')} ${LANG.t('buy')}</button>` : ''}
        ${product.type === 'rent' || product.type === 'both' ? `<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.rentProduct(${product.id})">${App.iconSpan('clock', 'sm')} ${LANG.t('rent_action')}</button>` : ''}
      </div>
    </div>
  `;
};

// Patch: use renderProductCard2 for all product cards
App.renderProductCard = App.renderProductCard2;

// ===== SEARCH PAGE =====
App.renderSearch = async function(main) {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const initialQuery = params.get('q') || '';

  main.innerHTML = `
    <div class="container" style="padding-top:16px">
      <div class="search-bar" style="margin-bottom:16px">
        <input type="text" id="searchInput" placeholder="${LANG.t('search_placeholder')}" value="${initialQuery}" autofocus>
        <span class="search-icon">${App.iconSpan('search')}</span>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <button class="btn btn-sm ${!params.get('type') ? 'btn-primary' : 'btn-outline'}" data-filter="" onclick="App.filterSearch('type','')">${LANG.t('all')}</button>
        <button class="btn btn-sm ${params.get('type') === 'sell' ? 'btn-primary' : 'btn-outline'}" data-filter="sell" onclick="App.filterSearch('type','sell')">${LANG.t('sell')}</button>
        <button class="btn btn-sm ${params.get('type') === 'rent' ? 'btn-primary' : 'btn-outline'}" data-filter="rent" onclick="App.filterSearch('type','rent')">${LANG.t('rent')}</button>
      </div>
      <div class="products-grid" id="searchResults">
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">
          ${initialQuery ? LANG.t('searching') : LANG.t('start_typing')}
        </div>
      </div>
    </div>
  `;

  App._searchTimeout = null;
  const input = document.getElementById('searchInput');

  input.addEventListener('input', () => {
    clearTimeout(App._searchTimeout);
    App._searchTimeout = setTimeout(() => {
      const q = input.value.trim();
      if (q.length >= 2) {
        App.performSearch(q, params.get('type') || '');
      } else if (q.length === 0) {
        document.getElementById('searchResults').innerHTML =
          '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">'+LANG.t('start_typing')+'</div>';
      }
    }, 300);
  });

  if (initialQuery) {
    App.performSearch(initialQuery, params.get('type') || '');
  }
};

App.filterSearch = function(key, value) {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  if (value) params.set(key, value);
  else params.delete(key);
  if (key !== 'q') params.delete('q');
  window.location.hash = 'search?' + params.toString();
};

App.performSearch = async function(q, type) {
  var results = document.getElementById('searchResults');
  if (!results) return;
  results.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">' + App.iconSpan('search', 'lg') + '<br>' + LANG.t('searching') + '</div>';

  try {
    var data = await api.searchProducts(q, type);
    var filtered = data.products;
    var userWilaya = App.currentUser?.wilaya;
    filtered = filtered.filter(function(p) { return App.isProductAvailable(p, userWilaya); });
    if (filtered.length === 0) {
      results.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">'+LANG.t('no_results')+'</div>';
    } else {
      results.innerHTML = filtered.map(function(p) { return App.renderProductCard(p); }).join('');
    }
  } catch (e) {
    results.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--error)">'+LANG.t('search_error')+'</div>';
  }
};

// ===== PRODUCT DETAIL PAGE =====
App.renderProduct = async function(main, id) {
  main.innerHTML = '<div class="container" style="padding:40px;text-align:center;color:var(--gray-400)">'+LANG.t('loading')+'</div>';

  try {
    const data = await api.getProduct(id);
    const p = data.product;
    const images = p.images || [];
    const mainImg = images.length > 0
      ? images.find(i => i.is_primary)?.image_url || images[0].image_url
      : './assets/placeholder.svg';

    var isFav = api.isFavorite(p.id);
    var rating = api.getProductRating(p.id);
    var userRating = App.getUserRating(p.id);
    var allRatings = api.getRatings(p.id);
    var userWilaya = App.currentUser?.wilaya;
    var rentAvailable = App.isRentAvailable(p, userWilaya);
    var productWilayas = p.wilayas ? (typeof p.wilayas === 'string' ? JSON.parse(p.wilayas) : p.wilayas) : [];

    var ratingDisplay = '';
    if (rating.count > 0) {
      ratingDisplay = '<div class="rating-display">' +
        '<div class="stars">' +
          Array(5).fill(0).map(function(_, i) {
            var fill = i < Math.round(rating.avg) ? 'fill="#F59E0B"' : 'fill="none"';
            return '<svg viewBox="0 0 24 24" style="width:16px;height:16px" ' + fill + ' stroke="#F59E0B" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
          }).join('') +
        '</div>' +
        '<span class="avg">' + rating.avg + '</span>' +
        '<span class="count">(' + rating.count + ' ' + LANG.t('rating_count') + ')</span>' +
      '</div>';
    } else {
      ratingDisplay = '<div class="rating-display"><span class="count">' + LANG.t('no_ratings') + '</span></div>';
    }

    var ratingSection = '<div class="rating-section">' +
      '<h3 style="font-size:16px;margin-bottom:8px">' + App.iconSpan('star', 'sm') + ' ' + LANG.t('rating_title') + '</h3>' +
      ratingDisplay;

    if (App.currentUser) {
      ratingSection += '<div style="margin-top:8px">' +
        '<p style="font-size:13px;color:var(--gray-500);margin-bottom:4px">' + LANG.t('your_rating') + '</p>' +
        App.renderStars(userRating ? userRating.score : 0, true, p.id) +
        (userRating ? '<button class="btn btn-sm" style="color:var(--error);margin-top:4px" onclick="App.removeRating(' + p.id + ')">' + LANG.t('rating_remove') + '</button>' : '') +
      '</div>';
    }

    if (allRatings.length > 0) {
      ratingSection += '<div style="margin-top:12px">';
      for (var ri = 0; ri < allRatings.length; ri++) {
        var r = allRatings[ri];
        ratingSection += '<div class="rating-item">' +
          '<span class="rating-user">' + (r.user_name || '#' + r.user_id) + '</span>' +
          '<span>' + App.renderStars(r.score, false) + '</span>' +
        '</div>';
      }
      ratingSection += '</div>';
    }
    ratingSection += '</div>';

    main.innerHTML = `
      <div class="product-detail">
        <div class="product-images">
          <div class="product-main-image" onclick="App.openLightbox(${JSON.stringify(images).replace(/"/g, "'")}, 0)" style="cursor:pointer">
            <img src="${mainImg}" id="productMainImg" alt="${p.name}" onerror="this.src='./assets/placeholder.svg'">
            <button class="fav-btn ${isFav ? 'active' : ''}" style="top:12px;right:12px;width:44px;height:44px;font-size:22px;z-index:3" onclick="event.stopPropagation();App.toggleFavorite(${p.id})">
              ${App.icon(isFav ? 'heartFilled' : 'heart')}
            </button>
          </div>
          ${images.length > 1 ? `
          <div class="product-thumbnails">
            ${images.map((img, i) => `
              <img src="${img.image_url}" class="${i === 0 ? 'active' : ''}"
                onclick="App.openLightbox(${JSON.stringify(images).replace(/"/g, "'")}, ${i})"
                onerror="this.src='./assets/placeholder.svg'">
            `).join('')}
          </div>` : ''}
          <button class="back-btn" style="position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.9);padding:8px 12px;border-radius:20px;z-index:2" onclick="window.history.back()">${App.iconSpan('arrowRight', 'sm')} ${LANG.t('back')}</button>
        </div>
        <div class="product-info">
          <h1>${p.name}</h1>
          ${p.name_ar ? `<p style="font-size:18px;color:var(--gray-500);margin-bottom:8px">${p.name_ar}</p>` : ''}
          ${p.description ? `<p class="description">${p.description}</p>` : ''}
          <div class="product-meta">
            <span class="tag" style="background:var(--primary);color:white">
              ${p.type === 'sell' ? LANG.t('sell') : p.type === 'rent' ? LANG.t('rent') : LANG.t('both')}
            </span>
            <span class="tag" style="background:${p.status === 'available' ? 'var(--success)' : 'var(--error)'};color:white">
              ${p.status === 'available' ? LANG.t('available') : LANG.t('unavailable')}
            </span>
          </div>
          <div class="product-price-section">
            ${p.type === 'sell' || p.type === 'both' ? `
              <div>
                <div class="price">${App.formatPrice(p.price)}</div>
                <small style="color:var(--gray-400)">${LANG.t('price')}</small>
              </div>
            ` : ''}
            ${p.type === 'rent' || p.type === 'both' ? `
              <div style="margin-right:20px;padding-right:20px;border-right:1px solid var(--gray-200)">
                <div class="price">${App.formatPrice(p.rent_price)} <small style="font-size:14px">/ ${p.rent_price_per === 'day' ? LANG.t('per_day') : p.rent_price_per === 'week' ? LANG.t('per_week') : LANG.t('per_month')}</small></div>
                <small style="color:var(--gray-400)">${LANG.t('rent_price')}</small>
                ${productWilayas.length > 0 ? '<div style="margin-top:4px;font-size:12px;color:var(--gray-500)">' + App.iconSpan('location', 'sm') + ' ' + LANG.t('available_in') + ' ' + productWilayas.join(', ') + '</div>' : '<div style="margin-top:4px;font-size:12px;color:var(--gray-500)">' + App.iconSpan('location', 'sm') + ' ' + LANG.t('available_all') + '</div>'}
              </div>
            ` : ''}
          </div>
          ${ratingSection}
          <div class="product-actions">
            ${(p.type === 'sell' || p.type === 'both') && p.status === 'available' ? `
              <button class="btn btn-primary btn-lg btn-block" onclick="App.requireAuth(()=>window.location.hash='order-form/${p.id}')">
                ${App.iconSpan('cart', 'sm')} ${LANG.t('buy_now')}
              </button>
            ` : ''}
            ${(p.type === 'rent' || p.type === 'both') && p.status === 'available' ? `
              ${rentAvailable ? `
                <button class="btn btn-secondary btn-lg btn-block" onclick="App.requireAuth(()=>window.location.hash='rent/${p.id}')">
                  ${App.iconSpan('clock', 'sm')} ${LANG.t('rent_now')}
                </button>
              ` : `
                <div class="btn btn-secondary btn-lg btn-block" style="opacity:0.5;cursor:not-allowed;text-align:center">
                  ${App.iconSpan('x', 'sm')} ${LANG.t('rent_unavailable_wilaya')}
                </div>
              `}
            ` : ''}
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    main.innerHTML = `<div class="container" style="padding:40px;text-align:center;color:var(--error)">${LANG.t('error')}: ${e.message}</div>`;
  }
};

// ===== LOGIN PAGE =====
App.renderLogin = function(main) {
  main.innerHTML = `
    <div class="container" style="padding-top:20px">
      <div style="text-align:center;margin-bottom:24px">
        <img src="./logo.jpg" style="width:80px;margin:0 auto 12px;border-radius:12px" alt="BATI Nova">
        <h1 style="font-size:22px;color:var(--primary)">BATI <span style="color:var(--secondary)">Nova</span></h1>
        <p style="color:var(--gray-500);font-size:14px;margin-top:4px">${LANG.t('login_title')}</p>
      </div>

      <div class="form-group">
        <label class="form-label">${App.iconSpan('phone', 'sm')} ${LANG.t('phone_label')}</label>
        <input type="tel" class="form-input" id="loginPhone" placeholder="${LANG.t('login_phone_placeholder')}" dir="ltr" style="text-align:left" maxlength="10" onkeydown="if(event.key==='Enter')App.loginWithPhone()">
        <div class="form-error" id="phoneError"></div>
      </div>
      <button class="btn btn-primary btn-lg btn-block" onclick="App.loginWithPhone()">${App.iconSpan('phone', 'sm')} ${LANG.t('login_btn')}</button>
    </div>
  `;
};

App.loginWithPhone = async function() {
  const phone = document.getElementById('loginPhone').value.replace(/\s/g, '');
  const errorEl = document.getElementById('phoneError');

  if (!/^(05|06|07|0[567])\d{8}$/.test(phone)) {
    errorEl.textContent = LANG.t('login_error');
    return;
  }
  errorEl.textContent = '';

  const btn = document.querySelector('#mainContent .btn-primary');
  btn.textContent = LANG.t('login_progress');
  btn.disabled = true;

  try {
    const data = await api.loginWithPhone(phone);
    api.setToken(data.token);
    App.currentUser = data.user;
    App.updateAuthUI();
    App.showToast(LANG.t('login_success'), 'success');
    window.location.hash = 'home';
  } catch (e) {
    errorEl.textContent = e.message;
  }

  btn.textContent = LANG.t('login_btn');
  btn.disabled = false;
};

// ===== ORDER FORM =====
// ===== DELIVERY METHOD SELECTION =====
App.selectDelivery = function(prefix, method) {
  document.querySelectorAll('#' + prefix + 'PaymentMethods [data-delivery]').forEach(function(el) {
    el.classList.remove('selected');
  });
  var sel = document.querySelector('#' + prefix + 'PaymentMethods [data-delivery="' + method + '"]');
  if (sel) sel.classList.add('selected');

  var info = document.getElementById(prefix + 'DeliveryInfo');
  var addressGroup = document.getElementById(prefix + 'AddressGroup');
  if (method === 'pickup') {
    info.innerHTML = '<div style="background:#FEF3C7;color:#B45309;padding:12px;border-radius:var(--radius-md);margin-bottom:16px;font-size:13px">' + App.iconSpan('info', 'sm') + ' ' + LANG.t('delivery_pickup_note') + '</div>';
    if (addressGroup) addressGroup.style.display = 'none';
  } else {
    info.innerHTML = '';
    if (addressGroup) addressGroup.style.display = 'block';
  }
};

// ===== PAYMENT METHOD SELECTION =====
App.selectPaymentMethod = function(prefix, method) {
  document.querySelectorAll('#' + prefix + 'PaymentMethods .payment-option').forEach(function(el) {
    el.classList.remove('selected');
  });
  var selected = document.querySelector('#' + prefix + 'PaymentMethods .payment-option[data-method="' + method + '"]');
  if (selected) selected.classList.add('selected');
  var details = document.getElementById(prefix + 'PaymentDetails');
  if (method === 'cash') {
    details.style.display = 'none';
    details.innerHTML = '';
    return;
  }
  if (method === 'transfer') {
    details.innerHTML =
      '<div class="payment-detail-box">' +
        '<div style="font-size:13px;margin-bottom:12px;padding:12px;background:var(--gray-100);border-radius:var(--radius-sm)">' +
          '<strong>CCP:</strong> 12345678 K 001<br>' +
          '<strong>CPA:</strong> CPA 001 23456 7890123 45' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">' + App.iconSpan('file', 'sm') + ' ' + LANG.t('payment_ref') + '</label>' +
          '<input type="text" class="form-input" id="' + prefix + 'TransferRef" placeholder="' + LANG.t('payment_ref_placeholder') + '" dir="ltr" style="text-align:left">' +
        '</div>' +
      '</div>';
  }
  details.style.display = 'block';
};

// ===== ORDER FORM =====
App.renderOrderForm = async function(main, productId) {
  main.innerHTML = '<div class="container" style="padding:40px;text-align:center;color:var(--gray-400)">'+LANG.t('loading')+'</div>';

  try {
    const data = await api.getProduct(productId);
    const p = data.product;

    main.innerHTML = `
      <div class="container">
        <button class="back-btn" onclick="window.history.back()">${App.iconSpan('arrowRight', 'sm')} ${LANG.t('back')}</button>
        <div style="background:var(--white);border-radius:var(--radius-lg);padding:16px;margin-bottom:16px;display:flex;gap:12px">
          <img src="${p.images?.[0]?.image_url || './assets/placeholder.svg'}" style="width:80px;height:80px;border-radius:var(--radius-sm);object-fit:cover" onerror="this.src='./assets/placeholder.svg'">
          <div>
            <h3 style="font-size:16px">${p.name}</h3>
            <div class="product-card-price">${App.formatPrice(p.price)}</div>
          </div>
        </div>

        <div class="order-form">
          <h2 class="section-title">${App.iconSpan('location', 'sm')} ${LANG.t('order_title')}</h2>

          <div class="form-group">
            <label class="form-label">${LANG.t('order_name')}</label>
            <input type="text" class="form-input" id="orderName" placeholder="${LANG.t('order_name_placeholder')}" value="${App.currentUser?.name || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">${App.iconSpan('phone', 'sm')} ${LANG.t('phone_label')}</label>
            <input type="tel" class="form-input" id="orderPhone" placeholder="${LANG.t('login_phone_placeholder')}" dir="ltr" style="text-align:left" value="${App.currentUser?.phone || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">${App.iconSpan('location', 'sm')} ${LANG.t('order_wilaya')}</label>
            <select class="form-select" id="orderWilaya">
              <option value="">${LANG.t('order_wilaya_required')}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${App.iconSpan('info', 'sm')} ${LANG.t('order_address')}</label>
            <textarea class="form-textarea" id="orderAddress" placeholder="${LANG.t('order_address_placeholder')}"></textarea>
          </div>

          <h2 class="section-title" style="margin-top:20px">${App.iconSpan('cart', 'sm')} ${LANG.t('payment_title')}</h2>

          <div class="payment-methods" id="orderPaymentMethods">
            <label class="payment-option selected" data-method="cash" onclick="App.selectPaymentMethod('order', 'cash')">
              <input type="radio" name="order_payment" value="cash" checked hidden>
              <span class="payment-radio"></span>
              <span class="payment-label">${App.iconSpan('dollar', 'sm')} ${LANG.t('payment_cash')}</span>
            </label>
            <label class="payment-option" data-method="transfer" onclick="App.selectPaymentMethod('order', 'transfer')">
              <input type="radio" name="order_payment" value="transfer" hidden>
              <span class="payment-radio"></span>
              <span class="payment-label">${App.iconSpan('building', 'sm')} ${LANG.t('payment_transfer')}</span>
            </label>
          </div>

          <div id="orderPaymentDetails" style="margin-bottom:16px;display:none"></div>

          <div id="orderError" class="form-error" style="text-align:center;margin-bottom:12px"></div>

          <button class="btn btn-primary btn-lg btn-block" id="orderSubmitBtn" onclick="App.submitOrder(${productId})">
            ${App.iconSpan('check', 'sm')} ${LANG.t('order_confirm')} - ${App.formatPrice(p.price)}
          </button>
        </div>
      </div>
    `;

    const wilayaSelect = document.getElementById('orderWilaya');
    APP_WILAYAS.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = w;
      if (w === App.currentUser?.wilaya) opt.selected = true;
      wilayaSelect.appendChild(opt);
    });
  } catch (e) {
    main.innerHTML = `<div class="container" style="padding:40px;text-align:center;color:var(--error)">${e.message}</div>`;
  }
};

App.submitOrder = async function(productId) {
  const name = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.replace(/\s/g, '');
  const wilaya = document.getElementById('orderWilaya').value;
  const address = document.getElementById('orderAddress').value.trim();
  const errorEl = document.getElementById('orderError');

  if (!name) { errorEl.textContent = LANG.t('order_name_required'); return; }
  if (!/^(05|06|07|0[567])\d{8}$/.test(phone)) { errorEl.textContent = LANG.t('order_phone_invalid'); return; }
  if (!wilaya) { errorEl.textContent = LANG.t('order_wilaya_required'); return; }
  if (!address) { errorEl.textContent = LANG.t('order_address_required'); return; }
  errorEl.textContent = '';

  var paymentMethod = document.querySelector('input[name="order_payment"]:checked')?.value || 'cash';
  var paymentDetails = {};

  if (paymentMethod === 'transfer') {
    var tRef = document.getElementById('orderTransferRef')?.value.trim();
    if (!tRef) { errorEl.textContent = LANG.t('payment_ref') + ' ' + LANG.t('order_error_required'); return; }
    paymentDetails = { reference: tRef };
  }

  const btn = document.getElementById('orderSubmitBtn');
  var originalText = btn.textContent;

  btn.textContent = LANG.t('order_processing');
  btn.disabled = true;

  try {
    await api.createOrder({
      client_name: name,
      client_phone: phone,
      wilaya,
      address,
      items: [{ product_id: parseInt(productId), quantity: 1 }],
      payment_method: paymentMethod,
      payment_details: JSON.stringify(paymentDetails)
    });

    App.showToast(LANG.t('order_success'), 'success');
    setTimeout(() => window.location.hash = 'orders', 1000);
  } catch (e) {
    errorEl.textContent = e.message;
  }

  btn.textContent = originalText;
  btn.disabled = false;
};

// ===== ORDER FORM (as route) =====
App.renderOrder = async function(main, productId) {
  if (!productId) { main.innerHTML = '<div class="container" style="padding:40px">'+LANG.t('product_missing')+'</div>'; return; }
  await App.renderOrderForm(main, productId);
};

// ===== RENT FORM =====
App.renderRentForm = async function(main, productId) {
  main.innerHTML = '<div class="container" style="padding:40px;text-align:center;color:var(--gray-400)">'+LANG.t('loading')+'</div>';

  try {
    const data = await api.getProduct(productId);
    const p = data.product;
    var rentWilayas = p.wilayas ? (typeof p.wilayas === 'string' ? JSON.parse(p.wilayas) : p.wilayas) : [];
    var wilayaDisplay = rentWilayas.length > 0 ? LANG.t('available_in') + ' ' + rentWilayas.join(', ') : LANG.t('available_all');

    main.innerHTML = `
      <div class="container">
        <button class="back-btn" onclick="window.history.back()">${App.iconSpan('arrowRight', 'sm')} ${LANG.t('back')}</button>
        <div style="background:var(--white);border-radius:var(--radius-lg);padding:16px;margin-bottom:16px;display:flex;gap:12px">
          <img src="${p.images?.[0]?.image_url || './assets/placeholder.svg'}" style="width:80px;height:80px;border-radius:var(--radius-sm);object-fit:cover" onerror="this.src='./assets/placeholder.svg'">
          <div>
            <h3 style="font-size:16px">${p.name}</h3>
            <div class="product-card-price">${App.formatPrice(p.rent_price)} <small>/ ${p.rent_price_per === 'day' ? LANG.t('per_day') : p.rent_price_per === 'week' ? LANG.t('per_week') : LANG.t('per_month')}</small></div>
            <div style="font-size:12px;color:var(--gray-500);margin-top:4px">${App.iconSpan('location', 'sm')} ${wilayaDisplay}</div>
          </div>
        </div>

        <div class="order-form">
          <h2 class="section-title">${App.iconSpan('clock', 'sm')} ${LANG.t('rent_period')}</h2>

          <div class="rent-dates">
            <div class="form-group">
              <label class="form-label">${LANG.t('rent_start')}</label>
              <input type="date" class="form-input" id="rentStart" dir="ltr" style="text-align:left">
            </div>
            <div class="form-group">
              <label class="form-label">${LANG.t('rent_end')}</label>
              <input type="date" class="form-input" id="rentEnd" dir="ltr" style="text-align:left">
            </div>
          </div>

          <div id="rentAvailability"></div>

          <div class="rent-calculation" id="rentCalc" style="display:none">
            <div class="row"><span>${LANG.t('rent_daily_price')}</span><span id="rentPriceDisplay">${App.formatPrice(p.rent_price)}</span></div>
            <div class="row"><span>${LANG.t('rent_days')}</span><span id="rentDaysDisplay">0</span></div>
            <div class="row total"><span>${LANG.t('rent_total')}</span><span id="rentTotalDisplay">0 DA</span></div>
          </div>

          <h2 class="section-title" style="margin-top:20px">${App.iconSpan('location', 'sm')} ${LANG.t('order_title')}</h2>

          <div class="payment-methods" id="rentDeliveryMethods" style="margin-bottom:12px">
            <label class="payment-option selected" data-delivery="delivery" onclick="App.selectDelivery('rent', 'delivery')">
              <input type="radio" name="rent_delivery" value="delivery" checked hidden>
              <span class="payment-radio"></span>
              <span class="payment-label">${App.iconSpan('truck', 'sm')} ${LANG.t('delivery_delivery')}</span>
            </label>
            <label class="payment-option" data-delivery="pickup" onclick="App.selectDelivery('rent', 'pickup')">
              <input type="radio" name="rent_delivery" value="pickup" hidden>
              <span class="payment-radio"></span>
              <span class="payment-label">${App.iconSpan('building', 'sm')} ${LANG.t('delivery_pickup')}</span>
            </label>
          </div>

          <div id="rentDeliveryInfo"></div>

          <div class="form-group">
            <label class="form-label">${LANG.t('order_name')}</label>
            <input type="text" class="form-input" id="rentName" value="${App.currentUser?.name || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">${App.iconSpan('phone', 'sm')} ${LANG.t('phone_label')}</label>
            <input type="tel" class="form-input" id="rentPhone" dir="ltr" style="text-align:left" value="${App.currentUser?.phone || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">${App.iconSpan('location', 'sm')} ${LANG.t('order_wilaya')}</label>
            <select class="form-select" id="rentWilaya">
              <option value="">${LANG.t('order_wilaya_required')}</option>
            </select>
          </div>

          <div class="form-group" id="rentAddressGroup">
            <label class="form-label">${App.iconSpan('info', 'sm')} ${LANG.t('delivery_address')}</label>
            <textarea class="form-textarea" id="rentAddress" placeholder="${LANG.t('order_address_placeholder')}"></textarea>
          </div>

          <h2 class="section-title" style="margin-top:20px">${App.iconSpan('cart', 'sm')} ${LANG.t('payment_title')}</h2>

          <div class="payment-methods" id="rentPaymentMethods">
            <label class="payment-option selected" data-method="cash" onclick="App.selectPaymentMethod('rent', 'cash')">
              <input type="radio" name="rent_payment" value="cash" checked hidden>
              <span class="payment-radio"></span>
              <span class="payment-label">${App.iconSpan('dollar', 'sm')} ${LANG.t('payment_cash')}</span>
            </label>
            <label class="payment-option" data-method="transfer" onclick="App.selectPaymentMethod('rent', 'transfer')">
              <input type="radio" name="rent_payment" value="transfer" hidden>
              <span class="payment-radio"></span>
              <span class="payment-label">${App.iconSpan('building', 'sm')} ${LANG.t('payment_transfer')}</span>
            </label>
          </div>

          <div id="rentPaymentDetails" style="margin-bottom:16px;display:none"></div>

          <div id="rentError" class="form-error" style="text-align:center;margin-bottom:12px"></div>

          <button class="btn btn-secondary btn-lg btn-block" id="rentSubmitBtn" onclick="App.submitRent(${productId})" disabled>
            ${App.iconSpan('clock', 'sm')} ${LANG.t('rent_confirm')}
          </button>
        </div>
      </div>
    `;

    const wilayaSelect = document.getElementById('rentWilaya');
    APP_WILAYAS.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = w;
      if (w === App.currentUser?.wilaya) opt.selected = true;
      wilayaSelect.appendChild(opt);
    });

    var wilayaWarning = document.createElement('div');
    wilayaWarning.id = 'rentWilayaWarning';
    wilayaWarning.style.cssText = 'font-size:12px;color:var(--error);margin-top:4px;display:none';
    if (rentWilayas.length > 0) {
      wilayaSelect.addEventListener('change', function() {
        if (this.value && rentWilayas.indexOf(this.value) === -1) {
          wilayaWarning.textContent = LANG.t('rent_unavailable_wilaya');
          wilayaWarning.style.display = 'block';
        } else {
          wilayaWarning.style.display = 'none';
        }
      });
      wilayaSelect.parentNode.appendChild(wilayaWarning);
    }

    const startInput = document.getElementById('rentStart');
    const endInput = document.getElementById('rentEnd');
    const today = new Date().toISOString().split('T')[0];
    startInput.min = today;
    startInput.value = today;

    startInput.addEventListener('change', () => {
      endInput.min = startInput.value;
      if (endInput.value && endInput.value <= startInput.value) {
        endInput.value = '';
      }
      App.calculateRent(p);
    });

    endInput.addEventListener('change', () => App.calculateRent(p));
  } catch (e) {
    main.innerHTML = `<div class="container" style="padding:40px;text-align:center;color:var(--error)">${e.message}</div>`;
  }
};

App.calculateRent = async function(product) {
  const start = document.getElementById('rentStart')?.value;
  const end = document.getElementById('rentEnd')?.value;
  const calc = document.getElementById('rentCalc');
  const avail = document.getElementById('rentAvailability');
  const submitBtn = document.getElementById('rentSubmitBtn');

  if (!start || !end) {
    calc.style.display = 'none';
    avail.innerHTML = '';
    submitBtn.disabled = true;
    return;
  }

  const s = new Date(start);
  const e = new Date(end);
  if (e <= s) {
    calc.style.display = 'none';
    avail.innerHTML = '<div class="form-error">'+LANG.t('rent_date_error')+'</div>';
    submitBtn.disabled = true;
    return;
  }

  const diffTime = Math.abs(e - s);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  let multiplier = diffDays;
  if (product.rent_price_per === 'week') multiplier = Math.ceil(diffDays / 7);
  if (product.rent_price_per === 'month') multiplier = Math.ceil(diffDays / 30);

  const total = parseFloat(product.rent_price) * multiplier;

  document.getElementById('rentPriceDisplay').textContent = App.formatPrice(product.rent_price);
  document.getElementById('rentDaysDisplay').textContent = diffDays;
  document.getElementById('rentTotalDisplay').textContent = App.formatPrice(total);
  calc.style.display = 'block';

  try {
    const availData = await api.checkAvailability(product.id, start, end);
    if (availData.available) {
      avail.innerHTML = '<div style="background:#D1FAE5;color:#047857;padding:12px;border-radius:var(--radius-md);text-align:center;font-weight:600">' + App.iconSpan('check', 'sm') + ' ' + LANG.t('rent_available') + '</div>';
      submitBtn.disabled = false;
    } else {
      avail.innerHTML = '<div class="rent-unavailable">' + App.iconSpan('x', 'sm') + ' ' + LANG.t('rent_unavailable') + '</div>';
      submitBtn.disabled = true;
    }
  } catch (e) {
    avail.innerHTML = '<div class="form-error">'+LANG.t('rent_check_error')+'</div>';
    submitBtn.disabled = true;
  }
};

App.submitRent = async function(productId) {
  const name = document.getElementById('rentName').value.trim();
  const phone = document.getElementById('rentPhone').value.replace(/\s/g, '');
  const wilaya = document.getElementById('rentWilaya').value;
  var deliveryType = document.querySelector('input[name="rent_delivery"]:checked')?.value || 'delivery';
  const address = deliveryType === 'delivery' ? document.getElementById('rentAddress').value.trim() : '';
  const start = document.getElementById('rentStart').value;
  const end = document.getElementById('rentEnd').value;
  const errorEl = document.getElementById('rentError');

  if (!name) { errorEl.textContent = LANG.t('order_name_required'); return; }
  if (!/^(05|06|07|0[567])\d{8}$/.test(phone)) { errorEl.textContent = LANG.t('order_phone_invalid'); return; }
  if (!wilaya) { errorEl.textContent = LANG.t('order_wilaya_required'); return; }
  if (deliveryType === 'delivery' && !address) { errorEl.textContent = LANG.t('order_address_required'); return; }
  if (!start || !end) { errorEl.textContent = LANG.t('rent_select_dates'); return; }
  var warning = document.getElementById('rentWilayaWarning');
  if (warning && warning.style.display !== 'none') { errorEl.textContent = warning.textContent; return; }
  errorEl.textContent = '';

  var paymentMethod = document.querySelector('input[name="rent_payment"]:checked')?.value || 'cash';
  var paymentDetails = {};

  if (paymentMethod === 'transfer') {
    var tRef = document.getElementById('rentTransferRef')?.value.trim();
    if (!tRef) { errorEl.textContent = LANG.t('payment_ref') + ' ' + LANG.t('order_error_required'); return; }
    paymentDetails = { reference: tRef };
  }

  const btn = document.getElementById('rentSubmitBtn');
  var originalText = btn.textContent;

  btn.textContent = LANG.t('order_processing');
  btn.disabled = true;

  try {
    await api.createRent({
      product_id: parseInt(productId),
      client_name: name,
      client_phone: phone,
      wilaya,
      address,
      delivery_type: deliveryType,
      start_date: start,
      end_date: end,
      payment_method: paymentMethod,
      payment_details: JSON.stringify(paymentDetails)
    });

    App.showToast(LANG.t('rent_success'), 'success');
    setTimeout(() => window.location.hash = 'rent-orders', 1000);
  } catch (e) {
    errorEl.textContent = e.message;
  }

  btn.textContent = originalText;
  btn.disabled = false;
};

// ===== RENT FORM ROUTE =====
App.renderRent = async function(main, productId) {
  if (!productId) { main.innerHTML = '<div class="container" style="padding:40px">'+LANG.t('product_missing')+'</div>'; return; }
  await App.renderRentForm(main, productId);
};

// ===== ORDERS LIST =====
App.renderOrders = async function(main) {
  main.innerHTML = `
    <div class="page-header">
      <h1>${App.iconSpan('orders', 'sm')} ${LANG.t('my_orders')}</h1>
    </div>
    <div class="orders-list" id="ordersList">
      <div class="empty-state"><div class="icon">${App.iconSpan('orders', 'xl')}</div><h3>${LANG.t('loading')}</h3></div>
    </div>
    <div style="padding:0 16px;margin-bottom:16px">
      <button class="btn btn-outline btn-block" onclick="window.location.hash='rent-orders'">${App.iconSpan('clock', 'sm')} ${LANG.t('see_rents')}</button>
    </div>
  `;

  try {
    if (!App.currentUser) {
      document.getElementById('ordersList').innerHTML = `
        <div class="empty-state">
          <div class="icon">${App.iconSpan('account', 'xl')}</div>
          <h3>${LANG.t('login')}</h3>
          <p>${LANG.t('orders_login_hint')}</p>
          <button class="btn btn-primary" onclick="window.location.hash='login'" style="margin-top:12px">${LANG.t('login_btn')}</button>
        </div>`;
      return;
    }

    const data = await api.getOrders();
    const list = document.getElementById('ordersList');

    if (data.orders.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="icon">${App.iconSpan('orders', 'xl')}</div><h3>${LANG.t('no_orders')}</h3><p>${LANG.t('orders_empty')}</p></div>`;
      return;
    }

    list.innerHTML = data.orders.map(o => `
      <div class="order-item fade-in" onclick="window.location.hash='order/${o.id}'">
        <div class="order-item-header">
          <span class="order-id">#${o.id}</span>
          <span class="order-status status-${o.status}">${App.getStatusLabel(o.status)}</span>
        </div>
        <div class="order-date">${new Date(o.created_at).toLocaleDateString(LANG.current==='ar'?'ar-DZ':'fr-DZ')}</div>
        <div style="font-size:13px;color:var(--gray-500);margin:4px 0">${App.iconSpan('location', 'sm')} ${o.wilaya}</div>
        <div class="order-total">${App.formatPrice(o.total_amount)}</div>
      </div>
    `).join('');
  } catch (e) {
    document.getElementById('ordersList').innerHTML =
      `<div class="empty-state"><div class="icon">${App.iconSpan('x', 'xl')}</div><h3>${LANG.t('error')}</h3><p>${e.message}</p></div>`;
  }
};

// ===== ORDER DETAIL =====
App.renderOrderDetail = async function(main, id) {
  main.innerHTML = '<div class="container" style="padding:40px;text-align:center;color:var(--gray-400)">'+LANG.t('loading')+'</div>';

  try {
    const data = await api.getOrder(id);
    const o = data.order;

    var statusSteps = ['nouveau', 'confirme', 'en_cours', 'livre'];
    var currentIdx = statusSteps.indexOf(o.status);
    if (o.status === 'termine') currentIdx = 3;
    if (o.status === 'annule') { currentIdx = -2; }

    var timelineHtml = '<div class="status-timeline">';
    if (o.status === 'annule') {
      timelineHtml += '<div class="status-step active"><div class="status-dot">' + App.iconSpan('x', 'sm') + '</div><div class="status-label" style="color:var(--error)">' + LANG.t('status_cancelled') + '</div></div>';
    } else {
      statusSteps.forEach(function(s, i) {
        var cls = i < currentIdx ? 'completed' : (i === currentIdx ? 'active' : '');
        var label = LANG.t('status_' + s);
        var icon = i < currentIdx ? App.iconSpan('check', 'sm') : App.iconSpan('clock', 'sm');
        timelineHtml += '<div class="status-step ' + cls + '"><div class="status-dot">' + icon + '</div><div class="status-label">' + label + '</div></div>';
      });
    }
    timelineHtml += '</div>';

    main.innerHTML = `
      <div class="container print-area" id="invoiceArea">
        <button class="back-btn no-print" onclick="window.location.hash='orders'">${App.iconSpan('arrowRight', 'sm')} ${LANG.t('back_orders')}</button>

        <div style="background:var(--white);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="font-size:20px">${LANG.t('invoice_number')} #${o.id}</h2>
            <span class="order-status status-${o.status}">${App.getStatusLabel(o.status)}</span>
          </div>
          <div style="font-size:13px;color:var(--gray-500);margin-bottom:4px">${App.iconSpan('clock', 'sm')} ${new Date(o.created_at).toLocaleDateString(LANG.current==='ar'?'ar-DZ':'fr-DZ')}</div>
          <div style="font-size:14px;margin:8px 0"><strong>${LANG.t('invoice_client')}:</strong> ${o.client_name} | ${App.iconSpan('phone', 'sm')} ${o.client_phone}</div>
          <div style="font-size:14px;color:var(--gray-600)">${App.iconSpan('location', 'sm')} ${o.wilaya} - ${o.address}</div>
          <div class="order-total" style="margin-top:12px">${LANG.t('invoice_grand_total')}: ${App.formatPrice(o.total_amount)}</div>
        </div>

        <h3 style="font-size:16px;margin-bottom:12px">${App.iconSpan('orders', 'sm')} ${LANG.t('ordered_products')}</h3>
        ${(o.items || []).map(item => `
          <div style="background:var(--white);border-radius:var(--radius-md);padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:600">${item.Product?.name || LANG.t('product_singular')}</div>
              <div style="font-size:13px;color:var(--gray-500)">${LANG.t('invoice_qty')}: ${item.quantity}</div>
            </div>
            <div style="font-weight:600;color:var(--primary)">${App.formatPrice(item.price)}</div>
          </div>
        `).join('')}

        <div style="margin-top:16px">
          <h3 style="font-size:16px;margin-bottom:8px">${App.iconSpan('info', 'sm')} ${LANG.t('status_timeline')}</h3>
          ${timelineHtml}
        </div>

        <button class="print-btn no-print" onclick="window.print()">
          ${App.iconSpan('print', 'sm')} ${LANG.t('print_invoice')}
        </button>
      </div>
    `;
  } catch (e) {
    main.innerHTML = `<div class="container" style="padding:40px;text-align:center;color:var(--error)">${e.message}</div>`;
  }
};

// ===== RENT ORDERS LIST =====
App.renderRentOrders = async function(main) {
  main.innerHTML = `
    <div class="page-header">
      <h1>${App.iconSpan('clock', 'sm')} ${LANG.t('my_rents')}</h1>
    </div>
    <div class="orders-list" id="rentOrdersList">
      <div class="empty-state"><div class="icon">${App.iconSpan('clock', 'xl')}</div><h3>${LANG.t('loading')}</h3></div>
    </div>
    <div style="padding:0 16px;margin-bottom:16px">
      <button class="btn btn-outline btn-block" onclick="window.location.hash='orders'">${App.iconSpan('orders', 'sm')} ${LANG.t('see_orders')}</button>
    </div>
  `;

  try {
    if (!App.currentUser) {
      document.getElementById('rentOrdersList').innerHTML =
        `<div class="empty-state"><div class="icon">${App.iconSpan('account', 'xl')}</div><h3>${LANG.t('login')}</h3><button class="btn btn-primary" onclick="window.location.hash='login'" style="margin-top:12px">${LANG.t('login_btn')}</button></div>`;
      return;
    }

    const data = await api.getRentOrders();
    const list = document.getElementById('rentOrdersList');

    if (data.rent_orders.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="icon">${App.iconSpan('clock', 'xl')}</div><h3>${LANG.t('no_rents')}</h3></div>`;
      return;
    }

    list.innerHTML = data.rent_orders.map(r => `
      <div class="order-item fade-in">
        <div class="order-item-header">
          <span class="order-id">#${r.id} - ${r.Product?.name || LANG.t('product_singular')}</span>
          <span class="order-status status-${r.status}">${App.getStatusLabel(r.status)}</span>
        </div>
        <div style="font-size:13px;color:var(--gray-500)">
          ${App.iconSpan('clock', 'sm')} ${new Date(r.start_date).toLocaleDateString(LANG.current==='ar'?'ar-DZ':'fr-DZ')} → ${new Date(r.end_date).toLocaleDateString(LANG.current==='ar'?'ar-DZ':'fr-DZ')}
        </div>
        <div style="font-size:13px;color:var(--gray-500)">${App.iconSpan('location', 'sm')} ${r.wilaya}</div>
        <div class="order-total">${App.formatPrice(r.total_amount)}</div>
      </div>
    `).join('');
  } catch (e) {
    document.getElementById('rentOrdersList').innerHTML =
      `<div class="empty-state"><div class="icon">${App.iconSpan('x', 'xl')}</div><h3>${LANG.t('error')}</h3></div>`;
  }
};

// ===== FAVORITES PAGE =====
App.renderFavorites = async function(main) {
  main.innerHTML = `
    <div class="page-header">
      <h1>${App.iconSpan('favorites', 'sm')} ${LANG.t('favorites')}</h1>
    </div>
    <div class="products-grid" id="favGrid">
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">${LANG.t('loading')}</div>
    </div>
  `;

  try {
    var favIds = api.getFavorites();
    var grid = document.getElementById('favGrid');

    if (favIds.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">' + App.iconSpan('favorites', 'xl') + '</div><h3>' + LANG.t('fav_empty') + '</h3><p>' + LANG.t('fav_empty_hint') + '</p></div>';
      return;
    }

    var allData = await api.getProducts({ limit: 100 });
    var userWilaya = App.currentUser?.wilaya;
    var favProducts = allData.products.filter(function(p) { return favIds.indexOf(p.id) !== -1 && App.isProductAvailable(p, userWilaya); });

    if (favProducts.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">' + App.iconSpan('favorites', 'xl') + '</div><h3>' + LANG.t('fav_empty') + '</h3></div>';
    } else {
      grid.innerHTML = favProducts.map(function(p) { return App.renderProductCard(p); }).join('');
    }
  } catch (e) {
    document.getElementById('favGrid').innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--error)">' + LANG.t('error') + '</div>';
  }
};

// ===== PROFILE =====
App.renderProfile = async function(main) {
  if (!App.currentUser) {
    App.renderLogin(main);
    return;
  }

  const u = App.currentUser;
  var savedAvatar = localStorage.getItem('bati_avatar_' + u.id) || '';

  main.innerHTML = `
    <div class="profile-page">
      <div class="profile-card">
        <div class="profile-avatar" id="profileAvatarWrap" style="cursor:pointer;position:relative;overflow:hidden" onclick="document.getElementById('avatarInput').click()">
          ${savedAvatar ? '<img src="' + savedAvatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">' : (u.phone?.slice(-2) || '')}
          <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.5);color:white;font-size:10px;padding:2px;text-align:center">${App.iconSpan('image', 'sm')}</div>
        </div>
        <input type="file" id="avatarInput" accept="image/*" style="display:none" onchange="App.saveAvatar(this)">
        <div class="profile-phone" dir="ltr">+213 ${u.phone?.slice(1) || ''}</div>
        <p style="color:var(--gray-500);font-size:14px">${u.name || LANG.t('profile_name_hint')}</p>
      </div>

      <div style="margin-bottom:16px">
        <div class="section-header"><h2>${App.iconSpan('account', 'sm')} ${LANG.t('profile_title')}</h2></div>
      </div>

      <div class="form-group">
        <label class="form-label">${App.iconSpan('account', 'sm')} ${LANG.t('order_name')}</label>
        <input type="text" class="form-input" id="profileName" value="${u.name || ''}" placeholder="${LANG.t('order_name_placeholder')}">
      </div>

      <div class="form-group">
        <label class="form-label">${App.iconSpan('location', 'sm')} ${LANG.t('order_wilaya')}</label>
        <select class="form-select" id="profileWilaya">
          <option value="">${LANG.t('profile_select')}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">${App.iconSpan('info', 'sm')} ${LANG.t('order_address')}</label>
        <textarea class="form-textarea" id="profileAddress" placeholder="${LANG.t('profile_address_placeholder')}">${u.address || ''}</textarea>
      </div>

      <div id="profileError" class="form-error" style="text-align:center;margin-bottom:12px"></div>

      <button class="btn btn-primary btn-block btn-lg" onclick="App.updateProfile()">${App.iconSpan('check', 'sm')} ${LANG.t('profile_save')}</button>

      <hr style="margin:24px 0;border:none;border-top:1px solid var(--gray-200)">

      <button class="btn btn-block btn-lg" style="color:var(--error)" onclick="App.logout()">
        ${App.iconSpan('x', 'sm')} ${LANG.t('profile_logout')}
      </button>
    </div>
  `;

  const wilayaSelect = document.getElementById('profileWilaya');
  APP_WILAYAS.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = w;
    if (w === u.wilaya) opt.selected = true;
    wilayaSelect.appendChild(opt);
  });
};

App.updateProfile = async function() {
  var name = document.getElementById('profileName').value.trim();
  var wilaya = document.getElementById('profileWilaya').value;
  var address = document.getElementById('profileAddress').value.trim();

  try {
    var data = await api.updateProfile({ name, wilaya, address });
    App.currentUser = data.user;
    // persist to localStorage so name survives refresh
    try { localStorage.setItem('bati_user_' + App.currentUser.id, JSON.stringify(App.currentUser)); } catch(e) {}
    App.showToast(LANG.t('profile_saved'), 'success');
  } catch (e) {
    document.getElementById('profileError').textContent = e.message;
  }
};

App.logout = function() {
  api.setToken(null);
  App.currentUser = null;
  App.updateAuthUI();
  App.showToast(LANG.t('logged_out'));
  window.location.hash = 'home';
};

// ===== STATIC PAGES =====
App.renderAbout = function(main) {
  main.innerHTML = `
    <div class="static-page container">
      <h1>${LANG.t('about_title')}</h1>
      <p>${LANG.t('about_p1')}</p>
      <h2>${LANG.t('about_mission')}</h2>
      <p>${LANG.t('about_p2')}</p>
      <h2>${LANG.t('about_why')}</h2>
      <p>${LANG.t('about_features')}</p>
    </div>
  `;
};

App.renderContact = function(main) {
  main.innerHTML = `
    <div class="static-page container">
      <h1>${LANG.t('contact_title')}</h1>
      <p>${LANG.t('contact_subtitle')}</p>
      <div class="form-group"><label class="form-label">${App.iconSpan('account', 'sm')} ${LANG.t('order_name')}</label><input type="text" class="form-input" id="contactName"></div>
      <div class="form-group"><label class="form-label">${App.iconSpan('info', 'sm')} Email</label><input type="email" class="form-input" id="contactEmail"></div>
      <div class="form-group"><label class="form-label">${App.iconSpan('phone', 'sm')} ${LANG.t('phone_label')}</label><input type="tel" class="form-input" id="contactPhone"></div>
      <div class="form-group"><label class="form-label">${App.iconSpan('tag', 'sm')} ${LANG.t('contact_subject')}</label><input type="text" class="form-input" id="contactSubject"></div>
      <div class="form-group"><label class="form-label">${App.iconSpan('info', 'sm')} ${LANG.t('contact_message')}</label><textarea class="form-textarea" id="contactMessage" rows="5"></textarea></div>
      <div id="contactError" class="form-error" style="text-align:center;margin-bottom:12px"></div>
      <button class="btn btn-primary btn-block btn-lg" onclick="App.submitContact()">${App.iconSpan('check', 'sm')} ${LANG.t('contact_send')}</button>
    </div>
  `;
};

App.submitContact = async function() {
  const data = {
    name: document.getElementById('contactName').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    phone: document.getElementById('contactPhone').value.trim(),
    subject: document.getElementById('contactSubject').value.trim(),
    message: document.getElementById('contactMessage').value.trim()
  };

  if (!data.name || !data.message) {
    document.getElementById('contactError').textContent = LANG.t('contact_error');
    return;
  }

  try {
    await api.submitContact(data);
    App.showToast(LANG.t('contact_sent'), 'success');
    window.location.hash = 'home';
  } catch (e) {
    document.getElementById('contactError').textContent = e.message;
  }
};

App.renderTerms = function(main) {
  main.innerHTML = `
    <div class="static-page container">
      <h1>${LANG.t('terms_title')}</h1>
      <p>${LANG.t('terms_p1')}</p>
      <h2>1. ${LANG.t('terms_accept')}</h2>
      <p>${LANG.t('terms_p2')}</p>
      <h2>2. ${LANG.t('terms_use')}</h2>
      <p>${LANG.t('terms_p3')}</p>
      <h2>3. ${LANG.t('terms_resp')}</h2>
    </div>
  `;
};

App.renderPrivacy = function(main) {
  main.innerHTML = `
    <div class="static-page container">
      <h1>${LANG.t('privacy_title')}</h1>
      <p>${LANG.t('privacy_p1')}</p>
      <h2>1. ${LANG.t('privacy_data')}</h2>
      <p>${LANG.t('privacy_p2')}</p>
      <h2>2. ${LANG.t('privacy_use')}</h2>
      <p>${LANG.t('privacy_p3')}</p>
      <h2>3. ${LANG.t('privacy_sec')}</h2>
      <p>${LANG.t('privacy_p4')}</p>
    </div>
  `;
};
