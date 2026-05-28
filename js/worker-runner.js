/**
 * worker-runner.js
 * Lanza el Web Worker y muestra resultados en el log.
 */

const WorkerRunner = (() => {

  function run() {
    const log = document.getElementById('worker-log');
    log.innerHTML = '<div class="log-line">⟳ Iniciando Web Worker de inventario...</div>';

    try {
      const workerUrl = new URL('js/inventario.worker.js', window.location.href).href;
      const worker    = new Worker(workerUrl);
      const productos = Productos.getAll();

      worker.postMessage(productos);
      _append(log, `[${_now()}] Worker activo — analizando ${productos.length} producto(s)...`);

      worker.onmessage = function (e) {
        const s = e.data;
        _append(log, `<span>✓ Completado en ${s.processingMs} ms</span>`);
        _append(log, `Productos: ${s.total} | Unidades totales: ${s.totalUnidades}`);
        _append(log, `Valor del inventario: $${s.valorTotal.toLocaleString()}`);
        _append(log, `Precio promedio: $${s.precioPromedio} | Stock promedio: ${s.stockPromedio} uds.`);
        _append(log, `Disponibles: ${s.disponibles} | Bajo stock: ${s.bajoStock} | Agotados: ${s.agotados}`);
        if (s.productoMasCaro)  _append(log, `Más caro: ${s.productoMasCaro.nombre} ($${s.productoMasCaro.precio})`);
        if (s.productoMasStock) _append(log, `Más stock: ${s.productoMasStock.nombre} (${s.productoMasStock.stock} uds.)`);

        worker.terminate();
        Dashboard.update();
        UI.showToast('Análisis completado en ' + s.processingMs + ' ms', 'success');
        Storage.logSession('Ejecutó Web Worker de inventario');
      };

      worker.onerror = function (err) {
        _append(log, `<span style="color:var(--danger)">Error: ${err.message}</span>`);
        UI.showToast('Error en Worker: ' + err.message, 'danger');
      };

    } catch (e) {
      _append(log, `<span style="color:var(--danger)">No se pudo iniciar Worker: ${e.message}</span>`);
      UI.showToast('Error al crear Worker', 'danger');
      console.error('[WorkerRunner]', e);
    }
  }

  function _append(container, html) {
    const div = document.createElement('div');
    div.className = 'log-line';
    div.innerHTML = html;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function _now() { return new Date().toLocaleTimeString(); }

  return { run };

})();
