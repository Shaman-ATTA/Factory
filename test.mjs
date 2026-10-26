import {chromium,devices} from 'playwright';
const b=await chromium.launch();const ctx=await b.newContext({...devices['Pixel 7 landscape']});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(800);await p.screenshot({path:'/workspace/factory2d_shot0_menu.png'});
await p.tap('.lv');await p.waitForTimeout(500);
const cdp=await ctx.newCDPSession(p);const tp=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
const scr=async(wx,wy)=>p.evaluate(([x,y])=>{const c=__f.cam;return[(x-c.x)*c.z+innerWidth/2,(y-c.y)*c.z+innerHeight/2]},[wx,wy]);
await p.tap('#tutNext');
// find copper ore adjacent to core & build drills via real taps
const info=await p.evaluate(()=>{const G=__f.G;return{core:G.core}});
console.log(info);
const spots=await p.evaluate(()=>{const G=__f.G,out=[];for(let y=0;y<28;y++)for(let x=0;x<48;x++){if(window.__f&&__f.G){}}return out;});
const ores=await p.evaluate(()=>{const r=[];const G=__f.G;for(let y=G.core.y-6;y<=G.core.y+7;y++)for(let x=G.core.x-3;x<=G.core.x+10;x++){/*terrain hidden*/}return r;});
// use evaluate to get ore tiles via a probe placing
const tiles=await p.evaluate(()=>{const G=__f.G,res=[];for(let y=1;y<27;y++)for(let x=1;x<47;x++){const b=__f.place('drill',x,y,0,true);if(b){res.push([x,y]);const i=G.blds.indexOf(b);G.blds.splice(i,1);}}return res;});
// clear tileB from probes: reload level
console.log('ore tiles',tiles.length);
await p.evaluate(()=>{__f.start(0);});await p.tap('#tutNext');
const c=info.core;tiles.sort((a,b)=>Math.hypot(a[0]-c.x,a[1]-c.y)-Math.hypot(b[0]-c.x,b[1]-c.y));
await p.tap('.tool[data-t="drill"]');
for(const t of tiles.slice(0,4)){const [sx,sy]=await scr(t[0]+.5,t[1]+.5);await p.touchscreen.tap(sx,sy);await p.waitForTimeout(80);}
// conveyor path from first drill to core by drag
const d=tiles[0];await p.tap('.tool[data-t="conveyor"]');
const path=[];let x=d[0],y=d[1]+1;if(Math.abs(d[1]-c.y)<=1){y=d[1];x=d[0]-1;}
// straightforward: go horizontally then vertically toward core
const pts=[];let cx=d[0],cy=d[1];
const dirX=Math.sign(c.x-cx),dirY=Math.sign(c.y-cy);
cy+=dirY||0; if(!dirY)cx+=dirX;
pts.push([cx,cy]);while(Math.abs(cy-c.y)>1){cy+=dirY;pts.push([cx,cy]);}while(Math.abs(cx-c.x)>1){cx+=dirX;pts.push([cx,cy]);}
console.log('path',pts);
let s=await scr(pts[0][0]+.5,pts[0][1]+.5);await tp('touchStart',[{x:s[0],y:s[1],id:1}]);
for(const q of pts.slice(1)){s=await scr(q[0]+.5,q[1]+.5);await tp('touchMove',[{x:s[0],y:s[1],id:1}]);await p.waitForTimeout(30);}
await tp('touchEnd',[]);
await p.waitForTimeout(4000);
console.log('state',await p.evaluate(()=>({res:__f.G.res,core:__f.G.stats.core,tut:__f.G.tut,n:__f.G.blds.length})));
// pinch zoom test
await tp('touchStart',[{x:400,y:200,id:1},{x:500,y:200,id:2}]);await tp('touchMove',[{x:350,y:200,id:1},{x:560,y:200,id:2}]);await tp('touchEnd',[]);
console.log('zoom',await p.evaluate(()=>__f.cam.z));
// build defense directly (API) and run waves at x2
await p.evaluate(()=>{const G=__f.G;G.res.copper=2000;G.res.graphite=200;G.res.lead=500;const s=G.spawns[0];const cx=G.core.x+6;
 for(let i=-3;i<=3;i++){__f.place('duo',cx+2,G.core.y+i*2,0);}for(let i=-5;i<=5;i++)__f.place('wall',cx+5,G.core.y+i,0);
 G.blds.filter(b=>b.t==='duo').forEach(b=>b.ammo=40);G.tut=-1;});
await p.tap('#tutSkip').catch(()=>{});
await p.tap('#bSpeed');await p.tap('#bWave');await p.waitForTimeout(6000);
await p.screenshot({path:'/workspace/factory2d_shot2_battle.png'});
console.log('battle',await p.evaluate(()=>({en:__f.enemies.length,kills:__f.G.stats.kills,wave:__f.G.wave,core:__f.G.coreB.hp})));
await p.evaluate(()=>{__f.cam.z=40;__f.cam.x=__f.G.core.x+3;__f.cam.y=__f.G.core.y;});await p.waitForTimeout(300);
await p.screenshot({path:'/workspace/factory2d_shot1_factory.png'});
console.log('ERRORS',errs);await b.close();
