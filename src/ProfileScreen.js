import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDataByIdFromApi, fetchuserProfileIdByLoginId } from './Api/api';

// Date formatter function
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ProfilePage = ({ loginId }) => {
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const storageKey = useMemo(() => `profileData_${loginId}`, [loginId]);

  // Fetch data function with optimization
  const fetchData = useCallback(async () => {
    try {
      const userProfileId = await fetchuserProfileIdByLoginId(loginId);
      if (!userProfileId) {
        throw new Error('User profile not found');
      }
      const result = await fetchDataByIdFromApi(userProfileId);
      setData(result);
      await AsyncStorage.setItem(storageKey, JSON.stringify(result)); // Save fetched data to AsyncStorage
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [loginId, storageKey]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, [fetchData]);

  // Load data from AsyncStorage and fetch latest data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(storageKey);
        if (cachedData) {
          setData(JSON.parse(cachedData));
          setLoading(false); // Set loading to false if cached data is found
        }
        fetchData(); // Fetch latest data in the background
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    initializeData();
  }, [storageKey, fetchData]);

  // Fetch data on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        {data ? (
          <>
            <View style={styles.curvedBackground}>
              <ImageBackground
                source={require('../assets/123.jpeg')}
                style={styles.backgroundImage}
              >
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('ProfileScreenEdit', { data })
                  }
                >
                  <Icon name="edit" size={30} color="#000" />
                </TouchableOpacity>
                <View style={styles.header}>
                  <View style={styles.leftHeader}>
                    <View style={styles.inputname}>
                      <Text style={styles.input}>{data.firstName}</Text>
                      <Text style={styles.input}>{data.middleName}</Text>
                      <Text style={styles.input}>{data.lastName}</Text>
                    </View>
                    <Text style={styles.email}>{data.email}</Text>
                  </View>
                  <Image
                    source={require('../assets/User-Avatar-Profile-PNG.png')}
                    style={styles.profileImage}
                  />
                </View>
              </ImageBackground>
            </View>
            <View style={styles.content}>
              {[
                { icon: 'calendar', label: 'Date of Birth', value: formatDate(data.dateOfBirth) },
                { icon: 'phone', label: 'Mobile Number', value: data.mobileNumber },
                { icon: 'user', label: 'User Name', value: data.userName },
                { icon: 'lock', label: 'Password', value: '*'.repeat(data.password.length) },
                { icon: 'globe', label: 'Country', value: data.country },
                { icon: 'map-marker', label: 'State', value: data.state },
                { icon: 'map', label: 'City', value: data.city },
                { icon: 'map-pin', label: 'Pincode', value: data.pincode }
              ].map((item, index) => (
                <View key={index} style={styles.section}>
                  <Icon
                    style={styles.sectionIcon}
                    name={item.icon}
                    size={30}
                    color="#BFA100"
                  />
                  <Text style={styles.sectionTitle}>{item.label}</Text>
                  <Text style={styles.sectionContent}>{item.value}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3E7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F3E7',
  },
  curvedBackground: {
    width: '100%',
    height: '30%',
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 100,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: 70,
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftHeader: {
    flex: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  inputname: {
    flexDirection: 'row',
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 5,
    marginBottom: 10,
    color: '#000',
  },
  email: {
    fontSize: 16,
    color: '#000',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  sectionIcon: {
    marginRight: 10,
    width: 40,
  },
  sectionTitle: {
    width: 150,
    fontWeight: 'bold',
  },
  sectionContent: {
    fontSize: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default ProfilePage;
