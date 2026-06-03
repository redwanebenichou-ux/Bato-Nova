Admin.renderStats = async function() {
  var c = document.getElementById('adminContent');
  c.innerHTML = '<h2 class="page-title">' + Admin.iconSpan('stats', 'lg') + ' ' + Admin.t('Statistiques', 'الإحصائيات') + '</h2><div id="statsContent"><p class="text-muted">' + Admin.t('Chargement...', 'جار التحميل...') + '</p></div>';
  try {
    var data = await api.adminGetStats();
    var s = data.stats;
    var isAr = document.documentElement.lang === 'ar';
    var html =
      '<div class="stats-grid" style="margin-bottom:24px">' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('orders', 'xl') + '</div><div class="label">' + Admin.t('Total commandes', 'إجمالي الطلبات') + '</div><div class="value">' + (s.total_orders || 0) + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('rent', 'xl') + '</div><div class="label">' + Admin.t('Total locations', 'إجمالي الإيجارات') + '</div><div class="value">' + (s.total_rents || 0) + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('revenue', 'xl') + '</div><div class="label">' + Admin.t('Revenus', 'الإيرادات') + '</div><div class="value">' + Admin.formatPrice(s.total_revenue) + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('orders', 'xl') + '</div><div class="label">' + Admin.t('Commandes (30j)', 'الطلبات (30 يوم)') + '</div><div class="value">' + (s.recent_orders || 0) + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('rent', 'xl') + '</div><div class="label">' + Admin.t('Locations (30j)', 'الإيجارات (30 يوم)') + '</div><div class="value">' + (s.recent_rents || 0) + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('eye', 'xl') + '</div><div class="label">' + Admin.t('Visites (30j)', 'الزيارات (30 يوم)') + '</div><div class="value">' + (s.daily_visits_30 || 0) + '</div></div></div>' +
      '<div class="chart-container"><h3 style="margin-bottom:16px">' + Admin.iconSpan('stats') + ' ' + Admin.t('Apercu des statistiques', 'نظرة عامة على الإحصائيات') + '</h3><canvas id="statsChart"></canvas></div>';

    if (data.top_products && data.top_products.length > 0) {
      html += '<h3 style="margin-bottom:12px">' + Admin.iconSpan('products') + ' ' + Admin.t('Produits les plus demandes', 'المنتجات الأكثر طلبا') + '</h3><div class="table-container"><table><thead><tr><th>' + Admin.t('Produit', 'المنتج') + '</th><th>' + Admin.t('Prix', 'السعر') + '</th><th>' + Admin.t('Quantite commandee', 'الكمية المطلوبة') + '</th></tr></thead><tbody>';
      for (var i = 0; i < data.top_products.length; i++) {
        var p = data.top_products[i];
        var pName = p.Product ? p.Product.name : Admin.t('Produit', 'المنتج');
        var pPrice = p.Product ? p.Product.price : 0;
        html += '<tr><td><strong>' + pName + '</strong></td><td>' + Admin.formatPrice(pPrice) + '</td><td>' + (p.dataValues ? p.dataValues.total_quantity : p.total_quantity || 0) + '</td></tr>';
      }
      html += '</tbody></table></div>';
    } else {
      html += '<p class="text-muted">' + Admin.t('Pas encore de donnees', 'لا توجد بيانات بعد') + '</p>';
    }

    document.getElementById('statsContent').innerHTML = html;
    Admin.drawStatsChart(s);
  } catch (e) {
    document.getElementById('statsContent').innerHTML = '<p style="color:var(--error)">' + e.message + '</p>';
  }
};

Admin.drawStatsChart = function(stats) {
  var canvas = document.getElementById('statsChart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 250 * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = '250px';
  ctx.scale(dpr, dpr);

  var w = rect.width;
  var h = 250;
  var pad = { top: 20, bottom: 30, left: 10, right: 10 };
  var chartW = w - pad.left - pad.right;
  var chartH = h - pad.top - pad.bottom;

  var isDark = document.body.classList.contains('dark-mode');
  var textColor = isDark ? '#94A3B8' : '#64748B';
  var gridColor = isDark ? '#334155' : '#E2E8F0';
  var colors = ['#0A1628', '#D4A843', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

  var labels = [
    Admin.t('Commandes', 'الطلبات'),
    Admin.t('Locations', 'الإيجارات'),
    Admin.t('Revenu (KDA)', 'الإيرادات (ألف د.ج)'),
    Admin.t('30j Com.', '30 يوم طلبات'),
    Admin.t('30j Loc.', '30 يوم إيجار'),
    Admin.t('Visites', 'الزيارات')
  ];
  var values = [
    stats.total_orders || 0,
    stats.total_rents || 0,
    Math.round((stats.total_revenue || 0) / 1000),
    stats.recent_orders || 0,
    stats.recent_rents || 0,
    stats.daily_visits_30 || 0
  ];

  var maxVal = Math.max.apply(null, values) || 1;
  var barW = Math.min(50, (chartW / values.length) * 0.6);
  var gap = (chartW - barW * values.length) / (values.length + 1);

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (var g = 0; g <= 4; g++) {
    var y = pad.top + (chartH / 4) * g;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal - (maxVal / 4) * g), pad.left - 5, y + 4);
  }

  for (var b = 0; b < values.length; b++) {
    var x = pad.left + gap + (barW + gap) * b;
    var barH = (values[b] / maxVal) * chartH;
    var yBar = pad.top + chartH - barH;

    var grad = ctx.createLinearGradient(x, yBar, x, pad.top + chartH);
    grad.addColorStop(0, colors[b % colors.length]);
    grad.addColorStop(1, colors[b % colors.length] + '33');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, yBar, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[b], x + barW / 2, pad.top + chartH + 18);

    ctx.fillStyle = isDark ? '#F8FAFC' : '#1E293B';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(values[b], x + barW / 2, yBar - 6);
  }
};

Admin.showProductForm = function(product) {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'productModal';
  var isEdit = !!product;
  var nameVal = isEdit ? (product.name || '') : '';
  var nameArVal = isEdit ? (product.name_ar || '') : '';
  var descVal = isEdit ? (product.description || '') : '';
  var priceVal = isEdit ? product.price : '';
  var rentPriceVal = isEdit ? (product.rent_price || '') : '';
  var typeSell = (!isEdit || product.type === 'sell') ? 'selected' : '';
  var typeRent = (isEdit && product.type === 'rent') ? 'selected' : '';
  var typeBoth = (isEdit && product.type === 'both') ? 'selected' : '';
  var periodDay = (!isEdit || product.rent_price_per === 'day') ? 'selected' : '';
  var periodWeek = (isEdit && product.rent_price_per === 'week') ? 'selected' : '';
  var periodMonth = (isEdit && product.rent_price_per === 'month') ? 'selected' : '';
  var qtyVal = isEdit ? product.quantity : 1;
  var statusAvail = (!isEdit || product.status === 'available') ? 'selected' : '';
  var statusUnavail = (isEdit && product.status === 'unavailable') ? 'selected' : '';
  var savedWilayas = product && product.wilayas ? (typeof product.wilayas === 'string' ? JSON.parse(product.wilayas) : product.wilayas) : [];
  var showWilayas = (!isEdit || product.type !== 'sell') ? '' : ' style="display:none"';

  overlay.innerHTML =
    '<div class="modal">' +
    '<h3 class="modal-title">' + (isEdit ? Admin.iconSpan('edit') + ' ' + Admin.t('Modifier le produit', 'تعديل المنتج') : Admin.iconSpan('plus') + ' ' + Admin.t('Nouveau produit', 'منتج جديد') ) + '</h3>' +
    '<form id="productForm" onsubmit="return false">' +
    '<div class="form-row"><div class="form-group"><label class="form-label">' + Admin.t('Nom (Francais)', 'الاسم (فرنسي)') + '</label><input type="text" class="form-input" id="pfName" value="' + nameVal + '" required></div>' +
    '<div class="form-group"><label class="form-label">الاسم (العربية)</label><input type="text" class="form-input" id="pfNameAr" value="' + nameArVal + '" dir="rtl"></div></div>' +
    '<div class="form-group"><label class="form-label">' + Admin.t('Description (Francais)', 'الوصف (فرنسي)') + '</label><textarea class="form-textarea" id="pfDesc">' + descVal + '</textarea></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">' + Admin.t('Prix de vente (DA)', 'سعر البيع (د.ج)') + '</label><input type="number" class="form-input" id="pfPrice" value="' + priceVal + '" step="0.01" min="0"></div>' +
    '<div class="form-group"><label class="form-label">' + Admin.t('Prix de location (DA)', 'سعر الإيجار (د.ج)') + '</label><input type="number" class="form-input" id="pfRentPrice" value="' + rentPriceVal + '" step="0.01" min="0"></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">' + Admin.t('Type', 'النوع') + '</label><select class="form-select" id="pfType" onchange="Admin.toggleWilayas()"><option value="sell" ' + typeSell + '>' + Admin.t('Vente', 'بيع') + '</option><option value="rent" ' + typeRent + '>' + Admin.t('Location', 'إيجار') + '</option><option value="both" ' + typeBoth + '>' + Admin.t('Vente & Location', 'بيع وإيجار') + '</option></select></div>' +
    '<div class="form-group"><label class="form-label">' + Admin.t('Periode location', 'فترة الإيجار') + '</label><select class="form-select" id="pfRentPeriod"><option value="day" ' + periodDay + '>' + Admin.t('Par jour', 'باليوم') + '</option><option value="week" ' + periodWeek + '>' + Admin.t('Par semaine', 'بالأسبوع') + '</option><option value="month" ' + periodMonth + '>' + Admin.t('Par mois', 'بالشهر') + '</option></select></div></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">' + Admin.t('Quantite', 'الكمية') + '</label><input type="number" class="form-input" id="pfQuantity" value="' + qtyVal + '" min="0"></div>' +
    '<div class="form-group"><label class="form-label">' + Admin.t('Statut', 'الحالة') + '</label><select class="form-select" id="pfStatus"><option value="available" ' + statusAvail + '>' + Admin.t('Disponible', 'متاح') + '</option><option value="unavailable" ' + statusUnavail + '>' + Admin.t('Indisponible', 'غير متاح') + '</option></select></div></div>' +
    '<div class="form-group" id="wilayasGroup"' + showWilayas + '><label class="form-label">📍 ' + Admin.t('Wilayas disponibles pour la location', 'الولايات المتاحة للإيجار') + '</label>' +
    '<div style="max-height:150px;overflow-y:auto;border:1px solid var(--gray-200);border-radius:var(--radius-md);padding:8px;display:flex;flex-wrap:wrap;gap:4px" id="wilayaChips">' +
    APP_WILAYAS.map(function(w) {
      var isChecked = savedWilayas.indexOf(w) !== -1;
      return '<span class="wilaya-chip' + (isChecked ? ' selected' : '') + '" data-wilaya="' + w + '" onclick="Admin.toggleWilayaChip(this)">' + w + '</span>';
    }).join('') +
    '</div><p class="text-muted" style="font-size:11px;margin-top:4px">' + Admin.t('Cochez les wilayas ou ce produit est disponible a la location. Laissez vide pour toutes les wilayas.', 'اختر الولايات المتاحة لهذا المنتج للإيجار. اترك فارغاً لجميع الولايات.') + '</p></div>' +
    '<div class="form-group"><label class="form-label">' + Admin.t('Images', 'الصور') + '</label>' +
    '<div class="image-upload" onclick="document.getElementById(\'pfImages\').click()"><p style="font-size:32px;margin-bottom:8px">' + Admin.iconSpan('image', 'xl') + '</p><p style="color:var(--gray-500)">' + Admin.t('Cliquez pour ajouter des images', 'انقر لإضافة الصور') + '</p><p class="text-muted">JPG, PNG, WebP (max 5MB)</p></div>' +
    '<input type="file" id="pfImages" multiple accept="image/*" style="display:none" onchange="Admin.previewImages(this)">' +
    '<div class="image-preview" id="imagePreview"></div></div>' +
    '<div id="productFormError" class="form-error"></div>' +
    '<div class="modal-actions"><button type="button" class="btn" onclick="Admin.closeModal(this)">' + Admin.t('Annuler', 'إلغاء') + '</button>' +
    '<button type="submit" class="btn btn-primary" onclick="Admin.saveProduct(' + (isEdit ? product.id : 'null') + ')">' + (isEdit ? Admin.iconSpan('check') + ' ' + Admin.t('Enregistrer', 'حفظ') : Admin.iconSpan('plus') + ' ' + Admin.t('Creer', 'إنشاء')) + '</button></div>' +
    '</form></div>';
  document.body.appendChild(overlay);
};

Admin.toggleWilayas = function() {
  var type = document.getElementById('pfType').value;
  var group = document.getElementById('wilayasGroup');
  if (group) group.style.display = (type === 'rent' || type === 'both') ? 'block' : 'none';
};

Admin.toggleWilayaChip = function(el) {
  el.classList.toggle('selected');
};

Admin.previewImages = function(input) {
  var preview = document.getElementById('imagePreview');
  preview.innerHTML = '';
  for (var i = 0; i < input.files.length; i++) {
    (function(file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var img = document.createElement('img');
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    })(input.files[i]);
  }
};

Admin.saveProduct = async function(productId) {
  var errorEl = document.getElementById('productFormError');
  errorEl.textContent = '';
  var name = document.getElementById('pfName').value.trim();
  if (!name) { errorEl.textContent = Admin.t('Le nom est requis', 'الاسم مطلوب'); return; }
  var formData = new FormData();
  formData.append('name', name);
  formData.append('name_ar', document.getElementById('pfNameAr').value.trim());
  formData.append('description', document.getElementById('pfDesc').value.trim());
  formData.append('price', document.getElementById('pfPrice').value || 0);
  formData.append('rent_price', document.getElementById('pfRentPrice').value || 0);
  formData.append('type', document.getElementById('pfType').value);
  formData.append('rent_price_per', document.getElementById('pfRentPeriod').value);
  formData.append('quantity', document.getElementById('pfQuantity').value || 1);
  formData.append('status', document.getElementById('pfStatus').value);
  var wilayaChips = document.querySelectorAll('#wilayaChips .wilaya-chip.selected');
  var selectedWilayas = [];
  wilayaChips.forEach(function(chip) { selectedWilayas.push(chip.getAttribute('data-wilaya')); });
  formData.append('wilayas', selectedWilayas.length > 0 ? JSON.stringify(selectedWilayas) : '');
  var images = document.getElementById('pfImages');
  if (images.files.length > 0) {
    for (var i = 0; i < images.files.length; i++) {
      formData.append('images', images.files[i]);
    }
  }
  var btn = document.querySelector('#productForm .btn-primary');
  btn.textContent = Admin.t('Enregistrement...', 'جار الحفظ...');
  btn.disabled = true;
  try {
    if (productId) {
      await api.adminUpdateProduct(productId, formData);
      Admin.showToast(Admin.t('Produit modifie', 'تم تعديل المنتج'), 'success');
    } else {
      await api.adminCreateProduct(formData);
      Admin.showToast(Admin.t('Produit cree', 'تم إنشاء المنتج'), 'success');
    }
    document.getElementById('productModal').remove();
    Admin.loadProducts();
  } catch (e) {
    errorEl.textContent = e.message;
  }
  btn.textContent = productId ? Admin.iconSpan('check') + ' ' + Admin.t('Enregistrer', 'حفظ') : Admin.iconSpan('plus') + ' ' + Admin.t('Creer', 'إنشاء');
  btn.disabled = false;
};

Admin.editProduct = async function(id) {
  try {
    var data = await api.getProduct(id);
    Admin.showProductForm(data.product);
  } catch (e) {
    Admin.showToast(e.message, 'error');
  }
};

Admin.deleteProduct = async function(id) {
  if (!confirm(Admin.t('Supprimer ce produit ?', 'حذف هذا المنتج؟'))) return;
  try {
    await api.adminDeleteProduct(id);
    Admin.showToast(Admin.t('Produit supprime', 'تم حذف المنتج'), 'success');
    Admin.loadProducts();
  } catch (e) {
    Admin.showToast(e.message, 'error');
  }
};
