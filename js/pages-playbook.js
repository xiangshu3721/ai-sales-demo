/* 3. 这通怎么打：打法卡 */
(function(){
'use strict';
window.Pages=window.Pages||{};
var esc=U.esc; var root, cust, cs, built, genCount=6;
function build(){
  var pct=DATA.score(cust,cs);
  var lin=cust.key==='lin';
  var open=lin?'林老师，周四这二十分钟我不讲产品，我先跟你算一笔账：你一天二三十个私信自己回，一个月六十小时，这六十小时值多少钱。':cust.name+'，这二十分钟我不讲产品，我先跟你算一笔账：'+cust.dims[6].v+'，一个月下来，这些时间值多少钱。';
  var tk=[]; cs.tags.forEach(function(t){ (DATA.caseTakeaways[t]||[]).forEach(function(x){ if(tk.length<3&&tk.indexOf(x)<0)tk.push(x); }); });
  var qs=[
   ['多少钱','报价算法：年成本 = 月私信条数 × 12 × 单条人工成本；价格锚定在“每月 60 小时 × 你的时薪”之下，先问来源再报三档，报价后停顿等对方先开口。'],
   ['没效果怎么办','先诊断后购买：拿最近 20 条私信跑一遍诊断；若提升空间不足 10% 就主动建议不买。用 '+cs.id+' 的 '+(cs.half?'周期减半':cs.f+'% → '+cs.t+'%')+' 做参照区间，不做收益保证。'],
   [cust.ind==='家庭教育'?'家长会知道是 AI 吗':'客户会知道是 AI 吗','AI 只负责接住和预约，口吻用你本人的；加好友语里声明“智能助理协助”，所有关键消息可追溯、可接管。参见异议清单 v7 #3。']
  ];
  return {file:cust.name+'_周四1800_这通怎么打.md',open:open,tip:'不自我介绍、不讲产品、不发资料——先把他正在损失的时间摆上桌。',pct:pct,tk:tk.length?tk:['先接住客户','再做免费诊断','最后约下一步'],qs:qs,
   goal:'拿到最近 20 条私信截图 + 约下一通。本通不成交。'};
}
function text(){
  var b=built; return '【'+b.file+'】\n① 开场第一句（口径 #S01）\n「'+b.open+'」\n② 本通重点挖（方法论 #M18）\n客户从哪来 ✓ / 一个月约多少 ✓ / 私信谁在回（只剩一半）\n③ 讲哪个案例（#'+cs.id+'）\n'+cs.id+' '+cs.title+' · 相似度 '+b.pct+'% · 建议讲 8-12 分钟：'+b.tk.join('；')+'\n④ 他大概率会问的三个问题\n'+b.qs.map(function(q,i){return (i+1)+'. '+q[0]+'：'+q[1];}).join('\n')+'\n目标：'+b.goal;
}
function render(r,q){
  root=r;
  cust=DATA.cust((q&&q.cust)||U.S.cust); U.S.cust=cust.key;
  var cid=(q&&q.case)||U.S.caseId||cust.matches[0].id; cs=DATA.caseById(cid); U.S.caseId=cs.id; U.save();
  r.addEventListener('click',onClick);
  if(q&&q.gen){ generate(); } else { show(); }
}
function generate(){
  root.innerHTML='<div class="pb"><div class="pb-gen card"><span class="spin big"></span><h2>正在生成这通的打法…</h2><p>按「'+esc(cust.full)+'」十维判断 + 案例 '+cs.id+' 拼装四步内容</p><div class="pbar"><i id="genPb" style="width:3%"></i></div><ul id="genSteps"></ul></div></div>';
  var steps=['读取 '+cust.name+' 的十维判断（'+cust.dims.filter(function(d){return d.ok;}).length+'/10 已确认）','匹配案例 '+cs.id+'：相似度 '+DATA.score(cust,cs)+'%','引用口径 S01 · 方法论 M18 · 合规名单 v7','拼装 4 步打法并校验话术合规','生成溯源（每一句话从哪来）'];
  var i=0; var ul=U.$('#genSteps',root); var pb=U.$('#genPb',root);
  var iv=U.setInterval(function(){
    if(!ul||!ul.isConnected){ clearInterval(iv); return; }
    if(i<steps.length){ ul.insertAdjacentHTML('beforeend','<li>✓ '+esc(steps[i])+'</li>'); i++; pb.style.width=Math.round(i/steps.length*95)+'%'; }
    else { clearInterval(iv); pb.style.width='100%'; U.setTimeout(function(){ genCount++; show(true); },300); }
  },520);
}
function show(fresh){
  built=build(); var b=built;
  var stepsHtml='';
  stepsHtml+='<section class="st"><div class="st-h"><i>1</i><b>开场第一句</b><span class="pill blue">口径 #S01</span></div><blockquote>「'+esc(b.open)+'」</blockquote><p class="tipg">'+esc(b.tip)+'</p></section>';
  stepsHtml+='<section class="st"><div class="st-h"><i>2</i><b>本通重点挖</b><span class="pill blue">方法论 #M18</span></div><div class="flow3"><span class="ok">① 客户从哪来 ✓</span><span class="ok">② 一个月约多少 ✓</span><span class="hot"><em>3</em>私信谁在回<small>只剩一半</small></span></div><p>前两问已在企业微信里问过，本通<b>不再重复</b>；第三问的答案，决定能不能直接讲 <b>'+cs.id+'</b>。</p></section>';
  stepsHtml+='<section class="st"><div class="st-h"><i>3</i><b>讲哪个案例</b><span class="pill org">案例 #'+cs.id+'</span></div><div class="casebox"><b>'+cs.id+'</b> '+esc(cs.ind)+' · '+esc(cs.title.replace(/^[^：]*：/,''))+' · <span class="sim">相似度 '+b.pct+'%</span></div><p>建议讲 <b>8-12 分钟</b>，只讲 3 点：</p><ol class="pts">'+b.tk.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol><div class="who"><span class="avs">'+esc(cs.pub.charAt(0))+'</span><div><b>'+esc(cs.pub)+'（'+esc(cs.pubInd)+'）</b><small>'+cs.date+' · '+esc(cs.prod)+'</small></div><a class="lnk" href="#/cases?cust='+cust.key+'&from=playbook">在案例库打开 →</a></div></section>';
  stepsHtml+='<section class="st"><div class="st-h"><i>4</i><b>他大概率会问的三个问题</b></div><ul class="qs">'+b.qs.map(function(q,i){return '<li><button class="q-h" data-q="'+i+'" aria-expanded="false"><span>'+(i+1)+'. '+esc(q[0])+'</span><em>展开算法 ▾</em></button><div class="q-b" id="qb'+i+'">'+esc(q[1])+'</div></li>';}).join('')+'</ul><p class="foot">价格只在第 7 分钟之后出现 · 异议清单 <b>v7</b></p></section>';
  root.innerHTML='<div class="pb">'+
   '<div class="pb-hd"><div><h1>这通怎么打 <span class="done-badge">完成</span></h1><p>四行字，打印出来就能打。要聊的案例已在驾驶舱选好。</p></div><div class="pb-hb"><button class="btn" id="pbCopy">复制文字</button><button class="btn" id="pbRegen">重新生成</button></div></div>'+
   (fresh?'<div class="pb-new">✓ 已按 '+esc(cust.full)+' × 案例 '+cs.id+' 生成</div>':'')+
   '<div class="pb-grid"><article class="pb-card card"><div class="pb-file"><span>▤</span>'+esc(b.file)+'</div>'+stepsHtml+'<div class="goal"><b>目标：</b>'+esc(b.goal)+'</div></article>'+
   '<aside class="pb-trace card"><h3>这张卡每一句话从哪来</h3><ul>'+
     '<li><span class="tg b">口径 S01</span><p>开场第一句 ← 128 通成交录音提炼的“先算账不讲产品”口径</p></li>'+
     '<li><span class="tg b">方法论 M18</span><p>本通重点挖 ← 三问诊断方法论，第 3 问决定讲哪个案例</p></li>'+
     '<li><span class="tg o">案例 '+cs.id+'</span><p>讲哪个案例 ← 案例库 '+cs.id+' · 与 '+esc(cust.name)+' 十维判断相似度 '+b.pct+'%</p></li>'+
     '<li><span class="tg y">合规名单 v7</span><p>报价与三个问题 ← 异议清单 v7，不做收益保证</p></li></ul>'+
     '<div class="eff"><div><small>备课用时</small><b>2 分钟</b></div><div><small>人工约</small><b class="g">25 分钟</b></div></div><p class="wk">本周已生成 <b>'+genCount+'</b> 张打法卡</p></aside></div>'+
   '<div class="pb-cta"><button class="cta" id="pbNext">把这张打法卡交给通话分析 AI 员工 →</button></div></div>';
}
function onClick(e){
  var t=e.target;
  var q=t.closest('[data-q]'); if(q){ var i=q.getAttribute('data-q'); var b=U.$('#qb'+i,root); var open=b.classList.toggle('open'); q.setAttribute('aria-expanded',open); q.querySelector('em').textContent=open?'收起 ▴':'展开算法 ▾'; return; }
  if(t.closest('#pbCopy')){ U.copy(text()).then(function(){ U.toast('已复制打法卡文本'); }); return; }
  if(t.closest('#pbRegen')){ generate(); return; }
  if(t.closest('#pbNext')){ U.S.fromPlaybook={cust:cust.key,case:cs.id}; U.save(); U.go('review',{from:'playbook',cust:cust.key,case:cs.id}); }
}
Pages.playbook={render:render,destroy:function(){ root=null; }};
})();
