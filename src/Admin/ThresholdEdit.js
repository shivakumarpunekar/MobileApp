import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

const ThresholdEdit = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [threshold, setThreshold] = useState({
    userProfileId: '',
    deviceId: '',
    threshold_1: '',
    threshold_2: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchThresholdDetails = async () => {
      const { id } = route.params;
      if (!id) {
        Alert.alert('Error', 'No ID provided.');
        navigation.goBack();
        return;
      }
      try {
        const response = await axios.get(`http://192.168.1.10:2030/api/Threshold/${id}`);
        setThreshold({
          userProfileId: response.data.userProfileId.toString(),
          deviceId: response.data.deviceId.toString(),
          threshold_1: response.data.threshold_1.toString(),
          threshold_2: response.data.threshold_2.toString(),
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching threshold details:', error);
        Alert.alert('Error', 'Failed to load threshold details.');
        setIsLoading(false);
      }
    };

    fetchThresholdDetails();
  }, [route.params, navigation]);

  const handleSubmit = () => {
    if (!threshold.threshold_1 || !threshold.threshold_2) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
  
    // Convert values to integers
    const userProfileId = parseInt(threshold.userProfileId, 10);
    const deviceId = parseInt(threshold.deviceId, 10);
    const threshold_1 = parseInt(threshold.threshold_1, 10);
    const threshold_2 = parseInt(threshold.threshold_2, 10);
  
    // Build the request URL with query parameters
    const url = `http://192.168.1.10:2030/api/Threshold/${route.params.id}?userProfileId=${userProfileId}&deviceId=${deviceId}&Threshold_1=${threshold_1}&Threshold_2=${threshold_2}`;
  
    // Log the URL for debugging
    console.log('PUT request URL:', url);
  
    axios.put(url)
      .then(response => {
        Alert.alert('Success', 'Threshold updated successfully.');
        navigation.goBack();
      })
      .catch(error => {
        if (error.response && error.response.data) {
          Alert.alert('Error', error.response.data);
        } else {
          Alert.alert('Error', 'There was an error updating the threshold.');
        }
      });
  };
  
  

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>User Profile ID:</Text>
        <Text style={styles.input}>{threshold.userProfileId}</Text>

        <Text style={styles.label}>Device ID:</Text>
        <Text style={styles.input}>{threshold.deviceId}</Text>

        <Text style={styles.label}>Threshold 1:</Text>
        <TextInput
          style={styles.input}
          value={threshold.threshold_1}
          onChangeText={(text) => setThreshold({ ...threshold, threshold_1: text })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Threshold 2:</Text>
        <TextInput
          style={styles.input}
          value={threshold.threshold_2}
          onChangeText={(text) => setThreshold({ ...threshold, threshold_2: text })}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F6F3E7',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#333',
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#BFA100',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ThresholdEdit;
