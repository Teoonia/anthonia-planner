// Weekly Board service worker: installable app + works offline.
// Pages: network first, fall back to the saved copy. Built files: saved copy first.
const CACHE = "weekly-board-v3";
const HOME = new URL("./", self.registration.scope).href; // works at / and at /anthonia-planner/board/
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", "./manifest.webmanifest", "./icon-192.png"])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!req.url.startsWith(self.registration.scope)) return; // only Weekly Board's own files // Firebase, fonts etc. handle themselves
  if (url.pathname.includes("/parla/") || url.pathname.endsWith("/parla")) return; // Parla! Italian coach has its own service worker
  if (url.pathname.includes("/pods/") || url.pathname.endsWith("/pods")) return; // Pods couple app has its own service worker
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(HOME, copy)); return res;
    }).catch(() => caches.match(HOME)));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
// Clicking a notification brings the Weekly Board window to the front
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) if ("focus" in c) return c.focus();
    return self.clients.openWindow(HOME + "#today");
  }));
});
