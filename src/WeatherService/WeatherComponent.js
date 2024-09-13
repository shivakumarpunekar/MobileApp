import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, PermissionsAndroid, Platform, ImageBackground } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

// Replace with your OpenWeatherMap API key
const API_KEY = 'a2c3b2b1d965a2e0cf8525cab7feb927';
const GEOCODING_URL = 'https://api.openweathermap.org/data/2.5/weather';

// URLs for cloud images based on temperature ranges
const CLOUD_IMAGES = {
  cold: 'https://example.com/cold-cloud.png',
  moderate: 'https://example.com/moderate-cloud.png',
  warm: 'https://example.com/warm-cloud.png',
};

const WeatherComponent = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [cloudImage, setCloudImage] = useState(CLOUD_IMAGES.moderate); // Default image

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'App needs access to your location to fetch weather data.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission denied');
            return;
          }
        } catch (err) {
          console.warn(err);
        }
      }
      getLocation();
    };

    const getLocation = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    const fetchLocationName = async () => {
      if (location) {
        try {
          const response = await axios.get(GEOCODING_URL, {
            params: {
              lat: location.lat,
              lon: location.lon,
              appid: API_KEY,
              units: 'metric',
            },
          });
          const locationData = response.data;
          const cityName = locationData.name;
          const stateName = locationData.sys.country;
          setLocationName(`${cityName}, ${stateName}`);
        } catch (error) {
          console.error('Error fetching location name:', error);
        }
      }
    };

    const fetchWeatherData = async () => {
      if (location) {
        try {
          const response = await axios.get(GEOCODING_URL, {
            params: {
              lat: location.lat,
              lon: location.lon,
              appid: API_KEY,
              units: 'metric',
            },
          });
          const data = response.data;
          setWeatherData(data);

          // Update cloud image based on temperature
          const temp = data.main.temp;
          if (temp < 10) {
            setCloudImage(CLOUD_IMAGES.cold);
          } else if (temp >= 10 && temp <= 25) {
            setCloudImage(CLOUD_IMAGES.moderate);
          } else {
            setCloudImage(CLOUD_IMAGES.warm);
          }
        } catch (error) {
          console.error('Error fetching weather:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    requestLocationPermission();

    // Fetch location name and weather data initially
    fetchLocationName();
    fetchWeatherData();

    // Set up interval to refresh weather data every second
    const intervalId = setInterval(() => {
      fetchWeatherData();
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);

  }, [location]);

  if (loading) {
    return <ActivityIndicator size="large" color="#ffffff" />;
  }

  if (!weatherData) {
    return <Text style={styles.error}>Error loading weather data.</Text>;
  }

  const { main: { temp }, weather } = weatherData;
  const weatherDescription = weather[0]?.description || 'No description';

  return (
    <ImageBackground source={{ uri: cloudImage }} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.location}>{locationName || 'Loading location...'}</Text>
          <Text style={styles.city}>{weatherData.name}</Text>
          <Text style={styles.temp}>{temp}°C</Text>
          <Text style={styles.description}>{weatherDescription}</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  location: {
    fontSize: 14,
    color: 'black',
    marginBottom: 20,
    fontWeight: 'bold',
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  card: {
    backgroundColor: '#BFA100',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  city: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  temp: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  error: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default WeatherComponent;
