import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'http://103.145.50.185:2030/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache utility
const cacheData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
};

const getCachedData = async (key) => {
  try {
    const cachedData = await AsyncStorage.getItem(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Failed to retrieve cached data:', error);
    return null;
  }
};

// Get Method of Userprofile
export const fetchaDataFromApi = async () => {
  const CACHE_KEY = 'userProfiles';
  try {
    const cachedData = await getCachedData(CACHE_KEY);
    if (cachedData) return cachedData;

    const response = await apiClient.get('/api/userprofiles');
    const data = response.data;
    await cacheData(CACHE_KEY, data);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get Method by userProfileId
export const fetchDataByIdFromApi = async (userProfileId) => {
  const CACHE_KEY = `userProfile_${userProfileId}`;
  try {
    const cachedData = await getCachedData(CACHE_KEY);
    if (cachedData) return cachedData;

    const response = await apiClient.get(`/api/userprofiles/${userProfileId}`);
    const data = response.data;
    await cacheData(CACHE_KEY, data);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get userProfileId by loginId
export const fetchuserProfileIdByLoginId = async (loginId) => {
  const CACHE_KEY = `userProfileId_${loginId}`;
  try {
    const cachedData = await getCachedData(CACHE_KEY);
    if (cachedData) return cachedData;

    const response = await apiClient.get(`/api/Auth/login/${loginId}`);
    const userProfileId = response.data.userProfileId;
    await cacheData(CACHE_KEY, userProfileId);
    return userProfileId;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch device state and threshold
export const fetchDeviceStateThreshold = async (deviceId) => {
  const STATE_STORAGE_KEY = `deviceState_${deviceId}`;
  try {
    const cachedData = await getCachedData(STATE_STORAGE_KEY);
    if (cachedData) return cachedData;

    const response = await apiClient.get(`/api/DeviceStateThreshold/${deviceId}`);
    const result = response.data;
    await cacheData(STATE_STORAGE_KEY, result);
    return result;
  } catch (error) {
    console.error('Failed to fetch device state and threshold:', error);
  }
};

// Fetch sensor data
export const fetchSensorData = async (deviceId, deviceState) => {
  const DATA_STORAGE_KEY = `sensorData_${deviceId}`;
  try {
    const cachedData = await getCachedData(DATA_STORAGE_KEY);
    if (cachedData) return cachedData;

    const response = await apiClient.get(`/api/sensor_data/device/${deviceId}`);
    const result = response.data;
    const latestData = result.slice(0, 30);
    const updatedData = latestData.map(item => ({
      ...item,
      threshold_1: deviceState?.threshold_1,
      threshold_2: deviceState?.threshold_2,
    }));
    await cacheData(DATA_STORAGE_KEY, updatedData);
    return updatedData;
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
  }
};

// Fetch user devices and sensor data
export const fetchData = async (loginId, setUserDevices, setSensorData) => {
  if (!loginId) {
    console.error('loginId is undefined');
    return;
  }

  try {
    const response = await apiClient.get(`/api/UserDevice/byProfile/${loginId}`);
    const userDevices = response.data;
    setUserDevices(userDevices);

    const deviceIds = userDevices.map(device => device.deviceId);
    const allSensorData = await Promise.all(
      deviceIds.map(deviceId => apiClient.get(`/api/sensor_data/device/${deviceId}`).then(res => res.data))
    );
    setSensorData(allSensorData.flat());
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// // Fetch login and device data
// export const fetchLoginAndDevice = async (loginId, setDeviceId) => {
//   try {
//     const response = await apiClient.get(`/api/UserDevice/byProfile/${loginId}`);
//     if (response.data.length > 0 && response.data[0].deviceId) {
//       setDeviceId(response.data[0].deviceId);
//     } else {
//       console.error('Device ID not found or data is empty');
//     }
//   } catch (error) {
//     console.error('Error fetching login and device data:', error);
//   }
// };

// // Fetch water data
// export const fetchWaterData = async (loginId, deviceId, setFlowRate) => {
//   try {
//     const response = await apiClient.get(`/api/sensor_data/profile/${loginId}/device/${deviceId}`);
//     if (response.data && response.data.length > 0) {
//       const { sensor1_value, sensor2_value } = response.data[0];
//       const calculatedFlowRate = (sensor1_value + sensor2_value) / 2;
//       setFlowRate(calculatedFlowRate);
//     } else {
//       console.error('Sensor data not found or data is empty');
//     }
//   } catch (error) {
//     console.error('Error fetching water data:', error);
//   }
// };


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
