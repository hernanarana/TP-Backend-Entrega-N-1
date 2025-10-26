🧰 Herramienta del Sur — Proyecto Final Backend (Coderhouse)

## 📖 Descripción General
Herramienta del Sur es una aplicación **e-commerce full stack (orientada al backend)** desarrollada como entrega final del curso de **Programación Backend en Coderhouse**.  
El objetivo fue construir una arquitectura completa en **Node.js + Express + Handlebars + MongoDB Atlas**, aplicando los principios de diseño modular, persistencia en base de datos, manejo de rutas RESTful y vistas dinámicas.

Este proyecto refleja la implementación de un sistema de productos y carritos con operaciones CRUD completas, filtrado avanzado, paginación, ordenamiento, y persistencia mediante Mongoose.

---

## 🚀 Tecnologías Principales

| Categoría | Tecnologías |
|------------|--------------|
| Lenguaje | JavaScript (ES Modules) |
| Backend | Node.js + Express |
| Base de datos | MongoDB Atlas (Mongoose ODM) |
| Plantillas | Express-Handlebars |
| Estilos | CSS con variables y responsive design |
| Control de versiones | Git + GitHub |
| Deploy sugerido | Vercel (frontend) / Render (backend) |

---

## 📂 Estructura del Proyecto

├── src/
│ ├── routes/
│ │ ├── products.router.js
│ │ └── carts.router.js
│ ├── models/
│ │ ├── product.model.js
│ │ └── cart.model.js
│ ├── views/
│ │ ├── layouts/
│ │ │ └── main.handlebars
│ │ ├── products.handlebars
│ │ ├── cart.handlebars
│ │ └── home.handlebars
│ ├── public/
│ │ ├── css/styles.css
│ │ ├── js/
│ │ └── img/favicon.png
│ └── scripts/
│ ├── seed.js
│ ├── seed-extra.js
│ └── assign-thumbnails.js
├── app.js
├── .env
├── package.json
└── README.md
