const CACHE_NAME = "youchef-v1";
const STATIC_ASSETS = ["/", "/index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("fetch", (e) => {
  // Не трогаем API запросы и внешние ресурсы
  if (
    e.request.url.includes("/api/") ||
    e.request.url.includes("onrender.com") ||
    e.request.url.includes("themealdb.com") ||
    !e.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});