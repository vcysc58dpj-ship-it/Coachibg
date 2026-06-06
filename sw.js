// NK Coaching Service Worker v4
// Kein Cache-Handler fuer Assets -> App laed immer frisch.

self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", (event) => { event.waitUntil(self.clients.claim()); });

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { body: event.data ? event.data.text() : "" }; }
  const title = data.title || "NK Coaching";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-512.png",
    badge: "/icon-512.png",
    data: { url: data.url || "/", conv: data.conv || null },
    tag: data.tag || undefined
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Intent in den Cache schreiben, damit die App es beim (Kalt-)Start lesen kann.
// iOS oeffnet PWAs an der start_url und ignoriert openWindow-URLs -> Cache ist zuverlaessiger.
async function writeIntent(conv) {
  try {
    const c = await caches.open("nk-intent");
    const body = JSON.stringify({ action: "open-chat", conv: conv || null, ts: Date.now() });
    await c.put("/__nk_intent", new Response(body, { headers: { "Content-Type": "application/json" } }));
  } catch (e) {}
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const conv = event.notification.data && event.notification.data.conv;
  event.waitUntil((async () => {
    await writeIntent(conv);
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) {
      if ("focus" in c) { c.postMessage({ action: "open-chat", conv: conv || null }); return c.focus(); }
    }
    if (self.clients.openWindow) return self.clients.openWindow("/?open=chat");
  })());
});
