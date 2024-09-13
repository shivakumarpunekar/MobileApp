import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useRoute, useNavigation } from '@react-navigation/native';

const ValvaStatus = () => {
  const [sensorDates, setSensorDates] = useState([]);
  const [data, setData] = useState([]);
  const route = useRoute();
  const navigation = useNavigation();
  const { deviceId } = route.params;

  const fetchSensorDates = useCallback(async () => {
    try {
      const sensorResponse = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}/uniqueDatesLast30Days`);
      const sensorData = await sensorResponse.json();
      console.log("Fetched sensorData:", sensorData);
      setSensorDates(sensorData);

      // Fetch relay data after getting sensor dates
      fetchRelayData(); // This function is defined below
    } catch (error) {
      console.error("Error fetching sensor dates:", error);
      Alert.alert("Error", "Unable to fetch sensor dates. Please try again later.");
    }
  }, [deviceId]);

  const fetchRelayData = useCallback(async () => {
    try {
      const relayResponse = await fetch(`http://103.145.50.185:2030/api/relay_durations/StateDurations/${deviceId}`);
  
      // Check if the response status is OK
      if (!relayResponse.ok) {
        throw new Error(`HTTP error! Status: ${relayResponse.status}`);
      }
  
      // Check if the response body is empty
      const text = await relayResponse.text();
      if (!text) {
        console.log("Empty response body");
        return;
      }
  
      // Parse the response as JSON
      const relayData = JSON.parse(text);
      console.log("Fetched relayData:", relayData);
  
      if (Array.isArray(relayData) && relayData.length === 0) {
        Alert.alert("No Relay Data", "No relay data available for the last 30 days.");
      }
  
      // Only update state if there's new data
      if (JSON.stringify(data) !== JSON.stringify(relayData)) {
        setData(relayData);
      }
    } catch (error) {
      console.error("Error fetching relay data:", error);
      Alert.alert("Error", "Unable to fetch relay data. Please try again later.");
    }
  }, [deviceId, data]);
  

  useEffect(() => {
    fetchSensorDates(); // Fetch sensor dates immediately

    // Set interval to refresh data every 15 seconds
    const intervalId = setInterval(() => {
      fetchRelayData(); // Fetch relay data every 15 seconds
    }, 15000); // 15000 ms = 15 seconds

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchSensorDates, fetchRelayData]);

  return (
    <ScrollView style={styles.container}>
      <View>
        {data.length > 0 ? (
          data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.button}
              onPress={() => navigation.navigate('Valva_status_detail', { deviceId, date: item.day })}
            >
              <Text style={styles.buttonText}>
                Date: {new Date(item.day).toDateString()}
              </Text>
              <Text style={styles.buttonText}>
                On: {item.totalDurationOnMinutes} minutes
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>No data available.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F3E7',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#BFA100',
    marginBottom: 15,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noDataText: {
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ValvaStatus;
