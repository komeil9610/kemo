const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const Subscription = require('../models/Subscription');

const DEFAULT_VAPID_PUBLIC_KEY = 'BJDe1im_oVNRMdPrjtBjE7qwlb-CJUDIxxc_Dp-mhPwuiuSgTHcFxWgS3MX-gyVyy3YPMS8nGQ6YaJIb1rrGgyo';
const DEFAULT_VAPID_PRIVATE_KEY = 'lsoE_8aTNecmeyMys5PdzKcCKnzJFcfI0YjVDYIaD3I';
const DEFAULT_VAPID_CONTACT_EMAIL = 'ops@tarkeebpro.sa';
let configuredCacheKey = '';

const getWebPushConfig = () => {
  const publicKey = String(process.env.WEB_PUSH_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY || '').trim();
  const privateKey = String(process.env.WEB_PUSH_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY || '').trim();
  const rawContact = String(process.env.WEB_PUSH_CONTACT_EMAIL || DEFAULT_VAPID_CONTACT_EMAIL || '').trim();
  const contactEmail = rawContact ? (rawContact.startsWith('mailto:') ? rawContact : `mailto:${rawContact}`) : '';

  return {
    enabled: Boolean(publicKey && privateKey && contactEmail),
    publicKey,
    privateKey,
    contactEmail,
  };
};

const ensureWebPushConfigured = () => {
  const config = getWebPushConfig();
  if (!config.enabled) {
    return null;
  }

  const cacheKey = `${config.publicKey}:${config.privateKey}:${config.contactEmail}`;
  if (configuredCacheKey !== cacheKey) {
    webpush.setVapidDetails(config.contactEmail, config.publicKey, config.privateKey);
    configuredCacheKey = cacheKey;
  }

  return config;
};

router.get('/config', (req, res) => {
  const config = getWebPushConfig();
  res.status(200).json({
    enabled: config.enabled,
    publicKey: config.publicKey || null,
  });
});

// Subscribe route
router.post('/subscribe', async (req, res) => {
  const { endpoint, keys } = req.body;

  try {
    const newSubscription = new Subscription({
      endpoint,
      keys,
    });
    await newSubscription.save();
    res.status(201).json({ message: 'Subscription saved.' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ message: 'Could not save subscription.' });
  }
});

// Push route
router.post('/push', async (req, res) => {
  if (!ensureWebPushConfigured()) {
    return res.status(503).json({ message: 'Push notifications are not configured.' });
  }

  const { message } = req.body;

  try {
    const subscriptions = await Subscription.find({});
    const notificationPromises = subscriptions.map((subscription) => {
      const pushConfig = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      };
      return webpush.sendNotification(pushConfig, message);
    });

    await Promise.all(notificationPromises);
    res.status(200).json({ message: 'Push notifications sent.' });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    res.status(500).json({ message: 'Could not send push notifications.' });
  }
});

module.exports = router;
