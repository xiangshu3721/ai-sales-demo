/* 路由与外壳 */
(function(){
'use strict';
var view=document.getElementById('view'); var cur=null;
function navHtml(on,drawer){
  return DATA.nav.map(function(n){ return '<a href="#/'+n.k+'" class="'+(n.k===on?'on':'')+'"><em>'+n.i+'</em>'+n.n+(drawer?'<small>'+n.s+'</small>':'')+'</a>'; }).join('');
}
function closeDrawer(){ document.body.classList.remove('drawer-open'); }
document.getElementById('burger').addEventListener('click',function(){ document.body.classList.add('drawer-open'); });
document.getElementById('drawerMask').addEventListener('click',closeDrawer);
document.getElementById('drawerNav').addEventListener('click',closeDrawer);
function route(){
  var h=U.parseHash(); var page=h.page; if(!Pages[page]){ page='workbench'; }
  U.clearTimers(); U.closeModal(); closeDrawer();
  if(cur&&Pages[cur]&&Pages[cur].destroy){ try{Pages[cur].destroy();}catch(e){} }
  cur=page;
  document.title=DATA.nav.filter(function(n){return n.k===page;})[0].n+' · 销智通·AI销售系统（演示版）';
  document.getElementById('topnav').innerHTML=navHtml(page);
  document.getElementById('drawerNav').innerHTML=navHtml(page,true);
  document.body.setAttribute('data-page',page);
  view.innerHTML='';
  var root=document.createElement('div'); root.className='page page-'+page; view.appendChild(root);
  Pages[page].render(root,h.q);
  window.scrollTo(0,0);
}
window.Pages=window.Pages||{};
window.addEventListener('hashchange',route);
window.addEventListener('DOMContentLoaded',route);
if(document.readyState!=='loading') route();
})();
