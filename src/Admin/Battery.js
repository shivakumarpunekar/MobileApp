import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Battery = ({ deviceId }) => {
  const [batteryPercentage, setBatteryPercentage] = useState(0);
  const [batteryColor, setBatteryColor] = useState('blue');
  const animationRef = useRef(null);

  // Cache key based on deviceId
  const cacheKey = `batteryData_${deviceId}`;

  // Fetch battery data and cache it
  const fetchBatteryData = useCallback(async () => {
    try {
      const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { sensor1_value, sensor2_value } = data[0];
        let validSensorValues = [];
        let usedValue;

        // Collect only valid sensor values
        if (sensor1_value < 4095) validSensorValues.push(sensor1_value);
        if (sensor2_value < 4095) validSensorValues.push(sensor2_value);

        // Specific case handling
        if (sensor1_value === sensor2_value) {
          if (sensor1_value === 4095) {
            setBatteryPercentage(0); // 4095 should be 0%
            setBatteryColor('red');
            return;
          } else if (sensor1_value === 0) {
            setBatteryPercentage(100); // 0 should be 100%
            setBatteryColor('green');
            return;
          }
        }

        // Use only one valid sensor value if one is above 4095
        if (validSensorValues.length === 1) {
          usedValue = validSensorValues[0];
        } else if (validSensorValues.length === 2) {
          usedValue = (validSensorValues[0] + validSensorValues[1]) / 2;
        }

        // Convert the valid value (0 to 4095) to a percentage (0% to 100%)
        if (usedValue !== undefined) {
          const percentage = Math.max(0, Math.min(100, (usedValue / 4095) * 100));
          // Reverse the percentage for display
          const reversedPercentage = 100 - percentage;

          setBatteryPercentage(reversedPercentage);
          setBatteryColor(reversedPercentage > 75 ? 'green' : reversedPercentage > 50 ? 'yellow' : 'red');

          // Cache the data
          await AsyncStorage.setItem(cacheKey, JSON.stringify({ reversedPercentage, batteryColor }));
        } else {
          // If no valid sensors are found, set to 100% (reversed 0%)
          setBatteryPercentage(100);
          setBatteryColor('red');
        }
      } else {
        console.error('Sensor data not found or data is empty');
      }
    } catch (error) {
      console.error('Error fetching battery data:', error);
    }
  }, [deviceId]);

  // Load cached data on component mount and fetch new data
  useEffect(() => {
    const loadData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          const { reversedPercentage, batteryColor } = JSON.parse(cachedData);
          setBatteryPercentage(reversedPercentage);
          setBatteryColor(batteryColor);
        }
        fetchBatteryData(); // Fetch fresh data after loading from cache
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    };

    if (deviceId) {
      loadData();
      const interval = setInterval(fetchBatteryData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [deviceId, fetchBatteryData]);

  return (
    <View style={styles.container}>
      <Text style={styles.percentageText}>{batteryPercentage.toFixed(2)}%</Text>
      <LottieView
        ref={animationRef}
        source={require('../../assets/Battery_blue.json')}
        loop={true}
        style={[
          styles.animation,
          { tintColor: batteryColor } // Apply battery color to the Lottie animation
        ]}
        progress={1 - batteryPercentage / 100} // Use the reversed percentage for the progress
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 450, // Adjusted size
    height: 450, // Adjusted size
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Battery;
