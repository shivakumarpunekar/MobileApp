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

// Function to send notifications
// Function to send notifications
const sendNotification = (deviceId, heartIconColor, valveIconColor) => {
  const heartStatus = heartIconColor === '#FF0000' ? 'has stopped watering' : 'is started watering';
  const valveStatus = valveIconColor === '#FF0000' ? 'has stopped watering' : 'is started watering';
  
  const title = 'Device Status';
  const message = `Device ${deviceId}: Heart ${heartStatus}, Valve ${valveStatus}`;

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
  const [deviceStatus, setDeviceStatus] = useState({});
  const [previousStatus, setPreviousStatus] = useState({});
  const navigation = useNavigation();
  const [appState, setAppState] = useState(AppState.currentState);

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
    }, 1000); // Every 1 seconds

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
          minimumFetchInterval: 1, // Fetch every 1 minutes in background
          stopOnTerminate: false,
          startOnBoot: true,
        },
        async (taskId) => {
          console.log('[BackgroundFetch] taskId:', taskId);
          fetchData(); // Fetch data in the background
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
    userDevices.forEach(device => {
      const deviceId = device.deviceId;
      const deviceData = sensorData.filter(item => item.deviceId === deviceId);
      if (deviceData.length) {
        const solenoidValveStatus = deviceData[0].solenoidValveStatus;
        const createdDateTime = deviceData[0].createdDateTime;
  
        const currentDate = moment().format('DD-MM-YYYY');
        const formattedCreatedDateTime = moment(createdDateTime, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY');
        const heartIconColor = formattedCreatedDateTime === currentDate ? '#00FF00' : '#FF0000';
        let valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' : solenoidValveStatus === 'Off' ? '#FF0000' : '#808080';
  
        // Update the device status state
        setDeviceStatus(prevStatus => ({
          ...prevStatus,
          [deviceId]: { heartIconColor, valveIconColor }
        }));
  
        // Compare current status with previous status and send notifications accordingly
        const previous = previousStatus[deviceId] || {};
        const prevHeartColor = previous.heartIconColor;
        const prevValveColor = previous.valveIconColor;
  
        if (heartIconColor !== prevHeartColor || valveIconColor !== prevValveColor) {
          sendNotification(deviceId, heartIconColor, valveIconColor);
        }
  
        // Update the previous status
        setPreviousStatus(prevStatus => ({
          ...prevStatus,
          [deviceId]: { heartIconColor, valveIconColor }
        }));
      }
    });
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
    paddingBottom:10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  valveIcon: {
    marginLeft: 10,
  },
  spacer: {
    height: 20,
  },
});

export default DeviceTable;
