// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDQ1kA6wKWTf9xLGj2lsXtlBV-AH5PLsBY",
    authDomain: "real-time-chat-388a7.firebaseapp.com",
    databaseURL: "https://real-time-chat-388a7-default-rtdb.firebaseio.com",
    projectId: "real-time-chat-388a7",
    storageBucket: "real-time-chat-388a7.firebasestorage.app",
    messagingSenderId: "46470010225",
    appId: "1:46470010225:web:404fb0996b21ed031a52d0",
    measurementId: "G-T1XMMXP5RM"
};

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon.png',
    badge: '/badge.png',
    data: payload.data,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes('/chat') && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not open
      if (clients.openWindow) {
        return clients.openWindow('/chat');
      }
    })
  );
});