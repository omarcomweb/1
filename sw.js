const CACHE_NAME = 'pwa-cache-7213335361783685165911';
const urlsToCache = [ './', './index.html', './offline.html', './icon-192.png', './icon-512.png', './manifest.json' ];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // لتشغيل الإصدار الجديد فوراً
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // للسيطرة على الصفحات المفتوحة بالنسخة الجديدة فوراً
});

self.addEventListener('fetch', event => {
  // استراتيجية شبكة أولاً (Network-First) لصفحة التنقل لتعمل التحديثات فوراً عند وجود نت
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(event.request) || caches.match('./index.html') || caches.match('./offline.html');
        })
    );
  } else {
    // باقي الملفات كاش أولاً لسرعة التصفح وتوفير البيانات
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});