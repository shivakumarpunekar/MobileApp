import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'http://103.145.50.185:2030/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;