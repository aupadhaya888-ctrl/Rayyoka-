const RAYYOKA_SUPABASE_URL='https://dmhlfrnjvjgsooamioak.supabase.co';
const RAYYOKA_SUPABASE_KEY='sb_publishable_HvY0X0eDKCZ8dMKsLAZICg_6MBsmMUi';
const rayyokaCloud=supabase.createClient(RAYYOKA_SUPABASE_URL,RAYYOKA_SUPABASE_KEY);
window.rayyokaCloud=rayyokaCloud;
window.rayyokaCloudStatus='connecting';
async function cloudOrderFromLocal(o){
  const {data:ord,error}=await rayyokaCloud.from('orders').insert({order_number:o.orderNumber||o.id?.toString()||('RY-'+Date.now()),customer_name:o.customer||o.customerName||'Walk-in Customer',order_type:o.orderType||'Dine-in',payment_method:o.payment||o.paymentMethod||'Cash',payment_status:(o.payment||o.paymentMethod)?'paid':'pending',subtotal:Number(o.subtotal||0),discount:Number(o.discount||0),service_charge:Number(o.service||o.serviceCharge||0),vat:Number(o.vat||0),total:Number(o.total||0),status:'completed'}).select('id').single();
  if(error){console.warn('Supabase order sync:',error);return;}
  const items=o.items||o.cart||[];
  if(items.length) await rayyokaCloud.from('order_items').insert(items.map(x=>({order_id:ord.id,item_name:x.name,unit_price:Number(x.price||x.unit_price||0),quantity:Number(x.qty||x.quantity||1),line_total:Number((x.price||x.unit_price||0)*(x.qty||x.quantity||1))})));
}
async function syncLocalOrders(){
  if(!Array.isArray(data?.orders)||!data.orders.length)return;
  for(const o of data.orders){ if(o._cloudSynced)continue; await cloudOrderFromLocal(o); o._cloudSynced=true; }
  save();
}
(async()=>{
 try{
  const {error}=await rayyokaCloud.from('business_settings').select('id').limit(1);
  if(error)throw error;
  window.rayyokaCloudStatus='connected';
  document.querySelector('.sidebar-foot')?.insertAdjacentHTML('afterbegin','<span class="online">●</span> Cloud Database Connected<br>');
  await syncLocalOrders();
 }catch(e){window.rayyokaCloudStatus='error';console.warn('Supabase connection:',e);}
})();
if(typeof window.completeSale==='function'){
 const localCompleteSale=window.completeSale;
 window.completeSale=async function(){const before=data.orders.length;localCompleteSale();const added=data.orders.slice(before);for(const o of added){if(!o._cloudSynced){await cloudOrderFromLocal(o);o._cloudSynced=true;}}save();};
}
if(typeof window.placeCustomerOrder==='function'){
 const localPlaceCustomerOrder=window.placeCustomerOrder;
 window.placeCustomerOrder=async function(){const before=data.orders.length;localPlaceCustomerOrder();const added=data.orders.slice(before);for(const o of added){if(!o._cloudSynced){await cloudOrderFromLocal(o);o._cloudSynced=true;}}save();};
}
