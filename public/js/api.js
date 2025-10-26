const API_BASE = window.API_BASE || '';

async function parseJSONSafe(res) {
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return JSON.parse(text); } catch {}
  }
  console.warn('[API] Respuesta no JSON:', res.status, text.slice(0, 200));
  return null;
}

export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params);
  const url = `${API_BASE}/api/products${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error al listar productos (${res.status})`);
  return res.json();
}

function getCartId() { return localStorage.getItem('cartId'); }
function setCartId(id) { localStorage.setItem('cartId', id); }

export async function createCart() {
  const res = await fetch(`${API_BASE}/api/carts`, { method: 'POST' });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`No se pudo crear el carrito (${res.status}) ${txt.slice(0,120)}`);
  }
  const body = await parseJSONSafe(res);
  if (!body) throw new Error('Respuesta de /api/carts no es JSON');
  const id = body._id || body.id || body?.cart?._id || body?.cart?.id;
  if (!id) throw new Error('La respuesta de /api/carts no contiene un id');
  setCartId(id);
  return id;
}

export async function ensureCart() {
  let id = getCartId();
  if (!id) return await createCart();

  const res = await fetch(`${API_BASE}/api/carts/${id}`);
  if (res.status === 404 || !res.ok) return await createCart();
  return id;
}

export async function addToCart(productId, qty = 1) {
  let id = await ensureCart();
  let res = await fetch(`${API_BASE}/api/carts/${id}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, qty }),
  });
  if (res.status === 404) {
    id = await createCart();
    res = await fetch(`${API_BASE}/api/carts/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty }),
    });
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`No se pudo agregar al carrito (${res.status}) ${txt.slice(0,120)}`);
  }
  return res.json();
}

export async function getCart() {
  const id = await ensureCart();
  const res = await fetch(`${API_BASE}/api/carts/${id}`);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`No se pudo obtener el carrito (${res.status}) ${txt.slice(0,120)}`);
  }
  return res.json();
}

export async function setItemQty(productId, qty) {
  const id = await ensureCart();
  const res = await fetch(`${API_BASE}/api/carts/${id}/items/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qty }),
  });
  if (!res.ok) throw new Error(`No se pudo actualizar (${res.status})`);
  return res.json();
}

export async function removeItem(productId) {
  const id = await ensureCart();
  const res = await fetch(`${API_BASE}/api/carts/${id}/items/${productId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`No se pudo borrar (${res.status})`);
  return res.json();
}

export function getStoredCartId() { return localStorage.getItem('cartId'); }
