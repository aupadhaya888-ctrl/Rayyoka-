// RAYYOKA category-tab fix — delegated touch/click handling for POS + customer ordering
(function(){
  'use strict';
  function activateCategory(prefix, value){
    if (typeof cat !== 'undefined') cat = value;
    if (prefix) {
      if (typeof renderCustomerFoods === 'function') renderCustomerFoods();
      return;
    }
    if (typeof renderCats === 'function') renderCats();
    if (typeof renderFoods === 'function') renderFoods();
  }
  function bindCategoryTabs(){
    document.querySelectorAll('.cats').forEach(container=>{
      if(container.dataset.categoryFix==='1') return;
      container.dataset.categoryFix='1';
      container.addEventListener('click',function(e){
        const button=e.target.closest('button.cat');
        if(!button || !container.contains(button)) return;
        e.preventDefault();
        e.stopPropagation();
        const raw=button.getAttribute('data-cat')||'';
        const prefix=container.id==='ccats'?'c':'';
        const value=prefix && raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
        activateCategory(prefix,value);
      },true);
      container.addEventListener('touchend',function(e){
        const button=e.target.closest('button.cat');
        if(!button || !container.contains(button)) return;
        e.preventDefault();
        const raw=button.getAttribute('data-cat')||'';
        const prefix=container.id==='ccats'?'c':'';
        const value=prefix && raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
        activateCategory(prefix,value);
      },{passive:false,capture:true});
    });
  }
  const oldRenderCats=window.renderCats;
  window.renderCats=function(prefix){
    if(typeof oldRenderCats==='function') oldRenderCats(prefix);
    bindCategoryTabs();
  };
  document.addEventListener('DOMContentLoaded',bindCategoryTabs);
  setTimeout(bindCategoryTabs,500);
  setTimeout(bindCategoryTabs,1500);
})();
