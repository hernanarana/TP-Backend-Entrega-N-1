console.log("✅ Frontend conectado");

const LS_CART_KEY="cartId";
function $(s,r=document){return r.querySelector(s)}
function $all(s,r=document){return [...r.querySelectorAll(s)]}
function updateCartCount(c){ const b=$("#cart-count"); if(b) b.textContent=String(c??0); }
function setCartLink(cid){ const a=$(".nav-cart-link"); if(a && cid) a.href=`/carrito?cid=${cid}`; }
function toast(m,t="ok"){ console[t==="error"?"warn":"log"]("🛈 "+m); }

async function createCart(){ const r=await fetch("/api/carts",{method:"POST"}); if(!r.ok) throw new Error(r.status); const j=await r.json(); return j.payload; }
async function getCart(cid){ const r=await fetch(`/api/carts/${cid}`); if(r.status===404) return null; if(!r.ok) throw new Error(r.status); const j=await r.json(); return j.payload; }
async function addToCart(cid,pid,qty=1){
  const r=await fetch(`/api/carts/${cid}/product/${pid}`,{
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({quantity:qty})
  }); const j=await r.json(); if(j.status!=="success") throw new Error(j.error||"Error"); return j.payload;
}

async function getOrCreateCart(){
  let cid=localStorage.getItem(LS_CART_KEY);
  if(cid){ try{ const c=await getCart(cid); if(c) return c; localStorage.removeItem(LS_CART_KEY);}catch{} }
  const cart=await createCart(); localStorage.setItem(LS_CART_KEY,cart._id); return cart;
}

async function initNav(){
  try{
    const cart=await getOrCreateCart();
    setCartLink(cart._id);
    updateCartCount(cart.products?.length||0);
  }catch(e){ console.warn("No se pudo inicializar carrito:",e.message); }
}

async function initShop(){
  await initNav();
  const cid=localStorage.getItem(LS_CART_KEY);
  $all(".add-to-cart").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const pid=btn.dataset.pid; if(!pid||!cid) return;
      btn.disabled=true; const prev=btn.textContent; btn.textContent="Agregando…";
      try{
        const updated=await addToCart(cid,pid,1);
        updateCartCount(updated.products?.length||0);
        toast("Producto agregado ✅");
      }catch(err){ toast("No se pudo agregar: "+err.message,"error"); }
      finally{ btn.textContent=prev; btn.disabled=false; }
    });
  });
}
document.addEventListener("DOMContentLoaded", initShop);
