import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as scale from 'd3-scale';

const GraphPage = ({ route }) => {
    const { deviceId } = route.params;
    const [historicalData, setHistoricalData] = useState([]);
    const [liveData, setLiveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [xLabels, setXLabels] = useState([]);

    useEffect(() => {
        const startDateISO = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
        const endDateISO = new Date().toISOString(); // current date and time

        // Fetch historical data for the last 7 days
        fetchHistoricalData(deviceId, startDateISO, endDateISO);

        // Start fetching live data (assuming it's updating in real-time)
        const liveDataInterval = setInterval(() => {
            fetchLiveData(deviceId);
        }, 5000); // Fetch live data every 5 seconds (adjust as needed)

        // Clean up interval on component unmount
        return () => clearInterval(liveDataInterval);
    }, [deviceId]);

    const fetchHistoricalData = async (deviceId, startDateISO, endDateISO) => {
        try {
            const response = await fetch(`http://10.0.2.2:2030/api/sensor_data/device/${deviceId}/last7days`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setHistoricalData(data);

            if (data.length > 0) {
                const timestamps = data.map(entry => new Date(entry.timestamp));
                const xLabels = timestamps.map((timestamp, index) => {
                    const timeStr = `${timestamp.getHours()}:${timestamp.getMinutes()}`;
                    return index === 0 ? 'Now' : timeStr;
                });
                setXLabels(xLabels);
            } else {
                console.warn('No historical data received');
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    };

    const fetchLiveData = async (deviceId) => {
        try {
            const response = await fetch(`http://10.0.2.2:2030/api/sensor_data/device/${deviceId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Live data received:', data);

            if (data) {
                setLiveData([data]);
            } else {
                console.warn('Empty data received from API');
            }
        } catch (error) {
            console.error('Error fetching live data:', error);
        }
    };

    useEffect(() => {
        setLoading(!(historicalData.length > 0 && liveData.length > 0));
    }, [historicalData, liveData]);

    // Combine historical and live data for display
    const allData = [...historicalData, ...liveData];

    // Extracting timestamps and sensor values for chart
    const timestamps = allData.map(entry => new Date(entry.timestamp));
    const sensorValues = allData.map(entry => entry.sensor1_value);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Graph Page for Device {deviceId}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="blue" />
            ) : (
                <View style={{ flexDirection: 'row', height: 200, width: '80%' }}>
                    <YAxis
                        data={sensorValues}
                        style={{ marginBottom: 30 }}
                        contentInset={{ top: 20, bottom: 20 }}
                        svg={{ fontSize: 10, fill: 'grey' }}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <LineChart
                            style={{ flex: 1, fontSize: 30 }}
                            data={sensorValues}
                            svg={{ stroke: 'green' }}
                            contentInset={{ top: 20, bottom: 20 }}
                        >
                            <Grid />
                        </LineChart>
                        <XAxis
                            style={{ marginHorizontal: -10, height: 30 }}
                            data={sensorValues}
                            scale={scale.scaleBand}
                            formatLabel={(value, index) => xLabels[index]}
                            contentInset={{ left: 10, right: 10 }}
                            svg={{ fontSize: 10, fill: 'black' }}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

export default GraphPage;
