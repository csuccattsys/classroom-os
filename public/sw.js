// public/sw.js
self.addEventListener('push', function (event) {
  let data = { title: 'New Campus Update', content: 'Open the portal to view the announcement.' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Fallback if data arrives as plain text
      data.content = event.data.text();
    }
  }

  const options = {
    body: data.content,
    icon: '/usg-logo.png', // Add your USG logo to public folder
    badge: '/usg-badge.png', // Small monochrome icon for mobile status bars
    vibrate: [200, 100, 200], // Makes the phone physically vibrate!
    data: {
      url: '/' // URL to open when clicked
    },
    actions: [
      { action: 'open', title: 'View Notice' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle when the student taps the phone notification banner
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
