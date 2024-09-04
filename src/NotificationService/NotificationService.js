// NotificationService.js

import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export const configureNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('Notification:', notification);

      if (notification.foreground) {
        console.log('Foreground Notification:', notification);
        // Handle foreground notification
        // You can show an alert or perform other actions here
      } else if (notification.userInteraction) {
        console.log('Background Notification:', notification);
        // Handle background notification
        // Ensure you handle the user interaction if needed
        // e.g., navigate to a specific screen or perform an action

        // If you need to call `finish` method to complete the notification
        // notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },
    requestPermissions: Platform.OS === 'ios',
  });

  PushNotification.createChannel(
    {
      channelId: 'default-channel-id', // Ensure this is unique and consistent
      channelName: 'Default Channel',  // Give a clear name
      channelDescription: 'A channel to categorize your notifications',
      soundName: 'default',
      importance: 4, // Use Importance.HIGH (which is 4)
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
    userInteraction: true,
  });
};
