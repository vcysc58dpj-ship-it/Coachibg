// NK Coaching Service Worker v3
// Kein Cache-Handler -> App laed immer frisch.

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
    data: { url: data.url || "/" },
    tag: data.tag || undefined
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // App laeuft bereits im Hintergrund -> Chat-Tab oeffnen via postMessage
      for (const c of list) {
        if ("focus" in c) {
          c.postMessage({ action: "open-chat" });
          c.focus();
          return;
        }
      }
      // App geschlossen -> mit ?open=chat oeffnen
      if (self.clients.openWindow) return self.clients.openWindow("/?open=chat");
    })
  );
});
