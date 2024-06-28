import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

const DeviceDetailsScreen = () => {
  const [deviceDetails, setDeviceDetails] = useState([]);

  useEffect(() => {
    fetchDeviceDetails();
  }, []);

  const fetchDeviceDetails = async () => {
    try {
      const response = await fetch('http://10.0.2.2:2030/api/devicedetails');
      console.log('Request Payload:', data);
      const data = await response.json();
      setDeviceDetails(data); // Assuming data is an array of devicedetail objects
    } catch (error) {
      console.error('Error fetching device details:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', padding: 10 }}>
      <Text style={{ flex: 1 }}>{item.DeviceId}</Text>
      <Text style={{ flex: 1 }}>{item.SensorId}</Text>
      <Text style={{ flex: 1 }}>{item.ValveId}</Text>
      <Text style={{ flex: 1 }}>{item.ValveStatus}</Text>
    </View>
  );

  return (
    <FlatList
      data={deviceDetails}
      renderItem={renderItem}
      keyExtractor={(item) => (item.DeviceDetailId ? item.DeviceDetailId.toString() : Math.random().toString())}
      ListHeaderComponent={() => (
        <View style={{ flexDirection: 'row', padding: 10 }}>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>DeviceId</Text>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>SensorId</Text>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>ValveId</Text>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>ValveStatus</Text>
        </View>
      )}
    />
  );
};

export default DeviceDetailsScreen;
