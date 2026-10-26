'use strict';
{
// Phase C: Mindustry-style logistics (bridge, sorter, overflow gate, titanium belt), salvo & arc turrets,
// wave preview, minimap, achievements, daily challenge.
Object.assign(B,{
 tconv:{cat:'log',cost:{copper:1,lead:1,titanium:1},hp:65,walk:true},
 bridge:{cat:'log',cost:{copper:6,lead:6},hp:70,walk:true,range:4},
 sorter:{cat:'log',cost:{copper:2,lead:2},hp:70,walk:true},
 overflow:{cat:'log',cost:{copper:4,lead:2},hp:70,walk:true},
 salvo:{cat:'def',cost:{copper:100,graphite:50,titanium:25},hp:520,solid:true,turret:true,up:true,range:11.5,reload:1.7,ammo:{graphite:22,silicon:26},cap:48},
 arc:{cat:'def',cost:{copper:50,lead:50},hp:260,solid:true,turret:true,up:true,range:5.5,reload:.55,use:1.5,arc:28}});
for(const k of['tconv','bridge','sorter','overflow','salvo','arc'])Object.defineProperty(B[k],'n',{get:()=>T('b_'+k)});
ORDER.splice(ORDER.indexOf('router')+1,0,'sorter','overflow','bridge','tconv');ORDER.splice(ORDER.indexOf('lancer')+1,0,'arc','salvo');
LEVELS[1].unlock.push('sorter','overflow');LEVELS[2].unlock.push('bridge');LEVELS[3].unlock.push('arc');LEVELS[6].unlock.push('tconv','salvo');
Object.assign(I18N.ru,{b_tconv:'Титан. конвейер',d_tconv:'Конвейер в 1.7 раза быстрее обычного.',b_bridge:'Мост',d_bridge:'Переносит предметы над постройками и врагами на расстояние до 4 клеток к следующему мосту по направлению стрелки.',
 b_sorter:'Сортировщик',d_sorter:'Выбранный ресурс идёт прямо, остальное — в стороны. Ресурс выбирается тапом по сортировщику.',b_overflow:'Перелив',d_overflow:'Пропускает прямо, а когда впереди занято — сбрасывает в стороны.',
 b_salvo:'Залп',d_salvo:'Тяжёлая турель: очередь из 4 выстрелов графитом или кремнием.',b_arc:'Дуга',d_arc:'Энергетическая турель ближнего боя: молния перескакивает между 3 наземными врагами. Не нужны патроны, нужна энергия.',
 nextW:'След.',ach:'Достижения',achGot:'🏆 Достижение: {0}',daily:'Испытание дня',dailyBest:'лучшее: волна {0}',srtPick:'Сортировать:',
 a_first:'Первый бур',a_belt50:'50 конвейеров',a_kill100:'100 врагов',a_kill1000:'1000 врагов',a_graph:'Графит пошёл',a_si:'Кремниевая эра',a_boss:'Победа над боссом',a_wave20:'20 волн подряд',a_sort:'Логист'});
let arcs=[];
// --- titanium conveyor = conveyor with sel 'ti'
const _place=place;place=function(t,x,y,r,free){if(t!=='tconv')return _place(t,x,y,r,free);if(!free&&!afford(B.tconv.cost))return false;
 if(!_place('conveyor',x,y,r,free?free:'aj'))return false;if(!free)for(const[k,v]of Object.entries(B.tconv.cost))G.res[k]-=v;const b=bAt(x,y);b.sel='ti';b.hp=B.tconv.hp;return true;};
const _canPlace=canPlace;canPlace=function(t,x,y){return _canPlace(t==='tconv'?'conveyor':t,x,y);};
// --- routing
function frontOf(b,sx,sy){return[b.x*2-sx,b.y*2-sy];}
function bridgeLink(b){const d=DIRS[b.rot];for(let i=1;i<=B.bridge.range;i++){const n=bAt(b.x+d[0]*i,b.y+d[1]*i);if(n&&n.t==='bridge')return n;}return null;}
const _offer=offer;offer=function(b,it,sx,sy){if(!b)return false;const t=b.t;
 if(t==='sorter'||t==='overflow'){if(b.busy)return false;b.busy=1;try{const[fx,fy]=frontOf(b,sx,sy),dx=fx-b.x,dy=fy-b.y;const sides=[[b.x-dy,b.y+dx],[b.x+dy,b.y-dx]];if(b.flip)sides.reverse();
   const fw=()=>offer(bAt(fx,fy),it,b.x,b.y),sd=()=>{for(const[x,y]of sides){const n=bAt(x,y);if(n&&offer(n,it,b.x,b.y)){b.flip=!b.flip;return true;}}return false;};
   if(t==='sorter')return it===(b.sel||'copper')?fw():sd();return fw()||sd();}finally{b.busy=0;}}
 if(t==='bridge'){const d=DIRS[b.rot];if(b.x+d[0]===sx&&b.y+d[1]===sy)return false;if(b.buf.length>=4)return false;b.buf.push(it);return true;}
 return _offer(b,it,sx,sy);};
const _upd=updBuild;updBuild=function(b,dt){const t=b.t;
 if(t==='conveyor'&&b.sel==='ti')return _upd(b,dt*1.7);
 if(t==='bridge'){b.cd-=dt;if(!b.buf.length||b.cd>0)return;const l=bridgeLink(b);if(l){if(l.buf.length<4){l.buf.push(b.buf.shift());b.cd=.1;}}else{const d=DIRS[b.rot];if(offer(bAt(b.x+d[0],b.y+d[1]),b.buf[0],b.x,b.y)){b.buf.shift();b.cd=.08;}}return;}
 if(t==='arc'){b.cd-=dt;if(b.cd>0||b.pw<.05)return;const cx=b.x+.5,cy=b.y+.5,rg=B.arc.range+(b.lv-1)*.6;let px=cx,py=cy,hit=[];
  for(let j=0;j<3;j++){let best=null,bd=j?2.6**2:rg*rg;for(const e of enemies){if(e.fly||hit.includes(e))continue;const d=(e.x-px)**2+(e.y-py)**2;if(d<bd){bd=d;best=e;}}if(!best)break;
   arcs.push({x1:px,y1:py,x2:best.x,y2:best.y,life:.18,seed:Math.random()*99});hurt(best,B.arc.arc*lm(b)*(j?.7:1));hit.push(best);px=best.x;py=best.y;}
  if(hit.length){b.cd=B.arc.reload;b.flash=.1;b.ang=Math.atan2(hit[0].y-cy,hit[0].x-cx);SND.play('laser');}return;}
 return _upd(b,dt);};
const _ut=updTurret;updTurret=function(b,dt){if(b.t!=='salvo')return _ut(b,dt);const a0=b.ammo,bq=b.bq;_ut(b,dt);if(!bq&&b.ammo<a0){b.bq=3;b.bt=.09;}
 else if(b.bq>0){b.bt-=dt;if(b.bt<=0&&b.ammo>0){const cd=b.cd;b.cd=0;const s=b.ammo;_ut(b,0);if(b.ammo<s){b.bq--;b.bt=.09;}b.cd=cd;}}};

// --- drawing
const _thead=SPR.thead;SPR.thead=t=>t==='salvo'?spr('thsalvo',1.4,1,.15,c=>{c.translate(.5,.5);for(const o of[-.21,-.07,.07,.21]){c.fillStyle=lg(c,0,o-.05,0,o+.05,['#e0dccc','#8e8a78','#3a382c']);rrect(c,.05,o-.05,.55,.1,.02);c.fill();c.strokeStyle='#111';c.lineWidth=.015;c.stroke();}
  plate(c,-.32,-.3,.6,.6,.1,'#8e8a6c',{});c.fillStyle=TEAM;rrect(c,-.2,-.08,.3,.16,.03);c.fill();}):t==='arc'?spr('tharc',1.4,1,.15,c=>{c.translate(.5,.5);c.beginPath();c.moveTo(-.3,-.25);c.lineTo(.22,-.12);c.lineTo(.22,.12);c.lineTo(-.3,.25);c.closePath();c.fillStyle=lg(c,-.3,-.3,.3,.3,['#e8e0ff','#9a88c8','#3a3058']);c.fill();c.strokeStyle='#111';c.lineWidth=.03;c.stroke();
  for(const r of[.08,.16])c.fillRect(.22,-.02,.12+r,.04);lamp(c,.38,0,.07,'#b8a0ff');lamp(c,-.1,0,.08,TEAM);}):_thead(t);
const _db=drawBlock;drawBlock=function(c,b,icon){const t=b.t,x=b.x,y=b.y,tm=icon?0:now/1000;
 if(t==='tconv'||(t==='conveyor'&&b.sel==='ti')){_db(c,t==='tconv'?{...b,t:'conveyor'}:b,icon);c.save();c.globalAlpha=.32;c.fillStyle='#7ab8ff';c.fillRect(x,y,1,1);c.restore();if(!icon){const d=DIRS[b.rot];c.strokeStyle='#bfe0ff88';c.lineWidth=.04;c.beginPath();c.moveTo(x+.5-d[1]*.38,y+.5+d[0]*.38);c.lineTo(x+.5+d[1]*.38,y+.5-d[0]*.38);c.stroke();}return;}
 if(t==='bridge'||t==='sorter'||t==='overflow'){const col=t==='bridge'?'#6a6f7c':t==='sorter'?'#5f6a58':'#6a5c58';plate(c,x+.06,y+.06,.88,.88,.12,col,{rivets:.12});
  if(t==='bridge'){c.fillStyle='#1d2027';rrect(c,x+.25,y+.25,.5,.5,.08);c.fill();arrow(c,x,y,b.rot||0,'#f0a040cc');if(!icon){const l=bridgeLink(b);if(l){const ph=(tm*1.8)%1;c.strokeStyle='#f0a04066';c.lineWidth=.12;c.beginPath();c.moveTo(x+.5,y+.5);c.lineTo(l.x+.5,l.y+.5);c.stroke();
     for(let i=0;i<b.buf.length;i++){const k=(ph+i/4)%1;drawItem(c,b.buf[i],x+.5+(l.x-x)*k,y+.5+(l.y-y)*k-Math.sin(k*Math.PI)*.3,.12);}}else if(b.buf[0])drawItem(c,b.buf[0],x+.5,y+.5,.13);}}
  else if(t==='sorter'){c.fillStyle='#1d2027';rrect(c,x+.22,y+.22,.56,.56,.08);c.fill();drawItem(c,b.sel||'copper',x+.5,y+.5,.18);}
  else{c.fillStyle='#1d2027';c.fillRect(x+.42,y+.15,.16,.7);c.fillRect(x+.15,y+.42,.7,.16);lamp(c,x+.5,y+.5,.12,'#f0a040');}return;}
 if(t==='arc'&&!icon&&b.flash>0)glow(x+.5,y+.5,1.2,'rgba(180,160,255,.8)');
 return _db(c,b,icon);};
function drawArcs(c){for(const a of arcs){c.strokeStyle=`rgba(200,180,255,${a.life*5})`;c.lineWidth=.07;c.beginPath();c.moveTo(a.x1,a.y1);const n=6;for(let i=1;i<n;i++){const k=i/n;c.lineTo(a.x1+(a.x2-a.x1)*k+(Math.sin(a.seed+i*7.3)*.25),a.y1+(a.y2-a.y1)*k+(Math.cos(a.seed+i*5.1)*.25));}c.lineTo(a.x2,a.y2);c.stroke();c.strokeStyle=`rgba(255,255,255,${a.life*5})`;c.lineWidth=.025;c.stroke();}}
// sorter item pick UI
const _rs=renderSel;renderSel=function(){_rs();const b=sel;if(!b||b.t!=='sorter')return;const e=$('binfo');if(e.querySelector('.isel'))return;
 const d=document.createElement('div');d.innerHTML=`<small>${T('srtPick')}</small><div class="isel">`+Object.keys(ITEMS).map(k=>`<button data-it="${k}" class="${(b.sel||'copper')===k?'on':''}">${itemIc(k)}${ITEMS[k].n}</button>`).join('')+'</div>';e.prepend(d);
 d.querySelectorAll('[data-it]').forEach(q=>q.onclick=()=>{b.sel=q.dataset.it;SND.play('click');e._h=null;renderSel();});};
// --- wave preview (deterministic next wave)
const _wl=waveList;waveList=function(n){if(G.preQ&&G.preQ.n===n){const q=G.preQ.q;G.preQ=null;return q;}return _wl(n);};
function peekWave(){const n=G.wave+1;if(n>G.L.waves)return null;if(!G.preQ||G.preQ.n!==n)G.preQ={n,q:_wl(n)};return G.preQ.q;}
// --- minimap
const mm=document.createElement('canvas');mm.id='mini';document.getElementById('hud').append(mm);let mmBase=null,mmMap=null;
function drawMini(){if(!G||!mapImg){mm.style.display='none';return;}mm.style.display='';const w=Math.round(Math.min(120,innerWidth*.26)),h=Math.round(w*MH/MW);if(mm.width!==w*2){mm.width=w*2;mm.height=h*2;mm.style.width=w+'px';mm.style.height=h+'px';}
 const c=mm.getContext('2d'),sx=mm.width/MW,sy=mm.height/MH;c.imageSmoothingEnabled=true;c.drawImage(mapImg,0,0,mm.width,mm.height);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,0,mm.width,mm.height);
 c.fillStyle='#f0a040';for(const b of G.blds)c.fillRect(b.x*sx,b.y*sy,sx,sy);c.fillStyle='#ffd27a';c.fillRect((G.core.x-1)*sx,(G.core.y-1)*sy,sx*3,sy*3);
 c.fillStyle='#ff4040';for(const s of G.spawns){c.beginPath();c.arc((s.x+.5)*sx,(s.y+.5)*sy,sx*1.3,0,7);c.fill();}for(const e of enemies){c.fillStyle=e.fly?'#ff80e0':'#ff5050';c.fillRect(e.x*sx-2,e.y*sy-2,4,4);}
 const vw=W/cam.z,vh=H/cam.z;c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect((cam.x-vw/2)*sx,(cam.y-vh/2)*sy,vw*sx,vh*sy);}
mm.addEventListener('pointerdown',e=>{e.stopPropagation();const r=mm.getBoundingClientRect();cam.x=(e.clientX-r.left)/r.width*MW;cam.y=(e.clientY-r.top)/r.height*MH;clampCam();});
// --- achievements
const ACH={first:()=>G.blds.some(b=>b.t==='drill'),belt50:()=>G.blds.filter(b=>b.t==='conveyor').length>=50,kill100:()=>G.stats.kills>=100,kill1000:()=>(Auth.get('killsAll',0)+G.stats.kills)>=1000,
 graph:()=>G.res.graphite>=100,si:()=>G.res.silicon>=50,sort:()=>G.blds.some(b=>b.t==='sorter')&&G.blds.some(b=>b.t==='bridge'),wave20:()=>G.wave>=20,boss:()=>G.bossDown};
let achT=0;function checkAch(dt){achT+=dt;if(achT<1||!G)return;achT=0;const got=Auth.get('ach',{});let ch=false;for(const k in ACH)if(!got[k]&&ACH[k]()){got[k]=Date.now();ch=true;toast(T('achGot',T('a_'+k)));SND.play('win');}if(ch)Auth.set('ach',got);}
const _hurt=hurt;hurt=function(e,d){_hurt(e,d);if(e.dead&&ENEMY[e.type].boss&&G)G.bossDown=true;};
// --- daily challenge
let DAILY=0;const dayKey=()=>{const d=new Date();return d.getFullYear()*1e4+(d.getMonth()+1)*100+d.getDate();};
const _nl=newLevel;newLevel=function(lv,seed){const r=_nl(lv,DAILY&&lv==='E'?DAILY:seed);if(DAILY&&lv==='E'&&G){G.L.n=T('daily');G.daily=DAILY;G.L.spawns=3;}return r;};
const md=document.createElement('button');md.id='mDaily';document.querySelector('#scrMain .col').insertBefore(md,$('mSettings'));
md.onclick=()=>{DAILY=dayKey()%9000+100;start('E');DAILY=0;};
const _rm=renderMain;renderMain=function(){_rm();const best=Auth.get('daily',{});const got=Object.keys(Auth.get('ach',{})).length;md.innerHTML='📅 '+T('daily')+(best.d===dayKey()?` <small>(${T('dailyBest',best.w)})</small>`:'')+`<br><small>🏆 ${T('ach')}: ${got}/${Object.keys(ACH).length}</small>`;};
const _lose=lose;lose=function(){if(G&&G.daily){const b=Auth.get('daily',{});if(b.d!==dayKey()||G.wave>b.w)Auth.set('daily',{d:dayKey(),w:G.wave});}if(G&&!G.over)Auth.set('killsAll',Auth.get('killsAll',0)+G.stats.kills);_lose();};
const _win=win;win=function(){if(G)Auth.set('killsAll',Auth.get('killsAll',0)+G.stats.kills);_win();};
// --- hooks into loop
const _hud=updHud;updHud=function(){_hud();const q=peekWave();if(q){const cnt={};q.forEach(t=>cnt[t]=(cnt[t]||0)+1);$('wave').insertAdjacentHTML('beforeend','<div class="wp">'+T('nextW')+': '+Object.entries(cnt).map(([k,v])=>`<i style="background:${ENEMY[k].c}${ENEMY[k].fly?';border-radius:2px;transform:rotate(45deg)':''}"></i>${v}`).join(' ')+'</div>');}drawMini();};
const _step=step;step=function(dt){_step(dt);if(G)checkAch(dt);};
const _draw=draw;draw=function(){_draw();if(!G||!arcs.length)return;const c=ctx,z=cam.z*DPR;c.setTransform(z,0,0,z,DPR*W/2-cam.x*z,DPR*H/2-cam.y*z);const dt=1/60;drawArcs(c);for(const a of arcs)a.life-=dt;arcs=arcs.filter(a=>a.life>0);};
const _ser=serialize;serialize=function(){const s=_ser();s.blds.forEach((q,i)=>{const b=G.blds[i];if(b.t==='bridge')q[3]=b.rot;});return s;};
if(window.__f)Object.assign(__f,{place,canPlace,bridgeLink,peekWave,ACH,get arcs(){return arcs;}});
}
