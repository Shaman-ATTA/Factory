import {chromium} from 'playwright';
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:'block'})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(700);
const r=await p.evaluate(()=>{const f=__f;f.start('E');const G=f.G;G.tut=-1;G.wT=999;const out={};
 // find empty row
 let Y=-1,X=-1;for(let y=2;y<26&&Y<0;y++)for(let x=2;x<30;x++){let ok=true;for(let i=0;i<14;i++)for(let dy=-1;dy<=1;dy++)if(!f.canPlace('conveyor',x+i,y+dy))ok=false;if(ok){Y=y;X=x;break;}}
 out.row=[X,Y];const res=G.res;res.copper=res.lead=res.titanium=999;
 // source: feed items manually into belt 0; belt→sorter→belt / sides
 f.place('conveyor',X,Y,0,true);f.place('sorter',X+1,Y,0,true);f.place('conveyor',X+2,Y,0,true);f.place('conveyor',X+1,Y+1,1,true);f.place('conveyor',X+1,Y-1,3,true);
 const s=G.blds.find(b=>b.t==='sorter');s.sel='lead';
 const belt=G.blds.find(b=>b.x===X&&b.y===Y);let n=0;for(let t=0;t<200;t++){if(belt.items.length<2&&n<10){belt.items.push({t:n%2?'lead':'copper',p:0});n++;}f.sim(.05);}
 const fw=G.blds.find(b=>b.x===X+2&&b.y===Y),dn=G.blds.find(b=>b.x===X+1&&b.y===Y+1),up=G.blds.find(b=>b.x===X+1&&b.y===Y-1);
 out.sorter={fw:fw.items.map(i=>i.t),dn:dn.items.map(i=>i.t),up:up.items.map(i=>i.t)};
 // bridge across 3 walls
 const Y2=Y; const X2=X+5;f.place('bridge',X2,Y2,0,true);for(let i=1;i<=2;i++)f.place('wall',X2+i,Y2,0,true);f.place('bridge',X2+3,Y2,0,true);f.place('conveyor',X2+4,Y2,0,true);
 const br=G.blds.find(b=>b.x===X2&&b.y===Y2);br.buf.push('copper','copper');f.sim(2);out.bridge=G.blds.find(b=>b.x===X2+4&&b.y===Y2).items.length+'/'+(f.bridgeLink(br)?'linked':'nolink');
 // tconv speed
 f.place('tconv',X+10,Y+1,0,'aj')||0;const tc=G.blds.find(b=>b.x===X+10&&b.y===Y+1);out.tconv=tc&&tc.sel;
 // turrets
 f.place('salvo',X,Y+3,0,true);const sv=G.blds.find(b=>b.t==='salvo');sv.ammo=40;sv.ammoT='graphite';
 f.place('arc',X+3,Y+3,0,true);for(const[dx,dy]of[[4,3],[3,4],[2,3],[3,2],[5,3]])if(f.place('generator',X+dx,Y+dy,0,true))break;const gn=G.blds.find(b=>b.t==='generator');f.relink();
 for(let i=0;i<4;i++)f.enemies.push({type:'dagger',x:X+3.5+i*.8,y:Y+6,hp:9999,max:9999,spd:0,r:.32,c:'#e2584a',vx:0,vy:0,ang:0,hit:0,walk:0});
 let a0=sv.ammo;for(let t=0;t<40;t++){gn.inp=5;f.sim(.05);}out.salvoShots=a0-sv.ammo;out.arcHits=f.enemies.filter(e=>e.hp<9999).length;out.arcPw=G.blds.find(b=>b.t==='arc').pw;
 out.peek=f.peekWave().length;return out;});
console.log(JSON.stringify(r));await p.waitForTimeout(500);
await p.evaluate(()=>{const f=__f;f.cam.x=f.G.blds.find(b=>b.t==='sorter').x+3;f.cam.y=f.G.blds.find(b=>b.t==='sorter').y+2;f.cam.z=40;});await p.waitForTimeout(300);
await p.screenshot({path:'/workspace/factory2d_shot20_phaseC.png'});console.log('errs',errs);await b.close();
