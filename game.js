'use strict';
const $=id=>document.getElementById(id);
const cv=$('c'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1;
function resize(){DPR=Math.min(devicePixelRatio||1,typeof S==='undefined'?2:S.quality==='low'?1:S.dpr);W=innerWidth;H=innerHeight;cv.width=W*DPR|0;cv.height=H*DPR|0;}
addEventListener('resize',resize);
// ---------- data ----------
const ITEMS={copper:{c:'#d99d73'},lead:{c:'#9a8cc4'},coal:{c:'#3a3a3e'},graphite:{c:'#6d8299'},sand:{c:'#e0c890'},silicon:{c:'#4a5568'},titanium:{c:'#8fb3d9'}};
for(const k in ITEMS)Object.defineProperty(ITEMS[k],'n',{get:()=>T('i_'+k)});
const ORE={2:'copper',3:'lead',4:'coal',5:'sand',6:'titanium'};
const DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
const B={
 conveyor:{cat:'log',cost:{copper:1},hp:45,walk:true},
 drill:{cat:'mine',cost:{copper:12},hp:120,solid:true,up:true},
 pdrill:{cat:'mine',cost:{copper:20,graphite:12},hp:180,solid:true,up:true},
 router:{cat:'log',cost:{copper:3},hp:60,walk:true},
 press:{cat:'prod',cost:{copper:50,lead:25},hp:200,solid:true},
 duo:{cat:'def',cost:{copper:35},hp:220,solid:true,turret:true,air:true,up:true,range:8.5,reload:.32,ammo:{copper:9,graphite:18},cap:40},
 hail:{cat:'def',cost:{copper:40,graphite:17},hp:300,solid:true,turret:true,range:13,reload:1.6,ammo:{graphite:34},cap:20,splash:1.3,up:true},
 lancer:{cat:'def',cost:{copper:60,lead:50,graphite:30},hp:420,solid:true,turret:true,range:10,reload:2.4,laser:110,use:2.5,up:true},
 aa:{cat:'def',cost:{copper:70,lead:40,graphite:20},hp:260,solid:true,turret:true,aa:true,range:11,reload:.18,ammo:{graphite:16,silicon:24},cap:60,up:true},
 mender:{cat:'def',cost:{lead:30,silicon:10},hp:160,solid:true,use:1,range:4,up:true},
 generator:{cat:'pow',cost:{copper:40,lead:20},hp:180,solid:true,gen:6,up:true},
 node:{cat:'pow',cost:{copper:4,lead:6},hp:60,walk:true,range:6.5},
 battery:{cat:'pow',cost:{copper:10,lead:30},hp:150,solid:true,store:500},
 smelter:{cat:'prod',cost:{copper:50,lead:30},hp:220,solid:true,use:2},
 factory:{cat:'prod',cost:{copper:100,lead:60,silicon:30,titanium:30},hp:400,solid:true,use:3,up:true},
 dronepad:{cat:'prod',cost:{lead:50,silicon:30,titanium:20},hp:260,solid:true,use:1},
 wall:{cat:'def',cost:{copper:6},hp:360,solid:true,up:true},
 lwall:{cat:'def',cost:{lead:8,copper:2},hp:750,solid:true,up:true},
 twall:{cat:'def',cost:{titanium:6},hp:1200,solid:true,up:true},
 core:{hp:2500,solid:true}};
for(const k in B)Object.defineProperty(B[k],'n',{get:()=>T('b_'+k)});
const CATS=['mine','log','prod','def','pow'];
const ENEMY={dagger:{n:'Кинжал',hp:130,spd:1.0,dps:22,r:.32,c:'#e2584a'},crawler:{n:'Ползун',hp:55,spd:1.9,boom:70,r:.24,c:'#f08a3a'},
 mace:{n:'Булава',hp:560,spd:.55,dps:48,r:.42,c:'#c24a8a'},boss:{n:'Крепость',hp:4000,spd:.38,dps:140,r:.7,c:'#8a2a2a',boss:true},
 flare:{hp:70,spd:2.4,dps:14,r:.24,c:'#ff70d0',fly:true},horizon:{hp:340,spd:1.1,bomb:40,r:.38,c:'#b070ff',fly:true},mboss:{hp:3200,spd:.5,dps:60,r:.75,c:'#7040c0',fly:true,boss:true}};
const LEVELS=[
 {n:'Плацдарм',waves:6,seed:11,ores:['copper','lead'],unlock:['conveyor','drill','duo','wall'],start:{copper:200,lead:0,coal:0,graphite:0},en:['dagger'],spawns:1},
 {n:'Угольная долина',waves:8,seed:23,ores:['copper','lead','coal'],unlock:['router','press'],start:{copper:250,lead:60,coal:0,graphite:0},en:['dagger','crawler'],spawns:1},
 {n:'Перевал',waves:10,seed:37,ores:['copper','lead','coal'],unlock:['hail'],start:{copper:300,lead:100,coal:0,graphite:40},en:['dagger','crawler','mace'],spawns:1},
 {n:'Свинцовые копи',waves:12,seed:41,ores:['copper','lead','coal'],unlock:['lancer','lwall','generator','node','battery'],start:{copper:400,lead:220,coal:0,graphite:60},en:['dagger','crawler','mace'],spawns:2},
 {n:'Последний рубеж',waves:15,seed:59,ores:['copper','lead','coal'],unlock:[],start:{copper:500,lead:250,coal:0,graphite:100},en:['dagger','crawler','mace'],spawns:2,boss:true},
 {n:'Кремниевые дюны',waves:12,seed:67,ores:['copper','lead','coal','sand'],unlock:['smelter','aa','mender'],start:{copper:600,lead:350,coal:0,graphite:150},en:['dagger','crawler','flare'],spawns:2},
 {n:'Титановый хребет',waves:14,seed:73,ores:['copper','lead','coal','sand','titanium'],unlock:['pdrill','twall','factory','dronepad'],start:{copper:700,lead:400,coal:0,graphite:200,silicon:60},en:['dagger','crawler','mace','flare','horizon'],spawns:2},
 {n:'Цитадель',waves:16,seed:89,ores:['copper','lead','coal','sand','titanium'],unlock:[],start:{copper:800,lead:500,coal:0,graphite:250,silicon:100,titanium:60},en:['dagger','crawler','mace','flare','horizon'],spawns:2,boss:true,mboss:true}];
function endlessL(seed){return{n:T('endless'),waves:Infinity,seed,ores:['copper','lead','coal','sand','titanium'],unlock:[],start:{copper:700,lead:400,graphite:150,silicon:40},en:['dagger','crawler','mace','flare','horizon'],spawns:2,endless:true};}
const ORDER=['conveyor','drill','pdrill','router','press','smelter','factory','dronepad','duo','hail','lancer','aa','mender','wall','lwall','twall','generator','node','battery'];
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
let enemies=[],bullets=[],parts=[],flashes=[],beams=[],rings=[];
function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647;}}
function genMap(L){const r=rng(L.seed*997+1);terrain=new Uint8Array(MW*MH);
 const noise=(x,y)=>{let v=0;for(const[f,a]of[[.12,1],[.25,.5]])v+=a*(Math.sin(x*f*1.7+L.seed)+Math.sin(y*f*2.1+L.seed*.7)+Math.sin((x+y)*f*1.3))/3;return v;};
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){let t=0;if(noise(x,y)>.55||x===0||y===0||x===MW-1||y===MH-1)t=1;if(r()<.04)t=1;terrain[y*MW+x]=t;}
 const core={x:6,y:MH>>1};for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++)terrain[(core.y+y)*MW+core.x+x]=0;
 const blob=(cx,cy,t,n)=>{for(let i=0;i<n;i++){const x=Math.round(cx+(r()-.5)*4),y=Math.round(cy+(r()-.5)*4);if(x>1&&y>1&&x<MW-2&&y<MH-2)terrain[y*MW+x]=t;}};
 const oreT={copper:2,lead:3,coal:4,sand:5,titanium:6};
 blob(core.x+4,core.y-4,2,22);blob(core.x+3,core.y+5,2,16);
 let k=0;for(const o of L.ores)for(let i=0;i<3;i++){const x=8+r()*28,y=3+r()*(MH-6);blob(x,y,oreT[o],14);k++;}
 if(L.ores.includes('coal'))blob(core.x+7,core.y+1,4,14);
 if(L.ores.includes('lead'))blob(core.x+1,core.y-7,3,14);
 if(L.ores.includes('sand'))blob(core.x+9,core.y-4,5,16);if(L.ores.includes('titanium'))blob(core.x+11,core.y+5,6,14);
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
function newB(t,x,y,r){const b={t,x,y,lv:1,pw:0,inp2:0,st:0,fuel:0,rot:r||0,hp:B[t].hp,items:[],buf:[],ammo:0,ammoT:null,ang:Math.PI,cd:0,prog:0,inp:0,out:0,rr:0,flash:0,charge:0};return b;}
function canPlace(t,x,y){if(!inMap(x,y)||terrain[y*MW+x]===1||bAt(x,y))return false;if(t==='drill'&&(!ORE[terrain[y*MW+x]]||terrain[y*MW+x]===6))return false;if(t==='pdrill'&&!ORE[terrain[y*MW+x]])return false;
 for(const s of G.spawns)if(Math.abs(s.x-x)<=1&&Math.abs(s.y-y)<=1)return false;return true;}
const afford=c=>Object.entries(c).every(([k,v])=>G.res[k]>=v);
function place(t,x,y,r,free){if(!canPlace(t,x,y))return false;if(!free){if(!afford(B[t].cost))return false;for(const[k,v]of Object.entries(B[t].cost))G.res[k]-=v;}
 const b=newB(t,x,y,r);G.blds.push(b);tileB[y*MW+x]=b;if(B[t].solid)calcFlow();if(isPow(t))relink();
 if(!free){puff(x+.5,y+.5,'#ffffff',5,.6);SND.play('build');vib(8);}return b;}
function removeB(b,refund){if(sel===b)selB(null);G.blds.splice(G.blds.indexOf(b),1);tileB[b.y*MW+b.x]=null;if(refund)for(const[k,v]of Object.entries(B[b.t].cost))G.res[k]+=v;if(B[b.t].solid)calcFlow();if(isPow(b.t))relink();}
function makeCore(){const c=G.core;const b=newB('core',c.x,c.y);b.core=true;G.coreB=b;for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)tileB[(c.y+y)*MW+c.x+x]=b;}
// item transfer: offer item to building b coming from tile (sx,sy)
function offer(b,it,sx,sy){if(!b)return false;const T=b.t;
 if(T==='core'){G.res[it]=Math.min(9999,G.res[it]+1);G.stats.core++;return true;}
 if(T==='conveyor'){const d=DIRS[b.rot];if(b.x+d[0]===sx&&b.y+d[1]===sy)return false;const l=b.items[b.items.length-1];if(b.items.length>=3||(l&&l.p<.34))return false;
  // side input enters mid-belt
  const back=b.x-d[0]===sx&&b.y-d[1]===sy;b.items.push({t:it,p:back?0:.3});if(!back&&l&&l.p<.64){b.items.pop();return false;}return true;}
 if(T==='router'){if(b.buf.length>=1)return false;b.buf.push({t:it,sx,sy});return true;}
 if(T==='press'){if(it!=='coal'||b.inp>=10)return false;b.inp++;return true;}
 if(T==='generator'){if(it!=='coal'||b.inp>=10)return false;b.inp++;return true;}
 if(T==='smelter'){if(it==='coal'&&b.inp<10){b.inp++;return true;}if(it==='sand'&&b.inp2<20){b.inp2++;return true;}return false;}
 if(T==='factory'){if(it==='silicon'&&b.inp<20){b.inp++;return true;}if(it==='lead'&&b.inp2<20){b.inp2++;return true;}return false;}
 const bd=B[T];if(bd.turret&&bd.ammo&&bd.ammo[it]!==undefined){if(b.ammo>=bd.cap)return false;b.ammo+=it==='graphite'&&T==='duo'?3:2;b.ammoT=it;return true;}
 return false;}
function dump(b,it){for(let i=0;i<4;i++){const k=(b.rr+i)%4,d=DIRS[k];const n=bAt(b.x+d[0],b.y+d[1]);if(n&&n!==b&&offer(n,it,b.x,b.y)){b.rr=k+1;return true;}}return false;}
function updBuild(b,dt){const T=b.t;
 if(T==='conveyor'){const s=dt*2.6;for(let i=0;i<b.items.length;i++){const lim=i===0?1:b.items[i-1].p-.34;b.items[i].p=Math.min(b.items[i].p+s,Math.max(lim,b.items[i].p));}
  if(b.items.length&&b.items[0].p>=1){const d=DIRS[b.rot];if(offer(bAt(b.x+d[0],b.y+d[1]),b.items[0].t,b.x,b.y))b.items.shift();}}
 else if(T==='drill'||T==='pdrill'){if(b.buf.length<5){b.prog+=dt*(ORE[terrain[b.y*MW+b.x]]==='coal'?.45:ORE[terrain[b.y*MW+b.x]]==='titanium'?.35:.6)*(T==='pdrill'?1.45:1)*lm(b);if(b.prog>=1){b.prog=0;b.buf.push(ORE[terrain[b.y*MW+b.x]]);}}
  if(b.buf.length&&dump(b,b.buf[0]))b.buf.shift();}
 else if(T==='router'){b.cd-=dt;if(b.buf.length&&b.cd<=0){const it=b.buf[0];for(let i=0;i<4;i++){const k=(b.rr+i)%4,d=DIRS[k],nx=b.x+d[0],ny=b.y+d[1];if(nx===it.sx&&ny===it.sy)continue;const n=bAt(nx,ny);
   if(n&&n.t!=='router'&&offer(n,it.t,b.x,b.y)){b.rr=k+1;b.buf.shift();b.cd=.12;break;}}}}
 else if(T==='press'){if(b.inp>=2&&b.out<10){b.prog+=dt/1.5;if(b.prog>=1){b.prog=0;b.inp-=2;b.out++;puff(b.x+.5,b.y+.5,'#9ab',3,.4);}}if(b.out&&dump(b,'graphite'))b.out--;}
 else if(T==='generator'){if(b.fuel<=0&&b.inp>0){b.inp--;b.fuel=2.5;}if(b.fuel>0){b.fuel-=dt;if(Math.random()<dt*3)parts.push({x:b.x+.5,y:b.y+.2,vx:0,vy:-.6,life:.8,max:.8,c:'#5558',s:.2,smoke:true});}}
 else if(T==='smelter'){if(b.inp>=1&&b.inp2>=2&&b.out<10&&b.pw>.05){b.prog+=dt/1.3*b.pw;if(b.prog>=1){b.prog=0;b.inp--;b.inp2-=2;b.out++;}}if(b.out&&dump(b,'silicon'))b.out--;}
 else if(T==='mender'){b.cd-=dt*b.pw;if(b.cd<=0){b.cd=2;let any=false;for(const o of G.blds.concat([G.coreB]))if(Math.hypot(o.x-b.x,o.y-b.y)<=4&&o.hp<mhp(o)){o.hp=Math.min(mhp(o),o.hp+mhp(o)*.08*lm(b));any=true;}if(any)rings.push({x:b.x+.5,y:b.y+.5,r:4,life:.5,c:'110,230,120'});}}
 else if(B[T].turret)updTurret(b,dt);
 if(b.flash>0)b.flash-=dt;}
function updTurret(b,dt){const bd=B[b.t];b.cd-=dt;const cx=b.x+.5,cy=b.y+.5;let tg=null;const rg=bd.range+(b.lv-1)*.8;let bd2=rg*rg;
 for(const e of enemies){if(bd.aa?!e.fly:(e.fly&&!bd.air))continue;const d=(e.x-cx)**2+(e.y-cy)**2;if(d<bd2){bd2=d;tg=e;}}
 if(!tg){b.charge=0;return;}let want=Math.atan2(tg.y-cy,tg.x-cx);
 if(!bd.laser&&!bd.splash){const tt=Math.sqrt(bd2)/16;want=Math.atan2(tg.y+tg.vy*tt-cy,tg.x+tg.vx*tt-cx);}
 let da=((want-b.ang+Math.PI*3)%(Math.PI*2))-Math.PI;const ts=dt*(b.t==='hail'?2.5:7);b.ang+=Math.max(-ts,Math.min(ts,da));
 if(Math.abs(da)>.15||b.cd>0)return;
 if(bd.laser){if(b.pw<.05)return;b.charge+=dt*3*b.pw;if(b.charge<1)return;b.charge=0;b.cd=bd.reload;const ex=cx+Math.cos(b.ang)*rg,ey=cy+Math.sin(b.ang)*rg;
  beams.push({x1:cx+Math.cos(b.ang)*.5,y1:cy+Math.sin(b.ang)*.5,x2:ex,y2:ey,life:.25});
  for(const e of enemies){if(e.fly)continue;const t=Math.max(0,Math.min(1,((e.x-cx)*(ex-cx)+(e.y-cy)*(ey-cy))/(rg**2)));const px=cx+(ex-cx)*t,py=cy+(ey-cy)*t;if((e.x-px)**2+(e.y-py)**2<(e.r+.2)**2)hurt(e,bd.laser*lm(b));}
  b.flash=.12;SND.play('laser');return;}
 if(b.ammo<=0)return;b.ammo--;b.cd=bd.reload;b.flash=.08;const mx=cx+Math.cos(b.ang)*.6,my=cy+Math.sin(b.ang)*.6;
 if(bd.splash){bullets.push({x:mx,y:my,sx:mx,sy:my,tx:tg.x,ty:tg.y,t:0,T:Math.sqrt(bd2)/9,dmg:bd.ammo.graphite*lm(b),splash:bd.splash,art:true});}
 else{const sp=16;bullets.push({x:mx,y:my,vx:Math.cos(b.ang)*sp,vy:Math.sin(b.ang)*sp,life:rg/sp+.1,dmg:(bd.ammo[b.ammoT]||Object.values(bd.ammo)[0])*lm(b),col:bd.aa?'#ff9a9a':b.ammoT==='graphite'?'#bfe0ff':'#ffd27a'});
  b.ang+=(Math.random()-.5)*.05;}
 flashes.push({x:mx,y:my,a:b.ang,life:.07,s:bd.splash?1.4:1});SND.play(bd.splash?'hail':bd.aa?'aa':'duo');}
// ---------- enemies ----------
function hurt(e,d){e.hp-=d;e.hit=.1;if(e.hp<=0&&!e.dead){e.dead=true;explode(e.x,e.y,e.r*2.2,e.c);G.stats.kills++;}else SND.play('hit');}
function spawnEnemy(type,s,mul){const E=ENEMY[type];enemies.push({type,x:s.x+.5+(Math.random()-.5),y:s.y+.5+(Math.random()-.5)*2,hp:E.hp*mul,max:E.hp*mul,spd:E.spd,r:E.r,c:E.c,fly:!!E.fly,vx:0,vy:0,ang:Math.PI,hit:0,walk:Math.random()*6});}
function updEnemy(e,dt){const E=ENEMY[e.type];if(E.boss)bossAbil(e,E,dt);if(E.fly){updFly(e,E,dt);return;}const tx=Math.floor(e.x),ty=Math.floor(e.y);
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
 if(terrain[ty*MW+tx]!==1&&terrain[Math.floor(e.y)*MW+Math.floor(e.x)]===1){const ox=e.x-e.vx*dt,oy=e.y-e.vy*dt;const rk=(x,y)=>terrain[Math.floor(y)*MW+Math.floor(x)]===1;
  if(!rk(e.x,oy))e.y=oy;else if(!rk(ox,e.y))e.x=ox;else{e.x=ox+(tx+.5-ox)*.2;e.y=oy+(ty+.5-oy)*.2;}}}
function dmgB(b,d){if(b.dead)return;b.hp-=d;b.hitT=.1;if(b.core&&Math.random()<.05)vib(15);if(b.hp<=0){explode(b.x+.5,b.y+.5,b.core?3:1.2,'#ff9a40');if(b.core){lose();return;}b.dead=true;removeB(b,false);}}
// ---------- particles ----------
function puff(x,y,c,n,s){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=Math.random()*s*2;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.5,max:.5,c,s:.12});}}
function spark(x,y){for(let i=0;i<3;i++){const a=Math.random()*6.28,v=2+Math.random()*3;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.2,max:.2,c:'#ffe080',s:.07});}}
function explode(x,y,r,c){SND.play('boom',r);const q=S.quality==='low'?.35:1;for(let i=0;i<14*r*q;i++){const a=Math.random()*6.28,v=Math.random()*r*3;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.4+Math.random()*.4,max:.8,c:i%3?c:'#ffef9a',s:.08+Math.random()*.14});}
 for(let i=0;i<6*q;i++){const a=Math.random()*6.28,v=Math.random()*r;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,max:1,c:'#555a',s:.25+Math.random()*.2,smoke:true});}
 G.shake=Math.min(.35,(G.shake||0)+r*.08);}
// ---------- waves ----------
function waveList(n){const L=G.L;const out=[];const cnt=Math.round(2+n*1.6+G.d*1.2);const has=k=>L.en.includes(k);
 for(let i=0;i<cnt;i++){let t='dagger';const r=Math.random();if(has('crawler')&&r<.3)t='crawler';else if(has('mace')&&n>=3&&r>.85)t='mace';else if(has('flare')&&n>=2&&r>.68&&r<=.8)t='flare';else if(has('horizon')&&n>=4&&r>.8&&r<=.85)t='horizon';out.push(t);}
 if(L.boss&&n===L.waves)out.push('boss');if(L.mboss&&n===L.waves)out.push('mboss');
 if(L.endless&&n%10===0)out.push(n%20?'boss':'mboss');return out;}
function startWave(){if(G.wave>=G.L.waves)return;G.wave++;G.queue=waveList(G.wave);G.qT=0;G.wT=Math.max(30,50-G.wave*1.5);
 toast(T('waveN',G.wave)+(G.wave===G.L.waves?T('lastWave'):''));SND.play('horn');vib(60);}
// ---------- level lifecycle ----------
function newLevel(lv,seed){const L=lv==='E'?endlessL(seed||((Math.random()*9000)|0)+100):LEVELS[lv];const m=genMap(L);
 G={lv,L,d:lv==='E'?2:lv,t:0,units:[],plinks:[],res:{copper:0,lead:0,coal:0,graphite:0,sand:0,silicon:0,titanium:0,...L.start},blds:[],core:m.core,spawns:m.spawns,wave:0,wT:lv===0?90:lv==='E'?40:55,queue:[],qT:0,stats:{core:0,kills:0},tut:lv===0&&!prog.tutDone?0:-1,over:false};
 tileB=new Array(MW*MH).fill(null);makeCore();enemies=[];bullets=[];parts=[];renderMap();calcFlow();sel=null;
 cam.x=G.core.x+8;cam.y=G.core.y;cam.z=Math.max(22,Math.min(40,H/16));}
function serialize(){return{lv:G.lv,seed:G.L.seed,res:G.res,wave:G.wave,wT:G.wT,tut:G.tut,coreHp:G.coreB.hp,stats:G.stats,blds:G.blds.map(b=>[b.t,b.x,b.y,b.rot,Math.round(b.hp),b.ammo,b.ammoT,b.lv])};}
function save(){Auth.set('prog',prog);if(G&&!G.over)Auth.set('game',serialize());}
function loadGame(){try{const s=Auth.get('game',null);if(!s)return false;newLevel(s.lv,s.seed);Object.assign(G.res,s.res);G.wave=s.wave;G.wT=s.wT;G.tut=s.tut;G.coreB.hp=s.coreHp;if(s.stats)G.stats=s.stats;
 for(const a of s.blds){const b=place(a[0],a[1],a[2],a[3],true);if(b){b.lv=a[7]||1;b.hp=a[4];b.ammo=a[5]||0;b.ammoT=a[6]||(a[0]==='hail'?'graphite':'copper');}}calcFlow();return true;}catch(e){console.warn(e);return false;}}
setInterval(()=>{if(G&&!paused)save();},8000);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
function unlockedTools(){if(G.L.endless)return ORDER.slice();const u=new Set();for(let i=0;i<=G.lv;i++)LEVELS[i].unlock.forEach(t=>u.add(t));return ORDER.filter(t=>u.has(t));}
const starsOf=hp=>hp>=.9?3:hp>=.5?2:1;
const starStr=n=>'★'.repeat(n)+'<s>'+'★'.repeat(3-n)+'</s>';
function win(){G.over=true;const st=starsOf(G.coreB.hp/B.core.hp);prog.done[G.lv]=1;prog.stars[G.lv]=Math.max(prog.stars[G.lv]||0,st);prog.unlocked=Math.max(prog.unlocked,Math.min(LEVELS.length,G.lv+2));Auth.del('game');save();SND.play('win');vib([40,40,80]);
 const nx=LEVELS[G.lv+1];let p=T('victoryP',G.L.n,G.stats.kills);if(nx){p+=T('unlockedSector',nx.n);if(nx.unlock.length)p+=T('unlockedTech',nx.unlock.map(t=>B[t].n).join(', '));p+='.';}else p+=T('campaignDone');
 showEnd(T('victory'),p,nx?T('nextSector'):T('playAgain'),()=>start(nx?G.lv+1:G.lv),st);}
function lose(){if(G.over)return;G.over=true;Auth.del('game');save();SND.play('lose');vib(300);
 if(G.L.endless){const hs=Auth.get('hs',[]);hs.push({w:G.wave,k:G.stats.kills,d:Date.now()});hs.sort((a,b)=>b.w-a.w||b.k-a.k);hs.length=Math.min(hs.length,5);Auth.set('hs',hs);
  showEnd(T('lost'),T('endlessP',G.wave,G.stats.kills,hs[0].w),T('restart'),()=>start('E'),0);return;}
 showEnd(T('lost'),T('lostP',G.wave),T('restart'),()=>start(G.lv),0);}
function showEnd(t,p,a,fn,st){setTimeout(()=>{$('endT').textContent=t;$('endP').textContent=p;$('endS').innerHTML=st?starStr(st):'';$('endA').textContent=a;$('endA').onclick=()=>{$('end').classList.add('hide');fn();};$('end').classList.remove('hide');},900);}
$('endM').onclick=()=>{$('end').classList.add('hide');G=null;show('scrMain');};
function start(lv){newLevel(lv);tool=null;delMode=false;buildToolbar();hideScreens();paused=false;speed=1;updCtl();if(G.tut>=0)tutShow();else $('tut').classList.add('hide');save();
 toast(lv==='E'?T('endless'):T('sector',lv+1,LEVELS[lv].n));}
// ---------- screens ----------
const SCR=['scrMain','scrLevels','scrSettings','scrAccount','scrCredits','pause'];let scrBack=[];
function hideScreens(){SCR.forEach(i=>$(i).classList.add('hide'));scrBack=[];}
function show(id,push){SND.play('click');const curS=SCR.find(i=>!$(i).classList.contains('hide'));if(push&&curS)scrBack.push(curS);else if(!push)scrBack=[];SCR.forEach(i=>$(i).classList.toggle('hide',i!==id));
 if(id==='scrMain')renderMain();if(id==='scrLevels')renderLevels();if(id==='scrSettings')renderSettings();if(id==='scrAccount')renderAccount();if(G)paused=true;}
const inMenu=()=>SCR.some(i=>!$(i).classList.contains('hide'))||!$('end').classList.contains('hide');
document.querySelectorAll('.back').forEach(b=>b.onclick=()=>{const p=scrBack.pop();if(p)show(p,false);else show(G?'pause':'scrMain');});
function renderMain(){const pr=Auth.current();$('prof').innerHTML=`<i style="background:${pr.color}"></i>${esc(pr.nick)}`;const has=!!Auth.get('game',null);
 $('mPlay').textContent=has?T('cont'):T('play');const hs=Auth.get('hs',[]);$('mEndless').innerHTML=T('endless')+(hs.length?' <small>('+T('record',hs[0].w)+')</small>':'');}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('prof').onclick=()=>show('scrAccount',true);
$('mPlay').onclick=()=>{if(loadGame()){buildToolbar();hideScreens();paused=false;updCtl();tutShow();}else{let n=0;while(n<LEVELS.length-1&&prog.done[n]&&n+1<prog.unlocked)n++;start(n);}};
$('mCampaign').onclick=()=>show('scrLevels',true);$('mEndless').onclick=()=>start('E');
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
  if(d.turret)h+=`<br>${T('range')}: ${d.range} · ${T('dmg')}: ${d.laser||Object.values(d.ammo).join('/')}`;h+=` · ${T('hp')}: ${d.hp}`;tp.innerHTML=h;tp.classList.remove('hide');}else tp.classList.add('hide');}
$('bRot').onclick=()=>{rot=(rot+1)%4;SND.play('click');if(sel&&sel.t==='conveyor'){sel.rot=(sel.rot+1)%4;}};$('bDel').onclick=()=>{delMode=!delMode;tool=null;selB(null);updTools();};
function updCtl(){$('bPause').textContent=paused?'▶':'⏸';$('bPause').classList.toggle('on',paused);$('bSpeed').textContent='×'+speed;$('bSpeed').classList.toggle('on',speed>1);}
$('bPause').onclick=()=>{paused=!paused;updCtl();};$('bSpeed').onclick=()=>{speed=speed===1?2:1;updCtl();};$('bMenu').onclick=()=>{save();show('pause');};
$('bWave').onclick=()=>{if(G.queue.length)return;startWave();};
function updHud(){$('res').innerHTML=Object.entries(ITEMS).filter(([k])=>G.res[k]>0||['copper','lead','coal','graphite'].includes(k)).map(([k,v])=>`<span><i style="background:${v.c}"></i>${G.res[k]|0}</span>`).join('');
 const L=G.L;$('wave').innerHTML=`${L.n} · ${T('waveN',G.wave+(L.endless?'':'/'+L.waves))}<br>`+(G.wave>=L.waves?T('enemiesLeft',enemies.length+G.queue.length):`${T('nextIn',Math.ceil(G.wT))} · ${T('core')} ${Math.max(0,Math.ceil(G.coreB.hp/B.core.hp*100))}%`);
 $('bWave').disabled=G.wave>=L.waves||G.queue.length>0;updTools();if(sel)renderSel();}
function selB(b){sel=b;if(!b){$('binfo').classList.add('hide');return;}renderSel();$('binfo').classList.remove('hide');}
function renderSel(){const b=sel,d=B[b.t];if(!G.blds.includes(b)&&!b.core){selB(null);return;}let h=`<b>${d.n}</b>${b.lv>1?' · '+T('lvl',b.lv):''}<br>${T('hp')}: ${Math.ceil(b.hp)}/${Math.round(mhp(b))}<div class="bar"><i style="width:${b.hp/mhp(b)*100}%"></i></div>`+extraInfo(b);
 if(d.turret&&!d.laser)h+=`${T('ammo')}: ${b.ammo}/${d.cap}${b.ammo<=0?' <span class="miss">'+T('noAmmo')+'</span>':''}<br><small>${T('needAmmo',Object.keys(d.ammo).map(k=>ITEMS[k].n).join(', '))}</small>`;
 if(b.t==='press')h+=T('pressInfo',b.inp,b.out);if(b.t==='drill')h+=ITEMS[ORE[terrain[b.y*MW+b.x]]].n;
 if(!b.core){const uc=upCost(b),rc=repCost(b);h+='<br>'+(b.t==='conveyor'?`<button id="sRot">↻ ${T('rotate')}</button>`:'')+(uc?`<button id="sUp">⬆ ${T('upgrade')} <small>${costHtml(uc)}</small></button>`:'')+(rc?`<button id="sRep">🔧 ${T('repair')} <small>${costHtml(rc)}</small></button>`:'')+`<button id="sDel">🗑 ${T('demolish')}</button>`;}
 const e=$('binfo');if(e._h===h)return;e._h=h;e.innerHTML=h;if($('sRot'))$('sRot').onclick=()=>{b.rot=(b.rot+1)%4;SND.play('click');};if($('sUp'))$('sUp').onclick=()=>doUpgrade(b);if($('sRep'))$('sRep').onclick=()=>doRepair(b);if($('sDel'))$('sDel').onclick=()=>{removeB(b,true);SND.play('remove');selB(null);};}
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
 if(T==='drill'||T==='pdrill'){rr(c,x+.04,y+.04,.92,.92,T==='pdrill'?'#4f7a8a':'#5f6672','#2a2d34');rr(c,x+.14,y+.14,.72,.72,'#3a3f48');const ore=icon?'copper':ORE[terrain[y*MW+x]];
  c.save();c.translate(x+.5,y+.5);c.rotate(icon?0:t*(b.buf.length<5?5:0));c.fillStyle='#9aa1ad';for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.fillRect(-.06,-.3,.12,.3);}c.restore();
  c.fillStyle=ITEMS[ore].c;c.fillRect(x+.42,y+.42,.16,.16);return;}
 if(T==='press'){rr(c,x+.04,y+.04,.92,.92,'#4f5562','#22252c');const p=icon?.5:Math.abs(Math.sin(t*4))*(b.inp>=2?1:0);rr(c,x+.18,y+.18+p*.12,.64,.3,'#7a8292');rr(c,x+.18,y+.62,.64,.2,'#2a2d34');
  if(!icon&&b.out)drawItem(c,'graphite',x+.5,y+.72,.12);return;}
 if(T==='wall'||T==='lwall'||T==='twall'){const col=T==='wall'?'#b07a52':T==='twall'?'#8fa9c4':'#7c70a6';rr(c,x+.03,y+.03,.94,.94,col,'#0006');c.fillStyle='#ffffff22';c.fillRect(x+.1,y+.1,.8,.12);c.fillStyle='#0003';c.fillRect(x+.1,y+.5,.8,.06);return;}
 if(T==='core'){rr(c,x-1+.05,y-1+.05,2.9,2.9,'#3c414c','#1a1c22');rr(c,x-.6,y-.6,2.2,2.2,'#565c69');const p=.5+.5*Math.sin(t*3);
  c.fillStyle=`rgb(${230},${140+p*40|0},${50})`;c.fillRect(x,y,1,1);c.strokeStyle='#ffd08a';c.lineWidth=.05;c.strokeRect(x-.2,y-.2,1.4,1.4);
  c.fillStyle='#c98a3a';for(const[dx,dy]of[[-1,-1],[1.7,-1],[-1,1.7],[1.7,1.7]])c.fillRect(x+dx+.05,y+dy+.05,.2,.2);return;}
 if(B[T].turret){const base=T==='duo'?'#5a606c':T==='hail'?'#5c5a4e':'#4e5a66';rr(c,x+.06,y+.06,.88,.88,base,'#1d2026');
  c.save();c.translate(x+.5,y+.5);c.rotate(b.ang);
  const rec=b.flash>0?-.08:0;
  if(T==='duo'){c.fillStyle='#8a919e';c.fillRect(.05+rec,-.2,.5,.13);c.fillRect(.05+rec,.07,.5,.13);rr(c,-.28,-.28,.56,.56,'#9aa1ad','#30343c');c.fillStyle='#c98a3a';c.fillRect(-.1,-.1,.2,.2);}
  else if(T==='hail'){c.fillStyle='#7a776a';c.fillRect(.0+rec,-.12,.55,.24);c.beginPath();c.arc(0,0,.33,0,7);c.fillStyle='#a8a492';c.fill();c.strokeStyle='#30343c';c.lineWidth=.05;c.stroke();}
  else if(T==='aa'){c.fillStyle='#8a919e';for(const o of[-.2,-.07,.07,.2])c.fillRect(.05+rec,o-.035,.5,.07);c.beginPath();c.arc(0,0,.3,0,7);c.fillStyle='#b0b8c4';c.fill();c.fillStyle='#e05050';c.fillRect(-.08,-.08,.16,.16);}
  else{c.fillStyle='#6aa8d8';c.fillRect(.0+rec,-.07,.62,.14);c.beginPath();c.moveTo(-.3,-.3);c.lineTo(.3,-.15);c.lineTo(.3,.15);c.lineTo(-.3,.3);c.closePath();c.fillStyle='#9fb6c8';c.fill();c.stroke();
   if(b.charge>0){c.fillStyle=`rgba(140,220,255,${b.charge})`;c.beginPath();c.arc(.62,0,.1+.12*b.charge,0,7);c.fill();}}
  c.restore();if(!icon&&!B[T].laser&&b.ammo<=0)noAmmo(c,x+.5,y-.05,t);if(!icon&&B[T].use&&b.pw<.5)noPow(c,x+.5,y-.05,t);return;}
 drawBlock2(c,b,icon,x,y,t);}
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
 drawLinks(c);
 for(const b of G.blds)if(b.t!=='conveyor'&&vis(b)){drawBlock(c,b);if(b.lv>1){c.fillStyle='#f0c040';for(let i=1;i<b.lv;i++)c.fillRect(b.x+.08+i*.14-.14,b.y+.06,.1,.1);}if(b.hp<mhp(b)){c.fillStyle='#000a';c.fillRect(b.x+.1,b.y+.9,.8,.08);c.fillStyle='#6d6';c.fillRect(b.x+.1,b.y+.9,.8*b.hp/mhp(b),.08);}}
 drawBlock(c,G.coreB);const cb=G.coreB;c.fillStyle='#000a';c.fillRect(cb.x-1,cb.y+2.1,3,.15);c.fillStyle='#e8a040';c.fillRect(cb.x-1,cb.y+2.1,3*cb.hp/B.core.hp,.15);
 for(const e of enemies)if(!e.fly)drawEnemy(c,e);for(const e of enemies)if(e.fly)drawFly(c,e);drawUnits(c);
 for(const g of rings){c.strokeStyle=`rgba(${g.c},${g.life*1.6})`;c.lineWidth=.08;c.beginPath();c.arc(g.x,g.y,g.r*(1.2-g.life),0,7);c.stroke();}
 for(const b of bullets){if(b.art){const k=b.t/b.T,hgt=Math.sin(k*Math.PI)*1.2;c.fillStyle='#0006';c.beginPath();c.arc(b.x,b.y,.1,0,7);c.fill();c.fillStyle='#ffcf6a';c.beginPath();c.arc(b.x,b.y-hgt,.14,0,7);c.fill();}
  else{c.strokeStyle=b.col;c.lineWidth=.09;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.vx*.025,b.y-b.vy*.025);c.stroke();}}
 for(const f of flashes){c.save();c.translate(f.x,f.y);c.rotate(f.a);c.fillStyle='#fff6b0';c.beginPath();c.moveTo(0,-.15*f.s);c.lineTo(.45*f.s,0);c.lineTo(0,.15*f.s);c.closePath();c.fill();c.fillStyle='#ffb040aa';c.beginPath();c.arc(0,0,.2*f.s,0,7);c.fill();c.restore();}
 for(const bm of beams){c.strokeStyle=`rgba(120,210,255,${bm.life*4})`;c.lineWidth=.28*bm.life*4;c.beginPath();c.moveTo(bm.x1,bm.y1);c.lineTo(bm.x2,bm.y2);c.stroke();c.strokeStyle=`rgba(255,255,255,${bm.life*4})`;c.lineWidth=.07;c.stroke();}
 for(const p of parts){c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.c;const s=p.smoke?p.s*(2-p.life):p.s;c.fillRect(p.x-s/2,p.y-s/2,s,s);}c.globalAlpha=1;
 // placement preview
 if(hover&&(tool||delMode)){const hx=Math.floor(hover[0]),hy=Math.floor(hover[1]);if(tool){c.globalAlpha=.55;drawBlock(c,{...newB(tool,hx,hy,rot),ang:Math.PI*rot/2});c.globalAlpha=1;
  const ok=canPlace(tool,hx,hy)&&afford(B[tool].cost);if(tool==='node'){c.strokeStyle='#f5d04a55';c.lineWidth=.04;for(const o of G.blds)if(isPow(o.t)&&Math.hypot(o.x-hx,o.y-hy)<=B.node.range){c.beginPath();c.moveTo(hx+.5,hy+.5);c.lineTo(o.x+.5,o.y+.5);c.stroke();}}c.strokeStyle=ok?'#7f7':'#f55';c.lineWidth=.06;c.strokeRect(hx,hy,1,1);
  if(tool==='conveyor'){c.globalAlpha=.9;arrow(c,hx,hy,rot,ok?'#ffffffcc':'#ff8080cc');c.globalAlpha=1;}
  if(B[tool].range){c.strokeStyle='#ffffff40';c.beginPath();c.arc(hx+.5,hy+.5,B[tool].range,0,7);c.stroke();}}
  else{c.strokeStyle='#f55';c.lineWidth=.08;c.strokeRect(hx,hy,1,1);}}
 if(sel&&!sel.core){c.strokeStyle='#f0c040';c.lineWidth=.07;c.strokeRect(sel.x-.03,sel.y-.03,1.06,1.06);if(B[sel.t].range){c.strokeStyle='#f0c04050';c.beginPath();c.arc(sel.x+.5,sel.y+.5,B[sel.t].range,0,7);c.stroke();}if(sel.t==='conveyor')arrow(c,sel.x,sel.y,sel.rot,'#f0c040cc');}}
let last=performance.now(),hudT=0;
function step(dt){if(!G||G.over)return;
 if(G.tut>=0&&G.tut<TUT.length&&TUT[G.tut].ok&&TUT[G.tut].ok()){tutAdvance();}
 const L=G.L;
 if(G.wave<L.waves&&!(G.tut>=1&&G.tut<=4)){G.wT-=dt;if(G.wT<=0&&!G.queue.length)startWave();}
 if(G.queue.length){G.qT-=dt;if(G.qT<=0){G.qT=.7;const t=G.queue.shift();const mul=G.L.endless?1+(G.wave-1)*.11:1+(G.wave-1)*.08+G.d*.12;spawnEnemy(t,G.spawns[(Math.random()*G.spawns.length)|0],mul);}}
 G.t+=dt;powerStep(dt);for(const b of G.blds)updBuild(b,dt);updUnits(dt);
 for(const e of enemies){updEnemy(e,dt);if(e.hit>0)e.hit-=dt;}
 enemies=enemies.filter(e=>!e.dead);
 for(const b of bullets){if(b.art){b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;if(k>=1){b.dead=true;explode(b.x,b.y,b.splash*.8,'#ffb040');for(const e of enemies)if(!e.fly&&Math.hypot(e.x-b.x,e.y-b.y)<b.splash+e.r)hurt(e,b.dmg);}}
  else{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)b.dead=true;for(const e of enemies)if(!b.dead&&(e.x-b.x)**2+(e.y-b.y)**2<e.r*e.r){hurt(e,b.dmg);b.dead=true;spark(b.x,b.y);}}}
 bullets=bullets.filter(b=>!b.dead);enemies=enemies.filter(e=>!e.dead);
 if(G.wave>=L.waves&&!G.queue.length&&!enemies.length&&!G.over)win();}
function loop(t){requestAnimationFrame(loop);const rdt=Math.min(.05,(t-last)/1000);last=t;now=t;fpsAcc.push(rdt);if(fpsAcc.length>30)fpsAcc.shift();
 if(G&&!paused&&!inMenu()){const n=speed;for(let i=0;i<n;i++)step(rdt);}
 const pdt=paused||inMenu()?0:rdt*speed;
 for(const p of parts){p.x+=p.vx*pdt;p.y+=p.vy*pdt;p.vx*=.92;p.vy*=.92;p.life-=pdt;}parts=parts.filter(p=>p.life>0);if(parts.length>1500)parts.splice(0,parts.length-1500);
 for(const f of flashes)f.life-=pdt;flashes=flashes.filter(f=>f.life>0);for(const b of beams)b.life-=pdt;beams=beams.filter(b=>b.life>0);for(const g of rings)g.life-=pdt;rings=rings.filter(g=>g.life>0);
 if(G)G.shake=Math.max(0,(G.shake||0)-rdt);
 draw();toastT-=rdt;if(toastT<0)$('toast').style.opacity=0;hudT-=rdt;
 if(hudT<0){hudT=.25;if(G){updHud();SND.hum(inMenu()?0:G.blds.length);SND.tension=Math.min(1,enemies.length/15);}else SND.hum(0);if(S.fps)$('fps').textContent=T('fps')+' '+Math.round(fpsAcc.length/fpsAcc.reduce((a,b)=>a+b,0));}}
let fpsAcc=[];
// ---------- энергия ----------
const isPow=t=>!!(B[t]&&(B[t].gen||B[t].use||B[t].store||t==='node'));
const lm=b=>1+.35*((b.lv||1)-1);
const mhp=b=>B[b.t].hp*(1+.4*((b.lv||1)-1));
function relink(){if(!G)return;const P=G.blds.filter(b=>isPow(b.t));G.plinks=[];const par=new Map();P.forEach(b=>par.set(b,b));
 const f=b=>{while(par.get(b)!==b){par.set(b,par.get(par.get(b)));b=par.get(b);}return b;};const un=(a,b)=>par.set(f(a),f(b));
 for(const n of P)if(n.t==='node'){let k=0;const near=P.filter(o=>o!==n&&Math.hypot(o.x-n.x,o.y-n.y)<=B.node.range).sort((a,b)=>Math.hypot(a.x-n.x,a.y-n.y)-Math.hypot(b.x-n.x,b.y-n.y));
  for(const o of near){if(k++>=8)break;if(o.t==='node'&&G.plinks.some(l=>l[0]===o&&l[1]===n))continue;G.plinks.push([n,o]);un(n,o);}}
 for(const a of P)for(const[dx,dy]of DIRS){const o=bAt(a.x+dx,a.y+dy);if(o&&o!==a&&isPow(o.t))un(a,o);}
 const nets=new Map();for(const b of P){const r=f(b);if(!nets.has(r))nets.set(r,[]);nets.get(r).push(b);}G.nets=[...nets.values()];}
function powerStep(dt){if(!G.nets)relink();for(const b of G.blds)if(B[b.t].use)b.pw=0;
 for(const net of G.nets){let prod=0,dem=0,cap=0,st=0;for(const b of net){const d=B[b.t];if(d.gen&&b.fuel>0)prod+=d.gen*lm(b);if(d.use)dem+=d.use;if(d.store){cap+=d.store;st+=b.st;}}
  let sat=1;const bal=(prod-dem)*dt;
  if(bal>=0){let add=bal;for(const b of net)if(B[b.t].store&&add>0){const a=Math.min(add,B[b.t].store-b.st);b.st+=a;add-=a;}}
  else{let need=-bal;for(const b of net)if(B[b.t].store&&need>0){const a=Math.min(need,b.st);b.st-=a;need-=a;}sat=dem?Math.max(0,1-need/(dem*dt)):1;}
  for(const b of net)if(B[b.t].use)b.pw=sat;G.pinfo=G.pinfo||new Map();for(const b of net)b.net={prod,dem,cap,st};}}
// ---------- улучшение и ремонт ----------
function upCost(b){const d=B[b.t];if(!d.up||b.lv>=3)return null;const m=b.lv===1?.6:1.1;const c={};for(const[k,v]of Object.entries(d.cost))c[k]=Math.ceil(v*m);
 if(b.lv===2&&(G.L.endless||G.lv>=5))c.silicon=(c.silicon||0)+10;return c;}
function repCost(b){if(b.hp>=mhp(b)-.5)return null;const f=1-b.hp/mhp(b);const base=Object.values(B[b.t].cost).reduce((a,v)=>a+v,0);return{copper:Math.max(1,Math.ceil(base*f*.4))};}
function doUpgrade(b){const c=upCost(b);if(!c)return;if(!afford(c)){toast(T('noRes'));SND.play('error');return;}for(const[k,v]of Object.entries(c))G.res[k]-=v;const f=b.hp/mhp(b);b.lv++;b.hp=mhp(b)*Math.max(f,.5)+mhp(b)*.2;b.hp=Math.min(b.hp,mhp(b));
 puff(b.x+.5,b.y+.5,'#f0c040',10,.9);SND.play('build');vib(20);toast(T('upgraded',B[b.t].n,b.lv));}
function doRepair(b){const c=repCost(b);if(!c)return;if(!afford(c)){toast(T('noRes'));SND.play('error');return;}for(const[k,v]of Object.entries(c))G.res[k]-=v;b.hp=mhp(b);puff(b.x+.5,b.y+.5,'#7f7',8,.7);SND.play('build');}
function extraInfo(b){const d=B[b.t];let h='';const pct=v=>Math.round(v*100)+'%';
 if(d.use)h+=`${T('power')}: <span class="${b.pw<.5?'miss':'okc'}">${pct(b.pw)}</span>${b.pw<.05?' '+T('noPower'):''}<br>`;
 if(b.t==='generator')h+=`${T('fuel')}: ${b.inp} ${ITEMS.coal.n}${b.fuel>0?' · '+T('burning'):' · <span class="miss">'+T('noFuel')+'</span>'}<br>`;
 if(b.net&&(d.gen||d.store||b.t==='node'))h+=`${T('netInfo',b.net.prod.toFixed(1),b.net.dem.toFixed(1),Math.round(b.net.st),b.net.cap)}<br>`;
 if(b.t==='smelter')h+=`${ITEMS.coal.n}: ${b.inp} · ${ITEMS.sand.n}: ${b.inp2} → ${ITEMS.silicon.n}: ${b.out}<br>`;
 if(b.t==='factory')h+=`${ITEMS.silicon.n}: ${b.inp}/10 · ${ITEMS.lead.n}: ${b.inp2}/10 · ${T('drones')}: ${G.units.filter(u=>u.home===b).length}/${2+b.lv} · ${pct(b.prog)}<br>`;
 if(b.t==='dronepad')h+=`${T('builder')}: ${G.units.some(u=>u.home===b)?T('active'):pct(b.prog)}<br>`;
 if(b.t==='pdrill')h+=ITEMS[ORE[terrain[b.y*MW+b.x]]].n+'<br>';
 return h;}
// ---------- рисование новых построек ----------
function noPow(c,x,y,t){c.globalAlpha=.55+.45*Math.sin(t*6);c.fillStyle='#201a00';c.beginPath();c.arc(x,y,.22,0,7);c.fill();c.fillStyle='#ffd23a';c.beginPath();c.moveTo(x+.04,y-.17);c.lineTo(x-.1,y+.03);c.lineTo(x,y+.03);c.lineTo(x-.04,y+.17);c.lineTo(x+.1,y-.03);c.lineTo(x,y-.03);c.closePath();c.fill();c.globalAlpha=1;}
function drawBlock2(c,b,icon,x,y,t){const T=b.t;
 if(T==='generator'){rr(c,x+.04,y+.04,.92,.92,'#5a5048','#22252c');const on=icon||b.fuel>0;c.fillStyle=on?`rgb(255,${140+40*Math.sin(t*9)|0},40)`:'#333';c.beginPath();c.arc(x+.5,y+.5,.24,0,7);c.fill();c.strokeStyle='#8a7a6a';c.lineWidth=.06;c.stroke();}
 else if(T==='node'){c.fillStyle='#3a3d44';c.beginPath();c.arc(x+.5,y+.5,.3,0,7);c.fill();c.fillStyle='#f5d04a';c.beginPath();c.arc(x+.5,y+.5,.14,0,7);c.fill();}
 else if(T==='battery'){rr(c,x+.12,y+.06,.76,.88,'#4a5048','#1d2026');const f=icon?.7:b.st/B.battery.store;rr(c,x+.22,y+.16+.68*(1-f),.56,.68*f,'#6ccf6a');c.fillStyle='#ddd';c.fillRect(x+.4,y+.02,.2,.06);}
 else if(T==='smelter'){rr(c,x+.04,y+.04,.92,.92,'#5c5450','#22252c');const on=!icon&&b.pw>.05&&b.inp>0&&b.inp2>1;rr(c,x+.22,y+.22,.56,.56,on?'#ff9a40':'#3a3330');if(b.out&&!icon)drawItem(c,'silicon',x+.5,y+.5,.14);}
 else if(T==='factory'){rr(c,x+.02,y+.02,.96,.96,'#4c5260','#1d2026');rr(c,x+.12,y+.12,.76,.3,'#2a2d34');c.fillStyle='#7fd8ff';c.beginPath();c.moveTo(x+.7,y+.62);c.lineTo(x+.3,y+.45);c.lineTo(x+.38,y+.62);c.lineTo(x+.3,y+.8);c.closePath();c.fill();if(!icon){c.fillStyle='#f0c040';c.fillRect(x+.12,y+.88,.76*b.prog,.06);}}
 else if(T==='dronepad'){rr(c,x+.04,y+.04,.92,.92,'#4a4e40','#1d2026');c.strokeStyle='#e0d040';c.lineWidth=.08;c.beginPath();c.arc(x+.5,y+.5,.3,0,7);c.stroke();c.fillStyle='#e0d040';c.fillRect(x+.42,y+.3,.16,.4);c.fillRect(x+.3,y+.42,.4,.16);}
 else if(T==='mender'){rr(c,x+.06,y+.06,.88,.88,'#4a5a4a','#1d2026');c.fillStyle=icon||b.pw>.05?'#6ccf6a':'#3a5a3a';c.fillRect(x+.4,y+.2,.2,.6);c.fillRect(x+.2,y+.4,.6,.2);}
 if(!icon&&B[T].use&&b.pw<.5)noPow(c,x+.5,y-.05,t);}
function drawLinks(c){if(!G.plinks.length)return;c.lineWidth=.07;for(const[a,o]of G.plinks){c.strokeStyle='#f5d04a99';c.beginPath();c.moveTo(a.x+.5,a.y+.5);c.lineTo(o.x+.5,o.y+.5);c.stroke();}}
function drawFly(c,e){c.fillStyle='#0004';c.beginPath();c.ellipse(e.x+.4,e.y+.6,e.r,e.r*.6,0,0,7);c.fill();c.save();c.translate(e.x,e.y);c.rotate(e.ang);const r=e.r;
 c.fillStyle=e.hit>0?'#fff':e.c;c.beginPath();c.moveTo(r*1.3,0);c.lineTo(-r,-r*1.2);c.lineTo(-r*.5,0);c.lineTo(-r,r*1.2);c.closePath();c.fill();c.strokeStyle='#1a0a1a';c.lineWidth=.05;c.stroke();
 c.fillStyle='#ffb0ff';c.fillRect(-r*.9,-r*.15,r*.35,r*.3);c.restore();
 if(e.hp<e.max){c.fillStyle='#000a';c.fillRect(e.x-r,e.y-r-.25,r*2,.09);c.fillStyle='#e5e';c.fillRect(e.x-r,e.y-r-.25,r*2*Math.max(0,e.hp/e.max),.09);}}
function drawUnits(c){for(const u of G.units){if(u.heal){c.strokeStyle='#8f8a';c.lineWidth=.06;c.beginPath();c.moveTo(u.x,u.y);c.lineTo(u.heal.x+.5,u.heal.y+.5);c.stroke();}
 c.fillStyle='#0004';c.beginPath();c.arc(u.x+.3,u.y+.45,.18,0,7);c.fill();c.save();c.translate(u.x,u.y);c.rotate(u.ang);
 c.fillStyle=u.k==='drone'?'#7fd8ff':'#e0d040';c.beginPath();c.moveTo(.3,0);c.lineTo(-.22,-.22);c.lineTo(-.1,0);c.lineTo(-.22,.22);c.closePath();c.fill();c.strokeStyle='#123';c.lineWidth=.04;c.stroke();c.restore();}}
// ---------- летающие враги и боссы ----------
function updFly(e,E,dt){e.rt=(e.rt||0)-dt;if(e.tg&&!e.tg.core&&!G.blds.includes(e.tg))e.tg=null;
 if(!e.tg||e.rt<=0){e.rt=1;let tg=G.coreB;if(!E.bomb&&!E.boss){let bd=1e9;for(const b of G.blds)if(B[b.t].turret||B[b.t].gen){const d=(b.x-e.x)**2+(b.y-e.y)**2;if(d<bd){bd=d;tg=b;}}if(bd>200)tg=G.coreB;}e.tg=tg;}
 const tx=e.tg.x+.5,ty=e.tg.y+.5,dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy)||1;e.ang=Math.atan2(dy,dx);
 for(const o of enemies){if(o===e||!o.fly)continue;const ox=e.x-o.x,oy=e.y-o.y,od=Math.hypot(ox,oy),m=e.r+o.r;if(od<m&&od>0){e.x+=ox/od*(m-od)*.2;e.y+=oy/od*(m-od)*.2;}}
 if(E.bomb){e.bt=(e.bt||0)-dt;const near=d<1.2;if(!near){e.vx=dx/d*e.spd;e.vy=dy/d*e.spd;}else{e.vx*=.95;e.vy*=.95;e.vx+=-dy/d*dt*2;e.vy+=dx/d*dt*2;}
  e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.bt<=0){const b=bAt(Math.floor(e.x),Math.floor(e.y));if(b){e.bt=.9;explode(e.x,e.y,.8,'#c080ff');for(const o of G.blds.concat([G.coreB]))if(Math.hypot(o.x+.5-e.x,o.y+.5-e.y)<1.3)dmgB(o,E.bomb);}}return;}
 const reach=(e.tg.core?1.7:.9)+e.r;if(d>reach){e.vx=dx/d*e.spd;e.vy=dy/d*e.spd;e.x+=e.vx*dt;e.y+=e.vy*dt;}else{e.vx=e.vy=0;dmgB(e.tg,E.dps*dt);if(Math.random()<dt*5)spark(tx-dx*.3,ty-dy*.3);}}
function bossAbil(e,E,dt){e.ab=(e.ab||0)+dt;e.ab2=(e.ab2||0)+dt;const mul=e.max/E.hp;
 if(e.type==='boss'&&e.ab>8){e.ab=0;for(let i=0;i<3;i++)spawnEnemy('dagger',{x:e.x-.5,y:e.y-.5},mul*.5);let hit=0;for(const b of G.blds.slice())if(Math.hypot(b.x+.5-e.x,b.y+.5-e.y)<3.2){dmgB(b,70);hit++;}
  rings.push({x:e.x,y:e.y,r:3.2,life:.6,c:'255,90,60'});G.shake=.4;SND.play('boom',2);toast(T('bossAbil'));}
 if(e.type==='mboss'){if(e.ab>2.2){e.ab=0;let tg=null,bd=49;for(const b of G.blds)if(B[b.t].turret){const d=(b.x-e.x)**2+(b.y-e.y)**2;if(d<bd){bd=d;tg=b;}}
   if(tg){beams.push({x1:e.x,y1:e.y,x2:tg.x+.5,y2:tg.y+.5,life:.25});explode(tg.x+.5,tg.y+.5,.9,'#c080ff');dmgB(tg,70);}}
  if(e.ab2>10){e.ab2=0;for(let i=0;i<4;i++)spawnEnemy('flare',{x:e.x-.5,y:e.y-.5},mul*.6);toast(T('bossAbil2'));}}}
// ---------- свои юниты ----------
function updUnits(dt){for(const b of G.blds){
  if(b.t==='factory'){const n=G.units.filter(u=>u.home===b).length;if(n<2+b.lv&&b.inp>=10&&b.inp2>=10&&b.pw>.05){b.prog+=dt/8*b.pw;if(b.prog>=1){b.prog=0;b.inp-=10;b.inp2-=10;G.units.push({k:'drone',x:b.x+.5,y:b.y+.5,hp:150,home:b,cd:0,ang:0});puff(b.x+.5,b.y+.5,'#7fd8ff',6,.6);}}}
  if(b.t==='dronepad'&&!G.units.some(u=>u.home===b)){b.prog+=dt/6*b.pw;if(b.prog>=1){b.prog=0;G.units.push({k:'builder',x:b.x+.5,y:b.y+.5,hp:120,home:b,cd:0,ang:0});}}}
 for(const u of G.units){const h=u.home;if(!G.blds.includes(h)){u.hp-=dt*40;}let tx=h.x+.5+Math.cos(G.t+u.x)*1.4,ty=h.y+.5+Math.sin(G.t+u.y)*1.4;u.heal=null;
  if(u.k==='drone'){let tg=null,bd=110;for(const e of enemies){const d=(e.x-h.x)**2+(e.y-h.y)**2;if(d<bd){bd=d;tg=e;}}
   if(tg){const d=Math.hypot(tg.x-u.x,tg.y-u.y);u.ang=Math.atan2(tg.y-u.y,tg.x-u.x);if(d>2.8){tx=tg.x;ty=tg.y;}else{tx=u.x;ty=u.y;}u.cd-=dt;
    if(u.cd<=0&&d<5){u.cd=.45;bullets.push({x:u.x,y:u.y,vx:Math.cos(u.ang)*16,vy:Math.sin(u.ang)*16,life:.4,dmg:14,col:'#9ff'});SND.play('duo');}}}
  else{let tg=null,bf=1;for(const b of G.blds.concat([G.coreB])){const f=b.hp/mhp(b);if(f<bf&&Math.hypot(b.x-h.x,b.y-h.y)<16){bf=f;tg=b;}}
   if(tg){tx=tg.x+.5;ty=tg.y+.5;if(Math.hypot(tx-u.x,ty-u.y)<1.2){u.heal=tg;tg.hp=Math.min(mhp(tg),tg.hp+30*dt);}}}
  const dx=tx-u.x,dy=ty-u.y,d=Math.hypot(dx,dy);if(d>.05){const sp=Math.min(d/dt,u.k==='drone'?3.4:2.6);u.x+=dx/d*sp*dt;u.y+=dy/d*sp*dt;if(!(u.k==='drone'&&u.cd>0&&d<.1))u.ang=u.heal||u.k!=='drone'?Math.atan2(dy,dx):u.ang;}}
 G.units=G.units.filter(u=>u.hp>0);}

// ---------- boot ----------
applySettings();show('scrMain');requestAnimationFrame(loop);
// отладочные хуки для автотестов
function sim(sec,dt){dt=dt||.05;for(let t=0;t<sec&&G&&!G.over;t+=dt)step(dt);return G&&{over:G.over,wave:G.wave,core:G.coreB.hp,kills:G.stats.kills,en:enemies.length};}
window.__f={get G(){return G},cam,start,place,startWave,get enemies(){return enemies},setTool:t=>{tool=t;updTools();},TUT,sim,get prog(){return prog},LEVELS,B,waveList,dmgB,tutAdvance,get S(){return S},doUpgrade,upCost,relink,get units(){return G.units},waveList};
