/* 4. 通话复盘 */
(function(){
'use strict';
window.Pages=window.Pages||{};
var esc=U.esc; var root, ci=0, open=0, tab='score', ctx=null;
var KW=['小红书','私信','价格','太贵','三问','AI','案例','资料','多少钱','报价','预算','成交','转介绍','线索'];
function hl(s){ var h=esc(s); KW.forEach(function(k){ h=h.split(esc(k)).join('<mark>'+esc(k)+'</mark>'); }); return h; }
function sec(t){ var p=t.split(':'); return (+p[0])*60+(+p[1]); }
function fmt(s){ return U.pad(Math.floor(s/60))+':'+U.pad(s%60); }
function lvl(s){ return s<60?'low':(s<80?'mid':'hi'); }
function render(r,q){
  root=r; ctx=null; open=0; tab='score';
  ci=0;
  if(q&&q.from==='playbook'){ ctx={cust:q.cust,case:q.case}; var k=DATA.calls.map(function(c){return c.cust;}).indexOf(q.cust); ci=k>=0?k:0; }
  else if(q&&q.call){ ci=Math.min(+q.call||0,DATA.calls.length-1); }
  r.addEventListener('click',onClick);
  draw();
}
function bad(c){ var a=[]; c.sc.forEach(function(s,i){ if(s<60)a.push(i); }); return a; }
function draw(loading){
  var c=DATA.calls[ci]; var low=bad(c);
  var tr=''; var n=0;
  c.lines.forEach(function(ls,i){
    var s=c.sc[i];
    tr+='<div class="tr-st '+lvl(s)+'" data-st="'+i+'"><b>'+(i+1)+'. '+DATA.steps[i].n+'</b><time>'+DATA.stageTimes[i]+'</time><em class="sc">'+s+'</em></div>';
    ls.forEach(function(l,j){
      n++; var su=l[0]==='su'; var flag=su&&j===0&&s<60;
      tr+='<p class="tr-l '+(su?'su':'cu')+(flag?' flag':'')+'"><span class="sp">'+(su?c.rep.charAt(0):c.cu.charAt(0))+'</span><span class="tx">'+hl(l[1])+'</span>'+(flag?'<span class="fx">改进 · '+esc(DATA.steps[i].code)+'</span>':'')+'</p>';
    });
  });
  var cells=c.sc.map(function(s,i){ return '<button class="cell '+lvl(s)+(open===i?' on':'')+'" data-cell="'+i+'"><small>'+(i+1)+'</small><b>'+s+'</b><span>'+DATA.steps[i].n+'</span></button>'; }).join('');
  var st=DATA.steps[open]; var tm=DATA.stageTimes[open].split('-'); var act=sec(tm[1])-sec(tm[0]);
  var detail='<div class="det"><div class="det-h"><b>'+(open+1)+'. '+st.n+'</b><span class="pill '+(c.sc[open]<60?'red':c.sc[open]<80?'org':'green')+'">'+c.sc[open]+' 分</span><span class="pill blue">'+esc(st.code)+'</span></div>'+
   '<div class="vs"><div class="vs-a"><small>标准</small><b>'+st.sT+'</b><p>'+esc(st.std)+'</p></div><div class="vs-b"><small>实际</small><b class="'+(c.sc[open]<60?'r':'')+'">'+fmt(act)+'</b><p>'+esc(c.actual[open]||(c.sc[open]>=80?st.hi:st.lo))+'</p></div></div>'+
   (ctx&&open===3?'<p class="ctxn">对照打法卡：计划讲 '+esc(ctx.case)+'，建议 8-12 分钟，实际 '+fmt(act)+'。</p>':'')+
   (ctx&&open===0?'<p class="ctxn">对照打法卡：开场第一句 #S01「先算账不讲产品」'+(c.sc[0]>=80?'已命中':'未命中')+'。</p>':'')+'</div>';
  var banner=ctx?'<div class="rv-ban"><b>已载入打法卡</b> '+esc(DATA.cust(ctx.cust).full)+' × 案例 '+esc(ctx.case)+'：按口径 S01 / 方法论 M18 对照本通 → 开场 <em class="'+(c.sc[0]>=80?'g':'r')+'">'+(c.sc[0]>=80?'命中':'未命中')+'</em> · 挖掘 <em class="'+(c.sc[1]>=70?'g':'r')+'">'+(c.sc[1]>=70?'命中':'三问缺一')+'</em> · 案例 <em class="'+(c.sc[3]>=80?'g':'r')+'">'+(c.sc[3]>=80?'命中':'偏离')+'</em></div>':'';
  root.innerHTML='<div class="rv">'+
   '<div class="rv-hd"><div><h1>每通电话 <span class="done-badge">完成</span></h1><p>左边是逐字稿，右边是得分与短板；点九步格子看“标准 vs 实际”</p></div><button class="btn red" id="rvRe">重新打开</button></div>'+banner+
   '<div class="rv-calls" id="rvCalls">'+DATA.calls.map(function(x,i){ return '<button class="rc'+(i===ci?' on':'')+'" data-call="'+i+'"><b>'+esc(x.rep)+' × '+esc(x.cu)+'</b><span>'+esc(x.topic)+' · '+x.dur+'</span><em class="'+(x.score<65?'r':'')+'">'+x.score+'</em></button>'; }).join('')+'</div>'+
   '<div class="rv-seg" id="rvSeg"><button data-tab="score" class="'+(tab==='score'?'on':'')+'">得分与短板</button><button data-tab="tr" class="'+(tab==='tr'?'on':'')+'">逐字稿</button></div>'+
   '<div class="rv-grid" data-tab="'+tab+'">'+
    '<section class="rv-tr card" id="rvTr"><div class="tr-hd"><b>逐字稿</b><span>共 '+c.total+' 句，判定有错 <b class="r">'+c.err+'.0</b> 句</span></div><div class="tr-body">'+tr+'</div></section>'+
    '<section class="rv-sc" id="rvSc">'+
     '<div class="card sc-top"><div class="sc-who"><div><h2>'+esc(c.rep)+' × '+esc(c.cu)+'</h2><p>'+esc(c.topic)+' · '+esc(c.round)+' · '+c.at+' · '+c.dur+'</p></div><div class="big"><b>'+c.score+'</b><small>/100</small></div></div><p class="crit">'+esc(c.crit)+'</p>'+
     '<div class="ins4">'+c.ins.map(function(x){ return '<div><small>'+x[0]+'</small><p>'+esc(x[1])+'</p></div>'; }).join('')+'</div></div>'+
     '<div class="card sc-nine"><div class="nine-h"><b>顾问式成交九步</b><span>红色为低于 60 分</span></div><div class="nine">'+cells+'</div>'+detail+'</div>'+
    '</section></div>'+
   '<div class="rv-bar card"><span>'+esc(c.rep)+' × '+esc(c.cu)+' · <b>'+c.score+' 分</b> · '+low.length+' 处改进已贴到对话</span><button class="cta" id="rvNext">把这通的短板交给高意向跟进 →</button></div></div>';
  if(loading) return;
}
function handoff(){
  var c=DATA.calls[ci]; var low=bad(c); var names=low.map(function(i){return DATA.steps[i].n;});
  if(!low.length){ low=[c.sc.indexOf(Math.min.apply(null,c.sc))]; names=[DATA.steps[low[0]].n]; }
  var m=U.modal('<h3>把短板交给高意向跟进</h3><p class="sub">'+esc(c.rep)+' × '+esc(c.cu)+' · '+c.score+' 分 · 勾选要带去个人明细并转成补课任务的短板</p>'+
   '<div class="chips" id="hoSb">'+low.map(function(i){ return '<label class="chip"><input type="checkbox" checked value="'+DATA.steps[i].n+'"><span>'+DATA.steps[i].n+' · '+c.sc[i]+'</span></label>'; }).join('')+'</div>'+
   '<p class="sub" style="margin-top:12px">同时把 '+esc(c.cu)+' 标记为「高意向 · 待二次跟进」，下一通按“先问三问再报价”打。</p>'+
   '<div class="row-btns"><button class="btn" data-close>取消</button><button class="btn red" id="hoGo">确认，去个人明细 →</button></div>');
  m.querySelector('#hoGo').onclick=function(){
    var picks=U.$$('#hoSb input:checked',m).map(function(i){return i.value;}); U.S.shortboards=picks; U.S.review=ci; U.S.followUp={cu:c.cu,rep:c.rep,score:c.score}; U.save(); U.closeModal(); U.go('profile',{from:'review',call:ci,adv:c.rep==='苏晴'?'su':(c.rep==='陈默'?'chen':'fang')});
  };
}
function onClick(e){
  var t=e.target;
  var a;
  if((a=t.closest('[data-call]'))){ ci=+a.getAttribute('data-call'); open=0; draw(); return; }
  if((a=t.closest('[data-cell]'))){ open=+a.getAttribute('data-cell'); draw(); var d=U.$('.det',root); if(d&&window.innerWidth<=900) d.scrollIntoView({block:'nearest'}); return; }
  if((a=t.closest('[data-st]'))){ open=+a.getAttribute('data-st'); tab='score'; draw(); U.$('.det',root).scrollIntoView({block:'center'}); return; }
  if((a=t.closest('[data-tab]'))&&a.closest('#rvSeg')){ tab=a.getAttribute('data-tab'); U.$('.rv-grid',root).setAttribute('data-tab',tab); U.$$('#rvSeg button',root).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tab')===tab);}); return; }
  if(t.closest('#rvRe')){ var tb=U.$('.tr-body',root); tb.innerHTML='<div class="re"><span class="spin"></span> 重新转写并评分中…</div>'; U.setTimeout(function(){ draw(); U.toast('已重新打开：评分与逐字稿已刷新'); },1300); return; }
  if(t.closest('#rvNext')){ handoff(); }
}
Pages.review={render:render,destroy:function(){ root=null; }};
})();
