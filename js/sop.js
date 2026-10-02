/* SOP 迭代弹层（个人明细 / 陪练 共用） */
(function(){
'use strict';
window.Pages=window.Pages||{};
var SOP=window.SOP={};
var SOURCES=['抖音主页 / 私信','小红书私信','视频号直播','老客转介绍','线下展会扫码'];
var BLOCKS=['客户问价就报价','挖掘问题不够 3 个','异议直接让步','结束没约具体时间','案例讲太长'];
SOP.open=function(from){
  var sb=U.S.shortboards||[]; var pre={}; 
  // 按复盘短板预勾阻碍
  sb.forEach(function(n){ if(n==='报价')pre[0]=1; if(n==='定位需求'||n==='挖掘痛点')pre[1]=1; if(n==='异议处理')pre[2]=1; if(n==='约下一步')pre[3]=1; if(n==='讲案例')pre[4]=1; });
  if(!sb.length){ pre[0]=1; pre[1]=1; }
  var ok=U.S.practiceDone;
  var html='<h3>确认今日源单与阻碍</h3><p class="sub">把本周成交数据交给 SOP 迭代 · 本周 18 通 · 约访率 22% · 成交 1 单'+(sb.length?' · 已带入复盘短板：'+U.esc(sb.join('、')):'')+'</p>'+
   '<div class="sop-form"><h4>今日源单（成交线索来自哪）</h4><div class="chips" id="sopSrc">'+SOURCES.map(function(s,i){return '<label class="chip"><input type="radio" name="src" value="'+i+'"'+(i===0?' checked':'')+'><span>'+s+'</span></label>';}).join('')+'</div>'+
   '<h4>今日阻碍（可多选）</h4><div class="chips" id="sopBlk">'+BLOCKS.map(function(s,i){return '<label class="chip"><input type="checkbox" value="'+i+'"'+(pre[i]?' checked':'')+'><span>'+s+'</span></label>';}).join('')+'</div>'+
   '<div class="sop-check"><span class="pill '+(ok?'green':'warn')+'">'+(ok?'✓ 今日陪练已完成'+(U.S.practiceScore?'（'+U.S.practiceScore+' 分）':''):'△ 今日陪练未完成（演示可继续提交）')+'</span></div></div>'+
   '<div class="row-btns"><button class="btn" data-close>取消</button><button class="btn red" id="sopGo">确认并开始 SOP 迭代 →</button></div>';
  var m=U.modal(html,{cls:'sop'});
  m.querySelector('#sopGo').addEventListener('click',function(){
    var src=SOURCES[+m.querySelector('input[name=src]:checked').value];
    var blk=U.$$('#sopBlk input:checked',m).map(function(i){return BLOCKS[+i.value];});
    run(m,src,blk);
  });
};
function run(m,src,blk){
  var logs=['读取本周 18 通通话得分与 8 条三方通话转写…','对齐口径 M11 / M18 / S06 …','汇总源单：'+src+'；阻碍：'+(blk.join('、')||'无'),'比对成交 1 单 vs 未成交 17 单的差异片段…','生成 SOP v3.3 草案…'];
  m.innerHTML='<h3>SOP 迭代中 <span class="spin" style="vertical-align:-3px;margin-left:6px"></span></h3><p class="sub">本地模型处理，约 3 秒（演示）</p><div class="pbar"><i id="sopPb" style="width:4%"></i></div><ul class="sop-log" id="sopLog"></ul>';
  var i=0; var log=m.querySelector('#sopLog'); var pb=m.querySelector('#sopPb');
  var iv=U.setInterval(function(){
    if(!document.body.contains(log)){ clearInterval(iv); return; }
    if(i<logs.length){ log.insertAdjacentHTML('beforeend','<li><time>['+U.now()+']</time> '+U.esc(logs[i])+'</li>'); i++; pb.style.width=Math.round(i/logs.length*92)+'%'; }
    else{ clearInterval(iv); pb.style.width='100%'; U.setTimeout(function(){ if(document.body.contains(log)) result(m,src,blk); },350); }
  },560);
}
function result(m,src,blk){
  U.S.sopDone=true; U.save();
  var s=DATA.sop;
  m.innerHTML='<button class="modal-x" data-close aria-label="关闭">×</button><h3>✓ SOP 迭代完成：'+s.from+' → <span style="color:var(--red)">'+s.to+'</span></h3><p class="sub">源单：'+U.esc(src)+' · 阻碍：'+U.esc(blk.join('、')||'无')+' · 已生效于下一轮陪练与打法卡</p>'+
   '<ul class="sop-diff">'+s.diffs.map(function(d){ return '<li><span class="pill '+(d[3]==='新增'?'green':'org')+'">'+d[3]+'</span><div><b>'+d[0]+'</b><p>'+d[1]+'</p></div><span class="pill blue">'+d[2]+'</span></li>'; }).join('')+'</ul>'+
   '<div class="sop-lift">'+s.lift.map(function(l){ return '<div><small>'+l[0]+'</small><b>'+l[1]+'</b><em>'+l[2]+'</em></div>'; }).join('')+'</div>'+
   '<div class="row-btns"><button class="btn" id="sopHome">回工作台接新客户</button><button class="btn red" id="sopNext">去陪练验证新 SOP →</button></div>';
  m.querySelector('#sopHome').onclick=function(){ U.closeModal(); U.go('workbench'); };
  m.querySelector('#sopNext').onclick=function(){ U.closeModal(); U.go('practice',{from:'sop'}); };
}
})();
