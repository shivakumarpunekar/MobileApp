import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, Text, StyleSheet, View, Dimensions } from "react-native";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import moment from 'moment-timezone';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Bargraph = ({ loginId }) => {
  const [deviceData, setDeviceData] = useState([]); // Array to hold multiple devices and their sensor data

  // Function to fetch data for the devices
  const fetchData = useCallback(async () => {
    try {
      const deviceResponse = await fetch(`http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`);
      const deviceList = await deviceResponse.json();

      if (Array.isArray(deviceList) && deviceList.length > 0) {
        const newDeviceData = await Promise.all(
          deviceList.map(async (device) => {
            try {
              const [sensor1Response, sensor2Response] = await Promise.all([
                fetch(`http://103.145.50.185:2030/api/sensor_data/device/${device.deviceId}/sensor1`),
                fetch(`http://103.145.50.185:2030/api/sensor_data/device/${device.deviceId}/sensor2`)
              ]);

              const sensor1Values = await sensor1Response.json();
              const sensor2Values = await sensor2Response.json();
              return {
                deviceId: device.deviceId,
                deviceName: device.deviceName || `Device ${device.deviceId}`, // Add device name or use a default
                sensor1: filterDataByLastHour(groupDataByInterval(sensor1Values, "sensor1_value")),
                sensor2: filterDataByLastHour(groupDataByInterval(sensor2Values, "sensor2_value"))
              };
            } catch (error) {
              console.error(`Error fetching sensor data for device ${device.deviceId}:`, error);
              return {
                deviceId: device.deviceId,
                deviceName: device.deviceName || `Device ${device.deviceId}`,
                sensor1: [],
                sensor2: [],
              };
            }
          })
        );
        setDeviceData(newDeviceData);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  }, [loginId]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000); // Increase the interval to 5 seconds
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Group data by interval
  const groupDataByInterval = (data, sensorKey, intervalSeconds = 1) => {
    const groupedData = new Map();

    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const seconds = Math.floor(date.getSeconds() / intervalSeconds) * intervalSeconds;
      const timeKey = `${date.getHours()}:${date.getMinutes()}:${seconds.toString().padStart(2, '0')}`;

      if (!groupedData.has(timeKey)) {
        groupedData.set(timeKey, []);
      }
      groupedData.get(timeKey).push(entry[sensorKey]);
    });

    return Array.from(groupedData.entries()).map(([timeKey, values]) => ({
      timeKey,
      value: values.reduce((sum, val) => sum + val, 0) / values.length, // Average value
    }));
  };

  // Filter data by last hour
  const filterDataByLastHour = (data) => {
    const now = moment();
    const oneHourAgo = now.clone().subtract(1, 'hours');
    return data.filter(entry => {
      const entryTime = moment(entry.timeKey, "HH:mm:ss");
      return entryTime.isBetween(oneHourAgo, now);
    });
  };

  // Get the average value from data
  const getAverageValue = (data) => {
    if (!data || data.length === 0) {
      return 0;
    }

    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    return total / data.length;
  };

  // Calculate percentage (for sensor value to percentage conversion)
  const getPercentage = (value, min = 0, max = 4095) => {
    if (value === min) return 100; // 100% when value is at the minimum
    if (value === max) return 0;   // 0% when value is at the maximum

    return 100 - (((value - min) / (max - min)) * 100);
  };

  // Determine moisture level (Low, Moderate, High) based on percentage
  const getMoistureLevel = (percentage) => {
    if (percentage <= 20) {
      return 'Low';
    } else if (percentage > 20 && percentage <= 80) {
      return 'Moderate';
    } else {
      return 'High';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {deviceData.map((device) => (
        <View key={device.deviceId} style={styles.deviceContainer}>
          <Text style={styles.deviceTitle}>{device.deviceName}</Text>

          <View style={styles.row}>
            <View style={styles.progressContainer}>
              <Text style={styles.title}>Sensor 1</Text>
              <Text style={styles.title}>{getMoistureLevel(getPercentage(getAverageValue(device.sensor1)))}</Text>

              <AnimatedCircularProgress
                size={screenWidth * 0.3} // 40% of the screen width
                width={screenWidth * 0.03} // 3% of the screen width
                fill={getPercentage(getAverageValue(device.sensor1))}
                tintColor="#00e0ff"
                backgroundColor="#3d5875"
              >
                {() => {
                  const sensorValue = getAverageValue(device.sensor1);
                  const percentage = getPercentage(sensorValue);
                                
                  return (
                    <Text style={styles.progressText}>
                      {`${percentage.toFixed(2)}%`}
                    </Text>
                  );
                }}
              </AnimatedCircularProgress>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.title}>Sensor 2</Text>
              <Text style={styles.title}>{getMoistureLevel(getPercentage(getAverageValue(device.sensor2)))}</Text>

              <AnimatedCircularProgress
                size={screenWidth * 0.3} // 40% of the screen width
                width={screenWidth * 0.03} // 3% of the screen width
                fill={getPercentage(getAverageValue(device.sensor2))}
                tintColor="#00e0ff"
                backgroundColor="#3d5875"
              >
                {() => {
                  const sensorValue = getAverageValue(device.sensor2);
                  const percentage = getPercentage(sensorValue);
                                
                  return (
                    <Text style={styles.progressText}>
                      {`${percentage.toFixed(2)}%`}
                    </Text>
                  );
                }}
              </AnimatedCircularProgress>
            </View>

          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceContainer: {
    backgroundColor: '#6a89a7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 10,
    shadowColor: 'red',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deviceTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
    width: screenWidth * 0.4, // 40% of screen width
  },
  progressText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Bargraph;
