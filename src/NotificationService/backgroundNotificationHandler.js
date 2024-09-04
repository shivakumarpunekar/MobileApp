import PushNotification from 'react-native-push-notification';
import moment from 'moment';

const handleBackgroundNotification = async (taskData) => {
  console.log('Headless Task Invoked', taskData);

  try {
    const response = await fetch('http://103.145.50.185:2030/api/sensor_data/top100perdevice');
    const data = await response.json();

    console.log('Fetched Data:', data);

    // Assume data contains an array of devices, each with a deviceId, solenoidValveStatus, and createdDateTime
    data.forEach((device) => {
      const { deviceId, solenoidValveStatus, createdDateTime } = device;

      // Determine current and created date
      const currentDate = moment().format('DD-MM-YYYY');
      const formattedCreatedDateTime = moment(createdDateTime, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY');

      // Determine heart icon color based on whether the created date is today
      const heartIconColor = formattedCreatedDateTime === currentDate ? '#00FF00' : '#FF0000';

      // Determine valve icon color based on solenoid valve status
      const valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' : solenoidValveStatus === 'Off' ? '#FF0000' : '#808080';

      // Send notification based on the heart icon color (assuming 'heart' type notification is needed)
      sendNotification(deviceId, heartIconColor, 'heart');
    });
  } catch (error) {
    console.error('Error fetching data in background', error);
  }
};

// Function to send notifications
const sendNotification = (deviceId, color, type) => {
  const title = type === 'heart' ? (color === '#FF0000' ? 'Device Alert' : 'Device Status') : 'Device Status';
  const message = type === 'heart' 
    ? `Device ${deviceId} ${color === '#FF0000' ? 'has stopped watering' : 'is started watering'}` 
    : `Device ${deviceId} ${color === '#FF0000' ? 'has stopped watering' : 'is started watering'}`;

  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title: title,
    message: message,
    importance: 'high',
    priority: 'high',
    soundName: 'default',
    playSound: true,
    vibrate: true,
    // Add a callback to handle the notification being sent
    onNotification: () => {
      console.log(`Notification sent for device ${deviceId} with message: ${message}`);
      // Add any other logic you need here, e.g., sending a confirmation to a server or updating local state
    },
  });

  console.log(`Notification triggered: ${title} - ${message}`);
};

export default handleBackgroundNotification;
