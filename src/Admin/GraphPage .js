import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as scale from 'd3-scale';

const GraphPage = ({ route }) => {
    const { deviceId } = route.params;
    const [sensor1Data, setSensor1Data] = useState([]);
    const [sensor2Data, setSensor2Data] = useState([]);
    const [xLabels, setXLabels] = useState([]);

    const screenWidth = Dimensions.get('window').width;

    // Helper function to format timestamps in 2-minute intervals
    const formatTimestamp = useCallback((timestamp) => {
        const date = new Date(timestamp);
        let minutes = date.getMinutes();
        // Ensure roundedMinutes stays within 60
        const roundedMinutes = minutes % 2 === 0 ? minutes : (minutes + 1) % 60;
        return `${date.getHours()}:${String(roundedMinutes).padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        const fetchLiveData = async () => {
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

                    // Reverse the data to display latest on the right
                    setSensor1Data(sensor1.reverse());
                    setSensor2Data(sensor2.reverse());

                    // Create X-axis labels at 2-minute intervals
                    const newXLabels = sensor1.map((entry, index) => 
                        index % 2 === 0 ? formatTimestamp(entry.timestamp) : ''
                    );  // Label every second entry to reduce clutter
                    setXLabels(newXLabels);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchLiveData();
        const interval = setInterval(fetchLiveData, 10000); // Fetch every 10 seconds

        return () => clearInterval(interval);
    }, [deviceId, formatTimestamp]);

    // Determine chart line and background color based on the latest sensor value
    const getLineColor = (sensorValue) => sensorValue >= 4000 || sensorValue <= 1250 ? 'red' : 'green';
    const getChartBackgroundColor = (sensorValue) => sensorValue >= 4000 || sensorValue <= 1250 ? '#FFCDD2' : '#C8E6C9';

    // Fallback for background color and line color if no data is present
    const sensor1LatestValue = sensor1Data.length > 0 ? sensor1Data[0].sensor1_value : 0;
    const sensor2LatestValue = sensor2Data.length > 0 ? sensor2Data[0].sensor2_value : 0;

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <Text style={styles.title}>Sensor-1 Values</Text>
                <ScrollView horizontal>
                    <View style={[styles.chartContainer, { backgroundColor: getChartBackgroundColor(sensor1LatestValue), width: screenWidth - 40 }]}>
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
                                svg={{ stroke: getLineColor(sensor1LatestValue) }}
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
                    <View style={[styles.chartContainer, { marginTop: 20, backgroundColor: getChartBackgroundColor(sensor2LatestValue), width: screenWidth - 40 }]}>
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
                                svg={{ stroke: getLineColor(sensor2LatestValue) }}
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
