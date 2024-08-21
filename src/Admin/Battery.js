import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from 'lottie-react-native';

const Battery = ({ deviceId }) => {
  const [batteryPercentage, setBatteryPercentage] = useState(0);
  const [batteryColor, setBatteryColor] = useState('green');
  let animationRef = React.createRef();

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
            const percentage = Math.min(100, Math.max(0, (calculatedBatteryLevel / 4000) * 100)) ;

            setBatteryPercentage(percentage);

            // Determine battery color based on percentage
            if (percentage <= 10) {
              setBatteryColor('red');
            } else if (percentage <= 75 && percentage == 50) {
              setBatteryColor('yellow');
            } else {
              setBatteryColor('blue');
            }

            // Control Lottie animation based on percentage
            if (animationRef.current) {
              animationRef.current.play(0, percentage); // Start from 0 and go to the calculated percentage
            }
          } else {
            console.error('Sensor data not found or data is empty');
          }
        } catch (error) {
          console.error('Error fetching battery data:', error);
        }
      };

      fetchBatteryData();
      const interval = setInterval(fetchBatteryData, 1000); // Refresh every 5 seconds
      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [deviceId]);

  return (
    <View style={styles.container}>
        <Text style={styles.percentageText}> {batteryPercentage.toFixed(2)}%</Text>
      <LottieView
        ref={animationRef}
        source={require('../../assets/Animation - 1724231949735.json')}
        loop={false} 
        style={[
          styles.animation,
          { tintColor: batteryColor } // Apply battery color to the Lottie animation
        ]}
        progress={batteryPercentage / 100} // Set initial progress
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
    width: 400, // Adjusted size
    height: 400, // Adjusted size
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Battery;
