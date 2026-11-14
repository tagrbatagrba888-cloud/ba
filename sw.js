const CACHE_NAME = 'ba-messenger-v2';
const ASSETS = [
  './',
  './login.html',
  './index.html',
  './chat.html',
  './manifest.json'
];

// تثبيت الكاش
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// تحديث الكاش ومسح القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// الشبكة أولاً (علشان أي تحديث للموقع يظهر فوراً)، والكاش لو مفيش نت
// بنتعامل مع ملفات الموقع نفسه بس، مش مع Firestore أو أي دومين تاني
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then((fetchRes) => {
      const copy = fetchRes.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
      return fetchRes;
    }).catch(() => {
      return caches.match(e.request).then((cached) => {
        if (cached) return cached;
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

// استقبال الإشعارات في الخلفية (Firebase Messaging)
self.addEventListener('push', (e) => {
  let data = {};
  try {
    data = e.data.json();
  } catch (err) {
    data = { notification: { title: 'B&A', body: 'لديك رسالة جديدة' } };
  }
  
  const title = data.notification?.title || 'B&A';
  const options = {
    body: data.notification?.body || 'لديك رسالة جديدة',
    icon: 'https://i.ibb.co/XrzQxS3p/file-00000000dbbc821090f43517cfc56949.webp',
    badge: 'https://i.ibb.co/XrzQxS3p/file-00000000dbbc821090f43517cfc56949.webp',
    vibrate: [200, 100, 200],
    data: { url: data.data?.url || '/index.html' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// لما المستخدم يضغط على الإشعار يفتح الموقع
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(e.notification.data.url);
      }
    })
  );
});
