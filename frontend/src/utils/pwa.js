const IOS_DEVICE_REGEX = /iphone|ipad|ipod/i;
let registrationPromise = null;

const serviceWorkerUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

export const isStandaloneApp = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator?.standalone === true
  );
};

export const isIosInstallableDevice = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return IOS_DEVICE_REGEX.test(String(navigator.userAgent || ''));
};

export const supportsServiceWorker = () =>
  typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

export const supportsBrowserPush = () =>
  supportsServiceWorker() && typeof window !== 'undefined' && 'PushManager' in window;

export const registerAppServiceWorker = async () => {
  if (!supportsServiceWorker()) {
    return null;
  }

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      registrationPromise = null;
      throw error;
    });
  }

  return registrationPromise;
};

export const getAppServiceWorkerRegistration = async () => {
  if (!supportsServiceWorker()) {
    return null;
  }

  const existingRegistration = await navigator.serviceWorker.getRegistration();
  if (existingRegistration) {
    return existingRegistration;
  }

  return registerAppServiceWorker();
};

export const subscribeBrowserPush = async (publicKey) => {
  if (!supportsBrowserPush() || !publicKey) {
    return null;
  }

  const registration = await getAppServiceWorkerRegistration();
  if (!registration) {
    return null;
  }

  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return existingSubscription;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
};
