// public/js/product-detail.js
import { addToCart, ensureCart } from './api.js';

const root = document.querySelector('#pd-root');
const money = v => Number(v||0).toLocaleString('es-AR',{style:'currency',currency:'ARS'});

async function load(){
  try{
    const id = window.PRODUCT_ID;
    const res = await fetch(`/api/products/${id}`);
    if(!res.ok){ root.textContent = 'Producto no encontrado'; return; }
    const p = await res.json();

    root.innerHTML = `
      <div style="display:grid;grid-template-columns:320px 1fr;gap:20px;align-items:start;">
        <div style="width:320px;height:320px;background:#0b1220;border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;color:#9ca3af;">
          ${p.thumbnail ? `<img src="${p.thumbnail}" alt="${p.title}" style="max-width:100%;max-height:100%;object-fit:contain">` : 'Sin imagen'}
        </div>
        <div>
          <h1 style="margin:0 0 8px 0;">${p.title}</h1>
          <div style="color:#9ca3af">${p.description || ''}</div>
          <div style="margin:14px 0;font-size:20px;"><strong>${money(p.price)}</strong></div>
          <div style="color:#9ca3af;margin-bottom:10px;">Stock: ${p.stock ?? '-'}</div>
          <button id="btnAdd" class="btn btn-primary">Agregar al carrito</button>
        </div>
      </div>
    `;

    document.querySelector('#btnAdd')?.addEventListener('click', async ()=>{
      const btn = document.querySelector('#btnAdd');
      btn.disabled = true; const t = btn.textContent; btn.textContent = 'Agregando...';
      try{
        await ensureCart();
        await addToCart(p._id || p.id, 1);
        window.dispatchEvent(new CustomEvent('cart:updated'));
        btn.textContent = 'Agregado ✓';
      }catch{
        btn.textContent = 'Error';
      }finally{
        setTimeout(()=>{ btn.textContent = t; btn.disabled = false; }, 900);
      }
    });
  }catch(e){
    root.innerHTML = `<p class="error">${e.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', load);
