// Service worker for Selma's home page: keeps a copy so it opens offline.
// Network first, so a connected device always gets the latest version.

const CACHE = 'selma-home-v2';
// This address used to be the mail journal, which kept its offline copy under this name.
const RETIRED = ['selma-v1'];
const APP_FILES = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'selma-home.svg',
  'manifest.webmanifest',
  'icons/mail.svg',
  'icons/time.svg',
  'icons/work.svg',
  'icons/home-180.png',
  'icons/home-192.png',
  'icons/home-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      // Only clear out older copies of this page; the journals keep theirs.
      .then((names) => Promise.all(
        names
          .filter((name) => RETIRED.includes(name) || (name.startsWith('selma-home-') && name !== CACHE))
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const ownFile = new URL(event.request.url).origin === self.location.origin;
  const request = ownFile ? new Request(event.request.url, { cache: 'no-cache' }) : event.request;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok || response.type === 'opaque') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
