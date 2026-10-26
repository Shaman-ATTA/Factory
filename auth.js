'use strict';
// Модуль аккаунтов. Интерфейс:
//   Auth.profiles(), Auth.current(), Auth.create(nick,color), Auth.switchTo(id), Auth.remove(id)
//   Auth.get(key), Auth.set(key,val), Auth.del(key)        — хранилище текущего профиля
//   Auth.exportCode(), Auth.importCode(code)               — перенос прогресса между устройствами
//   Auth.cloud: {enabled, user, signInGoogle(), signInEmail(e,p), signOut(), upload(), download(), onChange(fn)}
// Облако (Firebase) включается, если в firebase-config.js задан window.FIREBASE_CONFIG. См. README.md.
const Auth=(()=>{const P='f2d:';const ls=localStorage;
 const J=(k,d)=>{try{const v=JSON.parse(ls.getItem(k));return v==null?d:v;}catch(e){return d;}};
 let list=J(P+'profiles',null),cur=ls.getItem(P+'cur');
 if(!list||!list.length){list=[{id:'p1',nick:'Игрок',color:'#f0a040'}];cur='p1';
  // миграция со старых ключей
  const op=ls.getItem('factory2d_prog'),og=ls.getItem('factory2d_game');if(op)ls.setItem(P+'p1:prog',op);if(og)ls.setItem(P+'p1:game',og);
  ls.setItem(P+'profiles',JSON.stringify(list));ls.setItem(P+'cur',cur);}
 if(!list.find(p=>p.id===cur)){cur=list[0].id;ls.setItem(P+'cur',cur);}
 const key=k=>P+cur+':'+k;
 const A={profiles:()=>list.slice(),current:()=>list.find(p=>p.id===cur),
  get:(k,d)=>J(key(k),d),set:(k,v)=>{try{ls.setItem(key(k),JSON.stringify(v));}catch(e){}},del:k=>ls.removeItem(key(k)),
  create(nick,color){const id='p'+Date.now().toString(36);list.push({id,nick:(nick||'Игрок').slice(0,16),color:color||'#f0a040'});ls.setItem(P+'profiles',JSON.stringify(list));return id;},
  switchTo(id){if(!list.find(p=>p.id===id))return;cur=id;ls.setItem(P+'cur',id);},
  remove(id){if(list.length<=1)return false;for(const k of Object.keys(ls))if(k.startsWith(P+id+':'))ls.removeItem(k);list=list.filter(p=>p.id!==id);ls.setItem(P+'profiles',JSON.stringify(list));if(cur===id)A.switchTo(list[0].id);return true;},
  dump(){const o={};for(const k of Object.keys(ls))if(k.startsWith(P+cur+':'))o[k.slice((P+cur+':').length)]=ls.getItem(k);return{v:1,profile:A.current(),data:o};},
  load(d){if(!d||!d.data)throw new Error('bad');for(const k of Object.keys(ls))if(k.startsWith(P+cur+':'))ls.removeItem(k);for(const[k,v]of Object.entries(d.data))ls.setItem(key(k),v);},
  exportCode(){return 'F2D1.'+btoa(unescape(encodeURIComponent(JSON.stringify(A.dump()))));},
  importCode(code){code=(code||'').trim();if(!code.startsWith('F2D1.'))throw new Error('bad');A.load(JSON.parse(decodeURIComponent(escape(atob(code.slice(5))))));}};
 // ---- облако (Firebase), выключено без конфигурации ----
 const cloud={enabled:!!window.FIREBASE_CONFIG,user:null,_fb:null,_cbs:[],onChange(f){this._cbs.push(f);},
  async _init(){if(this._fb||!this.enabled)return this._fb;const v='10.12.2',u=n=>`https://www.gstatic.com/firebasejs/${v}/firebase-${n}.js`;
   const [app,auth,fs]=await Promise.all([import(u('app')),import(u('auth')),import(u('firestore'))]);const a=app.initializeApp(window.FIREBASE_CONFIG);
   const fa=auth.getAuth(a),db=fs.getFirestore(a);this._fb={auth,fs,fa,db};auth.onAuthStateChanged(fa,us=>{this.user=us;this._cbs.forEach(f=>f(us));});return this._fb;},
  async signInGoogle(){const f=await this._init();await f.auth.signInWithPopup(f.fa,new f.auth.GoogleAuthProvider());},
  async signInEmail(e,p){const f=await this._init();try{await f.auth.signInWithEmailAndPassword(f.fa,e,p);}catch(err){if(err.code==='auth/user-not-found'||err.code==='auth/invalid-credential')await f.auth.createUserWithEmailAndPassword(f.fa,e,p);else throw err;}},
  async signOut(){const f=await this._init();await f.auth.signOut(f.fa);},
  async upload(){const f=await this._init();if(!this.user)throw new Error('no user');await f.fs.setDoc(f.fs.doc(f.db,'saves',this.user.uid),{blob:JSON.stringify(A.dump()),t:Date.now()});},
  async download(){const f=await this._init();if(!this.user)throw new Error('no user');const s=await f.fs.getDoc(f.fs.doc(f.db,'saves',this.user.uid));if(!s.exists())return false;A.load(JSON.parse(s.data().blob));return true;}};
 if(cloud.enabled)cloud._init().catch(e=>console.warn('firebase',e));
 A.cloud=cloud;return A;})();
