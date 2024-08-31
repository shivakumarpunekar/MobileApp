import PushNotification from 'react-native-push-notification';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';


// Function to get current location
const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Position:', position);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true, // Use high accuracy mode
        timeout: 20000,           // Set timeout to 20 seconds
        maximumAge: 1000,         // Cache the location for 1 second
        distanceFilter: 0,        // Minimum change in meters to trigger a location update
      }
    );
  };
  
  // Call the function to get location
  getCurrentLocation();

const handleBackgroundNotification = async (taskData) => {
  console.log('Running background notification handler', taskData);

  try {
    const response = await axios.get('http://103.145.50.185:2030/api/sensor_data/top100perdevice'); // Replace with your endpoint to fetch data
    const data = response.data;

    if (data.conditionMet) { // Replace `conditionMet` with actual logic
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
