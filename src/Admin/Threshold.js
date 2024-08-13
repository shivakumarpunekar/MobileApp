import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, FlatList, StyleSheet, Dimensions, TextInput, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const Threshold = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [headerWidths, setHeaderWidths] = useState({});

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Refs to measure header text widths
  const headerRefs = useRef([]);

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
    );
    setFilteredProfiles(filtered);
  };

  const measureHeaderWidths = () => {
    const widths = {};
    headerRefs.current.forEach((ref, index) => {
      ref.measure((x, y, width) => {
        widths[index] = width;
        if (Object.keys(widths).length === headerRefs.current.length) {
          setHeaderWidths(widths);
        }
      });
    });
  };

  useEffect(() => {
    measureHeaderWidths();
  }, []);

  const renderUserProfile = ({ item, index }) => (
    <View style={[styles.userProfileRow, { backgroundColor: index % 2 === 0 ? '#F6F3E7' : '#fff' }]}>
      <Text style={[styles.cell, { width: headerWidths[0] || 'auto' }]}>{item.userProfileId}</Text>
      <Text style={[styles.cell, { width: headerWidths[1] || 'auto' }]}>{item.deviceId}</Text>
      <Text style={[styles.cell, { width: headerWidths[2] || 'auto' }]}>{item.threshold_1}</Text>
      <Text style={[styles.cell, { width: headerWidths[3] || 'auto' }]}>{item.threshold_2}</Text>
      <Text style={[styles.cell, { width: headerWidths[4] || 'auto' }]}>{item.createdDateTime}</Text>
      <Text style={[styles.cell, { width: headerWidths[5] || 'auto' }]}>{item.updatedDateTime}</Text>
      <TouchableOpacity
        style={styles.updateButton}
        onPress={() => navigation.navigate('ThresholdEdit', { id: item.id })}
      >
        <Icon name="edit" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const keyExtractor = (item, index) => index.toString();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Threshold</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <ScrollView horizontal>
        <View style={{ flex: 1 }}>
          <View style={[styles.headerRow, { backgroundColor: '#F6F3E7' }]}>
            {['userProfileId', 'deviceId', 'Threshold_1', 'Threshold_2', 'createdDateTime', 'updatedDateTime', 'Actions'].map((title, index) => (
              <Text
                key={index}
                style={[styles.headerCell, { width: headerWidths[index] || 'auto' }]}
                ref={(ref) => { if (ref) headerRefs.current[index] = ref; }}
                onLayout={() => measureHeaderWidths()}
              >
                {title}
              </Text>
            ))}
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
    backgroundColor: '#F6F3E7',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    backgroundColor: '#F6F3E7',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  userProfileRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  updateButton: {
    backgroundColor: '#BFA100',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default Threshold;
