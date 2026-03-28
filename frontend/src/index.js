import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import apiClient from './services/api';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('%PUBLIC_URL%/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
}

function subscribeToPushNotifications() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function (registration) {
      if (!registration.pushManager) {
        console.log('Push manager unavailable.');
        return;
      }

      registration.pushManager
        .getSubscription()
        .then(function (existedSubscription) {
          if (existedSubscription === null) {
            console.log('No subscription detected, make a new one.');
            registration.pushManager
              .subscribe({
                applicationServerKey: 'BJDe1im_oVNRMdPrjtBjE7qwlb-CJUDIxxc_Dp-mhPwuiuSgTHcFxWgS3MX-gyVyy3YPMS8nGQ6YaJIb1rrGgyo',
                userVisibleOnly: true,
              })
              .then(function (newSubscription) {
                console.log('New subscription added.', newSubscription);
                sendSubscriptionToBackEnd(newSubscription);
              })
              .catch(function (e) {
                if (Notification.permission !== 'granted') {
                  console.log('Permission was not granted.');
                } else {
                  console.error(
                    'An error ocurred during the subscription process.',
                    e
                  );
                }
              });
          } else {
            console.log('Existed subscription detected.');
            sendSubscriptionToBackEnd(existedSubscription);
          }
        });
    });
  }
}

function sendSubscriptionToBackEnd(subscription) {
  apiClient.post('/notifications/subscribe', subscription)
    .then(function (response) {
      console.log('Subscription sent to backend.', response);
    })
    .catch(function (error) {
      console.error('Error sending subscription to backend.', error);
    });
}

registerServiceWorker();
subscribeToPushNotifications();
