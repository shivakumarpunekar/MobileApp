// NotificationService.js

import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export const configureNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('Notification:', notification);
      // You can handle what happens when a notification is received here
      // For example, navigate to a specific screen
    },
    requestPermissions: Platform.OS === 'ios',
  });

  PushNotification.createChannel(
    {
      channelId: 'default-channel-id',
      channelName: 'Default Channel',
      channelDescription: 'A channel to categorize your notifications',
      soundName: 'default',
      importance: 4, // High importance
      vibrate: true,
    },
    (created) => console.log(`CreateChannel returned '${created}'`)
  );
};

export const showNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title: title,
    message: message,
    showWhen: true,
    when: Date.now(),
    playSound: true,
    soundName: 'default',
    importance: 'high',
    vibrate: true,
  });
};
