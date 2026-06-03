const App = {
  currentUser: null,
  currentPage: 'home',
  cart: [],

  async init() {
    LANG.init();
    this.initDark();
    this.showLoading();

    const token = api.getToken();
    if (token) {
      try {
        const data = await api.getProfile();
        this.currentUser = data.user;
        try { localStorage.setItem('bati_user_' + this.currentUser.id, JSON.stringify(this.currentUser)); } catch(e) {}
        this.updateAuthUI();
      } catch (e) {
        // restore from localStorage if server is offline
        try {
          var stored = localStorage.getItem('bati_user_' + token);
          if (stored) this.currentUser = JSON.parse(stored);
        } catch(e2) {}
        if (!this.currentUser) api.setToken(null);
      }
    }

    this.setupRouting();
    this.setupGlobalListeners();
    this.hideLoading();
    this.recordVisit();
    this.updateLangUI();
  },

  showLoading() {
    const screen = document.getElementById('loadingScreen');
    if (screen) screen.classList.remove('hide');
  },

  hideLoading() {
    const screen = document.getElementById('loadingScreen');
    if (screen) setTimeout(() => screen.classList.add('hide'), 500);
  },

  setupRouting() {
    window.addEventListener('hashchange', () => { if (!App._routing) { App._routing = true; setTimeout(function() { App._routing = false; }, 100); App.handleRoute(); } });
    if (!window.location.hash) {
      window.location.hash = '#home';
    }
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const parts = hash.split('/');
    const route = parts[0];
    const params = parts.slice(1);

    this.currentPage = route;
    this.updateBottomNav(route);

    const main = document.getElementById('mainContent');
    if (!main) return;

    switch (route) {
      case 'home': this.renderHome(main); break;
      case 'search': this.renderSearch(main); break;
      case 'product': this.renderProduct(main, params[0]); break;
      case 'login': this.renderLogin(main); break;
      case 'orders': this.renderOrders(main); break;
      case 'order-form': this.renderOrder(main, params[0]); break;
      case 'order': this.renderOrderDetail(main, params[0]); break;
      case 'rent': this.renderRent(main, params[0]); break;
      case 'rent-orders': this.renderRentOrders(main); break;
      case 'profile': this.renderProfile(main); break;
      case 'about': this.renderAbout(main); break;
      case 'contact': this.renderContact(main); break;
      case 'terms': this.renderTerms(main); break;
      case 'favorites': this.renderFavorites(main); break;
      case 'privacy': this.renderPrivacy(main); break;
      default: this.renderHome(main);
    }
  },

  updateBottomNav(route) {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === route);
    });
  },

  updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      if (this.currentUser) {
        var avatar = localStorage.getItem('bati_avatar_' + this.currentUser.id);
        loginBtn.innerHTML = avatar
          ? '<img src="' + avatar + '" style="width:28px;height:28px;border-radius:50%;object-fit:cover">'
          : this.iconSpan('account');
      } else {
        loginBtn.innerHTML = this.iconSpan('account');
      }
    }
  },

  setupGlobalListeners() {
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('authModal');
      if (e.target === modal) this.closeModal('authModal');
    });
  },

  toggleLang() {
    LANG.toggle();
    this.updateLangUI();
    this.handleRoute();
  },

  updateLangUI() {
    var btn = document.getElementById('langBtn');
    if (btn) btn.textContent = LANG.current === 'fr' ? 'AR' : 'FR';
    document.querySelectorAll('[data-lang]').forEach(function(el) {
      var key = el.getAttribute('data-lang');
      el.textContent = LANG.t(key);
    });
  },

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  },

  requireAuth(callback) {
    if (this.currentUser) {
      callback();
    } else {
      const main = document.getElementById('mainContent');
      this.renderLogin(main);
    }
  },

  async recordVisit() {
    try {
      await api.recordVisit(this.currentPage);
    } catch (e) {}
  },

  formatPrice(amount) {
    var locale = LANG.current === 'ar' ? 'ar-DZ' : 'fr-DZ';
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' DA';
  },

  getStatusLabel(status) {
    return LANG.t('status_' + status) || status;
  },

  getProductBadge(type) {
    if (type === 'sell') return '<span class="product-card-badge badge-sell">' + LANG.t('badge_sell') + '</span>';
    if (type === 'rent') return '<span class="product-card-badge badge-rent">' + LANG.t('badge_rent') + '</span>';
    return '<span class="product-card-badge badge-both">' + LANG.t('badge_both') + '</span>';
  },

  renderProductCard(product) {
    const imgUrl = product.images && product.images.length > 0
      ? product.images.find(i => i.is_primary)?.image_url || product.images[0].image_url
      : './assets/placeholder.svg';

    return `
      <div class="product-card" onclick="window.location.hash='product/${product.id}'">
        <div class="product-card-image">
          <img src="${imgUrl}" alt="${product.name}" loading="lazy" onerror="this.src='./assets/placeholder.svg'">
          ${this.getProductBadge(product.type)}
        </div>
        <div class="product-card-body">
          <div class="product-card-title">${product.name}</div>
          <div class="product-card-price">
            ${this.formatPrice(product.price)}
            ${product.rent_price ? `<small>| Loc: ${this.formatPrice(product.rent_price)}/jr</small>` : ''}
          </div>
        </div>
        <div class="product-card-actions">
          ${product.type === 'sell' || product.type === 'both' ? `<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();App.buyProduct(${product.id})">Acheter</button>` : ''}
          ${product.type === 'rent' || product.type === 'both' ? `<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.rentProduct(${product.id})">Louer</button>` : ''}
        </div>
      </div>
    `;
  },

  buyProduct(productId) {
    this.requireAuth(() => {
      window.location.hash = `order-form/${productId}`;
    });
  },

  rentProduct(productId) {
    this.requireAuth(() => {
      window.location.hash = `rent/${productId}`;
    });
  },

  // ===== WILAYA AVAILABILITY =====
  isProductAvailable(product, userWilaya) {
    if (!userWilaya) return true;
    if (product.type !== 'rent') return true;
    if (!product.wilayas) return true;
    var wilayas = typeof product.wilayas === 'string' ? JSON.parse(product.wilayas) : product.wilayas;
    return wilayas.indexOf(userWilaya) !== -1;
  },

  isRentAvailable(product, userWilaya) {
    if (product.type === 'sell') return false;
    if (!userWilaya) return true;
    if (!product.wilayas) return true;
    var wilayas = typeof product.wilayas === 'string' ? JSON.parse(product.wilayas) : product.wilayas;
    return wilayas.indexOf(userWilaya) !== -1;
  },

  // ===== FAVORITES =====
  toggleFavorite(productId) {
    var result = api.toggleFavorite(productId);
    this.handleRoute();
    App.showToast(result.is_favorite ? '❤️ ' + LANG.t('add_fav') : LANG.t('remove_fav'));
  },

  isFavorite(productId) {
    return api.isFavorite(productId);
  },

  // ===== RATINGS =====
  renderStars(rating, interactive, productId) {
    var html = '<div class="rating-stars"' + (interactive ? ' id="ratingStars"' : '') + '>';
    for (var i = 1; i <= 5; i++) {
      var active = i <= rating;
      if (interactive) {
        var cls = active ? 'active' : '';
        html += '<button class="star ' + cls + '" data-score="' + i + '" onclick="App.setRating(' + productId + ', ' + i + ')" onmouseenter="this.classList.add(\'hover\');for(var j=1;j<' + i + ';j++)document.querySelector(\'.star[data-score=\'+j+\']\')?.classList.add(\'hover\')" onmouseleave="document.querySelectorAll(\'.star\').forEach(function(s){s.classList.remove(\'hover\')})">' + App.starSvg() + '</button>';
      } else {
        var fill = active ? '#F59E0B' : 'none';
        var stroke = active ? '#F59E0B' : '#CBD5E1';
        html += '<span class="star">' + App.starSvgInline(fill, stroke) + '</span>';
      }
    }
    html += '</div>';
    return html;
  },

  starSvgInline(fill, stroke) {
    return '<svg viewBox="0 0 24 24" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  },

  starSvg() {
    return '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  },

  async setRating(productId, score) {
    if (!this.currentUser) { this.showToast(LANG.t('login_progress')); return; }
    api.submitRating(productId, this.currentUser.id, this.currentUser.name || this.currentUser.phone, score);
    this.showToast(LANG.t('rating_thanks'), 'success');
    this.handleRoute();
  },

  removeRating(productId) {
    if (!this.currentUser) return;
    api.removeRating(productId, this.currentUser.id);
    this.showToast(LANG.t('rating_remove'));
    this.handleRoute();
  },

  getAvgRating(productId) {
    return api.getProductRating(productId);
  },

  getUserRating(productId) {
    if (!this.currentUser) return null;
    return api.getUserRating(productId, this.currentUser.id);
  },

  // ===== DARK MODE =====
  toggleDark() {
    document.body.classList.toggle('dark-mode');
    var isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('bati_dark', isDark ? '1' : '0');
    this._updateDarkIcon();
  },

  initDark() {
    if (localStorage.getItem('bati_dark') === '1') {
      document.body.classList.add('dark-mode');
    }
    this._updateDarkIcon();
  },

  _updateDarkIcon() {
    var isDark = document.body.classList.contains('dark-mode');
    var icon = document.getElementById('darkIcon');
    if (icon) {
      icon.innerHTML = isDark
        ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    }
  },

  // ===== LIGHTBOX =====
  openLightbox(images, index) {
    var existing = document.querySelector('.lightbox');
    if (existing) existing.remove();

    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lightbox-close" onclick="App.closeLightbox()">✕</button>' +
      '<button class="lightbox-prev" onclick="App.lightboxNav(-1)">‹</button>' +
      '<button class="lightbox-next" onclick="App.lightboxNav(1)">›</button>' +
      '<div class="lightbox-counter" id="lbCounter"></div>' +
      '<img id="lbImg" src="" alt="">';
    document.body.appendChild(lb);
    this._lbImages = images;
    this._lbIndex = index || 0;
    this._updateLightbox();
    setTimeout(function() { lb.classList.add('open'); }, 10);

    lb.addEventListener('click', function(e) {
      if (e.target === lb) App.closeLightbox();
    });

    lb.addEventListener('touchstart', function(e) {
      App._lbTouchX = e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - App._lbTouchX;
      if (Math.abs(dx) > 50) App.lightboxNav(dx > 0 ? -1 : 1);
    }, { passive: true });
  },

  _updateLightbox() {
    var img = document.getElementById('lbImg');
    var counter = document.getElementById('lbCounter');
    if (img && this._lbImages && this._lbImages.length > 0) {
      img.src = this._lbImages[this._lbIndex].image_url;
      if (counter) counter.textContent = (this._lbIndex + 1) + ' / ' + this._lbImages.length;
    }
  },

  lightboxNav(dir) {
    if (!this._lbImages) return;
    this._lbIndex = (this._lbIndex + dir + this._lbImages.length) % this._lbImages.length;
    this._updateLightbox();
  },

  closeLightbox() {
    var lb = document.querySelector('.lightbox');
    if (lb) {
      lb.classList.remove('open');
      setTimeout(function() { lb.remove(); }, 300);
    }
  },

  // ===== PROFILE AVATAR =====
  saveAvatar(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var dataUrl = e.target.result;
      if (App.currentUser) {
        localStorage.setItem('bati_avatar_' + App.currentUser.id, dataUrl);
        App.showToast(LANG.t('profile_saved'), 'success');
        if (window.location.hash === '#profile') App.navigate('profile');
      }
    };
    reader.readAsDataURL(file);
  },

  // ===== ICONS =====
  icon(name) {
    var icons = {
      home: '<svg viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
      orders: '<svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>',
      account: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      favorites: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
      heart: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
      heartFilled: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="currentColor"/></svg>',
      star: '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      cart: '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>',
      print: '<svg viewBox="0 0 24 24"><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>',
      dark: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
      light: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
      image: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
      tag: '<svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      check: '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
      x: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      phone: '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
      location: '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
      edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
      arrowLeft: '<svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
      arrowRight: '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
      plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      minus: '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      dollar: '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
      smartphone: '<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      creditCard: '<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      building: '<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="15" y2="18"/></svg>',
      lock: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
      file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      truck: '<svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    };
    return icons[name] || '';
  },

  iconSpan(name, className) {
    return '<span class="icon-svg' + (className ? ' ' + className : '') + '">' + this.icon(name) + '</span>';
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
