import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const DeviceTable = ({ loginId }) => {
  const [userDevices, setUserDevices] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const navigation = useNavigation();

  const fetchUserDevices = () => {
    return axios.get(`http://192.168.1.10:2030/api/UserDevice/byProfile/${loginId}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching user device data:', error);
        return [];
      });
  };

  const fetchSensorData = () => {
    return axios.get('http://192.168.1.10:2030/api/sensor_data/top100perdevice')
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching sensor data:', error);
        return [];
      });
  };

  const fetchData = () => {
    Promise.all([fetchUserDevices(), fetchSensorData()])
      .then(([userDevicesData, sensorData]) => {
        setUserDevices(userDevicesData);
        setSensorData(sensorData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Fetch data every 10 seconds
    return () => clearInterval(interval);
  }, [loginId]);

  const handleButtonPress = (deviceId) => {
    navigation.navigate('SensorData', { deviceId });
  };

  const getSensorValues = (deviceId) => {
    const deviceSensorData = sensorData.find(sensor => sensor.deviceId === deviceId);
    if (deviceSensorData) {
      return {
        sensor1: deviceSensorData.sensor1_value,
        sensor2: deviceSensorData.sensor2_value,
        solenoidValveStatus: deviceSensorData.solenoidValveStatus,
      };
    }
    return { sensor1: null, sensor2: null, solenoidValveStatus: null };
  };

  const renderButtonsInGrid = () => {
    const rows = [];
    for (let i = 0; i < userDevices.length; i += 3) {
      rows.push(userDevices.slice(i, i + 3));
    }

    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map(device => {
          const { deviceId, deviceStatus } = device;
          const { sensor1, sensor2, solenoidValveStatus } = getSensorValues(deviceId);

          let backgroundColor;
          let heartIconColor = solenoidValveStatus === "On" ? '#00FF00' : '#FF0000'; // Green for active, Red for inactive
          let valveIconColor = solenoidValveStatus === "On" ? '#00FF00' : '#FF0000'; // Green for on, Red for off
          let buttonText = `Device ${deviceId}`;

          if (sensor1 === null || sensor2 === null) {
            backgroundColor = '#808080'; // Gray for no data
          } else if (
            (sensor1 >= 4000 || sensor1 <= 1250) &&
            (sensor2 >= 4000 || sensor2 <= 1250)
          ) {
            backgroundColor = '#FF0000'; // Red
          } else if (
            (sensor1 >= 4000 || sensor1 <= 1250) ||
            (sensor2 >= 4000 || sensor2 <= 1250)
          ) {
            backgroundColor = '#FFA500'; // Orange
          } else {
            backgroundColor = '#00FF00'; // Green
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F3E7'
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
});

export default DeviceTable;
