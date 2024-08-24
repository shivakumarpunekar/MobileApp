import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRoute } from '@react-navigation/native';

const Valva_status_detail = () => {
  const [data, setData] = useState([]);
  const route = useRoute();
  const { deviceId, date } = route.params;

  const fetchSensorData = async () => {
    try {
      // const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/date/${date}/device/${deviceId}`);
      const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/date/${date}/device/${deviceId}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 1000);
    return () => clearInterval(intervalId);
  }, [deviceId, date]);

  const renderItemContainerStyle = (sensor1, sensor2) => {
    if ((sensor1 >= 4000 && sensor2 >= 4000) ||
      (sensor1 <= 1250 && sensor2 <= 1250) ||
      (sensor1 >= 4000 && sensor2 <= 1250) ||
      (sensor1 <= 1250 && sensor2 >= 4000)) {
      return styles.itemContainerRed;
    } else {
      return styles.itemContainerGreen;
    }
  };

  const renderItemTextStyle = (sensor1, sensor2) => {
    if ((sensor1 >= 4000 && sensor2 >= 4000) ||
      (sensor1 <= 1250 && sensor2 <= 1250) ||
      (sensor1 >= 4000 && sensor2 <= 1250) ||
      (sensor1 <= 1250 && sensor2 >= 4000)) {
      return styles.itemTextWhite;
    } else {
      return styles.itemText;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.itemContainer, renderItemContainerStyle(item.sensor1_value, item.sensor2_value)]}>
            <Text style={renderItemTextStyle(item.sensor1_value, item.sensor2_value)}>Device Id: {item.deviceId}</Text>
            <Text style={renderItemTextStyle(item.sensor1_value, item.sensor2_value)}>Sensor-1: {item.sensor1_value}</Text>
            <Text style={renderItemTextStyle(item.sensor1_value, item.sensor2_value)}>Sensor-2: {item.sensor2_value}</Text>
            <Text style={renderItemTextStyle(item.sensor1_value, item.sensor2_value)}>Valve Status: {item.solenoidValveStatus}</Text>
            <Text style={renderItemTextStyle(item.sensor1_value, item.sensor2_value)}>Date Time: {item.createdDateTime}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F3E7',
  },
  itemContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
  },
  itemContainerGreen: {
    backgroundColor: '#7fff00', // Default green background
  },
  itemContainerRed: {
    backgroundColor: '#ff0000', // Red background for specific condition
  },
  itemText: {
    fontSize: 16,
    color: '#000', // Default text color
  },
  itemTextWhite: {
    fontSize: 16,
    color: '#fff', // White text color for red background
  },
});

export default Valva_status_detail;
