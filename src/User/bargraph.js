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
          const newDeviceId = deviceData[0].deviceId;
          if (newDeviceId !== deviceId) setDeviceId(newDeviceId); // Update deviceId only if changed

          const sensor1Response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${newDeviceId}/sensor1`);
          const sensor1Values = await sensor1Response.json();
          const newSensor1Data = filterDataByLastHour(groupDataByInterval(sensor1Values, "sensor1_value"));
          setSensor1Data(newSensor1Data);

          const sensor2Response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${newDeviceId}/sensor2`);
          const sensor2Values = await sensor2Response.json();
          const newSensor2Data = filterDataByLastHour(groupDataByInterval(sensor2Values, "sensor2_value"));
          setSensor2Data(newSensor2Data);
        } else {
          console.error("Device data array is empty or not an array.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 1000); // 1-second interval for real-time updates

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [loginId, deviceId]);

  const groupDataByInterval = (data, sensorKey, intervalMinutes = 2) => {
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

  const filterDataByLastHour = (data) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return data.filter(entry => {
      const [hours, minutes] = entry.timeKey.split(":").map(Number);
      const entryTime = new Date();
      entryTime.setHours(hours);
      entryTime.setMinutes(minutes);
      entryTime.setSeconds(0);
      return entryTime >= oneHourAgo;
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

    // Map each timeKey to its label
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
          data={getBarChartData(sensor1Data)}
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
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  barPercentage: 0.5,
  decimalPlaces: 0,
  propsForBackgroundLines: {
    strokeDasharray: '', // Remove dashed background lines
  },
  propsForYAxisLabels: {
    fontSize: 12,
  },
  propsForLabels: {
    fontSize: 10, // Adjust the font size
    rotation: 45, // Rotate labels 45 degrees for better visibility
    anchor: 'middle',
    dx: 10, // Adjust label offset as needed
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
