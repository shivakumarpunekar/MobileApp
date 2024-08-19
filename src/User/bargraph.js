import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const Bargraph = ({ loginId }) => {
  const [sensorData1, setSensorData1] = useState([]);
  const [sensorData2, setSensorData2] = useState([]);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deviceResponse = await axios.get(
          `http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`
        );
        const data = deviceResponse.data;

        let deviceId = null;

        if (Array.isArray(data) && data.length > 0 && data[0].deviceId) {
          deviceId = data[0].deviceId;
        } else {
          console.error("Device ID not found or data is empty");
          setLoading(false);
          return;
        }

        const sensor1Response = await axios.get(
          `http://103.145.50.185:2030/api/sensor_data/device/${deviceId}/sensor1`
        );
        const sensor2Response = await axios.get(
          `http://103.145.50.185:2030/api/sensor_data/device/${deviceId}/sensor2`
        );

        if (Array.isArray(sensor1Response.data)) {
          setSensorData1(sensor1Response.data);
        } else {
          console.error("Sensor 1 data is not in expected format");
        }

        if (Array.isArray(sensor2Response.data)) {
          setSensorData2(sensor2Response.data);
        } else {
          console.error("Sensor 2 data is not in expected format");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setLoading(false);
      }
    };

    if (loginId) {
      fetchData();
    }
  }, [loginId]);

  const prepareChartData = (sensorData) => {
    // Ensure sensorData is an array before mapping
    if (!Array.isArray(sensorData)) return [];
    return sensorData.map((item) => ({
      value: item.value,
      color: getBarColor(item.value),
      date: item.date,
    }));
  };

  const getBarColor = (value) => {
    if (value >= 3800) return "#FF0000";
    if (value >= 1250 && value < 3800) return "#00FF00";
    return "#FF0000";
  };

  const barData1 = prepareChartData(sensorData1);
  const barData2 = prepareChartData(sensorData2);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Sensor 1 Bar Graph
      </Text>
      <BarChart
        data={{
          labels: barData1.map((_, index) => index.toString()),
          datasets: [
            {
              data: barData1.map((item) => item.value),
              colors: barData1.map((item) => () => item.color),
            },
          ],
        }}
        width={screenWidth - 40}
        height={300}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          fillShadowGradient: "#ffffff",
          fillShadowGradientOpacity: 1,
          barPercentage: 0.5,
          useShadowColorFromDataset: true,
        }}
        verticalLabelRotation={30}
      />

      <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}>
        Sensor 2 Bar Graph
      </Text>
      <BarChart
        data={{
          labels: barData2.map((_, index) => index.toString()),
          datasets: [
            {
              data: barData2.map((item) => item.value),
              colors: barData2.map((item) => () => item.color),
            },
          ],
        }}
        width={screenWidth - 40}
        height={300}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          fillShadowGradient: "#ffffff",
          fillShadowGradientOpacity: 1,
          barPercentage: 0.5,
          useShadowColorFromDataset: true,
        }}
        verticalLabelRotation={30}
      />
    </ScrollView>
  );
};

export default Bargraph;
