/**
 * storage.js
 * Módulo de almacenamiento: LocalStorage y SessionStorage.
 * Requerimiento 3: Almacenamiento Local.
 */

const Storage = (() => {

  const LS_KEY   = 'inv_productos';
  const META_KEY = 'inv_meta';
  const LOG_KEY  = 'inv_log';

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

  // ── SessionStorage ────────────────────────────────────────

  function logSession(msg) {
    try {
      const log = JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]');
      log.unshift({ time: new Date().toLocaleTimeString(), msg });
      if (log.length > 60) log.pop();
      sessionStorage.setItem(LOG_KEY, JSON.stringify(log));
      if (!sessionStorage.getItem('inv_session_start')) {
        sessionStorage.setItem('inv_session_start', new Date().toISOString());
      }
    } catch (e) { /* ignore */ }
  }

  function setSession(key, value) {
    try {
      sessionStorage.setItem('inv_' + key, JSON.stringify(value));
    } catch (e) { /* ignore */ }
  }

  function getSession(key) {
    try {
      const raw = sessionStorage.getItem('inv_' + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function getSessionLog() {
    try {
      return JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]');
    } catch { return []; }
  }

  function clearSession() {
    try {
      Object.keys(sessionStorage)
        .filter(k => k.startsWith('inv_'))
        .forEach(k => sessionStorage.removeItem(k));
    } catch (e) { /* ignore */ }
  }

  function getAllSession() {
    const result = {};
    try {
      Object.keys(sessionStorage)
        .filter(k => k.startsWith('inv_'))
        .forEach(k => {
          try { result[k] = JSON.parse(sessionStorage.getItem(k)); }
          catch { result[k] = sessionStorage.getItem(k); }
        });
    } catch (e) { /* ignore */ }
    return result;
  }

  return {
    saveProductos, loadProductos, clearLocal, getAllLocal,
    logSession, setSession, getSession, getSessionLog,
    clearSession, getAllSession
  };

})();
