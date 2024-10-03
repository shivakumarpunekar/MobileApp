import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
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

    const intervalId = setInterval(fetchData, 1000); // 1-second interval for real-time updates

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [debouncedFetchData]);

  // Update this function to group data by second instead of minute
  const groupDataByInterval = (data, sensorKey, intervalSeconds = 15) => {
    const groupedData = {};

    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const minutes = Math.floor(date.getMinutes() / intervalMinutes) * intervalMinutes;
      const timeKey = `${date.getHours()}:${minutes.toString().padStart(2, '0')}`;

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
      <Text style={styles.title}>Sensor 1</Text>
      <ScrollView horizontal>
        <BarChart
          data={getBarChartData(sensor1Data)}
          width={width * 2} // Adjust width to make the chart scrollable horizontally
          height={300}
          yAxisLabel=""
          chartConfig={chartConfig}
          fromZero={true}
          withCustomBarColorFromData={true}
          flatColor={true}
          yAxisInterval={1}
          showBarTops={false}
        />
      </ScrollView>

      <Text style={styles.title}>Sensor 2</Text>
      <ScrollView horizontal>
        <BarChart
          data={getBarChartData(sensor2Data)}
          width={width * 2} // Adjust width to make the chart scrollable horizontally
          height={220}
          yAxisLabel=""
          chartConfig={chartConfig}
          fromZero={true}
          withCustomBarColorFromData={true}
          flatColor={true}
          yAxisInterval={1}
          showBarTops={false}
        />
      </ScrollView>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: "#F6F3E7",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  barPercentage: 0.5, // Increase this value to make bars thicker and reduce space between bars
  decimalPlaces: 0,
  propsForBackgroundLines: {
    strokeDasharray: '', // Remove dashed background lines
  },
  propsForYAxisLabels: {
    fontSize: 12,
  },
  propsForLabels: {
    fontSize: 12, // Adjust the font size
    rotation: 0, // Rotate labels 0 degrees for better visibility
    anchor: 'middle',
    dx: 0, // Adjust label offset as needed
  },
  yAxisMax: 4500,
  yAxisMin: 0,
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
