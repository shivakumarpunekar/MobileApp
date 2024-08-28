import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import moment from 'moment'; // Ensure moment is imported

// Create a channel for Android notifications
PushNotification.createChannel(
  {
    channelId: 'default-channel-id', // (required)
    channelName: 'Default Channel', // (required)
    channelDescription: 'A channel to categorize your notifications', // (optional)
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

// Example function to show a notification with timestamp
export const showNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title: title, // (optional)
    message: message, // (required)
    showWhen: true, // (optional) default: true, show the time when the notification is shown
    when: Date.now(), // (optional) Set a custom timestamp (milliseconds since epoch)
    playSound: true,
    soundName: 'default',
    importance: 'high',
    vibrate: true,
  });
};

const sendNotification = (deviceId, message) => {
  // Get the current time
  const currentTime = moment().format('HH:mm:ss');

  // Include the current time in the notification message
  const fullMessage = `Device ${deviceId}: ${message} at ${currentTime}`;

  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title: 'Device Status Alert',
    message: fullMessage, // Use the full message with time
    importance: 'high',
    priority: 'high',
    soundName: 'default',
    playSound: true,
    vibrate: true,
    showWhen: true, // To ensure time is shown on the notification
    when: Date.now(), // Set a custom timestamp (milliseconds since epoch)
  });
};
