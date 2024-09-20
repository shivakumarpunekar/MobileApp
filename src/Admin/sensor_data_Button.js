import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';

const CACHE_KEY = 'sensorDataCache';

const sendNotification = (deviceId, message) => {
  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title: 'Device Status Alert',
    message: `Device ${deviceId}: ${message}`,
    importance: 'high',
    priority: 'high',
    soundName: 'default',
    playSound: true,
    vibrate: true,
  });
};

const SensorDataButton = ({ isAdmin }) => {
  const [data, setData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState({});
  const previousStatus = useRef({});
  const initialized = useRef(false);
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);
  console.log('this is a admin', isAdmin);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      appState.current = nextAppState;
    };
    AppState.addEventListener('change', handleAppStateChange);
    return () => AppState.removeEventListener('change', handleAppStateChange);
  }, []);

  useEffect(() => {
    const handleStatusChange = (deviceId, heartIconColor, valveIconColor) => {
      const prevStatus = previousStatus.current[deviceId] || {};
      if (initialized.current && appState.current !== 'active') {
        if (prevStatus.heartIconColor !== heartIconColor) {
          sendNotification(deviceId, heartIconColor === '#00FF00' ? 'is running smoothly' : 'has stopped');
        }
        if (prevStatus.valveIconColor !== valveIconColor) {
          sendNotification(deviceId, valveIconColor === '#00FF00' ? 'is running smoothly' : 'has stopped');
        }
      }
      previousStatus.current[deviceId] = { heartIconColor, valveIconColor };
    };

    devices.forEach((deviceId) => {
      const deviceData = data.find((item) => item.deviceId === deviceId);
      if (deviceData) {
        const { solenoidValveStatus, createdDateTime } = deviceData;
        const currentDate = moment().format('DD-MM-YYYY');
        const formattedCreatedDateTime = moment(createdDateTime, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY');
        const heartIconColor = formattedCreatedDateTime === currentDate ? '#00FF00' : '#FF0000';
        const valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' : solenoidValveStatus === 'Off' ? '#FF0000' : '#808080';
        
        setDeviceStatus((prevStatus) => ({
          ...prevStatus,
          [deviceId]: { heartIconColor, valveIconColor },
        }));

        handleStatusChange(deviceId, heartIconColor, valveIconColor);
      }
    });

    if (!initialized.current) initialized.current = true;
  }, [data, devices]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://103.145.50.185:2030/api/sensor_data/top100perdevice');
      const fetchedData = response.data;
      setData(fetchedData);
      const uniqueDevices = [...new Set(fetchedData.map((item) => item.deviceId))];
      setDevices(uniqueDevices);

      // Cache the fetched data
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fetchedData));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setData(parsedData);
        const uniqueDevices = [...new Set(parsedData.map((item) => item.deviceId))];
        setDevices(uniqueDevices);
      } else {
        fetchData(); // Fetch if no cache available
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  useEffect(() => {
    loadCachedData(); // Load data from cache on first load
    const interval = setInterval(fetchData, 60000); // Fetch data every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const handleButtonPress = (deviceId) => {
    navigation.navigate('SensorData', { deviceId, isAdmin });
  };

  const renderButtonsInGrid = () => {
    const rows = [];
    for (let i = 0; i < devices.length; i += 50) {
      const row = devices.slice(i, i + 50);
      rows.push(row);
    }
    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((deviceId) => {
          const deviceData = data.find((item) => item.deviceId === deviceId);
          const sensor1 = deviceData ? deviceData.sensor1_value : null;
          const sensor2 = deviceData ? deviceData.sensor2_value : null;
          const { heartIconColor, valveIconColor } = deviceStatus[deviceId] || {};

          let backgroundColor;
          let buttonText = `Device ${deviceId}`;

          if (sensor1 === null || sensor2 === null) {
            backgroundColor = '#808080'; // Gray for no data
          } else if (
            (sensor1 >= 4000 || sensor1 <= 1250) &&
            (sensor2 >= 4000 || sensor2 <= 1250)
          ) {
            backgroundColor = '#ff0000'; // Red
          } else if (
            (sensor1 >= 4000 || sensor1 <= 1250) ||
            (sensor2 >= 4000 || sensor2 <= 1250)
          ) {
            backgroundColor = '#FFA500'; // Yellow
          } else {
            backgroundColor = '#00FF00'; // Green
          }

          return (
            <View key={deviceId} style={styles.buttonContainer}>
              <View style={styles.iconContainer}>
                <Icon name="heartbeat" size={30} color={heartIconColor} />
                <Icon name="tachometer" size={30} color={valveIconColor} style={styles.valveIcon} />
              </View>
              <TouchableOpacity
                key={deviceId}
                style={[styles.button, { backgroundColor }]}
                onPress={() => handleButtonPress(deviceId, isAdmin)}
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Devices</Text>
      {renderButtonsInGrid()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F6F3E7',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    margin: 5,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  valveIcon: {
    marginLeft: 10,
  },
});

export default SensorDataButton;
