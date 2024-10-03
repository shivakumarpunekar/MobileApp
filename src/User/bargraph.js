import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import moment from 'moment-timezone';
import debounce from 'lodash.debounce';

const Bargraph = ({ loginId }) => {
  const [deviceData, setDeviceData] = useState([]); // Array to hold multiple devices and their sensor data

  const fetchData = useCallback(async () => {
    try {
      const deviceResponse = await fetch(`http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`);
      const deviceList = await deviceResponse.json();

      if (Array.isArray(deviceList) && deviceList.length > 0) {
        const newDeviceData = await Promise.all(
          deviceList.map(async (device) => {
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
          })
        );
        setDeviceData(newDeviceData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [loginId]);

  const debouncedFetchData = useMemo(() => debounce(fetchData, 100), [fetchData]);

  useEffect(() => {
    debouncedFetchData(); // Fetch data on component mount

    const intervalId = setInterval(debouncedFetchData, 100); // Real-time updates

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [debouncedFetchData]);

  const groupDataByInterval = (data, sensorKey, intervalSeconds = 120) => {
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

  const filterDataByLastHour = (data) => {
    const now = moment();
    const oneHourAgo = now.clone().subtract(1, 'hours');
    return data.filter(entry => {
      const entryTime = moment(entry.timeKey, "HH:mm:ss");
      return entryTime.isBetween(oneHourAgo, now);
    });
  };

  const getAverageValue = (data) => {
    if (!data || data.length === 0) {
      return 0;
    }

    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    return total / data.length;
  };

  const getPercentage = (value, max = 4500) => {
    return (value / max) * 100;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {deviceData.map((device, index) => (
        <View key={device.deviceId} style={styles.deviceContainer}>
          <Text style={styles.deviceTitle}>{device.deviceName}</Text>

          <View style={styles.row}>
            <View style={styles.progressContainer}>
              <Text style={styles.title}>Sensor 1</Text>
              <AnimatedCircularProgress
                size={150}
                width={12}
                fill={getPercentage(getAverageValue(device.sensor1))}
                tintColor="#00e0ff"
                backgroundColor="#3d5875"
              >
                {() => (
                  <Text style={styles.progressText}>
                    {`${getPercentage(getAverageValue(device.sensor1)).toFixed(2)}%`}
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.title}>Sensor 2</Text>
              <AnimatedCircularProgress
                size={150}
                width={12}
                fill={getPercentage(getAverageValue(device.sensor2))}
                tintColor="#00e0ff"
                backgroundColor="#3d5875"
              >
                {() => (
                  <Text style={styles.progressText}>
                    {`${getPercentage(getAverageValue(device.sensor2)).toFixed(2)}%`}
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceContainer: {
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  deviceTitle: {
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Bargraph;