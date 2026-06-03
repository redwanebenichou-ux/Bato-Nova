Admin.renderOrders = async function() {
  var c = document.getElementById('adminContent');
  var statuses = ['', 'nouveau', 'confirme', 'en_cours', 'livre', 'termine', 'annule'];
  var buttons = '';
  for (var i = 0; i < statuses.length; i++) {
    var s = statuses[i];
    var label = s ? Admin.getStatusLabel(s) : Admin.t('Toutes', 'الكل');
    var cls = !s ? 'btn-primary' : 'btn-outline';
    buttons += '<button class="btn btn-sm ' + cls + '" onclick="Admin.filterOrders(\'' + s + '\')">' + label + '</button>';
  }
  c.innerHTML =
    '<h2 class="page-title">' + Admin.iconSpan('orders', 'lg') + ' ' + Admin.t('Commandes', 'الطلبات') + '</h2>' +
    '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">' + buttons + '</div>' +
    '<div class="search-bar">' +
    '<input type="text" class="search-input" id="orderSearch" placeholder="' + Admin.t('Rechercher par client, telephone, wilaya...', 'البحث بالعميل، الهاتف، الولاية...') + '" oninput="Admin.filterTable(\'orderSearch\', \'ordersTableBody\')">' +
    Admin.iconSpan('search', 'lg') +
    '<button class="btn btn-sm btn-secondary" onclick="Admin.exportOrdersCSV()">' + Admin.iconSpan('download', 'sm') + ' CSV</button></div>' +
    '<div id="ordersList"><p class="text-muted">' + Admin.t('Chargement...', 'جار التحميل...') + '</p></div>' +
    '<div id="ordersPagination" class="pagination"></div>';
  Admin._orderFilter = '';
  await Admin.loadOrders();
};

Admin.filterOrders = async function(status) {
  Admin._orderFilter = status;
  var btns = document.querySelectorAll('#adminContent .btn-sm');
  btns.forEach(function(b) {
    var label = status ? Admin.getStatusLabel(status) : Admin.t('Toutes', 'الكل');
    b.className = 'btn btn-sm ' + (b.textContent.trim() === label ? 'btn-primary' : 'btn-outline');
  });
  await Admin.loadOrders(1);
};

Admin.loadOrders = async function(page) {
  if (!page) page = 1;
  Admin._orderPage = page;
  try {
    var params = { page: page, limit: 15 };
    if (Admin._orderFilter) params.status = Admin._orderFilter;
    var data = await api.adminGetOrders(params);
    var list = document.getElementById('ordersList');
    if (data.orders.length === 0) {
      list.innerHTML = '<p class="text-muted">' + Admin.t('Aucune commande', 'لا توجد طلبات') + '</p>';
      return;
    }
    var rows = '';
    for (var i = 0; i < data.orders.length; i++) {
      var o = data.orders[i];
      var ps = o.payment_status || 'pending';
      rows += '<tr>' +
        '<td><strong>#' + o.id + '</strong></td>' +
        '<td>' + (o.client_name || '-') + '</td>' +
        '<td dir="ltr">' + (o.client_phone || '-') + '</td>' +
        '<td>' + (o.wilaya || '-') + '</td>' +
        '<td><strong>' + Admin.formatPrice(o.total_amount) + '</strong></td>' +
        '<td><span class="status-badge status-' + o.status + '">' + Admin.getStatusLabel(o.status) + '</span></td>' +
        '<td><span class="payment-badge payment-' + ps + '">' + Admin.getPaymentLabel(ps) + '</span></td>' +
        '<td class="text-muted">' + new Date(o.created_at).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</td>' +
        '<td><div class="flex gap-8">' +
        '<button class="btn btn-sm btn-secondary" onclick="Admin.showOrderDetail(' + o.id + ')">' + Admin.iconSpan('eye', 'sm') + '</button>' +
        '<select class="form-select" style="padding:4px 8px;font-size:12px;width:auto" onchange="Admin.showStatusConfirm(' + o.id + ',\'' + o.status + '\',this.value,false)">' +
        '<option value="">' + Admin.t('Statut...', 'حالة...') + '</option>' +
        '<option value="nouveau">' + Admin.getStatusLabel('nouveau') + '</option>' +
        '<option value="confirme">' + Admin.getStatusLabel('confirme') + '</option>' +
        '<option value="en_cours">' + Admin.getStatusLabel('en_cours') + '</option>' +
        '<option value="livre">' + Admin.getStatusLabel('livre') + '</option>' +
        '<option value="termine">' + Admin.getStatusLabel('termine') + '</option>' +
        '<option value="annule">' + Admin.getStatusLabel('annule') + '</option></select></div></td></tr>';
    }
    list.innerHTML = '<div class="table-container"><table><thead><tr><th>#</th><th>' + Admin.t('Client', 'العميل') + '</th><th>' + Admin.t('Telephone', 'الهاتف') + '</th><th>Wilaya</th><th>' + Admin.t('Total', 'المجموع') + '</th><th>' + Admin.t('Statut', 'الحالة') + '</th><th>' + Admin.t('Paiement', 'الدفع') + '</th><th>' + Admin.t('Date', 'التاريخ') + '</th><th>' + Admin.t('Actions', 'الإجراءات') + '</th></tr></thead><tbody id="ordersTableBody">' + rows + '</tbody></table></div>';
    var pagEl = document.getElementById('ordersPagination');
    if (data.pagination && data.pagination.totalPages > 1) {
      var btns = '';
      for (var j = 1; j <= data.pagination.totalPages; j++) {
        btns += '<button class="page-btn' + (j === data.pagination.page ? ' active' : '') + '" onclick="Admin.loadOrders(' + j + ')">' + j + '</button>';
      }
      pagEl.innerHTML = btns;
    } else {
      pagEl.innerHTML = '';
    }
  } catch (e) {
    document.getElementById('ordersList').innerHTML = '<p style="color:var(--error)">' + e.message + '</p>';
  }
};

Admin.showOrderDetail = async function(id) {
  try {
    var data = await api.adminGetOrders({ page: 1, limit: 1000 });
    var order = null;
    for (var i = 0; i < data.orders.length; i++) {
      if (data.orders[i].id == id) { order = data.orders[i]; break; }
    }
    if (!order) { Admin.showToast('Commande introuvable', 'error'); return; }
    Admin._renderOrderDetail(order);
  } catch (e) {
    Admin.showToast(e.message, 'error');
  }
};

Admin.updateOrderStatus = async function(id, status) {
  if (!status) return;
  try {
    await api.adminUpdateOrderStatus(id, status);
    Admin.showToast(Admin.t('Statut mis a jour', 'تم تحديث الحالة'), 'success');
    await Admin.loadOrders();
  } catch (e) {
    Admin.showToast(e.message, 'error');
  }
};

Admin.renderRent = async function() {
  var c = document.getElementById('adminContent');
  var statuses = ['', 'nouveau', 'confirme', 'en_cours', 'termine', 'annule'];
  var buttons = '';
  for (var i = 0; i < statuses.length; i++) {
    var s = statuses[i];
    var label = s ? Admin.getStatusLabel(s) : Admin.t('Toutes', 'الكل');
    var cls = !s ? 'btn-primary' : 'btn-outline';
    buttons += '<button class="btn btn-sm ' + cls + '" onclick="Admin.filterRentOrders(\'' + s + '\')">' + label + '</button>';
  }
  c.innerHTML =
    '<h2 class="page-title">' + Admin.iconSpan('rent', 'lg') + ' ' + Admin.t('Locations', 'الإيجارات') + '</h2>' +
    '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">' + buttons + '</div>' +
    '<div class="search-bar">' +
    '<input type="text" class="search-input" id="rentSearch" placeholder="' + Admin.t('Rechercher par client, telephone, produit...', 'البحث بالعميل، الهاتف، المنتج...') + '" oninput="Admin.filterTable(\'rentSearch\', \'rentTableBody\')">' +
    Admin.iconSpan('search', 'lg') +
    '<button class="btn btn-sm btn-secondary" onclick="Admin.exportRentCSV()">' + Admin.iconSpan('download', 'sm') + ' CSV</button></div>' +
    '<div id="rentList"><p class="text-muted">' + Admin.t('Chargement...', 'جار التحميل...') + '</p></div>' +
    '<div id="rentPagination" class="pagination"></div>';
  Admin._rentFilter = '';
  await Admin.loadRentOrders();
};

Admin.filterRentOrders = async function(status) {
  Admin._rentFilter = status;
  var btns = document.querySelectorAll('#adminContent .btn-sm');
  btns.forEach(function(b) {
    var label = status ? Admin.getStatusLabel(status) : Admin.t('Toutes', 'الكل');
    b.className = 'btn btn-sm ' + (b.textContent.trim() === label ? 'btn-primary' : 'btn-outline');
  });
  await Admin.loadRentOrders(1);
};

Admin.loadRentOrders = async function(page) {
  if (!page) page = 1;
  Admin._rentPage = page;
  try {
    var params = { page: page, limit: 15 };
    if (Admin._rentFilter) params.status = Admin._rentFilter;
    var data = await api.adminGetRentOrders(params);
    var list = document.getElementById('rentList');
    if (data.rent_orders.length === 0) {
      list.innerHTML = '<p class="text-muted">' + Admin.t('Aucune location', 'لا توجد إيجارات') + '</p>';
      return;
    }
    var rows = '';
    for (var i = 0; i < data.rent_orders.length; i++) {
      var r = data.rent_orders[i];
      var productName = r.Product ? r.Product.name : 'Produit';
      var ps = r.payment_status || 'pending';
      rows += '<tr>' +
        '<td><strong>#' + r.id + '</strong></td>' +
        '<td>' + (r.client_name || '-') + '</td>' +
        '<td dir="ltr">' + (r.client_phone || '-') + '</td>' +
        '<td>' + productName + '</td>' +
        '<td>' + new Date(r.start_date).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + ' → ' + new Date(r.end_date).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</td>' +
        '<td><strong>' + Admin.formatPrice(r.total_amount) + '</strong></td>' +
        '<td><span class="status-badge status-' + r.status + '">' + Admin.getStatusLabel(r.status) + '</span></td>' +
        '<td><span class="payment-badge payment-' + ps + '">' + Admin.getPaymentLabel(ps) + '</span></td>' +
        '<td><div class="flex gap-8">' +
        '<button class="btn btn-sm btn-secondary" onclick="Admin.showRentDetail(' + r.id + ')">' + Admin.iconSpan('eye', 'sm') + '</button>' +
        '<select class="form-select" style="padding:4px 8px;font-size:12px;width:auto" onchange="Admin.showStatusConfirm(' + r.id + ',\'' + r.status + '\',this.value,true)">' +
        '<option value="">' + Admin.t('Statut...', 'حالة...') + '</option>' +
        '<option value="nouveau">' + Admin.getStatusLabel('nouveau') + '</option>' +
        '<option value="confirme">' + Admin.getStatusLabel('confirme') + '</option>' +
        '<option value="en_cours">' + Admin.getStatusLabel('en_cours') + '</option>' +
        '<option value="termine">' + Admin.getStatusLabel('termine') + '</option>' +
        '<option value="annule">' + Admin.getStatusLabel('annule') + '</option></select></div></td></tr>';
    }
    list.innerHTML = '<div class="table-container"><table><thead><tr><th>#</th><th>' + Admin.t('Client', 'العميل') + '</th><th>' + Admin.t('Telephone', 'الهاتف') + '</th><th>' + Admin.t('Produit', 'المنتج') + '</th><th>' + Admin.t('Periode', 'الفترة') + '</th><th>' + Admin.t('Total', 'المجموع') + '</th><th>' + Admin.t('Statut', 'الحالة') + '</th><th>' + Admin.t('Paiement', 'الدفع') + '</th><th>' + Admin.t('Actions', 'الإجراءات') + '</th></tr></thead><tbody id="rentTableBody">' + rows + '</tbody></table></div>';
    var pagEl = document.getElementById('rentPagination');
    if (data.pagination && data.pagination.totalPages > 1) {
      var btns = '';
      for (var j = 1; j <= data.pagination.totalPages; j++) {
        btns += '<button class="page-btn' + (j === data.pagination.page ? ' active' : '') + '" onclick="Admin.loadRentOrders(' + j + ')">' + j + '</button>';
      }
      pagEl.innerHTML = btns;
    } else {
      pagEl.innerHTML = '';
    }
  } catch (e) {
    document.getElementById('rentList').innerHTML = '<p style="color:var(--error)">' + e.message + '</p>';
  }
};

Admin.showRentDetail = async function(id) {
  try {
    var data = await api.adminGetRentOrders({ page: 1, limit: 1000 });
    var rent = null;
    for (var i = 0; i < data.rent_orders.length; i++) {
      if (data.rent_orders[i].id == id) { rent = data.rent_orders[i]; break; }
    }
    if (!rent) { Admin.showToast('Location introuvable', 'error'); return; }
    Admin._renderRentDetail(rent);
  } catch (e) {
    Admin.showToast(e.message, 'error');
  }
};

Admin.updateRentStatus = async function(id, status) {
  if (!status) return;
  try {
    await api.adminUpdateRentOrderStatus(id, status);
    Admin.showToast(Admin.t('Statut mis a jour', 'تم تحديث الحالة'), 'success');
    await Admin.loadRentOrders();
  } catch (e) {
    Admin.showToast(e.message, 'error');
  }
};
