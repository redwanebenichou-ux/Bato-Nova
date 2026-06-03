Admin.renderClients = async function() {
  var c = document.getElementById('adminContent');
  c.innerHTML =
    '<h2 class="page-title">' + Admin.iconSpan('clients', 'lg') + ' ' + Admin.t('Clients', 'العملاء') + '</h2>' +
    '<div class="search-bar"><input type="text" class="search-input" id="clientSearch" placeholder="' + Admin.t('Rechercher par nom, telephone, wilaya...', 'البحث بالاسم، الهاتف، الولاية...') + '" oninput="Admin.filterTable(\'clientSearch\', \'clientsTableBody\')">' +
    Admin.iconSpan('search', 'lg') + '</div>' +
    '<div id="clientsList"><p class="text-muted">' + Admin.t('Chargement...', 'جار التحميل...') + '</p></div>';
  try {
    var data = await api.adminGetClients();
    var list = document.getElementById('clientsList');
    if (data.clients.length === 0) {
      list.innerHTML = '<p class="text-muted">' + Admin.t('Aucun client', 'لا يوجد عملاء') + '</p>';
      return;
    }
    var rows = '';
    for (var i = 0; i < data.clients.length; i++) {
      var u = data.clients[i];
      rows += '<tr>' +
        '<td><strong>' + (u.name || Admin.t('Anonyme', 'مجهول')) + '</strong></td>' +
        '<td dir="ltr">+213 ' + (u.phone ? u.phone.slice(1) : '') + '</td>' +
        '<td>' + (u.wilaya || '-') + '</td>' +
        '<td>' + (u.orders_count || 0) + '</td>' +
        '<td>' + (u.rent_count || 0) + '</td>' +
        '<td class="text-muted">' + new Date(u.created_at).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</td>' +
        '<td><button class="btn btn-sm btn-secondary" onclick="Admin.viewClientOrders(' + u.id + ')">' + Admin.iconSpan('eye', 'sm') + '</button></td></tr>';
    }
    list.innerHTML = '<div class="table-container"><table><thead><tr><th>' + Admin.t('Nom', 'الاسم') + '</th><th>' + Admin.t('Telephone', 'الهاتف') + '</th><th>Wilaya</th><th>' + Admin.t('Commandes', 'الطلبات') + '</th><th>' + Admin.t('Locations', 'الإيجارات') + '</th><th>' + Admin.t('Inscrit', 'التسجيل') + '</th><th>' + Admin.t('Actions', 'الإجراءات') + '</th></tr></thead><tbody id="clientsTableBody">' + rows + '</tbody></table></div>';
  } catch (e) {
    document.getElementById('clientsList').innerHTML = '<p style="color:var(--error)">' + e.message + '</p>';
  }
};

Admin.viewClientOrders = async function(userId) {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = '<div class="modal"><h3 class="modal-title">' + Admin.iconSpan('orders') + ' ' + Admin.t('Commandes du client', 'طلبات العميل') + '</h3><div id="clientOrdersContent"><p class="text-muted">Chargement...</p></div><div class="modal-actions"><button class="btn" onclick="Admin.closeModal(this)">' + Admin.t('Fermer', 'إغلاق') + '</button></div></div>';
  document.body.appendChild(overlay);
  try {
    var data = await api.adminGetClientOrders(userId);
    var content = document.getElementById('clientOrdersContent');
    var html = '';
    if (data.orders.length > 0) {
      html += '<h4 style="margin:12px 0 8px">' + Admin.t('Commandes', 'الطلبات') + '</h4>';
      for (var i = 0; i < data.orders.length; i++) {
        var o = data.orders[i];
        html += '<div style="background:var(--gray-50);padding:12px;border-radius:8px;margin-bottom:8px">' +
          '<div class="flex-between"><strong>#' + o.id + '</strong><span class="status-badge status-' + o.status + '">' + Admin.getStatusLabel(o.status) + '</span></div>' +
          '<div class="text-muted">' + Admin.formatPrice(o.total_amount) + ' | ' + new Date(o.created_at).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</div></div>';
      }
    }
    if (data.rent_orders && data.rent_orders.length > 0) {
      html += '<h4 style="margin:12px 0 8px">' + Admin.t('Locations', 'الإيجارات') + '</h4>';
      for (var j = 0; j < data.rent_orders.length; j++) {
        var r = data.rent_orders[j];
        html += '<div style="background:var(--gray-50);padding:12px;border-radius:8px;margin-bottom:8px">' +
          '<div class="flex-between"><strong>#' + r.id + '</strong><span class="status-badge status-' + r.status + '">' + Admin.getStatusLabel(r.status) + '</span></div>' +
          '<div class="text-muted">' + Admin.formatPrice(r.total_amount) + ' | ' + new Date(r.start_date).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + ' → ' + new Date(r.end_date).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</div></div>';
      }
    }
    if (!html) html = '<p class="text-muted">' + Admin.t('Aucune commande', 'لا توجد طلبات') + '</p>';
    content.innerHTML = html;
  } catch (e) {
    document.getElementById('clientOrdersContent').innerHTML = '<p style="color:var(--error)">' + e.message + '</p>';
  }
};
