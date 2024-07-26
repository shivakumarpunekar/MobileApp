import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, StyleSheet, Dimensions, TextInput } from "react-native";

// Utility function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};


const AdminProfileScreen = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState([]);

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchQuery, userProfiles]);

  const fetchUserProfiles = async () => {
    try {
      const response = await fetch('http://192.168.1.10:2030/api/userprofiles');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setUserProfiles(data);
      setFilteredProfiles(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filterProfiles = () => {
    if (!searchQuery) {
      setFilteredProfiles(userProfiles);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = userProfiles.filter(profile =>
      Object.values(profile).some(value =>
        String(value).toLowerCase().includes(query)
      )
    );
    setFilteredProfiles(filtered);
  };

  const renderUserProfile = ({ item, index }) => (
    <View style={[styles.userProfileRow, { backgroundColor: index % 2 === 0 ? '#F6F3E7' : '#fff' }]}>
      <Text style={[styles.cell]}>{item.firstName}</Text>
      <Text style={[styles.cell]}>{item.middleName}</Text>
      <Text style={[styles.cell]}>{item.lastName}</Text>
      <Text style={[styles.cell, { width: 250 }]}>{item.email}</Text>
      <Text style={[styles.cell]}>{item.mobileNumber}</Text>
      <Text style={[styles.cell]}>{formatDate(item.dateOfBirth)}</Text>
      <Text style={[styles.cell]}>{item.userName}</Text>
      <Text style={[styles.cell]}>{item.password}</Text>
      <Text style={[styles.cell]}>{item.country}</Text>
      <Text style={[styles.cell]}>{item.state}</Text>
      <Text style={[styles.cell]}>{item.city}</Text>
      <Text style={[styles.cell]}>{item.pincode}</Text>
    </View>
  );

  const keyExtractor = (item, index) => index.toString();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Profiles</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
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
          </View>
          <FlatList
            data={filteredProfiles}
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
    backgroundColor: '#F6F3E7'
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
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
