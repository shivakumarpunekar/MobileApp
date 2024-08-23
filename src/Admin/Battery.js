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
            let validSensors = [];

            // Check and collect valid sensor values (<= 4095)
            if (sensor1_value <= 4095) validSensors.push(sensor1_value);
            if (sensor2_value <= 4095) validSensors.push(sensor2_value);

            // Specific case handling
            if (sensor1_value === sensor2_value) {
              if (sensor1_value === 4095) {
                setBatteryPercentage(0); // 4095 should be 0%
                setBatteryColor('red');
              } else if (sensor1_value === 0) {
                setBatteryPercentage(100); // 0 should be 100%
                setBatteryColor('green');
              }
            } else if (validSensors.length > 0) {
              // Calculate battery level using only valid sensor values
              const calculatedBatteryLevel = validSensors.reduce((a, b) => a + b, 0) / validSensors.length;

              // Convert the battery level (0 to 4095) to percentage (0% to 100%)
              const percentage = Math.max(0, Math.min(100, (calculatedBatteryLevel / 4095) * 100));

              // Round the percentage to two decimal places
              const roundedPercentage = parseFloat(percentage.toFixed(2));

              // Reverse the percentage for display and animation
              const reversedPercentage = 100 - roundedPercentage;

              setBatteryPercentage(reversedPercentage);

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
      };

      fetchBatteryData();
      const interval = setInterval(fetchBatteryData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [deviceId]);

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
