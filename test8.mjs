import {chromium,devices} from 'playwright';
const b=await chromium.launch({args:['--enable-gpu-rasterization']});
const res=[];const ok=(n,v)=>{console.log((v?'OK  ':'FAIL')+' '+n);res.push(v);};
for(const [name,vp] of [['portrait',{viewport:{width:412,height:915},isMobile:true,hasTouch:true,deviceScaleFactor:2.6}],['landscape',devices['Pixel 7 landscape']]]){
const p=await (await b.newContext(vp)).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(1200);
if(name==='portrait')await p.screenshot({path:'/workspace/factory2d_shot16_menu.png'});
const r=await p.evaluate(()=>{__f.start(0);const G=__f.G;G.tut=-1;G.wT=999;G.res.copper=900;G.res.lead=300;const cx=G.core.x,cy=G.core.y;
 const d1=__f.place('duo',cx+2,cy,0,true);d1.ammo=0;__f.sim(6);const feed=d1.ammo;
 const u=__f.place('unloader',cx+2,cy-1,0,true);for(let x=cx+3;x<=cx+5;x++)__f.place('conveyor',x,cy-1,0,true);const d2=__f.place('duo',cx+6,cy-1,0,true);
 const c0=G.res.copper;if(d2)d2.ammo=0;__f.sim(8);return{feed,u:!!u,d2:d2?d2.ammo:-1,used:c0-G.res.copper,tut4:__f.TUT?__f.TUT.length:0};});
ok(name+' core-feed gives ammo ('+r.feed+')',r.feed>0);ok(name+' unloader feeds belt turret ('+r.d2+', used '+r.used+')',r.u&&r.d2>0);
await p.evaluate(()=>{document.querySelectorAll('#tut').forEach(e=>e.style.display='none');__f.setTool('duo');const G=__f.G;__f.cam.x=G.core.x+3;__f.cam.y=G.core.y;});await p.waitForTimeout(300);
const tip=await p.evaluate(()=>document.getElementById('tip').innerHTML);ok(name+' tooltip lists ammo',/самонавед/.test(tip)&&/графит/i.test(tip)&&/<img/.test(tip));
// пустая турель — маркер
await p.evaluate(()=>{__f.setTool(null);const G=__f.G;const d=G.blds.find(b=>b.t==='duo'&&b.x===G.core.x+6);d.ammo=0;});
// сцена фабрики
await p.evaluate(()=>{const G=__f.G,cx=G.core.x,cy=G.core.y;let n=0;for(let y=cy-8;y<cy+9;y++)for(let x=cx-3;x<cx+14;x++)if(__f.G&&n<9&&__f.place('drill',x,y,0,true))n++;
 for(const [x,y] of [[cx+4,cy+2],[cx+4,cy-3],[cx+8,cy+1]])__f.place('duo',x,y,0,true);for(let y=cy-3;y<=cy+3;y++)__f.place('wall',cx+10,y,0,true);
 __f.place('hail',cx+8,cy-3,0,true);for(const b of G.blds)if(b.t==='duo'||b.t==='hail')b.ammo=b.ammo||20;G.blds.find(b=>b.t==='duo'&&b.x===cx+6).ammo=0;__f.sim(3);__f.cam.x=cx+4;__f.cam.y=cy;__f.cam.z=innerHeight<500?26:38;});
await p.waitForTimeout(700);
if(name==='portrait')await p.screenshot({path:'/workspace/factory2d_shot14_portrait_factory.png'});
// бой
const fps=await p.evaluate(async()=>{const G=__f.G;G.wT=999;__f.startWave();for(const b of G.blds)if(b.ammo!==undefined)b.ammo=40;for(let i=0;i<30;i++){__f.sim(.4);if(__f.enemies.some(e=>e.x<G.core.x+14))break;}
 const cx=G.core.x;const e=__f.enemies;__f.cam.x=cx+8;__f.cam.y=G.core.y;
 let f=0;const t0=performance.now();await new Promise(res=>{const st=()=>{f++;if(performance.now()-t0<2500)requestAnimationFrame(st);else res();};requestAnimationFrame(st);});return [f/2.5|0,e.length];});
console.log(name,'fps/enemies',fps);
await p.evaluate(()=>{const G=__f.G;for(let i=0;i<60;i++){__f.sim(.15);if(__f.enemies.some(e=>e.x<G.core.x+15))break;}const e=__f.enemies;if(e.length){const ex=e.reduce((s,q)=>s+q.x,0)/e.length,ey=e.reduce((s,q)=>s+q.y,0)/e.length;for(const [dx,dy] of [[-3,-2],[-3,2],[-4,0]]){const t=__f.place('duo',Math.round(ex+dx),Math.round(ey+dy),0,true);if(t)t.ammo=40;}__f.cam.x=ex-1.5;__f.cam.y=ey;__f.cam.z=innerHeight<500?30:44;}});
for(let i=0;i<40;i++){await p.waitForTimeout(60);if(await p.evaluate(()=>{for(const e of __f.enemies)e.spd=.15;return __f.G.blds.some(b=>b.flash>0)&&(1)}))break;}await p.waitForTimeout(90);
if(name==='portrait')await p.screenshot({path:'/workspace/factory2d_shot15_battle.png'});else await p.screenshot({path:'/workspace/factory2d_shot17_landscape.png'});
// инфо-панель турели
const [sx,sy]=await p.evaluate(()=>{const G=__f.G,c=__f.cam;const d=G.blds.find(b=>b.t==='duo'&&b.x===G.core.x+2);return[(d.x+.5-c.x)*c.z+innerWidth/2,(d.y+.5-c.y)*c.z+innerHeight/2];});
await p.evaluate(()=>{__f.cam.x=__f.G.core.x+3;});await p.waitForTimeout(100);
const [qx,qy]=await p.evaluate(()=>{const G=__f.G,c=__f.cam;return[(G.core.x+2.5-c.x)*c.z+innerWidth/2,(G.core.y+.5-c.y)*c.z+innerHeight/2];});await p.mouse.click(qx,qy);await p.waitForTimeout(250);
const bi=await p.evaluate(()=>document.getElementById('binfo').innerHTML);ok(name+' info panel ammo bar+list',/bar am/.test(bi)&&/<img/.test(bi));
ok(name+' no console errors '+JSON.stringify(errs),errs.length===0);}
await b.close();console.log(res.every(x=>x)?'ALL OK':'SOME FAIL');
