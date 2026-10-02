/* 2. 案例库后台 */
(function(){
'use strict';
window.Pages=window.Pages||{};
var esc=U.esc; var root;
var F, rejected={}, logTimer=null, cust;
var SIDE=[['官网','▢'],['生态池','◎'],['问卷','☰'],['测评','✎'],['课程','▶'],['AI智能体','✦']];
function reset(){ F={nick:'',kw:[],tags:[],prods:[],page:1,size:10,sim:false}; }
function filtered(){
  var list=DATA.cases(); var nick=F.nick.trim();
  var out=list.filter(function(c){
    if(nick&&c.pub.indexOf(nick)<0&&c.pubInd.indexOf(nick)<0) return false;
    for(var i=0;i<F.kw.length;i++){ var k=F.kw[i].replace(/\s+/g,''); if((c.title+c.ind+c.tags.join('')+c.id).indexOf(k)<0) return false; }
    if(F.tags.length&&!F.tags.some(function(t){return c.tags.indexOf(t)>=0;})) return false;
    if(F.prods.length&&F.prods.indexOf(c.prod)<0) return false;
    return true;
  });
  if(F.sim){ out=out.map(function(c){ return {c:c,s:DATA.score(cust,c)}; }).sort(function(a,b){ return b.s-a.s||a.c.n-b.c.n; }).map(function(x){ return x.c; }); }
  return out;
}
function render(r,q){
  root=r; reset(); rejected=rejected||{};
  var ck=(q&&q.cust)||U.S.cust; cust=DATA.cust(ck); U.S.cust=cust.key;
  r.innerHTML='<div class="cs">'+
   '<aside class="cs-side" id="csSide"><div class="cs-brand"><span class="logo">智</span><b>销智通</b></div><ul>'+SIDE.map(function(s){ return '<li><a href="javascript:void(0)" data-na="'+s[0]+'"><i>'+s[1]+'</i>'+s[0]+'</a></li>'; }).join('')+
   '<li class="open"><a href="javascript:void(0)" class="on" data-na="案例库"><i>▣</i>案例库<s>▾</s></a><ul class="sub"><li><a href="javascript:void(0)" class="on">全部案例</a></li><li><a href="javascript:void(0)" data-na="标签设置">标签设置</a></li></ul></li>'+
   '<li><a href="javascript:void(0)" data-na="流量明细"><i>≋</i>流量明细</a></li><li><a href="javascript:void(0)" data-na="设置"><i>⚙</i>设置</a></li></ul><p class="cs-ft">演示后台 · 数据虚构</p></aside>'+
   '<div class="cs-mask" id="csMask"></div>'+
   '<div class="cs-main"><div class="cs-hd"><div class="cs-hl">'+
     '<div class="crumb"><button class="cs-menu" id="csMenu" aria-label="菜单">☰ 菜单</button><span>获客</span> › <span>案例库</span> › <b>全部案例</b></div>'+
     '<div class="cs-banner"><div><b>选策略精推卡片</b><p>获客 › 案例库 › 全部案例　直接在真实页面里把该讲的案例推出来</p></div><div class="cs-bn-r"><label>客户 <select id="csCust">'+DATA.customers.map(function(c){return '<option value="'+c.key+'"'+(c.key===cust.key?' selected':'')+'>'+esc(c.full)+'</option>';}).join('')+'</select></label><button class="btn red" id="csSmart">智能推荐</button></div></div>'+
     '<div class="cs-rec" id="csRec"></div>'+
     '<div class="cs-title"><h1>全部案例</h1><span id="csCount"></span></div></div>'+
     '<div class="ailog" id="ailog"><div class="ailog-h" id="ailogH"><b id="ailogT">AI 处理日志</b><span class="spin" id="ailogS" style="display:none"></span><em id="ailogC">收起</em></div><ul id="ailogL"></ul></div></div>'+
     '<form class="cs-filter card" id="csFilter" autocomplete="off">'+
      '<label class="f"><span>昵称</span><input id="fNick" placeholder="发布人，如 韩总" maxlength="10"></label>'+
      '<div class="f kw"><span>案例内容</span><div class="kwbox" id="kwBox"></div></div>'+
      '<div class="f dd" id="ddTags"><span>标签</span><button type="button" class="ddb" data-dd="tags">请选择标签 ▾</button><div class="ddm" id="ddmTags"></div></div>'+
      '<div class="f dd" id="ddProds"><span>产品名称</span><button type="button" class="ddb" data-dd="prods">请选择产品 ▾</button><div class="ddm" id="ddmProds"></div></div>'+
      '<div class="f-btns"><button class="btn dark" type="submit" id="fGo">搜索</button><button class="btn" type="button" id="fClear">清空</button></div></form>'+
     '<div class="cs-grid" id="csGrid"></div><div class="cs-pager" id="csPager"></div>'+
     '<div class="cs-bar"><div class="cs-bar-l"><b>这通怎么打</b><span id="csSel"></span></div><button class="btn red" id="csGen">生成这通的打法</button></div>'+
   '</div></div>';
  r.addEventListener('click',onClick); r.addEventListener('submit',function(e){ e.preventDefault(); doSearch(); });
  r.addEventListener('keydown',function(e){ if(e.target.id==='kwIn'&&(e.key==='Enter'||e.key===',')){ e.preventDefault(); var v=e.target.value.trim(); if(v){ if(F.kw.indexOf(v)<0)F.kw.push(v); e.target.value=''; drawKw(); doSearch(); } } else if(e.target.id==='kwIn'&&e.key==='Backspace'&&!e.target.value&&F.kw.length){ F.kw.pop(); drawKw(); doSearch(); } });
  r.addEventListener('change',function(e){
    if(e.target.id==='csCust'){ cust=DATA.cust(e.target.value); U.S.cust=cust.key; U.save(); rec(); drawSel(); }
    if(e.target.matches('.ddm input')){ var k=e.target.getAttribute('data-k'); var a=F[k]; var v=e.target.value; var i=a.indexOf(v); if(e.target.checked&&i<0)a.push(v); if(!e.target.checked&&i>=0)a.splice(i,1); ddLabel(); }
    if(e.target.id==='pgSize'){ F.size=+e.target.value; F.page=1; drawGrid(); }
  });
  document.addEventListener('click',closeDD);
  drawKw(); ddMenus(); ddLabel(); rec();
  if(q&&q.auto){ smart(true); } else { drawGrid(); logRun(['已搜集全案会话 · 只读','已读 6 轮对话，16 题','生成 6 个打法要点','生成策略精准查询 · '+cust.tags.join(' ')],'已就绪'); }
  drawSel();
  if(q&&q.from==='handover'){ U.toast('已带入 '+cust.full+' 的交接单，帮你按十维判断智能推荐案例'); }
}
function closeDD(e){ if(!root)return; if(e&&e.target.closest&&e.target.closest('.dd'))return; U.$$('.dd.open',root).forEach(function(d){d.classList.remove('open');}); }
function ddMenus(){
  U.$('#ddmTags',root).innerHTML=DATA.TAGS.map(function(t){return '<label><input type="checkbox" data-k="tags" value="'+t+'"> '+t+'</label>';}).join('');
  U.$('#ddmProds',root).innerHTML=DATA.PRODUCTS.map(function(t){return '<label><input type="checkbox" data-k="prods" value="'+t+'"> '+t+'</label>';}).join('');
}
function ddLabel(){
  U.$('[data-dd=tags]',root).innerHTML=(F.tags.length?'已选 '+F.tags.length+' 个标签':'请选择标签')+' ▾';
  U.$('[data-dd=prods]',root).innerHTML=(F.prods.length?'已选 '+F.prods.length+' 个产品':'请选择产品')+' ▾';
}
function drawKw(){
  U.$('#kwBox',root).innerHTML=F.kw.map(function(k,i){ return '<span class="kwc">'+esc(k)+'<button type="button" data-kwx="'+i+'" aria-label="删除">×</button></span>'; }).join('')+'<input id="kwIn" placeholder="'+(F.kw.length?'':'案例内容，回车添加')+'" maxlength="12">';
}
function rec(){
  var best=DATA.cases().map(function(c){return {c:c,s:DATA.score(cust,c)};}).sort(function(a,b){return b.s-a.s||a.c.n-b.c.n;}).slice(0,3);
  U.$('#csRec',root).innerHTML='<span class="rec-l">为 <b>'+esc(cust.name)+'</b> 精推：</span>'+best.map(function(x){ return '<button class="rec-c" data-pick="'+x.c.id+'"><b>'+x.c.id+'</b> '+esc(x.c.title.slice(0,16))+'… <em>'+x.s+'%</em></button>'; }).join('');
}
function pager(total,pages){
  var p=F.page; var nums=[]; var set={1:1}; set[pages]=1; for(var i=p-2;i<=p+2;i++) if(i>1&&i<pages) set[i]=1;
  var arr=Object.keys(set).map(Number).sort(function(a,b){return a-b;}); var last=0;
  arr.forEach(function(n){ if(n-last>1) nums.push('<span class="gap">…</span>'); nums.push('<button class="pg'+(n===p?' on':'')+'" data-pg="'+n+'">'+n+'</button>'); last=n; });
  return '<button class="pg" data-pg="'+(p-1)+'"'+(p<=1?' disabled':'')+'>‹</button>'+nums.join('')+'<button class="pg" data-pg="'+(p+1)+'"'+(p>=pages?' disabled':'')+'>›</button>'+
   '<span class="pgi">共 '+total+' 条 · '+pages+' 页</span><label class="pgs">每页 <select id="pgSize">'+[10,20,40].map(function(n){return '<option'+(n===F.size?' selected':'')+'>'+n+'</option>';}).join('')+'</select></label><label class="pgs">跳至 <input id="pgJump" type="number" min="1" max="'+pages+'" value="'+p+'"> 页</label>';
}
function card(c){
  var rej=rejected[c.id]; var sel=U.S.caseId===c.id;
  var gr=c.half?'周期减半':(c.f+'%→'+c.t+'%');
  return '<article class="cc'+(sel?' sel':'')+(rej?' rej':'')+'" data-id="'+c.id+'">'+
   '<div class="cc-top">'+(rej?'<span class="ess rj">已驳回</span>':c.essence?'<span class="ess">精华</span>':'<span class="ess nw">新增</span>')+'<span class="gr'+(c.half?' half':'')+'" title="'+esc(c.metric)+'">'+gr+'</span></div>'+
   '<h3>'+esc(c.title)+'</h3><div class="cc-tags"><span class="pill blue">'+esc(c.ind)+'</span>'+c.tags.map(function(t){return '<span class="pill org">'+esc(t)+'</span>';}).join('')+'</div>'+
   '<dl><div><dt>关联产品</dt><dd>'+esc(c.prod)+'</dd></div><div><dt>发布人</dt><dd>'+esc(c.pub)+' ('+esc(c.pubInd)+')</dd></div><div><dt>发布日期</dt><dd>'+c.date+'</dd></div>'+(F.sim?'<div><dt>相似度</dt><dd class="sim">'+DATA.score(cust,c)+'%</dd></div>':'')+'</dl>'+
   '<div class="cc-act"><button data-act="view">查看</button><button data-act="rej">'+(rej?'撤销':'驳回')+'</button><button data-act="copy">复制</button></div>'+(sel?'<i class="selmk">✓ 已选</i>':'')+'</article>';
}
function drawGrid(){
  var list=filtered(); var total=list.length; var pages=Math.max(1,Math.ceil(total/F.size)); if(F.page>pages)F.page=pages; if(F.page<1)F.page=1;
  var s=(F.page-1)*F.size; var cur=list.slice(s,s+F.size);
  U.$('#csCount',root).innerHTML='共 <b>'+total.toLocaleString('en-US')+'</b> 条案例';
  U.$('#csGrid',root).innerHTML=cur.length?cur.map(card).join(''):'<div class="empty">没有符合条件的案例，试试点「清空」</div>';
  U.$('#csPager',root).innerHTML=pager(total,pages);
}
function drawSel(){
  var c=U.S.caseId?DATA.caseById(U.S.caseId):null;
  U.$('#csSel',root).innerHTML=c?'已选 <b>'+c.id+'</b> · '+esc(c.title)+' · 相似度 '+DATA.score(cust,c)+'%':'未选案例 · 点击卡片选择，或点「智能推荐」';
}
function logRun(lines,doneText){
  var ul=U.$('#ailogL',root); var t=U.$('#ailogT',root); var sp=U.$('#ailogS',root);
  clearInterval(logTimer); ul.innerHTML=''; t.textContent='搜索中…'; sp.style.display='inline-block'; var i=0;
  logTimer=U.setInterval(function(){
    if(!ul.isConnected){ clearInterval(logTimer); return; }
    if(i<lines.length){ ul.insertAdjacentHTML('beforeend','<li><time>['+U.now()+']</time> '+esc(lines[i])+'</li>'); i++; ul.scrollTop=ul.scrollHeight; }
    else { clearInterval(logTimer); t.textContent=doneText||'已完成'; sp.style.display='none'; }
  },650);
}
function smart(silent){
  F.kw=cust.tags.slice(0,2); F.tags=[]; F.prods=[]; F.nick=''; F.page=1; F.sim=true; U.$('#fNick',root).value='';
  drawKw(); ddLabel(); U.$$('.ddm input',root).forEach(function(i){i.checked=false;});
  var list=filtered(); var top=list[0]; if(top){ U.S.caseId=top.id; U.save(); }
  drawGrid(); drawSel();
  logRun(['已搜集全案会话 · 只读','已读 6 轮对话，16 题','生成 6 个打法要点','生成策略精准查询 · '+F.kw.join(' '),'命中 '+list.length+' 条，按相似度重排，推荐 '+(top?top.id:'—')],'推荐完成');
  if(!silent) U.toast('已按 '+cust.name+' 的十维判断推荐案例'+(top?' '+top.id:''));
}
function doSearch(){
  F.nick=U.$('#fNick',root).value; F.page=1; F.sim=false; drawGrid();
  var n=filtered().length;
  logRun(['提交检索 · 昵称='+(F.nick||'不限')+' 内容='+(F.kw.join(' ')||'不限')+' 标签='+(F.tags.length||'不限'),'命中 '+n.toLocaleString('en-US')+' 条案例（共 '+DATA.TOTAL+'）'],'检索完成');
}
function view(c){
  var tk=[]; c.tags.forEach(function(t){ (DATA.caseTakeaways[t]||[]).slice(0,2).forEach(function(x){ if(tk.length<3)tk.push(x); }); });
  var m=U.modal('<h3>'+c.id+' · '+esc(c.title)+'</h3><p class="sub">'+esc(c.pub)+' ('+esc(c.pubInd)+') · '+c.date+' · '+esc(c.prod)+'</p>'+
   '<div class="cv-m"><div><small>'+esc(c.metric)+'</small><b>'+(c.half?'周期减半':c.f+'% → '+c.t+'%')+'</b></div><div><small>与「'+esc(cust.name)+'」相似度</small><b>'+DATA.score(cust,c)+'%</b></div></div>'+
   '<h4 class="cv-h">这个案例讲三件事</h4><ol class="cv-l">'+(tk.length?tk:['先接住客户','再做诊断','最后约下一步']).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol>'+
   '<div class="row-btns"><button class="btn" data-close>关闭</button><button class="btn red" id="cvUse">选用此案例</button></div>');
  m.querySelector('#cvUse').onclick=function(){ U.S.caseId=c.id; U.save(); U.closeModal(); drawGrid(); drawSel(); U.toast('已选用 '+c.id); };
}
function onClick(e){
  var t=e.target;
  var a=t.closest('[data-act]');
  if(a){ var id=a.closest('.cc').getAttribute('data-id'); var c=DATA.caseById(id); var k=a.getAttribute('data-act');
    if(k==='view') view(c);
    if(k==='rej'){ if(rejected[id]) delete rejected[id]; else { rejected[id]=1; if(U.S.caseId===id){U.S.caseId=null;U.save();} } drawGrid(); drawSel(); U.toast(rejected[id]?'已驳回 '+id+'（演示）':'已撤销驳回'); }
    if(k==='copy'){ U.copy('【'+c.id+'】'+c.title+'\n关联产品：'+c.prod+'\n发布人：'+c.pub+' ('+c.pubInd+')\n'+(c.half?'周期减半':c.metric+' '+c.f+'% → '+c.t+'%')).then(function(){ U.toast('已复制 '+c.id+' 案例文本'); }); }
    return; }
  var card=t.closest('.cc'); if(card&&!t.closest('button')){ var id2=card.getAttribute('data-id'); if(rejected[id2]){ U.toast('该案例已驳回，先撤销再选用'); return; } U.S.caseId=(U.S.caseId===id2?null:id2); U.save(); drawGrid(); drawSel(); return; }
  var x=t.closest('[data-kwx]'); if(x){ F.kw.splice(+x.getAttribute('data-kwx'),1); drawKw(); doSearch(); return; }
  var pg=t.closest('[data-pg]'); if(pg&&!pg.disabled){ F.page=+pg.getAttribute('data-pg'); drawGrid(); U.$('.cs-filter',root).scrollIntoView({block:'start'}); return; }
  var dd=t.closest('[data-dd]'); if(dd){ var p=dd.parentNode; var was=p.classList.contains('open'); closeDD(); if(!was)p.classList.add('open'); return; }
  var pk=t.closest('[data-pick]'); if(pk){ U.S.caseId=pk.getAttribute('data-pick'); U.save(); F.sim=true; F.kw=[]; F.page=1; drawKw(); drawGrid(); drawSel(); U.toast('已选用 '+U.S.caseId); return; }
  if(t.closest('#csSmart')){ smart(); return; }
  if(t.closest('#fClear')){ var sim=F.sim; reset(); U.$('#fNick',root).value=''; drawKw(); ddLabel(); U.$$('.ddm input',root).forEach(function(i){i.checked=false;}); drawGrid(); logRun(['已清空筛选','恢复全部 '+DATA.TOTAL+' 条案例'],'已清空'); return; }
  if(t.closest('#csGen')){ var id3=U.S.caseId; if(!id3){ var top=DATA.cases().map(function(c){return {c:c,s:DATA.score(cust,c)};}).sort(function(a,b){return b.s-a.s;})[0]; id3=top.c.id; U.S.caseId=id3; U.toast('未选案例，已自动采用最相似的 '+id3); } U.save(); U.go('playbook',{cust:cust.key,case:id3,gen:1}); return; }
  if(t.closest('#csMenu')){ document.body.classList.add('cs-open'); return; }
  if(t.closest('#csMask')){ document.body.classList.remove('cs-open'); return; }
  if(t.closest('#ailogH')){ U.$('#ailog',root).classList.toggle('min'); U.$('#ailogC',root).textContent=U.$('#ailog',root).classList.contains('min')?'展开':'收起'; return; }
  var na=t.closest('[data-na]'); if(na){ U.toast('「'+na.getAttribute('data-na')+'」为演示占位，仅案例库可用'); return; }
}
document.addEventListener('keydown',function(e){ if(e.target&&e.target.id==='pgJump'&&e.key==='Enter'&&root){ var v=Math.max(1,parseInt(e.target.value,10)||1); F.page=v; drawGrid(); } });
Pages.cases={render:render,destroy:function(){ document.body.classList.remove('cs-open'); document.removeEventListener('click',closeDD); clearInterval(logTimer); root=null; }};
})();
