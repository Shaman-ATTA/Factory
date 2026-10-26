'use strict';
{
// Phase C+: metaglass/scrap, kiln, pulverizer, container/vault, frost turret, research tree.
ITEMS.metaglass={c:'#bfe6ee'};ITEMS.scrap={c:'#7d776a'};
for(const k of['metaglass','scrap'])Object.defineProperty(ITEMS[k],'n',{get:()=>T('i_'+k)});
// icons
for(const k of['metaglass','scrap']){const R=48,cv2=mkCanvas(R,R),c=cv2.getContext('2d');c.setTransform(R,0,0,R,0,0);c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(.52,.82,.34,.1,0,0,7);c.fill();
 if(k==='metaglass'){rrect(c,.18,.24,.64,.54,.06);c.fillStyle=lg(c,.18,.24,.82,.78,['#f4ffff','#9fd6e4','#5a8ea0']);c.fill();c.strokeStyle='#123a';c.lineWidth=.035;c.stroke();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=.04;c.beginPath();c.moveTo(.3,.62);c.lineTo(.5,.34);c.moveTo(.44,.66);c.lineTo(.6,.44);c.stroke();}
 else{for(const[x,y,w,h,a]of[[.2,.45,.35,.22,.3],[.45,.5,.32,.2,-.4],[.35,.32,.3,.18,.1]]){c.save();c.translate(x+w/2,y+h/2);c.rotate(a);c.fillStyle=lg(c,-w/2,-h/2,w/2,h/2,['#b0a898','#7d776a','#4a463e']);c.fillRect(-w/2,-h/2,w,h);c.strokeStyle='#000a';c.lineWidth=.03;c.strokeRect(-w/2,-h/2,w,h);c.restore();}}
 ICON[k]=cv2;try{ICONURL[k]=cv2.toDataURL();}catch(e){}}

Object.assign(B,{
 pulverizer:{cat:'prod',cost:{copper:30,lead:25},hp:180,solid:true,use:.5},
 kiln:{cat:'prod',cost:{copper:60,lead:30,graphite:30},hp:220,solid:true,use:.6},
 container:{cat:'log',cost:{copper:100,lead:60},hp:400,solid:true,cap:1500},
 vault:{cat:'log',cost:{copper:250,titanium:120,metaglass:30},hp:900,solid:true,cap:5000},
 frost:{cat:'def',cost:{copper:45,lead:60,metaglass:20},hp:300,solid:true,turret:true,laser:true,air:true,range:6,reload:.08,use:1,up:true}});
for(const k of['pulverizer','kiln','container','vault','frost'])Object.defineProperty(B[k],'n',{get:()=>T('b_'+k)});
ORDER.splice(ORDER.indexOf('smelter')+1,0,'kiln','pulverizer');ORDER.splice(ORDER.indexOf('unloader')+1,0,'container','vault');ORDER.splice(ORDER.indexOf('arc')+1,0,'frost');
LEVELS[3].unlock.push('container');LEVELS[5].unlock.push('kiln','pulverizer','frost');LEVELS[6].unlock.push('vault');
Object.assign(I18N.ru,{i_metaglass:'Метастекло',i_scrap:'Металлолом',
 b_pulverizer:'Измельчитель',d_pulverizer:'Перемалывает металлолом в песок. Лом выпадает из уничтоженных врагов прямо в ядро. Нужна энергия.',
 b_kiln:'Печь',d_kiln:'Плавит свинец и песок в метастекло. Нужна энергия.',
 b_container:'Контейнер',d_container:'Ставится рядом с ядром: +1500 к вместимости ядра. Разгрузчик рядом с контейнером берёт ресурсы из ядра.',
 b_vault:'Хранилище',d_vault:'Как контейнер, но +5000 к вместимости ядра.',
 b_frost:'Мороз',d_frost:'Распыляет ледяную струю: замедляет врагов на 55% и слегка ранит. Нужна энергия.',
 coreCap:'Вместимость ядра: {0}',contLinked:'Подключён к ядру ✓',contFar:'Поставьте вплотную к ядру (или к подключённому контейнеру)',
 research:'Исследования',resBank:'Склад исследований',resHint:'Ресурсы, вывезенные из секторов (победа — 100%, поражение — 30%), тратятся на изучение технологий. Изученное доступно во всех секторах.',
 resDone:'изучено',resCamp:'кампания',resNeed:'сначала: {0}',resBuy:'Изучить',resGot:'Изучено: {0}',bankAdd:'На склад исследований: {0}'});
for(const k of['metaglass','scrap'])if(I18N.en)I18N.en['i_'+k]=k;
const CC=['container','vault'];
// containers link to core when adjacent to core zone or to a linked container (chain)
const _near=nearCore;
function linked(b){if(!G)return false;if(_near(b))return true;const seen=new Set([b]);const q=[b];while(q.length){const c=q.shift();for(const d of DIRS){const n=bAt(c.x+d[0],c.y+d[1]);if(!n||seen.has(n)||!CC.includes(n.t))continue;if(_near(n))return true;seen.add(n);q.push(n);}}return false;}
function nearCont(b){for(const d of DIRS){const n=bAt(b.x+d[0],b.y+d[1]);if(n&&CC.includes(n.t)&&linked(n))return true;}return false;}
nearCore=function(b){return _near(b)||(!CC.includes(b.t)&&nearCont(b));};
function coreCap(){let c=4000;if(G)for(const b of G.blds)if(CC.includes(b.t)&&linked(b))c+=B[b.t].cap;return c;}
let capC=0,capT=0;function cap(){if(now-capT>500||!capT){capC=coreCap();capT=now;}return capC;}
const _offer=offer;offer=function(b,it,sx,sy){if(!b)return false;const t=b.t;
 if(t==='core'){G.res[it]=Math.min(Math.max(cap(),G.res[it]||0),(G.res[it]||0)+1);G.stats.core++;return true;}
 if(CC.includes(t)){if(!linked(b))return false;return offer(G.coreB,it,sx,sy);}
 if(t==='pulverizer'){if(it!=='scrap'||b.inp>=10)return false;b.inp++;return true;}
 if(t==='kiln'){if(it==='lead'&&b.inp<10){b.inp++;return true;}if(it==='sand'&&b.inp2<10){b.inp2++;return true;}return false;}
 return _offer(b,it,sx,sy);};
const _upd=updBuild;updBuild=function(b,dt){const t=b.t;
 if(t==='pulverizer'){if(b.inp>=1&&b.out<10&&b.pw>.05){b.prog+=dt/1.2*b.pw;if(b.prog>=1){b.prog=0;b.inp--;b.out++;puff(b.x+.5,b.y+.5,'#e0c890',3,.3);}}if(b.out&&dump(b,'sand'))b.out--;return;}
 if(t==='kiln'){if(b.inp>=1&&b.inp2>=1&&b.out<10&&b.pw>.05){b.prog+=dt/.9*b.pw;if(b.prog>=1){b.prog=0;b.inp--;b.inp2--;b.out++;}}if(b.out&&dump(b,'metaglass'))b.out--;return;}
 if(CC.includes(t))return;
 if(t==='frost'){b.cd-=dt;const cx=b.x+.5,cy=b.y+.5,rg=B.frost.range+(b.lv-1)*.5;let best=null,bd=rg*rg;for(const e of enemies){const d=(e.x-cx)**2+(e.y-cy)**2;if(d<bd){bd=d;best=e;}}
  if(!best||b.pw<.05){b.spray=0;return;}const ta=Math.atan2(best.y-cy,best.x-cx);let da=((ta-b.ang+Math.PI*3)%(Math.PI*2))-Math.PI;b.ang+=Math.max(-dt*6,Math.min(dt*6,da));b.spray=1;
  if(b.cd>0)return;b.cd=B.frost.reload;
  for(const e of enemies){const dx=e.x-cx,dy=e.y-cy,d=Math.hypot(dx,dy);if(d>rg)continue;let a=Math.abs(((Math.atan2(dy,dx)-b.ang+Math.PI*3)%(Math.PI*2))-Math.PI);if(a<.35+.3/Math.max(1,d)){e.slowT=1.6;hurt(e,1.2*lm(b)*b.pw);}}
  for(let i=0;i<3;i++){const a=b.ang+(Math.random()-.5)*.5,v=6+Math.random()*4;parts.push({x:cx+Math.cos(b.ang)*.5,y:cy+Math.sin(b.ang)*.5,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rg/v,max:rg/v,c:Math.random()<.5?'#bfe9ff':'#e8fbff',s:.1});}
  // extinguish: frost cools damaged buildings in range (repairs fire damage over time)
  for(const o of G.blds)if(o.fire>0&&Math.hypot(o.x-b.x,o.y-b.y)<rg)o.fire=0;return;}
 return _upd(b,dt);};
// slow effect
const _step=step;step=function(dt){if(G){for(const e of enemies){if(e.base==null)e.base=e.spd;if(e.slowT>0){e.slowT-=dt;e.spd=e.base*.45;}else e.spd=e.base;}const k0=G.stats.kills;_step(dt);if(G&&G.stats.kills>k0)G.res.scrap=Math.min(cap(),(G.res.scrap||0)+(G.stats.kills-k0)*2);}else _step(dt);};
// drawing
const _thead=SPR.thead;SPR.thead=t=>t==='frost'?spr('thfrost',1.4,1,.15,c=>{c.translate(.5,.5);c.fillStyle=lg(c,0,-.1,0,.1,['#e8f8ff','#7ab8d8','#2a4a60']);rrect(c,0,-.08,.48,.16,.04);c.fill();c.strokeStyle='#111';c.lineWidth=.02;c.stroke();
  c.beginPath();c.arc(-.08,0,.27,0,7);c.fillStyle=rg(c,-.15,-.1,0,.3,['#f0fbff','#8cc8e8','#2a5068']);c.fill();c.strokeStyle='#111';c.lineWidth=.03;c.stroke();lamp(c,-.08,0,.09,'#bff');}):_thead(t);
const _db=drawBlock;drawBlock=function(c,b,icon){const t=b.t,x=b.x,y=b.y,tm=icon?0:now/1000;
 if(t==='pulverizer'){plate(c,x+.05,y+.05,.9,.9,.12,'#6a6458',{rivets:.1});c.save();c.translate(x+.5,y+.5);const on=!icon&&b.pw>.05&&b.inp>0;c.rotate(on?tm*5:0);c.fillStyle='#2a2a2e';c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4;c.lineTo(Math.cos(a)*.3,Math.sin(a)*.3);c.lineTo(Math.cos(a+.39)*.2,Math.sin(a+.39)*.2);}c.fill();c.fillStyle='#8a8478';c.beginPath();c.arc(0,0,.08,0,7);c.fill();c.restore();if(!icon&&b.pw<.5)return;return;}
 if(t==='kiln'){plate(c,x+.05,y+.05,.9,.9,.14,'#7a5a4a',{rivets:.1});const on=!icon&&b.pw>.05&&b.inp>0&&b.inp2>0;c.fillStyle='#1d1a18';rrect(c,x+.24,y+.3,.52,.46,.1);c.fill();
  if(on||icon){const f=.6+.4*Math.sin(tm*9);c.fillStyle=`rgba(255,${140+f*60|0},60,${.7+f*.3})`;rrect(c,x+.3,y+.42,.4,.28,.08);c.fill();if(!icon)glow(x+.5,y+.55,.9,'rgba(255,150,60,.5)');}
  if(b.out&&!icon)drawItem(c,'metaglass',x+.5,y+.2,.11);return;}
 if(CC.includes(t)){const v=t==='vault';plate(c,x+.04,y+.04,.92,.92,.1,v?'#5a6878':'#6a6f5a',{rivets:.1});c.fillStyle='#1d2027';rrect(c,x+.2,y+.2,.6,.6,.06);c.fill();c.strokeStyle=v?'#8fb3d9':'#c8b070';c.lineWidth=.05;c.strokeRect(x+.28,y+.28,.44,.44);
  if(!icon){const ok=linked(b);lamp(c,x+.82,y+.18,.06,ok?'#6f6':'#f55');if(ok){c.globalAlpha=.25+.15*Math.sin(tm*2);c.strokeStyle=TEAM;c.lineWidth=.04;c.strokeRect(x+.06,y+.06,.88,.88);c.globalAlpha=1;}}return;}
 if(t==='frost'&&!icon&&b.spray){glow(x+.5+Math.cos(b.ang)*.6,y+.5+Math.sin(b.ang)*.6,1,'rgba(160,220,255,.5)');}
 return _db(c,b,icon);};
// frozen enemies tint
const _draw=draw;draw=function(){_draw();if(!G)return;const c=ctx,z=cam.z*DPR;c.setTransform(z,0,0,z,DPR*W/2-cam.x*z,DPR*H/2-cam.y*z);c.fillStyle='rgba(170,225,255,.45)';for(const e of enemies)if(e.slowT>0){c.beginPath();c.arc(e.x,e.y,e.r*1.1,0,7);c.fill();}};
// info panel
const _rs=renderSel;renderSel=function(){_rs();const b=sel;if(!b)return;const e=$('binfo');let h='';
 if(b.t==='pulverizer')h=`${ITEMS.scrap.n}: ${b.inp} → ${ITEMS.sand.n}: ${b.out}`;
 if(b.t==='kiln')h=`${ITEMS.lead.n}: ${b.inp} · ${ITEMS.sand.n}: ${b.inp2} → ${ITEMS.metaglass.n}: ${b.out}`;
 if(CC.includes(b.t))h=(linked(b)?T('contLinked'):'<span class="miss">'+T('contFar')+'</span>')+'<br>'+T('coreCap',coreCap());
 if(b.core)h=T('coreCap',coreCap());
 if(h&&!e.querySelector('.cx')){const d=document.createElement('div');d.className='cx';d.innerHTML='<small>'+h+'</small>';const bb=e.querySelector('b');(bb&&bb.parentNode===e?bb.nextSibling:null)?e.insertBefore(d,e.children[1]||null):e.appendChild(d);}};
const _nl=newLevel;newLevel=function(lv,seed){const r=_nl(lv,seed);if(G){G.res.metaglass=G.res.metaglass||0;G.res.scrap=G.res.scrap||0;}return r;};

// ---------- research tree ----------
const TREE={conveyor:0,drill:0,duo:0,wall:0,
 router:'conveyor',unloader:'conveyor',sorter:'router',overflow:'router',bridge:'router',tconv:'bridge',container:'unloader',vault:'container',
 press:'drill',pdrill:'drill',generator:'press',node:'generator',battery:'node',smelter:'press',kiln:'smelter',pulverizer:'press',factory:'smelter',dronepad:'factory',
 hail:'duo',aa:'duo',lancer:'hail',arc:'lancer',salvo:'hail',frost:'arc',mender:'wall',lwall:'wall',twall:'lwall'};
const camp=()=>{const u=new Set();for(let i=0;i<prog.unlocked&&i<LEVELS.length;i++)LEVELS[i].unlock.forEach(t=>u.add(t));return u;};
const RS=()=>Auth.get('research',{});
function rCost(t){const c={};for(const[k,v]of Object.entries(B[t].cost||{}))c[k]=Math.ceil(v*8/10)*10;return c;}
function known(t){return camp().has(t)||!!RS()[t]||TREE[t]===0;}
function bank(){return Object.assign({},Auth.get('bank',{}));}
function canR(t){const p=TREE[t];if(known(t))return false;if(p&&!known(p))return false;const bk=bank();return Object.entries(rCost(t)).every(([k,v])=>(bk[k]||0)>=v);}
function research(t){if(!canR(t))return false;const bk=bank();for(const[k,v]of Object.entries(rCost(t)))bk[k]-=v;Auth.set('bank',bk);const r=RS();r[t]=1;Auth.set('research',r);return true;}
const _ut=unlockedTools;unlockedTools=function(){const base=_ut();if(G&&G.L.endless)return base;const r=RS();return ORDER.filter(t=>base.includes(t)||r[t]);};
function addBank(f){if(!G||G.banked)return;G.banked=1;const bk=bank(),got={};for(const[k,v]of Object.entries(G.res)){const n=Math.floor((v||0)*f);if(n>0){bk[k]=(bk[k]||0)+n;got[k]=n;}}Auth.set('bank',bk);G.bankGot=got;}
const _win=win;win=function(){addBank(1);_win();bankNote();};
const _lose=lose;lose=function(){addBank(.3);_lose();bankNote();};
function bankNote(){if(!G||!G.bankGot)return;const s=Object.entries(G.bankGot).map(([k,v])=>`${itemIc(k)}${v}`).join(' ');if(s){const p=$('endP');if(p)p.insertAdjacentHTML('beforeend',`<br><small>🔬 ${T('bankAdd',s)}</small>`);}}
// screen
const scr=document.createElement('div');scr.id='scrResearch';scr.className='panel scr hide';scr.innerHTML=`<h2>🔬 ${T('research')}</h2><div id="rBank" class="rbank"></div><p class="sm">${T('resHint')}</p><div id="rTree" class="rtree"></div><button class="back">${T('back')}</button>`;
document.body.appendChild(scr);SCR.push('scrResearch');scr.querySelector('.back').onclick=()=>{const p=scrBack.pop();show(p||(G?'pause':'scrMain'),false);};
function renderR(){const bk=bank();$('rBank').innerHTML=`<b>${T('resBank')}:</b> `+(Object.entries(bk).filter(([k,v])=>v>0&&ITEMS[k]).map(([k,v])=>`<span>${itemIc(k)}${fmtN(v)}</span>`).join(' ')||'—');
 const ch={};for(const[t,p]of Object.entries(TREE))if(p)(ch[p]=ch[p]||[]).push(t);const cp=camp(),r=RS();let h='';
 const node=(t,d)=>{if(!B[t])return;const st=TREE[t]===0||t==='core'?'done':cp.has(t)?'camp':r[t]?'done':(TREE[t]&&!known(TREE[t]))?'lock':'open';
  const cost=Object.entries(rCost(t)).map(([k,v])=>`<span class="${(bk[k]||0)>=v?'okc':'miss'}">${itemIc(k)}${v}</span>`).join(' ');
  h+=`<div class="rn ${st}" style="margin-left:${d*14}px"><canvas data-ic="${t}" width="56" height="56"></canvas><div><b>${B[t].n}</b><br><small>${st==='done'?'✓ '+T('resDone'):st==='camp'?'✓ '+T('resCamp'):st==='lock'?T('resNeed',B[TREE[t]].n):cost}</small></div>${st==='open'?`<button data-r="${t}" ${canR(t)?'':'disabled'}>${T('resBuy')}</button>`:''}</div>`;
  (ch[t]||[]).forEach(k=>node(k,d+1));};
 for(const t of['conveyor','drill','duo','wall'])node(t,0);$('rTree').innerHTML=h;
 $('rTree').querySelectorAll('canvas').forEach(cv2=>{const c=cv2.getContext('2d');c.setTransform(40,0,0,40,8,8);try{drawBlock(c,{...newB(cv2.dataset.ic,0,0,0)},true);}catch(e){}});
 $('rTree').querySelectorAll('button[data-r]').forEach(b=>b.onclick=()=>{if(research(b.dataset.r)){SND.play('win');toast(T('resGot',B[b.dataset.r].n));renderR();if(G)buildToolbar();}});}
const _show=show;show=function(id,push){_show(id,push);if(id==='scrResearch')renderR();};
const rb=document.createElement('button');rb.id='mResearch';rb.textContent='🔬 '+T('research');document.querySelector('#scrMain .col').insertBefore(rb,$('mSettings'));rb.onclick=()=>show('scrResearch',true);
const pb=document.createElement('button');pb.id='pResearch';pb.textContent='🔬 '+T('research');$('pause').querySelector('.col').insertBefore(pb,$('pSettings'));pb.onclick=()=>show('scrResearch',true);
if(window.__f)Object.assign(__f,{coreCap,linked,research,rCost,bank,addBank,TREE,unlockedTools,nearCore});
}
