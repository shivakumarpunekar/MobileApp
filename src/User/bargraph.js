import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import moment from 'moment-timezone';
import debounce from 'lodash.debounce';

const { width } = Dimensions.get("window");

const Bargraph = ({ loginId }) => {
  const [sensorData, setSensorData] = useState({ sensor1: [], sensor2: [] });
  const [deviceId, setDeviceId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const deviceResponse = await fetch(`http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`);
      const deviceData = await deviceResponse.json();

      if (Array.isArray(deviceData) && deviceData.length > 0) {
        const newDeviceId = deviceData[0].deviceId;
        if (newDeviceId !== deviceId) setDeviceId(newDeviceId); // Update deviceId only if changed

        const [sensor1Response, sensor2Response] = await Promise.all([
          fetch(`http://103.145.50.185:2030/api/sensor_data/device/${newDeviceId}/sensor1`),
          fetch(`http://103.145.50.185:2030/api/sensor_data/device/${newDeviceId}/sensor2`)
        ]);

        const sensor1Values = await sensor1Response.json();
        const sensor2Values = await sensor2Response.json();

        setSensorData({
          sensor1: filterDataByLastHour(groupDataByInterval(sensor1Values, "sensor1_value")),
          sensor2: filterDataByLastHour(groupDataByInterval(sensor2Values, "sensor2_value"))
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [deviceId, loginId]);

  const debouncedFetchData = useMemo(() => debounce(fetchData, 100), [fetchData]);

  useEffect(() => {
    debouncedFetchData(); // Fetch data on component mount

    const intervalId = setInterval(debouncedFetchData, 100); // Fraction of a second interval for real-time updates

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [debouncedFetchData]);

  const groupDataByInterval = (data, sensorKey, intervalSeconds = 60) => {
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

  const getBarChartData = (data) => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          colors: []
        }]
      };
    }

    const labels = data.map(entry => entry.timeKey);
    const chartData = data.map(entry => entry.value);

    // Normalize chart data to fit within the 0-4500 range
    const normalizedData = chartData.map(value => Math.min(value, 4500)); // Clamp values to 4500

    return {
      labels: labels,
      datasets: [
        {
          data: normalizedData,
          colors: normalizedData.map(value => {
            if (value > 3800) return () => `rgba(255, 0, 0, 1)`; // Red for values above 3800
            if (value > 1250) return () => `rgba(0, 255, 0, 1)`; // Green for values 1251-3800
            return () => `rgba(255, 0, 0, 1)`; // Red for values 0-1250
          }),
        },
      ],
    };
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sensor 1</Text>
      <ScrollView horizontal>
        <BarChart
          data={getBarChartData(sensorData.sensor1)}
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
          data={getBarChartData(sensorData.sensor2)}
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
    padding: 1,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default Bargraph;
