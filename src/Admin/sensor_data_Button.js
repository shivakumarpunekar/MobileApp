import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View, AppState } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';

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
  const initialized = useRef(false); // To track the initial load
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      appState.current = nextAppState;
    };

    AppState.addEventListener('change', handleAppStateChange);

    /* return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    }; */
  }, []);

  useEffect(() => {
    const handleStatusChange = (deviceId, heartIconColor, valveIconColor) => {
      const prevStatus = previousStatus.current[deviceId] || {};

      // Only send notifications if the app has been initialized, there's a change in status, and the app is not in the foreground
      if (initialized.current && appState.current !== 'active') {
        if (prevStatus.heartIconColor !== heartIconColor) {
          if (heartIconColor === '#00FF00') {
            sendNotification(deviceId, 'is running smoothly');
          } else if (heartIconColor === '#FF0000') {
            sendNotification(deviceId, 'has stopped');
          }
        }
        if (prevStatus.valveIconColor !== valveIconColor) {
          if (valveIconColor === '#00FF00') {
            sendNotification(deviceId, 'is running smoothly');
          } else if (valveIconColor === '#FF0000') {
            sendNotification(deviceId, 'has stopped');
          }
        }
      }

      // Update the previous status reference
      previousStatus.current[deviceId] = { heartIconColor, valveIconColor };
    };

    devices.forEach((deviceId) => {
      const deviceData = data.filter((item) => item.deviceId === deviceId);
      if (deviceData.length) {
        const solenoidValveStatus = deviceData[0].solenoidValveStatus;
        const createdDateTime = deviceData[0].createdDateTime;

        const currentDate = moment().format('DD-MM-YYYY');
        const formattedCreatedDateTime = moment(createdDateTime, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY');
        const heartIconColor = formattedCreatedDateTime === currentDate ? '#00FF00' : '#FF0000'; // Green if dates match, red otherwise

        let valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' : solenoidValveStatus === 'Off' ? '#FF0000' : '#808080'; // Default gray if null

        setDeviceStatus((prevStatus) => ({
          ...prevStatus,
          [deviceId]: { heartIconColor, valveIconColor }
        }));

        // Check for changes in status
        handleStatusChange(deviceId, heartIconColor, valveIconColor);
      }
    });

    // Mark as initialized after first data load
    if (!initialized.current) {
      initialized.current = true;
    }
  }, [data, devices]);

  const fetchData = () => {
    axios.get('http://103.145.50.185:2030/api/sensor_data/top100perdevice')
      .then(response => {
        setData(response.data);
        const uniqueDevices = [...new Set(response.data.map(item => item.deviceId))];
        setDevices(uniqueDevices);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // Fetch data every 1 second
    return () => clearInterval(interval);
  }, []);

  const handleButtonPress = (deviceId) => {
    navigation.navigate('SensorData', { deviceId, isAdmin: true });
  };

  const renderButtonsInGrid = () => {
    const rows = [];
    for (let i = 0; i < devices.length; i += 50) {
      const row = devices.slice(i, i + 50);
      rows.push(row);
    }

    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map(deviceId => {
          const deviceData = data.filter(item => item.deviceId === deviceId);
          const sensor1 = deviceData.length ? deviceData[0].sensor1_value : null;
          const sensor2 = deviceData.length ? deviceData[0].sensor2_value : null;
          const { heartIconColor, valveIconColor } = deviceStatus[deviceId] || {};

          let backgroundColor;
          let buttonText;

          if (sensor1 === null || sensor2 === null) {
            backgroundColor = '#808080'; // Gray for no data
            buttonText = `Device ${deviceId}`;
          } else if (
            (sensor1 >= 4000 || sensor1 <= 1250) &&
            (sensor2 >= 4000 || sensor2 <= 1250)
          ) {
            backgroundColor = '#ff0000'; // Red
            buttonText = `Device ${deviceId}`;
          } else if (
            (sensor1 >= 4000 || sensor1 <= 1250) ||
            (sensor2 >= 4000 || sensor2 <= 1250)
          ) {
            backgroundColor = '#FFA500'; // Yellow
            buttonText = `Device ${deviceId}`;
          } else {
            backgroundColor = '#00FF00'; // Green
            buttonText = `Device ${deviceId}`;
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
      <Text style={styles.headerText}>Device Detail Links</Text>
      {renderButtonsInGrid()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F6F3E7'
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
