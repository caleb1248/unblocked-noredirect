try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
} catch (e) {
  alert('failed to install service worker:\n' + e.stack || e.message)
}