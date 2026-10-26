'use strict';
// ===================== ГРАФИКА v2: спрайты, освещение, ландшафт =====================
const GFX={R:64,TR:32,spr:new Map(),glow:new Map(),chunks:[],vig:null,vigK:'',fx:[]};
const hq=()=>S.quality!=='low';
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
// ---- шум ----
function hash2(x,y,s){let h=(x*374761393+y*668265263+s*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;}
function vnoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
 const a=hash2(xi,yi,s),b=hash2(xi+1,yi,s),c=hash2(xi,yi+1,s),d=hash2(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,y,s,o){let v=0,a=.5,f=1,t=0;for(let i=0;i<(o||4);i++){v+=a*vnoise(x*f,y*f,s+i*17);t+=a;a*=.5;f*=2.03;}return v/t;}
// ---- примитивы для спрайтов (единицы = клетки) ----
function rrect(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function lg(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g;}
function rg(c,x,y,r0,r1,stops){const g=c.createRadialGradient(x,y,r0,x,y,r1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g;}
function shade(hex,k){const n=parseInt(hex.slice(1,7),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,k>0?v+(255-v)*k:v*(1+k)))|0;return`rgb(${f(r)},${f(g)},${f(b)})`;}
// металлическая панель с фаской
function plate(c,x,y,w,h,r,col,opt){opt=opt||{};rrect(c,x,y,w,h,r);c.fillStyle=lg(c,x,y,x+w*.35,y+h,[shade(col,.28),col,shade(col,-.35)]);c.fill();
 c.lineWidth=.035;c.strokeStyle='rgba(0,0,0,.65)';c.stroke();
 rrect(c,x+.04,y+.04,w-.08,h-.08,Math.max(0,r-.03));c.lineWidth=.025;c.strokeStyle=lg(c,x,y,x+w,y+h,['rgba(255,255,255,.35)','rgba(255,255,255,.05)','rgba(0,0,0,.25)']);c.stroke();
 if(opt.rivets){c.fillStyle='rgba(0,0,0,.45)';const q=opt.rivets;for(const[px,py]of[[x+q,y+q],[x+w-q,y+q],[x+q,y+h-q],[x+w-q,y+h-q]]){c.beginPath();c.arc(px+.01,py+.012,.032,0,7);c.fill();}
  for(const[px,py]of[[x+q,y+q],[x+w-q,y+q],[x+q,y+h-q],[x+w-q,y+h-q]]){c.beginPath();c.arc(px,py,.026,0,7);c.fillStyle=rg(c,px-.01,py-.01,0,.03,['#e8ecf2','#7a808c']);c.fill();}}
 if(opt.lines){c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=.018;for(const l of opt.lines){c.beginPath();c.moveTo(l[0],l[1]);c.lineTo(l[2],l[3]);c.stroke();}c.strokeStyle='rgba(255,255,255,.08)';for(const l of opt.lines){c.beginPath();c.moveTo(l[0]+.015,l[1]+.015);c.lineTo(l[2]+.015,l[3]+.015);c.stroke();}}}
function stripe(c,x,y,w,h){c.save();rrect(c,x,y,w,h,.02);c.clip();c.fillStyle='#f0a040';c.fillRect(x,y,w,h);c.fillStyle='#2a2216';for(let i=-2;i<w/.12+2;i++){c.beginPath();c.moveTo(x+i*.12,y+h);c.lineTo(x+i*.12+.06,y+h);c.lineTo(x+i*.12+.06+h,y);c.lineTo(x+i*.12+h,y);c.fill();}c.restore();}
function lamp(c,x,y,r,col){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=rg(c,x-r*.3,y-r*.3,0,r,['#fff',col,shade(col,-.5)]);c.fill();}
// спрайт с отступом pad (в клетках), опционально с мягкой тенью
function spr(key,w,h,pad,fn,shadow){let s=GFX.spr.get(key);if(s)return s;const R=GFX.R;const cv2=mkCanvas((w+pad*2)*R,(h+pad*2)*R);const c=cv2.getContext('2d');c.setTransform(R,0,0,R,pad*R,pad*R);
 if(shadow&&hq()){c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=R*.14;c.shadowOffsetX=R*.06;c.shadowOffsetY=R*.09;c.fillStyle='#000';rrect(c,shadow[0],shadow[1],shadow[2],shadow[3],shadow[4]||.1);c.fill();c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetX=c.shadowOffsetY=0;}
 fn(c);s={c:cv2,pad,w,h};GFX.spr.set(key,s);return s;}
function blit(c,s,x,y,a,sc){if(!a&&!sc){c.drawImage(s.c,x-s.pad,y-s.pad,s.w+s.pad*2,s.h+s.pad*2);return;}c.save();c.translate(x+s.w/2,y+s.h/2);if(a)c.rotate(a);if(sc)c.scale(sc,sc);c.drawImage(s.c,-s.w/2-s.pad,-s.h/2-s.pad,s.w+s.pad*2,s.h+s.pad*2);c.restore();}
function glowSpr(col){let g=GFX.glow.get(col);if(g)return g;g=mkCanvas(64,64);const c=g.getContext('2d');c.fillStyle=rg(c,32,32,0,32,[col,col.replace(/[\d.]+\)$/,'0.35)'),col.replace(/[\d.]+\)$/,'0)')]);c.fillRect(0,0,64,64);GFX.glow.set(col,g);return g;}
// очередь свечения (аддитивно поверх)
let GLQ=[];function glow(x,y,r,col){if(hq())GLQ.push(x,y,r,col);}
// ===================== ЛАНДШАФТ (чанки) =====================
renderMap=function(){const R=hq()?32:16;GFX.TR=R;const Wp=MW*R,Hp=MH*R;mapImg=null;
 const full=mkCanvas(Wp,Hp),c=full.getContext('2d');const img=c.createImageData(Wp,Hp),d=img.data;const sd=(G&&G.L&&G.L.seed)||7;
 const rk=new Float32Array((MW+2)*(MH+2));for(let y=-1;y<=MH;y++)for(let x=-1;x<=MW;x++){const xx=Math.max(0,Math.min(MW-1,x)),yy=Math.max(0,Math.min(MH-1,y));rk[(y+1)*(MW+2)+x+1]=terrain[yy*MW+xx]===1?1:0;}
 const RK=(u,v)=>{u-=.5;v-=.5;const xi=Math.floor(u),yi=Math.floor(v),xf=u-xi,yf=v-yi;const s=(x,y)=>rk[(Math.max(-1,Math.min(MH,y))+1)*(MW+2)+Math.max(-1,Math.min(MW,x))+1];
  const a=s(xi,yi),b=s(xi+1,yi),cc=s(xi,yi+1),dd=s(xi+1,yi+1);const sx=xf*xf*(3-2*xf),sy=yf*yf*(3-2*yf);return a+(b-a)*sx+(cc-a)*sy+(a-b-cc+dd)*sx*sy;};
 for(let py=0;py<Hp;py++)for(let px=0;px<Wp;px++){const u=(px+.5)/R,v=(py+.5)/R;const n=fbm(u*.35,v*.35,sd,3),f=vnoise(u*3.1,v*3.1,sd+5);
  const rv=RK(u,v)+(f-.5)*.32+(n-.5)*.2;let r,g,b;
  if(rv>.5){const e=.12;const gx=RK(u+e,v)-RK(u-e,v),gy=RK(u,v+e)-RK(u,v-e);const h=Math.min(1,(rv-.5)*3.2);let L=.62+(-gx-gy)*.9;L=Math.max(.25,Math.min(1.35,L));
   const cr=vnoise(u*6,v*6,sd+9);const base=62+h*26+cr*22-(h<.25?14:0);r=base*L+6;g=base*L+2;b=base*L-4;if(h>.85){const t=fbm(u*1.3,v*1.3,sd+3,2);r+=t*14;g+=t*12;b+=t*10;}}
  else{const sh=Math.max(0,RK(u-.28,v-.34)-.25)*1.3+Math.max(0,rv-.2)*.5;const m=fbm(u*.12,v*.12,sd+11,2);const grain=hash2(px,py,sd)*10;
   r=40+n*22+m*10+grain;g=44+n*20+(1-m)*8+grain;b=40+n*14+grain*.7;const k=1-Math.min(.6,sh);r*=k;g*=k;b*=k;
   const t=terrain[Math.min(MH-1,v|0)*MW+Math.min(MW-1,u|0)];if(ORE[t]){const oc=ITEMS[ORE[t]].c,on=parseInt(oc.slice(1),16);const w=.16*(.6+f*.6);r=r*(1-w)+(on>>16)*.55*w;g=g*(1-w)+(on>>8&255)*.55*w;b=b*(1-w)+(on&255)*.55*w;}}
  const i=(py*Wp+px)*4;d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;}
 c.putImageData(img,0,0);c.setTransform(R,0,0,R,0,0);
 // кристаллы руды
 const r=rng(sd*31+7);for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=terrain[y*MW+x];if(!ORE[t])continue;const col=ITEMS[ORE[t]].c;const n=3+(r()*3|0);
  for(let i=0;i<n;i++){const cx=x+.18+r()*.64,cy=y+.22+r()*.6,s=.08+r()*.11;crystal(c,cx,cy,s,col,r,t===4);}}
 // сетка
 c.strokeStyle='rgba(255,255,255,.035)';c.lineWidth=1/R;c.beginPath();for(let x=0;x<=MW;x++){c.moveTo(x,0);c.lineTo(x,MH);}for(let y=0;y<=MH;y++){c.moveTo(0,y);c.lineTo(MW,y);}c.stroke();
 GFX.chunks=[];const CW=16,CH=14;for(let cy=0;cy<MH;cy+=CH)for(let cx=0;cx<MW;cx+=CW){const w=Math.min(CW,MW-cx),h=Math.min(CH,MH-cy);const k=mkCanvas(w*R,h*R);k.getContext('2d').drawImage(full,cx*R,cy*R,w*R,h*R,0,0,w*R,h*R);GFX.chunks.push({x:cx,y:cy,w,h,c:k});}
 mapImg=full;};
function crystal(c,x,y,s,col,r,coal){c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+s*.25,y+s*.55,s*.9,s*.4,0,0,7);c.fill();
 const k=coal?4:2+(r()*2|0);for(let j=0;j<k;j++){const a=-Math.PI/2+(r()-.5)*1.3,h=s*(1+r()*1.2),w=s*.42;const bx=x+(r()-.5)*s*.8,by=y;
  const tx=bx+Math.cos(a)*h,ty=by+Math.sin(a)*h,px=Math.cos(a+Math.PI/2)*w,py=Math.sin(a+Math.PI/2)*w;
  if(coal){c.fillStyle=lg(c,bx-w,by,bx+w,by,['#5a5a62','#2a2a30','#141418']);c.beginPath();c.arc(bx,by-s*.3,s*.5,0,7);c.fill();continue;}
  c.beginPath();c.moveTo(bx+px,by+py);c.lineTo(tx,ty);c.lineTo(bx-px,by-py);c.closePath();c.fillStyle=shade(col,-.35);c.fill();
  c.beginPath();c.moveTo(bx,by);c.lineTo(tx,ty);c.lineTo(bx-px,by-py);c.closePath();c.fillStyle=shade(col,.25);c.fill();
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=.012;c.beginPath();c.moveTo(bx,by);c.lineTo(tx,ty);c.stroke();}
 c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.arc(x-s*.1,y-s*.9,s*.08,0,7);c.fill();}
// ===================== ИКОНКИ РЕСУРСОВ =====================
const ICON={};var ICONURL={};
function mkIcons(){for(const k in ITEMS){const R=48,cv2=mkCanvas(R,R),c=cv2.getContext('2d');c.setTransform(R,0,0,R,0,0);const col=ITEMS[k].c;
 c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(.52,.82,.34,.1,0,0,7);c.fill();
 if(k==='copper'||k==='lead'||k==='titanium'){// слиток
  c.beginPath();c.moveTo(.14,.66);c.lineTo(.3,.36);c.lineTo(.86,.36);c.lineTo(.86,.36);c.lineTo(.72,.66);c.closePath();c.fillStyle=shade(col,.35);c.fill();
  c.beginPath();c.moveTo(.14,.66);c.lineTo(.72,.66);c.lineTo(.72,.8);c.lineTo(.14,.8);c.closePath();c.fillStyle=shade(col,-.2);c.fill();
  c.beginPath();c.moveTo(.72,.66);c.lineTo(.86,.36);c.lineTo(.86,.5);c.lineTo(.72,.8);c.closePath();c.fillStyle=shade(col,-.45);c.fill();
  c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=.03;c.beginPath();c.moveTo(.2,.62);c.lineTo(.32,.4);c.lineTo(.8,.4);c.stroke();
  c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=.035;c.beginPath();c.moveTo(.14,.66);c.lineTo(.3,.36);c.lineTo(.86,.36);c.lineTo(.86,.5);c.lineTo(.72,.8);c.lineTo(.14,.8);c.closePath();c.stroke();}
 else if(k==='coal'){for(const[x,y,r]of[[.38,.58,.2],[.62,.6,.18],[.5,.4,.2]]){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=rg(c,x-r*.4,y-r*.4,0,r,['#6a6a74','#2a2a30','#101014']);c.fill();c.strokeStyle='#000a';c.lineWidth=.025;c.stroke();}}
 else if(k==='sand'){c.beginPath();c.moveTo(.1,.78);c.quadraticCurveTo(.5,.1,.9,.78);c.closePath();c.fillStyle=lg(c,.3,.3,.7,.8,['#f6e2b0',col,'#a88a50']);c.fill();c.fillStyle='#8a7040';for(let i=0;i<9;i++)c.fillRect(.25+((i*37)%50)/100,.5+((i*23)%25)/100,.03,.03);}
 else if(k==='graphite'){c.beginPath();c.moveTo(.5,.12);c.lineTo(.84,.32);c.lineTo(.84,.68);c.lineTo(.5,.88);c.lineTo(.16,.68);c.lineTo(.16,.32);c.closePath();c.fillStyle=lg(c,.2,.2,.8,.8,['#a8bccf',col,'#2a3440']);c.fill();c.strokeStyle='#000a';c.lineWidth=.035;c.stroke();
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=.02;c.beginPath();c.moveTo(.5,.12);c.lineTo(.5,.5);c.lineTo(.84,.68);c.moveTo(.5,.5);c.lineTo(.16,.68);c.stroke();}
 else{// кремний — пластина
  rrect(c,.16,.2,.68,.6,.06);c.fillStyle=lg(c,.16,.2,.84,.8,['#8aa0c0','#3a4658','#1c2230']);c.fill();c.strokeStyle='#000a';c.lineWidth=.035;c.stroke();
  c.strokeStyle='#7fd8ff';c.lineWidth=.025;c.beginPath();for(const y of[.35,.5,.65]){c.moveTo(.24,y);c.lineTo(.76,y);}c.moveTo(.5,.26);c.lineTo(.5,.74);c.stroke();c.fillStyle='#bff';c.fillRect(.46,.46,.08,.08);}
 ICON[k]=cv2;try{ICONURL[k]=cv2.toDataURL();}catch(e){}}}
drawItem=function(c,it,x,y,s){const ic=ICON[it];if(!ic){c.fillStyle=ITEMS[it].c;c.fillRect(x-s,y-s,s*2,s*2);return;}const z=s*2.5;c.drawImage(ic,x-z/2,y-z/2,z,z);};
// ===================== СПРАЙТЫ ЗДАНИЙ =====================
const TEAM='#f0a040',STEEL='#5d6470',DARK='#2b2f37';
function baseFrame(c,col,acc){plate(c,.04,.04,.92,.92,.12,col,{rivets:.13,lines:[[.04,.3,.96,.3]]});if(acc){c.fillStyle=acc;c.fillRect(.3,.07,.4,.05);}}
const SPR={
 drill:()=>spr('drill',1,1,.2,c=>{baseFrame(c,'#646b78');stripe(c,.12,.84,.76,.07);c.beginPath();c.arc(.5,.52,.31,0,7);c.fillStyle=rg(c,.5,.52,.05,.31,['#0b0c10','#1d2027','#3a3f4a']);c.fill();c.strokeStyle='#000';c.lineWidth=.03;c.stroke();},[.04,.04,.92,.92,.12]),
 pdrill:()=>spr('pdrill',1,1,.2,c=>{baseFrame(c,'#4f7488');for(const[x,y]of[[.14,.14],[.86,.14],[.14,.86],[.86,.86]]){c.beginPath();c.arc(x,y,.08,0,7);c.fillStyle=rg(c,x-.02,y-.02,0,.08,['#cfe','#5a8a9a','#203038']);c.fill();}
  c.beginPath();c.arc(.5,.5,.33,0,7);c.fillStyle=rg(c,.5,.5,.05,.33,['#06080a','#1a2228','#3a4a54']);c.fill();c.strokeStyle='#7fd8ff';c.lineWidth=.025;c.stroke();},[.04,.04,.92,.92,.12]),
 rotor:(n,col)=>spr('rotor'+n,.7,.7,.05,c=>{c.translate(.35,.35);for(let i=0;i<n;i++){c.rotate(Math.PI*2/n);c.beginPath();c.moveTo(-.06,0);c.lineTo(-.04,-.3);c.lineTo(.04,-.3);c.lineTo(.07,0);c.closePath();c.fillStyle=lg(c,-.06,0,.07,0,['#d6dbe4','#8a919e','#4a505a']);c.fill();c.strokeStyle='#111';c.lineWidth=.015;c.stroke();c.fillStyle='#f0c070';c.fillRect(-.04,-.31,.08,.04);}
  c.beginPath();c.arc(0,0,.12,0,7);c.fillStyle=rg(c,-.03,-.03,0,.12,['#fff','#9aa1ad','#30343c']);c.fill();c.fillStyle=col;c.beginPath();c.arc(0,0,.045,0,7);c.fill();}),
 router:()=>spr('router',1,1,.2,c=>{plate(c,.06,.06,.88,.88,.14,'#5a606c',{rivets:.14});c.fillStyle=DARK;rrect(c,.3,.3,.4,.4,.06);c.fill();
  c.fillStyle=TEAM;for(let k=0;k<4;k++){c.save();c.translate(.5,.5);c.rotate(k*Math.PI/2);c.beginPath();c.moveTo(.42,0);c.lineTo(.3,-.08);c.lineTo(.3,.08);c.closePath();c.fill();c.restore();}},[.06,.06,.88,.88,.14]),
 unloader:()=>spr('unloader',1,1,.2,c=>{plate(c,.04,.04,.92,.92,.1,'#4a6a6e',{rivets:.12,lines:[[.04,.72,.96,.72]]});stripe(c,.1,.76,.8,.08);c.fillStyle=DARK;rrect(c,.22,.18,.56,.46,.06);c.fill();c.strokeStyle='#7fe0d0';c.lineWidth=.03;c.stroke();},[.04,.04,.92,.92,.1]),
 press:()=>spr('press',1,1,.2,c=>{plate(c,.04,.04,.92,.92,.08,'#565c6a',{rivets:.11});c.fillStyle=lg(c,0,.6,0,.86,['#1a1c22','#2e323a']);c.fillRect(.16,.6,.68,.26);stripe(c,.16,.52,.68,.06);
  for(const x of[.12,.8]){c.fillStyle=lg(c,x,0,x+.08,0,['#cfd5de','#6a707c']);c.fillRect(x,.12,.08,.5);}},[.04,.04,.92,.92,.08]),
 pressHead:()=>spr('pressH',.64,.3,.05,c=>{plate(c,0,0,.64,.3,.04,'#8a92a2',{lines:[[.32,0,.32,.3]]});}),
 smelter:()=>spr('smelter',1,1,.2,c=>{plate(c,.04,.04,.92,.92,.14,'#6a5a52',{rivets:.13});for(let y=0;y<3;y++)for(let x=0;x<3;x++){c.fillStyle='rgba(0,0,0,.18)';c.fillRect(.1+x*.28+(y%2)*.06,.1+y*.27,.24,.02);}
  c.beginPath();c.arc(.5,.5,.27,0,7);c.fillStyle='#16110e';c.fill();c.lineWidth=.06;c.strokeStyle=lg(c,.2,.2,.8,.8,['#b8a090','#4a3a32']);c.stroke();c.fillStyle=TEAM;c.fillRect(.08,.86,.18,.05);},[.04,.04,.92,.92,.14]),
 generator:()=>spr('gen',1,1,.2,c=>{plate(c,.04,.04,.92,.92,.1,'#655a50',{rivets:.12});for(let i=0;i<5;i++){c.fillStyle='rgba(0,0,0,.35)';c.fillRect(.12,.16+i*.05,.16,.025);c.fillRect(.72,.16+i*.05,.16,.025);}
  c.beginPath();c.arc(.5,.56,.24,0,7);c.fillStyle='#120c08';c.fill();c.lineWidth=.06;c.strokeStyle=lg(c,.3,.3,.7,.8,['#d8c8b0','#5a4a3a']);c.stroke();c.fillStyle='#3a3a40';c.fillRect(.66,.08,.14,.14);stripe(c,.12,.86,.3,.05);},[.04,.04,.92,.92,.1]),
 node:()=>spr('node',1,1,.25,c=>{c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;c.lineTo(.5+Math.cos(a)*.32,.5+Math.sin(a)*.32);}c.closePath();c.fillStyle=lg(c,.2,.2,.8,.8,['#7a808c','#3a3e46','#22252b']);c.fill();c.strokeStyle='#000a';c.lineWidth=.03;c.stroke();
  c.beginPath();c.arc(.5,.5,.15,0,7);c.fillStyle='#22252b';c.fill();},[.2,.2,.6,.6,.3]),
 battery:()=>spr('bat',1,1,.2,c=>{plate(c,.12,.08,.76,.86,.08,'#4d5650',{});c.fillStyle=lg(c,.4,0,.6,0,['#eee','#999']);c.fillRect(.38,.02,.24,.08);c.fillStyle='#14181a';c.fillRect(.2,.16,.6,.7);},[.12,.08,.76,.86,.08]),
 factory:()=>spr('fac',1,1,.2,c=>{plate(c,.02,.02,.96,.96,.1,'#4f5666',{rivets:.1,lines:[[.02,.46,.98,.46]]});c.fillStyle=lg(c,0,.12,0,.42,['#11141a','#262a32']);c.fillRect(.12,.12,.76,.3);stripe(c,.12,.84,.76,.07);c.fillStyle='#7fd8ff';c.fillRect(.16,.16,.08,.03);},[.02,.02,.96,.96,.1]),
 dronepad:()=>spr('pad',1,1,.2,c=>{plate(c,.04,.04,.92,.92,.16,'#4b5044',{rivets:.14});c.beginPath();c.arc(.5,.5,.32,0,7);c.fillStyle='#24271f';c.fill();c.strokeStyle='#e8d040';c.lineWidth=.05;c.stroke();
  c.fillStyle='#e8d040';c.font='bold .34px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('H',.5,.52);},[.04,.04,.92,.92,.16]),
 mender:()=>spr('mend',1,1,.2,c=>{plate(c,.06,.06,.88,.88,.2,'#4a5c4c',{rivets:.15});c.beginPath();c.arc(.5,.5,.26,0,7);c.fillStyle='#16201a';c.fill();},[.06,.06,.88,.88,.2]),
 wall:()=>spr('wall',1,1,.15,c=>{plate(c,.02,.02,.96,.96,.08,'#b57a50',{rivets:.12,lines:[[.02,.5,.98,.5],[.5,.02,.5,.5]]});},[.02,.02,.96,.96,.08]),
 lwall:()=>spr('lwall',1,1,.15,c=>{plate(c,.02,.02,.96,.96,.06,'#7a6ea8',{lines:[[.02,.36,.98,.36],[.02,.66,.98,.66],[.34,.02,.34,.36],[.66,.36,.66,.66],[.34,.66,.34,.98]]});},[.02,.02,.96,.96,.06]),
 twall:()=>spr('twall',1,1,.15,c=>{plate(c,.02,.02,.96,.96,.14,'#8aa6c4',{rivets:.14});plate(c,.2,.2,.6,.6,.08,'#6f8cac',{});c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=.03;c.beginPath();c.moveTo(.26,.74);c.lineTo(.74,.26);c.stroke();},[.02,.02,.96,.96,.14]),
 core:()=>spr('core',3,3,.3,c=>{plate(c,.05,.05,2.9,2.9,.3,'#3f4552',{rivets:.22,lines:[[.05,1,2.95,1],[.05,2,2.95,2],[1,.05,1,2.95],[2,.05,2,2.95]]});
  for(const[x,y]of[[.1,.1],[2.4,.1],[.1,2.4],[2.4,2.4]]){plate(c,x,y,.5,.5,.1,'#5a6070',{});c.fillStyle=TEAM;c.fillRect(x+.12,y+.12,.26,.26);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x+.12,y+.12,.26,.05);}
  plate(c,.55,.55,1.9,1.9,.35,'#596070',{});c.beginPath();c.arc(1.5,1.5,.78,0,7);c.fillStyle='#14161b';c.fill();c.lineWidth=.08;c.strokeStyle=lg(c,.8,.8,2.2,2.2,['#c8ced8','#4a505c']);c.stroke();
  stripe(c,.6,2.62,1.8,.12);stripe(c,.6,.26,1.8,.12);},[.05,.05,2.9,2.9,.3]),
 coreGem:()=>spr('coreGem',1.2,1.2,.1,c=>{c.translate(.6,.6);c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4;c.lineTo(Math.cos(a)*.52,Math.sin(a)*.52);}c.closePath();c.fillStyle=rg(c,-.12,-.15,0,.6,['#fff6d8','#ffb040','#a04a10']);c.fill();c.strokeStyle='#ffe0a0';c.lineWidth=.04;c.stroke();
  c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=.025;c.beginPath();c.moveTo(-.52,0);c.lineTo(.52,0);c.moveTo(0,-.52);c.lineTo(0,.52);c.stroke();}),
 tbase:t=>spr('tb'+t,1,1,.2,c=>{const col=t==='hail'?'#5f5c50':t==='lancer'?'#4e5a68':t==='aa'?'#545a66':'#5a606c';
  c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;c.lineTo(.5+Math.cos(a)*.47,.5+Math.sin(a)*.47);}c.closePath();c.fillStyle=lg(c,.1,.1,.8,.9,[shade(col,.3),col,shade(col,-.4)]);c.fill();c.strokeStyle='#000a';c.lineWidth=.035;c.stroke();
  c.beginPath();c.arc(.5,.5,.36,0,7);c.fillStyle='#22252c';c.fill();c.strokeStyle='rgba(255,255,255,.15)';c.lineWidth=.02;c.stroke();
  c.fillStyle=TEAM;for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;c.beginPath();c.arc(.5+Math.cos(a)*.41,.5+Math.sin(a)*.41,.035,0,7);c.fill();}},[.08,.08,.84,.84,.3]),
 thead:t=>spr('th'+t,1.4,1,.15,c=>{c.translate(.5,.5);// ось вращения в (0.5,0.5)
  if(t==='duo'){for(const o of[-.13,.13]){c.fillStyle=lg(c,0,o-.06,0,o+.06,['#dfe4ea','#8a919e','#3a3e46']);rrect(c,.02,o-.06,.56,.12,.03);c.fill();c.strokeStyle='#111';c.lineWidth=.02;c.stroke();c.fillStyle='#222';c.fillRect(.5,o-.035,.08,.07);}
   plate(c,-.27,-.27,.54,.54,.1,'#9aa1ad',{});c.fillStyle=TEAM;rrect(c,-.12,-.12,.24,.24,.04);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-.1,-.1,.2,.04);}
  else if(t==='hail'){c.fillStyle=lg(c,0,-.11,0,.11,['#d8d4c0','#8a8670','#3a382c']);rrect(c,0,-.11,.62,.22,.04);c.fill();c.strokeStyle='#111';c.lineWidth=.02;c.stroke();c.fillStyle='#2a2a22';c.fillRect(.5,-.13,.12,.26);
   c.beginPath();c.arc(0,0,.33,0,7);c.fillStyle=rg(c,-.1,-.1,0,.34,['#d8d4c0','#a8a492','#4a483c']);c.fill();c.strokeStyle='#111';c.lineWidth=.03;c.stroke();c.fillStyle=TEAM;c.fillRect(-.2,-.04,.22,.08);}
  else if(t==='aa'){for(const o of[-.2,-.07,.07,.2]){c.fillStyle=lg(c,0,o-.035,0,o+.035,['#e8eef4','#7a828e']);c.fillRect(.05,o-.035,.52,.07);}c.fillStyle='#333';c.fillRect(.08,-.24,.06,.48);
   c.beginPath();c.arc(0,0,.3,0,7);c.fillStyle=rg(c,-.1,-.1,0,.3,['#eef','#b0b8c4','#4a505c']);c.fill();c.strokeStyle='#111';c.lineWidth=.03;c.stroke();c.fillStyle='#e05050';rrect(c,-.09,-.09,.18,.18,.04);c.fill();}
  else{c.fillStyle=lg(c,0,-.08,0,.08,['#cfeaff','#5a9ac8','#1c3a58']);rrect(c,0,-.08,.66,.16,.05);c.fill();c.strokeStyle='#0a1828';c.lineWidth=.02;c.stroke();c.fillStyle='#bff';c.fillRect(.1,-.02,.48,.04);
   c.beginPath();c.moveTo(-.32,-.32);c.lineTo(.3,-.16);c.lineTo(.3,.16);c.lineTo(-.32,.32);c.closePath();c.fillStyle=lg(c,-.3,-.3,.3,.3,['#d0e4f2','#8aa4b8','#3a4a58']);c.fill();c.strokeStyle='#111';c.lineWidth=.03;c.stroke();c.fillStyle=TEAM;c.fillRect(-.22,-.05,.24,.1);}
 }),
 belt:()=>spr('belt',1,1,0,c=>{c.fillStyle='#15171c';c.fillRect(0,.14,1,.72);for(const y of[.06,.84]){c.fillStyle=lg(c,0,y,0,y+.1,['#a8b0bc','#5c6370','#2a2e36']);c.fillRect(0,y,1,.1);c.fillStyle='rgba(0,0,0,.5)';for(const x of[.2,.7]){c.beginPath();c.arc(x,y+.05,.022,0,7);c.fill();}c.fillStyle=TEAM;c.fillRect(.45,y+.035,.1,.03);}}),
};
function blitO(c,s,x,y,a,ox,oy){c.save();c.translate(x,y);c.rotate(a);c.drawImage(s.c,-ox-s.pad,-oy-s.pad,s.w+s.pad*2,s.h+s.pad*2);c.restore();}
// ===================== ЗДАНИЯ =====================
function drawBelt(c,b,icon,t){const cs=icon?0:beltCurve(b);c.save();c.translate(b.x+.5,b.y+.5);c.rotate(b.rot*Math.PI/2);
 if(cs){c.beginPath();c.rect(-.5,-.5,1,1);c.clip();const cy0=cs*.5;c.lineCap='butt';
  c.strokeStyle='#4f5662';c.lineWidth=.92;c.beginPath();c.arc(.5,cy0,.5,0,7);c.stroke();c.strokeStyle='#15171c';c.lineWidth=.7;c.stroke();
  c.strokeStyle='#8a929e';c.lineWidth=.03;c.beginPath();c.arc(.5,cy0,.86,0,7);c.stroke();c.beginPath();c.arc(.5,cy0,.14,0,7);c.stroke();
  c.strokeStyle='#3a3f48';c.lineWidth=.6;c.setLineDash([.06,.1]);c.lineDashOffset=-t*2.6*.8;c.beginPath();if(cs>0)c.arc(.5,cy0,.5,Math.PI,Math.PI*1.5);else c.arc(.5,cy0,.5,Math.PI,Math.PI/2,true);c.stroke();c.setLineDash([]);c.restore();
  for(const it of b.items){const th=Math.PI+cs*Math.min(1,it.p)*Math.PI/2;const lx=.5+.5*Math.cos(th),ly=cy0+.5*Math.sin(th);const d=DIRS[b.rot];drawItem(c,it.t,b.x+.5+d[0]*lx-d[1]*ly,b.y+.5+d[1]*lx+d[0]*ly,.17);}return;}
 blit(c,SPR.belt(),-.5,-.5);if(!icon)for(const sd of [1,-1]){const k=(b.rot+(sd>0?1:3))%4,n=bAt(b.x+DIRS[k][0],b.y+DIRS[k][1]);if(n&&n.t==='conveyor'&&n.x+DIRS[n.rot][0]===b.x&&n.y+DIRS[n.rot][1]===b.y){c.fillStyle='#4f5662';c.fillRect(-.3,sd*.36-.08,.6,.16);c.fillStyle='#15171c';c.fillRect(-.24,sd*.38-.05,.48,.12);}}const off=(t*2.6)%.2;c.fillStyle='#363a44';for(let i=-1;i<6;i++){const px=-.5+i*.2+off;if(px<-.5||px>.46)continue;c.fillRect(px,-.34,.06,.68);}
 c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.moveTo(.22,-.16);c.lineTo(.36,0);c.lineTo(.22,.16);c.lineTo(.16,.16);c.lineTo(.28,0);c.lineTo(.16,-.16);c.fill();c.restore();
 if(!icon)for(const it of b.items){const d=DIRS[b.rot];drawItem(c,it.t,b.x+.5+d[0]*(it.p-.5),b.y+.5+d[1]*(it.p-.5),.17);}else drawItem(c,'copper',b.x+.5,b.y+.5,.17);}
function sparks(x,y,col,n){if(!hq()||parts.length>500)return;for(let i=0;i<n;i++)parts.push({x:x+(Math.random()-.5)*.5,y:y+(Math.random()-.5)*.5,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,life:.5,max:.5,c:col,s:.05+Math.random()*.05,smoke:true});}
drawBlock=function(c,b,icon){const T=b.t,x=b.x,y=b.y,t=icon?0:now/1000;
 if(T==='conveyor')return drawBelt(c,b,icon,t);
 if(T==='core'){blit(c,SPR.core(),x-1,y-1);const p=.5+.5*Math.sin(t*3);blit(c,SPR.coreGem(),x-.1,y-.1,t*.4,.9+p*.08);if(!icon){glow(x+.5,y+.5,2.2+p*.5,'rgba(255,170,70,.5)');}return;}
 if(T==='drill'||T==='pdrill'){blit(c,SPR[T](),x,y);const ore=icon?'copper':ORE[terrain[y*MW+x]];const run=icon?0:(b.buf.length<5&&ore?1:0);
  blit(c,SPR.rotor(T==='pdrill'?4:3,ore?ITEMS[ore].c:'#888'),x+.15,y+.15+(T==='drill'?.02:0),t*(T==='pdrill'?9:6)*run);
  if(run&&Math.random()<.08)sparks(x+.5,y+.5,ore?ITEMS[ore].c+'aa':'#aaa',1);if(ore)drawItem(c,ore,x+.82,y+.18,.09);return;}
 if(T==='router'){blit(c,SPR.router(),x,y);if(b.buf&&b.buf[0])drawItem(c,b.buf[0].t,x+.5,y+.5,.15);return;}
 if(T==='unloader'){blit(c,SPR.unloader(),x,y);drawItem(c,b.sel||'copper',x+.5,y+.41,.13+(icon?0:.015*Math.sin(t*5)));if(!icon)glow(x+.5,y+.41,.5,'rgba(120,230,210,.35)');return;}
 if(T==='press'){blit(c,SPR.press(),x,y);const p=icon?.5:Math.abs(Math.sin(t*4))*(b.inp>=2?1:0);blit(c,SPR.pressHead(),x+.18,y+.16+p*.14);if(!icon&&b.out)drawItem(c,'graphite',x+.5,y+.74,.11);return;}
 if(T==='wall'||T==='lwall'||T==='twall'){blit(c,SPR[T](),x,y);return;}
 if(B[T].turret){blit(c,SPR.tbase(T),x,y);const rec=b.flash>0?-.1*Math.min(1,b.flash*8):0;const a=b.ang||0;blitO(c,SPR.thead(T),x+.5+Math.cos(a)*rec,y+.5+Math.sin(a)*rec,a,.5,.5);
  if(T==='lancer'&&b.charge>0&&!icon){const ex=x+.5+Math.cos(a)*.62,ey=y+.5+Math.sin(a)*.62;c.fillStyle=`rgba(170,235,255,${b.charge})`;c.beginPath();c.arc(ex,ey,.06+.1*b.charge,0,7);c.fill();glow(ex,ey,.5+b.charge,'rgba(120,210,255,.8)');}
  if(!icon&&B[T].ammo){const cap=B[T].cap,f=Math.max(0,Math.min(1,b.ammo/cap));c.fillStyle='rgba(0,0,0,.6)';c.fillRect(x+.12,y+.04,.76,.07);c.fillStyle=f<.25?'#ff6a4a':'#ffc85a';c.fillRect(x+.13,y+.05,.74*f,.05);}
  if(!icon&&B[T].ammo&&b.ammo<=0)noAmmo(c,x+.5,y-.2,t,T);if(!icon&&B[T].use&&b.pw<.5)noPow(c,x+.5,y-.05,t);return;}
 drawBlock2(c,b,icon,x,y,t);};
drawBlock2=function(c,b,icon,x,y,t){const T=b.t;
 if(T==='generator'){blit(c,SPR.generator(),x,y);const on=icon||b.fuel>0;const fl=.75+.25*Math.sin(t*23)*Math.sin(t*7);c.beginPath();c.arc(x+.5,y+.56,.18,0,7);c.fillStyle=on?rg(c,x+.5,y+.56,0,.2,['#fff4c0',`rgba(255,${150+60*fl|0},40,1)`,'#802000']):'#1a1410';c.fill();
  if(on&&!icon){glow(x+.5,y+.56,1.1*fl,'rgba(255,150,50,.55)');if(hq()&&Math.random()<.06)parts.push({x:x+.73,y:y+.12,vx:.1,vy:-.35,life:1.2,max:1.2,c:'#55555588',s:.18,smoke:true});}}
 else if(T==='node'){blit(c,SPR.node(),x,y);const p=.6+.4*Math.sin(t*4+x);c.fillStyle=rg(c,x+.5,y+.5,0,.13,['#fff','#f5d04a','#806010']);c.beginPath();c.arc(x+.5,y+.5,.12,0,7);c.fill();if(!icon)glow(x+.5,y+.5,.55*p,'rgba(255,220,80,.5)');}
 else if(T==='battery'){blit(c,SPR.battery(),x,y);const f=icon?.7:b.st/B.battery.store;const h=.66*f;c.fillStyle=lg(c,x+.2,0,x+.8,0,['#3a8a3a','#8cf08a','#3a8a3a']);c.fillRect(x+.22,y+.18+.66-h,.56,h);c.fillStyle='rgba(255,255,255,.15)';for(let i=1;i<4;i++)c.fillRect(x+.22,y+.18+i*.165,.56,.015);}
 else if(T==='smelter'){blit(c,SPR.smelter(),x,y);const on=icon||(b.pw>.05&&b.inp>0&&b.inp2>1);if(on){const fl=.8+.2*Math.sin(t*11);c.beginPath();c.arc(x+.5,y+.5,.2,0,7);c.fillStyle=rg(c,x+.5,y+.5,0,.2,['#fffbe0','#ffb040','#c03000']);c.fill();
   if(!icon){glow(x+.5,y+.5,1.3*fl,'rgba(255,140,40,.6)');if(hq()&&Math.random()<.05)parts.push({x:x+.5,y:y+.3,vx:(Math.random()-.5)*.2,vy:-.4,life:1.4,max:1.4,c:'#66606088',s:.2,smoke:true});}}
  if(b.out&&!icon)drawItem(c,'silicon',x+.5,y+.5,.12);}
 else if(T==='factory'){blit(c,SPR.factory(),x,y);const p=icon?.5:b.prog||0;const ax=x+.2+.6*(.5+.5*Math.sin(t*3));c.strokeStyle='#c8ced8';c.lineWidth=.05;c.beginPath();c.moveTo(ax,y+.14);c.lineTo(ax,y+.3);c.stroke();c.fillStyle=TEAM;c.fillRect(ax-.05,y+.28,.1,.05);
  c.save();c.translate(x+.5,y+.63);c.fillStyle='#7fd8ff';c.globalAlpha*=.4+.6*p;c.beginPath();c.moveTo(.2,0);c.lineTo(-.16,-.14);c.lineTo(-.08,0);c.lineTo(-.16,.14);c.closePath();c.fill();c.restore();if(!icon){c.fillStyle='#f0c040';c.fillRect(x+.12,y+.9,.76*p,.04);}}
 else if(T==='dronepad'){blit(c,SPR.dronepad(),x,y);const on=Math.sin(t*4)>0;c.fillStyle=on?'#ff5040':'#401010';for(const[a,bq]of[[.14,.14],[.86,.14],[.14,.86],[.86,.86]]){c.beginPath();c.arc(x+a,y+bq,.04,0,7);c.fill();}}
 else if(T==='mender'){blit(c,SPR.mender(),x,y);const on=icon||b.pw>.05;const p=.5+.5*Math.sin(t*3);c.fillStyle=on?'#7cf07a':'#2a4a2a';c.fillRect(x+.42,y+.3,.16,.4);c.fillRect(x+.3,y+.42,.4,.16);
  if(on&&!icon){glow(x+.5,y+.5,.8,'rgba(120,255,120,.4)');c.strokeStyle=`rgba(120,255,120,${.35*(1-((t*.6)%1))})`;c.lineWidth=.04;c.beginPath();c.arc(x+.5,y+.5,B.mender.range*((t*.6)%1),0,7);c.stroke();}}
 if(!icon&&B[T].use&&b.pw<.5)noPow(c,x+.5,y-.05,t);};
// маркер «нет патронов»: пульсирующая иконка нужного ресурса + подсказка
noAmmo=function(c,x,y,t,tt){const p=.5+.5*Math.sin(t*6);const it=tt&&B[tt].ammo?Object.keys(B[tt].ammo)[0]:'copper';
 c.globalAlpha=.65+.35*p;c.beginPath();c.arc(x,y,.26+p*.04,0,7);c.fillStyle='rgba(40,8,8,.85)';c.fill();c.strokeStyle='#ff5a4a';c.lineWidth=.04;c.stroke();drawItem(c,it,x,y,.12+p*.02);c.globalAlpha=1;
 if(cam.z>=22){const s=T('needBelt').replace('{0}',T('i_'+it).toLowerCase());c.font='600 .22px system-ui,sans-serif';c.textAlign='center';c.textBaseline='bottom';const w=c.measureText(s).width;
  c.fillStyle='rgba(10,12,16,.78)';rrect(c,x-w/2-.08,y-.62,w+.16,.3,.08);c.fill();c.fillStyle='#ffd27a';c.fillText(s,x,y-.35);}};
noPow=function(c,x,y,t){const p=.5+.5*Math.sin(t*6);c.globalAlpha=.6+.4*p;c.beginPath();c.arc(x,y,.22,0,7);c.fillStyle='rgba(40,30,0,.85)';c.fill();c.strokeStyle='#ffd23a';c.lineWidth=.035;c.stroke();c.fillStyle='#ffd23a';c.beginPath();c.moveTo(x+.04,y-.15);c.lineTo(x-.09,y+.03);c.lineTo(x,y+.03);c.lineTo(x-.04,y+.15);c.lineTo(x+.09,y-.03);c.lineTo(x,y-.03);c.closePath();c.fill();c.globalAlpha=1;};
// ===================== ВРАГИ И ЮНИТЫ =====================
function enemyBody(k,flash){const E=ENEMY[k],r=E.r,sz=r*3;return spr('en'+k+(flash?'f':''),sz,sz,.15,c=>{c.translate(sz/2,sz/2);const col=flash?'#ffffff':E.c;const dk=flash?'#ffffff':shade(E.c,-.55);
 c.lineJoin='round';c.lineWidth=.05;c.strokeStyle=flash?'#fff':'#14080a';
 if(E.fly){c.beginPath();c.moveTo(r*1.3,0);c.lineTo(-r*.2,-r*.4);c.lineTo(-r,-r*1.25);c.lineTo(-r*.6,-r*.1);c.lineTo(-r*.6,r*.1);c.lineTo(-r,r*1.25);c.lineTo(-r*.2,r*.4);c.closePath();
  c.fillStyle=flash?'#fff':lg(c,0,-r,0,r,[shade(E.c,.35),E.c,dk]);c.fill();c.stroke();if(!flash){c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo(r*1.1,0);c.lineTo(-r*.2,-r*.3);c.lineTo(-r*.7,-r*.9);c.lineTo(-r*.1,-r*.1);c.closePath();c.fill();
  c.fillStyle=rg(c,r*.35,0,0,r*.25,['#fff','#9ff','#08a']);c.beginPath();c.ellipse(r*.35,0,r*.22,r*.12,0,0,7);c.fill();}}
 else if(k==='crawler'){c.beginPath();c.arc(0,0,r,0,7);c.fillStyle=flash?'#fff':rg(c,-r*.3,-r*.3,0,r,[shade(E.c,.4),E.c,dk]);c.fill();c.stroke();if(!flash){c.fillStyle='#ffe060';c.beginPath();c.arc(r*.3,0,r*.3,0,7);c.fill();}}
 else{const bs=E.boss?1.15:1;c.beginPath();c.moveTo(r*1.15*bs,0);c.lineTo(r*.3,-r*.8);c.lineTo(-r*.8,-r*.75);c.lineTo(-r*.55,0);c.lineTo(-r*.8,r*.75);c.lineTo(r*.3,r*.8);c.closePath();
  c.fillStyle=flash?'#fff':lg(c,0,-r,0,r,[shade(E.c,.35),E.c,dk]);c.fill();c.stroke();
  if(!flash){c.fillStyle='rgba(0,0,0,.3)';c.fillRect(-r*.5,-r*.06,r*.9,r*.12);plate(c,-r*.45,-r*.45,r*.7,r*.9,r*.15,E.c,{});
   c.fillStyle=rg(c,r*.55,0,0,r*.25,['#fff','#ffe28a','#c06010']);c.beginPath();c.arc(r*.55,0,r*.18,0,7);c.fill();
   if(E.boss){c.fillStyle='#ff4030';for(const o of[-.5,.5]){c.beginPath();c.arc(-r*.1,o*r,r*.12,0,7);c.fill();}}}}});}
const LEG='#24242a';
drawEnemy=function(c,e){const r=e.r,k=e.type||e.k||e.t;const E=ENEMY[k]?k:Object.keys(ENEMY).find(q=>ENEMY[q].c===e.c&&!ENEMY[q].fly)||'dagger';
 c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(e.x+.06,e.y+.12,r*1.15,r*.8,0,0,7);c.fill();
 c.save();c.translate(e.x,e.y);c.rotate(e.ang);const lgw=Math.sin(e.walk)*r*.5;
 if(E!=='crawler'){c.fillStyle=LEG;rrect(c,-r*.6+lgw,-r*1.08,r*1.1,r*.36,r*.1);c.fill();rrect(c,-r*.6-lgw,r*.72,r*1.1,r*.36,r*.1);c.fill();c.fillStyle='#4a4a54';c.fillRect(-r*.5+lgw,-r*1.02,r*.8,r*.08);c.fillRect(-r*.5-lgw,r*.78,r*.8,r*.08);}
 else{c.strokeStyle=LEG;c.lineWidth=.04;for(let i=0;i<3;i++){const o=Math.sin(e.walk+i*2)*r*.25;c.beginPath();c.moveTo((i-1)*r*.5,0);c.lineTo((i-1)*r*.5+o,-r*1.2);c.moveTo((i-1)*r*.5,0);c.lineTo((i-1)*r*.5-o,r*1.2);c.stroke();}}
 c.restore();const s=enemyBody(E,e.hit>0);blit(c,s,e.x-s.w/2,e.y-s.h/2,e.ang);
 if(E==='crawler'&&Math.sin(now/90)>.6)glow(e.x,e.y,.6,'rgba(255,200,60,.6)');if(ENEMY[E].boss)glow(e.x,e.y,r*2.2,'rgba(255,60,40,.35)');
 hpBar(c,e.x,e.y-r-.28,r*2,e.hp/e.max,'#ff5a4a');};
function hpBar(c,cx,y,w,f,col){if(f>=1)return;c.fillStyle='rgba(0,0,0,.65)';rrect(c,cx-w/2-.02,y-.02,w+.04,.13,.04);c.fill();c.fillStyle=lg(c,0,y,0,y+.09,[shade(col,.3),col]);c.fillRect(cx-w/2,y,w*Math.max(0,f),.09);}
drawFly=function(c,e){const k=ENEMY[e.type]?e.type:'flare';const r=e.r,bob=Math.sin(now/250+e.x)*.05;
 c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(e.x+.45,e.y+.65,r*1.1,r*.6,0,0,7);c.fill();
 const s=enemyBody(k,e.hit>0);blit(c,s,e.x-s.w/2,e.y-s.h/2+bob,e.ang,1+bob);
 const bx=e.x-Math.cos(e.ang)*r*.8,by=e.y-Math.sin(e.ang)*r*.8+bob;c.fillStyle=rg(c,bx,by,0,r*.4,['#fff','#ff90f0','rgba(255,80,220,0)']);c.beginPath();c.arc(bx,by,r*.4,0,7);c.fill();glow(bx,by,r*1.4,'rgba(255,100,230,.45)');
 hpBar(c,e.x,e.y-r-.3,r*2,e.hp/e.max,'#e05ae0');};
function unitSpr(k){return spr('u'+k,.7,.6,.1,c=>{c.translate(.3,.3);const col=k==='drone'?'#7fd8ff':'#e8d040';c.beginPath();c.moveTo(.32,0);c.lineTo(-.2,-.26);c.lineTo(-.1,0);c.lineTo(-.2,.26);c.closePath();
 c.fillStyle=lg(c,0,-.25,0,.25,[shade(col,.4),col,shade(col,-.5)]);c.fill();c.strokeStyle='#0a1418';c.lineWidth=.03;c.stroke();c.fillStyle=TEAM;c.fillRect(-.12,-.04,.12,.08);});}
drawUnits=function(c){for(const u of G.units){if(u.heal){c.strokeStyle='rgba(140,255,140,.6)';c.lineWidth=.05;c.beginPath();c.moveTo(u.x,u.y);c.lineTo(u.heal.x+.5,u.heal.y+.5);c.stroke();glow(u.heal.x+.5,u.heal.y+.5,.6,'rgba(120,255,120,.5)');}
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(u.x+.3,u.y+.45,.2,.12,0,0,7);c.fill();const s=unitSpr(u.k);blitO(c,s,u.x,u.y,u.ang||0,.3,.3);
 glow(u.x-Math.cos(u.ang||0)*.2,u.y-Math.sin(u.ang||0)*.2,.4,u.k==='drone'?'rgba(120,220,255,.6)':'rgba(255,230,90,.6)');}};
// ===================== ЭФФЕКТЫ И ГЛАВНЫЙ РЕНДЕР =====================
const _explode=explode;explode=function(x,y,r,c){_explode(x,y,r,c);GFX.fx.push({x,y,r:r*1.6+.6,t0:now,life:380+r*120});if(hq()&&parts.length<600)for(let i=0;i<4*r;i++)parts.push({x:x+(Math.random()-.5)*r*.6,y:y+(Math.random()-.5)*r*.6,vx:(Math.random()-.5)*.4,vy:-.2-Math.random()*.3,life:1+Math.random()*.6,max:1.6,c:'#3c3a3a99',s:.25+Math.random()*.25,smoke:true});};
if(typeof dmgB==='function'){const _d=dmgB;dmgB=function(b,...a){b.hitAt=now;return _d(b,...a);};}
function vignette(w,h){const k=w+'x'+h;if(GFX.vigK===k)return GFX.vig;const v=mkCanvas(w,h),c=v.getContext('2d');const g=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.hypot(w,h)*.6);g.addColorStop(0,'rgba(0,0,8,0)');g.addColorStop(1,'rgba(0,0,10,.55)');c.fillStyle=g;c.fillRect(0,0,w,h);GFX.vig=v;GFX.vigK=k;return v;}
function menuVisible(){const m=document.getElementById('scrMain'),l=document.getElementById('scrLevels');return !G||(m&&!m.classList.contains('hide'))||(l&&!l.classList.contains('hide'));}
let MB=null;function drawMenuBg(c){const w=cv.width,h=cv.height,t=now/1000;
 if(!MB){MB={st:[],sh:[]};for(let i=0;i<70;i++)MB.st.push([Math.random(),Math.random(),Math.random()*.8+.2]);for(let i=0;i<5;i++)MB.sh.push([Math.random(),Math.random(),Math.random()*Math.PI*2]);}
 c.setTransform(1,0,0,1,0,0);c.fillStyle=lg(c,0,0,0,h,['#0b0e16','#141a26','#1d1610']);c.fillRect(0,0,w,h);
 const u=Math.min(w,h)/10;c.save();c.translate(w/2,h*.62);c.rotate(-.12);c.strokeStyle='rgba(240,160,64,.08)';c.lineWidth=1;const o=(t*u*.3)%u;
 for(let i=-14;i<=14;i++){c.beginPath();c.moveTo(i*u+o,-h);c.lineTo(i*u+o,h);c.stroke();c.beginPath();c.moveTo(-w,i*u+o);c.lineTo(w,i*u+o);c.stroke();}c.restore();
 for(const s of MB.st){const a=.3+.7*Math.abs(Math.sin(t*s[2]+s[0]*9));c.fillStyle=`rgba(200,220,255,${a*.6})`;c.fillRect(s[0]*w,s[1]*h*.7,1.5*DPR,1.5*DPR);}
 // силуэт ядра и вращающиеся турели
 c.save();c.translate(w*.5,h*.72);const k=u*1.2;c.scale(k,k);blit(c,SPR.core(),-1.5,-1.5);blit(c,SPR.coreGem(),-.6,-.6,t*.4,.95+.05*Math.sin(t*3));
 for(const[i,dx]of[[0,-3.2],[1,2.2]]){blit(c,SPR.tbase('duo'),dx,-.5);const a=-Math.PI/2+Math.sin(t*.8+i*2)*.9;blitO(c,SPR.thead(i?'hail':'duo'),dx+.5,0,a,.5,.5);}
 c.globalCompositeOperation='lighter';c.drawImage(glowSpr('rgba(255,170,70,.55)'),-3,-3,6,6);c.restore();
 for(const s of MB.sh){s[0]+=.0009;if(s[0]>1.1)s[0]=-.1;c.save();c.translate(s[0]*w,s[1]*h*.5+30);c.rotate(.1);c.scale(u*1.6,u*1.6);const sp=enemyBody('flare',false);c.globalAlpha=.55;blit(c,sp,-sp.w/2,-sp.h/2);c.restore();}
 c.drawImage(vignette(w,h),0,0);c.globalCompositeOperation='source-over';}
draw=function(){const c=ctx;c.setTransform(1,0,0,1,0,0);
 if(!ICON.copper)mkIcons();
 const mv=menuVisible();document.body.classList.toggle('inmenu',mv);if(mv){drawMenuBg(c);return;}
 c.fillStyle='#0d0f13';c.fillRect(0,0,cv.width,cv.height);GLQ=[];
 const sh=S.shake!==false?(G.shake||0):0,ox=(Math.random()-.5)*sh,oy=(Math.random()-.5)*sh;
 const z=cam.z*DPR;c.setTransform(z,0,0,z,DPR*W/2-(cam.x+ox)*z,DPR*H/2-(cam.y+oy)*z);c.imageSmoothingEnabled=true;
 const x0=Math.floor(cam.x-W/2/cam.z)-1,x1=Math.ceil(cam.x+W/2/cam.z)+1,y0=Math.floor(cam.y-H/2/cam.z)-1,y1=Math.ceil(cam.y+H/2/cam.z)+1;
 if(!GFX.chunks.length&&terrain)renderMap();
 for(const k of GFX.chunks)if(k.x<=x1&&k.x+k.w>=x0&&k.y<=y1&&k.y+k.h>=y0)c.drawImage(k.c,k.x,k.y,k.w,k.h);
 for(const s of G.spawns){const p=.5+.5*Math.sin(now/300),cx=s.x+.5,cy=s.y+.5;c.fillStyle=rg(c,cx,cy,0,1.6,['rgba(255,60,60,.35)','rgba(120,0,0,.15)','rgba(0,0,0,0)']);c.beginPath();c.arc(cx,cy,1.6,0,7);c.fill();
  c.strokeStyle=`rgba(255,80,70,${.5+p*.4})`;c.lineWidth=.07;c.setLineDash([.3,.2]);c.lineDashOffset=now/400;c.beginPath();c.arc(cx,cy,1.2+p*.2,0,7);c.stroke();c.setLineDash([]);glow(cx,cy,2.2,'rgba(255,50,40,.35)');}
 const vis=b=>b.x>=x0&&b.x<=x1&&b.y>=y0&&b.y<=y1;
 for(const b of G.blds)if(b.t==='conveyor'&&vis(b))drawBlock(c,b);
 if(G.plinks.length){c.lineCap='round';for(const[a,o]of G.plinks){c.strokeStyle='rgba(255,220,90,.25)';c.lineWidth=.14;c.beginPath();c.moveTo(a.x+.5,a.y+.5);c.lineTo(o.x+.5,o.y+.5);c.stroke();c.strokeStyle='rgba(255,240,170,.85)';c.lineWidth=.035;c.stroke();}c.lineCap='butt';}
 for(const b of G.blds)if(b.t!=='conveyor'&&vis(b)){drawBlock(c,b);if(b.hitAt&&now-b.hitAt<120){c.fillStyle='rgba(255,255,255,.35)';c.fillRect(b.x+.05,b.y+.05,.9,.9);}
  if(b.lv>1){for(let i=1;i<b.lv;i++){c.fillStyle='#f0c040';c.beginPath();c.moveTo(b.x+.1+i*.14-.14,b.y+.2);c.lineTo(b.x+.15+i*.14-.14,b.y+.12);c.lineTo(b.x+.2+i*.14-.14,b.y+.2);c.fill();}}
  if(b.hp<mhp(b))hpBar(c,b.x+.5,b.y+.88,.8,b.hp/mhp(b),'#5ad65a');}
 drawBlock(c,G.coreB);const cb=G.coreB;hpBar(c,cb.x+.5,cb.y+2.1,3,cb.hp/B.core.hp-1e-9,'#f0a040');
 for(const e of enemies)if(!e.fly)drawEnemy(c,e);drawUnits(c);for(const e of enemies)if(e.fly)drawFly(c,e);
 for(const g of rings){c.strokeStyle=`rgba(${g.c},${g.life*1.6})`;c.lineWidth=.1;c.beginPath();c.arc(g.x,g.y,g.r*(1.2-g.life),0,7);c.stroke();}
 for(const b of bullets){if(b.art){const k=b.t/b.T,hgt=Math.sin(k*Math.PI)*1.2;c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(b.x,b.y,.12,.08,0,0,7);c.fill();c.fillStyle=rg(c,b.x-.04,b.y-hgt-.04,0,.15,['#fff6c0','#ffb040','#a04010']);c.beginPath();c.arc(b.x,b.y-hgt,.14,0,7);c.fill();glow(b.x,b.y-hgt,.6,'rgba(255,180,60,.6)');}
  else{c.lineCap='round';c.strokeStyle=b.col;c.lineWidth=.1;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.vx*.03,b.y-b.vy*.03);c.stroke();c.strokeStyle='#fff';c.lineWidth=.04;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.vx*.012,b.y-b.vy*.012);c.stroke();c.lineCap='butt';if(b.home)glow(b.x,b.y,.4,'rgba(120,220,255,.6)');}}
 for(const f of flashes){c.save();c.translate(f.x,f.y);c.rotate(f.a);c.fillStyle='#fff8c8';c.beginPath();c.moveTo(0,-.13*f.s);c.lineTo(.5*f.s,0);c.lineTo(0,.13*f.s);c.closePath();c.fill();c.restore();glow(f.x,f.y,.7*f.s,'rgba(255,190,80,.8)');}
 for(const bm of beams){c.lineCap='round';c.strokeStyle=`rgba(120,210,255,${bm.life*3})`;c.lineWidth=.3*bm.life*4;c.beginPath();c.moveTo(bm.x1,bm.y1);c.lineTo(bm.x2,bm.y2);c.stroke();c.strokeStyle=`rgba(255,255,255,${bm.life*4})`;c.lineWidth=.07;c.stroke();c.lineCap='butt';glow(bm.x2,bm.y2,1.2,'rgba(120,210,255,.8)');glow((bm.x1+bm.x2)/2,(bm.y1+bm.y2)/2,1,'rgba(120,210,255,.4)');}
 for(const p of parts){const a=Math.max(0,p.life/p.max);c.globalAlpha=a;if(p.smoke){const s=p.s*(2-p.life);c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,s/2,0,7);c.fill();}else{c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,p.s*.6,0,7);c.fill();}}c.globalAlpha=1;
 // свечение (аддитивно)
 c.globalCompositeOperation='lighter';
 GFX.fx=GFX.fx.filter(f=>now-f.t0<f.life);for(const f of GFX.fx){const k=1-(now-f.t0)/f.life;if(hq()){c.globalAlpha=k;c.drawImage(glowSpr('rgba(255,170,70,.9)'),f.x-f.r*1.5,f.y-f.r*1.5,f.r*3,f.r*3);}c.globalAlpha=k*.8;c.strokeStyle='rgba(255,220,150,1)';c.lineWidth=.08*k;c.beginPath();c.arc(f.x,f.y,f.r*(1.3-k),0,7);c.stroke();}c.globalAlpha=1;
 for(let i=0;i<GLQ.length;i+=4){const r=GLQ[i+2];c.drawImage(glowSpr(GLQ[i+3]),GLQ[i]-r,GLQ[i+1]-r,r*2,r*2);}
 for(const p of parts)if(!p.smoke&&hq()){c.globalAlpha=Math.max(0,p.life/p.max)*.5;c.drawImage(glowSpr('rgba(255,200,100,.7)'),p.x-p.s*2,p.y-p.s*2,p.s*4,p.s*4);}c.globalAlpha=1;
 c.globalCompositeOperation='source-over';
 // предпросмотр размещения
 if(hover&&(tool||delMode)){const hx=Math.floor(hover[0]),hy=Math.floor(hover[1]);if(tool){const ok=canPlace(tool,hx,hy)&&afford(B[tool].cost);c.fillStyle=ok?'rgba(110,255,130,.12)':'rgba(255,80,80,.15)';c.fillRect(hx,hy,1,1);c.globalAlpha=.6;drawBlock(c,{...newB(tool,hx,hy,rot),ang:Math.PI*rot/2},true);c.globalAlpha=1;
  if(tool==='node'){c.strokeStyle='#f5d04a55';c.lineWidth=.04;for(const o of G.blds)if(isPow(o.t)&&Math.hypot(o.x-hx,o.y-hy)<=B.node.range){c.beginPath();c.moveTo(hx+.5,hy+.5);c.lineTo(o.x+.5,o.y+.5);c.stroke();}}
  c.strokeStyle=ok?'#7f7':'#f55';c.lineWidth=.06;c.strokeRect(hx,hy,1,1);if(tool==='conveyor'){c.globalAlpha=.9;arrow(c,hx,hy,rot,ok?'#ffffffcc':'#ff8080cc');c.globalAlpha=1;}
  if(B[tool].range){c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=.04;c.setLineDash([.25,.15]);c.beginPath();c.arc(hx+.5,hy+.5,B[tool].range,0,7);c.stroke();c.setLineDash([]);}}
  else{c.fillStyle='rgba(255,60,60,.2)';c.fillRect(hx,hy,1,1);c.strokeStyle='#f55';c.lineWidth=.08;c.strokeRect(hx,hy,1,1);}}
 if(sel&&!sel.core){const p=.5+.5*Math.sin(now/200);c.strokeStyle=`rgba(255,200,70,${.7+.3*p})`;c.lineWidth=.06;rrect(c,sel.x-.04,sel.y-.04,1.08,1.08,.12);c.stroke();if(B[sel.t].range){c.fillStyle='rgba(240,192,64,.06)';c.strokeStyle='rgba(240,192,64,.4)';c.lineWidth=.04;c.beginPath();c.arc(sel.x+.5,sel.y+.5,B[sel.t].range,0,7);c.fill();c.stroke();}if(sel.t==='conveyor')arrow(c,sel.x,sel.y,sel.rot,'#f0c040cc');}
 // экранные эффекты
 c.setTransform(1,0,0,1,0,0);if(hq())c.drawImage(vignette(cv.width,cv.height),0,0);};
// иконки ресурсов в HTML-интерфейсе
mkIcons();
