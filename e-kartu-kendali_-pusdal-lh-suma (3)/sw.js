
// Menggunakan versi spesifik Babel untuk menghindari masalah redirect di Service Worker
importScripts('https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.9/babel.min.js');

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Hanya proses file .tsx atau .ts dari origin yang sama
  if (url.origin === self.location.origin && (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response.ok) return response;
          return response.text().then(text => {
            try {
              const transformed = Babel.transform(text, {
                presets: [
                  ['env', { modules: false }],
                  ['react', { runtime: 'classic' }],
                  'typescript'
                ],
                filename: url.pathname,
                sourceMaps: 'inline'
              }).code;

              return new Response(transformed, {
                headers: { 'Content-Type': 'application/javascript' }
              });
            } catch (err) {
              console.error('[SW] Transpile Error:', url.pathname, err);
              return new Response(`console.error("Transpile Error: ${err.message}");`, {
                headers: { 'Content-Type': 'application/javascript' }
              });
            }
          });
        })
    );
  }
});
