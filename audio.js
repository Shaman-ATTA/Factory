'use strict';
// Процедурный звук и музыка на WebAudio. Стартует после первого касания (ограничение автозапуска на мобильных).
const SND=(()=>{let ac=null,sfxG,musG,humG,humF,vol={music:.5,sfx:.7},nb,last={},musT=null,step=0,nextT=0;
 function init(){if(ac){if(ac.state==='suspended')ac.resume();return;}const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=new A();
  const comp=ac.createDynamicsCompressor();comp.connect(ac.destination);sfxG=ac.createGain();musG=ac.createGain();sfxG.connect(comp);musG.connect(comp);
  nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=nb.getChannelData(0);let b=0;for(let i=0;i<d.length;i++){d[i]=Math.random()*2-1;}
  // гул фабрики: коричневый шум через НЧ-фильтр
  const bn=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate),bd=bn.getChannelData(0);for(let i=0;i<bd.length;i++){b=(b+.02*(Math.random()*2-1))/1.02;bd[i]=b*3.5;}
  const hs=ac.createBufferSource();hs.buffer=bn;hs.loop=true;humF=ac.createBiquadFilter();humF.type='lowpass';humF.frequency.value=180;humG=ac.createGain();humG.gain.value=0;
  const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=55;const og=ac.createGain();og.gain.value=.04;o.connect(og);og.connect(humF);
  hs.connect(humF);humF.connect(humG);humG.connect(sfxG);hs.start();o.start();setVol(vol);startMusic();}
 function setVol(v){Object.assign(vol,v);if(!ac)return;sfxG.gain.value=vol.sfx;musG.gain.value=vol.music*.5;}
 const t0=()=>ac.currentTime;
 function tone(f,dur,type,g,f2,dst,when){const t=when||t0();const o=ac.createOscillator(),e=ac.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(g,t+.005);e.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(e);e.connect(dst||sfxG);o.start(t);o.stop(t+dur+.02);}
 function noise(dur,g,freq,q,type,dst,f2){const t=t0();const s=ac.createBufferSource();s.buffer=nb;s.playbackRate.value=.5+Math.random();const f=ac.createBiquadFilter();f.type=type||'lowpass';f.frequency.setValueAtTime(freq,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+dur);f.Q.value=q||1;
  const e=ac.createGain();e.gain.setValueAtTime(g,t);e.gain.exponentialRampToValueAtTime(.0005,t+dur);s.connect(f);f.connect(e);e.connect(dst||sfxG);s.start(t,Math.random());s.stop(t+dur+.02);}
 function lim(k,ms){const n=performance.now();if(last[k]&&n-last[k]<ms)return false;last[k]=n;return true;}
 const fx={
  duo(){if(lim('duo',55)){tone(420+Math.random()*60,.06,'square',.06,180);noise(.05,.08,3000,1,'highpass');}},
  hail(){if(lim('hail',120)){tone(120,.25,'sine',.25,40);noise(.18,.2,700);}},
  laser(){if(lim('las',80)){tone(1600,.35,'sawtooth',.08,120);tone(800,.3,'sine',.1,300);}},
  aa(){if(lim('aa',60)){tone(900,.05,'triangle',.06,500);}},
  boom(s){if(lim('boom',40)){noise(.3+s*.25,Math.min(.7,.25+s*.15),900+s*200,1,'lowpass',null,60);tone(80,.3+s*.1,'sine',.3,30);}},
  hit(){if(lim('hit',70))noise(.05,.05,2000,2,'bandpass');},
  build(){if(lim('build',45)){tone(520,.07,'triangle',.12);tone(780,.09,'triangle',.1,null,null,t0()+.05);}},
  remove(){if(lim('rm',60))tone(400,.12,'triangle',.1,150);},
  error(){if(lim('err',200)){tone(140,.18,'square',.1);tone(110,.2,'square',.08,null,null,t0()+.09);}},
  click(){if(lim('cl',30))tone(900,.03,'triangle',.06);},
  horn(){const t=t0();[0,.05].forEach((d,i)=>{const o=ac.createOscillator(),f=ac.createBiquadFilter(),e=ac.createGain();o.type='sawtooth';o.frequency.setValueAtTime(98*(i?1.5:1),t);o.frequency.linearRampToValueAtTime(110*(i?1.5:1),t+.4);
   f.type='lowpass';f.frequency.value=900;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.18,t+.25);e.gain.setValueAtTime(.18,t+1.1);e.gain.exponentialRampToValueAtTime(.001,t+1.7);o.connect(f);f.connect(e);e.connect(sfxG);o.start(t+d);o.stop(t+1.8);});},
  win(){[523,659,784,1046].forEach((f,i)=>tone(f,.35,'triangle',.15,null,null,t0()+i*.13));},
  lose(){[392,330,262,196].forEach((f,i)=>tone(f,.5,'sawtooth',.09,null,null,t0()+i*.22));}};
 function play(n,a){if(!ac||ac.state!=='running'||!vol.sfx)return;try{fx[n]&&fx[n](a||0);}catch(e){}}
 function hum(level){if(humG)humG.gain.setTargetAtTime(Math.min(.25,level*.012),ac.currentTime,.5);}
 // генеративная музыка: ля-минор пентатоника, бас + арпеджио + пэд
 const SC=[0,3,5,7,10];const CH=[[0,7],[-4,3],[-7,0],[-2,5]];let tension=0;
 function startMusic(){const bpm=84,s16=60/bpm/4;nextT=t0()+.1;musT=setInterval(()=>{if(!ac)return;while(nextT<t0()+.3){sched(step,nextT);nextT+=s16;step++;}},100);
  function sched(i,t){if(vol.music<=0)return;const bar=Math.floor(i/16)%4,ch=CH[bar],p=i%16;const root=57+ch[0];const mf=n=>440*Math.pow(2,(n-69)/12);
   if(p===0){tone(mf(root-24),1.6,'triangle',.22,null,musG,t);[0,3+(bar===1?1:0),7].forEach(k=>tone(mf(root+k),2.6,'sine',.035,null,musG,t));}
   if(p===8)tone(mf(root-24+(Math.random()<.5?7:12)),.7,'triangle',.15,null,musG,t);
   if(p%2===0&&Math.random()<.55+tension*.3){const n=root+12+SC[(Math.random()*5)|0]+(Math.random()<.3?12:0);tone(mf(n),.25,'square',.018,null,musG,t);}
   if(tension>.3&&(p===4||p===12))noiseAt(t);}
  function noiseAt(t){const s=ac.createBufferSource();s.buffer=nb;const f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=6000;const e=ac.createGain();e.gain.setValueAtTime(.05*tension,t);e.gain.exponentialRampToValueAtTime(.001,t+.08);s.connect(f);f.connect(e);e.connect(musG);s.start(t);s.stop(t+.1);}}
 return{init,setVol,play,hum,set tension(v){tension=v},get ready(){return !!ac}};})();
