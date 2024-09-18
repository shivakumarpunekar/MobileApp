import React, { useEffect, useState, useCallback } from 'react';
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

    // Helper function to format timestamps
    const formatTimestamp = useCallback((timestamp) => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        const todayStartISO = new Date().setHours(0, 0, 0, 0); // Start of today
        const endDateISO = new Date().toISOString(); // Current date and time

        // Fetch live data for today only
        fetchLiveData(deviceId, new Date(todayStartISO).toISOString(), endDateISO);

        // Refresh live data every 10 seconds
        const liveDataInterval = setInterval(() => {
            fetchLiveData(deviceId, new Date(todayStartISO).toISOString(), endDateISO);
        }, 10000);

        return () => clearInterval(liveDataInterval);
    }, [deviceId, formatTimestamp]);

    const fetchLiveData = async (deviceId, startDateISO, endDateISO) => {
        setLoading(true);
        try {
            const response1 = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}/sensor1?start=${startDateISO}&end=${endDateISO}`);
            const response2 = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}/sensor2?start=${startDateISO}&end=${endDateISO}`);

            if (!response1.ok || !response2.ok) {
                throw new Error('Network response was not ok');
            }

            const data1 = await response1.json();
            const data2 = await response2.json();

            if (data1 && data2) {
                setSensor1Data(data1.reverse());
                setSensor2Data(data2.reverse());

                // Update xLabels for today's data
                const newXLabels = data1.map(entry => formatTimestamp(entry.timestamp));
                setXLabels(newXLabels);
            } else {
                console.warn('Empty data received from API');
            }
        } catch (error) {
            console.error('Error fetching live data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to determine line color based on sensor values
    const getLineColor = (sensorValue) => {
        return sensorValue >= 4000 || sensorValue <= 1250 ? 'red' : 'green';
    };

    // Function to determine chart background color based on sensor values
    const getChartBackgroundColor = (sensorValue) => {
        return sensorValue >= 4000 || sensorValue <= 1250 ? '#FFCDD2' : '#C8E6C9'; // Light red or green background
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
