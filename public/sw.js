// Service worker: gör att spelet funkar offline.
// Strategi: nätverket först (så nya versioner alltid kommer in när det finns
// uppkoppling), cachen som reserv när mobilen är offline.
const CACHE = 'rymddjuren-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add('./')).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      try {
        const fresh = await fetch(req)
        if (fresh.ok) cache.put(req, fresh.clone())
        return fresh
      } catch {
        const cached = await cache.match(req, { ignoreSearch: true })
        if (cached) return cached
        // Navigering utan cache-träff: prova startsidan
        if (req.mode === 'navigate') {
          const start = await cache.match('./')
          if (start) return start
        }
        throw new Error('offline och ingen cache')
      }
    })()
  )
})
