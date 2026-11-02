/* LexiLevel service worker — offline cache + daily reminder */
const CACHE='lexilevel-v2.3';
const CORE=['./','./index.html','./manifest.json','./manifest.webmanifest','./packs/awl.json','./packs/phrasal.json',
 './icons/icon.svg','./icons/favicon-32.png','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png',
 './icons/maskable-192.png','./icons/maskable-512.png','./icons/badge-96.png'];

self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url);
  // pages: network first (so updates arrive), fall back to cache offline
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  // same-origin files and Google Fonts: cache first, refresh in background
  if(u.origin===location.origin||u.hostname.endsWith('fonts.googleapis.com')||u.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.match(r,{ignoreSearch:u.origin===location.origin&&u.pathname.endsWith('.json')}).then(hit=>{
      const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
      return hit||net;
    }));
  }
});

/* reminder state written by the page into IndexedDB 'lexi' / store 'kv' / key 'rem' */
const idb=(mode,fn)=>new Promise((res,rej)=>{const o=indexedDB.open('lexi',1);o.onupgradeneeded=()=>o.result.createObjectStore('kv');o.onerror=()=>rej(o.error);
 o.onsuccess=()=>{const db=o.result,tx=db.transaction('kv',mode),q=fn(tx.objectStore('kv'));tx.oncomplete=()=>{db.close();res(q&&q.result)};tx.onerror=()=>{db.close();rej(tx.error)}}});
const dk=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
async function checkReminder(){
  let st;try{st=JSON.parse(await idb('readonly',s=>s.get('rem'))||'null')}catch(e){return}
  if(!st||!st.rem)return;
  const n=new Date(),today=dk(n),hm=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
  const count=st.day===today?st.count:0;
  if(!st.days.includes(n.getDay())||st.remd===today||hm<st.time||count>=st.goal)return;
  st.remd=today;await idb('readwrite',s=>s.put(JSON.stringify(st),'rem')).catch(()=>{});
  await self.registration.showNotification('LexiLevel',{body:`আজকের টার্গেট ${count}/${st.goal} — কিছু শব্দ শিখে নিন!`,icon:'icons/icon-192.png',badge:'icons/badge-96.png',tag:'lexi-daily-'+today,lang:'bn',data:{url:'./'}});
}
self.addEventListener('periodicsync',e=>{if(e.tag==='lexi-reminder')e.waitUntil(checkReminder())});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if(w.url.startsWith(self.registration.scope)&&'focus' in w)return w.focus()}return clients.openWindow(url)}));
});
