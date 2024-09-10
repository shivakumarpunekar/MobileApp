import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';

const SensorData = ({ route }) => {
    const [data, setData] = useState([]);
    const [relayData, setRelayData] = useState([]);
    const [thresholdData, setThresholdData] = useState({});
    const navigation = useNavigation();
    const { deviceId, loginId, isAdmin } = route.params;

    // Function to fetch sensor data
    const fetchSensorData = async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
            const result = await response.json();
            const latestData = result.slice(0, 30); // Only keep the latest 30 entries
            // Merge threshold data into sensor data
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

    // Function to fetch relay duration data
    const fetchRelayData = async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/relay_durations/Device/${deviceId}`);
            const result = await response.json();
            setRelayData(result);
        } catch (error) {
            console.error('Failed to fetch relay data:', error);
        }
    };

    // Function to fetch Threshold data and update it for the specific device
    const fetchThreshold = async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/Threshold/device/${deviceId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const data = await response.json();
            // Ensure that we only update the entry for the current deviceId
            setThresholdData(prevData => ({
                ...prevData,
                [deviceId]: data, // Store threshold data keyed by deviceId
            }));
        } catch (error) {
            console.error('Error fetching threshold data:', error);
        }
    };

    useEffect(() => {
        fetchSensorData();
        fetchRelayData();
        fetchThreshold();
        const intervalId = setInterval(() => {
            fetchSensorData();
            fetchRelayData();
            fetchThreshold();
        }, 1000); // Fetch data every 1 second
        return () => clearInterval(intervalId);
    }, [thresholdData]); // Ensure we re-fetch if threshold data changes

    // Function to get the latest relay state based on timestamp
    const getLatestRelayState = () => {
        if (relayData.length === 0) return "N/A";
        const latestRelay = relayData.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b);
        return latestRelay.state;
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
                renderItem={({ item }) => (
                    <View style={[styles.itemContainer, renderItemContainerStyle(item.sensor1_value, item.sensor2_value)]}>
                        <View style={styles.row}>
                            {/* Left-aligned text */}
                            <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value), styles.flexText]}>
                                Device Id: {item.deviceId}
                            </Text>

                            {/* Right-aligned text for State and Threshold */}
                            <View style={styles.rightContainer}>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    State: {getLatestRelayState()}
                                </Text>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Threshold 1: {item.threshold_1 || 'N/A'}
                                </Text>
                                <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                                    Threshold 2: {item.threshold_2 || 'N/A'}
                                </Text>
                            </View>
                        </View>

                        {/* Rest of the data */}
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
                )}
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
        lineHeight: 20, // Ensure equal spacing between lines of text
    },
    itemTextWhite: {
        color: '#fff',
    },
    itemTextBlack: {
        color: '#000',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rightContainer: {
        marginLeft: 'auto',
        alignItems: 'flex-end',
    },
    flexText: {
        flex: 1,
    },
});


export default SensorData;