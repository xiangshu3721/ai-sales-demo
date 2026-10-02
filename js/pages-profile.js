/* 5. 个人明细 */
(function(){
'use strict';
window.Pages=window.Pages||{};
var esc=U.esc; var root, adv, sel=-1, from=null;
function radar(a,over){
  var cx=160,cy=150,R=100,n=6; var labels=DATA.dims6;
  function pt(i,v,k){ var ang=-Math.PI/2+i*2*Math.PI/n; var rr=R*(v/100)*(k||1); return [cx+rr*Math.cos(ang),cy+rr*Math.sin(ang)]; }
  function poly(vs){ return vs.map(function(v,i){ var p=pt(i,v); return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' '); }
  var s='<svg viewBox="0 0 320 300" role="img" aria-label="六维雷达图" class="radar-svg" id="radarSvg">';
  [20,40,60,80,100].forEach(function(l){ s+='<polygon points="'+poly([l,l,l,l,l,l])+'" fill="'+(l===100?'#fff':'none')+'" stroke="#e5dcc9" stroke-width="1"/>'; });
  for(var i=0;i<n;i++){ var p=pt(i,100); s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+'" stroke="#e5dcc9"/>'; }
  s+='<polygon class="r-avg" points="'+poly(a.avg)+'" fill="none" stroke="#9a9187" stroke-width="2" stroke-dasharray="2 4" stroke-linecap="round"/>';
  s+='<polygon class="r-best" points="'+poly(a.best)+'" fill="none" stroke="#2f6fed" stroke-width="2" stroke-dasharray="7 5"/>';
  if(over) s+='<polygon class="r-sel" points="'+poly(over)+'" fill="rgba(239,138,60,.18)" stroke="#ef8a3c" stroke-width="2"/>';
  s+='<polygon class="r-me" points="'+poly(a.radar)+'" fill="rgba(217,72,43,.2)" stroke="#d9482b" stroke-width="2.5" stroke-linejoin="round"/>';
  a.radar.forEach(function(v,i){ var p=pt(i,v); s+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4" fill="#d9482b" stroke="#fff" stroke-width="1.5"/>'; });
  labels.forEach(function(l,i){ var p=pt(i,100,1.2); var anchor=Math.abs(p[0]-cx)<6?'middle':(p[0]>cx?'start':'end'); var low=a.radar[i]<60;
    s+='<text x="'+p[0].toFixed(1)+'" y="'+(p[1]+4).toFixed(1)+'" text-anchor="'+anchor+'" font-size="12.5" fill="#5d554c">'+l+' <tspan font-weight="700" fill="'+(low?'#d9482b':'#2b2622')+'">'+a.radar[i]+'</tspan></text>'; });
  return s+'</svg>';
}
function render(r,q){
  root=r; from=q&&q.from==='review'?q:null; sel=-1;
  var k=(q&&q.adv)||'su'; adv=DATA.advisors.filter(function(a){return a.k===k;})[0]||DATA.advisors[0];
  r.addEventListener('click',onClick);
  draw();
}
function draw(anim){
  var a=adv; var sb=U.S.shortboards||[];
  var cards=DATA.advisors.map(function(x){ return '<button class="ad'+(x.k===a.k?' on':'')+'" data-adv="'+x.k+'"><span class="av" style="background:'+x.color+'">'+x.av+'</span><div><b>'+x.name+'</b><small>本周 '+x.total+' 分</small></div></button>'; }).join('');
  var rows=a.rows.map(function(r,i){
    var d=r[5];
    return '<tr class="'+(i===sel?'on':'')+(anim?' ani':'')+'" style="'+(anim?'animation-delay:'+(i*70)+'ms':'')+'" data-row="'+i+'"><td data-l="时间">'+r[0]+'</td><td data-l="客户">'+r[1]+'</td><td data-l="时长">'+r[2]+'</td><td data-l="总分" class="sc'+(r[3]<65?' low':'')+'">'+r[3]+'</td><td data-l="主要失分点" class="ls">'+esc(r[4])+'</td><td class="go"><button class="lnk" data-row="'+i+'">六维小分 →</button></td></tr>'+
     (i===sel?'<tr class="sub-r"><td colspan="6"><div class="six">'+DATA.dims6.map(function(n,j){ return '<div><span>'+n+'</span><div class="pbar"><i style="width:'+d[j]+'%;background:'+(d[j]<55?'var(--red)':d[j]<70?'var(--orange)':'var(--green)')+'"></i></div><b class="'+(d[j]<55?'r':'')+'">'+d[j]+'</b></div>'; }).join('')+'</div></td></tr>':'');
  }).join('');
  var legend='<div class="lg"><span><i class="l1"></i>本人</span><span><i class="l2"></i>团队最好（'+a.bestName+'）</span><span><i class="l3"></i>团队均值</span>'+(sel>=0?'<span><i class="l4"></i>所选通话</span>':'')+'</div>';
  root.innerHTML='<div class="pf">'+
   '<div class="pf-hd"><div><h1>个人明细 <span class="done-badge">完成</span></h1><p>本周通话得分、规律、成长曲线</p></div><button class="btn red" id="pfRe">重新展开</button></div>'+
   (from?'<div class="pf-ban"><b>来自通话复盘 · 高意向跟进已创建</b>：'+(sb.length?'已带入短板 '+sb.map(function(s){return '<span class="pill red">'+esc(s)+'</span>';}).join(' '):'已带入本通复盘')+(U.S.followUp?' · 客户 '+esc(U.S.followUp.cu)+' 标记为二次跟进':'')+' <a class="lnk" href="#/practice?from=review">去陪练补课 →</a></div>':'')+
   '<div class="ads" id="ads">'+cards+'</div><p class="tipn">点上方人卡可切换顾问</p>'+
   '<section class="card pf-me"><div class="pf-id"><span class="av lg" style="background:'+a.color+'">'+a.av+'</span><div><h2>'+a.name+'</h2><div>'+a.tags.map(function(t){return '<span class="pill'+(t==='待辅导'?' red':'')+'">'+t+'</span>';}).join(' ')+'</div></div></div>'+
   '<div class="pf-sc"><b>'+a.total+'</b><small>本周总分</small></div>'+
   '<div class="pf-st"><div><b>'+a.calls+'</b><small>本周通话</small></div><div><b>'+a.rate+'%</b><small>约访率</small></div><div><b>'+a.deals+'</b><small>成交</small></div><div><b class="'+(a.trend>=0?'up':'dn')+'">'+(a.trend>=0?'↑':'↓')+Math.abs(a.trend)+'</b><small>趋势</small></div></div></section>'+
   '<section class="card pf-tb"><div class="tb-h"><p>本周 <b>'+a.calls+'</b> 通都有得分，三方接通的 <b>8</b> 通列在这里</p><span class="pill red">总分低于 65 为红</span></div><div class="tb-w"><table class="ctab"><thead><tr><th>时间</th><th>客户</th><th>时长</th><th>总分</th><th>主要失分点</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></section>'+
   '<div class="pf-two"><section class="card pf-rd"><div class="pn-h"><b>六维雷达</b>'+legend+'</div>'+radar(a,sel>=0?a.rows[sel][5]:null)+'<div class="cmp">'+a.cmp.map(function(c){ return '<div><small>'+c[0]+'</small><b class="'+(c[1]<50?'r':'')+'">'+c[1]+'</b><span>'+c[3]+'（均值 '+c[2]+'）</span></div>'; }).join('')+'</div></section>'+
   '<section class="card pf-pt"><div class="pn-h"><b>规律</b><small>按关键词分段，从通话录音里算出来</small></div><ol class="pats">'+a.pats.map(function(p){ return '<li><p>'+esc(p[0])+'</p><div><span class="pill blue">口径 '+p[1]+'</span><span class="act">→ '+esc(p[2])+'</span></div></li>'; }).join('')+'</ol></section></div>'+
   '<div class="pf-cta"><small>报告与今日陪练完成后可提交'+(U.S.practiceDone?' · <b class="g">今日陪练已完成 ✓</b>':'')+'</small><button class="cta light" id="pfSop">确认今日源单与阻碍，把本周成交数据交给 SOP 迭代 →</button></div></div>';
}
function onClick(e){
  var t=e.target, a;
  if((a=t.closest('[data-adv]'))){ adv=DATA.advisors.filter(function(x){return x.k===a.getAttribute('data-adv');})[0]; sel=-1; draw(true); return; }
  if((a=t.closest('[data-row]'))){ var i=+a.getAttribute('data-row'); sel=(sel===i?-1:i); draw(); var r=U.$('.ctab tr.on',root); if(r&&window.innerWidth<=900) r.scrollIntoView({block:'nearest'}); return; }
  if(t.closest('#pfRe')){ sel=-1; draw(true); U.toast('已重新展开：本周 '+adv.calls+' 通得分与规律已刷新'); return; }
  if(t.closest('#pfSop')){ SOP.open('profile'); }
}
Pages.profile={render:render,destroy:function(){ root=null; }};
})();
