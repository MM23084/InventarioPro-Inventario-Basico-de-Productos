/**
 * Navegación entre páginas, toasts y vistas de almacenamiento.
 */

const UI = (() => {

  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById('page-' + id).classList.add('active');
    document.querySelector(`.nav-btn[data-page="${id}"]`).classList.add('active');

    Storage.logSession('Navegó a: ' + id);

    if (id === 'dashboard')       Dashboard.update();
    if (id === 'almacenamiento')  { renderLS(); renderSS(); renderSessionLog(); }
  }

  // ── Storage ───────────────────────────────────────────────

  function renderLS() {
    const el   = document.getElementById('ls-content');
    const data = Storage.getAllLocal();
    const keys = Object.keys(data);

    if (keys.length === 0) { el.textContent = '(vacío)'; return; }

    el.textContent = keys.map(k => {
      const val = typeof data[k] === 'string'
        ? data[k]
        : JSON.stringify(data[k], null, 2);
      return `[${k}]\n${val}\n`;
    }).join('\n');
  }

  function renderSS() {
    const el   = document.getElementById('ss-content');
    const data = Storage.getAllSession();
    const keys = Object.keys(data);

    if (keys.length === 0) { el.textContent = '(vacío)'; return; }

    el.textContent = keys.map(k => {
      const val = typeof data[k] === 'string'
        ? data[k]
        : JSON.stringify(data[k], null, 2);
      return `[${k}]\n${val}\n`;
    }).join('\n');
  }

  function renderSessionLog() {
    const log = Storage.getSessionLog();
    const el  = document.getElementById('session-log');

    if (log.length === 0) {
      el.textContent = '(sin eventos en esta sesión)';
      return;
    }

    el.textContent = log.map(l => `[${l.time}] ${l.msg}`).join('\n');
  }

  function clearLS() {
    if (!confirm('¿Limpiar LocalStorage?\nSe eliminarán todos los productos del inventario.')) return;
    Storage.clearLocal();
    Productos.init();
    Productos.renderTabla();
    renderLS();
    showToast('LocalStorage limpiado. Datos demo cargados.', 'info');
    Storage.logSession('Limpió LocalStorage');
  }

  function clearSS() {
    if (!confirm('¿Limpiar los datos de sesión?')) return;
    Storage.clearSession();
    renderSS();
    renderSessionLog();
    showToast('SessionStorage limpiado', 'info');
  }

  // ── Toast ─────────────────────────────────────────────────

  function showToast(msg, type = 'info') {
    const tc    = document.getElementById('toasts');
    const toast = document.createElement('div');
    toast.className  = 'toast ' + type;
    toast.textContent = msg;
    tc.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity    = '0';
      toast.style.transition = 'opacity .3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  return {
    showPage,
    renderLS, renderSS, renderSessionLog,
    clearLS, clearSS,
    showToast
  };

})();
