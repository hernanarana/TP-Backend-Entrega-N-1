const LS_KEY = "cart.herramienta";
const $count = document.getElementById("cart-count");

const readCart = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const writeCart = (items) => { localStorage.setItem(LS_KEY, JSON.stringify(items)); updateCount(); };
const updateCount = () => {
  const total = readCart().reduce((a, it) => a + it.qty, 0);
  if ($count) $count.textContent = total;
};

const addItem = (data) => {
  const cart = readCart();
  const f = cart.find(i => i.id === Number(data.id));
  if (f) f.qty += 1; else cart.push({ id:Number(data.id), title:data.title, price:Number(data.price), image:data.image, slug:data.slug, qty:1 });
  writeCart(cart);
};

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  addItem(btn.dataset);
  btn.classList.add("pulse"); setTimeout(()=>btn.classList.remove("pulse"), 300);
});

// Página carrito
const $container = document.getElementById("cart-container");
if ($container){
  const fmt = n => new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS"}).format(n);
  const render = () => {
    const cart = readCart();
    if (!cart.length){ $container.innerHTML = `<p class="muted">Tu carrito está vacío.</p>`; updateCount(); return; }
    const rows = cart.map(it => `
      <div class="cart-row">
        <img src="${it.image}" alt="${it.title}"/>
        <div class="cart-info">
          <h4>${it.title}</h4>
          <p class="price">${fmt(it.price)}</p>
        </div>
        <div class="cart-qty">
          <button data-dec data-id="${it.id}">−</button>
          <input type="number" min="1" value="${it.qty}" data-id="${it.id}"/>
          <button data-inc data-id="${it.id}">+</button>
        </div>
        <div class="cart-sub">${fmt(it.price * it.qty)}</div>
        <button class="cart-del" data-del data-id="${it.id}">✕</button>
      </div>
    `).join("");
    const total = cart.reduce((a,it)=>a+it.price*it.qty,0);
    $container.innerHTML = `<div class="cart-list">${rows}</div><div class="cart-total">Total: <strong>${fmt(total)}</strong></div>`;
    updateCount();
  };

  $container.addEventListener("click", (e)=>{
    const id = Number(e.target.dataset.id);
    if (e.target.matches("[data-del]")) writeCart(readCart().filter(i=>i.id!==id));
    if (e.target.matches("[data-inc]")){ const c=readCart(); const it=c.find(i=>i.id===id); if(it){it.qty++; writeCart(c);} }
    if (e.target.matches("[data-dec]")){ const c=readCart(); const it=c.find(i=>i.id===id); if(it){ it.qty=Math.max(1,it.qty-1); writeCart(c);} }
    render();
  });

  $container.addEventListener("change",(e)=>{
    if (e.target.type==="number"){
      const id = Number(e.target.dataset.id);
      const qty = Math.max(1, Number(e.target.value)||1);
      const c = readCart(); const it=c.find(i=>i.id===id); if(it){ it.qty=qty; writeCart(c); }
      render();
    }
  });

  document.getElementById("cart-clear")?.addEventListener("click", ()=>{ writeCart([]); render(); });
  document.getElementById("cart-checkout")?.addEventListener("click", ()=> alert("¡Gracias! (demo)"));
  render();
}

updateCount();

// Mini-galería
document.querySelectorAll(".pd-thumbs img").forEach(img=>{
  img.addEventListener("click", ()=>{
    const hero = document.querySelector(".pd-hero");
    if (hero) hero.src = img.src;
  });
});
