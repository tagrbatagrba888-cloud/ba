importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp({apiKey:"AIzaSyCIYvVSg5KwPnD1lZK7u4oQx1e8l6KXgrc",projectId:"baml-85266",messagingSenderId:"691113580861",appId:"1:691113580861:web:42f790d56f436ea6eb8d54"});
firebase.messaging().onBackgroundMessage(p=>self.registration.showNotification(p.data.title||'B&A',{body:p.data.body||'',icon:'icon-192.png',badge:'icon-192.png',data:{url:p.data.url||'index.html'}}));
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow(e.notification.data.url))});
self.addEventListener('fetch',()=>{});
