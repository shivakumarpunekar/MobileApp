import PushNotification from 'react-native-push-notification';

// Create a channel for Android notifications
PushNotification.createChannel(
  {
    channelId: 'default-channel-id', // (required)
    channelName: 'Default Channel', // (required)
    channelDescription: 'A channel to categorise your notifications', // (optional)
    soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) see `importance` parameter of `localNotification` function
    vibrate: true, // (optional) default: true
  },
  (created) => console.log(`CreateChannel returned '${created}'`)
);

export const configureNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('Notification:', notification);
      // process the notification here
      /* notification.finish(PushNotificationIOS.FetchResult.NoData); */
    },
    requestPermissions: Platform.OS === 'ios',
  });
};
