
/* Simple slider */
(function(){
  let idx=0;
  const slides=document.querySelectorAll('.slide');
  function show(i){
    slides.forEach(s=>s.classList.remove('active'));
    slides[(i+slides.length)%slides.length].classList.add('active');
  }
  function next(){ idx=(idx+1)%slides.length; show(idx); }
  window.addEventListener('load', ()=>{
    if(!slides.length) return;
    show(0);
    setInterval(next, 4000);
    /* dots */
    const dots = document.querySelectorAll('.dot');
    dots.forEach((d,i)=> d.addEventListener('click',()=>{ idx=i; show(i); }));
  });
})();

/* Cart system using localStorage */
const Cart = {
  key: 'vitsin_cart_v1',
  get(){ try{ return JSON.parse(localStorage.getItem(this.key)||'[]') }catch(e){return []} },
  save(items){ localStorage.setItem(this.key, JSON.stringify(items)) },
  add(product){ const items=this.get(); const found = items.find(i=>i.id===product.id); if(found){ found.qty+=product.qty; }else{ items.push(product); } this.save(items); alert('Added to cart') },
  update(id, qty){ const items=this.get(); const idx=items.findIndex(i=>i.id===id); if(idx>=0){ items[idx].qty=qty; if(qty<=0) items.splice(idx,1); this.save(items); } },
  remove(id){ const items=this.get(); this.save(items.filter(i=>i.id!==id)) },
  clear(){ this.save([]) }
};

/* add-to-cart buttons on products pages */
window.addEventListener('click', (e)=>{
  const t = e.target;
  if(t.matches('.add')){
    const id=t.dataset.id, title=t.dataset.title, price=parseFloat(t.dataset.price||0);
    Cart.add({id,title,price,qty:1});
  }
});

/* on cart page render */
function renderCartTable(){
  const table=document.getElementById('cart-table');
  if(!table) return;
  const items=Cart.get();
  const tbody = items.map(i=>`
    <tr>
      <td>${i.title}</td>
      <td>₹ ${i.price.toFixed(2)}</td>
      <td><input class="qty" data-id="${i.id}" type="number" min="0" value="${i.qty}"></td>
      <td>₹ ${(i.price*i.qty).toFixed(2)}</td>
      <td><button class="remove" data-id="${i.id}">Remove</button></td>
    </tr>
  `).join('') || '<tr><td colspan="5">Cart is empty</td></tr>';
  table.innerHTML = '<thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>'+tbody+'</tbody>';
  const total = Cart.get().reduce((s,i)=>s + i.price*i.qty,0);
  const totalEl = document.getElementById('cart-total');
  if(totalEl) totalEl.textContent = '₹ ' + total.toFixed(2);
}

/* event delegation for cart page */
window.addEventListener('input', (e)=>{
  if(e.target.classList.contains('qty')){
    const id=e.target.dataset.id, qty=parseInt(e.target.value||0);
    Cart.update(id, qty);
    renderCartTable();
  }
});
window.addEventListener('click', (e)=>{
  if(e.target.classList.contains('remove')){
    Cart.remove(e.target.dataset.id); renderCartTable();
  }
});

window.addEventListener('load', ()=>{
  renderCartTable();
});


// Products page: search & filter
window.addEventListener('load', ()=>{
  const search = document.getElementById('search-input');
  const filter = document.getElementById('cat-filter');
  const clear = document.getElementById('clear-filters');
  function applyFilters(){
    const q = (search && search.value || '').toLowerCase().trim();
    const cat = (filter && filter.value) || 'all';
    document.querySelectorAll('.product').forEach(p=>{
      const title = p.dataset.title || '';
      const category = p.dataset.category || 'all';
      const matchesQuery = !q || title.includes(q);
      const matchesCat = (cat==='all') || (category===cat);
      p.style.display = (matchesQuery && matchesCat) ? '' : 'none';
    });
  }
  if(search) search.addEventListener('input', applyFilters);
  if(filter) filter.addEventListener('change', applyFilters);
  if(clear) clear.addEventListener('click', ()=>{ if(search) search.value=''; if(filter) filter.value='all'; applyFilters(); });
});

// Mock checkout: on cart page, override Checkout button behavior to simulate backend
window.addEventListener('click', (e)=>{
  if(e.target && e.target.matches('button') && e.target.textContent.includes('Checkout')){
    // create fake order
    const items = Cart.get();
    if(!items || items.length===0){ alert('Cart is empty'); return; }
    const orderId = 'ORD' + Date.now().toString().slice(-6) + Math.floor(Math.random()*90+10).toString();
    const order = { id: orderId, created: new Date().toISOString(), items: items, total: items.reduce((s,i)=>s + i.price*i.qty,0) };
    // simulate sending to backend: we'll save to localStorage under orders and then clear cart
    const ordersKey = 'vitsin_orders_v1';
    let orders = [];
    try{ orders = JSON.parse(localStorage.getItem(ordersKey) || '[]'); }catch(e){ orders = []; }
    orders.push(order);
    localStorage.setItem(ordersKey, JSON.stringify(orders));
    Cart.clear();
    renderCartTable();
    alert('Order placed successfully! Order ID: ' + orderId + '\nThis is a mock checkout — integrate a real backend to process payments and orders.');
  }
});
