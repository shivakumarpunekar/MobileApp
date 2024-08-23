import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from 'lottie-react-native';

const Battery = ({ deviceId }) => {
  const [batteryPercentage, setBatteryPercentage] = useState(0);
  const [batteryColor, setBatteryColor] = useState('blue');
  const animationRef = useRef(null);

  // Fetch battery data
  useEffect(() => {
    if (deviceId) {
      const fetchBatteryData = async () => {
        try {
          const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
          const data = await response.json();
          if (data && data.length > 0) {
            const { sensor1_value, sensor2_value } = data[0];
            const calculatedBatteryLevel = (sensor1_value + sensor2_value) / 2;

            // Convert the battery level (0 to 4000) to percentage (0% to 100%)
            const percentage = Math.min(100, Math.max(0, (calculatedBatteryLevel / 4000) * 100));

            setBatteryPercentage(percentage);
          } else {
            console.error('Sensor data not found or data is empty');
          }
        } catch (error) {
          console.error('Error fetching battery data:', error);
        }
      };

      fetchBatteryData();
      const interval = setInterval(fetchBatteryData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [deviceId]);

  return (
    <View style={styles.container}>
      <Text style={styles.percentageText}>{batteryPercentage}%</Text>
      <LottieView
        ref={animationRef}
        source={require('../../assets/Battery.json')}
        loop={true}
        style={[
          styles.animation,
          { tintColor: batteryColor } // Apply battery color to the Lottie animation
        ]}
        progress={1 - (batteryPercentage / 100)} // Reverse the progress calculation
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
