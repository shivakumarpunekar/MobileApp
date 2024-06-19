import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7120/swagger/index.html',
  timeout: 10000, // Timeout in milliseconds
});

// Example function to fetch users
export const getUsers = () => {
  return api.get('/users');
};

// Example function to create a new user
export const createUser = (userData) => {
  return api.post('/users', userData);
};

// Add other API functions as needed
