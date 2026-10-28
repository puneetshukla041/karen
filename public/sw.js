// Karen does not use a service worker. Another app that once ran on this address left one
// here, and it keeps showing that app's offline page. Browsers re-check this file on every
// visit, so serving this version deletes its caches, unregisters it and reloads open tabs.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const tabs = await self.clients.matchAll({ type: "window" });
      tabs.forEach((tab) => tab.navigate(tab.url));
    })()
  );
});
