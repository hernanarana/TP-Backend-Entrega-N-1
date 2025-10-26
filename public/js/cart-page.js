// src/public/js/cart-page.js
import { getCart, setCart, clearCart, renderCartBadge } from '/js/app.js';

const list   = document.getElementById('cart-list');
const empty  = document.getElementById('cart-empty');
const sumBox = document.getElementById('cart-summary');
const itemsCountEl = document.getElementById('cart-items-count');
const totalEl = document.getElementById('cart-total');

function money(v){ return Number(v||0).toLocaleString('es-AR',{style:'currency',currency:'ARS'}); }

// ---- TOAST ----
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}

function render() {
  const items = getCart();

  if (!items.length) {
    empty.style.display = '';
    sumBox.style.display = 'none';
    list.innerHTML = '';
    renderCartBadge();
    return;
  }

  empty.style.display = 'none';
  sumBox.style.display = '';

  list.innerHTML = items.map((it, idx) => `
    <li class="cart-row" data-idx="${idx}">
      <img src="${it.thumbnail || '/img/amoladora_1.jpg'}" alt="${it.title}">
      <div class="cart-info">
        <div class="title">${it.title}</div>
        <div class="muted">${money(it.price)} c/u</div>
      </div>
      <div class="qty-ctrl">
        <button class="btn-dec">−</button>
        <span class="qty">${it.qty || 1}</span>
        <button class="btn-inc">+</button>
      </div>
      <div class="subtotal">${money((it.qty||1)*(it.price||0))}</div>
      <button class="btn-del">Eliminar</button>
    </li>
  `).join('');

  list.querySelectorAll('.cart-row').forEach(row => {
    const idx = Number(row.dataset.idx);
    row.querySelector('.btn-inc').onclick = () => {
      const items = getCart(); items[idx].qty = (items[idx].qty||1)+1; setCart(items); render();
    };
    row.querySelector('.btn-dec').onclick = () => {
      const items = getCart(); items[idx].qty = Math.max(1,(items[idx].qty||1)-1); setCart(items); render();
    };
    row.querySelector('.btn-del').onclick = () => {
      const items = getCart(); items.splice(idx,1); setCart(items); render();
      toast('Producto eliminado');
    };
  });

  const totalQty = items.reduce((a, it) => a + (it.qty || 1), 0);
  const total    = items.reduce((a, it) => a + (it.qty || 1) * (it.price || 0), 0);
  itemsCountEl.textContent = totalQty;
  totalEl.textContent = money(total);
  renderCartBadge();
}

document.addEventListener('DOMContentLoaded', () => {
  render();

  document.getElementById('cart-clear').onclick = () => {
    clearCart();
    render();
    toast('Carrito vaciado');
  };

  document.getElementById('cart-checkout').onclick = () => {
    clearCart();
    render();
    toast('¡Compra realizada! 🎉');
  };
});
