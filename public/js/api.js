const API_BASE = '/api';
const USE_LOCAL_STORAGE = false;

function getSeedProducts() {
  return [
    { id: 1, name: 'Ciment CEM I 42.5', name_ar: 'اسمنت CEM I 42.5', description: 'Ciment Portland pour construction g\u00e9n\u00e9rale, livraison en sacs de 50kg', price: 850, rent_price: null, type: 'sell', quantity: 500, status: 'available', featured: 1, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 2, name: 'Fer \u00e0 b\u00e9ton 12mm', name_ar: 'حديد التسليح 12 مم', description: 'Fer \u00e0 b\u00e9ton torr qualit\u00e9 sup\u00e9rieure, paquet de 10 barres', price: 2400, rent_price: null, type: 'sell', quantity: 200, status: 'available', featured: 1, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 3, name: 'Pelle m\u00e9canique', name_ar: 'حفارة ميكانيكية', description: 'Pelle m\u00e9canique pour travaux de terrassement, location \u00e0 la journ\u00e9e', price: 150000, rent_price: 12000, type: 'both', quantity: 3, status: 'available', featured: 1, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 4, name: 'B\u00e9tonni\u00e8re 350L', name_ar: 'خلاطة خرسانة 350 لتر', description: 'B\u00e9tonni\u00e8re \u00e9lectrique 350L pour chantier', price: 85000, rent_price: 5000, type: 'both', quantity: 5, status: 'available', featured: 1, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 5, name: 'Carreaux de c\u00e9ramique 60x60', name_ar: 'بلاط سيراميك 60\u00d760', description: 'Carreaux de c\u00e9ramique gr\u00e8s c\u00e9rame aspect marbre, bo\u00eete de 4 pi\u00e8ces', price: 3200, rent_price: null, type: 'sell', quantity: 150, status: 'available', featured: 1, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 6, name: '\u00c9chafaudage m\u00e9tallique', name_ar: 'سقالة معدنية', description: '\u00c9chafaudage m\u00e9tallique modulaire, hauteur 5m, lot complet', price: 120000, rent_price: 2500, type: 'both', quantity: 8, status: 'available', featured: 0, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 7, name: 'Peinture mate blanc 10L', name_ar: 'طلاء غير لامع أبيض 10 لتر', description: 'Peinture acrylique mate de haute qualit\u00e9, blanc pur, 10L', price: 4500, rent_price: null, type: 'sell', quantity: 80, status: 'available', featured: 0, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 8, name: 'Camion-benne 10m\u00b3', name_ar: 'شاحنة قلابة 10 متر مكعب', description: 'Camion-benne pour transport de mat\u00e9riaux, location avec chauffeur', price: 2800000, rent_price: 35000, type: 'rent', quantity: 2, status: 'available', featured: 1, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 9, name: 'Sable de construction 1m\u00b3', name_ar: 'رمل بناء 1 متر مكعب', description: 'Sable de construction lav\u00e9, livraison en camion', price: 3500, rent_price: null, type: 'sell', quantity: 100, status: 'available', featured: 0, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 10, name: 'Marteau-piqueur perforateur', name_ar: 'مطرقة كهربائية', description: 'Marteau-piqueur perforateur SDS-Max 1500W', price: 45000, rent_price: 2500, type: 'both', quantity: 6, status: 'available', featured: 0, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 11, name: 'Tuyaux PVC 110mm', name_ar: 'أنابيب بي في سي 110 مم', description: 'Tuyaux PVC pour evacuation, longueur 3m, lot de 10', price: 2800, rent_price: null, type: 'sell', quantity: 200, status: 'available', featured: 0, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] },
    { id: 12, name: 'Niveau laser rotatif', name_ar: 'ميزان ليزر دوار', description: 'Niveau laser rotatif professionnel port\u00e9e 500m', price: 65000, rent_price: 3000, type: 'both', quantity: 4, status: 'available', featured: 0, views: 0, created_at: new Date().toISOString(), images: [{ image_url: './assets/placeholder.svg', is_primary: 1 }] }
  ];
}

function getSeedWilayas() { return APP_WILAYAS; }

var DB = {
  init() {
    if (!localStorage.getItem('bati_products')) {
      localStorage.setItem('bati_products', JSON.stringify(getSeedProducts()));
    }
    if (!localStorage.getItem('bati_users')) {
      localStorage.setItem('bati_users', JSON.stringify([]));
    }
    if (!localStorage.getItem('bati_orders')) {
      localStorage.setItem('bati_orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('bati_rent_orders')) {
      localStorage.setItem('bati_rent_orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('bati_contacts')) {
      localStorage.setItem('bati_contacts', JSON.stringify([]));
    }
    if (!localStorage.getItem('bati_visits')) {
      localStorage.setItem('bati_visits', JSON.stringify([]));
    }
    if (!localStorage.getItem('bati_notifications')) {
      localStorage.setItem('bati_notifications', JSON.stringify([]));
    }
    if (!localStorage.getItem('bati_next_id')) {
      localStorage.setItem('bati_next_id', '13');
    }
    if (!localStorage.getItem('bati_next_order_id')) {
      localStorage.setItem('bati_next_order_id', '1');
    }
    if (!localStorage.getItem('bati_next_rent_id')) {
      localStorage.setItem('bati_next_rent_id', '1');
    }
    if (!localStorage.getItem('bati_next_notif_id')) {
      localStorage.setItem('bati_next_notif_id', '1');
    }
    if (!localStorage.getItem('bati_settings')) {
      localStorage.setItem('bati_settings', JSON.stringify({ site_name: 'BATI Nova', whatsapp_number: '213555000000', currency: 'DZD' }));
    }
  },
  get(table) { return JSON.parse(localStorage.getItem('bati_' + table) || '[]'); },
  set(table, data) { localStorage.setItem('bati_' + table, JSON.stringify(data)); },
  nextId(table) {
    var key = 'bati_next' + (table === 'products' ? '_id' : table === 'orders' ? '_order_id' : table === 'rent_orders' ? '_next_rent_id' : '_notif_id');
    var id = parseInt(localStorage.getItem(key) || '1');
    localStorage.setItem(key, String(id + 1));
    return id;
  }
};

function isServerMode() { return !USE_LOCAL_STORAGE; }

function getAuthHeaders() {
  var headers = {};
  var token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return headers;
}

function apiFetch(method, path, body) {
  var opts = {
    method: method,
    headers: getAuthHeaders()
  };
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  return fetch(API_BASE + path, opts).then(function(res) {
    return res.json().then(function(data) {
      if (!res.ok) {
        var err = new Error(data.error || 'Erreur serveur');
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    });
  });
}

var api = {
  token: null,

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('auth_token', token);
    else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
  },

  getToken() {
    if (!this.token) this.token = localStorage.getItem('auth_token');
    return this.token;
  },

  getCurrentUser() {
    try {
      var cached = localStorage.getItem('current_user');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return null;
  },

  // ===== AUTH =====
  async loginWithPhone(phone) {
    if (!isServerMode()) {
      return this._lsLoginWithPhone(phone);
    }
    try {
      var resp = await apiFetch('POST', '/auth/phone-login', { phone: phone });
      localStorage.setItem('current_user', JSON.stringify(resp.user));
      return { message: resp.message, token: resp.token, user: resp.user };
    } catch (e) {
      if (e.status === 401 || e.status === 404) throw e;
      return this._lsLoginWithPhone(phone);
    }
  },

  _lsLoginWithPhone(phone) {
    var users = DB.get('users');
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].phone === phone) { user = users[i]; break; }
    }
    if (!user) {
      user = { id: users.length + 1, phone: phone, name: '', wilaya: '', address: '', is_verified: true };
      users.push(user);
      DB.set('users', users);
    }
    var token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2);
    user.token = token;
    DB.set('users', users);
    var userObj = { id: user.id, phone: user.phone, name: user.name, wilaya: user.wilaya, address: user.address, is_verified: true };
    localStorage.setItem('current_user', JSON.stringify(userObj));
    return { message: 'Connexion reussie', token: token, user: userObj };
  },

  async getProfile() {
    if (!isServerMode()) {
      return this._lsGetProfile();
    }
    try {
      var data = await apiFetch('GET', '/auth/me');
      localStorage.setItem('current_user', JSON.stringify(data.user));
      return data;
    } catch (e) {
      return this._lsGetProfile();
    }
  },

  _lsGetProfile() {
    var user = this.getCurrentUser();
    if (!user) throw new Error('Non authentifie');
    return { user: { id: user.id, phone: user.phone, name: user.name, wilaya: user.wilaya, address: user.address, is_verified: true } };
  },

  async updateProfile(data) {
    if (!isServerMode()) {
      return this._lsUpdateProfile(data);
    }
    try {
      var result = await apiFetch('PUT', '/auth/profile', data);
      if (result.user) localStorage.setItem('current_user', JSON.stringify(result.user));
      return result;
    } catch (e) {
      return this._lsUpdateProfile(data);
    }
  },

  _lsUpdateProfile(data) {
    var users = DB.get('users');
    var current = this.getCurrentUser();
    if (!current) throw new Error('Non authentifie');
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === current.id) {
        if (data.name !== undefined) users[i].name = data.name;
        if (data.wilaya !== undefined) users[i].wilaya = data.wilaya;
        if (data.address !== undefined) users[i].address = data.address;
        DB.set('users', users);
        return { message: 'Profil mis a jour', user: { id: users[i].id, phone: users[i].phone, name: users[i].name, wilaya: users[i].wilaya, address: users[i].address } };
      }
    }
    throw new Error('Utilisateur introuvable');
  },

  async adminLogin(phone, password) {
    if (!isServerMode()) {
      return this._lsAdminLogin(phone, password);
    }
    try {
      return await apiFetch('POST', '/auth/admin/login', { phone: phone, password: password });
    } catch (e) {
      return this._lsAdminLogin(phone, password);
    }
  },

  _lsAdminLogin(phone, password) {
    if (phone === '0215' && password === 'admin215') {
      var token = 'admin_token_' + Date.now();
      return { message: 'Connexion admin reussie', token: token, admin: { id: 1, phone: phone, name: 'Administrateur', role: 'super_admin' } };
    }
    throw new Error('Identifiants incorrects');
  },

  // ===== PRODUCTS =====
  async getProducts(params) {
    if (isServerMode()) {
      try {
        var query = [];
        if (params.type) query.push('type=' + encodeURIComponent(params.type));
        if (params.search) query.push('search=' + encodeURIComponent(params.search));
        if (params.sort) query.push('sort=' + encodeURIComponent(params.sort));
        if (params.page) query.push('page=' + params.page);
        if (params.limit) query.push('limit=' + params.limit);
        var qs = query.length ? '?' + query.join('&') : '';
        var result = await apiFetch('GET', '/products' + qs);
        if (result && result.products) {
          var existing = DB.get('products');
          result.products.forEach(function(p) {
            var idx = existing.findIndex(function(x) { return x.id === p.id; });
            if (idx !== -1) existing[idx] = p; else existing.push(p);
          });
          DB.set('products', existing);
        }
        return result;
      } catch (e) {
        console.error('[API] getProducts failed, reading from localStorage:', e.message);
      }
    }
    return this._lsGetProducts(params);
  },

  _lsGetProducts(params) {
    var products = DB.get('products');
    var filtered = products.filter(function(p) { return p.status === 'available'; });
    if (params.type && ['sell', 'rent', 'both'].includes(params.type)) {
      filtered = filtered.filter(function(p) { return p.type === params.type; });
    }
    if (params.search) {
      var q = params.search.toLowerCase();
      filtered = filtered.filter(function(p) { return p.name.toLowerCase().includes(q) || (p.name_ar && p.name_ar.includes(q)); });
    }
    filtered.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
    var limit = parseInt(params.limit) || 20;
    var page = parseInt(params.page) || 1;
    var start = (page - 1) * limit;
    var paged = filtered.slice(start, start + limit);
    return { products: paged, pagination: { total: filtered.length, page: page, totalPages: Math.ceil(filtered.length / limit), hasMore: start + paged.length < filtered.length } };
  },

  async getProduct(id) {
    if (isServerMode()) {
      try {
        var result = await apiFetch('GET', '/products/' + id);
        if (result && result.product) {
          var products = DB.get('products');
          var idx = products.findIndex(function(p) { return p.id == id; });
          if (idx !== -1) products[idx] = result.product; else products.push(result.product);
          DB.set('products', products);
        }
        return result;
      } catch (e) {
        console.error('[API] getProduct failed, reading from localStorage:', e.message);
      }
    }
    return this._lsGetProduct(id);
  },

  _lsGetProduct(id) {
    var products = DB.get('products');
    for (var i = 0; i < products.length; i++) {
      if (products[i].id == id) {
        products[i].views = (products[i].views || 0) + 1;
        DB.set('products', products);
        return { product: products[i] };
      }
    }
    throw new Error('Produit introuvable');
  },

  async searchProducts(q, type) {
    if (!isServerMode()) {
      return this._lsSearchProducts(q, type);
    }
    try {
      var query = '?q=' + encodeURIComponent(q);
      if (type) query += '&type=' + encodeURIComponent(type);
      return await apiFetch('GET', '/products/search' + query);
    } catch (e) {
      return this._lsSearchProducts(q, type);
    }
  },

  _lsSearchProducts(q, type) {
    var products = DB.get('products');
    var filtered = products.filter(function(p) {
      if (p.status !== 'available') return false;
      var match = p.name.toLowerCase().includes(q.toLowerCase()) || (p.name_ar && p.name_ar.includes(q));
      if (type && ['sell', 'rent', 'both'].includes(type)) match = match && p.type === type;
      return match;
    });
    return { products: filtered };
  },

  async getFeatured() {
    if (!isServerMode()) {
      return this._lsGetFeatured();
    }
    try {
      return await apiFetch('GET', '/products/featured');
    } catch (e) {
      return this._lsGetFeatured();
    }
  },

  _lsGetFeatured() {
    var products = DB.get('products');
    var featured = products.filter(function(p) { return p.status === 'available' && p.featured; }).slice(0, 8);
    return { products: featured };
  },

  // ===== ORDERS =====
  async createOrder(data) {
    if (!isServerMode()) {
      return this._lsCreateOrder(data);
    }
    try {
      return await apiFetch('POST', '/orders', data);
    } catch (e) {
      return this._lsCreateOrder(data);
    }
  },

  _lsCreateOrder(data) {
    var products = DB.get('products');
    var items = data.items || [];
    var total = 0;
    for (var i = 0; i < items.length; i++) {
      for (var j = 0; j < products.length; j++) {
        if (products[j].id == items[i].product_id) {
          total += parseFloat(products[j].price) * (items[i].quantity || 1);
          products[j].quantity -= (items[i].quantity || 1);
          break;
        }
      }
    }
    DB.set('products', products);
    var orders = DB.get('orders');
    var order = {
      id: DB.nextId('orders'),
      user_id: this.getCurrentUser() ? this.getCurrentUser().id : null,
      client_name: data.client_name,
      client_phone: data.client_phone,
      wilaya: data.wilaya,
      address: data.address,
      total_amount: total,
      payment_method: data.payment_method || 'cash',
      payment_details: data.payment_details || '{}',
      payment_status: 'pending',
      status: 'nouveau',
      created_at: new Date().toISOString()
    };
    orders.unshift(order);
    DB.set('orders', orders);
    this._addNotification(order.user_id, 'Commande creee', 'Votre commande #' + order.id + ' a ete creee');
    return { message: 'Commande creee', order: order };
  },

  async getOrders() {
    if (!isServerMode()) {
      return this._lsGetOrders();
    }
    try {
      return await apiFetch('GET', '/orders');
    } catch (e) {
      return this._lsGetOrders();
    }
  },

  _lsGetOrders() {
    var user = this.getCurrentUser();
    if (!user) return { orders: [] };
    var orders = DB.get('orders');
    var userOrders = orders.filter(function(o) { return o.user_id === user.id; });
    return { orders: userOrders };
  },

  async getOrder(id) {
    if (!isServerMode()) {
      return this._lsGetOrder(id);
    }
    try {
      return await apiFetch('GET', '/orders/' + id);
    } catch (e) {
      return this._lsGetOrder(id);
    }
  },

  _lsGetOrder(id) {
    var orders = DB.get('orders');
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id == id) return { order: orders[i] };
    }
    throw new Error('Commande introuvable');
  },

  // ===== RENT =====
  async createRent(data) {
    if (!isServerMode()) {
      return this._lsCreateRent(data);
    }
    try {
      return await apiFetch('POST', '/rent', data);
    } catch (e) {
      return this._lsCreateRent(data);
    }
  },

  _lsCreateRent(data) {
    var products = DB.get('products');
    var product = null;
    for (var i = 0; i < products.length; i++) {
      if (products[i].id == data.product_id) { product = products[i]; break; }
    }
    if (!product) throw new Error('Produit introuvable');
    if (product.type !== 'rent' && product.type !== 'both') throw new Error('Pas disponible a la location');

    var start = new Date(data.start_date);
    var end = new Date(data.end_date);
    var days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
    var total = parseFloat(product.rent_price) * days;

    var rents = DB.get('rent_orders');
    var rentOrder = {
      id: DB.nextId('rent_orders'),
      user_id: this.getCurrentUser() ? this.getCurrentUser().id : null,
      product_id: data.product_id,
      client_name: data.client_name,
      client_phone: data.client_phone,
      wilaya: data.wilaya,
      address: data.address,
      start_date: data.start_date,
      end_date: data.end_date,
      rent_price: parseFloat(product.rent_price),
      total_amount: total,
      payment_method: data.payment_method || 'cash',
      payment_details: data.payment_details || '{}',
      delivery_type: data.delivery_type || 'delivery',
      payment_status: 'pending',
      status: 'nouveau',
      created_at: new Date().toISOString()
    };
    rents.unshift(rentOrder);
    DB.set('rent_orders', rents);
    this._addNotification(rentOrder.user_id, 'Location creee', 'Votre demande de location #' + rentOrder.id + ' a ete creee');
    return { message: 'Location creee', rent_order: rentOrder };
  },

  async getRentOrders() {
    if (!isServerMode()) {
      return this._lsGetRentOrders();
    }
    try {
      return await apiFetch('GET', '/rent');
    } catch (e) {
      return this._lsGetRentOrders();
    }
  },

  _lsGetRentOrders() {
    var user = this.getCurrentUser();
    if (!user) return { rent_orders: [] };
    var rents = DB.get('rent_orders');
    var userRents = rents.filter(function(r) { return r.user_id === user.id; });
    return { rent_orders: userRents };
  },

  async checkAvailability(productId, startDate, endDate) {
    if (!isServerMode()) {
      return this._lsCheckAvailability(productId, startDate, endDate);
    }
    try {
      var q = '?product_id=' + productId + '&start_date=' + encodeURIComponent(startDate) + '&end_date=' + encodeURIComponent(endDate);
      return await apiFetch('GET', '/rent/check-availability' + q);
    } catch (e) {
      return this._lsCheckAvailability(productId, startDate, endDate);
    }
  },

  _lsCheckAvailability(productId, startDate, endDate) {
    var rents = DB.get('rent_orders');
    var start = new Date(startDate);
    var end = new Date(endDate);
    for (var i = 0; i < rents.length; i++) {
      if (rents[i].product_id != productId) continue;
      if (rents[i].status === 'annule') continue;
      var rs = new Date(rents[i].start_date);
      var re = new Date(rents[i].end_date);
      if ((start >= rs && start <= re) || (end >= rs && end <= re) || (start <= rs && end >= re)) {
        return { available: false };
      }
    }
    return { available: true };
  },

  // ===== CONTACT =====
  async submitContact(data) {
    if (!isServerMode()) {
      return this._lsSubmitContact(data);
    }
    try {
      return await apiFetch('POST', '/contact', data);
    } catch (e) {
      return this._lsSubmitContact(data);
    }
  },

  _lsSubmitContact(data) {
    var msgs = DB.get('contacts');
    msgs.push({ id: msgs.length + 1, name: data.name, email: data.email || '', phone: data.phone || '', subject: data.subject || '', message: data.message, is_read: 0, created_at: new Date().toISOString() });
    DB.set('contacts', msgs);
    return { message: 'Message envoye' };
  },

  // ===== HOME =====
  async getHomeStats() {
    if (!isServerMode()) {
      return this._lsGetHomeStats();
    }
    try {
      return await apiFetch('GET', '/home/stats');
    } catch (e) {
      return this._lsGetHomeStats();
    }
  },

  _lsGetHomeStats() {
    var products = DB.get('products');
    var orders = DB.get('orders');
    var rents = DB.get('rent_orders');
    var users = DB.get('users');
    return { stats: { products: products.filter(function(p) { return p.status === 'available'; }).length, orders: orders.length, rents: rents.length, users: users.length } };
  },

  async getSettings() {
    if (!isServerMode()) {
      return this._lsGetSettings();
    }
    try {
      return await apiFetch('GET', '/home/settings');
    } catch (e) {
      return this._lsGetSettings();
    }
  },

  _lsGetSettings() {
    var settings = DB.get('settings');
    return { settings: settings };
  },

  async recordVisit(page) {
    if (!isServerMode()) {
      return this._lsRecordVisit(page);
    }
    try {
      return await apiFetch('POST', '/home/visit', { page: page || 'home' });
    } catch (e) {
      return this._lsRecordVisit(page);
    }
  },

  _lsRecordVisit(page) {
    var visits = DB.get('visits');
    visits.push({ page: page || 'home', visited_at: new Date().toISOString() });
    DB.set('visits', visits);
    return { success: true };
  },

  // ===== ADMIN =====
  async getDashboard() {
    if (!isServerMode()) {
      return this._lsGetDashboard();
    }
    try {
      return await apiFetch('GET', '/admin/dashboard');
    } catch (e) {
      return this._lsGetDashboard();
    }
  },

  _lsGetDashboard() {
    var products = DB.get('products');
    var orders = DB.get('orders');
    var rents = DB.get('rent_orders');
    var users = DB.get('users');
    var newOrders = orders.filter(function(o) { return o.status === 'nouveau'; });
    var totalRevenue = 0;
    for (var i = 0; i < orders.length; i++) { if (orders[i].status !== 'annule') totalRevenue += parseFloat(orders[i].total_amount || 0); }
    for (var j = 0; j < rents.length; j++) { if (rents[j].status !== 'annule') totalRevenue += parseFloat(rents[j].total_amount || 0); }
    return { stats: { products: products.length, orders: orders.length, rents: rents.length, users: users.filter(function(u) { return u.is_verified; }).length, new_orders: newOrders.length, visits: 0, revenue: totalRevenue }, recent_orders: orders.slice(0, 10) };
  },

  async adminGetProducts(params) {
    if (!isServerMode()) {
      return this._lsAdminGetProducts(params);
    }
    try {
      var query = [];
      if (params.page) query.push('page=' + params.page);
      if (params.limit) query.push('limit=' + params.limit);
      if (params.status) query.push('status=' + encodeURIComponent(params.status));
      if (params.type) query.push('type=' + encodeURIComponent(params.type));
      var qs = query.length ? '?' + query.join('&') : '';
      return await apiFetch('GET', '/admin/products' + qs);
    } catch (e) {
      return this._lsAdminGetProducts(params);
    }
  },

  _lsAdminGetProducts(params) {
    var products = DB.get('products');
    var page = parseInt(params.page) || 1;
    var limit = parseInt(params.limit) || 15;
    var start = (page - 1) * limit;
    var paged = products.slice(start, start + limit);
    return { products: paged, pagination: { total: products.length, page: page, totalPages: Math.ceil(products.length / limit) } };
  },

  async adminCreateProduct(formData) {
    var lsResult = await this._lsAdminCreateProduct(formData);
    if (isServerMode()) {
      try {
        await apiFetch('POST', '/admin/products', formData);
      } catch (e) {
        console.error('[API] adminCreateProduct failed, localStorage fallback used:', e.message);
      }
    }
    return lsResult;
  },

  async _lsAdminCreateProduct(formData) {
    var products = DB.get('products');
    var images = [];
    var imageFiles = formData.getAll('images');
    if (imageFiles && imageFiles.length > 0) {
      for (var i = 0; i < imageFiles.length; i++) {
        var dataUrl = await readFileAsDataURL(imageFiles[i]);
        images.push({ image_url: dataUrl, is_primary: i === 0 ? 1 : 0 });
      }
    } else {
      images.push({ image_url: './assets/placeholder.svg', is_primary: 1 });
    }
    var product = {
      id: DB.nextId('products'),
      name: formData.get('name'),
      name_ar: formData.get('name_ar') || '',
      description: formData.get('description') || '',
      price: parseFloat(formData.get('price')) || 0,
      rent_price: parseFloat(formData.get('rent_price')) || null,
      rent_price_per: formData.get('rent_price_per') || 'day',
      quantity: parseInt(formData.get('quantity')) || 1,
      type: formData.get('type') || 'sell',
      status: formData.get('status') || 'available',
      featured: 0,
      views: 0,
      wilayas: formData.get('wilayas') || null,
      created_at: new Date().toISOString(),
      images: images
    };
    products.unshift(product);
    DB.set('products', products);
    return { message: 'Produit cree', product: product };
  },

  async adminUpdateProduct(id, formData) {
    var lsResult = await this._lsAdminUpdateProduct(id, formData);
    if (isServerMode()) {
      try {
        await apiFetch('PUT', '/admin/products/' + id, formData);
      } catch (e) {
        console.error('[API] adminUpdateProduct failed, localStorage fallback used:', e.message);
      }
    }
    return lsResult;
  },

  async _lsAdminUpdateProduct(id, formData) {
    var products = DB.get('products');
    for (var i = 0; i < products.length; i++) {
      if (products[i].id == id) {
        if (formData.get('name')) products[i].name = formData.get('name');
        if (formData.get('name_ar')) products[i].name_ar = formData.get('name_ar');
        if (formData.get('description')) products[i].description = formData.get('description');
        if (formData.get('price')) products[i].price = parseFloat(formData.get('price'));
        if (formData.get('rent_price')) products[i].rent_price = parseFloat(formData.get('rent_price'));
        if (formData.get('rent_price_per')) products[i].rent_price_per = formData.get('rent_price_per');
        if (formData.get('quantity')) products[i].quantity = parseInt(formData.get('quantity'));
        if (formData.get('type')) products[i].type = formData.get('type');
        if (formData.get('status')) products[i].status = formData.get('status');
        if (formData.get('wilayas') !== null) products[i].wilayas = formData.get('wilayas');

        var imageFiles = formData.getAll('images');
        if (imageFiles && imageFiles.length > 0) {
          var newImages = [];
          for (var j = 0; j < imageFiles.length; j++) {
            var dataUrl = await readFileAsDataURL(imageFiles[j]);
            newImages.push({ image_url: dataUrl, is_primary: j === 0 ? 1 : 0 });
          }
          products[i].images = newImages;
        }

        DB.set('products', products);
        return { message: 'Produit mis a jour', product: products[i] };
      }
    }
    throw new Error('Produit introuvable');
  },

  async adminDeleteProduct(id) {
    var lsResult = this._lsAdminDeleteProduct(id);
    if (isServerMode()) {
      try {
        await apiFetch('DELETE', '/admin/products/' + id);
      } catch (e) {
        console.error('[API] adminDeleteProduct failed, localStorage fallback used:', e.message);
      }
    }
    return lsResult;
  },

  _lsAdminDeleteProduct(id) {
    var products = DB.get('products');
    var filtered = products.filter(function(p) { return p.id != id; });
    DB.set('products', filtered);
    return { message: 'Produit supprime' };
  },

  async adminGetOrders(params) {
    if (!isServerMode()) {
      return this._lsAdminGetOrders(params);
    }
    try {
      var query = [];
      if (params.page) query.push('page=' + params.page);
      if (params.limit) query.push('limit=' + params.limit);
      if (params.status) query.push('status=' + encodeURIComponent(params.status));
      var qs = query.length ? '?' + query.join('&') : '';
      return await apiFetch('GET', '/admin/orders' + qs);
    } catch (e) {
      return this._lsAdminGetOrders(params);
    }
  },

  _lsAdminGetOrders(params) {
    var orders = DB.get('orders');
    if (params.status) orders = orders.filter(function(o) { return o.status === params.status; });
    var page = parseInt(params.page) || 1;
    var limit = parseInt(params.limit) || 15;
    var start = (page - 1) * limit;
    var paged = orders.slice(start, start + limit);
    return { orders: paged, pagination: { total: orders.length, page: page, totalPages: Math.ceil(orders.length / limit) } };
  },

  async adminUpdateOrderStatus(id, status, opts) {
    opts = opts || {};
    if (!isServerMode()) {
      return this._lsAdminUpdateOrderStatus(id, status, opts);
    }
    try {
      var body = { status: status };
      if (opts.notes) body.notes = opts.notes;
      if (opts.payment_status) body.payment_status = opts.payment_status;
      return await apiFetch('PUT', '/admin/orders/' + id + '/status', body);
    } catch (e) {
      return this._lsAdminUpdateOrderStatus(id, status, opts);
    }
  },

  _lsAdminUpdateOrderStatus(id, status, opts) {
    opts = opts || {};
    var orders = DB.get('orders');
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id == id) {
        orders[i].status = status;
        if (opts.notes !== undefined) orders[i].notes = opts.notes;
        if (opts.payment_status) orders[i].payment_status = opts.payment_status;
        DB.set('orders', orders);
        if (orders[i].user_id) this._addNotification(orders[i].user_id, 'Commande mise a jour', 'Votre commande #' + id + ' est maintenant: ' + status);
        return { message: 'Statut mis a jour', order: orders[i] };
      }
    }
    throw new Error('Commande introuvable');
  },

  async adminGetRentOrders(params) {
    if (!isServerMode()) {
      return this._lsAdminGetRentOrders(params);
    }
    try {
      var query = [];
      if (params.page) query.push('page=' + params.page);
      if (params.limit) query.push('limit=' + params.limit);
      if (params.status) query.push('status=' + encodeURIComponent(params.status));
      var qs = query.length ? '?' + query.join('&') : '';
      return await apiFetch('GET', '/admin/rent-orders' + qs);
    } catch (e) {
      return this._lsAdminGetRentOrders(params);
    }
  },

  _lsAdminGetRentOrders(params) {
    var rents = DB.get('rent_orders');
    if (params.status) rents = rents.filter(function(r) { return r.status === params.status; });
    return { rent_orders: rents };
  },

  async adminUpdateRentOrderStatus(id, status, opts) {
    opts = opts || {};
    if (!isServerMode()) {
      return this._lsAdminUpdateRentOrderStatus(id, status, opts);
    }
    try {
      var body = { status: status };
      if (opts.notes) body.notes = opts.notes;
      if (opts.payment_status) body.payment_status = opts.payment_status;
      return await apiFetch('PUT', '/admin/rent-orders/' + id + '/status', body);
    } catch (e) {
      return this._lsAdminUpdateRentOrderStatus(id, status, opts);
    }
  },

  _lsAdminUpdateRentOrderStatus(id, status, opts) {
    opts = opts || {};
    var rents = DB.get('rent_orders');
    for (var i = 0; i < rents.length; i++) {
      if (rents[i].id == id) {
        rents[i].status = status;
        if (opts.notes !== undefined) rents[i].notes = opts.notes;
        if (opts.payment_status) rents[i].payment_status = opts.payment_status;
        DB.set('rent_orders', rents);
        return { message: 'Statut mis a jour', rent_order: rents[i] };
      }
    }
    throw new Error('Location introuvable');
  },

  async adminGetClients() {
    if (!isServerMode()) {
      return this._lsAdminGetClients();
    }
    try {
      return await apiFetch('GET', '/admin/clients');
    } catch (e) {
      return this._lsAdminGetClients();
    }
  },

  _lsAdminGetClients() {
    var users = DB.get('users');
    var orders = DB.get('orders');
    var rents = DB.get('rent_orders');
    return { clients: users.map(function(u) {
      return { id: u.id, phone: u.phone, name: u.name || '', wilaya: u.wilaya || '', is_verified: u.is_verified, created_at: u.created_at || new Date().toISOString(), orders_count: orders.filter(function(o) { return o.user_id === u.id; }).length, rent_count: rents.filter(function(r) { return r.user_id === u.id; }).length };
    }) };
  },

  async adminGetClientOrders(userId) {
    if (!isServerMode()) {
      return this._lsAdminGetClientOrders(userId);
    }
    try {
      return await apiFetch('GET', '/admin/clients/' + userId + '/orders');
    } catch (e) {
      return this._lsAdminGetClientOrders(userId);
    }
  },

  _lsAdminGetClientOrders(userId) {
    var orders = DB.get('orders').filter(function(o) { return o.user_id == userId; });
    var rents = DB.get('rent_orders').filter(function(r) { return r.user_id == userId; });
    return { orders: orders, rent_orders: rents };
  },

  async adminGetStats() {
    if (!isServerMode()) {
      return this._lsAdminGetStats();
    }
    try {
      return await apiFetch('GET', '/admin/stats');
    } catch (e) {
      return this._lsAdminGetStats();
    }
  },

  _lsAdminGetStats() {
    var orders = DB.get('orders');
    var rents = DB.get('rent_orders');
    var visits = DB.get('visits');
    var totalRevenue = 0;
    for (var i = 0; i < orders.length; i++) { if (orders[i].status !== 'annule') totalRevenue += parseFloat(orders[i].total_amount || 0); }
    for (var j = 0; j < rents.length; j++) { if (rents[j].status !== 'annule') totalRevenue += parseFloat(rents[j].total_amount || 0); }
    var now = new Date();
    var thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    var recentOrders = orders.filter(function(o) { return new Date(o.created_at) >= thirtyAgo; });
    var recentRents = rents.filter(function(r) { return new Date(r.created_at) >= thirtyAgo; });
    var recentVisits = visits.filter(function(v) { return new Date(v.visited_at) >= thirtyAgo; });
    var recentRevenue = 0;
    for (var k = 0; k < recentOrders.length; k++) { if (recentOrders[k].status !== 'annule') recentRevenue += parseFloat(recentOrders[k].total_amount || 0); }
    return { stats: { total_orders: orders.length, total_rents: rents.length, total_revenue: totalRevenue, recent_orders: recentOrders.length, recent_rents: recentRents.length, recent_revenue: recentRevenue, daily_visits_30: recentVisits.length }, top_products: [] };
  },

  async adminUpdateOrderClient(id, data) {
    if (!isServerMode()) {
      return this._lsAdminUpdateOrderClient(id, data);
    }
    try {
      return await apiFetch('PUT', '/admin/orders/' + id + '/client', data);
    } catch (e) {
      return this._lsAdminUpdateOrderClient(id, data);
    }
  },

  _lsAdminUpdateOrderClient(id, data) {
    var orders = DB.get('orders');
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id == id) {
        if (data.client_name !== undefined) orders[i].client_name = data.client_name;
        if (data.client_phone !== undefined) orders[i].client_phone = data.client_phone;
        if (data.wilaya !== undefined) orders[i].wilaya = data.wilaya;
        if (data.address !== undefined) orders[i].address = data.address;
        DB.set('orders', orders);
        return { message: 'Client mis a jour', order: orders[i] };
      }
    }
    throw new Error('Commande introuvable');
  },

  async adminUpdateRentOrderClient(id, data) {
    if (!isServerMode()) {
      return this._lsAdminUpdateRentOrderClient(id, data);
    }
    try {
      return await apiFetch('PUT', '/admin/rent-orders/' + id + '/client', data);
    } catch (e) {
      return this._lsAdminUpdateRentOrderClient(id, data);
    }
  },

  _lsAdminUpdateRentOrderClient(id, data) {
    var rents = DB.get('rent_orders');
    for (var i = 0; i < rents.length; i++) {
      if (rents[i].id == id) {
        if (data.client_name !== undefined) rents[i].client_name = data.client_name;
        if (data.client_phone !== undefined) rents[i].client_phone = data.client_phone;
        if (data.wilaya !== undefined) rents[i].wilaya = data.wilaya;
        if (data.address !== undefined) rents[i].address = data.address;
        DB.set('rent_orders', rents);
        return { message: 'Client mis a jour', rent_order: rents[i] };
      }
    }
    throw new Error('Location introuvable');
  },

  async adminGetNewOrdersCount() {
    if (!isServerMode()) {
      return this._lsAdminGetNewOrdersCount();
    }
    try {
      return await apiFetch('GET', '/admin/orders/new-count');
    } catch (e) {
      return this._lsAdminGetNewOrdersCount();
    }
  },

  _lsAdminGetNewOrdersCount() {
    var orders = DB.get('orders');
    var count = orders.filter(function(o) { return o.status === 'nouveau'; }).length;
    return { count: count };
  },

  // ===== FAVORITES =====
  getFavorites() {
    try { return JSON.parse(localStorage.getItem('bati_favorites') || '[]'); } catch(e) { return []; }
  },

  isFavorite(productId) {
    return this.getFavorites().indexOf(Number(productId)) !== -1;
  },

  toggleFavorite(productId) {
    var favs = this.getFavorites();
    var idx = favs.indexOf(Number(productId));
    if (idx === -1) { favs.push(Number(productId)); } else { favs.splice(idx, 1); }
    localStorage.setItem('bati_favorites', JSON.stringify(favs));
    return { is_favorite: idx === -1 };
  },

  // ===== RATINGS =====
  getRatings(productId) {
    try { return JSON.parse(localStorage.getItem('bati_ratings_' + productId) || '[]'); } catch(e) { return []; }
  },

  getProductRating(productId) {
    var ratings = this.getRatings(productId);
    if (ratings.length === 0) return { avg: 0, count: 0 };
    var sum = 0;
    for (var i = 0; i < ratings.length; i++) sum += ratings[i].score;
    return { avg: Math.round(sum / ratings.length * 10) / 10, count: ratings.length };
  },

  getUserRating(productId, userId) {
    var ratings = this.getRatings(productId);
    for (var i = 0; i < ratings.length; i++) {
      if (ratings[i].user_id === userId) return ratings[i];
    }
    return null;
  },

  submitRating(productId, userId, userName, score) {
    var ratings = this.getRatings(productId);
    for (var i = 0; i < ratings.length; i++) {
      if (ratings[i].user_id === userId) {
        ratings[i].score = score;
        ratings[i].updated_at = new Date().toISOString();
        localStorage.setItem('bati_ratings_' + productId, JSON.stringify(ratings));
        return { message: 'Note mise a jour' };
      }
    }
    ratings.push({ id: ratings.length + 1, user_id: userId, user_name: userName, product_id: Number(productId), score: score, created_at: new Date().toISOString() });
    localStorage.setItem('bati_ratings_' + productId, JSON.stringify(ratings));
    return { message: 'Note ajoutee' };
  },

  removeRating(productId, userId) {
    var ratings = this.getRatings(productId);
    var filtered = ratings.filter(function(r) { return r.user_id !== userId; });
    localStorage.setItem('bati_ratings_' + productId, JSON.stringify(filtered));
    return { message: 'Note supprimee' };
  },

  _addNotification(userId, title, message) {
    if (!userId) return;
    var notifs = DB.get('notifications');
    notifs.unshift({ id: DB.nextId('notifications'), user_id: userId, title: title, message: message, type: 'order', is_read: 0, created_at: new Date().toISOString() });
    DB.set('notifications', notifs);
  }
};

function readFileAsDataURL(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) { resolve(e.target.result); };
    reader.onerror = function(e) { reject(e.target.error); };
    reader.readAsDataURL(file);
  });
}

DB.init();
