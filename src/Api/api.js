import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const apiClient = axios.create({
  baseURL: 'http://103.145.50.185:2030/',
  headers: {
    'Content-Type': 'application/json',
  },
});

//Get Method of Userprofile getting
export const fetchaDataFromApi = async () => {
  try {
    const response = await apiClient.get('/api/userprofiles');
    // const data = await response.json();
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};


//This is a get method by userprofile userprofileedit page
export const fetchDataByIdFromApi = async (userProfileId) => {
  try {
    const response = await apiClient.get(`/api/userprofiles/${userProfileId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

//This is a LoginId To get a userProfileId get Method for Login
export const fetchuserProfileIdByLoginId = async (loginId) => {
  try {
    const response = await apiClient.get(`/api/Auth/login/${loginId}`);
    return response.data.userProfileId;
  } catch (error) {
    handleApiError(error);
  }
};

//This is a sensor detail page method.
 // Optimized device state fetch
export const fetchDeviceStateThreshold = async (deviceId) => {
  const STATE_STORAGE_KEY = `deviceState_${deviceId}`;
  try {
    const response = await apiClient.get(`/api/DeviceStateThreshold/${deviceId}`);
    const result = response.data;
    await AsyncStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Failed to fetch device state and threshold:', error);
  }
};

// Optimized sensor data fetch
export const fetchSensorData = async (deviceId, deviceState) => {
  const DATA_STORAGE_KEY = `sensorData_${deviceId}`;
  try {
    const response = await apiClient.get(`/api/sensor_data/device/${deviceId}`);
    const result = response.data;
    const latestData = result.slice(0, 30);
    const updatedData = latestData.map(item => ({
      ...item,
      threshold_1: deviceState?.threshold_1,
      threshold_2: deviceState?.threshold_2,
    }));
    await AsyncStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
  }
};
//This is a end of sensor detail page method.

//this is a user device button api
// Fetch user devices and sensor data
export const fetchData = (loginId, setUserDevices, setSensorData) => {
  if (!loginId) {
    console.error('loginId is undefined');
    return;
  }

  axios.get(`http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`)
    .then(response => {
      setUserDevices(response.data);
      const deviceIds = response.data.map(device => device.deviceId);
      return Promise.all(
        deviceIds.map(deviceId =>
          axios.get(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`).then(res => res.data)
        )
      );
    })
    .then(allSensorData => {
      setSensorData(allSensorData.flat());
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
};
//This is a plant status api
export const fetchLoginAndDevice = async (loginId, setDeviceId) => {
  try {
      const response = await apiClient.get(`/api/UserDevice/byProfile/${loginId}`);
      if (response.data.length > 0 && response.data[0].deviceId) {
          setDeviceId(response.data[0].deviceId);
      } else {
          console.error('Device ID not found or data is empty');
      }
  } catch (error) {
      console.error('Error fetching login and device data:', error);
  }
};

export const fetchWaterData = async (loginId, deviceId, setFlowRate) => {
  try {
      const response = await apiClient.get(`/api/sensor_data/profile/${loginId}/device/${deviceId}`);
      if (response.data && response.data.length > 0) {
          const { sensor1_value, sensor2_value } = response.data[0];
          const calculatedFlowRate = (sensor1_value + sensor2_value) / 2;
          setFlowRate(calculatedFlowRate);
      } else {
          console.error('Sensor data not found or data is empty');
      }
  } catch (error) {
      console.error('Error fetching water data:', error);
  }
};

//this is end of user device button api


// Error handler
const handleApiError = (error) => {
  if (error.response) {
    console.error('Error response:', error.response.data);
    console.error('Error status:', error.response.status);
    console.error('Error headers:', error.response.headers);
  } else if (error.request) {
    console.error('Error request:', error.request);
  } else {
    console.error('Error message:', error.message);
  }
  throw error;
};

export default apiClient;