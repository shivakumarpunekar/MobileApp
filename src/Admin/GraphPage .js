import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as scale from 'd3-scale';

const GraphPage = ({ route }) => {
    const { deviceId } = route.params;
    const [sensor1Data, setSensor1Data] = useState([]);
    const [sensor2Data, setSensor2Data] = useState([]);
    const [loading, setLoading] = useState(true);
    const [xLabels, setXLabels] = useState([]);

    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const startDateISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
        const endDateISO = new Date().toISOString(); // current date and time

        // Fetch historical data for the last 7 days
        fetchHistoricalData(deviceId, startDateISO, endDateISO);

        // Start fetching live data (assuming it's updating in real-time)
        const liveDataInterval = setInterval(() => {
            fetchLiveData(deviceId);
        }, 10000); // Fetch live data every 10 seconds

        // Clean up interval on component unmount
        return () => clearInterval(liveDataInterval);
    }, [deviceId]);

    const fetchHistoricalData = async (deviceId, startDateISO, endDateISO) => {
        try {
            const response1 = await fetch(`http://192.168.1.10:2030/api/sensor_data/device/${deviceId}/sensor1`);
            const response2 = await fetch(`http://192.168.1.10:2030/api/sensor_data/device/${deviceId}/sensor2`);

            if (!response1.ok || !response2.ok) {
                throw new Error('Network response was not ok');
            }

            const data1 = await response1.json();
            const data2 = await response2.json();

            // Assuming the data is an array of entries with timestamps
            setSensor1Data(data1.reverse());
            setSensor2Data(data2.reverse());

            if (data1.length > 0) {
                const timestamps = data1.map(entry => new Date(entry.timestamp));
                const xLabels = timestamps.map(timestamp => `${timestamp.getHours()}:${String(timestamp.getMinutes()).padStart(2, '0')}`);
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
            const response1 = await fetch(`http://192.168.1.10:2030/api/sensor_data/device/${deviceId}/sensor1`);
            const response2 = await fetch(`http://192.168.1.10:2030/api/sensor_data/device/${deviceId}/sensor2`);

            if (!response1.ok || !response2.ok) {
                throw new Error('Network response was not ok');
            }

            const data1 = await response1.json();
            const data2 = await response2.json();

            if (data1 && data2) {
                setSensor1Data(prevData => [data1, ...prevData]);
                setSensor2Data(prevData => [data2, ...prevData]);

                // Update xLabels for live data as well
                setXLabels(prevXLabels => [
                    `${new Date(data1.timestamp).getHours()}:${String(new Date(data1.timestamp).getMinutes()).padStart(2, '0')}`,
                    ...prevXLabels,
                ]);
            } else {
                console.warn('Empty data received from API');
            }
        } catch (error) {
            console.error('Error fetching live data:', error);
        }
    };

    useEffect(() => {
        setLoading(sensor1Data.length === 0 && sensor2Data.length === 0);
    }, [sensor1Data, sensor2Data]);

    // Function to determine line color based on sensor values
    const getLineColor = (sensorValue) => {
        if ((sensorValue >= 4000 || sensorValue <= 1250)) {
            return 'red';
        } else {
            return 'green';
        }
    };

    // Function to determine chart background color based on sensor values
    const getChartBackgroundColor = (sensorValue) => {
        if ((sensorValue >= 4000 || sensorValue <= 1250)) {
            return '#FFCDD2'; // Light red background
        } else {
            return '#C8E6C9'; // Light green background
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="blue" />
                ) : (
                    <>
                        <Text style={styles.title}>Sensor-1 Values</Text>
                        <ScrollView horizontal>
                            <View style={[styles.chartContainer, { backgroundColor: getChartBackgroundColor(sensor1Data[0]?.sensor1_value || 0), width: screenWidth - 40 }]}>
                                <YAxis
                                    data={sensor1Data.map(entry => entry.sensor1_value)}
                                    style={styles.yAxis}
                                    contentInset={styles.contentInset}
                                    svg={styles.axisText}
                                />
                                <View style={styles.chart}>
                                    <LineChart
                                        style={styles.lineChart}
                                        data={sensor1Data.map(entry => entry.sensor1_value)}
                                        svg={{ stroke: getLineColor(sensor1Data[0]?.sensor1_value || 0) }}
                                        contentInset={styles.contentInset}
                                    >
                                        <Grid svg={{ stroke: '#ddd' }} />
                                    </LineChart>
                                    <XAxis
                                        style={styles.xAxis}
                                        data={sensor1Data.map(entry => entry.sensor1_value)}
                                        scale={scale.scaleBand}
                                        formatLabel={(value, index) => xLabels[index] || ''}
                                        contentInset={{ left: 10, right: 10 }}
                                        svg={styles.axisText}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        <Text style={styles.title}>Sensor-2 Values</Text>
                        <ScrollView horizontal>
                            <View style={[styles.chartContainer, { marginTop: 20, backgroundColor: getChartBackgroundColor(sensor2Data[0]?.sensor2_value || 0), width: screenWidth - 40 }]}>
                                <YAxis
                                    data={sensor2Data.map(entry => entry.sensor2_value)}
                                    style={styles.yAxis}
                                    contentInset={styles.contentInset}
                                    svg={styles.axisText}
                                />
                                <View style={styles.chart}>
                                    <LineChart
                                        style={styles.lineChart}
                                        data={sensor2Data.map(entry => entry.sensor2_value)}
                                        svg={{ stroke: getLineColor(sensor2Data[0]?.sensor2_value || 0) }}
                                        contentInset={styles.contentInset}
                                    >
                                        <Grid svg={{ stroke: '#ddd' }} />
                                    </LineChart>
                                    <XAxis
                                        style={styles.xAxis}
                                        data={sensor2Data.map(entry => entry.sensor2_value)}
                                        scale={scale.scaleBand}
                                        formatLabel={(value, index) => xLabels[index] || ''}
                                        contentInset={{ left: 10, right: 10 }}
                                        svg={styles.axisText}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F3E7',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    chartContainer: {
        flexDirection: 'row',
        height: 300,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5,
    },
    yAxis: {
        width: 60,
    },
    contentInset: {
        top: 20,
        bottom: 20,
    },
    axisText: {
        fontSize: 10,
        fill: 'grey',
    },
    chart: {
        flex: 1,
        marginLeft: 10,
    },
    lineChart: {
        flex: 1,
        minWidth: 10,
    },
    xAxis: {
        marginHorizontal: -10,
        height: 10,
    },
});

export default GraphPage;
