const CACHE_NAME = "familyfin AI v2";
const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];

// 1. Install Service Worker
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching assets...");
            return cache.addAll(ASSETS);
        })
    );
});

// 2. Activate Service Worker (Clean up old caches)
self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log("Removing old cache", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// 3. Fetch Assets (Offline Capability)
self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            // Return from cache if found, otherwise fetch from network
            return response || fetch(e.request);
        })
    );
});