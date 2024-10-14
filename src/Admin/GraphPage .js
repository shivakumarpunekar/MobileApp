import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as dateFns from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const GraphPage = ({ route, navigation }) => {
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
        console.log('Fetching live data...');
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
    
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const data = await response.json();
            console.log('Raw API response:', data); // Log raw API response
            
            if (data && data.length > 0) {
                const newSensor1Data = data.map(entry => ({
                    sensor1_value: entry.sensor1_value,
                    timestamp: new Date(entry.timestamp).getTime(),
                }));
                const newSensor2Data = data.map(entry => ({
                    sensor2_value: entry.sensor2_value,
                    timestamp: new Date(entry.timestamp).getTime(),
                }));
    
                console.log('Parsed sensor1 data:', newSensor1Data); // Log parsed data
                console.log('Parsed sensor2 data:', newSensor2Data); // Log parsed data
    
                setSensor1Data(newSensor1Data.slice(-5)); // Store last 5 records
                setSensor2Data(newSensor2Data.slice(-5));
    
                saveDataToStorage({
                    sensor1Data: newSensor1Data.slice(-5),
                    sensor2Data: newSensor2Data.slice(-5),
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
            console.log('Page is entered');
            loadDataFromStorage(); // Load cached data
            fetchLiveData(); // Fetch live data immediately
        
            // Set up the interval for live data fetching
            intervalRef.current = setInterval(fetchLiveData, 10000); // Fetch every 10 second
        
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current); // Clean up when unmounting or losing focus
                    intervalRef.current = false;
                }
                console.log('Navigating back. GraphPage is unfocused.');
            };
        }, [deviceId]) // Add deviceId as a dependency if necessary
    );    

    const getLineColor = (sensorValue) => (sensorValue >= 4000 || sensorValue <= 1250 ? 'red' : 'green');
    const getChartBackgroundColor = (sensorValue) => (sensorValue >= 4000 || sensorValue <= 1250 ? '#FFCDD2' : '#C8E6C9');

    const createXLabels = (data) => data.map((entry) => dateFns.format(new Date(entry.timestamp), 'HH:mm:ss'));

    const xLabelsSensor1 = createXLabels(sensor1Data);
    const xLabelsSensor2 = createXLabels(sensor2Data);

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
