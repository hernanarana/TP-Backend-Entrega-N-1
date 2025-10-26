// src/public/js/products-page.js
import { addToCartLocal } from '/js/app.js';

const grid = document.getElementById('productos-grid');
const errorBox = document.getElementById('products-error');
const pager = document.getElementById('pager');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let state = { limit: 12, page: 1, sort: '', q: '' };

function money(v){ return Number(v||0).toLocaleString('es-AR',{style:'currency',currency:'ARS'}); }

async function fetchProducts(params) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`/api/products?${qs}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json(); // { status, payload, totalPages, ... }
}

function cardTemplate(p) {
  const thumb = p.thumbnail
    ? `<img src="${p.thumbnail}" alt="${p.title}">`
    : '<div class="noimg">Sin imagen</div>';
  return `
    <article class="product-card">
      <div class="thumb">${thumb}</div>
      <div class="product-card-content">
        <h3>${p.title}</h3>
        <p>${p.description || ''}</p>
        <div class="meta">
          <span class="price">${money(p.price)}</span>
          <span class="muted">${p.category || '-'}</span>
          <span class="muted">Stock: ${p.stock ?? '-'}</span>
        </div>
        <button class="add-cart"
          data-id="${p._id}"
          data-title="${p.title}"
          data-price="${p.price || 0}"
          data-thumb="${p.thumbnail || ''}"
        >Agregar al carrito</button>
      </div>
    </article>
  `;
}

async function render() {
  errorBox.textContent = '';
  grid.innerHTML = 'Cargando...';
  try {
    const data = await fetchProducts(state);
    const items = data.payload || [];
    if (!items.length) {
      grid.innerHTML = '<p>No se encontraron productos.</p>';
    } else {
      grid.innerHTML = items.map(cardTemplate).join('');
      grid.querySelectorAll('.add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
          addToCartLocal({
            _id: btn.dataset.id,
            title: btn.dataset.title,
            price: Number(btn.dataset.price || 0),
            thumbnail: btn.dataset.thumb || null,
            qty: 1,
          });
          btn.textContent = 'Agregado ✓';
          btn.disabled = true;
          setTimeout(() => { btn.textContent = 'Agregar al carrito'; btn.disabled = false; }, 900);
        });
      });
    }

    // pager
    pager.hidden = !(data.hasPrevPage || data.hasNextPage);
    pageInfo.textContent = `Página ${data.page} de ${data.totalPages}`;
    prevBtn.disabled = !data.hasPrevPage;
    nextBtn.disabled = !data.hasNextPage;

    prevBtn.onclick = () => { state.page = data.page - 1; render(); };
    nextBtn.onclick = () => { state.page = data.page + 1; render(); };

    // actualizar URL (sin recargar)
    const u = new URL(location.href);
    u.search = new URLSearchParams(state).toString();
    history.replaceState({}, '', u);

  } catch (e) {
    grid.innerHTML = '';
    errorBox.textContent = e.message;
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // leer estado inicial desde la URL
  const url = new URL(location.href);
  state.sort = url.searchParams.get('sort') || '';
  state.q    = url.searchParams.get('q') || '';
  state.page = Number(url.searchParams.get('page') || 1);

  document.getElementById('ordenar').value = state.sort;
  document.getElementById('buscar').value  = state.q;

  document.getElementById('filtrar').addEventListener('click', () => {
    state.sort = document.getElementById('ordenar').value || '';
    state.q    = document.getElementById('buscar').value.trim();
    state.page = 1;
    render();
  });

  render();
});
