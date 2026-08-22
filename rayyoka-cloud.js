/* RAYYOKA V2 — Supabase cloud/auth layer */
(function(){
  const URL='https://dmhlfrnjvjgsooamioak.supabase.co';
  const KEY='sb_publishable_HvY0X0eDKCZ8dMKsLAZICg_6MBsmMUi';
  const sb=window.supabase.createClient(URL,KEY);
  window.rayyokaSupabase=sb;
  const customerMode=new URLSearchParams(location.search).get('customer')==='1';
  const OWNER_EMAIL='rayyoka2026@gmail.com';
  const escCloud=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function loginScreen(message=''){
    if(customerMode)return;
    document.getElementById('rayyoka-auth')?.remove();
    const d=document.createElement('div');d.id='rayyoka-auth';
    d.innerHTML=`<div class="modal-box" style="max-width:420px;margin:auto;text-align:left"><div style="text-align:center;font-size:42px;font-weight:800">RY</div><h2 style="text-align:center;margin:4px 0">RAYYOKA V2</h2><p style="text-align:center;color:#777;margin:0 0 20px">Secure Owner Login</p>${message?`<div style="background:#fff3f3;padding:10px;border-radius:8px;margin-bottom:12px;color:#a00">${escCloud(message)}</div>`:''}<label class="label">Email</label><input id="ry-email" class="input" type="email" autocomplete="username" value="${OWNER_EMAIL}" placeholder="${OWNER_EMAIL}"><label class="label">Password</label><input id="ry-pass" class="input" type="password" autocomplete="current-password" placeholder="Enter owner password"><button id="ry-login" class="btn primary full" style="margin-top:12px">Sign In</button><p style="font-size:12px;color:#777;margin-top:14px">Owner account: ${OWNER_EMAIL}</p><p style="font-size:12px;color:#777;margin-top:6px">Authentication is securely handled by Supabase.</p></div>`;
    Object.assign(d.style,{position:'fixed',inset:'0',zIndex:'99999',background:'rgba(10,10,10,.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'});document.body.appendChild(d);
    document.getElementById('ry-login').onclick=async()=>{const email=document.getElementById('ry-email').value.trim(),password=document.getElementById('ry-pass').value;if(!email||!password)return alert('Enter email and password.');const b=document.getElementById('ry-login');b.disabled=true;b.textContent='Signing in…';const {error}=await sb.auth.signInWithPassword({email,password});if(error){b.disabled=false;b.textContent='Sign In';loginScreen(error.message)}};
    document.getElementById('ry-pass').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('ry-login').click()});
  }
  async function ensureAuth(){
    if(customerMode)return true;
    const {data:{user}}=await sb.auth.getUser();
    if(!user){document.querySelector('.app')?.setAttribute('aria-hidden','true');loginScreen();return false}
    document.getElementById('rayyoka-auth')?.remove();document.querySelector('.app')?.removeAttribute('aria-hidden');
    const {data:p}=await sb.from('profiles').select('full_name,role').eq('id',user.id).maybeSingle();const role=p?.role||'staff';
    const foot=document.querySelector('.sidebar-foot');if(foot)foot.innerHTML=`<span class="online">●</span> Cloud Connected<br>${escCloud(p?.full_name||user.email)} • ${role}<br><button id="ry-logout" style="margin-top:6px;background:none;border:0;color:inherit;text-decoration:underline;cursor:pointer">Sign out</button>`;
    document.getElementById('ry-logout')?.addEventListener('click',()=>sb.auth.signOut());return true;
  }
  async function cloudLoad(){
    if(customerMode)return;const ok=await ensureAuth();if(!ok)return;
    try{const [{data:orders},{data:inv}]=await Promise.all([sb.from('orders').select('*,order_items(*)').order('created_at',{ascending:false}).limit(500),sb.from('inventory_items').select('*').order('name')]);
      if(Array.isArray(orders))data.orders=orders.map(o=>({id:o.order_number,name:o.customer_name,phone:'',address:o.delivery_address||'',orderType:o.order_type,payment:o.payment_method,items:(o.order_items||[]).map(i=>({name:i.item_name,qty:i.quantity,price:Number(i.unit_price)})),subtotal:Number(o.subtotal),discount:Number(o.discount),service:Number(o.service_charge),vat:Number(o.vat),total:Number(o.total),status:({new:'New',confirmed:'New',preparing:'Preparing',ready:'Ready',completed:'Completed',cancelled:'Cancelled'}[o.status]||o.status),time:o.created_at,_cloudId:o.id}));
      if(Array.isArray(inv)&&inv.length)data.inventory=inv.map(x=>({id:x.id,name:x.name,qty:Number(x.quantity),unit:x.unit,min:Number(x.minimum_quantity),_cloud:true}));save();if(typeof go==='function')go('dashboard');
    }catch(e){console.warn('RAYYOKA cloud load failed',e)}
  }
  async function cloudOrder(o){try{const {data:ord,error}=await sb.from('orders').insert({order_number:o.id,customer_name:o.name||'Walk-in Customer',order_type:o.orderType||'Dine-in',payment_method:o.payment==='Pending'?'Cash':(o.payment||'Cash'),payment_status:o.payment==='Pending'?'pending':'paid',subtotal:o.subtotal||0,discount:o.discount||0,service_charge:o.service||0,vat:o.vat||0,total:o.total||0,status:'new',delivery_address:o.address||null,created_by:(await sb.auth.getUser()).data.user?.id||null}).select('id').single();if(error)throw error;if(o.items?.length){const {error:e}=await sb.from('order_items').insert(o.items.map(i=>({order_id:ord.id,item_name:i.name,unit_price:i.price,quantity:i.qty,line_total:i.price*i.qty})));if(e)throw e}o._cloudId=ord.id;return true}catch(e){console.warn(e);toast('Cloud save failed: '+e.message);return false}}
  async function cloudStatus(o,s){if(!o?._cloudId)return;const map={New:'new',Preparing:'preparing',Ready:'ready',Completed:'completed',Cancelled:'cancelled'};await sb.from('orders').update({status:map[s]||'new'}).eq('id',o._cloudId)}
  async function cloudInventory(x){if(!x?._cloud)return;await sb.from('inventory_items').update({quantity:Number(x.qty),minimum_quantity:Number(x.min),updated_at:new Date().toISOString()}).eq('id',x.id)}
  function patch(){
    if(typeof completeSale==='function'&&!completeSale.__cloud){window.completeSale=async function(){if(!cart.length)return toast('Add at least one item');const o=newOrder({name:$('customer').value.trim()||'Walk-in Customer',orderType:$('orderType').value,payment:$('payment').value});data.orders.unshift(o);save();cart=[];renderCart();if(await cloudOrder(o))showModal(`<div style="font-size:44px">✓</div><h2>Sale Completed</h2><p>${o.id} • ${money(o.total)}</p><div class="modal-actions"><button class="btn dark" onclick="printReceipt('${o.id}')">Print Receipt</button><button class="btn primary" onclick="closeModal();go('orders')">Done</button></div>`)};window.completeSale.__cloud=true}
    if(typeof placeCustomerOrder==='function'&&!placeCustomerOrder.__cloud){window.placeCustomerOrder=async function(){if(!cart.length)return toast('Add items first');const name=$('cname').value.trim();if(!name)return toast('Enter your name');const o=newOrder({name,phone:$('cphone').value.trim(),address:$('caddress').value.trim(),orderType:$('ctype').value,payment:'Pending'});if(await cloudOrder(o)){cart=[];renderCustomerCart();showModal(`<div style="font-size:44px">✓</div><h2>Order Received</h2><p>Your order number is <b>${o.id}</b>.</p><p>Total: <b>${money(o.total)}</b></p><button class="btn primary full" onclick="closeModal()">Done</button>`)}};window.placeCustomerOrder.__cloud=true}
    if(typeof setStatus==='function'&&!setStatus.__cloud){window.setStatus=async function(id,s){const o=data.orders.find(x=>x.id===id);if(!o)return;o.status=s;save();await cloudStatus(o,s);renderKitchen();renderOrders();toast(`${id} marked ${s}`)};window.setStatus.__cloud=true}
    if(typeof adjustStock==='function'&&!adjustStock.__cloud){window.adjustStock=async function(id){const x=data.inventory.find(x=>x.id===id);if(!x)return;const v=prompt(`New quantity for ${x.name}`,x.qty);if(v===null)return;const q=Number(v);if(isNaN(q)||q<0)return toast('Invalid quantity');x.qty=q;save();await cloudInventory(x);renderInventory();toast('Stock updated')};window.adjustStock.__cloud=true}
  }
  let channel;
  function subscribeRealtime(){if(channel)return;channel=sb.channel('rayyoka-live').on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>cloudLoad()).on('postgres_changes',{event:'*',schema:'public',table:'inventory_items'},()=>cloudLoad()).subscribe()}
  window.addEventListener('DOMContentLoaded',async()=>{patch();if(customerMode)return;const ok=await ensureAuth();if(ok){await cloudLoad();patch();subscribeRealtime()}});
  sb.auth.onAuthStateChange(async(event)=>{if(event==='SIGNED_IN'){await ensureAuth();await cloudLoad();patch();subscribeRealtime()}if(event==='SIGNED_OUT'&&!customerMode)loginScreen()});
})();
