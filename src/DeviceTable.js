import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View, AppState, FlatList } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';
import BackgroundFetch from 'react-native-background-fetch';
import PlantStatus from './User/PlantStatus';
import Bargraph from './User/bargraph';
import { fetchData } from './Api/api';
import WeatherComponent from './WeatherService/WeatherComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sendNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title,
    message,
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
    return null;
  }

  const [userDevices, setUserDevices] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [appState, setAppState] = useState(AppState.currentState);
  const navigation = useNavigation();

  // Fetch and cache data in intervals with memoization
  const fetchDataWithLoginId = useCallback(() => {
    fetchData(loginId, setUserDevices, setSensorData);
  }, [loginId]);

  useEffect(() => {
    fetchDataWithLoginId();
  
    const interval = setInterval(() => {
      if (appState === 'active') {
        fetchDataWithLoginId();
      }
    }, 5000);  // Reduced API call interval

    const appStateListener = AppState.addEventListener('change', setAppState);
  
    return () => {
      clearInterval(interval);
      appStateListener.remove();
    };
  }, [fetchDataWithLoginId, appState]);

  useEffect(() => {
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 5, // Changed to 5 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      },
      async (taskId) => {
        fetchDataWithLoginId();
        BackgroundFetch.finish(taskId);
      },
      (error) => {
        console.error("[BackgroundFetch] Failed to start:", error);
      }
    );
  }, [fetchDataWithLoginId]);

  const getSensorValues = useCallback((deviceId) => {
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
  }, [sensorData]);

  useEffect(() => {
    const checkAndSendNotifications = async () => {
      const previousStatus = await AsyncStorage.getItem('deviceStatus');
      const parsedPreviousStatus = previousStatus ? JSON.parse(previousStatus) : {};

      userDevices.forEach(device => {
        const deviceId = device.deviceId;
        const deviceData = sensorData.find(item => item.deviceId === deviceId);

        if (deviceData) {
          const solenoidValveStatus = deviceData.solenoidValveStatus;
          const valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' : '#FF0000';

          const previousDeviceStatus = parsedPreviousStatus[deviceId] || {};
          const prevValveColor = previousDeviceStatus.valveIconColor;

          if (valveIconColor !== prevValveColor) {
            const valveTitle = 'aairos Technologies';
            const valveMessage = `Device ${valveIconColor === '#FF0000' ? 'has stopped watering' : 'is started watering'}`;
            sendNotification(valveTitle, valveMessage);
          }

          parsedPreviousStatus[deviceId] = { valveIconColor };
        }
      });

      await AsyncStorage.setItem('deviceStatus', JSON.stringify(parsedPreviousStatus));
    };

    checkAndSendNotifications();
  }, [sensorData, userDevices]);

  const handleButtonPress = useCallback((deviceId) => {
    navigation.navigate('SensorData', { deviceId, loginId });
  }, [navigation, loginId]);

  const renderDeviceItem = useCallback(({ item: device }) => {
    const { deviceId } = device;
    const { sensor1, sensor2, solenoidValveStatus, createdDateTime } = getSensorValues(deviceId);

    let backgroundColor;
    const formattedCreatedDateTime = createdDateTime ? moment(createdDateTime, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY') : '';
    const heartIconColor = formattedCreatedDateTime === moment().format('DD-MM-YYYY') ? '#00FF00' : '#FF0000';
    const valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' : '#FF0000';

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
      <View style={styles.buttonContainer}>
        <View style={styles.iconContainer}>
          <Icon name="heart" size={30} color={heartIconColor} />
          <Icon name="tachometer" size={30} color={valveIconColor} style={styles.valveIcon} />
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor }]}
          onPress={() => handleButtonPress(deviceId)}
        >
          <Text style={styles.buttonText}>Device {deviceId}</Text>
        </TouchableOpacity>
      </View>
    );
  }, [getSensorValues, handleButtonPress]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Device Detail Links</Text>
      <FlatList
        data={userDevices}
        renderItem={renderDeviceItem}
        keyExtractor={device => device.deviceId.toString()}
        numColumns={3} // Three devices per row
        columnWrapperStyle={styles.row}
      />
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
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
