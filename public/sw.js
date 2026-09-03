import { precacheAndRoute } from 'workbox-precaching';

// Required for injectManifest to work
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || 'PrepMate BD';
      const options = {
        body: data.body || 'You have a new message!',
        icon: '/logo.png',
        badge: '/logo.png',
        data: data.url || '/',
        tag: data.tag || 'prepmate-push',
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      // Not JSON, just text
      const title = 'PrepMate BD';
      const options = {
        body: event.data.text(),
        icon: '/logo.png',
      };
      event.waitUntil(self.registration.showNotification(title, options));
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
