# 🧰 Herramienta del Sur — E-commerce full stack (Node.js + MongoDB)

Aplicación de e-commerce con foco en el backend: catálogo de productos, carritos, usuarios con registro y login, y permisos por rol. Desarrollada como proyecto final del curso de Programación Backend de Coderhouse.

> Demo: _[link pendiente de publicación]_

## Qué hace

- **API REST de productos**: listado con filtros, paginación y ordenamiento (`mongoose-paginate-v2`).
- **API REST de carritos**: crear carrito, agregar, actualizar y quitar productos, y vaciarlo.
- **Usuarios y sesiones**: registro, login y logout con Passport (estrategias local y JWT), contraseñas encriptadas con bcrypt y token en cookie.
- **Usuario actual** (`/api/sessions/current`) devuelto con un DTO, sin exponer datos sensibles.
- **Middleware de autorización por roles**, listo para proteger las rutas que lo requieran.
- **Vistas con Handlebars** para el catálogo y el carrito.
- **Scripts de carga** de datos de ejemplo y asignación de imágenes, y endpoint de salud (`/healthz`).

## Tecnologías

| Área | Herramientas |
| --- | --- |
| Backend | Node.js, Express (ES Modules) |
| Base de datos | MongoDB Atlas con Mongoose |
| Autenticación | Passport (local y JWT), jsonwebtoken, bcrypt, cookie-parser |
| Vistas | Express-Handlebars |

## Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/products` | Lista con filtros, paginación y orden |
| GET | `/api/carts/:cid` | Ver un carrito |
| PUT / DELETE | `/api/carts/:cid` | Reemplazar o vaciar el carrito |
| PUT / DELETE | `/api/carts/:cid/products/:pid` | Actualizar o quitar un producto del carrito |
| POST | `/api/sessions/register` | Registro de usuario |
| POST | `/api/sessions/login` | Inicio de sesión (devuelve el token en cookie) |
| POST | `/api/sessions/logout` | Cerrar sesión |
| GET | `/api/sessions/current` | Usuario logueado |

## Cómo correrlo

1. Instalá las dependencias:

   ```bash
   npm install
   ```

2. Copiá `.env.example` como `.env` y completá tu cadena de conexión de MongoDB Atlas y un `JWT_SECRET`.
3. Cargá datos de ejemplo (opcional) e iniciá el servidor:

   ```bash
   npm run seed
   npm run dev
   ```

El servidor queda en `http://localhost:4000`.

## Estructura

```
├── app.js              # servidor Express y conexión a MongoDB
├── controllers/        # lógica de productos y carritos
├── models/             # modelos de Mongoose
├── scripts/            # carga de datos y utilidades
└── src/
    ├── config/         # Passport
    ├── middlewares/    # autorización por roles
    ├── routes/         # products, carts, sessions
    ├── managers/       # acceso a datos
    └── utils/          # hash de contraseñas
```

---

Desarrollado por **Hernán Arana** · [LuSan PRO](#) — SAP HANA · Data Science · Web · Marketing digital
