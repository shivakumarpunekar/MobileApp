import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const SensorDataButton = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get('http://192.168.1.10:2030/api/sensor_data')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleButtonPress = (deviceId) => {
    navigation.navigate('SensorData', { deviceId });
  };

  const renderButtonsInGrid = () => {
    const deviceIds = data
      .map(item => item.deviceId)
      .filter((value, index, self) => self.indexOf(value) === index) // Unique device IDs
      .sort((a, b) => a - b); // Sort in ascending order

    const rows = [];
    for (let i = 0; i < deviceIds.length; i += 4) {
      const row = deviceIds.slice(i, i + 4);
      rows.push(row);
    }

    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map(deviceId => {
          const deviceData = data.filter(item => item.deviceId === deviceId);
          const sensor1 = deviceData.length ? deviceData[0].sensor1_value : 0;
          const sensor2 = deviceData.length ? deviceData[0].sensor2_value : 0;

          const backgroundColor = (sensor1 >= 4000 && sensor2 >= 4000) ||
            (sensor1 <= 1250 && sensor2 <= 1250) ||
            (sensor1 >= 4000 && sensor2 <= 1250) ||
            (sensor1 <= 1250 && sensor2 >= 4000) ?
            '#ff0000' : '#7fff00'; // Red or green based on conditions

          return (
            <TouchableOpacity
              key={deviceId}
              style={[styles.button, { backgroundColor }]}
              onPress={() => handleButtonPress(deviceId)}
            >
              <Text style={styles.buttonText}>{`Device ${deviceId}`}</Text>
            </TouchableOpacity>
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
    flex: 1,
    maxWidth: '22%', 
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SensorDataButton;
