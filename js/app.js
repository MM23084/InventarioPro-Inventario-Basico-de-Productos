document.addEventListener('DOMContentLoaded', () => {

  // ── Inicializar ───────────────────────────────────────────
  Productos.init();
  Productos.renderTabla();
  Dashboard.update();

  if (!sessionStorage.getItem('inv_session_start')) {
    Storage.logSession('Sesión iniciada en InventarioPro');
  }

  // ── Navegación ────────────────────────────────────────────
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => UI.showPage(btn.dataset.page));
  });

  // ── CRUD Productos ────────────────────────────────────────
  document.getElementById('btn-nuevo-producto').addEventListener('click',   () => Productos.openModal());
  document.getElementById('btn-guardar-producto').addEventListener('click', () => {
    Productos.guardar();
    Dashboard.update();
  });
  document.getElementById('modal-close').addEventListener('click',         () => Productos.closeModal());
  document.getElementById('btn-cancelar-modal').addEventListener('click',  () => Productos.closeModal());

  // Cerrar modal con clic en overlay
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target.id === 'modal') Productos.closeModal();
  });

  // Filtros en tiempo real
  document.getElementById('search-input').addEventListener('input',    () => Productos.renderTabla());
  document.getElementById('filter-cat').addEventListener('change',     () => Productos.renderTabla());
  document.getElementById('filter-estado').addEventListener('change',  () => Productos.renderTabla());

  // ── Dashboard / Worker ────────────────────────────────────
  document.getElementById('btn-run-worker').addEventListener('click', () => WorkerRunner.run());

  // ── Almacenamiento ────────────────────────────────────────
  document.getElementById('btn-view-ls').addEventListener('click',  () => UI.renderLS());
  document.getElementById('btn-clear-ls').addEventListener('click', () => UI.clearLS());
  document.getElementById('btn-view-ss').addEventListener('click',  () => UI.renderSS());
  document.getElementById('btn-clear-ss').addEventListener('click', () => UI.clearSS());

  // ── API / Geo ─────────────────────────────────────────────
  document.getElementById('btn-get-location').addEventListener('click',      () => API.getLocation());
  document.getElementById('btn-weather').addEventListener('click',           () => API.fetchWeather());
  document.getElementById('btn-fetch-productos').addEventListener('click',   () => API.fetchProductosExternos());

  // ── Tecla Escape cierra modal ─────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') Productos.closeModal();
  });

});
