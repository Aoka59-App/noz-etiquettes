const CACHE = 'noz-etiq-v53';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Réseau EN PRIORITÉ — cache uniquement si réseau indisponible
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Mettre en cache la nouvelle version
        if(resp && resp.status === 200 && e.request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => {
        // Hors ligne : servir depuis le cache
        return caches.match(e.request);
      })
  );
});
