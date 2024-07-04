import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, StyleSheet, Dimensions } from "react-native";

const AdminProfileScreen = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  const fetchUserProfiles = async () => {
    try {
      const response = await fetch('http://10.0.2.2:2030/api/userprofiles');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setUserProfiles(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderUserProfile = ({ item, index }) => (
    
    <View style={[styles.userProfileRow, { backgroundColor: index % 2 === 0 ? '#F6F3E7' : '#fff' }]}>
      <Text style={[styles.cell]}>{item.firstName}</Text>
      <Text style={[styles.cell]}>{item.middleName}</Text>
      <Text style={[styles.cell]}>{item.lastName}</Text>
      <Text style={[styles.cell, {width: 250}]}>{item.email}</Text>
      <Text style={[styles.cell]}>{item.mobileNumber}</Text>
      <Text style={[styles.cell]}>{item.dateOfBirth}</Text>
      <Text style={[styles.cell]}>{item.userName}</Text>
      <Text style={[styles.cell]}>{item.password}</Text>
      <Text style={[styles.cell]}>{item.country}</Text>
      <Text style={[styles.cell]}>{item.state}</Text>
      <Text style={[styles.cell]}>{item.city}</Text>
      <Text style={[styles.cell]}>{item.pincode}</Text>
      {/* Add more fields as needed */}
    </View>
  );

  const keyExtractor = (item, index) => index.toString(); // Use index as key

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Profiles</Text>
      <ScrollView horizontal>
        <View style={{ flex: 1 }}>
          <View style={[styles.headerRow, { backgroundColor: '#F6F3E7' }]}>
            <Text style={[styles.headerCell, { width: 100 }]}>First Name</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Middle Name</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Last Name</Text>
            <Text style={[styles.headerCell, { width: 250 }]}>Email</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Mobile</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Date of Birth</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Username</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Password</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Country</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>State</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>City</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Pincode</Text>
            {/* Add more headers as needed */}
          </View>
          <FlatList
            data={userProfiles}
            renderItem={renderUserProfile}
            keyExtractor={keyExtractor}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#000',
    fontSize: 20,
    textAlign: 'center',
    paddingVertical: 10,
  },
  userProfileRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    padding: 10,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 10,
    width: 100, 
  },
});

export default AdminProfileScreen;
