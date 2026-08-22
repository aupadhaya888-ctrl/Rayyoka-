// RAYYOKA category-tab fix — reliable mobile touch/click filtering
(function(){
'use strict';
function bind(){
 ['cats','ccats'].forEach(function(id){
  var container=document.getElementById(id); if(!container)return;
  container.querySelectorAll('button.cat').forEach(function(btn){
   if(btn.dataset.categoryFix==='1')return;
   btn.dataset.categoryFix='1';
   btn.addEventListener('click',function(e){
    e.preventDefault(); e.stopPropagation();
    var selected=btn.textContent.trim();
    container.querySelectorAll('button.cat').forEach(function(x){x.classList.toggle('active',x===btn)});
    var food=document.getElementById(id==='cats'?'foods':'cfoods'); if(!food)return;
    food.querySelectorAll('.food').forEach(function(card){
      var category=card.querySelector('small')?.textContent.trim()||'';
      card.style.display=(selected==='All'||category===selected)?'':'none';
    });
   },{passive:false});
  });
 }
}
document.addEventListener('DOMContentLoaded',function(){bind();setTimeout(bind,300);setTimeout(bind,1000);});
new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();
