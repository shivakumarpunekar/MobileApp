import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const GraphPage = () => {
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [data3, setData3] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://10.0.2.2:2030/api/sensor_data'); // Adjust URL as needed
                const result = await response.json();
                console.log('API Response:', result); // Log the API response
                processData(result);
            } catch (error) {
                console.error('Failed to fetch sensor data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const isValidNumber = (value) => {
        return typeof value === 'number' && !isNaN(value);
    };

    const processData = (data) => {
        const sensor1Data = [];
        const sensor2Data = [];
        const valveStatusData = [];
        const timeLabels = [];

        // Group data by different time intervals
        const hourlyData = groupDataByHour(data);
        const dailyData = groupDataByDay(data);
        const monthlyData = groupDataByMonth(data);
        const yearlyData = groupDataByYear(data);

        // Set state for the desired interval (e.g., dailyData)
        setData1(hourlyData.sensor1Data);
        setData2(hourlyData.sensor2Data);
        setData3(hourlyData.valveStatusData);
        setLabels(hourlyData.timeLabels);
    };

    // Helper function to group data by hour
    const groupDataByHour = (data) => {
        const sensor1Data = [];
        const sensor2Data = [];
        const valveStatusData = [];
        const timeLabels = [];

        data.forEach(item => {
            const date = new Date(item.timestamp);
            const formattedTime = `${date.getHours()}:${date.getMinutes()}`;

            if (isValidNumber(item.sensor1_value) && isValidNumber(item.sensor2_value) && isValidNumber(item.solenoidValveStatus)) {
                sensor1Data.push(item.sensor1_value);
                sensor2Data.push(item.sensor2_value);
                valveStatusData.push(item.solenoidValveStatus);
                timeLabels.push(formattedTime);
            } else {
                console.warn('Invalid data point encountered', item);
            }
        });

        return { sensor1Data, sensor2Data, valveStatusData, timeLabels };
    };

    // Helper function to group data by day
    const groupDataByDay = (data) => {
        // Implement grouping logic by day
        // Return sensor data and labels grouped by day
    };

    // Helper function to group data by month
    const groupDataByMonth = (data) => {
        // Implement grouping logic by month
        // Return sensor data and labels grouped by month
    };

    // Helper function to group data by year
    const groupDataByYear = (data) => {
        // Implement grouping logic by year
        // Return sensor data and labels grouped by year
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#00ff00" />
                <Text style={styles.loaderText}>Loading data...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Device Data</Text>

            {/* Render your charts here using data1, data2, data3, and labels */}
            {/* Example for Sensor-1 */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Sensor-1</Text>
                <LineChart
                    data={{
                        labels: labels,
                        datasets: [
                            {
                                data: data1,
                                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                                strokeWidth: 2 
                            }
                        ],
                        legend: ["Sensor-1"]
                    }}
                    width={Dimensions.get('window').width - 16}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chartStyle}
                />
            </View>

            {/* Example for Sensor-2 */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Sensor-2</Text>
                <LineChart
                    data={{
                        labels: labels,
                        datasets: [
                            {
                                data: data2,
                                color: (opacity = 1) => `rgba(34, 193, 195, ${opacity})`,
                                strokeWidth: 2 
                            }
                        ],
                        legend: ["Sensor-2"]
                    }}
                    width={Dimensions.get('window').width - 16}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chartStyle}
                />
            </View>

            {/* Example for Valve Status */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Valve Status</Text>
                <LineChart
                    data={{
                        labels: labels,
                        datasets: [
                            {
                                data: data3,
                                color: (opacity = 1) => `rgba(253, 187, 45, ${opacity})`,
                                strokeWidth: 2 
                            }
                        ],
                        legend: ["Valve Status"]
                    }}
                    width={Dimensions.get('window').width - 16}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chartStyle}
                />
            </View>
        </ScrollView>
    );
};

const chartConfig = {
    backgroundColor: '#e26a00',
    backgroundGradientFrom: '#fb8c00',
    backgroundGradientTo: '#ffa726',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: '#F6F3E7',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    chartContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    chartTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#555',
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F3E7',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 18,
        color: '#555',
    },
});

export default GraphPage;
