self.onmessage = function (e) {
  const productos = e.data;
  const start     = Date.now();

  // Simular procesamiento pesado
  let dummy = 0;
  for (let i = 0; i < 4_000_000; i++) dummy += i;

  const stats = {
    total:          productos.length,
    totalUnidades:  0,
    valorTotal:     0,
    precioPromedio: 0,
    stockPromedio:  0,
    agotados:       0,
    bajoStock:      0,
    disponibles:    0,
    porCategoria:   {},
    productoMasCaro:  null,
    productoMasStock: null,
    processingMs:   0
  };

  productos.forEach(p => {
    stats.totalUnidades += p.stock;
    stats.valorTotal += p.precio;

    if (p.stock === 0)              stats.agotados++;
    else if (p.stock <= p.stockMin) stats.bajoStock++;
    else                            stats.disponibles++;

    if (!stats.porCategoria[p.categoria]) {
      stats.porCategoria[p.categoria] = { count: 0, stock: 0, valor: 0 };
    }
    stats.porCategoria[p.categoria].count++;
    stats.porCategoria[p.categoria].stock += p.stock;
    stats.porCategoria[p.categoria].valor += p.precio * p.stock;

    if (!stats.productoMasCaro || p.precio > stats.productoMasCaro.precio) {
      stats.productoMasCaro = { nombre: p.nombre, precio: p.precio };
    }
    if (!stats.productoMasStock || p.stock > stats.productoMasStock.stock) {
      stats.productoMasStock = { nombre: p.nombre, stock: p.stock };
    }
  });

  if (productos.length > 0) {
    stats.precioPromedio = parseFloat((
      productos.reduce((s, p) => s + p.precio, 0) / productos.length
    ).toFixed(2));
    stats.stockPromedio = parseFloat((stats.totalUnidades / productos.length).toFixed(1));
  }

  stats.valorTotal    = parseFloat(stats.valorTotal.toFixed(2));
  stats.processingMs  = Date.now() - start;

  self.postMessage(stats);
};
