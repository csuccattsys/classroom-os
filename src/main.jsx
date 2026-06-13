import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Imports Tailwind CSS utility directives

// ============================================================================
// MOBILE PHONE NOTIFICATION ENGINE SETUP
// This registers your background service worker script ('public/sw.js')
// ============================================================================
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Smartphone Notification Engine active on scope: ', registration.scope);
      })
      .catch((err) => {
        console.error('ServiceWorker smartphone setup failed: ', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
