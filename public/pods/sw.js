// Pods service worker: installable app, works offline with the last saved copy.
const C = "pods-v17";
const FILES = ["./", "./index.html", "./app.js", "./games.js", "./fb.js", "./manifest.json", "./icon-192.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(FILES)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C && k.startsWith("pods")).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.registration.scope)) return;
  const isPhoto = u.pathname.includes("/photos/") || u.pathname.endsWith("words.txt");
  if (isPhoto) { e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); } return r; }))); return; }
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request)));
});
