/* src/public/js/app.js */
console.log("✅ Frontend conectado correctamente");

const LS_CART_KEY = "cartId";

/* ----------------------------- helpers UI ----------------------------- */
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function updateCartCount(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = String(count ?? 0);
}

function setCartLink(cid) {
  const cartLink = $(".nav-cart-link");
  if (cartLink && cid) cartLink.href = `/carrito?cid=${cid}`;
}

function toast(msg, type = "ok") {
  console[type === "error" ? "warn" : "log"](`🛈 ${msg}`);
}

/* --------------------------- cart API helpers -------------------------- */
async function createCart() {
  const res = await fetch("/api/carts", { method: "POST" });
  if (!res.ok) throw new Error(`POST /api/carts -> ${res.status}`);
  const json = await res.json();
  if (json?.payload?._id) return json.payload;
  throw new Error("Respuesta inesperada creando carrito");
}

async function getCart(cid) {
  const res = await fetch(`/api/carts/${cid}`);
  if (res.status === 404) return null; // no existe
  if (!res.ok) throw new Error(`GET /api/carts/${cid} -> ${res.status}`);
  const json = await res.json();
  return json?.payload ?? null;
}

async function addToCart(cid, pid, qty = 1) {
  const res = await fetch(`/api/carts/${cid}/product/${pid}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: qty }),
  });
  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(json.error || "No se pudo agregar al carrito");
  }
  return json.payload; // carrito actualizado
}

/* ------------------------------ init flow ------------------------------ */
async function getOrCreateCart() {
  let cid = localStorage.getItem(LS_CART_KEY);

  // 1) si había uno guardado, validar que exista
  if (cid) {
    try {
      const existing = await getCart(cid);
      if (existing) return existing;
      // si no existe en DB, lo limpio
      localStorage.removeItem(LS_CART_KEY);
    } catch (err) {
      console.warn("⚠️ No se pudo validar carrito existente:", err.message);
      // sigue el flujo y creamos uno nuevo
    }
  }

  // 2) crear uno nuevo
  const cart = await createCart();
  localStorage.setItem(LS_CART_KEY, cart._id);
  console.log("🛒 Carrito listo:", cart._id);
  return cart;
}

/* ---------------------------- wire up events --------------------------- */
async function initShop() {
  try {
    const cart = await getOrCreateCart();
    const cid = cart._id;
    setCartLink(cid);
    updateCartCount(cart.products?.length || 0);

    // Delegación para todos los botones de "Agregar al carrito"
    $all(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const pid = btn.dataset.pid;
        if (!pid) return;

        btn.disabled = true;
        btn.dataset.prev = btn.textContent;
        btn.textContent = "Agregando…";

        try {
          const updatedCart = await addToCart(cid, pid, 1);
          updateCartCount(updatedCart.products?.length || 0);
          toast("Producto agregado ✅");
        } catch (err) {
          toast(`No se pudo agregar: ${err.message}`, "error");
        } finally {
          btn.textContent = btn.dataset.prev || "Agregar al carrito 🛒";
          btn.disabled = false;
        }
      });
    });
  } catch (err) {
    console.error("❌ Error inicializando shop:", err);
    toast("Error inicializando la tienda. Reintentá recargar.", "error");
  }
}

/* ------------------------------ bootstrap ------------------------------ */
document.addEventListener("DOMContentLoaded", initShop);
