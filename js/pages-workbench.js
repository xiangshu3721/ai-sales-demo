/* 1. 销售 AI 工作台 */
(function(){
'use strict';
window.Pages=window.Pages||{};
var esc=U.esc;
var root, cu, hosting=true, tab='chat';
var REPLIES=[
 [/价|钱|多少|报价/,'价格我一定告诉你。先问一句：你现在的私信一天大概多少条、谁在回？我知道这个，报的数才对你有用。','M11 · 三问 #3'],
 [/案例|怎么做到|效果|真的/,'她做了三件事：AI 先接住私信、训练营前加一个免费诊断、话术还是用她自己的口吻。你最缺的是哪一件？','S09 · 案例三件事'],
 [/机器人|AI|会不会/,'AI 只负责接住和预约，真正的咨询和成交都是你本人。客户会看到你的名字和口吻。','异议清单 v7 · #3'],
 [/好|行|可以|嗯|谢/,'好的～那我们约个 20 分钟，我把你最近 20 条私信算成一笔账给你看，周四 18 点可以吗？','S18 · 约下一步']
];
function av(c,sz){ return '<span class="av" style="background:'+c.color+';'+(sz?'width:'+sz+'px;height:'+sz+'px;':'')+'">'+esc(c.av)+'</span>'; }
function okCount(){ var n=0; cu.dims.forEach(function(d){ if(d.ok)n++; }); return n; }

function render(r,q){
  root=r; 
  if(q&&q.cust&&DATA.cust(q.cust).key===q.cust) U.S.cust=q.cust;
  cu=DATA.cust(U.S.cust); tab='chat'; hosting=true;
  r.innerHTML='<div class="wb">'+
   '<section class="wb-head card" id="wbHead"></section>'+
   '<section class="wb-tags" id="wbTags"></section>'+
   '<section class="wb-main card">'+
     '<div class="wb-bar"><div class="wb-bar-t"><b>工作区</b><span>企业微信 · 判断面板</span></div><div class="wb-seg" id="wbSeg" role="tablist"><button data-t="list">会话</button><button data-t="chat" class="on">聊天</button><button data-t="panel">判断</button></div><div class="wb-chips" id="wbChips"></div></div>'+
     '<div class="wb-cols" data-tab="chat"><aside class="wb-list" id="wbList"></aside><div class="wb-chat" id="wbChat"></div><aside class="wb-panel" id="wbPanel"></aside></div>'+
   '</section>'+
   '<section class="wb-flow" id="wbFlow"></section>'+
  '</div>';
  r.addEventListener('click',onClick);
  r.addEventListener('submit',function(e){ e.preventDefault(); });
  drawAll(); 
  U.save();
}
function drawAll(){ head(); tags(); chips(); list(); chat(true); panel(); flow(); setTab(tab); }
function head(){
  U.$('#wbHead',root).innerHTML=
   '<div class="wb-hb"><small>新好友</small><h2>'+esc(cu.full)+'</h2><p>来自「'+esc(cu.src)+'」，刚通过企业微信申请添加你</p></div>'+
   '<div class="wb-hb"><small>通道</small><h2>企业微信 · 单聊 · 外部联系人</h2><p>自动通过 · 不发欢迎模板 · <span class="g">24 小时托管</span></p></div>'+
   '<div class="wb-hb"><small>判断口径</small><h2>10 维度 · 6 阶段 · 案例自动匹配</h2><p>平均响应 <b>2.1s</b> · 本地模型</p></div>';
}
function tags(){
  U.$('#wbTags',root).innerHTML=
   '<a class="pill org" href="#/cases">案例库 <b>96</b> 条</a><span class="pill">方法论 <b>36</b> 套</span><span class="pill">成交逻辑 <b>128</b> → 口径 <b>46</b> 条</span><span class="pill">异议库 · 分类处理</span>'+
   '<span class="pill green">先问情况再报价</span><a class="pill green" href="#/cases?cust='+cu.key+'&auto=1">该发哪个案例 · 自动匹配 → 找相似案例</a>';
}
function chips(){
  U.$('#wbChips',root).innerHTML=DATA.customers.slice(0,4).map(function(c){ return '<button class="wb-chip'+(c.key===cu.key?' on':'')+'" data-cust="'+c.key+'">'+esc(c.full)+'</button>'; }).join('');
}
function list(){
  U.$('#wbList',root).innerHTML='<div class="wb-lt"><b>会话</b><span class="pill">'+DATA.customers.length+'</span></div>'+
   DATA.customers.map(function(c){
    return '<button class="wb-li'+(c.key===cu.key?' on':'')+'" data-cust="'+c.key+'">'+av(c)+'<div><div class="l1"><b>'+esc(c.name)+'</b><time>'+c.time+'</time></div><div class="l2">'+esc(c.last)+'</div><div class="l3"><span class="pill '+c.tagc+'">'+esc(c.tag)+'</span><span class="ind">'+esc(c.ind)+'</span></div></div></button>';
   }).join('');
}
function bubble(m){
  if(m.r==='w'){ var w=m.w; return '<div class="msg ai"><div class="wcard"><div class="wcard-t">'+esc(w.title)+'</div><div class="wcard-b"><div class="wcard-l"><p>'+esc(w.a)+'</p><p>'+esc(w.b)+'</p><div class="mini-bars"><i style="height:24%"></i><i style="height:30%"></i><i style="height:36%"></i><i style="height:52%"></i><i style="height:70%"></i><i style="height:84%"></i></div></div><div class="wcard-r"><b>'+esc(w.big)+'</b><small>'+esc(w.bl)+'</small></div></div></div></div>'; }
  if(m.r==='c') return '<div class="msg cu">'+av(cu,32)+'<div class="bub">'+esc(m.t)+'</div></div>';
  if(m.r==='me') return '<div class="msg me"><div class="bub">'+esc(m.t)+'</div></div>';
  return '<div class="msg ai">'+(m.tag?'<span class="mtag">'+esc(m.tag)+'</span>':'')+'<div class="bub">'+esc(m.t)+'</div></div>';
}
function chat(scroll){
  var el=U.$('#wbChat',root);
  el.innerHTML='<div class="wb-ch"><div class="who">'+av(cu,34)+'<div><b>'+esc(cu.full)+'</b><small><s class="dot'+(hosting?'':' off')+'"></s>'+(hosting?'AI 24 小时托管中':'已暂停托管')+'</small></div></div><button class="host'+(hosting?' on':'')+'" id="hostBtn" aria-pressed="'+hosting+'">'+(hosting?'24h 托管':'托管已关')+'</button></div>'+
   '<div class="msgs" id="msgs">'+cu.chat.map(bubble).join('')+'</div>'+
   '<div class="wb-in"><div class="tools"><span>☺</span><span>✂</span><span>🖼</span><span>📎</span></div>'+
   '<div class="wb-sum"><b>三件事</b>'+cu.sum.map(function(s,i){return '<span><em>'+(i+1)+'</em>'+esc(s)+'</span>';}).join('')+'</div>'+
   '<form class="wb-send"><input id="msgIn" type="text" placeholder="'+(hosting?'AI 正在托管/诊断…你也可以随时接管':'输入消息，回车发送')+'" aria-label="消息"><button class="btn blue" id="sendBtn" type="button">发送</button></form></div>';
  if(scroll){ var ms=U.$('#msgs',root); ms.scrollTop=ms.scrollHeight; }
}
function panel(){
  var steps=DATA.stages.map(function(s,i){ var st=i<cu.stage?'done':(i===cu.stage?'cur':''); return '<li class="'+st+'"><i>'+(i<cu.stage?'✓':(i+1))+'</i><span>'+s+'</span></li>'; }).join('');
  var n=okCount();
  var rows=cu.dims.map(function(d,i){ return '<tr'+(i>4?' class="more"':'')+'><th>'+d.k+'</th><td>'+esc(d.v)+'</td><td>'+(d.ok?'<span class="ck">✓</span>':'<button class="pend" data-dim="'+i+'">待确认</button>')+'</td></tr>'; }).join('');
  var ms=cu.matches.map(function(m,i){ return '<li class="'+(i===0?'top':'')+'"><div class="m1"><b>'+m.id+'</b><span>'+esc(m.ind)+'</span><span class="pill '+(m.st==='已发出'?'green':m.st==='备用'?'org':'')+'" data-st="'+i+'">'+m.st+'</span></div><div class="m2"><div class="pbar"><i style="width:'+m.pct+'%;background:'+(i===0?'var(--green)':i===1?'var(--orange)':'#c8c1b4')+'"></i></div><strong>'+m.pct+'%</strong><button class="btn sm" data-send="'+i+'">发</button></div></li>'; }).join('');
  U.$('#wbPanel',root).innerHTML=
   '<div class="pn"><div class="pn-h"><b>销售进度</b><span class="pill blue">第 '+(cu.stage+1)+' 步 · '+DATA.stages[cu.stage]+'</span></div><ol class="steps6">'+steps+'</ol>'+
   '<div class="st-checks"><span class="ok">挖掘 3/3 ✓</span>'+(cu.stage>=2?'<span class="ok">案例已发 ✓</span>':'<span>案例待发</span>')+'<span class="wait">等价格追问</span></div></div>'+
   '<div class="pn"><div class="pn-h"><b>客户需求解读</b></div><p class="need">“'+esc(cu.needs)+'”</p></div>'+
   '<div class="pn"><div class="pn-h"><b>十维度判断</b><span class="pill '+(n===10?'green':'org')+'">'+n+'/10 已确认</span></div><table class="dtab">'+rows+'</table><button class="lnk" id="dimMore">展开全部 10 项 ▾</button></div>'+
   '<div class="pn"><div class="pn-h"><b>案例匹配</b><span class="pill">案例库 96 条</span></div><ul class="matches">'+ms+'</ul></div>'+
   '<div class="pn tan"><small>这句话从哪学的</small><p><b>口径 #'+cu.tip.code+'</b>　“'+esc(cu.tip.t)+'”</p></div>';
}
function flow(){
  var n=okCount();
  U.$('#wbFlow',root).innerHTML=
   '<div class="fl-step"><span class="no">壹</span><b>自动通过 + 十维度判断</b><span class="done-badge">完成</span><span class="fl-t">0.8 秒通过 · 不发欢迎模板</span></div>'+
   '<div class="fl-cards"><div class="card fc"><b>自动通过留痕</b><small>0.8 秒，无人工介入</small><p>• '+esc(cu.name)+' 通过「'+esc(cu.src.split(' · ')[0])+'」申请添加你为企业微信联系人</p></div>'+
   '<div class="card fc"><b>十维判断</b><small>每一项都带依据，可点开</small><div class="nums"><div><i>10</i><span>维度</span></div><div><i class="g">'+n+'</i><span>已确认</span></div><div><i class="o">'+(10-n)+'</i><span>待确认</span></div></div></div></div>'+
   '<div class="fl-cta"><small>接待完成并交接后可移交</small><button class="cta" id="handBtn">把这个高意向客户交给销售专家 →</button></div>';
}
function setTab(t){
  tab=t; var cols=U.$('.wb-cols',root); if(!cols)return; cols.setAttribute('data-tab',t);
  U.$$('#wbSeg button',root).forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-t')===t); });
}
function addMsg(m){ cu.chat.push(m); var ms=U.$('#msgs',root); ms.insertAdjacentHTML('beforeend',bubble(m)); ms.scrollTop=ms.scrollHeight; }
function send(){
  var inp=U.$('#msgIn',root); var t=inp.value.trim(); if(!t)return; inp.value='';
  addMsg({r:'me',t:t});
  if(!hosting){ U.toast('托管已关闭，AI 不会自动回复'); return; }
  var ms=U.$('#msgs',root); ms.insertAdjacentHTML('beforeend','<div class="msg ai typing"><div class="bub"><i></i><i></i><i></i></div></div>'); ms.scrollTop=ms.scrollHeight;
  var rep=REPLIES[REPLIES.length-1]; for(var i=0;i<REPLIES.length;i++){ if(REPLIES[i][0].test(t)){ rep=REPLIES[i]; break; } }
  U.setTimeout(function(){ var ty=U.$('.typing',root); if(ty) ty.remove(); addMsg({r:'ai',t:rep[1],tag:rep[2]}); },1200);
}
function handover(){
  var n=okCount(); var top=cu.matches[0];
  var m=U.modal('<h3>交接单 · 高意向客户</h3><p class="sub">AI 已完成接待与十维度判断，确认后交给销售专家，并带去案例库选案例</p>'+
   '<div class="ho"><div class="ho-r"><span>客户</span><b>'+esc(cu.full)+'</b></div><div class="ho-r"><span>销售阶段</span><b>第 '+(cu.stage+1)+' 步 · '+DATA.stages[cu.stage]+'</b></div><div class="ho-r"><span>意向度</span><b>'+cu.intent+' 分</b></div>'+
   '<div class="ho-r"><span>十维判断</span><b>'+n+' 项已确认 / '+(10-n)+' 项待确认</b></div><div class="ho-r"><span>推荐案例</span><b>'+top.id+' · '+esc(top.ind)+'（匹配 '+top.pct+'%）</b></div><div class="ho-r"><span>客户诉求</span><b>'+esc(cu.needs)+'</b></div>'+
   '<div class="ho-r"><span>接收人</span><select id="hoTo"><option>苏晴（熟人 · 待辅导）</option><option>陈默（稳定）</option><option>方明（新人）</option></select></div>'+
   '<div class="ho-r"><span>通话安排</span><select id="hoAt"><option>周四 18:00 · 20 分钟</option><option>周五 10:30 · 20 分钟</option><option>下周一 14:00 · 20 分钟</option></select></div></div>'+
   '<label class="chip ho-c"><input type="checkbox" checked><span>同步十维度判断与聊天记录给接收人</span></label>'+
   '<div class="row-btns"><button class="btn" data-close>再看看</button><button class="btn red" id="hoOk">确认交接，去选案例 →</button></div>',{cls:'wide'});
  m.querySelector('#hoOk').onclick=function(){
    var to=m.querySelector('#hoTo').value.split('（')[0], at=m.querySelector('#hoAt').value;
    U.S.handover[cu.key]={to:to,at:at}; U.S.cust=cu.key; U.save(); U.closeModal();
    U.toast('已交接给 '+to+' · '+at); U.go('cases',{cust:cu.key,from:'handover',auto:1});
  };
}
function onClick(e){
  var t=e.target.closest('[data-cust],[data-t],#hostBtn,#sendBtn,#handBtn,#dimMore,[data-dim],[data-send]'); if(!t)return;
  if(t.hasAttribute('data-cust')){ cu=DATA.cust(t.getAttribute('data-cust')); U.S.cust=cu.key; U.save(); hosting=true; tab='chat'; drawAll(); U.$('.wb-main',root).scrollIntoView&&0; return; }
  if(t.hasAttribute('data-t')){ setTab(t.getAttribute('data-t')); return; }
  if(t.id==='hostBtn'){ hosting=!hosting; chat(true); U.toast(hosting?'AI 已恢复 24 小时托管':'已暂停托管，由你接管'); return; }
  if(t.id==='sendBtn'){ send(); return; }
  if(t.id==='handBtn'){ handover(); return; }
  if(t.id==='dimMore'){ var p=U.$('.dtab',root); p.classList.toggle('open'); t.textContent=p.classList.contains('open')?'收起 ▴':'展开全部 10 项 ▾'; return; }
  if(t.hasAttribute('data-dim')){ cu.dims[+t.getAttribute('data-dim')].ok=true; var op=U.$('.dtab',root).classList.contains('open'); panel(); flow(); if(op){ U.$('.dtab',root).classList.add('open'); U.$('#dimMore',root).textContent='收起 ▴'; } U.toast('已确认该维度'); return; }
  if(t.hasAttribute('data-send')){ var i=+t.getAttribute('data-send'); var m=cu.matches[i]; var c=DATA.caseById(m.id); m.st='已发出';
    addMsg({r:'w',w:{title:c.title,a:c.half?'周期减半':c.metric+' '+c.f+'% → '+c.t+'%',b:'相似度 '+m.pct+'%',big:c.half?'½':c.t+'%',bl:c.half?'周期':c.metric}}); panel(); setTab('chat'); U.toast('已把案例 '+m.id+' 发给 '+cu.name); return; }
}
root=null;
document.addEventListener('keydown',function(e){ if(e.key==='Enter'&&e.target&&e.target.id==='msgIn'){ e.preventDefault(); send(); } });
Pages.workbench={render:render,destroy:function(){ root=null; }};
})();
