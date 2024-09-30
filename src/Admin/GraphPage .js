import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import * as dateFns from 'date-fns';
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

    // Parse and format timestamp
    const formatCreatedTime = useCallback((createdDateTime) => {
        const date = new Date(createdDateTime);
        return dateFns.format(date, 'HH:mm');
    }, []);

    const filterXLabelsFor2Minutes = useCallback((labels) => {
        return labels.filter((_, index) => index % 2 === 0); // Show every 2nd label
    }, []);

    const fetchLiveData = useCallback(async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const sensor1 = data.map((entry) => ({
                    ...entry,
                    sensor1_value: entry.sensor1_value,
                }));

                const sensor2 = data.map((entry) => ({
                    ...entry,
                    sensor2_value: entry.sensor2_value,
                }));

                setSensor1Data(sensor1.reverse());
                setSensor2Data(sensor2.reverse());

                const newXLabels = sensor1.map((entry) => formatCreatedTime(entry.timestamp));
                setXLabels(filterXLabelsFor2Minutes(newXLabels)); // Set filtered labels

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
    }, [deviceId, formatCreatedTime, filterXLabelsFor2Minutes]);

    const loadStoredData = useCallback(async () => {
        try {
            const storedData = await AsyncStorage.getItem(DATA_STORAGE_KEY);
            if (storedData) {
                const { sensor1, sensor2, newXLabels } = JSON.parse(storedData);
                setSensor1Data(sensor1);
                setSensor2Data(sensor2);
                setXLabels(filterXLabelsFor2Minutes(newXLabels)); // Filter cached data
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }, [DATA_STORAGE_KEY, filterXLabelsFor2Minutes]);

    useEffect(() => {
        loadStoredData();
        fetchLiveData();
        intervalRef.current = setInterval(fetchLiveData, 1000);
        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };

    }, [loadStoredData, fetchLiveData]);

    useFocusEffect(
        useCallback(() => {
            fetchLiveData();
        }, [fetchLiveData])
    );

    const getLineColor = useCallback((sensorValue) => (sensorValue >= 4000 || sensorValue <= 1250 ? 'red' : 'green'), []);
    const getChartBackgroundColor = useCallback((sensorValue) => (sensorValue >= 4000 || sensorValue <= 1250 ? '#FFCDD2' : '#C8E6C9'), []);

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

    // Slice data to get only the last 10 records
    const sensor1DataSlice = sensor1Data.slice(-10);
    const sensor2DataSlice = sensor2Data.slice(-10);
    const xLabelsSlice = xLabels.slice(-10);

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <Legend items={legendItems} />

                {/* Sensor 1 Chart */}
                <Text style={styles.title}>Sensor-1 Values</Text>
                <ScrollView horizontal>
                    <View style={[styles.chartContainer, { backgroundColor: getChartBackgroundColor(sensor1LatestValue), width: screenWidth - 40 }]}>
                        <MemoizedYAxis
                            data={sensor1DataSlice.map((entry) => entry.sensor1_value)}
                            style={styles.yAxis}
                            contentInset={styles.contentInset}
                            svg={styles.axisText}
                            min={0}
                            max={4095}
                        />
                        <View style={styles.chart}>
                            <MemoizedLineChart
                                style={styles.lineChart}
                                data={sensor1DataSlice.map((entry) => entry.sensor1_value)}
                                svg={{ stroke: getLineColor(sensor1LatestValue) }}
                                contentInset={styles.contentInset}
                                yMin={0}
                                yMax={4095}
                            >
                                <Grid svg={{ stroke: '#ddd' }} />
                            </MemoizedLineChart>
                            <MemoizedXAxis
                                style={styles.xAxis}
                                data={sensor1DataSlice.map((entry) => new Date(entry.createdDateTime))}  // Mapping the timestamp to Date
                                scale={scale.scaleTime}
                                formatLabel={(value, index) => {
                                    return dateFns.format(new Date(value), 'HH:mm');
                                }}
                                contentInset={{ left: 10, right: 10 }}
                                svg={styles.axisText}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Sensor 2 Chart */}
                <Text style={styles.title}>Sensor-2 Values</Text>
                <ScrollView horizontal>
                    <View style={[styles.chartContainer, { marginTop: 20, backgroundColor: getChartBackgroundColor(sensor2LatestValue), width: screenWidth - 40 }]}>
                        <MemoizedYAxis
                            data={sensor2DataSlice.map((entry) => entry.sensor2_value)}
                            style={styles.yAxis}
                            contentInset={styles.contentInset}
                            svg={styles.axisText}
                            min={0}
                            max={4095}
                        />
                        <View style={styles.chart}>
                            <MemoizedLineChart
                                style={styles.lineChart}
                                data={sensor2DataSlice.map((entry) => entry.sensor2_value)}
                                svg={{ stroke: getLineColor(sensor2LatestValue) }}
                                contentInset={styles.contentInset}
                                yMin={0}
                                yMax={4095}
                            >
                                <Grid svg={{ stroke: '#ddd' }} />
                            </MemoizedLineChart>
                            <MemoizedXAxis
                                style={styles.xAxis}
                                data={sensor2DataSlice.map((entry) => new Date(entry.createdDateTime))}  // Mapping the timestamp to Date
                                scale={scale.scaleTime}
                                formatLabel={(value, index) => {
                                    return dateFns.format(new Date(value), 'HH:mm');
                                }}
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
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    chartContainer: {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 10,
    },
    chart: {
        flex: 1,
    },
    lineChart: {
        flex: 1,
        marginLeft: 10,
    },
    yAxis: {
        marginBottom: 30,
    },
    xAxis: {
        marginHorizontal: -10,
        height: 30,
    },
    contentInset: { 
        top: 20, 
        bottom: 20 
    },
    axisText: {
        fontSize: 10,
        fill: 'black',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    legendColorBox: {
        width: 10,
        height: 10,
        marginRight: 5,
    },
    legendText: {
        fontSize: 12,
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
});

export default GraphPage;
