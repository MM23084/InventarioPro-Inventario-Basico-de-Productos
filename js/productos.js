const Productos = (() => {

  let _productos = [];
  let _editId    = null;

  // ── Init ──────────────────────────────────────────────────

  function init() {
    _productos = Storage.loadProductos();
    // Si no hay datos, cargar demo
    if (_productos.length === 0) _cargarDemo();
  }

  function _cargarDemo() {
    _productos = [
      { id: '1', codigo: 'ELEC-001', nombre: 'Laptop HP 15"',         categoria: 'Electrónica', descripcion: 'Laptop para uso general',    precio: 599.99, stock: 12, stockMin: 3,  proveedor: 'HP Inc.',      creadoEn: new Date().toISOString() },
      { id: '2', codigo: 'ELEC-002', nombre: 'Mouse Inalámbrico',     categoria: 'Electrónica', descripcion: 'Mouse ergonómico 2.4GHz',    precio: 25.00,  stock: 45, stockMin: 10, proveedor: 'Logitech',     creadoEn: new Date().toISOString() },
      { id: '3', codigo: 'ROPA-001', nombre: 'Camiseta Algodón M',    categoria: 'Ropa',        descripcion: 'Camiseta 100% algodón',      precio: 12.50,  stock: 3,  stockMin: 10, proveedor: 'TextilSA',     creadoEn: new Date().toISOString() },
      { id: '4', codigo: 'ALIM-001', nombre: 'Aceite de Oliva 1L',    categoria: 'Alimentos',   descripcion: 'Aceite extra virgen',        precio: 8.75,   stock: 0,  stockMin: 5,  proveedor: 'AlimenCorp',   creadoEn: new Date().toISOString() },
      { id: '5', codigo: 'HOGA-001', nombre: 'Silla de Oficina',      categoria: 'Hogar',       descripcion: 'Silla ergonómica giratoria', precio: 189.00, stock: 7,  stockMin: 2,  proveedor: 'MueblePro',    creadoEn: new Date().toISOString() },
      { id: '6', codigo: 'DEPO-001', nombre: 'Balón de Fútbol #5',    categoria: 'Deportes',    descripcion: 'Balón oficial FIFA',         precio: 35.00,  stock: 2,  stockMin: 5,  proveedor: 'SportMax',     creadoEn: new Date().toISOString() },
    ];
    Storage.saveProductos(_productos);
  }

  // ── Helpers ───────────────────────────────────────────────

  function _escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
  }

  function _getEstado(p) {
    if (p.stock === 0) return 'agotado';
    if (p.stock <= p.stockMin) return 'bajo stock';
    return 'disponible';
  }

  function _estadoBadge(estado) {
    const map = {
      'disponible': 'badge-disponible',
      'agotado':    'badge-agotado',
      'bajo stock': 'badge-bajstock'
    };
    return map[estado] || '';
  }

  // ── Validación ────────────────────────────────────────────

  function _clearErrors() {
    document.querySelectorAll('.error-msg').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.form-group input, .form-group select')
      .forEach(el => el.style.borderColor = '');
  }

  function _showError(fieldId, errId) {
    document.getElementById(errId).style.display = 'block';
    document.getElementById(fieldId).style.borderColor = 'var(--danger)';
  }

  function _validate() {
    let ok = true;
    _clearErrors();

    const codigo   = document.getElementById('f-codigo').value.trim();
    const nombre   = document.getElementById('f-nombre').value.trim();
    const cat      = document.getElementById('f-categoria').value;
    const precio   = parseFloat(document.getElementById('f-precio').value);
    const stock    = parseInt(document.getElementById('f-stock').value);

    if (!codigo || codigo.length < 3)       { _showError('f-codigo',    'err-codigo');    ok = false; }
    if (!nombre || nombre.length < 3)       { _showError('f-nombre',    'err-nombre');    ok = false; }
    if (!cat)                               { _showError('f-categoria', 'err-categoria'); ok = false; }
    if (isNaN(precio) || precio <= 0)       { _showError('f-precio',    'err-precio');    ok = false; }
    if (isNaN(stock)  || stock < 0)         { _showError('f-stock',     'err-stock');     ok = false; }

    // Verificar código duplicado (al crear)
    if (!_editId && ok) {
      const existe = _productos.some(p => p.codigo.toLowerCase() === codigo.toLowerCase());
      if (existe) {
        document.getElementById('err-codigo').textContent = 'Este código ya existe';
        _showError('f-codigo', 'err-codigo');
        ok = false;
      }
    }

    return ok;
  }

  // ── Modal ─────────────────────────────────────────────────

  function openModal(id = null) {
    _editId = id;
    _clearErrors();
    document.getElementById('modal-title').textContent = id ? 'Editar producto' : 'Nuevo producto';

    if (id) {
      const p = _productos.find(p => p.id === id);
      if (!p) return;
      document.getElementById('f-codigo').value     = p.codigo;
      document.getElementById('f-nombre').value     = p.nombre;
      document.getElementById('f-descripcion').value = p.descripcion || '';
      document.getElementById('f-categoria').value  = p.categoria;
      document.getElementById('f-precio').value     = p.precio;
      document.getElementById('f-stock').value      = p.stock;
      document.getElementById('f-stock-min').value  = p.stockMin || 5;
      document.getElementById('f-proveedor').value  = p.proveedor || '';
    } else {
      document.getElementById('f-codigo').value     = '';
      document.getElementById('f-nombre').value     = '';
      document.getElementById('f-descripcion').value = '';
      document.getElementById('f-categoria').value  = '';
      document.getElementById('f-precio').value     = '';
      document.getElementById('f-stock').value      = '';
      document.getElementById('f-stock-min').value  = '5';
      document.getElementById('f-proveedor').value  = '';
    }

    document.getElementById('modal').classList.add('open');
    Storage.logSession('Abrió modal: ' + (id ? 'editar' : 'nuevo'));
  }

  function closeModal() {
    document.getElementById('modal').classList.remove('open');
    _clearErrors();
    _editId = null;
  }

  // ── Guardar ───────────────────────────────────────────────

  function guardar() {
    if (!_validate()) return;

    try {
      const producto = {
        id:          _editId || Date.now().toString(),
        codigo:      document.getElementById('f-codigo').value.trim().toUpperCase(),
        nombre:      document.getElementById('f-nombre').value.trim(),
        descripcion: document.getElementById('f-descripcion').value.trim(),
        categoria:   document.getElementById('f-categoria').value,
        precio:      parseFloat(parseFloat(document.getElementById('f-precio').value).toFixed(2)),
        stock:       parseInt(document.getElementById('f-stock').value),
        stockMin:    parseInt(document.getElementById('f-stock-min').value) || 5,
        proveedor:   document.getElementById('f-proveedor').value.trim(),
        creadoEn:    _editId
          ? (_productos.find(p => p.id === _editId)?.creadoEn || new Date().toISOString())
          : new Date().toISOString()
      };

      if (_editId) {
        _productos = _productos.map(p => p.id === _editId ? producto : p);
        UI.showToast('Producto actualizado', 'success');
        Storage.logSession('Editó producto: ' + producto.nombre);
      } else {
        _productos.push(producto);
        UI.showToast('Producto agregado al inventario', 'success');
        Storage.logSession('Agregó producto: ' + producto.nombre);
      }

      Storage.saveProductos(_productos);
      closeModal();
      renderTabla();

    } catch (e) {
      UI.showToast('Error al guardar: ' + e.message, 'danger');
      console.error('[Productos] guardar:', e);
    }
  }

  // ── Eliminar ──────────────────────────────────────────────

  function eliminar(id) {
    try {
      const p = _productos.find(p => p.id === id);
      if (!p) throw new Error('Producto no encontrado');
      if (!confirm(`¿Eliminar "${p.nombre}" (${p.codigo})?\nEsta acción no se puede deshacer.`)) return;

      _productos = _productos.filter(p => p.id !== id);
      Storage.saveProductos(_productos);
      renderTabla();
      UI.showToast('Producto eliminado', 'danger');
      Storage.logSession('Eliminó producto: ' + p.nombre);
    } catch (e) {
      UI.showToast('Error al eliminar: ' + e.message, 'danger');
      console.error('[Productos] eliminar:', e);
    }
  }

  // ── Importar desde API externa de fakestore ────────────────────────────

  function importarExterno(prod) {
    try {
      const codigo = 'EXT-' + Date.now().toString().slice(-4);
      const nuevo  = {
        id:          Date.now().toString(),
        codigo:      codigo,
        nombre:      prod.title.slice(0, 60),
        descripcion: prod.description?.slice(0, 120) || '',
        categoria:   'Otro',
        precio:      parseFloat(prod.price) || 0,
        stock:       10,
        stockMin:    3,
        proveedor:   'FakeStore API',
        creadoEn:    new Date().toISOString()
      };
      _productos.push(nuevo);
      Storage.saveProductos(_productos);
      renderTabla();
      UI.showToast('Producto importado: ' + nuevo.nombre, 'success');
      Storage.logSession('Importó producto externo: ' + nuevo.nombre);
    } catch (e) {
      UI.showToast('Error al importar: ' + e.message, 'danger');
    }
  }

  // ── Aca se renderiza la tabla para una mejor vista ──────────────────────────────────────

  function renderTabla() {
    const search  = document.getElementById('search-input').value.toLowerCase();
    const fCat    = document.getElementById('filter-cat').value;
    const fEstado = document.getElementById('filter-estado').value;

    const filtrados = _productos.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(search) ||
                          p.codigo.toLowerCase().includes(search);
      const matchCat    = !fCat    || p.categoria === fCat;
      const matchEstado = !fEstado || _getEstado(p) === fEstado;
      return matchSearch && matchCat && matchEstado;
    });

    const tbody = document.getElementById('prod-tbody');

    if (filtrados.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">
        <div class="empty-state">
          ${_productos.length === 0
            ? '¡Sin productos! Agrega el primero con "+ Nuevo producto".'
            : 'No hay productos con esos filtros.'}
        </div></td></tr>`;
      return;
    }

    tbody.innerHTML = filtrados.map(p => {
      const estado     = _getEstado(p);
      const estadoCls  = _estadoBadge(estado);
      const catCls     = 'badge-' + p.categoria;
      const stockColor = estado === 'agotado'    ? 'color:var(--danger);font-weight:600;'
                       : estado === 'bajo stock' ? 'color:var(--warning);font-weight:600;'
                       : 'color:var(--success);';
      return `
        <tr>
          <td style="font-family:monospace;font-size:.8rem;color:var(--muted);">${_escHtml(p.codigo)}</td>
          <td style="font-weight:500;">${_escHtml(p.nombre)}</td>
          <td><span class="badge ${catCls}">${_escHtml(p.categoria)}</span></td>
          <td style="color:var(--warning);font-weight:500;">$${p.precio.toFixed(2)}</td>
          <td style="${stockColor}">${p.stock} uds.</td>
          <td><span class="badge ${estadoCls}">${estado}</span></td>
          <td>
            <div class="prod-actions">
              <button class="btn-edit" onclick="Productos.openModal('${p.id}')">Editar</button>
              <button class="btn-del"  onclick="Productos.eliminar('${p.id}')">Eliminar</button>
            </div>
          </td>
        </tr>`;
    }).join('');

    if (search) Storage.logSession('Buscó: "' + search + '"');
  }

  function getAll() { return [..._productos]; }

  return {
    init, openModal, closeModal, guardar,
    eliminar, importarExterno, renderTabla, getAll
  };

})();
