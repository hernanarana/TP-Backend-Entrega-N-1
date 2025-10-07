// app.js (raíz del proyecto)
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

// Routers (según tu /src/routes)
import productsRouter from "./src/routes/products.router.js";
import cartsRouter from "./src/routes/carts.router.js"; // si aún no lo usás, igual puede quedar montado

// __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App & servidor HTTP + Socket.IO
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

// ============ Handlebars ============
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "src", "views", "layouts"),
    partialsDir: path.join(__dirname, "src", "views", "partials"),
    helpers: {
      eq: (a, b) => a === b,
      currency: (v) =>
        new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(v),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src", "views"));

// ============ Middlewares ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Estáticos: prioriza /public (raíz). Si querés también /src/public, dejé ambas líneas.
app.use(express.static(path.join(__dirname, "public")));      // /public/js, /public/css, etc.
app.use(express.static(path.join(__dirname, "src", "public"))); // opcional: /src/public/...

// ============ Rutas base ============
app.get("/", (_req, res) => {
  res.render("home", {
    title: "Herramienta del Sur — Inicio",
    page: "home",
    year: new Date().getFullYear(),
  });
});

// Montaje de routers (¡esto es lo clave!)
app.use("/", productsRouter); // /productos, /producto/:slug, /carrito, /api/products...
app.use("/", cartsRouter);    // /api/carts o lo que tengas definido ahí

// Salud simple (útil para probar que levanta)
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// ============ Socket.IO (placeholder) ============
io.on("connection", (socket) => {
  // Podés dejar hooks para realtime (stock, notificaciones, etc.)
  // console.log("Cliente conectado", socket.id);
});

// ============ Start ============
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✅ Servidor listo:  http://localhost:${PORT}`);
});
