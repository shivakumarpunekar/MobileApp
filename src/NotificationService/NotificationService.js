import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';

// Function to configure notifications
export const configureNotifications = async () => {
  // Request notification permission for Android 13+
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn('Notification permissions not granted');
      return;
    }
  }

  // Configure push notifications
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
    },
    requestPermissions: Platform.OS === 'ios',
  });

  // Create notification channel
  PushNotification.createChannel(
    {
      channelId: "default-channel-id",  // Unique channel ID
      channelName: "Default Channel",
      importance: PushNotification.Importance.HIGH, // Use predefined importance constants
      soundName: "default",
      vibrate: true,
    },
    (created) => {
      console.log(`createChannel returned '${created}'`);
      if (!created) {
        console.warn('Failed to create notification channel');
      }
    }
  );
};

// Function to send local notifications
export const sendNotification = (deviceId, color, type) => {
  const title = type === 'heart'
    ? (color === '#FF0000' ? 'Device Alert' : 'Device Status')
    : 'Device Status';
  const message = type === 'heart'
    ? `Device ${deviceId} ${color === '#FF0000' ? 'has stopped watering' : 'has started watering'}`
    : `Device ${deviceId} ${color === '#FF0000' ? 'has stopped watering' : 'has started watering'}`;

  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title,
    message,
    importance: 'high',
    priority: 'high',
    soundName: 'default',
    playSound: true,
    vibrate: true,
  });
};
