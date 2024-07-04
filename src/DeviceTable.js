import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const DeviceDetailsScreen = () => {
  const [deviceDetails, setDeviceDetails] = useState([]);

  useEffect(() => {
    fetchDeviceDetails();
  }, []);

  const fetchDeviceDetails = async () => {
    try {
      const response = await get('http://10.0.2.2:2030/api/devicedetails/byId/${Id}');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // console.log('API Response Data:', data); 
      setDeviceDetails(data);
    } catch (error) {
      console.error('Error fetching device details:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.deviceId}</Text>
      <Text style={styles.cell}>{item.sensorId}</Text>
      <Text style={styles.cell}>{item.valveId}</Text>
      <Text style={styles.cell}>{item.valveStatus}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerCell}>DeviceId</Text>
        <Text style={styles.headerCell}>SensorId</Text>
        <Text style={styles.headerCell}>ValveId</Text>
        <Text style={styles.headerCell}>ValveStatus</Text>
      </View>
      <FlatList
        data={deviceDetails}
        renderItem={renderItem}
        keyExtractor={(item) => (item.deviceDetailId ? item.deviceDetailId.toString() : Math.random().toString())}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F6F3E7',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 17,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor:'#000',
    color:'#f0f0f0',
    fontSize:20,
  },
});

export default DeviceDetailsScreen;
