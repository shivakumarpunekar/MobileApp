import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'; // Ensure you have installed the types
import * as dateFns from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const MemoizedLineChart = React.memo(LineChart);
const MemoizedYAxis = React.memo(YAxis);
const MemoizedXAxis = React.memo(XAxis);

const GraphPage = ({ route }) => {
    const { deviceId } = route.params;
    const [sensor1Data, setSensor1Data] = useState([]);
    const [sensor2Data, setSensor2Data] = useState([]);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const screenWidth = Dimensions.get('window').width;

    const DATA_STORAGE_KEY = `graphData_${deviceId}`;

    // Fetch data from AsyncStorage
    const loadDataFromStorage = async () => {
        try {
            const storedData = await AsyncStorage.getItem(DATA_STORAGE_KEY);
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setSensor1Data(parsedData.sensor1Data || []);
                setSensor2Data(parsedData.sensor2Data || []);
            }
        } catch (error) {
            console.error('Error loading data from AsyncStorage:', error);
        }
    };

    // Save data to AsyncStorage
    const saveDataToStorage = async () => {
        try {
            const dataToStore = JSON.stringify({ sensor1Data, sensor2Data });
            await AsyncStorage.setItem(DATA_STORAGE_KEY, dataToStore);
        } catch (error) {
            console.error('Error saving data to AsyncStorage:', error);
        }
    };

    const fetchLiveData = useCallback(async () => {
        try {
            console.log('Fetching live data...');
            const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Fetched data:', data);
    
            if (data && data.length > 0) {
                setSensor1Data(prevData => [
                    ...prevData.slice(-9), // Keep only the last 9 elements
                    ...data.map(entry => ({
                        sensor1_value: entry.sensor1_value,
                        timestamp: new Date(entry.timestamp).getTime(),
                    })),
                ]);
                setSensor2Data(prevData => [
                    ...prevData.slice(-9), // Keep only the last 9 elements
                    ...data.map(entry => ({
                        sensor2_value: entry.sensor2_value,
                        timestamp: new Date(entry.timestamp).getTime(),
                    })),
                ]);
            } else {
                setError('No data available for this device.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data.');
        }
    }, [deviceId]);

    useFocusEffect(
        useCallback(() => {
            loadDataFromStorage(); // Load data when the screen comes into focus
            fetchLiveData();
            intervalRef.current = setInterval(fetchLiveData, 5000); // Fetch every 5 seconds
            
            // Clean up on blur (when the page is left)
            return () => {
                clearInterval(intervalRef.current); // Clear interval to stop data fetching
                saveDataToStorage(); // Save data to AsyncStorage before unmounting
            };
        }, [fetchLiveData])
    );

    const getLineColor = (sensorValue) => (sensorValue >= 4000 || sensorValue <= 1250 ? 'red' : 'green');
    const getChartBackgroundColor = (sensorValue) => (sensorValue >= 4000 || sensorValue <= 1250 ? '#FFCDD2' : '#C8E6C9');

    const sensor1DataSlice = sensor1Data.slice(-10); 
    const sensor2DataSlice = sensor2Data.slice(-10); 

    // Create X-axis labels using timestamps
    const createXLabels = (data) => data.map((entry) => dateFns.format(new Date(entry.timestamp), 'HH:mm'));

    const xLabelsSensor1 = createXLabels(sensor1DataSlice);
    const xLabelsSensor2 = createXLabels(sensor2DataSlice);

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                {error ? (
                    <View style={styles.centered}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <>
                        {/* Sensor 1 Chart */}
                        <Text style={styles.title}>Sensor-1 Values</Text>
                        <ScrollView horizontal>
                            <View style={[styles.chartContainer, { backgroundColor: getChartBackgroundColor(sensor1DataSlice.length ? sensor1DataSlice[0].sensor1_value : 0), width: screenWidth - 40 }]}>
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
                                        svg={{ stroke: getLineColor(sensor1DataSlice.length ? sensor1DataSlice[0].sensor1_value : 0) }}
                                        contentInset={styles.contentInset}
                                        yMin={0}
                                        yMax={4095}
                                    >
                                        <Grid svg={{ stroke: '#ddd' }} />
                                    </MemoizedLineChart>
                                    <MemoizedXAxis
                                        style={styles.xAxis}
                                        data={sensor1DataSlice.map((_, index) => index)}
                                        formatLabel={(value) => xLabelsSensor1[value] || ''}
                                        contentInset={{ left: 10, right: 10 }}
                                        svg={styles.axisText}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Sensor 2 Chart */}
                        <Text style={styles.title}>Sensor-2 Values</Text>
                        <ScrollView horizontal>
                            <View style={[styles.chartContainer, { marginTop: 20, backgroundColor: getChartBackgroundColor(sensor2DataSlice.length ? sensor2DataSlice[0].sensor2_value : 0), width: screenWidth - 40 }]}>
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
                                        svg={{ stroke: getLineColor(sensor2DataSlice.length ? sensor2DataSlice[0].sensor2_value : 0) }}
                                        contentInset={styles.contentInset}
                                        yMin={0}
                                        yMax={4095}
                                    >
                                        <Grid svg={{ stroke: '#ddd' }} />
                                    </MemoizedLineChart>
                                    <MemoizedXAxis
                                        style={styles.xAxis}
                                        data={sensor2DataSlice.map((_, index) => index)}
                                        formatLabel={(value) => xLabelsSensor2[value] || ''}
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
