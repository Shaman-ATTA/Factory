import {chromium} from 'playwright';
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{__f.start(0);const G=__f.G;G.tut=-1;G.wT=999;const ox=G.core.x+3,oy=G.core.y-6;
 const clear=()=>{for(const b of [...G.blds])if(b.t==='conveyor')__f.removeB(b,true);};
 const P=(x,y,r)=>__f.place('conveyor',ox+x,oy+y,r,'aj');const R={};
 // main line x 0..5 east (rot0), then side line from north going down into x=3
 for(let x=0;x<6;x++)P(x,3,0);const main=G.blds.filter(b=>b.t==='conveyor').map(b=>b.rot).join('');
 for(let y=0;y<3;y++)P(3,y,1);
 const m2=[0,1,2,3,4,5].map(x=>__f.G.blds.find(b=>b.x===ox+x&&b.y===oy+3).rot).join('');
 R.T=m2===main&&__f.beltCurve(G.blds.find(b=>b.x===ox+3&&b.y===oy+3))===0;
 for(let y=6;y>3;y--)P(2,y,3);R.two=[0,1,2,3,4,5].map(x=>G.blds.find(b=>b.x===ox+x&&b.y===oy+3).rot).join('')===main;
 // items flow from both sides
 const tgt=G.blds.find(b=>b.x===ox+5&&b.y===oy+3);
 // parallel line must not bend dead-end
 for(let x=0;x<4;x++)P(x,9,0);for(let x=0;x<5;x++)P(x,10,0);R.par=G.blds.find(b=>b.x===ox+3&&b.y===oy+9).rot===0;
 // L-corner: dead-end end at (3,12) going east; new belt placed below-right continuing south from it? place at (3,13)? -> natural: new belt at (4,12)? that's front, already feeds. L: new belt at (3,13) rot1 (continues away south)
 for(let x=0;x<4;x++)P(x,12,0);R.pl=!!P(3,13,1);R.dbg=G.blds.find(b=>b.x===ox+3&&b.y===oy+12).rot;R.L=G.blds.find(b=>b.x===ox+3&&b.y===oy+12).rot===1&&__f.beltCurve(G.blds.find(b=>b.x===ox+3&&b.y===oy+12))!==0;
 const c3=G.blds.find(b=>b.x===ox+3&&b.y===oy+13);R.Lc=__f.beltCurve(c3)===0;delete R.dbg;
 // pointing into existing: no change
 for(let x=0;x<3;x++)P(x,15,0);P(2,16,3);R.into=G.blds.find(b=>b.x===ox+2&&b.y===oy+15).rot===0;
 return R;});
console.log(r);const all=Object.values(r).every(v=>v)&&!errs.length;console.log(errs,all?'ALL OK':'FAIL');await b.close();
