(()=>{'use strict';
const URL='https://dmhlfrnjvjgsooamioak.supabase.co',KEY='sb_publishable_HvY0X0eDKCZ8dMKsLAZICg_6MBsmMUi',DAY='rayyoka_login_day';
if(new URLSearchParams(location.search).get('customer')==='1') return;
const today=()=>new Date().toISOString().slice(0,10);
(async()=>{try{const c=window.supabase.createClient(URL,KEY),d=today(),last=localStorage.getItem(DAY);const {data}=await c.auth.getSession();if(last!==d&&last!=='pending'){localStorage.setItem(DAY,'pending');if(data?.session){await c.auth.signOut();location.reload();return}}c.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'&&session?.user)localStorage.setItem(DAY,d);if(event==='SIGNED_OUT'&&localStorage.getItem(DAY)!=='pending')localStorage.removeItem(DAY)})}catch(e){console.warn('RAYYOKA daily login gate',e)}})();
})();