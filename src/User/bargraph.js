import React, { useState, useEffect } from "react";
import { ScrollView, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

const Bargraph = ({ loginId }) => {
  const [sensor1Data, setSensor1Data] = useState([]);
  const [sensor2Data, setSensor2Data] = useState([]);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deviceResponse = await fetch(`http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`);
        const deviceData = await deviceResponse.json();

        if (Array.isArray(deviceData) && deviceData.length > 0) {
          const deviceId = deviceData[0].deviceId;
          setDeviceId(deviceId);

          const sensor1Response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}/sensor1`);
          const sensor1Values = await sensor1Response.json();
          setSensor1Data(groupDataByInterval(sensor1Values, "sensor1_value"));

          const sensor2Response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}/sensor2`);
          const sensor2Values = await sensor2Response.json();
          setSensor2Data(groupDataByInterval(sensor2Values, "sensor2_value"));
        } else {
          console.error("Device data array is empty or not an array.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 1000); // Auto-refresh every 10 minutes

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [loginId]);

  const groupDataByInterval = (data, sensorKey, intervalMinutes = 1) => {
    const groupedData = {};

    data.forEach(entry => {
      const date = new Date(entry.createdDateTime);
      const minutes = Math.floor(date.getMinutes() / intervalMinutes) * intervalMinutes;
      const timeKey = `${date.getHours()}:${minutes.toString().padStart(2, '0')}`;

      if (!groupedData[timeKey]) {
        groupedData[timeKey] = [];
      }
      groupedData[timeKey].push(entry[sensorKey]);
    });

    return Object.keys(groupedData).map(timeKey => ({
      timeKey,
      value: groupedData[timeKey].reduce((sum, val) => sum + val, 0) / groupedData[timeKey].length, // Average value
    }));
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

    return {
      labels: labels,
      datasets: [
        {
          data: chartData,
          colors: chartData.map(value => {
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
      <BarChart
        data={getBarChartData(sensor1Data)}
        width={width - 32}
        height={220}
        yAxisLabel=""
        chartConfig={chartConfig}
        fromZero={true}
        withCustomBarColorFromData={true}
        flatColor={true}
      />

      <Text style={styles.title}>Sensor 2</Text>
      <BarChart
        data={getBarChartData(sensor2Data)}
        width={width - 32}
        height={220}
        yAxisLabel=""
        chartConfig={chartConfig}
        fromZero={true}
        withCustomBarColorFromData={true}
        flatColor={true}
      />
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  barPercentage: 0.5,
  decimalPlaces: 0,
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
