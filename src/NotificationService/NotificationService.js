import PushNotification from 'react-native-push-notification';

export const configureNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
    },
    requestPermissions: Platform.OS === 'ios',
  });

  // Create channel with unique ID and proper configuration
  PushNotification.createChannel(
    {
      channelId: "default-channel-id", // Make sure this ID is unique
      channelName: "Default Channel",
      importance: 4, // High importance for showing heads-up notifications
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

export const sendNotification = (deviceId, color, type) => {
  const title = type === 'heart' 
    ? (color === '#FF0000' ? 'Device Alert' : 'Device Status') 
    : 'Device Status';
  const message = type === 'heart'
    ? `Device ${deviceId} ${color === '#FF0000' ? 'has stopped watering' : 'is started watering'}`
    : `Device ${deviceId} ${color === '#FF0000' ? 'has stopped watering' : 'is started watering'}`;

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
