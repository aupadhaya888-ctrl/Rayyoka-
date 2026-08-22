(()=>{'use strict';
const URL='https://dmhlfrnjvjgsooamioak.supabase.co',KEY='sb_publishable_HvY0X0eDKCZ8dMKsLAZICg_6MBsmMUi',DAY='rayyoka_login_day';
if(new URLSearchParams(location.search).get('customer')==='1') return;
const today=()=>new Date().toISOString().slice(0,10);
(async()=>{try{const c=window.supabase.createClient(URL,KEY),d=today(),last=localStorage.getItem(DAY);if(last!==d){localStorage.setItem(DAY,'pending');await c.auth.signOut();if(last&&last!=='pending')location.reload();}c.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'&&session?.user)localStorage.setItem(DAY,d);if(event==='SIGNED_OUT'&&localStorage.getItem(DAY)!=='pending')localStorage.removeItem(DAY)})}catch(e){console.warn('RAYYOKA daily login gate',e)}})();
})();