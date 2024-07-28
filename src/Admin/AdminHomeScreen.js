import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, StyleSheet, ScrollView, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AdminHomeScreen = () => {
  const [combinedData, setCombinedData] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCombinedData();
  }, []);

  const fetchCombinedData = async () => {
    try {
      const response = await fetch('http://103.145.50.185:2030/api/CombinedData');
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }

      const data = await response.json();
      setCombinedData(data);
    } catch (error) {
      console.error('Error fetching combined data:', error);
    }
  };

  const renderItem = ({ item }) => {
    // Format the createdDate
    const formattedDate = item.createdDate ? new Date(item.createdDate).toLocaleDateString() : '';

    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{item.userName}</Text>
        <Text style={styles.cell}>{item.mobileNumber}</Text>
        <Text style={styles.cell}>{item.deviceId}</Text>
        <Text style={styles.cell}>{formattedDate}</Text>
        <Text style={styles.cell}>{item.sensor_1}</Text>
        <Text style={styles.cell}>{item.sensor_2}</Text>
        <Text style={styles.cell}>{item.valveId}</Text>
        <Text style={styles.cell}>{item.valveStatus}</Text>
      </View>
    );
  };

  return (
    <ScrollView horizontal={true} vertical={true} style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerCell}>User Name</Text>
          <Text style={styles.headerCell}>Mobile Number</Text>
          <Text style={styles.headerCell}>Device ID</Text>
          <Text style={styles.headerCell}>Created Date</Text>
          <Text style={styles.headerCell}>Sensor 1</Text>
          <Text style={styles.headerCell}>Sensor 2</Text>
          <Text style={styles.headerCell}>Valve ID</Text>
          <Text style={styles.headerCell}>Valve Status</Text>
        </View>
        <FlatList
          data={combinedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.deviceId.toString()}
        />
        <Button
          title="View Bar Chart"
          onPress={() => navigation.navigate('Chart', { combinedData })}
        />
      </View>
    </ScrollView>
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
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 14,
    width: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default AdminHomeScreen;
