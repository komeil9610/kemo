/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/guides/service-worker-essentials

// This is the service worker with the combined offline page and push notification logic.

// We need this in Webpack plugin in next.config.js
// const { assets } = global.serviceWorkerOption;

const CACHE_NAME = 'tarkeeb-pro-cache-v1';

// const assetsToCache = [...assets, './'];

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  // event.waitUntil(
  //   caches.open(CACHE_NAME).then((cache) => {
  //     console.log('[Service Worker] Caching all: app shell and content');
  //     return cache.addAll(assetsToCache);
  //   })
  // );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  // event.waitUntil(
  //   caches.keys().then((keyList) => {
  //     return Promise.all(
  //       keyList.map((key) => {
  //         if (key !== CACHE_NAME) {
  //           console.log('[Service Worker] Removing old cache', key);
  //           return caches.delete(key);
  //         }
  //       })
  //     );
  //   })
  // );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // console.log('[Service Worker] Fetch');
  // event.respondWith(
  //   caches.match(event.request).then((response) => {
  //     return response || fetch(event.request);
  //   })
  // );
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Tarkeeb Pro';
  const options = {
    body: event.data.text(),
    icon: 'favicon.svg',
    badge: 'favicon.svg',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
