import {chromium,devices} from 'playwright';
const b=await chromium.launch();
for(const [name,vp] of [['portrait',{viewport:{width:412,height:915},isMobile:true,hasTouch:true,deviceScaleFactor:2.6}],['landscape',devices['Pixel 7 landscape']]]){
const p=await (await b.newContext(vp)).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const ok=(n,v)=>console.log(name,(v?'OK  ':'FAIL')+' '+n);
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(500);
const info=await p.evaluate(()=>{__f.start(0);const G=__f.G;G.tut=-1;G.wT=999;G.res.copper=500;const cx=G.core.x,cy=G.core.y;
 // clear area: find spot: drill column at cx+6, from cy-6.. ; force ore & free
 const tx=cx+6,ty=cy-5;__f.cam.x=cx+3;__f.cam.y=cy-2;__f.cam.z=innerHeight<500?20:34;
 for(const q of __f.G.blds.slice())if(!q.core)__f.G.blds.splice(__f.G.blds.indexOf(q),1);
 return{cx,cy,tx,ty};});await p.waitForTimeout(800);await p.evaluate(([x,y])=>{const G=__f.G;__f.cam.x=G.core.x+3;__f.cam.y=G.core.y-2;__f.cam.z=innerHeight<500?20:34;G.tut=-1;document.querySelectorAll('#tut,#tutBox').forEach(e=>e.style.display='none')},[0,0]);
const sc=async(x,y)=>p.evaluate(([x,y])=>{const c=__f.cam;return[(x+.5-c.x)*c.z+innerWidth/2,(y+.5-c.y)*c.z+innerHeight/2]},[x,y]);
const {cx,cy,tx,ty}=info;
// place drills (free) left of the vertical belt column tx
await p.evaluate(([tx,ty])=>{const G=__f.G;for(let y=ty;y<ty+3;y++){__f.forceOre&&0;}},[tx,ty]);
const drills=await p.evaluate(([tx,ty])=>{let n=0;for(let y=ty-4;y<=ty+8;y++)for(let x=tx+1;x<=tx+3;x++)if(__f.place('drill',x,y,0,true))n++;return n},[tx,ty]);
await p.evaluate(()=>__f.setTool('conveyor'));
// drag L: down from (tx,ty-4) to (tx,cy) then left to (cx+2,cy)
const pts=[[tx,ty-4],[tx,cy],[cx+2,cy]];let [x0,y0]=await sc(...pts[0]);await p.mouse.move(x0,y0);await p.mouse.down();
for(let i=1;i<pts.length;i++){const [x1,y1]=await sc(...pts[i]);const [xa,ya]=await sc(...pts[i-1]);for(let k=1;k<=15;k++)await p.mouse.move(xa+(x1-xa)*k/15,ya+(y1-ya)*k/15);}
await p.mouse.up();
console.log(name,await p.evaluate(()=>[__f.G.blds.length,innerWidth,innerHeight,__f.cam.z,document.elementFromPoint(innerWidth/2,innerHeight/2).id]));await p.screenshot({path:'/tmp/dbg.png'});
const r=await p.evaluate(([tx,cx,cy])=>{const G=__f.G;const at=(x,y)=>G.blds.find(b=>b.x===x&&b.y===y);const c=at(tx,cy);const c0=G.stats.core;const top=at(tx,G.core.y-9)||G.blds.filter(b=>b.t==='conveyor').sort((a,b)=>a.y-b.y)[0];for(let i=0;i<60;i++){if(!top.items.length)top.items.push({t:'copper',p:0});__f.sim(.5);}return{drills:G.blds.filter(b=>b.t==='drill').length,corner:c&&c.rot,last:at(cx+2,cy)&&at(cx+2,cy).rot,delivered:G.stats.core-c0};},[tx,cx,cy]);
ok('corner points left ('+r.corner+')',r.corner===2);ok('last tile left',r.last===2);ok('copper reaches core: '+r.delivered,r.delivered>10);
await p.screenshot({path:`/workspace/factory2d_shot13_curve_${name}.png`});
// two separate drags: vertical then horizontal starting next to corner (user's scenario)
const r2=await p.evaluate(([cx,cy])=>{const G=__f.G;for(const q of G.blds.slice())if(!q.core)__f.dmgB?0:0;return 0},[cx,cy]);
const drag=async(a,bb)=>{const [xa,ya]=await sc(...a),[xb,yb]=await sc(...bb);await p.mouse.move(xa,ya);await p.mouse.down();for(let k=1;k<=12;k++)await p.mouse.move(xa+(xb-xa)*k/12,ya+(yb-ya)*k/12);await p.mouse.up();};
const X=cx+4,Y=cy+5;await drag([X,Y-3],[X,Y]);await drag([X-1,Y],[X-4,Y]);
const s2=await p.evaluate(([X,Y])=>{const G=__f.G;const at=(x,y)=>G.blds.find(b=>b.x===x&&b.y===y);const c=at(X,Y);c.items.push({t:'lead',p:0});const h=at(X,Y-3);h.items.length=0;h.items.push({t:'lead',p:0});__f.sim(4);return{rot:c.rot,end:at(X-4,Y).items.length+at(X-3,Y).items.length};},[X,Y]);
ok('separate drags: corner auto-turns ('+s2.rot+')',s2.rot===2);ok('items flow past corner',s2.end>0);
// tap existing belt rotates
const [tx2,ty2]=await sc(X,Y-1);const before=await p.evaluate(([X,Y])=>__f.G.blds.find(b=>b.x===X&&b.y===Y).rot,[X,Y-1]);await p.mouse.click(tx2,ty2);
const after=await p.evaluate(([X,Y])=>__f.G.blds.find(b=>b.x===X&&b.y===Y).rot,[X,Y-1]);ok('tap rotates belt',after===(before+1)%4);
// side merge
const m=await p.evaluate(([cx,cy])=>{const G=__f.G;let y=0,x0=0;outer:for(let yy=cy-12;yy<cy+12;yy++)for(let xx=cx-12;xx<cx+12;xx++){let g=true;for(let i=0;i<5;i++)if(!__f.canPlace('conveyor',xx+i,yy))g=false;if(!__f.canPlace('conveyor',xx+2,yy-1))g=false;if(g){y=yy;x0=xx;break outer;}}for(let x=x0;x<x0+5;x++)__f.place('conveyor',x,y,2,true);const s=__f.place('conveyor',x0+2,y-1,1,true);const main=G.blds.find(b=>b.x===x0+4&&b.y===y);let got=0;const end=G.blds.find(b=>b.x===x0&&b.y===y);
 for(let t=0;t<40;t++){if(!s.items.length)s.items.push({t:'lead',p:.5});if(!main.items.length)main.items.push({t:'copper',p:0});__f.sim(.25);}const types=new Set();return{ok:!!s&&!!main,len:end.items.length,mid:G.blds.find(b=>b.x===x0+1&&b.y===y).items.map(i=>i.t).join()+'|'+end.items.map(i=>i.t).join()};},[cx,cy]);
console.log(m);ok('side merge carries both',m.mid.includes('lead')&&m.mid.includes('copper'));
// UI overlap
const ov=await p.evaluate(()=>{const r=id=>document.getElementById(id).getBoundingClientRect();const a=[...document.querySelectorAll('#hud > *, #cats, #tools')].map(e=>e.getBoundingClientRect()).filter(q=>q.width);const off=a.some(q=>q.right>innerWidth+1||q.bottom>innerHeight+1||q.left<-1);return{off,cats:[...document.querySelectorAll('#cats button')].map(b=>b.textContent).join(',')};});
ok('nothing off-screen',!ov.off);ok('no locked Энергия tab: '+ov.cats,!ov.cats.includes('Энергия'));
console.log(name,'ERRORS',errs);}
await b.close();
