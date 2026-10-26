import {chromium,devices} from 'playwright';
const b=await chromium.launch();const ctx=await b.newContext({...devices['Pixel 7 landscape']});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(600);
const LV=process.argv[2]?process.argv[2].split(',').map(Number):[0,1,2,3,4,5,6,7];
const bal=await p.evaluate(async(LV)=>{const out=[];
 for(const lv of LV){for(const def of [0,1]){__f.start(lv);const G=__f.G;G.tut=-1;const cx=G.core.x,cy=G.core.y;
  if(def){const tl=['duo','duo','duo','duo','duo','duo'];if(lv>=2)tl.push('hail','hail');if(lv>=3)tl.push('lancer','lancer','generator','generator');if(lv>=4)tl.push('lancer','lancer','hail','hail','duo','duo');if(lv>=5)tl.push('aa','aa','aa');if(lv>=6)tl.push('aa','hail','lancer','generator');if(lv>=7)tl.push('aa','aa','lancer','hail');
   let i=0;for(const t of tl){for(let k=0;k<60;k++){const x=cx+3+((i+k)%5),y=cy-6+((i*3+k*5)%13);if(__f.place(t,x,y,0,true)){break;}}i++;}
   if(lv>=3){// узлы для связи
    __f.place('node',cx+2,cy-3,0,true);__f.place('node',cx+2,cy+3,0,true);__f.place('node',cx+5,cy-6,0,true);__f.place('node',cx+5,cy+6,0,true);__f.relink();}}
  for(let s=0;s<7200&&!G.over;s+=5){for(const b of G.blds){const d=__f.B[b.t];if(d.turret&&d.ammo){b.ammo=d.cap;b.ammoT=Object.keys(d.ammo)[0];}if(b.t==='generator')b.inp=10;}
   if(!G.queue.length&&!__f.enemies.length&&G.wave<G.L.waves)G.wT=Math.min(G.wT,3);__f.sim(5);}
  const lan=G.blds.filter(b=>b.t==='lancer').map(b=>b.pw.toFixed(1)).join('');
  out.push({lv,def,left:JSON.stringify(__f.enemies.map(e=>[e.type,e.x|0,e.y|0,e.hp|0])).slice(0,60),over:G.over,wave:G.wave,core:Math.round(G.coreB.hp),kills:G.stats.kills,lan,unl:__f.prog.unlocked});}}
 return out;},LV);
console.table(bal);console.log('ERRORS',errs);await b.close();
