// Cache name and assets to store
const staticDevCoffee = "hubble";
const assets = [
  "*"
];

// Install event: Cache assets
self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then((cache) => {
      console.log("Caching assets...");
      return cache.addAll(assets);
    })
  );
});

// Fetch event: Serve cached assets if available
self.addEventListener("fetch", (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((res) => {
      return res || fetch(fetchEvent.request);
    })
  );
});
