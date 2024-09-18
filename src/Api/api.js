import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const apiClient = axios.create({
  baseURL: 'http://103.145.50.185:2030/',
  headers: {
    'Content-Type': 'application/json',
  },
});

//Get Method of Userprofile
export const fetchaDataFromApi = async () => {
  try {
    const response = await apiClient.get('/api/userprofiles');
    // const data = await response.json();
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};


//This is a get method by Id

export const fetchDataByIdFromApi = async (userProfileId) => {
  try {
    const response = await apiClient.get(`/api/userprofiles/${userProfileId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

//This is a LoginId To get a userProfileId get Method
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