/* 工具函数 */
(function(){
'use strict';
var U = window.U = {};
U.esc = function(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); };
U.$ = function(s,r){ return (r||document).querySelector(s); };
U.$$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
U.pad = function(n){ return n<10?'0'+n:''+n; };
U.now = function(){ var d=new Date(); return U.pad(d.getHours())+':'+U.pad(d.getMinutes())+':'+U.pad(d.getSeconds()); };
// 可播种随机数 mulberry32
U.rng = function(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
U.toast = function(msg){
  var t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(U._tt); U._tt=setTimeout(function(){t.classList.remove('show');},2200);
};
U.copy = function(text){
  function fallback(){ var ta=document.createElement('textarea'); ta.value=text; ta.style.cssText='position:fixed;opacity:0;left:0;top:0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(e){} document.body.removeChild(ta); }
  try{ if(navigator.clipboard&&navigator.clipboard.writeText){ return navigator.clipboard.writeText(text).catch(fallback); } }catch(e){}
  fallback(); return Promise.resolve();
};
// 定时器托管：页面离开时统一清理
U.timers = [];
U.setTimeout = function(f,ms){ var id=setTimeout(f,ms); U.timers.push({t:'t',id:id}); return id; };
U.setInterval = function(f,ms){ var id=setInterval(f,ms); U.timers.push({t:'i',id:id}); return id; };
U.clearTimers = function(){ U.timers.forEach(function(x){ x.t==='t'?clearTimeout(x.id):clearInterval(x.id); }); U.timers=[]; };
// 模态框
U.modal = function(html,opt){
  opt=opt||{}; var root=document.getElementById('modalRoot');
  root.innerHTML='<div class="modal-mask"><div class="modal '+(opt.cls||'')+'" role="dialog" aria-modal="true">'+
    '<button class="modal-x" data-close aria-label="关闭">×</button>'+html+'</div></div>';
  var m=root.firstChild;
  m.addEventListener('click',function(e){ if(e.target===m||e.target.hasAttribute('data-close')){ U.closeModal(); } });
  document.body.classList.add('noscroll');
  return m.querySelector('.modal');
};
U.closeModal = function(){ document.getElementById('modalRoot').innerHTML=''; document.body.classList.remove('noscroll'); if(U.onModalClose){var f=U.onModalClose;U.onModalClose=null;f();} };
document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ U.closeModal(); } });
// hash 解析  #/page?a=1&b=2
U.parseHash = function(){
  var h=location.hash.replace(/^#\/?/,''); var q={}; var i=h.indexOf('?'); var page=h;
  if(i>=0){ page=h.slice(0,i); h.slice(i+1).split('&').forEach(function(p){ if(!p)return; var kv=p.split('='); q[decodeURIComponent(kv[0])]=decodeURIComponent(kv[1]||''); }); }
  return {page:page||'workbench',q:q};
};
U.go = function(page,q){
  var s='#/'+page; if(q){ var a=[]; for(var k in q){ if(q[k]!==undefined&&q[k]!==''&&q[k]!==null) a.push(encodeURIComponent(k)+'='+encodeURIComponent(q[k])); } if(a.length) s+='?'+a.join('&'); }
  if(location.hash===s){ window.dispatchEvent(new HashChangeEvent('hashchange')); } else location.hash=s;
};
// 全局会话状态（内存 + sessionStorage，纯演示）
U.S = { cust:'lin', caseId:null, fromPage:null, shortboards:[], practiceDone:false, practiceScore:null, handover:{}, review:0 };
U.save = function(){ try{ sessionStorage.setItem('xzt_state',JSON.stringify(U.S)); }catch(e){} };
try{ var _s=JSON.parse(sessionStorage.getItem('xzt_state')||'null'); if(_s){ for(var k in _s) U.S[k]=_s[k]; } }catch(e){}
})();
