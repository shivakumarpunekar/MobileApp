// backgroundNotificationHandler.js

import PushNotification from 'react-native-push-notification';
import axios from 'axios';

const handleBackgroundNotification = async (taskData) => {
  console.log('Running background notification handler', taskData);

  try {
    const response = await axios.get('http://103.145.50.185:2030/api/sensor_data/top100perdevice');
    const data = response.data;

    // Assuming data.conditionMet is a condition to check
    if (data.conditionMet) {
      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: 'Device Alert',
        message: 'A device requires your attention.',
        importance: 'high',
        priority: 'high',
        soundName: 'default',
        playSound: true,
        vibrate: true,
      });
    }
  } catch (error) {
    console.error('Error fetching data in background', error);
  }
};

module.exports = handleBackgroundNotification;
