/* 6. 陪练 */
(function(){
'use strict';
window.Pages=window.Pages||{};
var esc=U.esc; var root, st, rows, ctx, tick=null, nextT=null, tween=null;
var NAMES=DATA.dims6.map(function(n,i){ return i===1?'搜需':n; });
function init(){
  var d=DATA.drill;
  st={turn:0,score:d.base.score,shown:d.base.score,dims:d.base.dims.slice(),notes:[],picks:[],t:8,locked:false,done:false,round:2};
}
function render(r,q){
  root=r; ctx=q||{}; init();
  rows=DATA.coachRows.map(function(x){ return JSON.parse(JSON.stringify(x)); });
  if(U.S.practiceDone&&U.S.practiceScore){ var s=rows[0]; s.st='done'; s.stt='完成 69 → '+U.S.practiceScore; }
  r.addEventListener('click',onClick);
  draw(); startTimer();
}
function pill(x){ var c={done:'green',doing:'red',todo:'',ok:'blue'}[x.st]; return '<span class="stp '+x.st+'">'+esc(x.stt)+'</span>'; }
function draw(){
  var doneN=rows.filter(function(x){return x.st==='done'||x.st==='ok';}).length;
  var banner=ctx.from==='review'?'<div class="pr-ban">今日题目已按复盘短板出题：<b>'+((U.S.shortboards||[]).join('、')||'定位需求')+'</b> → 第 2 轮「价格跳问」专攻第三问。</div>':(ctx.from==='sop'?'<div class="pr-ban">新口径 <b>SOP v3.3</b> 已生效：本轮题目按“先答一定告诉你，再问第三问”评分。</div>':'');
  root.innerHTML='<div class="pr">'+
   '<section class="pr-top"><div class="pr-hd"><h1>陪练安排 <span class="pill green"><s class="d"></s>运行中</span></h1><p>陪练题不是随机出的：每一题都从顾问自己的真实通话录音里抽出来，再配一个 AI 客户。</p></div>'+
   '<div class="goal"><small>每日目标</small><div class="gl"><b id="goalN">'+doneN+'</b><span>/ 5 人完成</span></div><div class="pbar"><i id="goalB" style="width:'+(doneN/5*100)+'%"></i></div></div></section>'+banner+
   '<section class="card pr-tb"><div class="tb-h"><b>今日陪练安排</b><span class="pill">5 人</span></div><div class="tb-w"><table class="ptab"><thead><tr><th>顾问</th><th>策略</th><th>今日</th><th>题目</th><th>用时</th><th>状态</th></tr></thead><tbody id="ptb">'+tbody()+'</tbody></table></div>'+
   '<p class="note">“林莫”是出题人：他的第 19 通录音被拿来当教材，题目才贴着真实的失分点。</p></section>'+
   '<section class="pr-main" id="prMain"></section>'+
   '<section class="card pr-rep" id="prRep"></section>'+
   '<div class="pr-cta"><button class="cta tan" id="prSop">确认今日安排与陪练，把本周成交数据交给 SOP 迭代 →</button></div></div>';
  drawMain(); drawRep();
}
function tbody(){
  return rows.map(function(x){ return '<tr class="'+(x.k==='su'?'me':'')+'"><td data-l="顾问"><span class="av sm" style="background:'+x.color+'">'+x.av+'</span><b>'+x.name+'</b></td><td data-l="策略">'+esc(x.strat)+'</td><td data-l="今日">'+esc(x.round)+'</td><td data-l="题目">'+esc(x.topic)+'</td><td data-l="用时">'+esc(x.time)+'</td><td data-l="状态">'+pill(x)+'</td></tr>'; }).join('');
}
function refreshTable(){ U.$('#ptb',root).innerHTML=tbody(); var n=rows.filter(function(x){return x.st==='done'||x.st==='ok';}).length; U.$('#goalN',root).textContent=n; U.$('#goalB',root).style.width=(n/5*100)+'%'; }
function drawMain(){
  var T=DATA.drill.turns; var el=U.$('#prMain',root);
  var left;
  if(!st.done){
    var t=T[st.turn];
    left='<div class="ctxbar"><span><small>题目</small><b>'+esc(t.scene)+'</b><em>周一 10:12 通话</em></span><span><small>目标动作</small><b>挖第三问</b><em>“现在客户是怎么收来的？”</em></span><span><small>上次</small><b>69</b><em>分</em></span></div>'+
     '<div class="turnno">第 <b>'+(st.turn+1)+'</b> / '+T.length+' 题</div>'+
     '<div class="cmsg"><span class="av" style="background:#e2874b">张</span><div><small>AI 客户 · '+esc(t.who)+'</small><div class="bub">'+esc(t.say)+'</div></div></div>'+
     '<div class="opts" id="opts">'+t.opts.map(function(o,i){ return '<button class="opt" data-opt="'+i+'"'+(st.locked?' disabled':'')+'><i>'+o.k+'</i><span>'+esc(o.t)+'</span></button>'; }).join('')+'</div>'+
     '<div class="cd" id="cd"><div class="cdbar"><i id="cdBar" style="width:'+(st.t/8*100)+'%"></i></div><span><b id="cdN">'+st.t+'</b> 秒内不选，自动应答</span></div>';
  } else {
    var gain=st.score-69; var lvl=st.score>=80?'blue':(gain>0?'green':'');
    left='<div class="fin"><div class="fin-i">'+(st.score>=80?'🏆':'✓')+'</div><h2>第 '+st.round+' 轮完成</h2><p><b class="'+(gain>0?'g':'r')+'">69 → '+st.score+'</b>　'+(gain>0?'提升 '+gain+' 分':'未提升')+(st.score>=80?' · 已达标':'')+'</p><div class="fin-b"><button class="btn" id="prAgain">再练一轮</button><button class="btn red" id="prRepGo">看练后报告</button></div></div>';
  }
  var bars=NAMES.map(function(n,i){ var v=st.dims[i]; var low=v<60; return '<div class="bar6"><span>'+n+'</span><div class="pbar"><i style="width:'+v+'%;background:'+(low?'var(--blue)':'#d9d1c1')+'"></i></div><b>'+v+'</b></div>'; }).join('');
  var notes=st.notes.length?st.notes.map(function(n){ return '<li class="'+n.c+'">'+esc(n.t)+'</li>'; }).join(''):'<li class="wt">等第 1 题作答后出批注…</li>';
  el.innerHTML='<div class="card pr-drill"><div class="dr-h"><h2><span class="av" style="background:#d9482b">苏</span>苏晴 · 今日第 '+st.round+' 轮 <small>实战演练</small></h2><button class="btn sm" id="prReset">重练本轮</button></div>'+left+'</div>'+
   '<aside class="card pr-live"><div class="lv-h"><small>实时评分</small><div class="lv-n"><b id="lvN">'+st.shown+'</b><span>分</span></div><div class="pbar best"><i id="lvB" style="width:'+Math.min(100,st.shown)+'%"></i><u style="left:'+DATA.drill.base.best+'%" title="历史最好 74"></u></div><small class="bh">历史最好 '+DATA.drill.base.best+(st.shown>DATA.drill.base.best?' · <b class="g">已超过</b>':'')+'</small></div>'+
   '<div class="lv-s"><b>六维动作分</b>'+bars+'</div><div class="lv-c"><b>即时批注</b><ul>'+notes+'</ul></div></aside>';
}
function drawRep(){
  var el=U.$('#prRep',root);
  if(!st.done){ el.innerHTML='<div class="rep-h"><b>练后报告</b><span class="pill">完成本轮后生成</span></div><p class="rep-p">69 → <b>当前 '+st.shown+'</b>　完成 '+DATA.drill.turns.length+' 题后自动生成：每题选择、批注与下一轮建议。</p>'; return; }
  var T=DATA.drill.turns;
  el.innerHTML='<div class="rep-h"><b>练后报告</b><span class="pill green">已生成</span></div><p class="rep-p">69 → <b class="g">'+st.score+'</b>　本轮选择与批注：</p><ul class="rep-l">'+st.picks.map(function(p,i){ var o=T[i].opts[p.i]; return '<li><span class="tg '+(o.good?'g':'r')+'">'+(p.auto?'超时自动 ':'')+o.k+'</span><div><b>'+esc(T[i].scene)+'</b><p>'+esc(o.note)+'</p></div></li>'; }).join('')+'</ul><p class="rep-n">下一轮建议：'+(st.picks.every(function(p){return T[p.i0===undefined?p.i:p.i].good;})?'三题全对，可挑战“客户连续打断”。':'把没选 A 的题再练一遍，重点是“先答一定告诉你，再问第三问”。')+'</p>';
}
function startTimer(){
  stopTimer(); if(st.done) return; st.t=8; st.locked=false;
  tick=U.setInterval(function(){
    if(!root||!document.body.contains(root)){ stopTimer(); return; }
    if(st.locked||st.done) return;
    st.t--; var n=U.$('#cdN',root), b=U.$('#cdBar',root);
    if(n){ n.textContent=Math.max(st.t,0); } if(b){ b.style.width=Math.max(st.t,0)/8*100+'%'; b.parentNode.classList.toggle('hot',st.t<=3); }
    if(st.t<=0){ answer(2,true); }
  },1000);
}
function stopTimer(){ if(tick){ clearInterval(tick); tick=null; } }
function setScore(target){
  clearInterval(tween); var from=st.shown; var step=target>from?1:-1;
  tween=U.setInterval(function(){ var n=U.$('#lvN',root); if(!n){ clearInterval(tween); return; }
    if(st.shown===target){ clearInterval(tween); return; } st.shown+=step; n.textContent=st.shown; var b=U.$('#lvB',root); if(b)b.style.width=Math.min(100,st.shown)+'%'; },28);
}
function answer(i,auto){
  if(st.locked||st.done) return; st.locked=true;
  var t=DATA.drill.turns[st.turn]; var o=t.opts[i];
  U.$$('.opt',root).forEach(function(b,j){ b.disabled=true; b.classList.toggle('pick',j===i); b.classList.toggle('good',t.opts[j].good&&(j===i||auto)); });
  st.picks.push({i:i,auto:!!auto});
  st.score=Math.min(99,st.score+o.gain);
  o.d.forEach(function(v,j){ st.dims[j]=Math.max(30,Math.min(99,st.dims[j]+v)); });
  st.notes.push({t:(auto?'⏱ 8 秒未选，系统自动应答 '+o.k+'：':'')+o.note,c:o.good?'ok':(o.gain<=1?'bad':'mid')});
  var bars=U.$$('.bar6',root); st.dims.forEach(function(v,j){ var bb=bars[j]; bb.querySelector('i').style.width=v+'%'; bb.querySelector('i').style.background=v<60?'var(--blue)':'#d9d1c1'; bb.querySelector('b').textContent=v; });
  U.$('.lv-c ul',root).innerHTML=st.notes.map(function(n){ return '<li class="'+n.c+'">'+esc(n.t)+'</li>'; }).join('');
  setScore(st.score);
  U.$('#cdN',root)&&(U.$('#cdN',root).textContent=auto?'0':st.t);
  var last=st.turn>=DATA.drill.turns.length-1;
  U.setTimeout(function(){
    if(!root) return;
    if(last){ finish(); } else { st.turn++; st.t=8; st.locked=false; var keep={notes:st.notes}; drawMain(); }
  },1500);
}
function finish(){
  st.done=true; stopTimer(); st.shown=st.score; U.S.practiceDone=true; U.S.practiceScore=st.score; U.save();
  var s=rows[0]; s.round='第 '+st.round+' 轮'; s.time='11 分钟'; s.st=st.score>=80?'ok':'done'; s.stt=(st.score>=80?'达标 ':'完成 ')+'69 → '+st.score;
  if(st.score>=80) s.stt='达标 69 → '+st.score;
  rows[1].st='doing'; refreshTable(); drawMain(); drawRep();
  U.toast('第 '+st.round+' 轮完成：69 → '+st.score);
}
function onClick(e){
  var t=e.target, a;
  if((a=t.closest('[data-opt]'))){ answer(+a.getAttribute('data-opt'),false); return; }
  if(t.closest('#prReset')||t.closest('#prAgain')){ var ag=!!t.closest('#prAgain'); var rd=st.round; init(); st.round=ag?rd+1:rd; rows[0].st='doing'; rows[0].stt='进行中'; rows[0].round='第 '+st.round+' 轮'; refreshTable(); drawMain(); drawRep(); startTimer(); return; }
  if(t.closest('#prRepGo')){ U.$('#prRep',root).scrollIntoView({block:'start',behavior:'smooth'}); return; }
  if(t.closest('#prSop')){ SOP.open('practice'); }
}
Pages.practice={render:render,destroy:function(){ stopTimer(); clearInterval(tween); root=null; }};
})();
