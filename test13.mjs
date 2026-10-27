import {chromium} from 'playwright';
const b=await chromium.launch();
for(const [name,vp] of [['portrait',{width:412,height:915}],['landscape',{width:915,height:412}]]){
const p=await (await b.newContext({viewport:vp,isMobile:true,hasTouch:true})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8091/');await p.waitForTimeout(900);
const P=name==='portrait';if(P)await p.screenshot({path:'/workspace/ff_title.png'});
await p.evaluate(()=>show('scrCredits',true));await p.waitForTimeout(200);if(P)await p.screenshot({path:'/workspace/ff_about.png'});
const ab=await p.evaluate(()=>document.body.innerText.includes('Mindustry'));
await p.evaluate(()=>openWiki());await p.waitForTimeout(400);if(P)await p.screenshot({path:'/workspace/ff_wiki.png'});
const nw=await p.evaluate(()=>document.querySelectorAll('.wk').length);
await p.evaluate(()=>{const e=document.getElementById('wk_lancer');document.getElementById('wBody').scrollTop=e.offsetTop-80;});await p.waitForTimeout(150);if(P)await p.screenshot({path:'/workspace/ff_wiki2.png'});
await p.evaluate(()=>show('scrSettings',true));await p.waitForTimeout(200);if(P)await p.screenshot({path:'/workspace/ff_settings.png'});
await p.selectOption('select[data-k="lang"]','en');await p.waitForTimeout(300);
const en=await p.evaluate(()=>[LANG,document.querySelector('#scrSettings h2').textContent,JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith('settings')))).lang]);
if(P)await p.screenshot({path:'/workspace/ff_settings_en.png'});
await p.evaluate(()=>openWiki('frost'));await p.waitForTimeout(300);if(P)await p.screenshot({path:'/workspace/ff_wiki_en.png'});
await p.reload();await p.waitForTimeout(800);const persist=await p.evaluate(()=>[LANG,$('mWiki').textContent,document.title]);
if(P)await p.screenshot({path:'/workspace/ff_title_en.png'});
const g=await p.evaluate(()=>{__f.start(0);__f.G.tut=-1;tool='duo';updTools();return !!document.getElementById('tipWiki');});
console.log(name,{ab,nw,en,persist,g,errs});
await p.evaluate(()=>{S.lang='ru';saveSettings();});}
await b.close();
