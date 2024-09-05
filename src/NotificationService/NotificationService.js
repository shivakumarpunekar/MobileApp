import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export const configureNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('Notification:', notification);

      if (notification.foreground) {
        console.log('Foreground Notification:', notification);
      } else if (notification.userInteraction) {
        console.log('Background Notification:', notification);
      }
    },
    requestPermissions: Platform.OS === 'ios',
  });

  PushNotification.createChannel(
    {
      channelId: 'default-channel-id',
      channelName: 'Default Channel',
      channelDescription: 'A channel to categorize your notifications',
      soundName: 'default',
      importance: 4, // HIGH importance
      vibrate: true,
    },
    (created) => console.log(`CreateChannel returned '${created}'`)
  );
  
};
