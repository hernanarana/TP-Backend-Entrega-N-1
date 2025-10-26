/* src/public/js/cart.client.js */
console.log("🛒 cart.client.js cargado");

const LS_CART_KEY = "cartId";
const $ = (sel, root = document) => root.querySelector(sel);

const getCID = () => {
  const q = new URLSearchParams(location.search);
  return q.get("cid") || localStorage.getItem(LS_CART_KEY);
};

const sumQty = (cart) =>
  Array.isArray(cart?.products)
    ? cart.products.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)
    : 0;

const money = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
    Number(n) || 0
  );

async function apiGetCart(cid) {
  const res = await fetch(`/api/carts/${cid}`);
  if (!res.ok) throw new Error(`GET /api/carts/${cid} -> ${res.status}`);
  const json = await res.json();
  return json.payload;
}

async function apiSetQty(cid, pid, qty) {
  const res = await fetch(`/api/carts/${cid}/product/${pid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: qty }),
  });
  const json = await res.json();
  if (json.status !== "success") throw new Error(json.error || "No se pudo actualizar");
  return json.payload;
}

async function apiRemoveItem(cid, pid) {
  const res = await fetch(`/api/carts/${cid}/product/${pid}`, { method: "DELETE" });
  const json = await res.json();
  if (json.status !== "success") throw new Error(json.error || "No se pudo eliminar");
  return json.payload;
}

async function apiClearCart(cid) {
  const res = await fetch(`/api/carts/${cid}`, { method: "DELETE" });
  const json = await res.json();
  if (json.status !== "success") throw new Error(json.error || "No se pudo vaciar");
  return json.payload;
}

function render(cart) {
  const root = $("#cart-root");
  if (!root) return;

  if (!cart?.products?.length) {
    root.innerHTML = `<p class="empty">Tu carrito está vacío.</p>`;
    const badge = document.querySelector("#cart-count");
    if (badge) badge.textContent = "0";
    return;
  }

  const itemsHTML = cart.products
    .map((it) => {
      const p = it.product || {};
      const thumb = p.thumbnail || (p.thumbnails && p.thumbnails[0]);
      return `
      <li class="cart-item" data-pid="${p._id}">
        <img src="${thumb ? "/img/" + thumb : "data:image/gif;base64,R0lGODlhAQABAAAAACw="}" alt="">
        <div>
          <div><strong>${p.title || "Producto"}</strong></div>
          <div>${money(p.price)} · x <span class="q">${it.quantity}</span></div>
        </div>
        <div class="qty">
          <button class="dec">-</button>
          <button class="inc">+</button>
          <button class="rm">Eliminar</button>
        </div>
      </li>`;
    })
    .join("");

  const total = cart.products.reduce(
    (acc, it) => acc + (Number(it?.product?.price) || 0) * (Number(it.quantity) || 0),
    0
  );

  root.innerHTML = `
    <ul class="cart-list">${itemsHTML}</ul>
    <div class="summary">
      <div><strong>Total:</strong> ${money(total)} — <span id="cart-count-inline">${sumQty(cart)}</span> ítem(s)</div>
      <div>
        <button id="clear-cart" class="rm">Vaciar carrito</button>
      </div>
    </div>
  `;

  // actualizar badge del header
  const badge = document.querySelector("#cart-count");
  if (badge) badge.textContent = String(sumQty(cart));

  // wire events
  root.querySelectorAll(".cart-item").forEach((li) => {
    const pid = li.dataset.pid;
    const qSpan = li.querySelector(".q");

    li.querySelector(".inc").addEventListener("click", async () => {
      const newCart = await apiSetQty(cart._id, pid, (Number(qSpan.textContent) || 0) + 1);
      render(newCart);
    });

    li.querySelector(".dec").addEventListener("click", async () => {
      const current = Number(qSpan.textContent) || 0;
      if (current <= 1) return; // no bajamos de 1
      const newCart = await apiSetQty(cart._id, pid, current - 1);
      render(newCart);
    });

    li.querySelector(".rm").addEventListener("click", async () => {
      const newCart = await apiRemoveItem(cart._id, pid);
      render(newCart);
    });
  });

  $("#clear-cart")?.addEventListener("click", async () => {
    const newCart = await apiClearCart(cart._id);
    render(newCart);
  });
}

async function initCartPage() {
  try {
    const cid = getCID();
    if (!cid) {
      $("#cart-root").innerHTML = `<p class="empty">Aún no creaste un carrito.</p>`;
      return;
    }
    const cart = await apiGetCart(cid);
    render(cart);
  } catch (e) {
    console.error("❌ No se pudo cargar el carrito:", e);
    $("#cart-root").innerHTML = `<p class="empty">No se pudo cargar el carrito.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", initCartPage);
