import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const SensorData = ({ route }) => {
    const [data, setData] = useState([]);
    const [relayData, setRelayData] = useState([]);
    const [thresholdData, setThresholdData] = useState({});
    const [isFetching, setIsFetching] = useState(false); // Flag to prevent multiple fetches
    const navigation = useNavigation();
    const { deviceId, loginId, isAdmin } = route.params;

    const fetchSensorData = async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
            const result = await response.json();
            const latestData = result.slice(0, 30);
            const updatedData = latestData.map(item => {
                const threshold = thresholdData[item.deviceId] || {};
                return {
                    ...item,
                    threshold_1: threshold.threshold_1,
                    threshold_2: threshold.threshold_2,
                };
            });
            setData(updatedData);
        } catch (error) {
            console.error('Failed to fetch sensor data:', error);
        }
    };

    const fetchRelayData = async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/relay_durations/Device/${deviceId}`);
            const result = await response.json();
            setRelayData(result);
        } catch (error) {
            console.error('Failed to fetch relay data:', error);
        }
    };

    const fetchThreshold = async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/Threshold/device/${deviceId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const data = await response.json();
            setThresholdData(prevData => ({
                ...prevData,
                [deviceId]: data,
            }));
        } catch (error) {
            console.error('Error fetching threshold data:', error);
        }
    };

    const fetchAllData = useCallback(async () => {
        if (!isFetching) {
            setIsFetching(true); // Set flag to prevent multiple fetches
            await fetchSensorData();
            await fetchRelayData();
            await fetchThreshold();
            setIsFetching(false); // Reset flag after fetching
        }
    }, [isFetching]);

    // Fetch data immediately when the component is mounted
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Fetch data every time the screen is focused (mimics hot reload behavior)
    useFocusEffect(
        useCallback(() => {
            const intervalId = setInterval(() => {
                fetchAllData();
            }, 1000); // Fetch data every 1 second

            return () => clearInterval(intervalId); // Clean up the interval on blur
        }, [fetchAllData])
    );

    const getLatestRelayState = () => {
        if (relayData.length === 0) return { state: "N/A", last_updated: "N/A" };
        const latestRelay = relayData.reduce((a, b) => new Date(a.last_updated) > new Date(b.last_updated) ? a : b);
        return { state: latestRelay.state, last_updated: latestRelay.last_updated };
    };

    const renderItemContainerStyle = (sensor1, sensor2) => {
        if ((sensor1 >= 4000 && sensor2 >= 4000) ||
            (sensor1 <= 1250 && sensor2 <= 1250) ||
            (sensor1 >= 4000 && sensor2 <= 1250) ||
            (sensor1 <= 1250 && sensor2 >= 4000)) {
            return styles.itemContainerRed;
        } else {
            return styles.itemContainerGreen;
        }
    };

    const renderTextStyle = (sensor1, sensor2) => {
        if ((sensor1 >= 4000 && sensor2 >= 4000) ||
            (sensor1 <= 1250 && sensor2 <= 1250) ||
            (sensor1 >= 4000 && sensor2 <= 1250) ||
            (sensor1 <= 1250 && sensor2 >= 4000)) {
            return styles.itemTextWhite;
        } else {
            return styles.itemTextBlack;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Device {deviceId}</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GraphPage', { deviceId })}>
                    <Text style={styles.buttonText}>Go to Graph</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.header}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Switch', { deviceId, loginId, isAdmin })}>
                    <Text style={styles.buttonText}>Switch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Valva_status', { deviceId })}>
                    <Text style={styles.buttonText}>Valve Status</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const thresholdAvg = item.threshold_1 ? item.threshold_1 - 1000 : 'N/A'; // Moved inside renderItem
                    const { state, last_updated } = getLatestRelayState(); // Destructure relay state and last_updated
                    return (
                        <View style={[styles.itemContainer, renderItemContainerStyle(item.sensor1_value, item.sensor2_value)]}>
                            {/* Left column: Device Id, Sensor-1, Sensor-2, Valve Status, Date Time */}
                            <View style={styles.leftColumn}>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Device Id: {item.deviceId}
                                </Text>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Sensor-1: {item.sensor1_value}
                                </Text>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Sensor-2: {item.sensor2_value}
                                </Text>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Valve Status: {item.solenoidValveStatus}
                                </Text>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Date Time: {item.createdDateTime}
                                </Text>
                            </View>

                            {/* Right column: State, Threshold 1, Threshold 2 */}
                            <View style={styles.rightColumn}>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    State: {state}
                                </Text>
                                {/* <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                Date Time:{last_updated}
                                </Text> */}
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Threshold 1: {item.threshold_1 || 'N/A'}
                                </Text>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Threshold 2: {item.threshold_2 || 'N/A'}
                                </Text>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Threshold Avg: {thresholdAvg}
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F6F3E7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#BFA100',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    itemContainer: {
        flexDirection: 'row', // Added to allow left and right columns
        justifyContent: 'space-between', // Space out left and right columns
        marginBottom: 20,
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 8,
    },
    itemContainerGreen: {
        backgroundColor: '#7fff00',
    },
    itemContainerRed: {
        backgroundColor: '#ff0000',
    },
    itemText: {
        fontSize: 16,
        lineHeight: 20,
    },
    itemTextWhite: {
        color: '#fff',
    },
    itemTextBlack: {
        color: '#000',
    },
    leftColumn: {
        flex: 1,
        justifyContent: 'flex-start', // Align items to the left
    },
    rightColumn: {
        flex: 1,
        alignItems: 'flex-end', // Align items to the right
    },
});

export default SensorData;