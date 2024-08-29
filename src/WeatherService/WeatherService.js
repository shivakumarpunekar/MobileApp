import axios from 'axios';

const API_KEY = 'a2c3b2b1d965a2e0cf8525cab7feb927'; // Replace with your new API key

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const fetchWeather = async (lat, lon) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        lat,
        lon,
        exclude: 'current,minutely,hourly,alerts', // Adjust as needed
        appid: API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
    throw error;
  }
};
