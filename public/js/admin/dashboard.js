Admin.renderDashboard = async function() {
  var c = document.getElementById('adminContent');
  c.innerHTML = '<h2 class="page-title">' + Admin.iconSpan('home', 'lg') + ' ' + Admin.t('Tableau de bord', 'لوحة التحكم') + '</h2><div class="stats-grid" id="statsGrid"></div><div class="chart-container" id="chartContainer"><h3 style="margin-bottom:16px">' + Admin.iconSpan('stats') + ' ' + Admin.t('Activite (30 jours)', 'النشاط (30 يوم)') + '</h3><canvas id="activityChart"></canvas></div><h3 style="margin:24px 0 16px">' + Admin.iconSpan('orders') + ' ' + Admin.t('Dernieres commandes', 'آخر الطلبات') + '</h3><div id="recentOrders"></div>';
  try {
    var data = await api.getDashboard();
    var stats = data.stats;
    document.getElementById('statsGrid').innerHTML =
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('products', 'xl') + '</div><div class="label">' + Admin.t('Produits', 'المنتجات') + '</div><div class="value">' + stats.products + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('orders', 'xl') + '</div><div class="label">' + Admin.t('Commandes', 'الطلبات') + '</div><div class="value">' + stats.orders + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('rent', 'xl') + '</div><div class="label">' + Admin.t('Locations', 'الإيجارات') + '</div><div class="value">' + stats.rents + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('clients', 'xl') + '</div><div class="label">' + Admin.t('Clients', 'العملاء') + '</div><div class="value">' + stats.users + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('clock', 'xl') + '</div><div class="label">' + Admin.t('Nouvelles commandes', 'طلبات جديدة') + '</div><div class="value" style="color:var(--secondary)">' + stats.new_orders + '</div></div>' +
      '<div class="stat-card"><div class="icon">' + Admin.iconSpan('revenue', 'xl') + '</div><div class="label">' + Admin.t('Revenus', 'الإيرادات') + '</div><div class="value">' + this.formatPrice(stats.revenue) + '</div></div>';

    // Draw chart
    Admin.drawActivityChart(stats);

    var recent = data.recent_orders || [];
    var rEl = document.getElementById('recentOrders');
    if (recent.length === 0) {
      rEl.innerHTML = '<p class="text-muted">' + Admin.t('Aucune commande recente', 'لا توجد طلبات حديثة') + '</p>';
    } else {
      var rows = '';
      for (var i = 0; i < recent.length; i++) {
        var o = recent[i];
        rows += '<tr><td><strong>#' + o.id + '</strong></td><td>' + o.client_name + '</td><td dir="ltr">' + o.client_phone + '</td><td><strong>' + Admin.formatPrice(o.total_amount) + '</strong></td><td><span class="status-badge status-' + o.status + '">' + Admin.getStatusLabel(o.status) + '</span></td><td class="text-muted">' + new Date(o.created_at).toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</td></tr>';
      }
      rEl.innerHTML = '<div class="table-container"><table><thead><tr><th>#</th><th>' + Admin.t('Client', 'العميل') + '</th><th>' + Admin.t('Telephone', 'الهاتف') + '</th><th>' + Admin.t('Total', 'المجموع') + '</th><th>' + Admin.t('Statut', 'الحالة') + '</th><th>' + Admin.t('Date', 'التاريخ') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    }
  } catch (e) {
    c.innerHTML = '<h2 class="page-title">' + Admin.t('Tableau de bord', 'لوحة التحكم') + '</h2><p style="color:var(--error)">' + Admin.t('Erreur', 'خطأ') + ': ' + e.message + '</p>';
  }
};

Admin.drawActivityChart = function(stats) {
  var canvas = document.getElementById('activityChart');
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
  var barColor = isDark ? '#D4A843' : '#0A1628';
  var gridColor = isDark ? '#334155' : '#E2E8F0';

  var values = [
    stats.recent_orders || 0,
    stats.recent_rents || 0,
    stats.daily_visits_30 || 0,
    stats.products || 0,
    stats.users || 0
  ];
  var labels = [
    Admin.t('Commandes', 'الطلبات'),
    Admin.t('Locations', 'الإيجارات'),
    Admin.t('Visites', 'الزيارات'),
    Admin.t('Produits', 'المنتجات'),
    Admin.t('Clients', 'العملاء')
  ];

  var maxVal = Math.max.apply(null, values) || 1;
  var barW = Math.min(60, (chartW / values.length) * 0.6);
  var gap = (chartW - barW * values.length) / (values.length + 1);

  ctx.clearRect(0, 0, w, h);

  // Grid lines
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

  // Bars
  for (var b = 0; b < values.length; b++) {
    var x = pad.left + gap + (barW + gap) * b;
    var barH = (values[b] / maxVal) * chartH;
    var yBar = pad.top + chartH - barH;

    // Bar gradient
    var grad = ctx.createLinearGradient(x, yBar, x, pad.top + chartH);
    grad.addColorStop(0, barColor);
    grad.addColorStop(1, barColor + '33');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, yBar, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Label
    ctx.fillStyle = textColor;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[b], x + barW / 2, pad.top + chartH + 18);

    // Value on top
    ctx.fillStyle = isDark ? '#F8FAFC' : '#1E293B';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText(values[b], x + barW / 2, yBar - 6);
  }
};
