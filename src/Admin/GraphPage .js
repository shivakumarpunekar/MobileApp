import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Memoizing LineChart, YAxis, and XAxis components to prevent unnecessary re-renders
const MemoizedLineChart = React.memo(LineChart);
const MemoizedYAxis = React.memo(YAxis);
const MemoizedXAxis = React.memo(XAxis);

const Legend = React.memo(({ items }) => {
    return (
        <View style={styles.legendContainer}>
            {items.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
});

const GraphPage = ({ route }) => {
    const { deviceId } = route.params;
    const [sensor1Data, setSensor1Data] = useState([]);
    const [sensor2Data, setSensor2Data] = useState([]);
    const [xLabels, setXLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFirstLoad = useRef(true);
    const intervalRef = useRef(null);

    const screenWidth = Dimensions.get('window').width;

    const DATA_STORAGE_KEY = `graphData_${deviceId}`;

    // Memoized function to format time and prevent unnecessary re-renders
    const formatCreatedTime = useCallback((timestamp) => {
        const date = new Date(timestamp);
        let minutes = date.getMinutes();
        minutes = minutes % 2 === 0 ? minutes : (minutes + 1) % 60;
        return `${date.getHours()}:${String(minutes).padStart(2, '0')}`;
    }, []);

    // Fetch data and save to cache asynchronously
    const fetchLiveData = useCallback(async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const filteredData = data.filter((entry) => {
                    const oneHourAgo = new Date().getTime() - 60 * 60 * 1000;
                    return new Date(entry.timestamp).getTime() >= oneHourAgo;
                });

                const sensor1 = filteredData.map((entry) => ({
                    ...entry,
                    sensor1_value: entry.sensor1_value,
                }));

                const sensor2 = filteredData.map((entry) => ({
                    ...entry,
                    sensor2_value: entry.sensor2_value,
                }));

                setSensor1Data(sensor1.reverse());
                setSensor2Data(sensor2.reverse());

                const newXLabels = sensor1.map((entry, index) =>
                    index % 2 === 0 ? formatCreatedTime(entry.timestamp) : ''
                );
                setXLabels(newXLabels);

                await AsyncStorage.setItem(DATA_STORAGE_KEY, JSON.stringify({ sensor1, sensor2, newXLabels }));

                if (isFirstLoad.current) {
                    setLoading(false);
                    isFirstLoad.current = false;
                }
            } else {
                setError('No data available for this device.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data.');
            setLoading(false);
        }
    }, [deviceId, formatCreatedTime]);

    // Load data from cache for faster UI load
    const loadStoredData = useCallback(async () => {
        try {
            const storedData = await AsyncStorage.getItem(DATA_STORAGE_KEY);
            if (storedData) {
                const { sensor1, sensor2, newXLabels } = JSON.parse(storedData);
                setSensor1Data(sensor1);
                setSensor2Data(sensor2);
                setXLabels(newXLabels);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }, [DATA_STORAGE_KEY]);

    useEffect(() => {
        loadStoredData(); // Load cached data
        fetchLiveData();  // Fetch new data in background

        // Auto-refresh data every 10 seconds
        intervalRef.current = setInterval(fetchLiveData, 10000);

        // Clear interval on component unmount
        return () => clearInterval(intervalRef.current);
    }, [loadStoredData, fetchLiveData]);

    // Fetch data when the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchLiveData();
        }, [fetchLiveData])
    );

    const getLineColor = useCallback((sensorValue) => sensorValue >= 4000 || sensorValue <= 1250 ? 'red' : 'green', []);
    const getChartBackgroundColor = useCallback((sensorValue) => sensorValue >= 4000 || sensorValue <= 1250 ? '#FFCDD2' : '#C8E6C9', []);

    const sensor1LatestValue = sensor1Data.length > 0 ? sensor1Data[0].sensor1_value : 0;
    const sensor2LatestValue = sensor2Data.length > 0 ? sensor2Data[0].sensor2_value : 0;

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const legendItems = [
        { label: 'Sensor 1', color: getLineColor(sensor1LatestValue) },
        { label: 'Sensor 2', color: getLineColor(sensor2LatestValue) },
    ];

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <Legend items={legendItems} />
                <Text style={styles.title}>Sensor-1 Values</Text>
                <ScrollView horizontal>
                    <View style={[styles.chartContainer, { backgroundColor: getChartBackgroundColor(sensor1LatestValue), width: screenWidth - 40 }]}>
                        <MemoizedYAxis
                            data={sensor1Data.map(entry => entry.sensor1_value)}
                            style={styles.yAxis}
                            contentInset={styles.contentInset}
                            svg={styles.axisText}
                            min={0}
                            max={4000}
                        />
                        <View style={styles.chart}>
                            <MemoizedLineChart
                                style={styles.lineChart}
                                data={sensor1Data.map(entry => entry.sensor1_value)}
                                svg={{ stroke: getLineColor(sensor1LatestValue) }}
                                contentInset={styles.contentInset}
                                yMin={0}
                                yMax={4000}
                            >
                                <Grid svg={{ stroke: '#ddd' }} />
                            </MemoizedLineChart>
                            <MemoizedXAxis
                                style={styles.xAxis}
                                data={sensor1Data.map(entry => entry.sensor1_value)}
                                scale={scale.scaleBand}
                                formatLabel={(_, index) => xLabels[index] || ''}
                                contentInset={{ left: 10, right: 10 }}
                                svg={styles.axisText}
                            />
                        </View>
                    </View>
                </ScrollView>

                <Text style={styles.title}>Sensor-2 Values</Text>
                <ScrollView horizontal>
                    <View style={[styles.chartContainer, { marginTop: 20, backgroundColor: getChartBackgroundColor(sensor2LatestValue), width: screenWidth - 40 }]}>
                        <MemoizedYAxis
                            data={sensor2Data.map(entry => entry.sensor2_value)}
                            style={styles.yAxis}
                            contentInset={styles.contentInset}
                            svg={styles.axisText}
                            min={0}
                            max={4000}
                        />
                        <View style={styles.chart}>
                            <MemoizedLineChart
                                style={styles.lineChart}
                                data={sensor2Data.map(entry => entry.sensor2_value)}
                                svg={{ stroke: getLineColor(sensor2LatestValue) }}
                                contentInset={styles.contentInset}
                                yMin={0}
                                yMax={4000}
                            >
                                <Grid svg={{ stroke: '#ddd' }} />
                            </MemoizedLineChart>
                            <MemoizedXAxis
                                style={styles.xAxis}
                                data={sensor2Data.map(entry => entry.sensor2_value)}
                                scale={scale.scaleBand}
                                formatLabel={(_, index) => xLabels[index] || ''}
                                contentInset={{ left: 10, right: 10 }}
                                svg={styles.axisText}
                            />
                        </View>
                    </View>
                </ScrollView>
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
        fontSize: 12, // Adjust font size
        fill: 'blue', // Change text color
        fontWeight: 'bold', // Make text bold
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    legendColorBox: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    legendText: {
        fontSize: 14,
    },
});

export default GraphPage;