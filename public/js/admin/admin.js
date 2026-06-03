const Admin = {
  token: null,
  currentPage: 'dashboard',
  _pollTimer: null,

  init() {
    this.token = localStorage.getItem('admin_token');
    if (this.token) {
      api.setToken(this.token);
      document.getElementById('adminLogin').style.display = 'none';
      document.getElementById('adminDashboard').style.display = 'block';
      this.initDarkMode();
      this.initLang();
      this.navigate('dashboard');
      this.startPolling();
    }
  },

  initDarkMode() {
    var dark = localStorage.getItem('bati_admin_dark') === 'true';
    document.body.classList.toggle('dark-mode', dark);
    var toggles = document.querySelectorAll('.dark-toggle');
    toggles.forEach(function(el) {
      el.innerHTML = dark ? Admin.icon('light') : Admin.icon('dark');
    });
  },

  toggleDark() {
    var dark = !document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode', dark);
    localStorage.setItem('bati_admin_dark', dark);
    var toggles = document.querySelectorAll('.dark-toggle');
    toggles.forEach(function(el) {
      el.innerHTML = dark ? Admin.icon('light') : Admin.icon('dark');
    });
  },

  initLang() {
    var lang = localStorage.getItem('bati_admin_lang') || 'fr';
    document.body.classList.toggle('rtl', lang === 'ar');
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    var toggles = document.querySelectorAll('.lang-toggle');
    toggles.forEach(function(el) { el.textContent = lang === 'ar' ? 'FR' : 'AR'; });
  },

  toggleLang() {
    var current = document.documentElement.lang;
    var next = current === 'ar' ? 'fr' : 'ar';
    localStorage.setItem('bati_admin_lang', next);
    document.body.classList.toggle('rtl', next === 'ar');
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
    var toggles = document.querySelectorAll('.lang-toggle');
    toggles.forEach(function(el) { el.textContent = next === 'ar' ? 'FR' : 'AR'; });
    this.navigate(this.currentPage);
  },

  t(fr, ar) {
    return document.documentElement.lang === 'ar' ? ar : fr;
  },

  showToast(msg, type) {
    if (!type) type = 'info';
    var t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'toast ' + type;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(function() { t.classList.remove('show'); }, 3000);
  },

  toggleSidebar() {
    document.getElementById('adminSidebar').classList.toggle('open');
  },

  async login() {
    var phone = document.getElementById('adminPhone').value.trim();
    var password = document.getElementById('adminPassword').value;
    var errorEl = document.getElementById('adminLoginError');
    errorEl.textContent = '';
    if (!phone || !password) {
      errorEl.textContent = 'Veuillez remplir tous les champs / الرجاء ملء جميع الحقول';
      return;
    }
    var btn = document.querySelector('.login-card .btn');
    btn.textContent = 'Connexion...';
    btn.disabled = true;
    try {
      var data = await api.adminLogin(phone, password);
      api.setToken(data.token);
      this.token = data.token;
      localStorage.setItem('admin_token', data.token);
      document.getElementById('adminLogin').style.display = 'none';
      document.getElementById('adminDashboard').style.display = 'block';
      this.initDarkMode();
      this.initLang();
      this.navigate('dashboard');
      this.startPolling();
      this.showToast('Bienvenue ' + (data.admin.name || 'Admin'), 'success');
    } catch (e) {
      errorEl.textContent = e.message;
    }
    btn.textContent = 'Se connecter';
    btn.disabled = false;
  },

  logout() {
    localStorage.removeItem('admin_token');
    api.setToken(null);
    this.token = null;
    this.stopPolling();
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'flex';
    this.showToast('Deconnecte');
  },

  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-item').forEach(function(el) {
      if (el.dataset.page === page) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    if (window.innerWidth <= 768) {
      document.getElementById('adminSidebar').classList.remove('open');
    }
    switch (page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'products': this.renderProducts(); break;
      case 'orders': this.renderOrders(); break;
      case 'rent': this.renderRent(); break;
      case 'clients': this.renderClients(); break;
      case 'stats': this.renderStats(); break;
    }
  },

  getStatusLabel(s) {
    var isAr = document.documentElement.lang === 'ar';
    var map = { nouveau: isAr ? 'جديد' : 'Nouveau', confirme: isAr ? 'مؤكد' : 'Confirme', en_cours: isAr ? 'قيد التنفيذ' : 'En cours', livre: isAr ? 'تم التسليم' : 'Livre', termine: isAr ? 'منتهي' : 'Termine', annule: isAr ? 'ملغي' : 'Annule' };
    return map[s] || s;
  },

  getPaymentLabel(s) {
    var isAr = document.documentElement.lang === 'ar';
    var map = { paid: isAr ? 'مدفوع' : 'Paye', unpaid: isAr ? 'غير مدفوع' : 'Impaye', pending: isAr ? 'قيد الانتظار' : 'En attente' };
    return map[s] || s;
  },

  getPaymentMethodLabel(s) {
    var isAr = document.documentElement.lang === 'ar';
    var map = { cash: isAr ? 'نقداً' : 'Especes', transfer: isAr ? 'تحويل' : 'Virement' };
    return map[s] || s;
  },

  getDeliveryLabel(s) {
    var isAr = document.documentElement.lang === 'ar';
    var map = { delivery: isAr ? 'توصيل' : 'Livraison', pickup: isAr ? 'استلام' : 'Recuperation' };
    return map[s] || s;
  },

  formatPrice(amount) {
    return new Intl.NumberFormat(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-DZ').format(amount || 0) + ' DA';
  },

  // ===== NOTIFICATION POLLING =====
  startPolling() {
    this.stopPolling();
    this._pollTimer = setInterval(function() { Admin.checkNewOrders(); }, 30000);
    this.checkNewOrders();
  },

  stopPolling() {
    if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
  },

  async checkNewOrders() {
    try {
      var data = await api.adminGetNewOrdersCount();
      var badge = document.getElementById('newOrdersBadge');
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'newOrdersBadge';
        badge.className = 'notification-badge';
        var navItem = document.querySelector('.nav-item[data-page="orders"]');
        if (navItem) navItem.appendChild(badge);
      }
      if (data.count > 0) {
        badge.textContent = data.count;
        badge.style.display = 'inline';
        if (data.count > (Admin._lastCount || 0)) {
          Admin.showToast(Admin.t(data.count + ' nouvelle(s) commande(s)', data.count + ' طلب(طلبات) جديد(ة)'), 'info');
        }
      } else {
        badge.style.display = 'none';
      }
      Admin._lastCount = data.count;
    } catch(e) {}
  },

  // ===== SVG ICONS =====
  icon(name) {
    var icons = {
      home: '<svg viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      products: '<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
      orders: '<svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>',
      rent: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>',
      clients: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
      stats: '<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      logout: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
      dark: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
      light: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
      revenue: '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
      search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
      check: '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
      x: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
      plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      image: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
      phone: '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
      location: '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      tag: '<svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      menu: '<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
      cart: '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>',
      eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
      arrowLeft: '<svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
      arrowRight: '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
      print: '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>',
      download: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      dollar: '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
      user: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      note: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    };
    return '<span class="admin-icon">' + (icons[name] || '') + '</span>';
  },

  iconSpan(name, className) {
    return '<span class="icon-svg' + (className ? ' ' + className : '') + '">' + this.icon(name) + '</span>';
  },

  // ===== ORDER DETAIL MODAL =====
  _renderOrderDetail(order) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = '<div class="modal" style="max-width:560px"><h3 class="modal-title">' + Admin.iconSpan('orders') + ' ' + Admin.t('Commande #' + order.id, 'الطلب #' + order.id) + '</h3><div id="orderDetailBody"></div><div class="modal-actions" style="flex-wrap:wrap">' +
      '<button class="btn btn-sm btn-secondary" onclick="Admin.editOrderClient(' + order.id + ')">' + Admin.iconSpan('edit') + ' ' + Admin.t('Client', 'العميل') + '</button>' +
      '<button class="btn btn-sm btn-secondary" onclick="Admin.printInvoice(' + order.id + ')">' + Admin.iconSpan('print') + ' ' + Admin.t('Imprimer', 'طباعة') + '</button>' +
      '<button class="btn btn-sm" onclick="Admin.closeModal(this)">' + Admin.t('Fermer', 'إغلاق') + '</button></div></div>';
    document.body.appendChild(overlay);

    var body = document.getElementById('orderDetailBody');
    var statuses = ['nouveau', 'confirme', 'en_cours', 'livre'];
    var currentIdx = statuses.indexOf(order.status);
    var timelineHtml = statuses.map(function(s, i) {
      var cls = i <= currentIdx ? 'active' : '';
      if (order.status === 'annule') cls = i === 0 ? 'cancelled' : '';
      return '<div class="timeline-step ' + cls + '"><div class="timeline-dot"></div><div class="timeline-content"><div class="step-label">' + Admin.getStatusLabel(s) + '</div></div></div>';
    }).join('');
    if (order.status === 'annule') {
      timelineHtml += '<div class="timeline-step cancelled"><div class="timeline-dot"></div><div class="timeline-content"><div class="step-label">' + Admin.getStatusLabel('annule') + '</div></div></div>';
    }

    var itemsHtml = '';
    if (order.items && order.items.length > 0) {
      itemsHtml = '<div class="order-detail-section"><h4>' + Admin.t('PRODUITS COMMANDES', 'المنتجات المطلوبة') + '</h4>';
      for (var i = 0; i < order.items.length; i++) {
        var item = order.items[i];
        var itemName = item.Product ? item.Product.name : '#' + item.product_id;
        itemsHtml += '<div class="info-row"><span class="info-label">' + itemName + ' x' + item.quantity + '</span><span class="info-value">' + Admin.formatPrice(item.price * item.quantity) + '</span></div>';
      }
      itemsHtml += '<div class="info-row" style="font-weight:700;border-top:2px solid var(--gray-200);padding-top:8px"><span class="info-label">' + Admin.t('Total', 'المجموع') + '</span><span class="info-value" style="color:var(--secondary);font-size:16px">' + Admin.formatPrice(order.total_amount) + '</span></div></div>';
    }

    var notesHtml = order.notes ? '<div class="order-detail-section"><h4>' + Admin.t('NOTES', 'ملاحظات') + '</h4><p style="font-size:13px;color:var(--gray-600);background:var(--gray-50);padding:12px;border-radius:8px">' + order.notes + '</p></div>' : '';

    body.innerHTML =
      '<div class="order-detail-section"><h4>' + Admin.t('INFORMATIONS CLIENT', 'معلومات العميل') + '</h4>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Nom', 'الاسم') + '</span><span class="info-value">' + (order.client_name || '-') + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Telephone', 'الهاتف') + '</span><span class="info-value" dir="ltr">' + (order.client_phone || '-') + '</span></div>' +
      '<div class="info-row"><span class="info-label">Wilaya</span><span class="info-value">' + (order.wilaya || '-') + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Adresse', 'العنوان') + '</span><span class="info-value">' + (order.address || '-') + '</span></div></div>' +
      itemsHtml +
      '<div class="order-detail-section"><h4>' + Admin.t('PAIEMENT', 'الدفع') + '</h4>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Montant', 'المبلغ') + '</span><span class="info-value" style="color:var(--secondary)">' + Admin.formatPrice(order.total_amount) + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Mode paiement', 'طريقة الدفع') + '</span><span class="info-value">' + Admin.getPaymentMethodLabel(order.payment_method || 'cash') + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Statut paiement', 'حالة الدفع') + '</span><span class="info-value"><span class="payment-badge payment-' + (order.payment_status || 'pending') + '">' + Admin.getPaymentLabel(order.payment_status || 'pending') + '</span></span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Date', 'التاريخ') + '</span><span class="info-value">' + new Date(order.created_at).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</span></div></div>' +
      notesHtml +
      '<div class="order-detail-section"><h4>' + Admin.t('STATUT', 'الحالة') + '</h4><div class="order-timeline">' + timelineHtml + '</div></div>';
  },

  _renderRentDetail(rent) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = '<div class="modal" style="max-width:560px"><h3 class="modal-title">' + Admin.iconSpan('rent') + ' ' + Admin.t('Location #' + rent.id, 'الإيجار #' + rent.id) + '</h3><div id="rentDetailBody"></div><div class="modal-actions" style="flex-wrap:wrap">' +
      '<button class="btn btn-sm btn-secondary" onclick="Admin.editRentOrderClient(' + rent.id + ')">' + Admin.iconSpan('edit') + ' ' + Admin.t('Client', 'العميل') + '</button>' +
      '<button class="btn btn-sm btn-secondary" onclick="Admin.printRentInvoice(' + rent.id + ')">' + Admin.iconSpan('print') + ' ' + Admin.t('Imprimer', 'طباعة') + '</button>' +
      '<button class="btn btn-sm" onclick="Admin.closeModal(this)">' + Admin.t('Fermer', 'إغلاق') + '</button></div></div>';
    document.body.appendChild(overlay);

    var body = document.getElementById('rentDetailBody');
    var statuses = ['nouveau', 'confirme', 'en_cours', 'termine'];
    var currentIdx = statuses.indexOf(rent.status);
    var timelineHtml = statuses.map(function(s, i) {
      var cls = i <= currentIdx ? 'active' : '';
      if (rent.status === 'annule') cls = i === 0 ? 'cancelled' : '';
      return '<div class="timeline-step ' + cls + '"><div class="timeline-dot"></div><div class="timeline-content"><div class="step-label">' + Admin.getStatusLabel(s) + '</div></div></div>';
    }).join('');
    if (rent.status === 'annule') {
      timelineHtml += '<div class="timeline-step cancelled"><div class="timeline-dot"></div><div class="timeline-content"><div class="step-label">' + Admin.getStatusLabel('annule') + '</div></div></div>';
    }

    var notesHtml = rent.notes ? '<div class="order-detail-section"><h4>' + Admin.t('NOTES', 'ملاحظات') + '</h4><p style="font-size:13px;color:var(--gray-600);background:var(--gray-50);padding:12px;border-radius:8px">' + rent.notes + '</p></div>' : '';

    body.innerHTML =
      '<div class="order-detail-section"><h4>' + Admin.t('INFORMATIONS CLIENT', 'معلومات العميل') + '</h4>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Nom', 'الاسم') + '</span><span class="info-value">' + (rent.client_name || '-') + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Telephone', 'الهاتف') + '</span><span class="info-value" dir="ltr">' + (rent.client_phone || '-') + '</span></div></div>' +
      '<div class="order-detail-section"><h4>' + Admin.t('LOCATION', 'الإيجار') + '</h4>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Produit', 'المنتج') + '</span><span class="info-value">' + (rent.Product ? rent.Product.name : '-') + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Du', 'من') + '</span><span class="info-value">' + new Date(rent.start_date).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Au', 'إلى') + '</span><span class="info-value">' + new Date(rent.end_date).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Total', 'المجموع') + '</span><span class="info-value" style="color:var(--secondary)">' + Admin.formatPrice(rent.total_amount) + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Livraison', 'التوصيل') + '</span><span class="info-value">' + Admin.getDeliveryLabel(rent.delivery_type || 'delivery') + '</span></div>' +
      (rent.address ? '<div class="info-row"><span class="info-label">' + Admin.t('Adresse', 'العنوان') + '</span><span class="info-value">' + rent.address + '</span></div>' : '') + '</div>' +
      '<div class="order-detail-section"><h4>' + Admin.t('PAIEMENT', 'الدفع') + '</h4>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Mode paiement', 'طريقة الدفع') + '</span><span class="info-value">' + Admin.getPaymentMethodLabel(rent.payment_method || 'cash') + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + Admin.t('Statut paiement', 'حالة الدفع') + '</span><span class="info-value"><span class="payment-badge payment-' + (rent.payment_status || 'pending') + '">' + Admin.getPaymentLabel(rent.payment_status || 'pending') + '</span></span></div></div>' +
      notesHtml +
      '<div class="order-detail-section"><h4>' + Admin.t('STATUT', 'الحالة') + '</h4><div class="order-timeline">' + timelineHtml + '</div></div>';
  },

  // ===== EDIT CLIENT INFO =====
  editOrderClient(orderId) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = '<div class="modal" style="max-width:450px"><h3 class="modal-title">' + Admin.iconSpan('edit') + ' ' + Admin.t('Modifier le client', 'تعديل العميل') + '</h3>' +
      '<form id="editClientForm" onsubmit="return false">' +
      '<div class="form-group"><label class="form-label">' + Admin.t('Nom', 'الاسم') + '</label><input type="text" class="form-input" id="ecName"></div>' +
      '<div class="form-group"><label class="form-label">' + Admin.t('Telephone', 'الهاتف') + '</label><input type="tel" class="form-input" id="ecPhone" dir="ltr"></div>' +
      '<div class="form-group"><label class="form-label">Wilaya</label><input type="text" class="form-input" id="ecWilaya"></div>' +
      '<div class="form-group"><label class="form-label">' + Admin.t('Adresse', 'العنوان') + '</label><textarea class="form-textarea" id="ecAddress" rows="2"></textarea></div>' +
      '<div id="ecError" class="form-error"></div></form>' +
      '<div class="modal-actions"><button class="btn" onclick="Admin.closeModal(this)">' + Admin.t('Annuler', 'إلغاء') + '</button><button class="btn btn-primary" onclick="Admin.saveOrderClient(' + orderId + ')">' + Admin.iconSpan('check') + ' ' + Admin.t('Enregistrer', 'حفظ') + '</button></div></div>';
    document.body.appendChild(overlay);

    api.adminGetOrders({ page: 1, limit: 1000 }).then(function(data) {
      for (var i = 0; i < data.orders.length; i++) {
        if (data.orders[i].id == orderId) {
          document.getElementById('ecName').value = data.orders[i].client_name || '';
          document.getElementById('ecPhone').value = data.orders[i].client_phone || '';
          document.getElementById('ecWilaya').value = data.orders[i].wilaya || '';
          document.getElementById('ecAddress').value = data.orders[i].address || '';
          break;
        }
      }
    });
  },

  async saveOrderClient(orderId) {
    var errEl = document.getElementById('ecError');
    errEl.textContent = '';
    var data = {
      client_name: document.getElementById('ecName').value.trim(),
      client_phone: document.getElementById('ecPhone').value.trim(),
      wilaya: document.getElementById('ecWilaya').value.trim(),
      address: document.getElementById('ecAddress').value.trim()
    };
    try {
      await api.adminUpdateOrderClient(orderId, data);
      Admin.showToast(Admin.t('Client mis a jour', 'تم تحديث العميل'), 'success');
      document.querySelector('#editClientForm').closest('.modal-overlay').remove();
      Admin.loadOrders(Admin._orderPage || 1);
    } catch (e) {
      errEl.textContent = e.message;
    }
  },

  editRentOrderClient(rentId) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = '<div class="modal" style="max-width:450px"><h3 class="modal-title">' + Admin.iconSpan('edit') + ' ' + Admin.t('Modifier le client', 'تعديل العميل') + '</h3>' +
      '<form id="editClientForm" onsubmit="return false">' +
      '<div class="form-group"><label class="form-label">' + Admin.t('Nom', 'الاسم') + '</label><input type="text" class="form-input" id="ecName"></div>' +
      '<div class="form-group"><label class="form-label">' + Admin.t('Telephone', 'الهاتف') + '</label><input type="tel" class="form-input" id="ecPhone" dir="ltr"></div>' +
      '<div class="form-group"><label class="form-label">Wilaya</label><input type="text" class="form-input" id="ecWilaya"></div>' +
      '<div class="form-group"><label class="form-label">' + Admin.t('Adresse', 'العنوان') + '</label><textarea class="form-textarea" id="ecAddress" rows="2"></textarea></div>' +
      '<div id="ecError" class="form-error"></div></form>' +
      '<div class="modal-actions"><button class="btn" onclick="Admin.closeModal(this)">' + Admin.t('Annuler', 'إلغاء') + '</button><button class="btn btn-primary" onclick="Admin.saveRentOrderClient(' + rentId + ')">' + Admin.iconSpan('check') + ' ' + Admin.t('Enregistrer', 'حفظ') + '</button></div></div>';
    document.body.appendChild(overlay);

    api.adminGetRentOrders({ page: 1, limit: 1000 }).then(function(data) {
      var orders = data.rent_orders || [];
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].id == rentId) {
          document.getElementById('ecName').value = orders[i].client_name || '';
          document.getElementById('ecPhone').value = orders[i].client_phone || '';
          document.getElementById('ecWilaya').value = orders[i].wilaya || '';
          document.getElementById('ecAddress').value = orders[i].address || '';
          break;
        }
      }
    });
  },

  async saveRentOrderClient(rentId) {
    var errEl = document.getElementById('ecError');
    errEl.textContent = '';
    var data = {
      client_name: document.getElementById('ecName').value.trim(),
      client_phone: document.getElementById('ecPhone').value.trim(),
      wilaya: document.getElementById('ecWilaya').value.trim(),
      address: document.getElementById('ecAddress').value.trim()
    };
    try {
      await api.adminUpdateRentOrderClient(rentId, data);
      Admin.showToast(Admin.t('Client mis a jour', 'تم تحديث العميل'), 'success');
      document.querySelector('#editClientForm').closest('.modal-overlay').remove();
      Admin.loadRentOrders(Admin._rentPage || 1);
    } catch (e) {
      errEl.textContent = e.message;
    }
  },

  // ===== CONFIRM STATUS CHANGE =====
  showStatusConfirm(orderId, currentStatus, newStatus, isRent) {
    var type = isRent ? 'rent' : 'order';
    var typeLabel = isRent ? Admin.t('location', 'الإيجار') : Admin.t('commande', 'الطلب');
    var confirmMsg = Admin.t('Confirmer le changement de statut de la ' + typeLabel + ' #' + orderId + ' vers "' + Admin.getStatusLabel(newStatus) + '" ?', 'تأكيد تغيير حالة ' + typeLabel + ' #' + orderId + ' إلى "' + Admin.getStatusLabel(newStatus) + '" ؟');
    if ((newStatus === 'livre' || newStatus === 'termine' || newStatus === 'annule') && !confirm(confirmMsg)) return;

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = '<div class="modal" style="max-width:450px"><h3 class="modal-title">' + Admin.iconSpan('orders') + ' ' + Admin.t('Mise a jour', 'تحديث') + '</h3>' +
      '<p style="margin-bottom:16px;font-size:14px">' + Admin.t('Changer le statut vers', 'تغيير الحالة إلى') + ': <strong>' + Admin.getStatusLabel(newStatus) + '</strong></p>' +
      '<div class="form-group"><label class="form-label">' + Admin.t('Notes (interne)', 'ملاحظات (داخلية)') + '</label><textarea class="form-textarea" id="statusNotes" rows="3" placeholder="' + Admin.t('Optionnel...', 'اختياري...') + '"></textarea></div>' +
      '<div class="form-group"><label class="form-label">' + Admin.t('Statut paiement', 'حالة الدفع') + '</label><select class="form-select" id="statusPayment"><option value="">' + Admin.t('Ne pas changer', 'عدم التغيير') + '</option><option value="paid">' + Admin.getPaymentLabel('paid') + '</option><option value="unpaid">' + Admin.getPaymentLabel('unpaid') + '</option><option value="pending">' + Admin.getPaymentLabel('pending') + '</option></select></div>' +
      '<div id="statusError" class="form-error"></div>' +
      '<div class="modal-actions"><button class="btn" onclick="Admin.closeModal(this)">' + Admin.t('Annuler', 'إلغاء') + '</button><button class="btn btn-primary" onclick="Admin.executeStatusUpdate(' + orderId + ',\'' + newStatus + '\',' + isRent + ')">' + Admin.iconSpan('check') + ' ' + Admin.t('Confirmer', 'تأكيد') + '</button></div></div>';
    document.body.appendChild(overlay);
  },

  async executeStatusUpdate(id, newStatus, isRent) {
    var errEl = document.getElementById('statusError');
    errEl.textContent = '';
    var notes = document.getElementById('statusNotes').value.trim();
    var paymentStatus = document.getElementById('statusPayment').value;
    var body = { status: newStatus };
    if (notes) body.notes = notes;
    if (paymentStatus) body.payment_status = paymentStatus;
    try {
      if (isRent) {
        await api.adminUpdateRentOrderStatus(id, newStatus, { notes, payment_status: paymentStatus || undefined });
      } else {
        await api.adminUpdateOrderStatus(id, newStatus, { notes, payment_status: paymentStatus || undefined });
      }
      Admin.showToast(Admin.t('Statut mis a jour', 'تم تحديث الحالة'), 'success');
      document.querySelector('#statusNotes').closest('.modal-overlay').remove();
      if (isRent) Admin.loadRentOrders(Admin._rentPage || 1);
      else Admin.loadOrders(Admin._orderPage || 1);
    } catch (e) {
      errEl.textContent = e.message;
    }
  },

  // ===== PRINT INVOICE =====
  async printInvoice(orderId) {
    var win = window.open('', '_blank');
    if (!win) { Admin.showToast(Admin.t('Autorisez les popups pour imprimer', 'اسمح بالنوافذ المنبثقة للطباعة'), 'error'); return; }
    try {
      var data = await api.adminGetOrders({ page: 1, limit: 1000 });
      var order = null;
      for (var i = 0; i < data.orders.length; i++) {
        if (data.orders[i].id == orderId) { order = data.orders[i]; break; }
      }
      if (!order) { win.close(); Admin.showToast(Admin.t('Commande introuvable', 'الطلب غير موجود'), 'error'); return; }
      Admin._printOrder(win, order);
    } catch (e) {
      win.close();
      Admin.showToast(e.message, 'error');
    }
  },

  async printRentInvoice(rentId) {
    var win = window.open('', '_blank');
    if (!win) { Admin.showToast(Admin.t('Autorisez les popups pour imprimer', 'اسمح بالنوافذ المنبثقة للطباعة'), 'error'); return; }
    try {
      var data = await api.adminGetRentOrders({ page: 1, limit: 1000 });
      var rent = null;
      for (var i = 0; i < data.rent_orders.length; i++) {
        if (data.rent_orders[i].id == rentId) { rent = data.rent_orders[i]; break; }
      }
      if (!rent) { win.close(); Admin.showToast(Admin.t('Location introuvable', 'الإيجار غير موجود'), 'error'); return; }
      Admin._printRentOrder(win, rent);
    } catch (e) {
      win.close();
      Admin.showToast(e.message, 'error');
    }
  },

  _printOrder(win, order) {
    var isAr = document.documentElement.lang === 'ar';
    var dir = isAr ? 'rtl' : 'ltr';
    var lang = isAr ? 'ar' : 'fr';
    var itemsHtml = '';
    if (order.items && order.items.length > 0) {
      for (var i = 0; i < order.items.length; i++) {
        var item = order.items[i];
        var itemName = item.Product ? item.Product.name : '#' + item.product_id;
        itemsHtml += '<tr><td>' + itemName + '</td><td style="text-align:center">' + item.quantity + '</td><td style="text-align:right">' + Admin.formatPrice(item.price) + '</td><td style="text-align:right">' + Admin.formatPrice(item.price * item.quantity) + '</td></tr>';
      }
    }
    win.document.write('<html dir="' + dir + '" lang="' + lang + '"><head><meta charset="UTF-8"><title>' + Admin.t('Facture #' + order.id, 'فاتورة #' + order.id) + '</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#333}h1{text-align:center;color:#0A1628;margin-bottom:4px}.subtitle{text-align:center;color:#666;margin-bottom:30px}.section{margin-bottom:20px}.section h3{font-size:14px;color:#666;text-transform:uppercase;margin-bottom:8px;border-bottom:2px solid #D4A843;padding-bottom:4px}.row{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}table{width:100%;border-collapse:collapse;margin-bottom:16px}th,td{padding:10px 12px;border-bottom:1px solid #ddd;font-size:13px}th{background:#f5f5f5;font-weight:600}.total-row{font-weight:700;font-size:16px;color:#0A1628}.footer{text-align:center;margin-top:40px;color:#999;font-size:12px}.status-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600}.livre{background:#d1fae5;color:#047857}.annule{background:#fee2e2;color:#b91c1c}.nouveau{background:#dbeafe;color:#1d4ed8}</style></head><body><h1>BATI Nova</h1><p class="subtitle">' + Admin.t('Facture', 'فاتورة') + ' #' + order.id + ' | <span class="status-badge ' + order.status + '">' + Admin.getStatusLabel(order.status) + '</span></p><div class="section"><h3>' + Admin.t('Client', 'العميل') + '</h3><div class="row"><span>' + Admin.t('Nom', 'الاسم') + '</span><span>' + (order.client_name || '-') + '</span></div><div class="row"><span>' + Admin.t('Telephone', 'الهاتف') + '</span><span>' + (order.client_phone || '-') + '</span></div><div class="row"><span>Wilaya</span><span>' + (order.wilaya || '-') + '</span></div><div class="row"><span>' + Admin.t('Adresse', 'العنوان') + '</span><span>' + (order.address || '-') + '</span></div></div><div class="section"><h3>' + Admin.t('Produits', 'المنتجات') + '</h3><table><thead><tr><th>' + Admin.t('Produit', 'المنتج') + '</th><th style="text-align:center">' + Admin.t('Qté', 'الكمية') + '</th><th style="text-align:right">' + Admin.t('PU', 'س.و') + '</th><th style="text-align:right">' + Admin.t('Total', 'المجموع') + '</th></tr></thead><tbody>' + itemsHtml + '</tbody></table></div><div class="section" style="text-align:right"><div class="row total-row"><span>' + Admin.t('Total a payer', 'المبلغ الإجمالي') + '</span><span>' + Admin.formatPrice(order.total_amount) + '</span></div></div><div class="section"><h3>' + Admin.t('Paiement', 'الدفع') + '</h3><div class="row"><span>' + Admin.t('Statut', 'الحالة') + '</span><span>' + Admin.getPaymentLabel(order.payment_status || 'pending') + '</span></div></div>' + (order.notes ? '<div class="section"><h3>' + Admin.t('Notes', 'ملاحظات') + '</h3><p style="font-size:13px">' + order.notes + '</p></div>' : '') + '<div class="footer"><p>' + Admin.t('Merci de votre confiance', 'شكرا على ثقتكم') + '</p><p>' + new Date(order.created_at).toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR') + '</p></div></body></html>');
    win.document.close();
    setTimeout(function() { win.print(); }, 500);
  },

  _printRentOrder(win, rent) {
    var isAr = document.documentElement.lang === 'ar';
    win.document.write('<html dir="' + (isAr ? 'rtl' : 'ltr') + '" lang="' + (isAr ? 'ar' : 'fr') + '"><head><meta charset="UTF-8"><title>' + Admin.t('Contrat location #' + rent.id, 'عقد إيجار #' + rent.id) + '</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#333}h1{text-align:center;color:#0A1628;margin-bottom:4px}.subtitle{text-align:center;color:#666;margin-bottom:30px}.section{margin-bottom:20px}.section h3{font-size:14px;color:#666;text-transform:uppercase;margin-bottom:8px;border-bottom:2px solid #D4A843;padding-bottom:4px}.row{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}.total-row{font-weight:700;font-size:16px;color:#0A1628}.footer{text-align:center;margin-top:40px;color:#999;font-size:12px}.status-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600}</style></head><body><h1>BATI Nova</h1><p class="subtitle">' + Admin.t('Contrat de location', 'عقد إيجار') + ' #' + rent.id + '</p><div class="section"><h3>' + Admin.t('Client', 'العميل') + '</h3><div class="row"><span>' + Admin.t('Nom', 'الاسم') + '</span><span>' + (rent.client_name || '-') + '</span></div><div class="row"><span>' + Admin.t('Telephone', 'الهاتف') + '</span><span>' + (rent.client_phone || '-') + '</span></div></div><div class="section"><h3>' + Admin.t('Location', 'الإيجار') + '</h3><div class="row"><span>' + Admin.t('Produit', 'المنتج') + '</span><span>' + (rent.Product ? rent.Product.name : '-') + '</span></div><div class="row"><span>' + Admin.t('Du', 'من') + '</span><span>' + new Date(rent.start_date).toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR') + '</span></div><div class="row"><span>' + Admin.t('Au', 'إلى') + '</span><span>' + new Date(rent.end_date).toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR') + '</span></div><div class="row total-row"><span>' + Admin.t('Montant', 'المبلغ') + '</span><span>' + Admin.formatPrice(rent.total_amount) + '</span></div></div><div class="footer"><p>' + Admin.t('Merci de votre confiance', 'شكرا على ثقتكم') + '</p></div></body></html>');
    win.document.close();
    setTimeout(function() { win.print(); }, 500);
  },

  // ===== MODAL HELPERS =====
  closeModal(el) {
    var overlay = el.closest('.modal-overlay');
    if (overlay) overlay.remove();
  },

  // ===== FILTER HELPERS =====
  filterTable(inputId, tableBodyId) {
    var q = document.getElementById(inputId).value.toLowerCase();
    var rows = document.querySelectorAll('#' + tableBodyId + ' tr');
    rows.forEach(function(row) {
      row.style.display = row.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
    });
  },

  // ===== EXPORT CSV =====
  exportOrdersCSV() {
    var table = document.querySelector('#ordersTableBody');
    if (!table || !table.rows.length) { Admin.showToast(Admin.t('Aucune donnee a exporter', 'لا توجد بيانات للتصدير'), 'error'); return; }
    var isAr = document.documentElement.lang === 'ar';
    var headers = ['#', isAr ? 'العميل' : 'Client', isAr ? 'الهاتف' : 'Telephone', 'Wilaya', isAr ? 'المجموع' : 'Total', isAr ? 'الحالة' : 'Statut', isAr ? 'تاريخ' : 'Date', isAr ? 'الدفع' : 'Paiement'];
    var csv = headers.join(',') + '\n';
    for (var i = 0; i < table.rows.length; i++) {
      if (table.rows[i].style.display === 'none') continue;
      var cells = table.rows[i].querySelectorAll('td');
      var row = [];
      for (var j = 0; j < cells.length; j++) {
        var val = cells[j].textContent.trim().replace(/,/g, ' ');
        row.push('"' + val + '"');
      }
      csv += row.join(',') + '\n';
    }
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'commandes_' + new Date().toISOString().slice(0,10) + '.csv';
    link.click();
    Admin.showToast(Admin.t('CSV exporte', 'تم تصدير CSV'), 'success');
  },

  exportRentCSV() {
    var table = document.querySelector('#rentTableBody');
    if (!table || !table.rows.length) { Admin.showToast(Admin.t('Aucune donnee a exporter', 'لا توجد بيانات للتصدير'), 'error'); return; }
    var isAr = document.documentElement.lang === 'ar';
    var headers = ['#', isAr ? 'العميل' : 'Client', isAr ? 'الهاتف' : 'Telephone', isAr ? 'المنتج' : 'Produit', isAr ? 'الفترة' : 'Periode', isAr ? 'المجموع' : 'Total', isAr ? 'الحالة' : 'Statut', isAr ? 'الدفع' : 'Paiement'];
    var csv = headers.join(',') + '\n';
    for (var i = 0; i < table.rows.length; i++) {
      if (table.rows[i].style.display === 'none') continue;
      var cells = table.rows[i].querySelectorAll('td');
      var row = [];
      for (var j = 0; j < cells.length; j++) {
        var val = cells[j].textContent.trim().replace(/,/g, ' ');
        row.push('"' + val + '"');
      }
      csv += row.join(',') + '\n';
    }
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'locations_' + new Date().toISOString().slice(0,10) + '.csv';
    link.click();
    Admin.showToast(Admin.t('CSV exporte', 'تم تصدير CSV'), 'success');
  }
};
