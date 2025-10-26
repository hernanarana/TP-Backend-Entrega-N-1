// src/public/js/app.js
console.log('[Frontend] conectado ✅');

const CART_KEY = 'cartItems';

export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}
export function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items || []));
  renderCartBadge();
}
export function addToCartLocal(item) {
  const items = getCart();
  const i = items.findIndex(x => x._id === item._id);
  if (i >= 0) items[i].qty = (items[i].qty || 1) + (item.qty || 1);
  else items.push({ ...item, qty: item.qty || 1 });
  setCart(items);
}
export function clearCart() { setCart([]); }

export function renderCartBadge() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const total = getCart().reduce((a, it) => a + (it.qty || 1), 0);
  el.textContent = total;
}

document.addEventListener('DOMContentLoaded', renderCartBadge);
