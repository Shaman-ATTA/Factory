'use strict';
const $=id=>document.getElementById(id);
const cv=$('c'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1;
function resize(){DPR=Math.min(devicePixelRatio||1,typeof S==='undefined'?2:S.quality==='low'?1:S.dpr);W=innerWidth;H=innerHeight;cv.width=W*DPR|0;cv.height=H*DPR|0;}
addEventListener('resize',resize);
// ---------- data ----------
const ITEMS={copper:{c:'#d99d73'},lead:{c:'#9a8cc4'},coal:{c:'#3a3a3e'},graphite:{c:'#6d8299'}};
for(const k in ITEMS)Object.defineProperty(ITEMS[k],'n',{get:()=>T('i_'+k)});
const ORE={2:'copper',3:'lead',4:'coal'};
const DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
const B={
 conveyor:{cat:'log',cost:{copper:1},hp:45,walk:true},
 drill:{cat:'mine',cost:{copper:12},hp:120,solid:true},
 router:{cat:'log',cost:{copper:3},hp:60,walk:true},
 press:{cat:'prod',cost:{copper:50,lead:25},hp:200,solid:true},
 duo:{cat:'def',cost:{copper:35},hp:220,solid:true,turret:true,range:8.5,reload:.32,ammo:{copper:9,graphite:18},cap:40},
 hail:{cat:'def',cost:{copper:40,graphite:17},hp:300,solid:true,turret:true,range:13,reload:1.6,ammo:{graphite:34},cap:20,splash:1.3},
 lancer:{cat:'def',cost:{copper:60,lead:50,graphite:30},hp:420,solid:true,turret:true,range:10,reload:2.4,laser:110},
 wall:{cat:'def',cost:{copper:6},hp:360,solid:true},
 lwall:{cat:'def',cost:{lead:8,copper:2},hp:750,solid:true},
 core:{hp:2500,solid:true}};
for(const k in B)Object.defineProperty(B[k],'n',{get:()=>T('b_'+k)});
const CATS=['mine','log','prod','def','pow'];
const ENEMY={dagger:{n:'Кинжал',hp:130,spd:1.0,dps:22,r:.32,c:'#e2584a'},crawler:{n:'Ползун',hp:55,spd:1.9,boom:70,r:.24,c:'#f08a3a'},
 mace:{n:'Булава',hp:560,spd:.55,dps:48,r:.42,c:'#c24a8a'},boss:{n:'Крепость',hp:4000,spd:.38,dps:140,r:.7,c:'#8a2a2a'}};
const LEVELS=[
 {n:'Плацдарм',waves:6,seed:11,ores:['copper','lead'],unlock:['conveyor','drill','duo','wall'],start:{copper:200,lead:0,coal:0,graphite:0},en:['dagger'],spawns:1},
 {n:'Угольная долина',waves:8,seed:23,ores:['copper','lead','coal'],unlock:['router','press'],start:{copper:250,lead:60,coal:0,graphite:0},en:['dagger','crawler'],spawns:1},
 {n:'Перевал',waves:10,seed:37,ores:['copper','lead','coal'],unlock:['hail'],start:{copper:300,lead:100,coal:0,graphite:40},en:['dagger','crawler','mace'],spawns:1},
 {n:'Свинцовые копи',waves:12,seed:41,ores:['copper','lead','coal'],unlock:['lancer','lwall'],start:{copper:400,lead:200,coal:0,graphite:60},en:['dagger','crawler','mace'],spawns:2},
 {n:'Последний рубеж',waves:15,seed:59,ores:['copper','lead','coal'],unlock:[],start:{copper:500,lead:250,coal:0,graphite:100},en:['dagger','crawler','mace'],spawns:2,boss:true}];
const ORDER=['conveyor','drill','router','press','duo','hail','lancer','wall','lwall'];
// ---------- state ----------
let G=null; // level state
let prog=Object.assign({unlocked:1,done:[],stars:[]},Auth.get('prog',{}));
const SDEF={music:.5,sfx:.7,quality:'high',dpr:2,fps:false,ui:1,lang:'ru',vib:true};
let S=Object.assign({},SDEF,Auth.get('settings',{}));
function applySettings(){LANG=I18N[S.lang]?S.lang:'ru';document.documentElement.style.setProperty('--ui',S.ui);SND.setVol({music:S.music,sfx:S.sfx});$('fps').classList.toggle('hide',!S.fps);resize();applyI18n();}
function saveSettings(){Auth.set('settings',S);}
const vib=ms=>{if(S.vib&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}};
const MW=48,MH=28;
let terrain,tileB,flow,mapImg;
let cam={x:20,y:14,z:36},speed=1,paused=false,tool=null,rot=0,delMode=false,cat='mine',sel=null;
let enemies=[],bullets=[],parts=[],flashes=[],beams=[];
function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647;}}
function genMap(L){const r=rng(L.seed*997+1);terrain=new Uint8Array(MW*MH);
 const noise=(x,y)=>{let v=0;for(const[f,a]of[[.12,1],[.25,.5]])v+=a*(Math.sin(x*f*1.7+L.seed)+Math.sin(y*f*2.1+L.seed*.7)+Math.sin((x+y)*f*1.3))/3;return v;};
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){let t=0;if(noise(x,y)>.55||x===0||y===0||x===MW-1||y===MH-1)t=1;if(r()<.04)t=1;terrain[y*MW+x]=t;}
 const core={x:6,y:MH>>1};for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++)terrain[(core.y+y)*MW+core.x+x]=0;
 const blob=(cx,cy,t,n)=>{for(let i=0;i<n;i++){const x=Math.round(cx+(r()-.5)*4),y=Math.round(cy+(r()-.5)*4);if(x>1&&y>1&&x<MW-2&&y<MH-2)terrain[y*MW+x]=t;}};
 const oreT={copper:2,lead:3,coal:4};
 blob(core.x+4,core.y-4,2,22);blob(core.x+3,core.y+5,2,16);
 let k=0;for(const o of L.ores)for(let i=0;i<3;i++){const x=8+r()*28,y=3+r()*(MH-6);blob(x,y,oreT[o],14);k++;}
 if(L.ores.includes('coal'))blob(core.x+7,core.y+1,4,14);
 if(L.ores.includes('lead'))blob(core.x+1,core.y-7,3,14);
 const spawns=[];for(let i=0;i<L.spawns;i++){const sy=L.spawns===1?(4+r()*(MH-8))|0:(i?MH-5:4);spawns.push({x:MW-3,y:sy});for(let y=-2;y<=2;y++)for(let x=-2;x<=1;x++)terrain[(sy+y)*MW+MW-3+x]=0;}
 // carve path so spawn reachable
 for(const s of spawns){let x=s.x,y=s.y;while(x>core.x){x--;if(r()<.3)y+=Math.sign(core.y-y);if(terrain[y*MW+x]===1)terrain[y*MW+x]=0;}}
 return{core,spawns};}
function renderMap(){mapImg=document.createElement('canvas');mapImg.width=MW*16;mapImg.height=MH*16;const c=mapImg.getContext('2d');const r=rng(7);
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=terrain[y*MW+x];
  for(let py=0;py<16;py+=2)for(let px=0;px<16;px+=2){const v=r();let col;
   if(t===1){const s=60+v*18;col=`rgb(${s},${s-4},${s-10})`;if(py<2||px<2)col=`rgb(${s+18},${s+14},${s+8})`;}
   else{const s=38+v*9;col=`rgb(${s+4},${s+6},${s+2})`;}
   c.fillStyle=col;c.fillRect(x*16+px,y*16+py,2,2);}
  if(ORE[t]){c.fillStyle=ITEMS[ORE[t]].c;for(let i=0;i<5;i++){const px=2+(r()*11|0),py=2+(r()*11|0);c.fillRect(x*16+px,y*16+py,3,3);c.fillStyle='#0004';c.fillRect(x*16+px+1,y*16+py+2,2,1);c.fillStyle=ITEMS[ORE[t]].c;}}
  if(t===1){c.fillStyle='#0003';c.fillRect(x*16,y*16+14,16,2);}}
 c.strokeStyle='#ffffff08';for(let x=0;x<=MW;x++){c.beginPath();c.moveTo(x*16,0);c.lineTo(x*16,MH*16);c.stroke();}for(let y=0;y<=MH;y++){c.beginPath();c.moveTo(0,y*16);c.lineTo(MW*16,y*16);c.stroke();}}
const inMap=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
const bAt=(x,y)=>inMap(x,y)?tileB[y*MW+x]:null;
function calcFlow(){flow=new Float32Array(MW*MH).fill(1e9);const q=[];const c=G.core;
 for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){flow[(c.y+y)*MW+c.x+x]=0;q.push([c.x+x,c.y+y]);}
 for(let i=0;i<q.length;i++){const[x,y]=q[i],d=flow[y*MW+x];for(const[dx,dy]of DIRS){const nx=x+dx,ny=y+dy;if(!inMap(nx,ny)||terrain[ny*MW+nx]===1)continue;
  const b=bAt(nx,ny);const cost=b&&B[b.t].solid?6:1;if(flow[ny*MW+nx]>d+cost){flow[ny*MW+nx]=d+cost;q.push([nx,ny]);}}}}
// ---------- buildings ----------
function newB(t,x,y,r){const b={t,x,y,rot:r||0,hp:B[t].hp,items:[],buf:[],ammo:0,ammoT:null,ang:Math.PI,cd:0,prog:0,inp:0,out:0,rr:0,flash:0,charge:0};return b;}
function canPlace(t,x,y){if(!inMap(x,y)||terrain[y*MW+x]===1||bAt(x,y))return false;if(t==='drill'&&!ORE[terrain[y*MW+x]])return false;
 for(const s of G.spawns)if(Math.abs(s.x-x)<=1&&Math.abs(s.y-y)<=1)return false;return true;}
const afford=c=>Object.entries(c).every(([k,v])=>G.res[k]>=v);
function place(t,x,y,r,free){if(!canPlace(t,x,y))return false;if(!free){if(!afford(B[t].cost))return false;for(const[k,v]of Object.entries(B[t].cost))G.res[k]-=v;}
 const b=newB(t,x,y,r);G.blds.push(b);tileB[y*MW+x]=b;if(B[t].solid)calcFlow();
 if(!free){puff(x+.5,y+.5,'#ffffff',5,.6);SND.play('build');vib(8);}return b;}
function removeB(b,refund){if(sel===b)selB(null);G.blds.splice(G.blds.indexOf(b),1);tileB[b.y*MW+b.x]=null;if(refund)for(const[k,v]of Object.entries(B[b.t].cost))G.res[k]+=v;if(B[b.t].solid)calcFlow();}
function makeCore(){const c=G.core;const b=newB('core',c.x,c.y);b.core=true;G.coreB=b;for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)tileB[(c.y+y)*MW+c.x+x]=b;}
// item transfer: offer item to building b coming from tile (sx,sy)
function offer(b,it,sx,sy){if(!b)return false;const T=b.t;
 if(T==='core'){G.res[it]=Math.min(9999,G.res[it]+1);G.stats.core++;return true;}
 if(T==='conveyor'){const d=DIRS[b.rot];if(b.x+d[0]===sx&&b.y+d[1]===sy)return false;const l=b.items[b.items.length-1];if(b.items.length>=3||(l&&l.p<.34))return false;
  // side input enters mid-belt
  const back=b.x-d[0]===sx&&b.y-d[1]===sy;b.items.push({t:it,p:back?0:.3});if(!back&&l&&l.p<.64){b.items.pop();return false;}return true;}
 if(T==='router'){if(b.buf.length>=1)return false;b.buf.push({t:it,sx,sy});return true;}
 if(T==='press'){if(it!=='coal'||b.inp>=10)return false;b.inp++;return true;}
 const bd=B[T];if(bd.turret&&bd.ammo&&bd.ammo[it]!==undefined){if(b.ammo>=bd.cap)return false;b.ammo+=it==='graphite'&&T==='duo'?3:2;b.ammoT=it;return true;}
 return false;}
function dump(b,it){for(let i=0;i<4;i++){const k=(b.rr+i)%4,d=DIRS[k];const n=bAt(b.x+d[0],b.y+d[1]);if(n&&n!==b&&offer(n,it,b.x,b.y)){b.rr=k+1;return true;}}return false;}
function updBuild(b,dt){const T=b.t;
 if(T==='conveyor'){const s=dt*2.6;for(let i=0;i<b.items.length;i++){const lim=i===0?1:b.items[i-1].p-.34;b.items[i].p=Math.min(b.items[i].p+s,Math.max(lim,b.items[i].p));}
  if(b.items.length&&b.items[0].p>=1){const d=DIRS[b.rot];if(offer(bAt(b.x+d[0],b.y+d[1]),b.items[0].t,b.x,b.y))b.items.shift();}}
 else if(T==='drill'){if(b.buf.length<5){b.prog+=dt*(ORE[terrain[b.y*MW+b.x]]==='coal'?.45:.6);if(b.prog>=1){b.prog=0;b.buf.push(ORE[terrain[b.y*MW+b.x]]);}}
  if(b.buf.length&&dump(b,b.buf[0]))b.buf.shift();}
 else if(T==='router'){b.cd-=dt;if(b.buf.length&&b.cd<=0){const it=b.buf[0];for(let i=0;i<4;i++){const k=(b.rr+i)%4,d=DIRS[k],nx=b.x+d[0],ny=b.y+d[1];if(nx===it.sx&&ny===it.sy)continue;const n=bAt(nx,ny);
   if(n&&n.t!=='router'&&offer(n,it.t,b.x,b.y)){b.rr=k+1;b.buf.shift();b.cd=.12;break;}}}}
 else if(T==='press'){if(b.inp>=2&&b.out<10){b.prog+=dt/1.5;if(b.prog>=1){b.prog=0;b.inp-=2;b.out++;puff(b.x+.5,b.y+.5,'#9ab',3,.4);}}if(b.out&&dump(b,'graphite'))b.out--;}
 else if(B[T].turret)updTurret(b,dt);
 if(b.flash>0)b.flash-=dt;}
function updTurret(b,dt){const bd=B[b.t];b.cd-=dt;const cx=b.x+.5,cy=b.y+.5;let tg=null,bd2=bd.range*bd.range;
 for(const e of enemies){const d=(e.x-cx)**2+(e.y-cy)**2;if(d<bd2){bd2=d;tg=e;}}
 if(!tg){b.charge=0;return;}let want=Math.atan2(tg.y-cy,tg.x-cx);
 if(!bd.laser&&!bd.splash){const tt=Math.sqrt(bd2)/16;want=Math.atan2(tg.y+tg.vy*tt-cy,tg.x+tg.vx*tt-cx);}
 let da=((want-b.ang+Math.PI*3)%(Math.PI*2))-Math.PI;const ts=dt*(b.t==='hail'?2.5:7);b.ang+=Math.max(-ts,Math.min(ts,da));
 if(Math.abs(da)>.15||b.cd>0)return;
 if(bd.laser){b.charge+=dt*3;if(b.charge<1)return;b.charge=0;b.cd=bd.reload;const ex=cx+Math.cos(b.ang)*bd.range,ey=cy+Math.sin(b.ang)*bd.range;
  beams.push({x1:cx+Math.cos(b.ang)*.5,y1:cy+Math.sin(b.ang)*.5,x2:ex,y2:ey,life:.25});
  for(const e of enemies){const t=Math.max(0,Math.min(1,((e.x-cx)*(ex-cx)+(e.y-cy)*(ey-cy))/(bd.range**2)));const px=cx+(ex-cx)*t,py=cy+(ey-cy)*t;if((e.x-px)**2+(e.y-py)**2<(e.r+.2)**2)hurt(e,bd.laser);}
  b.flash=.12;SND.play('laser');return;}
 if(b.ammo<=0)return;b.ammo--;b.cd=bd.reload;b.flash=.08;const mx=cx+Math.cos(b.ang)*.6,my=cy+Math.sin(b.ang)*.6;
 if(bd.splash){bullets.push({x:mx,y:my,sx:mx,sy:my,tx:tg.x,ty:tg.y,t:0,T:Math.sqrt(bd2)/9,dmg:bd.ammo.graphite,splash:bd.splash,art:true});}
 else{const sp=16;bullets.push({x:mx,y:my,vx:Math.cos(b.ang)*sp,vy:Math.sin(b.ang)*sp,life:bd.range/sp+.1,dmg:bd.ammo[b.ammoT]||9,col:b.ammoT==='graphite'?'#bfe0ff':'#ffd27a'});
  b.ang+=(Math.random()-.5)*.05;}
 flashes.push({x:mx,y:my,a:b.ang,life:.07,s:bd.splash?1.4:1});SND.play(bd.splash?'hail':'duo');}
// ---------- enemies ----------
function hurt(e,d){e.hp-=d;e.hit=.1;if(e.hp<=0&&!e.dead){e.dead=true;explode(e.x,e.y,e.r*2.2,e.c);G.stats.kills++;}else SND.play('hit');}
function spawnEnemy(type,s,mul){const E=ENEMY[type];enemies.push({type,x:s.x+.5+(Math.random()-.5),y:s.y+.5+(Math.random()-.5)*2,hp:E.hp*mul,max:E.hp*mul,spd:E.spd,r:E.r,c:E.c,vx:0,vy:0,ang:Math.PI,hit:0,walk:Math.random()*6});}
function updEnemy(e,dt){const E=ENEMY[e.type];const tx=Math.floor(e.x),ty=Math.floor(e.y);
 let best=flow[ty*MW+tx]??1e9,nx=tx,ny=ty;
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const x=tx+dx,y=ty+dy;if(!inMap(x,y))continue;
  if(dx&&dy&&(terrain[ty*MW+x]===1||terrain[y*MW+tx]===1))continue;const f=flow[y*MW+x]+(dx&&dy?.4:0);if(f<best){best=f;nx=x;ny=y;}}
 if(best>=1e9){const dx=G.core.x+.5-e.x,dy=G.core.y+.5-e.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*e.spd*dt;e.y+=dy/d*e.spd*dt;e.ang=Math.atan2(dy,dx);return;}
 const blk=bAt(nx,ny);const cur=bAt(tx,ty);
 const target=(blk&&B[blk.t].solid)?blk:(cur&&B[cur.t].solid?cur:null);
 if(target&&Math.hypot(nx+.5-e.x,ny+.5-e.y)<1.05+e.r||(target&&target===cur)){
  e.vx=e.vy=0;e.ang=Math.atan2(ny+.5-e.y,nx+.5-e.x);
  if(E.boom){dmgB(target,E.boom);e.dead=true;explode(e.x,e.y,1.4,'#ffa040');for(const o of enemies)if(o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<1.2)hurt(o,20);return;}
  dmgB(target,E.dps*dt);e.atk=(e.atk||0)+dt;if(Math.random()<dt*6)spark(nx+.5-(nx+.5-e.x)*.4,ny+.5-(ny+.5-e.y)*.4);return;}
 const gx=nx+.5,gy=ny+.5,dx=gx-e.x,dy=gy-e.y,d=Math.hypot(dx,dy)||1;const s=e.spd;e.vx=dx/d*s;e.vy=dy/d*s;
 for(const o of enemies){if(o===e)continue;const ox=e.x-o.x,oy=e.y-o.y,od=Math.hypot(ox,oy),m=e.r+o.r;if(od<m&&od>0){e.x+=ox/od*(m-od)*.3;e.y+=oy/od*(m-od)*.3;}}
 e.x+=e.vx*dt;e.y+=e.vy*dt;e.ang=Math.atan2(e.vy,e.vx);e.walk+=dt*s*8;
 if(terrain[Math.floor(e.y)*MW+Math.floor(e.x)]===1){const ox=e.x-e.vx*dt,oy=e.y-e.vy*dt;const rk=(x,y)=>terrain[Math.floor(y)*MW+Math.floor(x)]===1;
  if(!rk(e.x,oy))e.y=oy;else if(!rk(ox,e.y))e.x=ox;else{e.x=ox+(tx+.5-ox)*.2;e.y=oy+(ty+.5-oy)*.2;}}}
function dmgB(b,d){b.hp-=d;b.hitT=.1;if(b.core&&Math.random()<.05)vib(15);if(b.hp<=0){explode(b.x+.5,b.y+.5,b.core?3:1.2,'#ff9a40');if(b.core){lose();return;}removeB(b,false);}}
// ---------- particles ----------
function puff(x,y,c,n,s){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=Math.random()*s*2;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.5,max:.5,c,s:.12});}}
function spark(x,y){for(let i=0;i<3;i++){const a=Math.random()*6.28,v=2+Math.random()*3;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.2,max:.2,c:'#ffe080',s:.07});}}
function explode(x,y,r,c){SND.play('boom',r);const q=S.quality==='low'?.35:1;for(let i=0;i<14*r*q;i++){const a=Math.random()*6.28,v=Math.random()*r*3;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.4+Math.random()*.4,max:.8,c:i%3?c:'#ffef9a',s:.08+Math.random()*.14});}
 for(let i=0;i<6*q;i++){const a=Math.random()*6.28,v=Math.random()*r;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,max:1,c:'#555a',s:.25+Math.random()*.2,smoke:true});}
 G.shake=Math.min(.35,(G.shake||0)+r*.08);}
// ---------- waves ----------
function waveList(n){const L=LEVELS[G.lv];const out=[];const cnt=Math.round(2+n*1.6+G.lv*1.2);
 for(let i=0;i<cnt;i++){let t='dagger';const r=Math.random();if(L.en.includes('crawler')&&r<.3)t='crawler';else if(L.en.includes('mace')&&n>=3&&r>.85)t='mace';out.push(t);}
 if(L.boss&&n===L.waves)out.push('boss');return out;}
function startWave(){if(G.wave>=LEVELS[G.lv].waves)return;G.wave++;G.queue=waveList(G.wave);G.qT=0;G.wT=Math.max(30,50-G.wave*1.5);
 toast(T('waveN',G.wave)+(G.wave===LEVELS[G.lv].waves?T('lastWave'):''));SND.play('horn');vib(60);}
// ---------- level lifecycle ----------
function newLevel(lv){const L=LEVELS[lv];const m=genMap(L);
 G={lv,res:{...L.start},blds:[],core:m.core,spawns:m.spawns,wave:0,wT:lv===0?90:55,queue:[],qT:0,stats:{core:0,kills:0},tut:lv===0&&!prog.tutDone?0:-1,over:false};
 tileB=new Array(MW*MH).fill(null);makeCore();enemies=[];bullets=[];parts=[];renderMap();calcFlow();sel=null;
 cam.x=G.core.x+8;cam.y=G.core.y;cam.z=Math.max(22,Math.min(40,H/16));}
function serialize(){return{lv:G.lv,res:G.res,wave:G.wave,wT:G.wT,tut:G.tut,coreHp:G.coreB.hp,stats:G.stats,blds:G.blds.map(b=>[b.t,b.x,b.y,b.rot,Math.round(b.hp),b.ammo,b.ammoT])};}
function save(){Auth.set('prog',prog);if(G&&!G.over)Auth.set('game',serialize());}
function loadGame(){try{const s=Auth.get('game',null);if(!s)return false;newLevel(s.lv);Object.assign(G.res,s.res);G.wave=s.wave;G.wT=s.wT;G.tut=s.tut;G.coreB.hp=s.coreHp;if(s.stats)G.stats=s.stats;
 for(const a of s.blds){const b=place(a[0],a[1],a[2],a[3],true);if(b){b.hp=a[4];b.ammo=a[5]||0;b.ammoT=a[6]||(a[0]==='hail'?'graphite':'copper');}}calcFlow();return true;}catch(e){console.warn(e);return false;}}
setInterval(()=>{if(G&&!paused)save();},8000);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
function unlockedTools(){const u=new Set();for(let i=0;i<=G.lv;i++)LEVELS[i].unlock.forEach(t=>u.add(t));return ORDER.filter(t=>u.has(t));}
const starsOf=hp=>hp>=.9?3:hp>=.5?2:1;
const starStr=n=>'★'.repeat(n)+'<s>'+'★'.repeat(3-n)+'</s>';
function win(){G.over=true;const st=starsOf(G.coreB.hp/B.core.hp);prog.done[G.lv]=1;prog.stars[G.lv]=Math.max(prog.stars[G.lv]||0,st);prog.unlocked=Math.max(prog.unlocked,Math.min(LEVELS.length,G.lv+2));Auth.del('game');save();SND.play('win');vib([40,40,80]);
 const nx=LEVELS[G.lv+1];let p=T('victoryP',LEVELS[G.lv].n,G.stats.kills);if(nx){p+=T('unlockedSector',nx.n);if(nx.unlock.length)p+=T('unlockedTech',nx.unlock.map(t=>B[t].n).join(', '));p+='.';}else p+=T('campaignDone');
 showEnd(T('victory'),p,nx?T('nextSector'):T('playAgain'),()=>start(nx?G.lv+1:G.lv),st);}
function lose(){if(G.over)return;G.over=true;Auth.del('game');save();SND.play('lose');vib(300);showEnd(T('lost'),T('lostP',G.wave),T('restart'),()=>start(G.lv),0);}
function showEnd(t,p,a,fn,st){setTimeout(()=>{$('endT').textContent=t;$('endP').textContent=p;$('endS').innerHTML=st?starStr(st):'';$('endA').textContent=a;$('endA').onclick=()=>{$('end').classList.add('hide');fn();};$('end').classList.remove('hide');},900);}
$('endM').onclick=()=>{$('end').classList.add('hide');G=null;show('scrMain');};
function start(lv){newLevel(lv);tool=null;delMode=false;buildToolbar();hideScreens();paused=false;speed=1;updCtl();if(G.tut>=0)tutShow();else $('tut').classList.add('hide');save();
 toast(T('sector',lv+1,LEVELS[lv].n));}
// ---------- screens ----------
const SCR=['scrMain','scrLevels','scrSettings','scrAccount','scrCredits','pause'];let scrBack=[];
function hideScreens(){SCR.forEach(i=>$(i).classList.add('hide'));scrBack=[];}
function show(id,push){SND.play('click');const curS=SCR.find(i=>!$(i).classList.contains('hide'));if(push&&curS)scrBack.push(curS);else if(!push)scrBack=[];SCR.forEach(i=>$(i).classList.toggle('hide',i!==id));
 if(id==='scrMain')renderMain();if(id==='scrLevels')renderLevels();if(id==='scrSettings')renderSettings();if(id==='scrAccount')renderAccount();if(G)paused=true;}
const inMenu=()=>SCR.some(i=>!$(i).classList.contains('hide'))||!$('end').classList.contains('hide');
document.querySelectorAll('.back').forEach(b=>b.onclick=()=>{const p=scrBack.pop();if(p)show(p,false);else show(G?'pause':'scrMain');});
function renderMain(){const pr=Auth.current();$('prof').innerHTML=`<i style="background:${pr.color}"></i>${esc(pr.nick)}`;const has=!!Auth.get('game',null);
 $('mPlay').textContent=has?T('cont'):T('play');$('mEndless').innerHTML=T('endless')+' <small>('+T('soon')+')</small>';}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('prof').onclick=()=>show('scrAccount',true);
$('mPlay').onclick=()=>{if(loadGame()){buildToolbar();hideScreens();paused=false;updCtl();tutShow();}else{let n=0;while(n<LEVELS.length-1&&prog.done[n]&&n+1<prog.unlocked)n++;start(n);}};
$('mCampaign').onclick=()=>show('scrLevels',true);$('mEndless').onclick=()=>toast(T('endlessSoon'));
$('mSettings').onclick=()=>show('scrSettings',true);$('mAccount').onclick=()=>show('scrAccount',true);$('mCredits').onclick=()=>show('scrCredits',true);
$('pResume').onclick=()=>{hideScreens();paused=false;updCtl();};$('pRestart').onclick=()=>confirmBox(T('restart')+'?',()=>start(G.lv));
$('pSettings').onclick=()=>show('scrSettings',true);$('pExit').onclick=()=>{save();G=null;show('scrMain');};
function renderLevels(){const L=$('levels');L.innerHTML='';LEVELS.forEach((l,i)=>{const d=document.createElement('button');d.className='lv'+(i>=prog.unlocked?' lock':'');d.disabled=i>=prog.unlocked;
 d.innerHTML=`<b>${i+1}. ${l.n}</b><div class="stars">${starStr(prog.stars[i]||(prog.done[i]?1:0))}</div>${T('waves',l.waves)}${l.unlock.length?'<br>'+T('newTech',l.unlock.map(t=>B[t].n).join(', ')):''}${l.boss?'<br>'+T('boss'):''}`;d.onclick=()=>start(i);L.appendChild(d);});}
function confirmBox(txt,fn){$('cfT').textContent=txt;$('confirm').classList.remove('hide');$('cfY').onclick=()=>{$('confirm').classList.add('hide');fn();};$('cfN').onclick=()=>$('confirm').classList.add('hide');}
function renderSettings(){const f=$('setForm');const rg=(k,min,max,st)=>`<input type="range" data-k="${k}" min="${min}" max="${max}" step="${st}" value="${S[k]}">`;
 const sl=(k,opts)=>`<select data-k="${k}">${opts.map(([v,n])=>`<option value="${v}"${String(S[k])===String(v)?' selected':''}>${n}</option>`).join('')}</select>`;
 const ck=k=>`<input type="checkbox" data-k="${k}"${S[k]?' checked':''}>`;
 f.innerHTML=`<span>${T('set_music')}</span>${rg('music',0,1,.05)}<span>${T('set_sfx')}</span>${rg('sfx',0,1,.05)}
 <span>${T('set_quality')}</span>${sl('quality',[['low',T('q_low')],['high',T('q_high')]])}<span>Pixel ratio</span>${sl('dpr',[[1,'1×'],[1.5,'1.5×'],[2,'2×']])}
 <span>${T('set_ui')}</span>${sl('ui',[[.85,'85%'],[1,'100%'],[1.15,'115%'],[1.3,'130%']])}<span>${T('set_lang')}</span>${sl('lang',Object.keys(I18N).map(k=>[k,k==='ru'?'Русский':k]))}
 <span>${T('set_fps')}</span>${ck('fps')}<span>${T('set_vib')}</span>${ck('vib')}<span></span><button id="sReset">${T('set_reset')}</button>`;
 f.querySelectorAll('[data-k]').forEach(e=>e.oninput=e.onchange=()=>{const k=e.dataset.k;S[k]=e.type==='checkbox'?e.checked:e.type==='range'?+e.value:(isNaN(+e.value)?e.value:+e.value);saveSettings();applySettings();if(k==='sfx')SND.play('build');});
 $('sReset').onclick=()=>confirmBox(T('confirmReset'),()=>{prog={unlocked:1,done:[],stars:[]};Auth.del('game');Auth.del('scores');G=null;save();toast(T('resetDone'));show('scrMain');});}
const COLORS=['#f0a040','#e2584a','#4ab0e2','#6ccf6a','#b07ae0','#e0d040','#e070b0','#cccccc'];let newColor=COLORS[2];
function renderAccount(){const a=$('accBody'),cur=Auth.current();
 let h=`<div class="sec"><h3>${T('acc_profiles')}</h3>`+Auth.profiles().map(p=>`<div class="prow"><i class="av" style="background:${p.color}"></i><span>${esc(p.nick)}${p.id===cur.id?' <small>('+T('acc_current')+')</small>':''}</span>${p.id!==cur.id?`<button data-sw="${p.id}">${T('acc_switch')}</button><button data-del="${p.id}">${T('acc_del')}</button>`:''}</div>`).join('');
 h+=`<div class="prow"><input id="nNick" maxlength="16" placeholder="${T('acc_nick')}" style="width:130px"> ${COLORS.map(c=>`<button class="sw${c===newColor?' sel':''}" data-c="${c}" style="background:${c}"></button>`).join('')}<button id="nCreate">${T('acc_create')}</button></div></div>`;
 h+=`<div class="sec"><h3>${T('acc_export')}</h3><div class="prow"><button id="eCode">${T('acc_exportCode')}</button><button id="eFile">${T('acc_exportFile')}</button><button id="iFile">${T('acc_importFile')}</button></div><textarea id="iCode" placeholder="${T('acc_codePh')}"></textarea><button id="iGo">${T('acc_import')}</button></div>`;
 const cl=Auth.cloud;h+=`<div class="sec"><h3>${T('acc_cloud')}${cl.enabled?'':' — <span style="color:#f0c040">'+T('acc_cloudSoon')+'</span>'}</h3>`;
 if(!cl.enabled)h+=`<p class="sm">${T('acc_cloudSoonP')}</p><div class="prow"><button disabled>${T('acc_google')}</button><button disabled>${T('acc_email')}</button></div>`;
 else if(cl.user)h+=`<p>${T('acc_signed',esc(cl.user.email||cl.user.displayName||''))}</p><div class="prow"><button id="cUp">${T('acc_up')}</button><button id="cDown">${T('acc_down')}</button><button id="cOut">${T('acc_signout')}</button></div>`;
 else h+=`<div class="prow"><button id="cG">${T('acc_google')}</button></div><div class="prow"><input id="cE" placeholder="e-mail" style="width:150px"><input id="cP" type="password" placeholder="${T('acc_pass')}" style="width:110px"><button id="cEm">${T('acc_email')}</button></div>`;
 a.innerHTML=h+'</div>';
 a.querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>{save();Auth.switchTo(b.dataset.sw);reloadProfile();});
 a.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const p=Auth.profiles().find(x=>x.id===b.dataset.del);confirmBox(T('acc_confirmDel',p.nick),()=>{Auth.remove(p.id);renderAccount();});});
 a.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{newColor=b.dataset.c;renderAccount();});
 $('nCreate').onclick=()=>{const n=$('nNick').value.trim()||T('profileDefault');save();Auth.switchTo(Auth.create(n,newColor));reloadProfile();};
 $('eCode').onclick=()=>{const c=Auth.exportCode();$('iCode').value=c;try{navigator.clipboard.writeText(c).then(()=>toast(T('acc_copied')),()=>{});}catch(e){}};
 $('eFile').onclick=()=>{save();const bl=new Blob([Auth.exportCode()],{type:'text/plain'});const u=URL.createObjectURL(bl);const l=document.createElement('a');l.href=u;l.download='factory-save-'+Auth.current().nick+'.f2d';l.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
 $('iFile').onclick=()=>$('fileIn').click();$('iGo').onclick=()=>doImport($('iCode').value);
 const wrap=fn=>async()=>{try{await fn();renderAccount();}catch(e){toast(e.message||'Error');}};
 if($('cG'))$('cG').onclick=wrap(()=>cl.signInGoogle());if($('cEm'))$('cEm').onclick=wrap(()=>cl.signInEmail($('cE').value,$('cP').value));
 if($('cOut'))$('cOut').onclick=wrap(()=>cl.signOut());if($('cUp'))$('cUp').onclick=wrap(async()=>{save();await cl.upload();toast('OK');});if($('cDown'))$('cDown').onclick=wrap(async()=>{if(await cl.download())reloadProfile();});}
Auth.cloud.onChange(()=>{if(!$('scrAccount').classList.contains('hide'))renderAccount();});
$('fileIn').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(doImport);e.target.value='';};
function doImport(code){try{Auth.importCode(code);toast(T('acc_imported'));reloadProfile();}catch(e){toast(T('acc_badCode'));SND.play('error');}}
function reloadProfile(){prog=Object.assign({unlocked:1,done:[],stars:[]},Auth.get('prog',{}));S=Object.assign({},SDEF,Auth.get('settings',{}));G=null;applySettings();show('scrAccount');}
// ---------- tutorial ----------
const TUT=[{next:true},{ok:()=>G.blds.some(b=>b.t==='drill')},{ok:()=>G.stats.core>0},{ok:()=>G.blds.some(b=>b.t==='duo')},{ok:()=>G.blds.some(b=>b.t==='duo'&&b.ammo>0)},{ok:()=>G.wave>0}];
function tutShow(){if(!G||G.tut<0||G.tut>=TUT.length){$('tut').classList.add('hide');return;}$('tutTxt').innerHTML=T('tut'+G.tut);$('tutNext').classList.toggle('hide',!TUT[G.tut].next);$('tut').classList.remove('hide');
 const want=[null,'mine','log','def','def'][G.tut];if(want&&cat!==want&&catTools(want).length){cat=want;buildToolbar();}}
function tutAdvance(){G.tut++;if(G.tut>=TUT.length){G.tut=-1;prog.tutDone=1;save();toast(T('tutDone'));}tutShow();}
$('tutNext').onclick=tutAdvance;$('tutSkip').onclick=()=>{G.tut=-1;prog.tutDone=1;tutShow();};
// ---------- UI ----------
let toastT=0;function toast(s){const e=$('toast');e.textContent=s;e.style.opacity=1;toastT=2.2;}
const catTools=c=>G?unlockedTools().filter(t=>B[t].cat===c):[];
const costHtml=c=>Object.entries(c).map(([k,v])=>`<span class="${G&&G.res[k]<v?'miss':'okc'}"><i style="display:inline-block;width:8px;height:8px;background:${ITEMS[k].c};transform:rotate(45deg);margin-right:2px"></i>${v} ${ITEMS[k].n}</span>`).join(' ');
function buildToolbar(){const C=$('cats');C.innerHTML='';for(const k of CATS){const b=document.createElement('button');b.textContent=T('cat_'+k);b.className=(k===cat?'sel':'')+(catTools(k).length?'':' empty');b.onclick=()=>{SND.play('click');cat=k;buildToolbar();};C.append(b);}
 const Tl=$('tools');Tl.innerHTML='';const list=catTools(cat);if(!list.length)Tl.innerHTML=`<span class="none">${T('catEmpty')}</span>`;
 for(const t of list){const b=document.createElement('button');b.className='tool';b.dataset.t=t;
 const c=document.createElement('canvas');c.width=c.height=56;const x=c.getContext('2d');x.setTransform(36,0,0,36,10,10);drawBlock(x,{...newB(t,0,0,0),ang:-Math.PI/4},true);
 b.append(c);b.insertAdjacentHTML('beforeend',`<span>${B[t].n}</span>`);
 b.onclick=()=>{SND.play('click');delMode=false;tool=tool===t?null:t;selB(null);updTools();};Tl.append(b);}updTools();}
function updTools(){document.querySelectorAll('.tool').forEach(b=>{b.classList.toggle('sel',b.dataset.t===tool);b.classList.toggle('poor',!afford(B[b.dataset.t].cost));});$('bDel').classList.toggle('on',delMode);
 const tp=$('tip');if(tool&&G){const d=B[tool];let h=`<b>${d.n}</b> — ${T('d_'+tool)}<br>${T('cost')}: ${costHtml(d.cost)}`;
  if(d.range)h+=`<br>${T('range')}: ${d.range} · ${T('dmg')}: ${d.laser||Object.values(d.ammo).join('/')}`;h+=` · ${T('hp')}: ${d.hp}`;tp.innerHTML=h;tp.classList.remove('hide');}else tp.classList.add('hide');}
$('bRot').onclick=()=>{rot=(rot+1)%4;SND.play('click');if(sel&&sel.t==='conveyor'){sel.rot=(sel.rot+1)%4;}};$('bDel').onclick=()=>{delMode=!delMode;tool=null;selB(null);updTools();};
function updCtl(){$('bPause').textContent=paused?'▶':'⏸';$('bPause').classList.toggle('on',paused);$('bSpeed').textContent='×'+speed;$('bSpeed').classList.toggle('on',speed>1);}
$('bPause').onclick=()=>{paused=!paused;updCtl();};$('bSpeed').onclick=()=>{speed=speed===1?2:1;updCtl();};$('bMenu').onclick=()=>{save();show('pause');};
$('bWave').onclick=()=>{if(G.queue.length)return;startWave();};
function updHud(){$('res').innerHTML=Object.entries(ITEMS).map(([k,v])=>`<span><i style="background:${v.c}"></i>${G.res[k]|0}</span>`).join('');
 const L=LEVELS[G.lv];$('wave').innerHTML=`${L.n} · ${T('waveN',G.wave+'/'+L.waves)}<br>`+(G.wave>=L.waves?T('enemiesLeft',enemies.length+G.queue.length):`${T('nextIn',Math.ceil(G.wT))} · ${T('core')} ${Math.ceil(G.coreB.hp/B.core.hp*100)}%`);
 $('bWave').disabled=G.wave>=L.waves||G.queue.length>0;updTools();if(sel)renderSel();}
function selB(b){sel=b;if(!b){$('binfo').classList.add('hide');return;}renderSel();$('binfo').classList.remove('hide');}
function renderSel(){const b=sel,d=B[b.t];if(!G.blds.includes(b)&&!b.core){selB(null);return;}let h=`<b>${d.n}</b><br>${T('hp')}: ${Math.ceil(b.hp)}/${d.hp}<div class="bar"><i style="width:${b.hp/d.hp*100}%"></i></div>`;
 if(d.turret&&!d.laser)h+=`${T('ammo')}: ${b.ammo}/${d.cap}${b.ammo<=0?' <span class="miss">'+T('noAmmo')+'</span>':''}<br><small>${T('needAmmo',Object.keys(d.ammo).map(k=>ITEMS[k].n).join(', '))}</small>`;
 if(b.t==='press')h+=T('pressInfo',b.inp,b.out);if(b.t==='drill')h+=ITEMS[ORE[terrain[b.y*MW+b.x]]].n;
 if(!b.core){h+='<br>'+(b.t==='conveyor'?`<button id="sRot">↻ ${T('rotate')}</button>`:'')+`<button id="sDel">🗑 ${T('demolish')}</button>`;}
 const e=$('binfo');if(e._h===h)return;e._h=h;e.innerHTML=h;if($('sRot'))$('sRot').onclick=()=>{b.rot=(b.rot+1)%4;SND.play('click');};if($('sDel'))$('sDel').onclick=()=>{removeB(b,true);SND.play('remove');selB(null);};}
// ---------- input ----------
const ptrs=new Map();let pinch=null,drag=null;
const toW=(sx,sy)=>[(sx-W/2)/cam.z+cam.x,(sy-H/2)/cam.z+cam.y];
addEventListener('pointerdown',()=>SND.init(),{capture:true});
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptrs.size===2){drag=null;const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.z,mx:(a.x+b.x)/2,my:(a.y+b.y)/2};}
 else if(ptrs.size===1){const[wx,wy]=toW(e.clientX,e.clientY);hover=[wx,wy];drag={sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY,moved:0,paint:(tool==='conveyor'||tool==='wall'||tool==='lwall'||delMode),last:null,t:performance.now()};
  if(drag.paint){paintAt(Math.floor(wx),Math.floor(wy));}}});
cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);hover=toW(e.clientX,e.clientY);if(!p)return;p.x=e.clientX;p.y=e.clientY;
 if(pinch&&ptrs.size>=2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  cam.z=Math.max(12,Math.min(90,pinch.z*d/pinch.d));cam.x-=(mx-pinch.mx)/cam.z;cam.y-=(my-pinch.my)/cam.z;pinch.mx=mx;pinch.my=my;clampCam();return;}
 if(drag){const dx=e.clientX-drag.lx,dy=e.clientY-drag.ly;drag.moved+=Math.abs(dx)+Math.abs(dy);drag.lx=e.clientX;drag.ly=e.clientY;
  if(drag.paint){paintAt(Math.floor(hover[0]),Math.floor(hover[1]));}else{cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam();}}});
function endP(e){ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(drag&&ptrs.size===0){if(!drag.paint&&drag.moved<10){const[wx,wy]=toW(e.clientX,e.clientY);tap(Math.floor(wx),Math.floor(wy));}drag=null;}}
cv.addEventListener('pointerup',endP);cv.addEventListener('pointercancel',endP);
cv.addEventListener('wheel',e=>{e.preventDefault();const[wx,wy]=toW(e.clientX,e.clientY);cam.z=Math.max(12,Math.min(90,cam.z*(e.deltaY<0?1.12:.89)));const[nx,ny]=toW(e.clientX,e.clientY);cam.x+=wx-nx;cam.y+=wy-ny;clampCam();},{passive:false});
let hover=null;
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='KeyR')$('bRot').onclick();if(e.code==='Space'&&G){paused=!paused;updCtl();}if(e.code==='Escape'){tool=null;delMode=false;selB(null);updTools();}});
document.addEventListener('contextmenu',e=>e.preventDefault());
function clampCam(){cam.x=Math.max(0,Math.min(MW,cam.x));cam.y=Math.max(0,Math.min(MH,cam.y));}
function failMsg(t,x,y){if(!afford(B[t].cost))toast(T('noRes'));else if(t==='drill'&&inMap(x,y)&&!bAt(x,y)&&terrain[y*MW+x]!==1)toast(T('drillOre'));else toast(T('cantPlace'));SND.play('error');}
function paintAt(x,y){if(!G||G.over)return;const l=drag.last;if(l&&l[0]===x&&l[1]===y)return;
 if(delMode){const b=bAt(x,y);if(b&&!b.core){removeB(b,true);puff(x+.5,y+.5,'#f66',5,.6);SND.play('remove');}drag.last=[x,y];return;}
 if(l){let cx=l[0],cy=l[1];while(cx!==x||cy!==y){let r2;if(cx!==x){r2=x>cx?0:2;}else r2=y>cy?1:3;
   const pb=bAt(cx,cy);if(tool==='conveyor'&&pb&&pb.t==='conveyor'&&pb.placedNow)pb.rot=r2;rot=r2;cx+=DIRS[r2][0];cy+=DIRS[r2][1];const nb=place(tool,cx,cy,r2);if(nb)nb.placedNow=true;}}
 else{const nb=place(tool,x,y,rot);if(nb)nb.placedNow=true;else if(!afford(B[tool].cost))failMsg(tool,x,y);}
 drag.last=[x,y];}
function tap(x,y){if(!G||G.over)return;const b=bAt(x,y);
 if(tool){if(place(tool,x,y,rot))return;if(b&&!b.core){tool=null;updTools();selB(b);return;}failMsg(tool,x,y);return;}
 selB(b||null);if(b)SND.play('click');}
// ---------- drawing ----------
function drawItem(c,it,x,y,s){c.fillStyle=ITEMS[it].c;c.beginPath();c.moveTo(x,y-s);c.lineTo(x+s,y);c.lineTo(x,y+s);c.lineTo(x-s,y);c.closePath();c.fill();c.strokeStyle='#0009';c.lineWidth=.04;c.stroke();}
function rr(c,x,y,w,h,col,ol){c.fillStyle=col;c.fillRect(x,y,w,h);if(ol){c.strokeStyle=ol;c.lineWidth=.06;c.strokeRect(x+.03,y+.03,w-.06,h-.06);}}
function drawBlock(c,b,icon){const T=b.t,x=b.x,y=b.y,t=icon?0:now/1000;
 if(T==='conveyor'){c.save();c.translate(x+.5,y+.5);c.rotate(b.rot*Math.PI/2);rr(c,-.5,-.42,1,.84,'#4a4f5a');rr(c,-.5,-.32,1,.64,'#24272e');
  c.strokeStyle='#7d8595';c.lineWidth=.08;const off=(t*2.6)%(1/3);for(let i=-1;i<3;i++){const px=-.5+i/3+off;if(px<-.45||px>.45)continue;c.beginPath();c.moveTo(px-.1,-.18);c.lineTo(px+.04,0);c.lineTo(px-.1,.18);c.stroke();}
  c.restore();if(!icon)for(const it of b.items){const d=DIRS[b.rot];drawItem(c,it.t,x+.5+d[0]*(it.p-.5),y+.5+d[1]*(it.p-.5),.17);}if(icon){drawItem(c,'copper',x+.5,y+.5,.17);}return;}
 if(T==='router'){rr(c,x+.05,y+.05,.9,.9,'#555b68','#22252c');rr(c,x+.3,y+.3,.4,.4,'#2a2d34');if(b.buf&&b.buf[0])drawItem(c,b.buf[0].t,x+.5,y+.5,.15);
  c.fillStyle='#c98a3a';for(const[dx,dy]of DIRS)c.fillRect(x+.45+dx*.33,y+.45+dy*.33,.1,.1);return;}
 if(T==='drill'){rr(c,x+.04,y+.04,.92,.92,'#5f6672','#2a2d34');rr(c,x+.14,y+.14,.72,.72,'#3a3f48');const ore=icon?'copper':ORE[terrain[y*MW+x]];
  c.save();c.translate(x+.5,y+.5);c.rotate(icon?0:t*(b.buf.length<5?5:0));c.fillStyle='#9aa1ad';for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.fillRect(-.06,-.3,.12,.3);}c.restore();
  c.fillStyle=ITEMS[ore].c;c.fillRect(x+.42,y+.42,.16,.16);return;}
 if(T==='press'){rr(c,x+.04,y+.04,.92,.92,'#4f5562','#22252c');const p=icon?.5:Math.abs(Math.sin(t*4))*(b.inp>=2?1:0);rr(c,x+.18,y+.18+p*.12,.64,.3,'#7a8292');rr(c,x+.18,y+.62,.64,.2,'#2a2d34');
  if(!icon&&b.out)drawItem(c,'graphite',x+.5,y+.72,.12);return;}
 if(T==='wall'||T==='lwall'){const col=T==='wall'?'#b07a52':'#7c70a6';rr(c,x+.03,y+.03,.94,.94,col,'#0006');c.fillStyle='#ffffff22';c.fillRect(x+.1,y+.1,.8,.12);c.fillStyle='#0003';c.fillRect(x+.1,y+.5,.8,.06);return;}
 if(T==='core'){rr(c,x-1+.05,y-1+.05,2.9,2.9,'#3c414c','#1a1c22');rr(c,x-.6,y-.6,2.2,2.2,'#565c69');const p=.5+.5*Math.sin(t*3);
  c.fillStyle=`rgb(${230},${140+p*40|0},${50})`;c.fillRect(x,y,1,1);c.strokeStyle='#ffd08a';c.lineWidth=.05;c.strokeRect(x-.2,y-.2,1.4,1.4);
  c.fillStyle='#c98a3a';for(const[dx,dy]of[[-1,-1],[1.7,-1],[-1,1.7],[1.7,1.7]])c.fillRect(x+dx+.05,y+dy+.05,.2,.2);return;}
 if(B[T].turret){const base=T==='duo'?'#5a606c':T==='hail'?'#5c5a4e':'#4e5a66';rr(c,x+.06,y+.06,.88,.88,base,'#1d2026');
  c.save();c.translate(x+.5,y+.5);c.rotate(b.ang);
  const rec=b.flash>0?-.08:0;
  if(T==='duo'){c.fillStyle='#8a919e';c.fillRect(.05+rec,-.2,.5,.13);c.fillRect(.05+rec,.07,.5,.13);rr(c,-.28,-.28,.56,.56,'#9aa1ad','#30343c');c.fillStyle='#c98a3a';c.fillRect(-.1,-.1,.2,.2);}
  else if(T==='hail'){c.fillStyle='#7a776a';c.fillRect(.0+rec,-.12,.55,.24);c.beginPath();c.arc(0,0,.33,0,7);c.fillStyle='#a8a492';c.fill();c.strokeStyle='#30343c';c.lineWidth=.05;c.stroke();}
  else{c.fillStyle='#6aa8d8';c.fillRect(.0+rec,-.07,.62,.14);c.beginPath();c.moveTo(-.3,-.3);c.lineTo(.3,-.15);c.lineTo(.3,.15);c.lineTo(-.3,.3);c.closePath();c.fillStyle='#9fb6c8';c.fill();c.stroke();
   if(b.charge>0){c.fillStyle=`rgba(140,220,255,${b.charge})`;c.beginPath();c.arc(.62,0,.1+.12*b.charge,0,7);c.fill();}}
  c.restore();if(!icon&&!B[T].laser&&b.ammo<=0)noAmmo(c,x+.5,y-.05,t);return;}}
function noAmmo(c,x,y,t){const a=.55+.45*Math.sin(t*6);c.globalAlpha=a;c.fillStyle='#200';c.beginPath();c.arc(x,y,.22,0,7);c.fill();c.fillStyle='#ffd27a';c.fillRect(x-.05,y-.13,.1,.24);c.fillRect(x-.08,y+.08,.16,.05);
 c.strokeStyle='#ff4040';c.lineWidth=.06;c.beginPath();c.arc(x,y,.2,0,7);c.moveTo(x-.14,y+.14);c.lineTo(x+.14,y-.14);c.stroke();c.globalAlpha=1;}
function arrow(c,x,y,r,col){c.save();c.translate(x+.5,y+.5);c.rotate(r*Math.PI/2);c.fillStyle=col;c.beginPath();c.moveTo(.42,0);c.lineTo(.08,-.26);c.lineTo(.08,-.1);c.lineTo(-.36,-.1);c.lineTo(-.36,.1);c.lineTo(.08,.1);c.lineTo(.08,.26);c.closePath();c.fill();c.strokeStyle='#000a';c.lineWidth=.04;c.stroke();c.restore();}
function drawEnemy(c,e){c.save();c.translate(e.x,e.y);
 c.fillStyle='#0005';c.beginPath();c.ellipse(.05,.1,e.r*1.1,e.r*.8,0,0,7);c.fill();c.rotate(e.ang);const r=e.r,lg=Math.sin(e.walk)*r*.5;
 c.fillStyle='#2a2a30';c.fillRect(-r*.6+lg,-r*1.05,r*1.1,r*.4);c.fillRect(-r*.6-lg,r*.65,r*1.1,r*.4);
 c.fillStyle=e.hit>0?'#fff':e.c;c.beginPath();c.moveTo(r*1.1,0);c.lineTo(-r*.8,-r*.85);c.lineTo(-r*.5,0);c.lineTo(-r*.8,r*.85);c.closePath();c.fill();c.strokeStyle='#1a0a0a';c.lineWidth=.05;c.stroke();
 c.fillStyle='#ffe28a';c.fillRect(r*.25,-r*.12,r*.3,r*.24);c.restore();
 if(e.hp<e.max){c.fillStyle='#000a';c.fillRect(e.x-r,e.y-r-.25,r*2,.09);c.fillStyle='#e55';c.fillRect(e.x-r,e.y-r-.25,r*2*Math.max(0,e.hp/e.max),.09);}}
let now=0;
function draw(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.fillStyle='#101216';c.fillRect(0,0,cv.width,cv.height);if(!G)return;
 const sh=G.shake||0,ox=(Math.random()-.5)*sh,oy=(Math.random()-.5)*sh;
 const z=cam.z*DPR;c.setTransform(z,0,0,z,DPR*W/2-(cam.x+ox)*z,DPR*H/2-(cam.y+oy)*z);
 c.imageSmoothingEnabled=false;c.drawImage(mapImg,0,0,MW,MH);
 const x0=Math.floor(cam.x-W/2/cam.z)-1,x1=Math.ceil(cam.x+W/2/cam.z)+1,y0=Math.floor(cam.y-H/2/cam.z)-1,y1=Math.ceil(cam.y+H/2/cam.z)+1;
 for(const s of G.spawns){const p=.5+.5*Math.sin(now/300);c.strokeStyle=`rgba(255,70,70,${.4+p*.4})`;c.lineWidth=.1;c.beginPath();c.arc(s.x+.5,s.y+.5,1.2+p*.3,0,7);c.stroke();c.fillStyle='#ff505030';c.fill();}
 const vis=b=>b.x>=x0&&b.x<=x1&&b.y>=y0&&b.y<=y1;
 for(const b of G.blds)if(b.t==='conveyor'&&vis(b))drawBlock(c,b);
 for(const b of G.blds)if(b.t!=='conveyor'&&vis(b)){drawBlock(c,b);if(b.hp<B[b.t].hp){c.fillStyle='#000a';c.fillRect(b.x+.1,b.y+.9,.8,.08);c.fillStyle='#6d6';c.fillRect(b.x+.1,b.y+.9,.8*b.hp/B[b.t].hp,.08);}}
 drawBlock(c,G.coreB);const cb=G.coreB;c.fillStyle='#000a';c.fillRect(cb.x-1,cb.y+2.1,3,.15);c.fillStyle='#e8a040';c.fillRect(cb.x-1,cb.y+2.1,3*cb.hp/B.core.hp,.15);
 for(const e of enemies)drawEnemy(c,e);
 for(const b of bullets){if(b.art){const k=b.t/b.T,hgt=Math.sin(k*Math.PI)*1.2;c.fillStyle='#0006';c.beginPath();c.arc(b.x,b.y,.1,0,7);c.fill();c.fillStyle='#ffcf6a';c.beginPath();c.arc(b.x,b.y-hgt,.14,0,7);c.fill();}
  else{c.strokeStyle=b.col;c.lineWidth=.09;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.vx*.025,b.y-b.vy*.025);c.stroke();}}
 for(const f of flashes){c.save();c.translate(f.x,f.y);c.rotate(f.a);c.fillStyle='#fff6b0';c.beginPath();c.moveTo(0,-.15*f.s);c.lineTo(.45*f.s,0);c.lineTo(0,.15*f.s);c.closePath();c.fill();c.fillStyle='#ffb040aa';c.beginPath();c.arc(0,0,.2*f.s,0,7);c.fill();c.restore();}
 for(const bm of beams){c.strokeStyle=`rgba(120,210,255,${bm.life*4})`;c.lineWidth=.28*bm.life*4;c.beginPath();c.moveTo(bm.x1,bm.y1);c.lineTo(bm.x2,bm.y2);c.stroke();c.strokeStyle=`rgba(255,255,255,${bm.life*4})`;c.lineWidth=.07;c.stroke();}
 for(const p of parts){c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.c;const s=p.smoke?p.s*(2-p.life):p.s;c.fillRect(p.x-s/2,p.y-s/2,s,s);}c.globalAlpha=1;
 // placement preview
 if(hover&&(tool||delMode)){const hx=Math.floor(hover[0]),hy=Math.floor(hover[1]);if(tool){c.globalAlpha=.55;drawBlock(c,{...newB(tool,hx,hy,rot),ang:Math.PI*rot/2});c.globalAlpha=1;
  const ok=canPlace(tool,hx,hy)&&afford(B[tool].cost);c.strokeStyle=ok?'#7f7':'#f55';c.lineWidth=.06;c.strokeRect(hx,hy,1,1);
  if(tool==='conveyor'){c.globalAlpha=.9;arrow(c,hx,hy,rot,ok?'#ffffffcc':'#ff8080cc');c.globalAlpha=1;}
  if(B[tool].range){c.strokeStyle='#ffffff40';c.beginPath();c.arc(hx+.5,hy+.5,B[tool].range,0,7);c.stroke();}}
  else{c.strokeStyle='#f55';c.lineWidth=.08;c.strokeRect(hx,hy,1,1);}}
 if(sel&&!sel.core){c.strokeStyle='#f0c040';c.lineWidth=.07;c.strokeRect(sel.x-.03,sel.y-.03,1.06,1.06);if(B[sel.t].range){c.strokeStyle='#f0c04050';c.beginPath();c.arc(sel.x+.5,sel.y+.5,B[sel.t].range,0,7);c.stroke();}if(sel.t==='conveyor')arrow(c,sel.x,sel.y,sel.rot,'#f0c040cc');}}
let last=performance.now(),hudT=0;
function step(dt){if(!G||G.over)return;
 if(G.tut>=0&&G.tut<TUT.length&&TUT[G.tut].ok&&TUT[G.tut].ok()){tutAdvance();}
 const L=LEVELS[G.lv];
 if(G.wave<L.waves&&!(G.tut>=1&&G.tut<=4)){G.wT-=dt;if(G.wT<=0&&!G.queue.length)startWave();}
 if(G.queue.length){G.qT-=dt;if(G.qT<=0){G.qT=.7;const t=G.queue.shift();const mul=1+(G.wave-1)*.08+G.lv*.12;spawnEnemy(t,G.spawns[(Math.random()*G.spawns.length)|0],mul);}}
 for(const b of G.blds)updBuild(b,dt);
 for(const e of enemies){updEnemy(e,dt);if(e.hit>0)e.hit-=dt;}
 enemies=enemies.filter(e=>!e.dead);
 for(const b of bullets){if(b.art){b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;if(k>=1){b.dead=true;explode(b.x,b.y,b.splash*.8,'#ffb040');for(const e of enemies)if(Math.hypot(e.x-b.x,e.y-b.y)<b.splash+e.r)hurt(e,b.dmg);}}
  else{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)b.dead=true;for(const e of enemies)if(!b.dead&&(e.x-b.x)**2+(e.y-b.y)**2<e.r*e.r){hurt(e,b.dmg);b.dead=true;spark(b.x,b.y);}}}
 bullets=bullets.filter(b=>!b.dead);enemies=enemies.filter(e=>!e.dead);
 if(G.wave>=L.waves&&!G.queue.length&&!enemies.length&&!G.over)win();}
function loop(t){requestAnimationFrame(loop);const rdt=Math.min(.05,(t-last)/1000);last=t;now=t;fpsAcc.push(rdt);if(fpsAcc.length>30)fpsAcc.shift();
 if(G&&!paused&&!inMenu()){const n=speed;for(let i=0;i<n;i++)step(rdt);}
 const pdt=paused||inMenu()?0:rdt*speed;
 for(const p of parts){p.x+=p.vx*pdt;p.y+=p.vy*pdt;p.vx*=.92;p.vy*=.92;p.life-=pdt;}parts=parts.filter(p=>p.life>0);if(parts.length>1500)parts.splice(0,parts.length-1500);
 for(const f of flashes)f.life-=pdt;flashes=flashes.filter(f=>f.life>0);for(const b of beams)b.life-=pdt;beams=beams.filter(b=>b.life>0);
 if(G)G.shake=Math.max(0,(G.shake||0)-rdt);
 draw();toastT-=rdt;if(toastT<0)$('toast').style.opacity=0;hudT-=rdt;
 if(hudT<0){hudT=.25;if(G){updHud();SND.hum(inMenu()?0:G.blds.length);SND.tension=Math.min(1,enemies.length/15);}else SND.hum(0);if(S.fps)$('fps').textContent=T('fps')+' '+Math.round(fpsAcc.length/fpsAcc.reduce((a,b)=>a+b,0));}}
let fpsAcc=[];
// ---------- boot ----------
applySettings();show('scrMain');requestAnimationFrame(loop);
// отладочные хуки для автотестов
function sim(sec,dt){dt=dt||.05;for(let t=0;t<sec&&G&&!G.over;t+=dt)step(dt);return G&&{over:G.over,wave:G.wave,core:G.coreB.hp,kills:G.stats.kills,en:enemies.length};}
window.__f={get G(){return G},cam,start,place,startWave,get enemies(){return enemies},setTool:t=>{tool=t;updTools();},TUT,sim,get prog(){return prog},LEVELS,B,waveList,dmgB,tutAdvance,get S(){return S}};
