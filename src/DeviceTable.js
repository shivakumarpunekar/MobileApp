import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, StyleSheet, Alert } from 'react-native';

const DeviceTable = ({ loginId, profileID }) => {
  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [loginId, profileID]);

  const fetchData = async () => {
    try {
      const [devicesResponse, deviceDetailsResponse] = await Promise.all([
        fetch(`http://192.168.1.10:2030/api/devices?loginId=${loginId}`),
        fetch(`http://192.168.1.10:2030/api/devicedetails?loginId=${loginId}`),
      ]);

      if (!devicesResponse.ok || !deviceDetailsResponse.ok) {
        throw new Error('HTTP error! status: ' + devicesResponse.status + ' ' + deviceDetailsResponse.status);
      }

      const devicesData = await devicesResponse.json();
      const deviceDetailsData = await deviceDetailsResponse.json();

      // Merge the data based on the common key `Id`
      const combinedData = deviceDetailsData.map(detail => {
        const device = devicesData.find(device => device.id === detail.id);
        return {
          ...detail,
          ...device,
        };
      });

      // Filter combinedData based on loginId 
      const filteredData = combinedData.filter(item => item.loginId === loginId && item.profileID === profileID);

      if (filteredData.length === 0) {
        console.log('No devices available for this loginId');
        Alert('No devices available for this loginId ');
      }

      setCombinedData(filteredData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  //This is a date formate
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.deviceId}</Text>
      <Text style={styles.cell}>{formatDate(item.createdDate)}</Text>
      <Text style={styles.cell}>{item.sensor_1}</Text>
      <Text style={styles.cell}>{item.sensor_2}</Text>
      <Text style={styles.cell}>{item.valveId}</Text>
      <Text style={styles.cell}>{item.valveStatus}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerCell}>DeviceId</Text>
        <Text style={styles.headerCell}>CreatedDate</Text>
        <Text style={styles.headerCell}>Sensor 1</Text>
        <Text style={styles.headerCell}>Sensor 2</Text>
        <Text style={styles.headerCell}>Valve Id</Text>
        <Text style={styles.headerCell}>Valve Status</Text>
      </View>
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
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
    backgroundColor: '#000',
    color: '#f0f0f0',
    fontSize: 14,
  },
});

export default DeviceTable;
