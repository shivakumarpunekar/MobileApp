import axios from 'axios';
import { Platform } from 'react-native';

import { NativeModules, NativeEventEmitter } from 'react-native';

// Custom adapter for Axios in React Native to handle SSL for self-signed certificates
const customAdapter = (config) => {
  return new Promise((resolve, reject) => {
    const request = {
      ...config,
      responseType: 'text',
      // Adjust timeout according to your needs
      timeout: config.timeout || 10000,
    };

    // Use NativeModules and NativeEventEmitter for handling network requests
    NativeModules.CustomNetworking.makeRequest(
      request,
      (response) => {
        resolve({
          data: response.profiles,
          status: response.status,
          headers: response.headers,
          config: request,
          request,
        });
      },
      (error) => {
        reject({
          message: error.message,
          request,
          response: {
            status: error.status,
            headers: error.headers,
          },
          config: request,
        });
      }
    );
  });
};

// Create Axios instance with custom adapter
const axiosInstance = axios.create({
  baseURL: 'https://localhost:44341/api/userprofiles',
  adapter: customAdapter,
});

// Allow insecure requests for development with self-signed certificates
if (Platform.OS === 'android') {
  axiosInstance.interceptors.request.use((config) => {
    config.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    return config;
  });
}

export default axiosInstance;
