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

// Fetch all data after login
export const fetchAllDataAfterLogin = async (loginId) => {
  try {
    const userProfileId = await fetchuserProfileIdByLoginId(loginId);
    const userProfile = await fetchDataByIdFromApi(userProfileId);
    const userDevices = await apiClient.get(`/api/UserDevice/byProfile/${loginId}`).then(res => res.data);

    const deviceIds = userDevices.map(device => device.deviceId);
    const deviceStates = await Promise.all(deviceIds.map(deviceId => fetchDeviceStateThreshold(deviceId)));
    const sensorData = await Promise.all(deviceIds.map(deviceId => fetchSensorData(deviceId, deviceStates.find(state => state.deviceId === deviceId))));

    // Cache all fetched data
    await cacheData(`userProfile_${userProfileId}`, userProfile);
    await cacheData(`userDevices_${loginId}`, userDevices);
    deviceStates.forEach(async (state, index) => {
      await cacheData(`deviceState_${deviceIds[index]}`, state);
    });
    sensorData.forEach(async (data, index) => {
      await cacheData(`sensorData_${deviceIds[index]}`, data);
    });

    console.log('All data fetched and cached successfully');
  } catch (error) {
    console.error('Error fetching all data after login:', error);
  }
};

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