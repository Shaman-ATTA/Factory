'use strict';
// Phase D: biomes, animated world (water/lava, vegetation, smoke, portals, core idle), day cycle, weather, auto-quality.
const BIOMES={
 moss:{a:[.95,1.12,.9,0,4,0],b:[1.3,1.18,.9,10,8,2],rock:[1,1,1],liquid:[30,70,105],shore:[150,170,150],veg:'#5f8a46',weather:'rain',night:.32},
 sand:{a:[1.55,1.3,.92,22,14,4],b:[1.2,1.1,.9,8,6,2],rock:[1.12,1.02,.9],liquid:[40,90,120],shore:[220,200,150],veg:'#9a8a4a',weather:'dust',night:.28},
 snow:{a:[2.5,2.6,2.8,58,62,70],b:[1.9,2.15,2.5,40,50,62],rock:[1.05,1.08,1.16],liquid:[140,185,215],shore:[230,240,250],veg:'#cfe3f0',weather:'snow',ice:true,night:.3},
 metal:{a:[1.05,1.1,1.2,4,6,10],b:[.95,1.05,1.2,2,4,8],rock:[.95,.98,1.05],liquid:[30,60,95],shore:[120,140,160],veg:'#4f7a5a',weather:'',metal:true,night:.36},
 lava:{a:[.85,.75,.72,8,2,0],b:[1,.7,.6,12,0,0],rock:[.85,.78,.75],liquid:[210,80,20],shore:[255,170,60],veg:'#6a4a3a',weather:'ash',lava:true,night:.4}};
const LVB=['moss','moss','sand','moss','metal','sand','snow','lava'];
function curBiome(){if(!G||!G.L)return'moss';const L=G.L;if(L.endless)return['moss','sand','snow','metal','lava'][L.seed%5];return LVB[G.lv]||'moss';}
function BIOME_P(){return BIOMES[curBiome()];}
function isW(x,y){return x>=0&&y>=0&&x<MW&&y<MH&&terrain[y*MW+x]===7;}
function wdist(u,v){const x=u|0,y=v|0,fx=u-x,fy=v-y;let d=1;if(!isW(x-1,y))d=Math.min(d,fx);if(!isW(x+1,y))d=Math.min(d,1-fx);if(!isW(x,y-1))d=Math.min(d,fy);if(!isW(x,y+1))d=Math.min(d,1-fy);
 if(!isW(x-1,y-1))d=Math.min(d,Math.hypot(fx,fy));if(!isW(x+1,y-1))d=Math.min(d,Math.hypot(1-fx,fy));if(!isW(x-1,y+1))d=Math.min(d,Math.hypot(fx,1-fy));if(!isW(x+1,y+1))d=Math.min(d,Math.hypot(1-fx,1-fy));return d;}
{
// decor lists built per map
let DEC=null,WT=null,DKEY=null;
function buildDecor(){const r=rng((G.L.seed||7)*131+5);DEC=[];WT=[];const P=BIOME_P();
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=terrain[y*MW+x];if(t===7){WT.push(x,y,(isW(x-1,y)&&isW(x+1,y)&&isW(x,y-1)&&isW(x,y+1))?0:1);continue;}
  if(t!==0)continue;const c=G.core;if(Math.abs(x-c.x)<=2&&Math.abs(y-c.y)<=2)continue;const v=r();
  if(v<.3)DEC.push({x:x+.15+r()*.7,y:y+.2+r()*.7,k:r()<.2?1:0,s:.6+r()*.6,p:r()*6.28});}
 DKEY=G;}
function tuft(c,d,t,col,P){const sw=Math.sin(t*1.6+d.p+d.x*.4)*.06*d.s;c.strokeStyle=col;c.lineWidth=.035;c.lineCap='round';c.beginPath();
 if(P.ice||curBiome()==='snow'){for(let i=0;i<3;i++){const a=i*2.09+d.p;c.moveTo(d.x,d.y);c.lineTo(d.x+Math.cos(a)*.09*d.s,d.y+Math.sin(a)*.09*d.s);}c.stroke();return;}
 for(let i=-1;i<=1;i++){c.moveTo(d.x+i*.05*d.s,d.y);c.quadraticCurveTo(d.x+i*.07*d.s+sw*.5,d.y-.12*d.s,d.x+i*.1*d.s+sw,d.y-.22*d.s);}c.stroke();
 if(d.k){c.fillStyle=P.lava?'#ff9a40':'#e8d070';c.beginPath();c.arc(d.x+sw,d.y-.22*d.s,.035,0,7);c.fill();}}
window.worldFX=function(c,x0,x1,y0,y1){if(!G)return;if(DKEY!==G)buildDecor();const P=BIOME_P(),t=now/1000,q=hq();
 // liquids
 for(let i=0;i<WT.length;i+=3){const x=WT[i],y=WT[i+1];if(x<x0||x>x1||y<y0||y>y1)continue;
  if(P.lava){const g=.5+.5*Math.sin(t*1.3+x*.7+y*.9);c.fillStyle=`rgba(255,${120+g*60|0},40,${.18+g*.18})`;c.fillRect(x,y,1,1);if(q&&((x*7+y*13)%5===0))glow(x+.5,y+.5,1.1,'rgba(255,120,30,.35)');
   if(Math.random()<.004)parts.push({x:x+Math.random(),y:y+Math.random(),vx:0,vy:-.4,life:1.2,max:1.2,c:'#6a5a5088',s:.18,smoke:true});}
  else if(P.ice){if(((x+y+(t*2|0))%9)===0){const k=(t*2)%1;c.fillStyle=`rgba(255,255,255,${.35*(1-Math.abs(k*2-1))})`;c.fillRect(x+.2,y+.3,.25,.04);c.fillRect(x+.3,y+.2,.04,.25);}}
  else{c.strokeStyle='rgba(200,230,255,.13)';c.lineWidth=.04;c.beginPath();for(let k=0;k<2;k++){const yy=y+.3+k*.4+Math.sin(t*1.5+x*.8+k)*.06;c.moveTo(x+.1,yy);c.quadraticCurveTo(x+.5,yy+Math.sin(t*2+x+y)*.08,x+.9,yy);}c.stroke();
   if(WT[i+2]){const a=.18+.12*Math.sin(t*2.2+x*1.3+y);c.strokeStyle=`rgba(255,255,255,${a})`;c.lineWidth=.06;c.setLineDash([.12,.1]);c.lineDashOffset=t*.3;
    c.beginPath();if(!isW(x-1,y)){c.moveTo(x+.06,y);c.lineTo(x+.06,y+1);}if(!isW(x+1,y)){c.moveTo(x+.94,y);c.lineTo(x+.94,y+1);}if(!isW(x,y-1)){c.moveTo(x,y+.06);c.lineTo(x+1,y+.06);}if(!isW(x,y+1)){c.moveTo(x,y+.94);c.lineTo(x+1,y+.94);}c.stroke();c.setLineDash([]);}}}
 // vegetation
 if(q||cam.z>18){const col=P.veg;for(const d of DEC){if(d.x<x0||d.x>x1+1||d.y<y0||d.y>y1+1)continue;if(tileB[(d.y|0)*MW+(d.x|0)])continue;tuft(c,d,t,col,P);}c.lineCap='butt';}
 // spawn portals
 for(const s of G.spawns){const cx=s.x+.5,cy=s.y+.5;c.save();c.translate(cx,cy);for(let a=0;a<3;a++){c.rotate(t*1.4+a*2.094-(a?0:0));c.strokeStyle=`rgba(255,${90+a*40},80,.55)`;c.lineWidth=.08;c.beginPath();for(let k=0;k<=16;k++){const r=.25+k*.07,an=k*.32;const px=Math.cos(an)*r,py=Math.sin(an)*r;k?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();c.rotate(-(t*1.4+a*2.094));}c.restore();
  if(Math.random()<.15)parts.push({x:cx+(Math.random()-.5)*2.4,y:cy+(Math.random()-.5)*2.4,vx:0,vy:-.5,life:.7,max:.7,c:'#ff5040',s:.06});}
};
let wp=[];
window.worldTop=function(c,x0,x1,y0,y1){if(!G)return;const t=now/1000;
 // chimney smoke from working factories
 if(!paused)for(const b of G.blds){if(b.x<x0||b.x>x1||b.y<y0||b.y>y1)continue;const work=(b.t==='press'&&b.inp>=2)||(b.t==='smelter'&&b.pw>.05&&b.inp>=1)||(b.t==='factory'&&b.pw>.05);if(work&&Math.random()<.06)parts.push({x:b.x+.7,y:b.y+.2,vx:.15,vy:-.55,life:1.4,max:1.4,c:'#8a8a9055',s:.22,smoke:true});}
 // core idle: orbiting motes + rotating ring
 const cb=G.coreB;if(cb){const cx=cb.x+.5,cy=cb.y+.5;c.strokeStyle='rgba(255,190,90,.35)';c.lineWidth=.05;c.setLineDash([.4,.25]);c.lineDashOffset=-t*.8;c.beginPath();c.arc(cx,cy,1.9,0,7);c.stroke();c.setLineDash([]);
  for(let i=0;i<4;i++){const a=t*.9+i*1.571;const px=cx+Math.cos(a)*1.9,py=cy+Math.sin(a)*1.9;c.fillStyle='#ffd27a';c.beginPath();c.arc(px,py,.07,0,7);c.fill();glow(px,py,.4,'rgba(255,190,80,.6)');}}
};
// day/night + weather in screen space
function dayK(){if(!G)return 0;const ph=(G.t/240)%1;return Math.max(0,Math.sin((ph-.5)*Math.PI*2));} // 0 day .. 1 night
window.screenFX=function(c){if(!G)return;const P=BIOME_P();const n=dayK()*P.night;
 if(n>.01){c.fillStyle=`rgba(10,20,60,${n})`;c.fillRect(0,0,cv.width,cv.height);}
 const dusk=Math.max(0,Math.sin(((G.t/240)%1)*Math.PI*4))*.08;if(dusk>.01){c.fillStyle=`rgba(255,140,60,${dusk*(1-dayK())})`;c.fillRect(0,0,cv.width,cv.height);}
 if(!P.weather||S.quality==='low')return;const w=cv.width,h=cv.height,dt=Math.min(.05,fpsAcc[fpsAcc.length-1]||.016);const N=P.weather==='rain'?90:P.weather==='snow'?80:50;
 while(wp.length<N)wp.push({x:Math.random()*w,y:Math.random()*h,s:.5+Math.random(),p:Math.random()*6});
 const camDX=(cam.x-(wp.cx??cam.x))*cam.z*DPR,camDY=(cam.y-(wp.cy??cam.y))*cam.z*DPR;wp.cx=cam.x;wp.cy=cam.y;
 if(P.weather==='rain'){c.strokeStyle='rgba(170,200,255,.35)';c.lineWidth=DPR;c.beginPath();for(const p of wp){p.x+=(-60*dt*p.s)*DPR-camDX;p.y+=700*dt*p.s*DPR-camDY;if(p.y>h||p.x<0||p.x>w||p.y<0){p.y=Math.random()*-40;p.x=Math.random()*w;}c.moveTo(p.x,p.y);c.lineTo(p.x-4*DPR,p.y+14*DPR*p.s);}c.stroke();}
 else{const col=P.weather==='snow'?'rgba(255,255,255,.8)':P.weather==='ash'?'rgba(90,80,80,.6)':'rgba(220,190,130,.35)';c.fillStyle=col;
  for(const p of wp){p.p+=dt;const vx=P.weather==='dust'?160:Math.sin(p.p)*20,vy=P.weather==='dust'?10:P.weather==='ash'?25:45;p.x+=vx*dt*p.s*DPR-camDX;p.y+=vy*dt*p.s*DPR-camDY;
   if(p.x>w+10)p.x=-10;if(p.x<-10)p.x=w+10;if(p.y>h+10)p.y=-10;if(p.y<-10)p.y=h+10;const r=(P.weather==='dust'?1.2:1.6)*p.s*DPR;c.fillRect(p.x,p.y,r,r);}}};
// camera bounds on level start
const _nl=newLevel;newLevel=function(lv,seed){const r=_nl(lv,seed);if(G)clampCam();DKEY=null;wp=[];return r;};
// auto quality: drop DPR when fps stays low
let lowT=0,aqT=0;const _loop=null;
setInterval(()=>{if(!G||inMenu()||paused||fpsAcc.length<20)return;const fps=fpsAcc.length/fpsAcc.reduce((a,b)=>a+b,0);
 if(fps<45){lowT++;if(lowT>=3&&DPR>1){S.dpr=Math.max(1,Math.round((DPR-.5)*2)/2);resize();lowT=0;GFX.vigK=null;}}else lowT=0;},1000);
if(window.__f)Object.assign(__f,{curBiome,dayK,get DEC(){return DEC},get WT(){return WT}});
}
