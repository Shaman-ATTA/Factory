// Управление в стиле мобильного Mindustry (MobileInput.java):
// тап = план-призрак, ✓ = подтвердить, строитель «Альфа» летит и строит; протяжка = линия;
// 🔨 = снос (тап/область); ⧉ = копирование области (схема) с перетаскиванием призраков; ✕ = отмена; щипок = зум.
const INP={plans:[],mode:'none',drag:true,instant:false,line:null,rect:null,pasted:false};
const planAt=(x,y)=>INP.plans.find(p=>p.x===x&&p.y===y);
const bqAt=(x,y)=>G&&G.bq&&G.bq.find(p=>p.x===x&&p.y===y);
function planOk(p,inQ){if(!inMap(p.x,p.y))return false;if(p.brk){const b=bAt(p.x,p.y);return !!b&&!b.core;}if(p.re){const b=bAt(p.x,p.y);return !!b&&b.t==='conveyor';}return canPlace(p.t,p.x,p.y)&&(inQ||!bqAt(p.x,p.y));}
function addPlan(p){const o=planAt(p.x,p.y);if(o)INP.plans.splice(INP.plans.indexOf(o),1);INP.plans.push(p);if(!S.confirm&&!INP.pasted)commitPlans();updActs();}
function doPlan(p){if(p.brk){const b=bAt(p.x,p.y);if(b&&!b.core){removeB(b,true);puff(p.x+.5,p.y+.5,'#f66',6,.6);SND.play('remove');}return true;}
 if(p.re){const b=bAt(p.x,p.y);if(b&&b.t==='conveyor')b.rot=p.r;return true;}return !!place(p.t,p.x,p.y,p.r);}
function commitPlans(){if(!G)return;let n=0;for(const p of INP.plans){if(!planOk(p))continue;n++;if(INP.instant||p.re)doPlan(p);else G.bq.push({...p,prog:0});}
 INP.plans=[];INP.pasted=false;if(n)SND.play('click');updActs();}
function cancelAll(){INP.plans=[];INP.line=INP.rect=null;INP.pasted=false;INP.mode='none';delMode=false;tool=null;if(G)G.bq=[];selB(null);updTools();updActs();}
// ---- строитель «Альфа» ----
const bTime=p=>p.brk?.25:.2+Object.values(B[p.t].cost).reduce((a,b)=>a+b,0)/180;
let nrT=0;
function alphaStep(dt){if(!G)return;if(!G.bq)G.bq=[];if(!G.alpha)G.alpha={x:G.core.x+.5,y:G.core.y+.5,a:0,bob:0};const A=G.alpha;
 while(G.bq.length&&!planOk(G.bq[0],1))G.bq.shift();
 let q=G.bq[0];if(q&&!q.brk&&!afford(B[q.t].cost)){const i=G.bq.findIndex(p=>p.brk||afford(B[p.t].cost));if(i>0){G.bq.push(...G.bq.splice(0,i));q=G.bq[0];}else{q=null;nrT-=dt;if(nrT<=0){toast(T('noRes'));nrT=4;}}}
 const tx=q?q.x+.5:G.core.x+1.6,ty=q?q.y-.9:G.core.y-.6,dx=tx-A.x,dy=ty-A.y,d=Math.hypot(dx,dy),sp=10*dt;
 if(d>.05){A.a=Math.atan2(dy,dx);const k=Math.min(1,sp/d);A.x+=dx*k;A.y+=dy*k;}A.bob+=dt;A.tgt=null;
 if(q&&Math.hypot(q.x+.5-A.x,q.y+.5-A.y)<2.2){A.tgt=q;q.prog+=dt/bTime(q);if(q.prog>=1){G.bq.shift();doPlan(q);}}}
const _step=step;step=function(dt){_step(dt);if(G&&!G.over)alphaStep(dt);};
const _start=start;start=function(...a){const r=_start(...a);INP.plans=[];INP.mode='none';INP.pasted=false;if(G){G.bq=[];G.alpha=null;}updActs();return r;};
// ---- линия (путь пальца, как раньше, но в виде планов) ----
function lineTiles(L){const out=[];const P=L.path;for(let i=0;i<P.length;i++){const [x,y]=P[i];let r;if(i<P.length-1){const n=P[i+1];r=n[0]>x?0:n[0]<x?2:n[1]>y?1:3;}else if(i>0){const pv=P[i-1];r=x>pv[0]?0:x<pv[0]?2:y>pv[1]?1:3;}else r=rot;out.push([x,y,r]);}return out;}
function linePlans(L){const res=[];for(const [x,y,r] of lineTiles(L)){const b=bAt(x,y);
 if(b){if(tool==='conveyor'&&b.t==='conveyor'&&res.length===0&&L.path.length>1){const f=DIRS[b.rot],fb=bAt(x+f[0],y+f[1]);if(!fb||fb===b)res.push({t:'conveyor',x,y,r,re:true});}continue;}
 res.push({t:tool,x,y,r});}return res;}
function lineExtend(L,x,y){const P=L.path;let [cx,cy]=P[P.length-1];let guard=0;while((cx!==x||cy!==y)&&guard++<200){if(cx!==x)cx+=x>cx?1:-1;else cy+=y>cy?1:-1;
 const pv=P[P.length-2];if(pv&&pv[0]===cx&&pv[1]===cy)P.pop();else P.push([cx,cy]);}if(P.length>1){const l=P[P.length-1],p2=P[P.length-2];rot=l[0]>p2[0]?0:l[0]<p2[0]?2:l[1]>p2[1]?1:3;}}
// ---- жесты ----
const pt2=new Map();let pin=null,gs=null;
function tapAt(x,y){if(!G||G.over)return;const pl=planAt(x,y);if(pl){INP.plans.splice(INP.plans.indexOf(pl),1);SND.play('click');updActs();return;}
 const b=bAt(x,y);
 if(INP.mode==='break'){if(b&&!b.core){addPlan({x,y,brk:true});SND.play('click');}return;}
 if(tool){if(tool==='conveyor'&&b&&b.t==='conveyor'){b.rot=(b.rot+1)%4;rot=b.rot;SND.play('click');return;}
  if(b&&!b.core){tool=null;updTools();updActs();selB(b);return;}
  if(canPlace(tool,x,y)&&!bqAt(x,y)){addPlan({t:tool,x,y,r:rot});SND.play('click');vib(5);}else failMsg(tool,x,y);return;}
 selB(b||null);if(b)SND.play('click');}
function finishRect(){const R=INP.rect;INP.rect=null;if(!R)return;const x0=Math.min(R.x0,R.x1),x1=Math.max(R.x0,R.x1),y0=Math.min(R.y0,R.y1),y1=Math.max(R.y0,R.y1);
 if(INP.mode==='break'){for(const b of G.blds)if(!b.core&&b.x>=x0&&b.x<=x1&&b.y>=y0&&b.y<=y1)addPlan({x:b.x,y:b.y,brk:true});return;}
 if(INP.mode==='copy'){const src=G.blds.filter(b=>!b.core&&b.x>=x0&&b.x<=x1&&b.y>=y0&&b.y<=y1&&B[b.t]);if(!src.length){INP.mode='none';updActs();return;}
  const ox=Math.round(cam.x)-Math.round((x0+x1)/2),oy=Math.round(cam.y)-Math.round((y0+y1)/2)+(oy0=>oy0)(0);INP.plans=[];INP.pasted=true;
  for(const b of src)INP.plans.push({t:b.t,x:b.x+ox+(x1-x0+2)*(ox===0&&oy===0?1:0),y:b.y+oy,r:b.rot||0});INP.mode='none';toast(T('inpPaste'));updActs();}}
function rotPlans(){const P=INP.plans.filter(p=>!p.brk);if(!P.length)return;const cx=Math.round(P.reduce((a,p)=>a+p.x,0)/P.length),cy=Math.round(P.reduce((a,p)=>a+p.y,0)/P.length);
 for(const p of P){const dx=p.x-cx,dy=p.y-cy;p.x=cx-dy;p.y=cy+dx;p.r=((p.r||0)+1)%4;}}
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pt2.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pt2.size===2){if(gs&&gs.lp)clearTimeout(gs.lp);gs=null;INP.line=null;INP.rect=null;const[a,b]=[...pt2.values()];pin={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.z,mx:(a.x+b.x)/2,my:(a.y+b.y)/2};return;}
 if(pt2.size!==1)return;const[wx,wy]=toW(e.clientX,e.clientY);hover=[wx,wy];const tx=Math.floor(wx),ty=Math.floor(wy);
 gs={sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY,moved:0,tx,ty,kind:null};
 if(INP.mode==='copy'||(INP.mode==='break'&&INP.drag)){gs.kind='rect';INP.rect={x0:tx,y0:ty,x1:tx,y1:ty};}
 else if(INP.pasted&&planAt(tx,ty)){gs.kind='shift';gs.ax=tx;gs.ay=ty;}
 else if(tool&&INP.drag){gs.kind='line';INP.line={path:[[tx,ty]]};}
 else if(tool){gs.lp=setTimeout(()=>{if(gs&&!gs.kind&&gs.moved<10){gs.kind='line';INP.line={path:[[tx,ty]]};vib(15);}},380);}});
cv.addEventListener('pointermove',e=>{const p=pt2.get(e.pointerId);hover=toW(e.clientX,e.clientY);if(!p)return;p.x=e.clientX;p.y=e.clientY;
 if(pin&&pt2.size>=2){const[a,b]=[...pt2.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  cam.z=Math.max(10,Math.min(90,pin.z*d/pin.d));cam.x-=(mx-pin.mx)/cam.z;cam.y-=(my-pin.my)/cam.z;pin.mx=mx;pin.my=my;clampCam();return;}
 if(!gs)return;const dx=e.clientX-gs.lx,dy=e.clientY-gs.ly;gs.moved+=Math.abs(dx)+Math.abs(dy);gs.lx=e.clientX;gs.ly=e.clientY;
 const tx=Math.floor(hover[0]),ty=Math.floor(hover[1]);
 if(!gs.kind&&gs.moved>=10){gs.kind='pan';if(gs.lp)clearTimeout(gs.lp);}
 if(gs.kind==='pan'){cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam();}
 else if(gs.kind==='line'){lineExtend(INP.line,tx,ty);edgePan(e);}
 else if(gs.kind==='rect'){INP.rect.x1=tx;INP.rect.y1=ty;edgePan(e);}
 else if(gs.kind==='shift'&&(tx!==gs.ax||ty!==gs.ay)){for(const q of INP.plans){q.x+=tx-gs.ax;q.y+=ty-gs.ay;}gs.ax=tx;gs.ay=ty;}});
function edgePan(e){const m=50;let px=0,py=0;if(e.clientX<m)px=-1;else if(e.clientX>W-m)px=1;if(e.clientY<m)py=-1;else if(e.clientY>H-m)py=1;if(px||py){cam.x+=px*.15;cam.y+=py*.15;clampCam();}}
function endP2(e){pt2.delete(e.pointerId);if(pt2.size<2)pin=null;if(!gs||pt2.size)return;if(gs.lp)clearTimeout(gs.lp);const g=gs;gs=null;
 if(g.moved<10&&g.kind!=='rect'){INP.line=null;tapAt(g.tx,g.ty);return;}
 if(g.kind==='rect'){if(g.moved<10&&INP.mode==='break'){INP.rect=null;tapAt(g.tx,g.ty);return;}finishRect();return;}
 if(g.kind==='line'){const L=INP.line;INP.line=null;if(L){const ps=linePlans(L);const conf=S.confirm;if(!conf)for(const p of ps)if(p.re)doPlan(p);
   for(const p of ps){if(p.re&&!conf)continue;const o=planAt(p.x,p.y);if(o)INP.plans.splice(INP.plans.indexOf(o),1);INP.plans.push(p);}if(!conf)commitPlans();updActs();}}}
cv.addEventListener('pointerup',endP2);cv.addEventListener('pointercancel',endP2);
// ---- кнопки ----
(function(){const A=$('acts');A.innerHTML=`<button id="bCancel" title="Отмена">✕</button><button id="bOk" title="Подтвердить">✓<small id="okN"></small></button><button id="bRot">↻</button><button id="bDel" title="Снос">🔨</button><button id="bDrag">✏️</button>`;
 $('bCancel').onclick=()=>{cancelAll();SND.play('click');};$('bOk').onclick=()=>commitPlans();
 $('bRot').onclick=()=>{SND.play('click');if(tool){rot=(rot+1)%4;updActs();return;}if(INP.pasted){rotPlans();return;}if(sel&&sel.t==='conveyor'){sel.rot=(sel.rot+1)%4;return;}
  INP.mode=INP.mode==='copy'?'none':'copy';if(INP.mode==='copy'){selB(null);toast(T('inpCopy'));}updActs();};
 $('bDel').onclick=()=>{SND.play('click');INP.mode=INP.mode==='break'?'none':'break';delMode=INP.mode==='break';if(delMode){tool=null;selB(null);updTools();toast(T('inpBreak'));}updActs();};
 $('bDrag').onclick=()=>{INP.drag=!INP.drag;SND.play('click');toast(T(INP.drag?'dragBuild':'dragPan'));updActs();};
 const bb=$('build');const h=document.createElement('button');h.id='bColl';h.textContent='▾';h.onclick=()=>{bb.classList.toggle('coll');h.textContent=bb.classList.contains('coll')?'▴':'▾';};bb.prepend(h);})();
function updActs(){if(!$('bOk'))return;const n=INP.plans.length;$('bOk').classList.toggle('hide',!n);$('okN').textContent=n?n:'';
 $('bCancel').classList.toggle('hide',!(n||tool||INP.mode!=='none'||(G&&G.bq&&G.bq.length)));
 const r=$('bRot');r.textContent=tool?'➜':INP.pasted?'⟳':'⧉';r.style.transform=tool?`rotate(${rot*90}deg)`:'';r.classList.toggle('on',INP.mode==='copy');
 $('bDel').classList.toggle('on',INP.mode==='break');$('bDrag').textContent=INP.drag?'✏️':'✋';$('bDrag').classList.toggle('on',INP.drag);$('bDrag').classList.toggle('hide',!tool&&INP.mode!=='break');}
const _updTools=updTools;updTools=function(){_updTools();updActs();};
addEventListener('keydown',e=>{if(e.code==='Enter')commitPlans();if(e.code==='Escape')cancelAll();});
// ---- отрисовка планов, выделения и строителя ----
const _draw=draw;draw=function(){_draw();if(!G)return;const c=ctx,z=cam.z*DPR;c.setTransform(z,0,0,z,DPR*W/2-cam.x*z,DPR*H/2-cam.y*z);
 const ghost=(p,col,a)=>{if(p.brk){c.fillStyle='rgba(255,60,60,.28)';c.fillRect(p.x,p.y,1,1);c.strokeStyle='#ff5050';c.lineWidth=.07;c.strokeRect(p.x+.04,p.y+.04,.92,.92);c.beginPath();c.moveTo(p.x+.25,p.y+.25);c.lineTo(p.x+.75,p.y+.75);c.moveTo(p.x+.75,p.y+.25);c.lineTo(p.x+.25,p.y+.75);c.stroke();return;}
  c.globalAlpha=a;if(!p.re)drawBlock(c,{...newB(p.t,p.x,p.y,p.r),ang:Math.PI*p.r/2},true);c.globalAlpha=1;c.strokeStyle=col;c.lineWidth=.06;c.strokeRect(p.x+.03,p.y+.03,.94,.94);if(p.t==='conveyor'||p.re)arrow(c,p.x,p.y,p.r,col);};
 const pulse=.45+.15*Math.sin(now/180);
 for(const p of INP.plans)ghost(p,planOk(p)?'#f0c040':'#ff5050',pulse);
 if(INP.line)for(const p of linePlans(INP.line))ghost(p,planOk(p)&&afford(B[p.t].cost)?'#7fff8f':'#ff5050',.55);
 for(const p of G.bq||[]){ghost(p,'#60c8ff',.35);c.fillStyle='#60c8ff';c.fillRect(p.x+.1,p.y+.86,.8*Math.min(1,p.prog),.08);}
 if(INP.rect){const R=INP.rect,x0=Math.min(R.x0,R.x1),y0=Math.min(R.y0,R.y1),w=Math.abs(R.x1-R.x0)+1,h=Math.abs(R.y1-R.y0)+1;const col=INP.mode==='break'?'255,80,80':'90,200,255';
  c.fillStyle=`rgba(${col},.15)`;c.fillRect(x0,y0,w,h);c.strokeStyle=`rgb(${col})`;c.lineWidth=.07;c.setLineDash([.3,.15]);c.strokeRect(x0,y0,w,h);c.setLineDash([]);}
 const A=G.alpha;if(A){const y=A.y+Math.sin(A.bob*3)*.06;if(A.tgt){c.strokeStyle='rgba(120,220,255,.7)';c.lineWidth=.05;c.setLineDash([.12,.08]);c.lineDashOffset=-now/80;c.beginPath();c.moveTo(A.x,y);c.lineTo(A.tgt.x+.5,A.tgt.y+.5);c.stroke();c.setLineDash([]);
   c.fillStyle='rgba(120,220,255,.18)';c.fillRect(A.tgt.x,A.tgt.y,1,1);}
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(A.x+.25,A.y+.45,.28,.14,0,0,7);c.fill();
  c.save();c.translate(A.x,y);c.rotate(A.a);c.fillStyle='#ffb347';c.beginPath();c.moveTo(.42,0);c.lineTo(-.3,-.3);c.lineTo(-.16,0);c.lineTo(-.3,.3);c.closePath();c.fill();c.strokeStyle='#5a3a10';c.lineWidth=.04;c.stroke();
  c.fillStyle='#fff6d0';c.beginPath();c.arc(.06,0,.08,0,7);c.fill();c.fillStyle=`rgba(120,200,255,${.5+.4*Math.sin(now/60)})`;c.beginPath();c.arc(-.26,0,.07,0,7);c.fill();c.restore();}
 c.setTransform(1,0,0,1,0,0);};
updActs();
