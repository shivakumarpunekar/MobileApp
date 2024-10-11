import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as dateFns from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const GraphPage = ({ route }) => {
    const { deviceId } = route.params;
    const [sensor1Data, setSensor1Data] = useState([]);
    const [sensor2Data, setSensor2Data] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const screenWidth = Dimensions.get('window').width;

    const DATA_STORAGE_KEY = `graphData_${deviceId}`;

    // Fetch data from AsyncStorage
    const loadDataFromStorage = async () => {
        try {
            const storedData = await AsyncStorage.getItem(DATA_STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setSensor1Data(parsedData.sensor1Data || []);
                setSensor2Data(parsedData.sensor2Data || []);
            }
        } catch (error) {
            console.error('Error loading data from AsyncStorage:', error);
        } finally {
            setLoading(false);
        }
    };

    // Save data to AsyncStorage
    const saveDataToStorage = async (data) => {
        try {
            await AsyncStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data to AsyncStorage:', error);
        }
    };

    const fetchLiveData = async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
            
            // Log the status and response for debugging
            console.log('Response status:', response.status);
            
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
            const data = await response.json();
            console.log('Fetched data:', data); // Log the fetched data
            
            if (data && data.length > 0) {
                const newSensor1Data = data.map(entry => ({
                    sensor1_value: entry.sensor1_value,
                    timestamp: new Date(entry.timestamp).getTime(),
                }));
                const newSensor2Data = data.map(entry => ({
                    sensor2_value: entry.sensor2_value,
                    timestamp: new Date(entry.timestamp).getTime(),
                }));
    
                setSensor1Data(newSensor1Data.slice(15)); // Only store the last 5 records
                setSensor2Data(newSensor2Data.slice(15));
    
                saveDataToStorage({
                    sensor1Data: newSensor1Data.slice(15),
                    sensor2Data: newSensor2Data.slice(15),
                });
            } else {
                setError('No data available for this device.');
            }
        } catch (error) {
            console.error('Error fetching live data:', error);
            setError('Error fetching data.');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadDataFromStorage(); // Load cached data
            fetchLiveData(); // Fetch live data

            // Set up the interval for live data fetching
            intervalRef.current = setInterval(fetchLiveData, 10000); // Fetch every 10 seconds

            // Clean up when the component unmounts or loses focus
            return () => {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            };
        }, [deviceId]) // Add deviceId to dependencies if needed
    );

    const getLineColor = (sensorValue) => (sensorValue >= 4000 || sensorValue <= 1250 ? 'red' : 'green');
    const getChartBackgroundColor = (sensorValue) => (sensorValue >= 4000 || sensorValue <= 1250 ? '#FFCDD2' : '#C8E6C9');

    const createXLabels = (data) => data.map((entry) => dateFns.format(new Date(entry.timestamp), 'HH:mm:ss'));

    const xLabelsSensor1 = createXLabels(sensor1Data);
    const xLabelsSensor2 = createXLabels(sensor2Data);

    // Custom chart width based on data length for scrollable effect
    const chartWidth = Math.max(screenWidth, sensor1Data.length * 60); // Dynamic width based on data points

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.centered}>
                        <Text>Loading data...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centered}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <>
                        {/* Sensor 1 Chart */}
                        <Text style={styles.title}>Sensor-1 Values</Text>
                        <ScrollView horizontal>
                            <View style={[styles.chartContainer, { backgroundColor: getChartBackgroundColor(sensor1Data.length ? sensor1Data[0].sensor1_value : 0), width: chartWidth }]}>
                                <YAxis
                                    data={sensor1Data.map((entry) => entry.sensor1_value)}
                                    style={styles.yAxis}
                                    contentInset={styles.contentInset}
                                    svg={styles.axisText}
                                    min={0}
                                    max={4095}
                                />
                                <View style={styles.chart}>
                                    <LineChart
                                        style={styles.lineChart}
                                        data={sensor1Data.map((entry) => entry.sensor1_value)}
                                        svg={{ stroke: getLineColor(sensor1Data.length ? sensor1Data[0].sensor1_value : 0) }}
                                        contentInset={styles.contentInset}
                                        yMin={0}
                                        yMax={4095}
                                    >
                                        <Grid svg={{ stroke: '#ddd' }} />
                                    </LineChart>
                                    <XAxis
                                        style={styles.xAxis}
                                        data={sensor1Data.map((_, index) => index)}
                                        formatLabel={(value) => xLabelsSensor1[value] || ''}
                                        contentInset={{ left: 25, right: 25 }}
                                        svg={styles.axisText}
                                        numberOfTicks={sensor1Data.length}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Sensor 2 Chart */}
                        <Text style={styles.title}>Sensor-2 Values</Text>
                        <ScrollView horizontal>
                            <View style={[styles.chartContainer, { marginTop: 20, backgroundColor: getChartBackgroundColor(sensor2Data.length ? sensor2Data[0].sensor2_value : 0), width: chartWidth }]}>
                                <YAxis
                                    data={sensor2Data.map((entry) => entry.sensor2_value)}
                                    style={styles.yAxis}
                                    contentInset={styles.contentInset}
                                    svg={styles.axisText}
                                    min={0}
                                    max={4095}
                                />
                                <View style={styles.chart}>
                                    <LineChart
                                        style={styles.lineChart}
                                        data={sensor2Data.map((entry) => entry.sensor2_value)}
                                        svg={{ stroke: getLineColor(sensor2Data.length ? sensor2Data[0].sensor2_value : 0) }}
                                        contentInset={styles.contentInset}
                                        yMin={0}
                                        yMax={4095}
                                    >
                                        <Grid svg={{ stroke: '#ddd' }} />
                                    </LineChart>
                                    <XAxis
                                        style={styles.xAxis}
                                        data={sensor2Data.map((_, index) => index)}
                                        formatLabel={(value) => xLabelsSensor2[value] || ''}
                                        contentInset={{ left: 25, right: 25 }}
                                        svg={styles.axisText}
                                        numberOfTicks={sensor2Data.length}
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
