# InventarioPro – Inventario Básico de Productos

> Aplicación web 100% frontend para gestionar un inventario de productos.  
> Sin backend, sin base de datos externa. Todo corre en el navegador.

---

## 🚀 Características principales

- **Gestión simple de inventario:** alta, edición, búsqueda y eliminación de productos.
- **Persistencia de datos** usando `localStorage` y `sessionStorage` (no necesita servidores ni bases de datos externas).
- **Totalmente frontend:** solo JavaScript, HTML y CSS.
- **UI amigable y moderna**, responsive y fácil de usar.
- **Registro de actividad de sesión** (log para acciones recientes).
- **Filtros y búsqueda rápida** por categoría, estado, nombre, etc.
- **Soporte para importar productos demo** y restablecimiento fácil.
- **No requiere instalación:** funciona directamente abriendo el archivo `index.html`.

---


## 🧐 ¿Cómo funciona?

- Los productos y sus datos se guardan **en `localStorage`**: permanecen aunque cierres el navegador.
- Las **acciones de la sesión** y logs se registran en `sessionStorage`: se eliminan al cerrar la pestaña o navegador.
- Todos los procesos y datos corren **localmente en tu navegador**.

---

## ✨ ¿Por qué usar InventarioPro?

- Ideal para pequeños comercios, ferias, almacenes personales o demostraciones.
- Sin complicaciones de instalación ni backend.
- Visual, útil y portable: lleva tu inventario en un USB, Google Drive, Dropbox, etc.

---

## 🛠️ Instalación y uso

1. **Descarga o clona** este repositorio:
    ```bash
    git clone https://github.com/MM23084/InventarioPro-Inventario-Basico-de-Productos.git
    ```
2. **Abre `index.html` en tu navegador.**  
   (¡Y listo! No necesitas servidores ni instalar dependencias.)

---

## 📁 Estructura del proyecto

```
├── index.html
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── ui.js
│   └── ...
├── css/
│   └── styles.css
├── assets/
│   └── [imágenes y recursos]
└── README.md
```

---

## ⚙️ Tecnologías usadas

- JavaScript (ES6+)
- HTML5
- CSS3

---

## 🧑‍💻 Autor

- **Ricardo Antonio Mora Morales - MM23084**  
  [GitHub](https://github.com/MM23084)
- **Emerson Albert Ponce Angel**
- **Angel Josué Cardoza Gómez**
- **Jose Gilberto Zaldana Castaneda**     

---

## 📝 Licencia

Este proyecto está bajo Licencia MIT.

---

¡Cualquier mejora, sugerencia o feedback es bienvenida!
