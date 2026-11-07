// MARSON Abarrotes · Service Worker
// HTML y .json: red primero (ves los cambios rápido) · imágenes/iconos: caché primero · Firebase/WhatsApp: nunca se cachean
const V="marson-v2",C="static-"+V;
const PRE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];
const NET=["firebaseio.com","googleapis.com","gstatic.com","firebaseapp.com","wa.me","whatsapp.com"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(PRE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=="GET"||!u.protocol.startsWith("http")||NET.some(d=>u.hostname.includes(d)))return;
  const img=r.destination==="image"||/\.(png|jpe?g|webp|gif|svg|ico)$/i.test(u.pathname);
  e.respondWith(img?cacheFirst(r):networkFirst(r));
});
async function networkFirst(r){
  const c=await caches.open(C);
  try{const f=await fetch(r);if(f.ok&&new URL(r.url).origin===location.origin)c.put(r,f.clone());return f}
  catch(err){const m=await c.match(r);if(m)return m;if(r.destination==="document"){const i=await c.match("./index.html");if(i)return i}
    return new Response("Sin conexión",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}})}
}
async function cacheFirst(r){
  const m=await caches.match(r);if(m)return m;
  try{const f=await fetch(r);if(f.ok&&new URL(r.url).origin===location.origin)(await caches.open(C)).put(r,f.clone());return f}
  catch(err){return new Response("",{status:503})}
}
self.addEventListener("message",e=>{if(e.data&&e.data.type==="SKIP_WAITING")self.skipWaiting()});
