import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View, AppState } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';
import BackgroundFetch from 'react-native-background-fetch';
import PlantStatus from './User/PlantStatus';
import Bargraph from './User/bargraph';
import WeatherComponent from './WeatherService/WeatherComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to send notifications
const sendNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title: title,
    message: message,
    importance: 'high',
    priority: 'high',
    soundName: 'default',
    playSound: true,
    vibrate: true,
  });
};

const DeviceTable = ({ loginId }) => {
  if (!loginId) {
    console.error('loginId is undefined');
    return null; // or return some fallback UI
  }
  
  const [userDevices, setUserDevices] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [appState, setAppState] = useState(AppState.currentState);
  const navigation = useNavigation();

  // Fetch data function
  const fetchData = () => {
    Promise.all([
      axios.get(`http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`).then(response => response.data),
      axios.get('http://103.145.50.185:2030/api/sensor_data/top100perdevice').then(response => response.data),
    ])
      .then(([userDevicesData, sensorData]) => {
        setUserDevices(userDevicesData);
        setSensorData(sensorData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    // Fetch data initially
    fetchData();

    // Set up foreground auto-refresh with setInterval
    const interval = setInterval(() => {
      if (appState === 'active') {
        fetchData();
      }
    }, 1000); // Every 1 second

    // Listen to app state changes
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      clearInterval(interval);
      appStateListener.remove();
    };
  }, [loginId, appState]);

  useEffect(() => {
    // Handle background fetch setup
    const configureBackgroundFetch = () => {
      BackgroundFetch.configure(
        {
          minimumFetchInterval: 1, // Fetch every 1 minute in background
          stopOnTerminate: false,
          startOnBoot: true,
        },
        async (taskId) => {
          console.log('[BackgroundFetch] taskId:', taskId);
          fetchData();
          BackgroundFetch.finish(taskId);
        },
        (error) => {
          console.error("[BackgroundFetch] Failed to start:", error);
        }
      );
    };

    configureBackgroundFetch();
  }, []);

  // Function to get sensor values
  const getSensorValues = (deviceId) => {
    const deviceSensorData = sensorData.find(sensor => sensor.deviceId === deviceId);
    if (deviceSensorData) {
      return {
        sensor1: deviceSensorData.sensor1_value,
        sensor2: deviceSensorData.sensor2_value,
        solenoidValveStatus: deviceSensorData.solenoidValveStatus,
        createdDateTime: deviceSensorData.createdDateTime,
      };
    }
    return { sensor1: null, sensor2: null, solenoidValveStatus: null, createdDateTime: null };
  };

  // Handle notification logic based on device status
  useEffect(() => {
    const checkAndSendNotifications = async () => {
      const previousStatus = await AsyncStorage.getItem('deviceStatus');
      const parsedPreviousStatus = previousStatus ? JSON.parse(previousStatus) : {};

      userDevices.forEach(device => {
        const deviceId = device.deviceId;
        const deviceData = sensorData.find(item => item.deviceId === deviceId);

        if (deviceData) {
          const solenoidValveStatus = deviceData.solenoidValveStatus;
          const createdDateTime = deviceData.createdDateTime;

          const currentDate = moment().format('DD-MM-YYYY');
          const formattedCreatedDateTime = moment(createdDateTime, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY');
          const heartIconColor = formattedCreatedDateTime === currentDate ? '#00FF00' : '#FF0000';
          const valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' : solenoidValveStatus === 'Off' ? '#FF0000' : '#808080';

          const previousDeviceStatus = parsedPreviousStatus[deviceId] || {};
          const prevHeartColor = previousDeviceStatus.heartIconColor;
          const prevValveColor = previousDeviceStatus.valveIconColor;

          // Send separate notifications for heart and valve status changes
          if (heartIconColor !== prevHeartColor) {
            const heartTitle = 'Heart Status Change';
            const heartMessage = `Device ${deviceId}: Heart ${heartIconColor === '#FF0000' ? 'Today Not Active' : 'Today Active'}`;
            sendNotification(heartTitle, heartMessage);
          }

          if (valveIconColor !== prevValveColor) {
            const valveTitle = 'Valve Status Change';
            const valveMessage = `Device ${deviceId}: Valve ${valveIconColor === '#FF0000' ? 'has stopped watering' : 'is started watering'}`;
            sendNotification(valveTitle, valveMessage);
          }

          // Save the new status in AsyncStorage
          parsedPreviousStatus[deviceId] = { heartIconColor, valveIconColor };
        }
      });

      // Update AsyncStorage with the latest status
      await AsyncStorage.setItem('deviceStatus', JSON.stringify(parsedPreviousStatus));
    };

    checkAndSendNotifications();
  }, [sensorData, userDevices]);

  const handleButtonPress = (deviceId) => {
    navigation.navigate('SensorData', { deviceId, loginId });
  };

  const renderButtonsInGrid = () => {
    const rows = [];
    for (let i = 0; i < userDevices.length; i += 3) {
      rows.push(userDevices.slice(i, i + 3));
    }

    const currentDate = moment().format('DD-MM-YYYY');

    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map(device => {
          const { deviceId } = device;
          const { sensor1, sensor2, solenoidValveStatus, createdDateTime } = getSensorValues(deviceId);

          let backgroundColor;
          const formattedCreatedDateTime = createdDateTime ? moment(createdDateTime, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY') : '';
          const heartIconColor = formattedCreatedDateTime === currentDate ? '#00FF00' : '#FF0000';
          let valveIconColor = solenoidValveStatus === "On" ? '#00FF00' : '#FF0000';
          let buttonText = `Device ${deviceId}`;

          if (sensor1 === null || sensor2 === null) {
            backgroundColor = '#808080';
          } else if (
            (sensor1 >= 4000 || sensor1 <= 1250) &&
            (sensor2 >= 4000 || sensor2 <= 1250)
          ) {
            backgroundColor = '#FF0000';
          } else if (
            (sensor1 >= 4000 || sensor1 <= 1250) ||
            (sensor2 >= 4000 || sensor2 <= 1250)
          ) {
            backgroundColor = '#FFA500';
          } else {
            backgroundColor = '#00FF00';
          }

          return (
            <View key={deviceId} style={styles.buttonContainer}>
              <View style={styles.iconContainer}>
                <Icon name="heart" size={30} color={heartIconColor} />
                <Icon name="tachometer" size={30} color={valveIconColor} style={styles.valveIcon} />
              </View>
              <TouchableOpacity
                style={[styles.button, { backgroundColor }]}
                onPress={() => handleButtonPress(deviceId)}
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
      <Text style={styles.headerText}>Device Detail Links</Text>
      {renderButtonsInGrid()}
      <View style={styles.spacer} />
      <PlantStatus loginId={loginId} />
      <View style={styles.spacer} />
      <WeatherComponent />
      <Bargraph loginId={loginId} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F6F3E7',
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  valveIcon: {
    marginLeft: 10,
  },
  spacer: {
    height: 30,
  },
});

export default DeviceTable;
