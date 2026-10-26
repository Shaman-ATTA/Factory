import {chromium,devices} from 'playwright';
const b=await chromium.launch();const ctx=await b.newContext({...devices['Pixel 7 landscape']});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.addInitScript(()=>{if(!sessionStorage.x){sessionStorage.x=1;localStorage.clear();localStorage.setItem('factory2d_prog',JSON.stringify({unlocked:5,done:[1,1]}));}});
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(500);
await p.screenshot({path:'/workspace/factory2d_shot0_menu.png'});
await p.tap('.lv:nth-child(3)');await p.waitForTimeout(300);
await p.evaluate(()=>{const G=__f.G,P=__f.place;G.res={copper:3000,lead:1000,coal:0,graphite:500};const cy=G.core.y,cx=G.core.x;
 // copper drill line feeding duos via conveyor
 for(let i=0;i<6;i++)P('duo',cx+10,cy-5+i*2,0);P('hail',cx+8,cy-2,0);P('hail',cx+8,cy+2,0);P('lancer',cx+11,cy,0);P('lancer',cx+11,cy-6,0);
 for(let i=-7;i<=7;i++)P('wall',cx+14,cy+i,0);
 for(const b of G.blds){if(b.t==='duo')b.ammo=40,b.ammoT='copper';if(b.t==='hail')b.ammo=20,b.ammoT='graphite';}
 // a conveyor line with items into core
 for(let x=cx+2;x<=cx+7;x++)P('conveyor',x,cy+4,2);P('conveyor',cx+2,cy+4,3);P('conveyor',cx+2,cy+3,2);
 P('press',cx+8,cy+4,0);G.blds.find(b=>b.t==='press').inp=10;
 __f.cam.x=cx+9;__f.cam.y=cy;__f.cam.z=30;});
await p.tap('#bSpeed');await p.tap('#bWave');
let best=0;for(let i=0;i<30;i++){await p.waitForTimeout(500);const n=await p.evaluate(()=>__f.enemies.filter(e=>e.x<__f.G.core.x+22).length);if(n>=3&&i>8){break;}}
await p.screenshot({path:'/workspace/factory2d_shot2_battle.png'});
await p.waitForTimeout(8000);
console.log('st',await p.evaluate(()=>({en:__f.enemies.length,kills:__f.G.stats.kills,core:__f.G.coreB.hp,wave:__f.G.wave,gr:__f.G.res.graphite})));
await p.evaluate(()=>{__f.cam.x=__f.G.core.x+5;__f.cam.z=44;});await p.waitForTimeout(400);
await p.screenshot({path:'/workspace/factory2d_shot1_factory.png'});
// save/reload
await p.evaluate(()=>dispatchEvent(new Event('x')));await p.waitForTimeout(8500);
await p.reload();await p.waitForTimeout(800);console.log('resume visible',await p.isVisible('#bResume'));
await p.tap('#bResume');console.log('blds after load',await p.evaluate(()=>__f.G.blds.length));
console.log('ERRORS',errs);await b.close();
