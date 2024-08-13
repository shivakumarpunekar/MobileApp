import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, StyleSheet, Dimensions, TextInput, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// Utility function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};


const Threshold = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState([]);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchUserProfiles();
    }
  }, [isFocused]);

  useEffect(() => {
    filterProfiles();
  }, [searchQuery, userProfiles]);

  const fetchUserProfiles = async () => {
    try {
      const response = await fetch('http://103.145.50.185:2030/api/Threshold');
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
    ); userProfileId
    setFilteredProfiles(filtered);
  };

  const renderUserProfile = ({ item, index }) => (
    <View style={[styles.userProfileRow, { backgroundColor: index % 2 === 0 ? '#F6F3E7' : '#fff' }]}>
      <Text style={[styles.cell]}>{item.userProfileId}</Text>
      <Text style={[styles.cell]}>{item.deviceId}</Text>
      <Text style={[styles.cell]}>{item.threshold_1}</Text>
      <Text style={[styles.cell]}>{item.threshold_2}</Text>
      <Text style={[styles.cell]}>{item.createdDateTime}</Text>
      <Text style={[styles.cell]}>{item.updatedDateTime}</Text>
    </View>
  );

  const keyExtractor = (item, index) => index.toString();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Profiles</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchQuery} userProfileId
        onChangeText={setSearchQuery}
      />
      <ScrollView horizontal>
        <View style={{ flex: 1 }}>
          <View style={[styles.headerRow, { backgroundColor: '#F6F3E7' }]}>
            <Text style={[styles.headerCell, { width: 200 }]}>userProfileId</Text>
            <Text style={[styles.headerCell, { width: 200 }]}>deviceId</Text>
            <Text style={[styles.headerCell, { width: 200 }]}>Threshold_1</Text>
            <Text style={[styles.headerCell, { width: 200 }]}>Threshold_2</Text>
            <Text style={[styles.headerCell, { width: 200 }]}>createDateTime</Text>
            <Text style={[styles.headerCell, { width: 200 }]}>UpdatedDateTime</Text>
          </View>
          <FlatList
            data={filteredProfiles}
            renderItem={renderUserProfile}
            keyExtractor={keyExtractor}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Tresholdreg')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
    width: 200,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#BFA100',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
});

export default Threshold;