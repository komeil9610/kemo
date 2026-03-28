const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const Subscription = require('../models/Subscription');

// VAPID keys
const vapidPublicKey = 'BJDe1im_oVNRMdPrjtBjE7qwlb-CJUDIxxc_Dp-mhPwuiuSgTHcFxWgS3MX-gyVyy3YPMS8nGQ6YaJIb1rrGgyo';
const vapidPrivateKey = 'lsoE_8aTNecmeyMys5PdzKcCKnzJFcfI0YjVDYIaD3I';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidPublicKey,
  vapidPrivateKey
);

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
