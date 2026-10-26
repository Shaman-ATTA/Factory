import {chromium} from 'playwright';
const b=await chromium.launch();
for(const [name,vp] of [['portrait',{width:412,height:915}],['landscape',{width:915,height:412}]]){
const p=await (await b.newContext({viewport:vp,isMobile:true,hasTouch:true})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{__f.start(6);const G=__f.G;G.tut=-1;G.wT=999;const c=G.core;const R={};
 const P=(t,x,y,r=0)=>__f.place(t,x,y,r,true);
 // container adjacent ring (dist 2) & chained one
 R.c1=P('container',c.x+2,c.y-2);R.c2=P('container',c.x+3,c.y-2);R.cap=__f.coreCap();R.link=__f.linked(G.blds.find(b=>b.t==='container'&&b.x===c.x+3));
 // unloader next to chained container pulls from core
 G.res.lead=500;const u0=P('unloader',c.x+4,c.y-2);const ul=G.blds.find(b=>b.t==='unloader'&&b.x===c.x+4);ul.sel='lead';P('conveyor',c.x+5,c.y-2,0);P('conveyor',c.x+6,c.y-2,0);
 // kiln & pulverizer powered: generator+coal
 const kx=c.x-1,ky=c.y+5;R.k=P('kiln',kx,ky);R.pz=P('pulverizer',kx+2,ky);R.g=P('generator',kx+1,ky);const gen=G.blds.find(b=>b.t==='generator');gen.inp=10;
 const kl=G.blds.find(b=>b.t==='kiln'),pz=G.blds.find(b=>b.t==='pulverizer');kl.inp=5;kl.inp2=5;pz.inp=5;
 // frost turret
 R.f=P('frost',c.x+6,c.y+4);const fr=G.blds.find(b=>b.t==='frost');P('generator',c.x+6,c.y+5);G.blds.filter(b=>b.t==='generator').forEach(g=>g.inp=10);
 __f.relink&&__f.relink();
 const lead0=G.res.lead;__f.sim(4);R.unl=lead0-G.res.lead;
 const e={type:'dagger',x:c.x+9.5,y:c.y+4.5,hp:500,max:500,spd:1,r:.3,c:'#f00',fly:false,vx:0,vy:0};__f.enemies.push(e);
 __f.sim(1.5);R.kilnOut=kl.out+'/'+kl.inp+'/'+kl.pw.toFixed(2);R.pz=pz.out+'/'+pz.inp;R.slow=e.slowT>0?e.spd/e.base:0;R.fhp=e.hp;R.frostPw=fr.pw;
 // research
 localStorage;const bk=__f.bank();__f.addBank(1);R.bank=JSON.stringify(__f.bank()).slice(0,80);
 return R;});
console.log(name,JSON.stringify(r));
await p.evaluate(()=>{__f.G.over=false;});await p.tap('#bMenu').catch(()=>{});await p.waitForTimeout(300);
await p.evaluate(()=>show('scrResearch',true));await p.waitForTimeout(300);const n=await p.evaluate(()=>[document.querySelectorAll('.rn').length,document.querySelectorAll('.rn.open button:not([disabled])').length]);
console.log(name,'research nodes',n);if(name==='portrait')await p.screenshot({path:'/workspace/factory2d_research_pre.png'});
const ok=await p.evaluate(()=>{const b=document.querySelector('.rn.open button:not([disabled])');if(!b)return 'none';const t=b.dataset.r;b.click();return t+':'+__f.unlockedTools().includes(t)+':'+!!JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.includes('research'))||'null'));});
console.log(name,'researched',ok,'errs',errs);}
await b.close();
