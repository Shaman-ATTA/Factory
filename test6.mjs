import {chromium,devices} from 'playwright';
const b=await chromium.launch();const ctx=await b.newContext({...devices['Pixel 7 landscape']});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const ok=(n,v)=>console.log((v?'OK  ':'FAIL')+' '+n);
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(600);
// power + units scene on level 7 (index 6)
const r=await p.evaluate(()=>{__f.start(6);const G=__f.G,cx=G.core.x,cy=G.core.y;G.tut=-1;G.wT=999;const P=(t,x,y)=>__f.place(t,x,y,0,true);
 const gen=P('generator',cx+3,cy-3);const n1=P('node',cx+5,cy-3);const lan=P('lancer',cx+8,cy-3);const fac=P('factory',cx+4,cy+3);const n2=P('node',cx+6,cy+3);const pad=P('dronepad',cx+8,cy+2);const men=P('mender',cx+8,cy-1);const aa=P('aa',cx+9,cy);const bat=P('battery',cx+3,cy-4);
 const w=P('wall',cx+10,cy+3);const r={};r.noPowLancer=lan.pw;
 gen.inp=10;fac.inp=20;fac.inp2=20;__f.sim(.3);r.pw=lan.pw;r.links=G.plinks.length;
 __f.sim(20);gen.inp=10;r.drones=__f.units.filter(u=>u.k==='drone').length;r.builder=__f.units.filter(u=>u.k==='builder').length;
 w.hp=50;__f.sim(15);r.wallHp=Math.round(w.hp);r.bat=Math.round(bat.st);
 G.res.copper=999;G.res.lead=999;G.res.silicon=99;r.up1=__f.doUpgrade(aa)||aa.lv;__f.doUpgrade(aa);r.up2=aa.lv;
 aa.ammo=60;aa.ammoT='graphite';__f.G.wT=0;return r;});
console.log(r);
ok('lancer unpowered before fuel',r.noPowLancer===0);ok('lancer powered',r.pw===1);ok('power links',r.links>=3);ok('combat drones built',r.drones>=1);ok('builder drone',r.builder===1);ok('wall repaired',r.wallHp>300);ok('upgrade to lv3',r.up2===3);
// spawn flyers and boss near, screenshot
await p.evaluate(()=>{const G=__f.G;for(let i=0;i<5;i++)__f.enemies.push;});
await p.evaluate(()=>{const G=__f.G;const s=G.spawns[0];G.queue=['flare','flare','flare','horizon','mace','dagger','dagger'];__f.cam.x=G.core.x+10;__f.cam.y=G.core.y;__f.sim(14);G.blds.find(b=>b.t==='generator').inp=10;});
await p.waitForTimeout(400);
await p.screenshot({path:'/workspace/factory2d_shot10_power_units.png'});
const sel=await p.evaluate(()=>{const b=__f.G.blds.find(b=>b.t==='lancer');const c=__f.cam;return[(b.x+.5-c.x)*c.z+innerWidth/2,(b.y+.5-c.y)*c.z+innerHeight/2]});
await p.touchscreen.tap(sel[0],sel[1]);await p.waitForTimeout(400);
ok('binfo power',(await p.textContent('#binfo')).includes('Энергия'));ok('upgrade button',await p.isVisible('#sUp'));
await p.tap('#cats button:nth-child(5)');await p.waitForTimeout(300);
await p.screenshot({path:'/workspace/factory2d_shot11_info_energy.png'});
// endless
await p.evaluate(()=>{__f.G.over=true;});await p.reload();await p.waitForTimeout(500);
await p.tap('#mEndless');await p.waitForTimeout(300);
const e=await p.evaluate(()=>{const G=__f.G;const cx=G.core.x,cy=G.core.y;let i=0;for(const t of ['duo','duo','duo','duo','hail','hail','aa','aa','duo','duo']){for(let k=0;k<40;k++){if(__f.place(t,cx+3+((i+k)%4),cy-5+((i*3+k*5)%11),0,true))break;}i++;}
 for(let s=0;s<900&&!G.over;s+=5){for(const b of G.blds){const d=__f.B[b.t];if(d.turret&&d.ammo){b.ammo=d.cap;b.ammoT=Object.keys(d.ammo)[0];}}if(!G.queue.length&&!__f.enemies.length)G.wT=Math.min(G.wT,3);__f.sim(5);}
 const w=G.wave;__f.dmgB(G.coreB,1e9);return{w,endless:G.L.endless,types:[...new Set(__f.waveList(20))].join(',')};});
console.log(e);await p.waitForTimeout(1300);
ok('endless waves >=10',e.w>=10);ok('endless end screen',(await p.textContent('#endP')).includes('рекорд'));
await p.screenshot({path:'/workspace/factory2d_shot12_endless_end.png'});
await p.tap('#endM');await p.waitForTimeout(200);ok('menu shows record',(await p.textContent('#mEndless')).includes('рекорд: волна'));
ok('hs per profile',await p.evaluate(()=>Auth.get('hs',[]).length===1));
console.log('ERRORS',errs);await b.close();
