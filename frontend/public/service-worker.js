/* eslint-disable no-restricted-globals */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
  );
});

const parsePushPayload = (event) => {
  if (!event.data) {
    return {};
  }

  try {
    return event.data.json();
  } catch {
    return { body: event.data.text() };
  }
};

self.addEventListener('push', (event) => {
  const payload = parsePushPayload(event);
  const title = payload.title || 'TrkeebPro';
  const options = {
    body: payload.body || payload.message || 'لديك تحديث جديد.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.tag || 'tarkeeb-notification',
    data: {
      url: payload.url || '/login',
      relatedOrderId: payload.relatedOrderId || null,
    },
    vibrate: [140, 60, 140],
    renotify: true,
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/login', self.location.origin).toString();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return null;
    })
  );
});
