import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, StyleSheet, ScrollView } from 'react-native';

const AdminHomeScreen = () => {
  const [combinedData, setCombinedData] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [devicesResponse, deviceDetailsResponse, userProfileResponse] = await Promise.all([
        fetch('http://10.0.2.2:2030/api/devices'),
        fetch('http://10.0.2.2:2030/api/devicedetails'),
        fetch('http://10.0.2.2:2030/api/userprofiles'),
      ]);
      if (!devicesResponse.ok || !deviceDetailsResponse.ok || !userProfileResponse.ok) {
        throw new Error('HTTP error! status: ' + devicesResponse.status + ' ' + deviceDetailsResponse.status + ' ' + userProfileResponse.status);
      }

      const devicesData = await devicesResponse.json();
      const deviceDetailsData = await deviceDetailsResponse.json();
      const userProfileData = await userProfileResponse.json();

      // Merge the data based on the common key `Id`
      const combinedData = deviceDetailsData.map(detail => {
        const device = devicesData.find(device => device.id === detail.id);
        const userProfile = userProfileData.find(profile => profile.userId === detail.userId);
        return {
          ...detail,
          ...device,
          userName: userProfile?.userName || '', 
          mobileNumber: userProfile?.mobileNumber || '', 
        };
      });

      setCombinedData(combinedData);
      setUserProfiles(userProfileData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderItem = ({ item }) => {
    // Format the createdDate
    const formattedDate = item.createdDate ? new Date(item.createdDate).toLocaleDateString() : '';
  
    return (
        
      <View style={styles.row}>
        {/* <Text style={styles.cell}>{item.id}</Text> */}
        <Text style={styles.cell}>{item.userName}</Text>
        <Text style={styles.cell}>{item.mobileNumber}</Text>
        <Text style={styles.cell}>{item.deviceId}</Text>
        <Text style={styles.cell}>{formattedDate}</Text>
        <Text style={styles.cell}>{item.sensorId}</Text>
        <Text style={styles.cell}>{item.valveId}</Text>
        <Text style={styles.cell}>{item.valveStatus}</Text>
      </View>
    );
  };

  return (
    <ScrollView horizontal={true} vertical={true} style={styles.container}>
    <View style={styles.container}>
    
      <View style={styles.header}>
        {/* <Text style={styles.headerCell}>id</Text> */}
        <Text style={styles.headerCell}>userName</Text>
        <Text style={styles.headerCell}>mobileNumber</Text>
        <Text style={styles.headerCell}>deviceId</Text>
        <Text style={styles.headerCell}>createdDate</Text>
        <Text style={styles.headerCell}>Sensor Id</Text>
        <Text style={styles.headerCell}>Valve Id</Text>
        <Text style={styles.headerCell}>Valve Status</Text>
        
      </View>
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
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
    backgroundColor: '#000',
    color: '#f0f0f0',
    fontSize: 20,
    width:150,
  },
});

export default AdminHomeScreen;
