import {chromium,devices} from 'playwright';
const b=await chromium.launch();const ctx=await b.newContext({...devices['Pixel 7 landscape']});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(600);
const bal=await p.evaluate(async()=>{const out=[];
 for(let lv=0;lv<5;lv++){for(const def of [0,1]){__f.start(lv);const G=__f.G;G.tut=-1;const cx=G.core.x,cy=G.core.y;
  if(def){const tl=['duo','duo','duo','duo','duo','duo'];if(lv>=2)tl.push('hail','hail');if(lv>=3)tl.push('lancer','lancer');if(lv===4)tl.push('lancer','lancer','hail','hail','duo','duo');
   let i=0;for(const t of tl){for(let k=0;k<30;k++){const x=cx+3+((i+k)%4),y=cy-5+((i*3+k*5)%11);if(__f.place(t,x,y,0,true)){break;}}i++;}}
  let r;for(let s=0;s<3000&&!G.over;s+=5){for(const b of G.blds)if(b.t==='duo'||b.t==='hail'){b.ammo=__f.B[b.t].cap;b.ammoT=b.t==='hail'?'graphite':'copper';}if(!G.queue.length&&!__f.enemies.length&&G.wave<__f.LEVELS[lv].waves)G.wT=Math.min(G.wT,3);r=__f.sim(5);}
  out.push({lv,def,dbg:JSON.stringify([G.queue.length,__f.enemies.map(e=>[e.type,e.x|0,e.y|0,e.hp|0])]).slice(0,80),over:G.over,wave:G.wave,core:Math.round(G.coreB.hp),kills:G.stats.kills,unl:__f.prog.unlocked});}}
 return out;});
console.table(bal);
console.log('ERRORS',errs);await b.close();
