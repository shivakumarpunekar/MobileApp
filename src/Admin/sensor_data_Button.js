import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, ScrollView, Text } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const SensorDataButton = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get('http://10.0.2.2:2030/api/sensor_data')
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Sensor Data Button</Text>
      {data
        .map(item => item.deviceId)
        .filter((value, index, self) => self.indexOf(value) === index) // Unique device IDs
        .sort((a, b) => a - b) // Sort in ascending order
        .map(deviceId => (
          <View key={deviceId} style={styles.buttonContainer}>
            <Button
              title={`Device ${deviceId}`}
              onPress={() => handleButtonPress(deviceId)}
            />
          </View>
        ))
      }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    margin: 10,
  },
});

export default SensorDataButton;
