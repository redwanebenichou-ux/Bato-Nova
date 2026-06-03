Admin.renderProducts = function() {
  var c = document.getElementById('adminContent');
  c.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:24px"><h2 class="page-title" style="margin:0">' + Admin.iconSpan('products', 'lg') + ' ' + Admin.t('Produits', 'المنتجات') + '</h2><button class="btn btn-primary" onclick="Admin.showProductForm()">' + Admin.iconSpan('plus') + ' ' + Admin.t('Ajouter', 'إضافة') + '</button></div><div id="productsContent"><p class="text-muted">' + Admin.t('Chargement...', 'جار التحميل...') + '</p></div>';
  Admin.loadProducts();
};

Admin.loadProducts = async function() {
  var el = document.getElementById('productsContent');
  if (!el) return;
  try {
    var data = await api.adminGetProducts({ page: 1, limit: 100 });
    var products = data.products || [];
    if (products.length === 0) {
      el.innerHTML = '<p class="text-muted">' + Admin.t('Aucun produit', 'لا توجد منتجات') + '</p>';
      return;
    }
    var html = '<div class="table-container"><table><thead><tr><th>' + Admin.t('Image', 'الصورة') + '</th><th>' + Admin.t('Nom', 'الاسم') + '</th><th>' + Admin.t('Prix', 'السعر') + '</th><th>' + Admin.t('Type', 'النوع') + '</th><th>' + Admin.t('Stock', 'المخزون') + '</th><th>' + Admin.t('Statut', 'الحالة') + '</th><th>' + Admin.t('Actions', 'الإجراءات') + '</th></tr></thead><tbody>';
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var imgUrl = (p.images && p.images.length > 0) ? p.images[0].image_url : '../assets/placeholder.svg';
      var typeLabels = { sell: ['Vente', 'بيع'], rent: ['Location', 'إيجار'], both: ['Vente & Location', 'بيع وإيجار'] };
      var typeLabel = typeLabels[p.type] ? Admin.t(typeLabels[p.type][0], typeLabels[p.type][1]) : p.type;
      var statusLabel = p.status === 'available' ? Admin.t('Disponible', 'متاح') : Admin.t('Indisponible', 'غير متاح');
      var statusClass = p.status === 'available' ? 'status-nouveau' : 'status-annule';
      html += '<tr><td><img src="' + imgUrl + '" style="width:48px;height:48px;object-fit:cover;border-radius:8px" onerror="this.src=\'../assets/placeholder.svg\'"></td><td><strong>' + p.name + '</strong></td><td>' + Admin.formatPrice(p.price) + '</td><td>' + typeLabel + '</td><td>' + (p.quantity || 0) + '</td><td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td><td><div style="display:flex;gap:6px"><button class="btn btn-sm" onclick="Admin.editProduct(' + p.id + ')">' + Admin.iconSpan('edit') + '</button><button class="btn btn-sm" style="color:var(--error)" onclick="Admin.deleteProduct(' + p.id + ')">' + Admin.iconSpan('trash') + '</button></div></td></tr>';
    }
    html += '</tbody></table></div>';
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = '<p style="color:var(--error)">' + Admin.t('Erreur', 'خطأ') + ': ' + e.message + '</p>';
  }
};
