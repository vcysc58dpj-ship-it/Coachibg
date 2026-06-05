// NK Coaching Service Worker
// Bewusst OHNE fetch-/Cache-Handler -> die App lädt immer frisch (kein Cache-Problem).
// Aufgabe: Push-Nachrichten empfangen und beim Antippen die App öffnen.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : "" };
  }
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
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { c.focus(); return; }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
