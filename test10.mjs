import {chromium,devices} from 'playwright';
const b=await chromium.launch();const res=[];const ok=(n,v)=>{console.log((v?'OK  ':'FAIL')+' '+n);res.push(v);};
for(const [name,vp] of [['portrait',{viewport:{width:412,height:915},isMobile:true,hasTouch:true,deviceScaleFactor:2}],['landscape',devices['Pixel 7 landscape']]]){
const p=await (await b.newContext(vp)).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(800);
await p.evaluate(()=>{__f.start(1);const G=__f.G;G.tut=-1;G.wT=999;G.res.copper=900;G.res.lead=500;__f.cam.x=G.core.x+4;__f.cam.y=G.core.y;__f.cam.z=36;document.getElementById('tut').classList.add('hide');});
const sc=(x,y)=>p.evaluate(([x,y])=>{const c=__f.cam;return[(x+.5-c.x)*c.z+innerWidth/2,(y+.5-c.y)*c.z+innerHeight/2];},[x,y]);
const C=await p.evaluate(()=>[__f.G.core.x,__f.G.core.y]);const free=await p.evaluate(([cx,cy])=>{const o=[];for(let y=cy-3;y<=cy+3;y++)for(let x=cx+3;x<=cx+7;x++)if(__f.canPlace('wall',x,y))o.push([x,y]);return o;},C);
await p.evaluate(()=>__f.setTool('wall'));
for(const t of free.slice(0,3)){const [x,y]=await sc(...t);await p.touchscreen.tap(x,y);await p.waitForTimeout(50);}
ok(name+' taps make plans',await p.evaluate(()=>__f.INP.plans.length)===3);ok(name+' nothing built before ✓',await p.evaluate(()=>!__f.G.blds.some(b=>b.t==='wall')));
await p.screenshot({path:`/workspace/factory2d_shot18_plans_${name}.png`});
await p.tap('#bOk');await p.evaluate(()=>__f.sim(1.5));
await p.waitForTimeout(300);if(name==='portrait')await p.screenshot({path:'/workspace/factory2d_shot19_builder.png'});
await p.evaluate(()=>__f.sim(4));ok(name+' alpha built walls',await p.evaluate(()=>__f.G.blds.filter(b=>b.t==='wall').length)===3);
// break by rect
await p.tap('#bCancel');await p.tap('#bDel');const xs=free.slice(0,3);const [ax,ay]=await sc(Math.min(...xs.map(q=>q[0]))-0,Math.min(...xs.map(q=>q[1])));const [bx,by]=await sc(Math.max(...xs.map(q=>q[0])),Math.max(...xs.map(q=>q[1])));
await p.mouse.move(ax,ay);await p.mouse.down();for(let k=1;k<=8;k++)await p.mouse.move(ax+(bx-ax)*k/8,ay+(by-ay)*k/8);await p.mouse.up();
ok(name+' area break plans',await p.evaluate(()=>__f.INP.plans.filter(p=>p.brk).length)>=3);await p.tap('#bOk');await p.evaluate(()=>__f.sim(5));
ok(name+' walls removed',await p.evaluate(()=>__f.G.blds.filter(b=>b.t==='wall').length)===0);
// copy-paste
await p.tap('#bCancel');await p.evaluate(([cx,cy])=>{for(let x=cx+4;x<cx+7;x++)__f.place('conveyor',x,cy+4,0,true);},C);
await p.evaluate(()=>{__f.setTool(null);});await p.tap('#bRot');ok(name+' copy mode',await p.evaluate(()=>__f.INP.mode==='copy'));
const [qx,qy]=await sc(C[0]+4,C[1]+4),[rx,ry]=await sc(C[0]+6,C[1]+4);await p.mouse.move(qx,qy);await p.mouse.down();for(let k=1;k<=6;k++)await p.mouse.move(qx+(rx-qx)*k/6,qy);await p.mouse.up();
ok(name+' pasted ghosts',await p.evaluate(()=>__f.INP.plans.length)===3);await p.tap('#bOk');await p.evaluate(()=>__f.sim(5));
ok(name+' copy built',await p.evaluate(()=>__f.G.blds.filter(b=>b.t==='conveyor').length)===6);
ok(name+' no errors '+errs,errs.length===0);}
console.log(res.every(v=>v)?'ALL OK':'SOME FAIL');await b.close();
