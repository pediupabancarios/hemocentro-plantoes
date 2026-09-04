/* Hemocentro JP — service worker
   Rede-primeiro para o documento (online sempre pega a versão nova;
   cache só como fallback offline). Cache-primeiro-com-revalidação para
   os demais GET same-origin. Requisições cross-origin (Firebase) passam direto.
   Suba a versão C para limpar caches antigos no activate. */
const C = "hjp-v22";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./logo-hemocentro.png", "./logo-mark.png", "./src/lib.js"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return; // Firebase & CDNs passam direto

  // Documento: rede-primeiro, cache como fallback offline
  if (req.mode === "navigate" || req.destination === "document") {
    e.respondWith(
      fetch(req)
        .then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)); return r; })
        .catch(() => caches.match(req).then(m => m || caches.match("./index.html")))
    );
    return;
  }

  // Demais assets: cache-primeiro, revalida em segundo plano
  e.respondWith(
    caches.match(req).then(m => {
      const net = fetch(req)
        .then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)); return r; })
        .catch(() => m);
      return m || net;
    })
  );
});
