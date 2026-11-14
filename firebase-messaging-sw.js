importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCIYvVSg5KwPnD1lZK7u4oQx1e8l6KXgrc",
  authDomain: "baml-85266.firebaseapp.com",
  projectId: "baml-85266",
  storageBucket: "baml-85266.firebasestorage.app",
  messagingSenderId: "691113580861",
  appId: "1:691113580861:web:42f790d56f436ea6eb8d54"
});

const messaging = firebase.messaging();
const ICON = 'https://i.ibb.co/XrzQxS3p/file-00000000dbbc821090f43517cfc56949.webp';

// السيرفر بيبعت data فقط، فالعرض كله هنا
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  const n = payload.notification || {};
  const title = d.title || n.title || 'B&A | رسالة جديدة';
  return self.registration.showNotification(title, {
    body: d.body || n.body || 'لديك رسالة جديدة',
    icon: ICON,
    badge: ICON,
    tag: d.tag || undefined,
    data: { url: d.url || '/index.html' }
  });
});

// الضغط على الإشعار يفتح المحادثة
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/index.html', self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url === target && 'focus' in c) return c.focus();
      }
      return clients.openWindow(target);
    })
  );
});
