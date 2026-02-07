import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isLocalhost = window.location.hostname === 'localhost';
    const isHttps = window.location.protocol === 'https:';
    
    // Skip SW registration on Google Preview environments to avoid Origin errors
    const isGooglePreview = window.location.hostname.includes('usercontent.goog') || 
                           window.location.hostname.includes('web.app');

    if ((isHttps || isLocalhost) && !isGooglePreview) {
        navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
            console.log('SW registered: ', registration);
        })
        .catch((error) => {
            // Robust check for origin mismatch errors in preview environments
            const msg = error?.message || String(error);
            if (
              msg.toLowerCase().includes('origin') || 
              msg.toLowerCase().includes('scripturl') ||
              msg.toLowerCase().includes('failed to register')
            ) {
                console.warn('PWA Service Worker skipped due to environment restrictions.');
            } else {
                console.log('SW registration failed: ', error);
            }
        });
    }
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);