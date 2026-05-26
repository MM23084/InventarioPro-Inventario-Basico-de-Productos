const Dashboard = (() => {

  function update() {
    const productos = Productos.getAll();

    // ── Métricas principales ──────────────────────────────
    const total      = productos.length;
    const unidades   = productos.reduce((s, p) => s + p.stock, 0);
    const valorTotal = productos.reduce((s, p) => s + p.precio * p.stock, 0);
    const bajoStock  = productos.filter(p => p.stock > 0 && p.stock <= p.stockMin).length;
    const agotados   = productos.filter(p => p.stock === 0).length;

    document.getElementById('m-total').textContent = total;
    document.getElementById('m-stock').textContent = unidades.toLocaleString();
    document.getElementById('m-valor').textContent = '$' + valorTotal.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('m-bajo').textContent  = bajoStock + agotados;

    // ── Gráfica: productos por categoría ──────────────────
    _renderCatChart(productos);

    // ── Gráfica: stock por categoría ──────────────────────
    _renderStockChart(productos);

    // ── Alertas de stock bajo / agotado ───────────────────
    _renderAlertas(productos);
  }

  function _getCategorias(productos) {
    const cats = {};
    productos.forEach(p => {
      cats[p.categoria] = cats[p.categoria] || { count: 0, stock: 0 };
      cats[p.categoria].count++;
      cats[p.categoria].stock += p.stock;
    });
    return cats;
  }

  const CAT_COLORS = {
    'Electrónica': 'var(--info)',
    'Ropa':        '#a78bfa',
    'Alimentos':   'var(--warning)',
    'Hogar':       'var(--accent)',
    'Deportes':    'var(--danger)',
    'Otro':        'var(--muted)'
  };

  function _renderCatChart(productos) {
    const cats   = _getCategorias(productos);
    const keys   = Object.keys(cats);
    const maxVal = Math.max(...keys.map(k => cats[k].count), 1);

    document.getElementById('cat-chart').innerHTML = keys.map(k => `
      <div class="bar-wrap">
        <div class="bar-val">${cats[k].count}</div>
        <div class="bar"
          style="height:${Math.round((cats[k].count / maxVal) * 100)}%;
                 background:${CAT_COLORS[k] || 'var(--muted)'};"
          title="${k}: ${cats[k].count}">
        </div>
        <div class="bar-label">${k.slice(0, 5)}.</div>
      </div>
    `).join('') || '<p style="color:var(--muted);font-size:.85rem;">Sin datos.</p>';
  }

  function _renderStockChart(productos) {
    const cats   = _getCategorias(productos);
    const keys   = Object.keys(cats);
    const maxVal = Math.max(...keys.map(k => cats[k].stock), 1);

    document.getElementById('stock-chart').innerHTML = keys.map(k => `
      <div class="prio-row">
        <span class="prio-name">${k.slice(0, 9)}</span>
        <div class="prio-bar-bg">
          <div class="prio-bar-fill"
            style="width:${Math.round((cats[k].stock / maxVal) * 100)}%;
                   background:${CAT_COLORS[k] || 'var(--muted)'};">
          </div>
        </div>
        <span class="prio-count">${cats[k].stock} uds.</span>
      </div>
    `).join('') || '<p style="color:var(--muted);font-size:.85rem;">Sin datos.</p>';
  }

  function _renderAlertas(productos) {
    const criticos = productos
      .filter(p => p.stock === 0 || p.stock <= p.stockMin)
      .sort((a, b) => a.stock - b.stock);

    const el = document.getElementById('alert-list');

    if (criticos.length === 0) {
      el.innerHTML = '<p style="color:var(--muted);font-size:.85rem;">✓ Sin alertas. Todo el inventario está bien abastecido.</p>';
      return;
    }

    el.innerHTML = criticos.map(p => `
      <div class="alert-item">
        <span style="font-family:monospace;font-size:.75rem;color:var(--muted);">${p.codigo}</span>
        <span class="a-name">${p.nombre}</span>
        <span class="a-stock">${p.stock === 0 ? 'AGOTADO' : p.stock + ' uds.'}</span>
        <span class="a-min">mín: ${p.stockMin}</span>
      </div>
    `).join('');
  }

  return { update };

})();
