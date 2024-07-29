import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SensorDataButton = () => {
  const [data, setData] = useState([]);
  const [devices] = useState([1, 2, 3, 4, 5, 6]);
  const navigation = useNavigation();

  const fetchData = () => {
    axios.get('http://103.145.50.185:2030/api/sensor_data/top100perdevice')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // Fetch data every 1 seconds
    return () => clearInterval(interval);
  }, []);

  const handleButtonPress = (deviceId) => {
    navigation.navigate('SensorData', { deviceId });
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
          const solenoidValveStatus = deviceData.length ? deviceData[0].solenoidValveStatus : null;
          const dataCount = deviceData.length;

          let backgroundColor;
          let heartIconColor = solenoidValveStatus === 'On' ? '#00FF00' : '#FF0000'; // Green for on, Red for off
          let valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' : (solenoidValveStatus === 'Off' ? '#FF0000' : '#808080'); // Default gray if null
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
            backgroundColor = '#FFA500'; // Orange
            buttonText = `Device ${deviceId}`;
          } else {
            backgroundColor = '#00FF00'; // Green
            buttonText = `Device ${deviceId}`;
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
                {dataCount > 0}
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
  dataCount: {
    marginTop: 5,
    color: '#000',
    fontSize: 14,
  }
});

export default SensorDataButton;
