import {chromium,devices} from 'playwright';
const b=await chromium.launch();const ctx=await b.newContext({...devices['Pixel 7 landscape']});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const ok=(n,v)=>console.log((v?'OK  ':'FAIL')+' '+n);
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(600);
await p.screenshot({path:'/workspace/factory2d_shot3_mainmenu.png'});
await p.tap('#mPlay');await p.waitForTimeout(300);
ok('tutorial shown',await p.isVisible('#tut'));await p.tap('#tutNext');
const scr=async(wx,wy)=>p.evaluate(([x,y])=>{const c=__f.cam;return[(x-c.x)*c.z+innerWidth/2,(y-c.y)*c.z+innerHeight/2]},[wx,wy]);
// find ore near core w/o touching map state
const ore=await p.evaluate(()=>{const G=__f.G,r=[];for(let y=G.core.y-5;y<=G.core.y+5;y++)for(let x=G.core.x+2;x<=G.core.x+8;x++){const b=__f.place('drill',x,y,0,true);if(b){r.push([x,y]);G.blds.pop();__f.G.blds;}}
 // undo tile refs
 return r;});
await p.evaluate(()=>{__f.start(0);});await p.tap('#tutNext');
ok('mine tab active',await p.evaluate(()=>document.querySelector('#cats .sel').textContent.includes('Добыча')));
await p.tap('.tool[data-t="drill"]');ok('tooltip',await p.isVisible('#tip'));
await p.evaluate(()=>{__f.cam.x=__f.G.core.x+4;});
const c=await p.evaluate(()=>__f.G.core);ore.sort((a,b)=>Math.hypot(a[0]-c.x,a[1]-c.y)-Math.hypot(b[0]-c.x,b[1]-c.y));
await p.evaluate(()=>document.getElementById('tut').style.pointerEvents='none');
for(const t of ore.slice(0,3)){const [sx,sy]=await scr(t[0]+.5,t[1]+.5);await p.touchscreen.tap(sx,sy);await p.waitForTimeout(60);}
await p.tap('#bOk');await p.evaluate(()=>__f.sim(6));
ok('drills placed '+await p.evaluate(()=>__f.G.blds.length),await p.evaluate(()=>__f.G.blds.filter(b=>b.t==='drill').length>=1));
ok('tut step 2',await p.evaluate(()=>__f.G.tut>=2));
ok('log tab auto',await p.evaluate(()=>document.querySelector('#cats .sel').textContent.match(/Логистика|Оборона/)));
await p.screenshot({path:'/workspace/factory2d_shot4_tooltip.png'});
// conveyors via place to core, then sim
await p.evaluate(()=>{const G=__f.G;for(const d of G.blds.filter(b=>b.t==='drill')){let x=d.x,y=d.y;}});
await p.evaluate(()=>{const G=__f.G,d=G.blds.find(b=>b.t==='drill');let x=d.x-1,y=d.y;while(x>G.core.x+1){__f.place('conveyor',x,y,2);x--;}
 if(Math.abs(y-G.core.y)>1){/*vertical*/let yy=y;const dir=G.core.y>y?1:3;__f.G.blds;}});
await p.evaluate(()=>__f.sim(6));
const st=await p.evaluate(()=>({tut:__f.G.tut,core:__f.G.stats.core}));console.log(st);
// force-complete tutorial via hooks
await p.evaluate(()=>{const G=__f.G;G.stats.core=Math.max(1,G.stats.core);__f.sim(.2);__f.place('duo',G.core.x+6,G.core.y,0,true);__f.sim(.2);G.blds.find(b=>b.t==='duo').ammo=5;__f.sim(.2);__f.startWave();__f.sim(.2);});
ok('tutorial completed',await p.evaluate(()=>__f.G.tut===-1&&__f.prog.tutDone===1));
// tap a building -> info
const dd=await p.evaluate(()=>{const b=__f.G.blds.find(b=>b.t==='duo');b.ammo=0;return[b.x,b.y]});
await p.evaluate(()=>{__f.setTool(null);__f.cam.x=__f.G.core.x+6;__f.cam.y=__f.G.core.y;});
let [sx,sy]=await scr(dd[0]+.5,dd[1]+.5);await p.touchscreen.tap(sx,sy);await p.waitForTimeout(400);
ok('binfo',await p.isVisible('#binfo'));
await p.tap('#cats button:nth-child(3)');await p.waitForTimeout(300);
await p.screenshot({path:'/workspace/factory2d_shot5_info.png'});
// pause menu
await p.tap('#bMenu');ok('pause',await p.isVisible('#pause'));await p.screenshot({path:'/workspace/factory2d_shot6_pause.png'});
await p.tap('#pSettings');ok('settings',await p.isVisible('#scrSettings'));
await p.check('[data-k="fps"]');await p.selectOption('[data-k="quality"]','low');
await p.screenshot({path:'/workspace/factory2d_shot7_settings.png'});
ok('settings saved',await p.evaluate(()=>JSON.parse(localStorage.getItem('f2d:p1:settings')).fps===true));
await p.tap('#scrSettings .back');ok('back to pause',await p.isVisible('#pause'));
await p.tap('#pResume');
// lose
await p.evaluate(()=>__f.dmgB(__f.G.coreB,1e9));await p.waitForTimeout(1200);ok('lose screen',await p.isVisible('#end')&&(await p.textContent('#endT'))==='Ядро уничтожено');
await p.tap('#endM');ok('main menu',await p.isVisible('#scrMain'));
// win + stars
await p.evaluate(()=>{__f.start(0);const G=__f.G;G.wave=G.wave=__f.LEVELS[0].waves;__f.sim(.2);});await p.waitForTimeout(1200);
ok('win screen + stars',await p.isVisible('#end')&&(await p.innerHTML('#endS')).includes('★'));
await p.tap('#endM');await p.tap('#mCampaign');await p.waitForTimeout(200);
ok('level 2 unlocked',await p.evaluate(()=>!document.querySelectorAll('.lv')[1].disabled));
await p.screenshot({path:'/workspace/factory2d_shot8_levels.png'});
await p.tap('#scrLevels .back');
// account
await p.tap('#mAccount');const code=await p.evaluate(()=>Auth.exportCode());
await p.fill('#nNick','Ярослав');await p.tap('[data-c="#e2584a"]');await p.fill('#nNick','Ярослав');await p.tap('#nCreate');
ok('profile created',await p.evaluate(()=>Auth.current().nick==='Ярослав'&&__f.prog.unlocked===1));
await p.screenshot({path:'/workspace/factory2d_shot9_account.png'});
await p.fill('#iCode',code);await p.tap('#iGo');ok('import',await p.evaluate(()=>__f.prog.unlocked===2));
ok('cloud soon shown',(await p.textContent('#accBody')).includes('скоро'));
await p.reload();await p.waitForTimeout(500);ok('persist after reload',await p.evaluate(()=>Auth.current().nick==='Ярослав'&&__f.prog.unlocked===2));
console.log('ERRORS',errs);await b.close();
