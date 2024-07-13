import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const GraphPage = () => {
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [data3, setData3] = useState([]);
    const [labels, setLabels] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://10.0.2.2:2030/api/sensor_data'); // Adjust URL as needed
                const result = await response.json();
                processData(result);
            } catch (error) {
                console.error('Failed to fetch sensor data:', error);
            }
        };

        fetchData();
    }, []);

    const processData = (data) => {
        const sensor1Data = [];
        const sensor2Data = [];
        const valveStatusData = [];
        const timeLabels = [];

        data.forEach(item => {
            const date = new Date(item.timestamp);
            //This is a Y-axis
            const formattedTime = `${date.getHours()}:${date.getMinutes()}`;
            //This is a X-axis
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

            sensor1Data.push(item.sensor1_value);
            sensor2Data.push(item.sensor2_value);
            valveStatusData.push(item.solenoidValveStatus);
            timeLabels.push(formattedTime);
        });

        setData1(sensor1Data);
        setData2(sensor2Data);
        setData3(valveStatusData);
        setLabels(timeLabels);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Device 1</Text>

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
    },
    chartContainer: {
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 16,
    },
});

export default GraphPage;
