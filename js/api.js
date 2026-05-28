/**
 * api.js
 * Módulo de API REST y Geolocalización.
 * Requerimiento 4: Fetch, geolocalización, JSON, Dashboard.
 */
const API = (() => {

  let _coords = null;

  // ── Geolocalización ───────────────────────────────────────

  function getLocation() {
    if (!navigator.geolocation) {
      document.getElementById('geo-status').textContent = 'no soportado';
      UI.showToast('Geolocalización no disponible en este navegador', 'danger');
      return;
    }

    document.getElementById('geo-status').textContent = 'obteniendo...';

    navigator.geolocation.getCurrentPosition(
      _onSuccess,
      _onError,
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  async function _onSuccess(pos) {
    _coords = {
      lat:      pos.coords.latitude,
      lng:      pos.coords.longitude,
      accuracy: pos.coords.accuracy
    };

    // Mostrar coordenadas de inmediato mientras busca la dirección
    document.getElementById('geo-info').innerHTML = `
      <div class="geo-chip">Latitud: <span>${_coords.lat.toFixed(5)}</span></div>
      <div class="geo-chip">Longitud: <span>${_coords.lng.toFixed(5)}</span></div>
      <div class="geo-chip">Precisión: <span>${Math.round(_coords.accuracy)} m</span></div>
      <div class="geo-chip">Dirección: <span id="geo-address">buscando...</span></div>
    `;

    document.getElementById('btn-weather').disabled = false;
    UI.showToast('Coordenadas obtenidas, buscando dirección...', 'info');
    Storage.logSession('Obtuvo geolocalización de bodega');
    Storage.setSession('bodega_coords', _coords);

    // ── Reverse geocoding — Nominatim (OpenStreetMap) ─────
    // Gratuito, sin API key, responde en español
    try {
      const url = `https://nominatim.openstreetmap.org/reverse`
        + `?lat=${_coords.lat}&lon=${_coords.lng}`
        + `&format=json&addressdetails=1`;

      const res = await fetch(url, {
        headers: { 'Accept-Language': 'es' }
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      const addr = data.address || {};

      // Construir línea corta con las partes más relevantes
      const calle  = addr.road || addr.pedestrian || addr.footway || addr.path || '';
      const numero = addr.house_number || '';
      const barrio = addr.neighbourhood || addr.suburb || addr.quarter || '';
      const ciudad = addr.city || addr.town || addr.village || addr.municipality || '';
      const depto  = addr.state || addr.county || '';
      const pais   = addr.country || '';

      const lineaCorta = [
        calle + (numero ? ' #' + numero : ''),
        barrio,
        ciudad,
        depto,
        pais
      ].filter(Boolean).join(', ');

      const displayFull = data.display_name || lineaCorta;

      // Reemplazar el contenido con dirección completa y visual
      document.getElementById('geo-info').innerHTML = `
        <div class="geo-chip">Latitud: <span>${_coords.lat.toFixed(5)}</span></div>
        <div class="geo-chip">Longitud: <span>${_coords.lng.toFixed(5)}</span></div>
        <div class="geo-chip">Precisión: <span>${Math.round(_coords.accuracy)} m</span></div>
        <div class="geo-address-box">
          <div class="geo-address-label">📍 Ubicación detectada</div>
          <div class="geo-address-main">${lineaCorta || displayFull}</div>
          <div class="geo-address-full">${displayFull}</div>
        </div>
      `;

      UI.showToast('Ubicación y dirección registradas ✓', 'success');
      Storage.logSession('Dirección obtenida: ' + (ciudad || pais));
      Storage.setSession('bodega_direccion', lineaCorta || displayFull);

    } catch (e) {
      const addrEl = document.getElementById('geo-address');
      if (addrEl) addrEl.textContent = 'no disponible';
      console.warn('[API] Reverse geocoding falló:', e.message);
      UI.showToast('Coordenadas guardadas (dirección no disponible)', 'warning');
    }
  }

  function _onError(err) {
    const msgs = {
      1: 'Permiso denegado por el usuario',
      2: 'Posición no disponible',
      3: 'Tiempo de espera agotado'
    };
    document.getElementById('geo-info').innerHTML =
      `<div class="geo-chip"><span style="color:var(--danger)">${msgs[err.code] || err.message}</span></div>`;
    UI.showToast('Error GPS: ' + (msgs[err.code] || err.message), 'danger');
  }

  // ── Clima (Open-Meteo) ────────────────────────────────────

  async function fetchWeather() {
    if (!_coords) { UI.showToast('Primero obtén la ubicación', 'warning'); return; }

    const el = document.getElementById('weather-result');
    el.innerHTML = '<p style="color:var(--muted);font-size:.85rem;">Consultando clima...</p>';

    const url = `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${_coords.lat}&longitude=${_coords.lng}`
      + `&current_weather=true&hourly=relativehumidity_2m,precipitation`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      _renderWeather(data);
      Storage.logSession('Consultó clima de bodega');

    } catch (e) {
      el.innerHTML = `<p style="color:var(--danger);font-size:.85rem;">Error: ${e.message}</p>`;
      UI.showToast('Error al consultar clima: ' + e.message, 'danger');
      console.error('[API] fetchWeather:', e);
    }
  }

  const WMO = {
    0:'Despejado', 1:'Mayormente despejado', 2:'Parcialmente nublado',
    3:'Nublado', 45:'Neblina', 51:'Llovizna', 61:'Lluvia ligera',
    63:'Lluvia moderada', 65:'Lluvia intensa', 80:'Aguaceros', 95:'Tormenta'
  };

  function _renderWeather(data) {
    const w           = data.current_weather;
    const humidity    = data.hourly?.relativehumidity_2m?.[0] ?? '—';
    const precip      = data.hourly?.precipitation?.[0] ?? 0;
    const descripcion = WMO[w.weathercode] || 'Código ' + w.weathercode;

    document.getElementById('weather-result').innerHTML = `
      <div class="weather-grid">
        <div class="weather-item">
          <div class="metric-label">Temperatura</div>
          <div class="metric-value" style="font-size:1.6rem;color:var(--accent);">${w.temperature}°C</div>
        </div>
        <div class="weather-item">
          <div class="metric-label">Viento</div>
          <div class="metric-value" style="font-size:1.6rem;color:var(--info);">${w.windspeed} km/h</div>
        </div>
        <div class="weather-item">
          <div class="metric-label">Humedad</div>
          <div class="metric-value" style="font-size:1.6rem;color:#a78bfa;">${humidity}%</div>
        </div>
        <div class="weather-item">
          <div class="metric-label">Precipitación</div>
          <div class="metric-value" style="font-size:1.6rem;color:var(--info);">${precip} mm</div>
        </div>
      </div>
      <div style="margin-top:.75rem;padding:.65rem 1rem;background:var(--surface2);border-radius:var(--radius-sm);font-size:.85rem;">
        Condición: <strong>${descripcion}</strong>
        <span style="color:var(--muted);font-size:.75rem;margin-left:1rem;">
          Open-Meteo API | ${new Date().toLocaleString()}
        </span>
      </div>
    `;
  }

  // ── Catálogo externo (FakeStore API) ──────────────────────

  async function fetchProductosExternos() {
    const el = document.getElementById('api-productos-result');
    el.innerHTML = '<p style="color:var(--muted);font-size:.85rem;">Cargando catálogo externo...</p>';

    try {
      const res = await fetch('https://fakestoreapi.com/products?limit=8');
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const productos = await res.json();
      _renderProductosExternos(productos);
      Storage.logSession('Consultó catálogo externo FakeStore API (' + productos.length + ' productos)');

    } catch (e) {
      el.innerHTML = `<p style="color:var(--danger);font-size:.85rem;">Error al cargar catálogo: ${e.message}</p>`;
      UI.showToast('Error Fetch: ' + e.message, 'danger');
      console.error('[API] fetchProductosExternos:', e);
    }
  }

  function _renderProductosExternos(productos) {
    document.getElementById('api-productos-result').innerHTML = `
      <div style="overflow-x:auto;">
        <table class="prod-table" style="margin-top:.5rem;">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Rating</th>
              <th>Importar</th>
            </tr>
          </thead>
          <tbody>
            ${productos.map(p => `
              <tr>
                <td style="font-weight:500;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${p.title}">
                  ${p.title.slice(0, 40)}${p.title.length > 40 ? '…' : ''}
                </td>
                <td style="color:var(--muted);font-size:.82rem;">${p.category}</td>
                <td style="color:var(--warning);font-weight:500;">$${parseFloat(p.price).toFixed(2)}</td>
                <td style="color:var(--muted);font-size:.82rem;">⭐ ${p.rating?.rate ?? '—'}</td>
                <td>
                  <button class="btn-import"
                    onclick="API.importar(${JSON.stringify(p).split('"').join("'")})">
                    + Importar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="font-size:.72rem;color:var(--muted);margin-top:.75rem;">
          JSON de FakeStore API | ${productos.length} productos | Al importar se agregan a tu inventario.
        </p>
      </div>
    `;
  }

  function importar(prod) {
    Productos.importarExterno(prod);
    Dashboard.update();
  }

  return {
    getLocation,
    fetchWeather,
    fetchProductosExternos,
    importar
  };

})();