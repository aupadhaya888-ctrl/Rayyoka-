// RAYYOKA category-tab fix — preserve app.js category state and make taps reliable
(function(){
  'use strict';
  function bind(){
    document.querySelectorAll('.cats').forEach(function(container){
      if(container.dataset.categoryFix==='1') return;
      container.dataset.categoryFix='1';
      container.addEventListener('click',function(e){
        const b=e.target.closest('button.cat');
        if(!b || !container.contains(b)) return;
        if(typeof b.onclick==='function'){
          e.preventDefault();
          e.stopImmediatePropagation();
          b.onclick.call(b,e);
        }
      },true);
    });
  }
  document.addEventListener('DOMContentLoaded',bind);
  setTimeout(bind,100);
  setTimeout(bind,500);
  setTimeout(bind,1500);
})();
