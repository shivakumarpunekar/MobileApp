import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import { BarChart, Grid } from 'react-native-svg-charts';
import { G, Line, Text as SVGText } from 'react-native-svg';
import axios from 'axios';
import moment from 'moment';

const Bargraph = () => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch the deviceId based on loginId (assuming 29 is the loginId)
                const deviceResponse = await axios.get('http://103.145.50.185:2030/api/UserDevice/byProfile/${deviceId}');
                const deviceId = deviceResponse.data.deviceId;

                // Fetch sensor1_value and sensor2_value
                const sensor1Response = await axios.get(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}/sensor1`);
                const sensor2Response = await axios.get(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}/sensor2`);

                // Combine data for the chart (using sensor1_value for this example)
                const data = sensor1Response.data.map((item, index) => ({
                    value: item.value,  // Assuming response has { value, date } structure
                    date: item.date,
                }));

                setSensorData(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching sensor data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to determine the color of each bar based on its value
    const getBarColor = (value) => {
        if (value >= 3800) return '#FF0000'; // Red for values ≥ 3800
        if (value >= 1250 && value < 3800) return '#00FF00'; // Green for values between 1250 and 3800
        return '#FF0000'; // Red for values < 1250
    };

    const barData = sensorData.map(item => ({
        value: item.value,
        color: getBarColor(item.value),
    }));

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading data...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Bar Graph
            </Text>
            <BarChart
                style={{ height: 300 }}
                data={barData.map(item => item.value)}
                svg={{ fill: ({ index }) => barData[index].color }}
                contentInset={{ top: 30, bottom: 30 }}
                yMin={0}
                yMax={5000}
                spacingInner={0.2}
                spacingOuter={0.2}
                xAccessor={({ index }) => index}
                yAccessor={({ item }) => item}
                gridMin={0}
                gridMax={5000}
                numberOfTicks={10}
                gridProps={{ strokeDasharray: [4, 8] }}
            >
                <Grid svg={{ strokeDasharray: [4, 8] }} />
            </BarChart>
        </View>
    );
}

export default Bargraph;
