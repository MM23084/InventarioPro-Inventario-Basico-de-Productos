/**
 * storage.js
 * Módulo de almacenamiento: LocalStorage y SessionStorage.
 * Requerimiento 3: Almacenamiento Local.
 */
const Storage = (() => {
  const LS_KEY   = 'inv_productos';
  const META_KEY = 'inv_meta';

  // ── LocalStorage ──────────────────────────────────────────

  function saveProductos(productos) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(productos));
      localStorage.setItem(META_KEY, JSON.stringify({
        lastSave: new Date().toISOString(),
        total: productos.length
      }));
    } catch (e) {
      console.error('[Storage] Error al guardar:', e);
      throw new Error('No se pudo guardar en LocalStorage: ' + e.message);
    }
  }

  function loadProductos() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[Storage] Error al cargar:', e);
      return [];
    }
  }

  function clearLocal() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('inv_'))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('[Storage] Error al limpiar LocalStorage:', e);
    }
  }

  function getAllLocal() {
    const result = {};
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('inv_'))
        .forEach(k => {
          try { result[k] = JSON.parse(localStorage.getItem(k)); }
          catch { result[k] = localStorage.getItem(k); }
        });
    } catch (e) { /* ignore */ }
    return result;
  }

  return {
    saveProductos, loadProductos, clearLocal, getAllLocal
  };

})();