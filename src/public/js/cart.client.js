function $(s, r=document){ return r.querySelector(s); }
function $all(s, r=document){ return [...r.querySelectorAll(s)]; }
function toast(m,t="ok"){ console[t==="error"?"warn":"log"]("🛈 "+m); }
function getCID(){ const u=new URL(location.href); return u.searchParams.get("cid")||localStorage.getItem("cartId"); }
async function j(url,opts){ const r=await fetch(url,opts); const d=await r.json().catch(()=>null); return {ok:r.ok,status:r.status,data:d}; }

async function loadCart(){
  const cid=getCID(), root=$("#cart-root");
  if(!cid){ root.innerHTML=`<p class="empty">No hay carrito. Volvé a <a href="/productos">Productos</a>.</p>`; return; }

  const {ok,data}=await j(`/api/carts/${cid}`);
  if(!ok||!data?.payload){ root.innerHTML=`<p class="empty">Carrito no encontrado.</p>`; return; }
  const cart=data.payload;
  if(!cart.products?.length){ root.innerHTML=`<p class="empty">Tu carrito está vacío. <a href="/productos">Explorá productos</a>.</p>`; return; }

  let total=0;
  const rows=cart.products.map(({product,quantity})=>{
    const price=product?.price??0; total+=price*quantity;
    const img=(product?.thumbnail||product?.thumbnails?.[0])?`/img/${product.thumbnail||product.thumbnails[0]}`:"";
    return `<li class="cart-item" data-pid="${product._id}">
      ${img?`<img src="${img}" alt="${product.title}">`:`<div style="width:64px;height:64px;background:#0b1220;border-radius:8px;display:grid;place-items:center;color:#94a3b8;">No img</div>`}
      <div><div><strong>${product.title}</strong></div><div>${new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(price)}</div></div>
      <div class="qty">
        <button class="dec">-</button><span class="q">${quantity}</span><button class="inc">+</button>
        <button class="rm">x</button>
      </div>
    </li>`;
  }).join("");

  root.innerHTML=`<ul class="cart-list">${rows}</ul>
  <div class="summary">
    <div><strong>Total:</strong> ${new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(total)}</div>
    <div><button id="btn-empty">Vaciar carrito</button> <button id="btn-checkout" disabled>Finalizar compra</button></div>
  </div>`;

  $("#btn-empty").addEventListener("click", async ()=>{
    const {ok}=await j(`/api/carts/${cid}`,{method:"DELETE"});
    if(ok){ toast("Carrito vaciado"); location.reload(); } else toast("No se pudo vaciar","error");
  });

  $all(".cart-item").forEach(li=>{
    const pid=li.dataset.pid;
    li.querySelector(".inc").addEventListener("click",()=>change(pid,+1));
    li.querySelector(".dec").addEventListener("click",()=>change(pid,-1));
    li.querySelector(".rm").addEventListener("click",async ()=>{
      const {ok}=await j(`/api/carts/${cid}/product/${pid}`,{method:"DELETE"});
      if(ok){ toast("Eliminado"); location.reload(); } else toast("No se pudo eliminar","error");
    });
  });

  async function change(pid,delta){
    const qEl=$(`.cart-item[data-pid="${pid}"] .q`);
    const next=Math.max(1,(+qEl.textContent||1)+delta);
    const {ok}=await j(`/api/carts/${cid}/product/${pid}`,{
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({quantity:next})
    });
    if(ok){ toast("Cantidad actualizada"); location.reload(); } else toast("No se pudo actualizar","error");
  }
}
document.addEventListener("DOMContentLoaded", loadCart);
