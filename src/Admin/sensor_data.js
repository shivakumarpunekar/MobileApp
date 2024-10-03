import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigation } from '@react-navigation/native';

const SensorData = ({ route }) => {
    const [data, setData] = useState([]);
    const navigation = useNavigation();
    const { deviceId, loginId, isAdmin } = route.params;
    const [deviceState, setDeviceState] = useState({});

    // Function to fetch sensor data
    const fetchSensorData = async () => {
        try {

            const cachedData = await AsyncStorage.getItem(`sensorData_${deviceId}`);
            if (cachedData !== null) {
                setData(JSON.parse(cachedData));
            }

            const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
            const result = await response.json();
            const latestData = result.slice(0, 30);
            // Store fetched data to AsyncStorage
            await AsyncStorage.setItem(`sensorData_${deviceId}`, JSON.stringify(latestData));
            setData(latestData);
        } catch (error) {
            console.error('Failed to fetch sensor data:', error);
        }
    };

    // Function to fetch relay duration data
    const fetchRelayData = async () => {
        try {

            // Try to get relay data from AsyncStorage first
            const cachedRelayData = await AsyncStorage.getItem(`relayData_${deviceId}`);
            if (cachedRelayData !== null) {
                setDeviceState(JSON.parse(cachedRelayData));
            }

            const response = await fetch(`http://103.145.50.185:2030/api/DeviceStateThreshold/${deviceId}`);
            const result = await response.json();

            // Store fetched relay data to AsyncStorage
            await AsyncStorage.setItem(`relayData_${deviceId}`, JSON.stringify(result));
            setDeviceState(result);
        } catch (error) {
            console.error('Failed to fetch relay data:', error);
        }
    };

    const summaryData = useMemo(() => {
        const threshold1 = parseFloat(deviceState?.threshold_1) || 'N/A';
        const threshold2 = parseFloat(deviceState?.threshold_2) || 'N/A';
        const thresholdAvg = !isNaN(threshold1) && !isNaN(threshold2) ? (threshold1 - 1000) : 'N/A';

        return { state: deviceState?.state || "N/A", threshold1, threshold2, thresholdAvg };
    }, [deviceState]);

    useEffect(() => {
        fetchSensorData();
        fetchRelayData();
        const intervalId = setInterval(() => {
            fetchSensorData();
            fetchRelayData();
        }, 1000); // Fetch data every 1 second
        return () => clearInterval(intervalId);
    }, []);

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
            <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>State: {summaryData.state}</Text>
                <Text style={styles.summaryText}>Threshold 1: {summaryData.threshold1}</Text>
                <Text style={styles.summaryText}>Threshold 2: {summaryData.threshold2}</Text>
                <Text style={styles.summaryText}>Threshold Avg: {summaryData.thresholdAvg}</Text>
            </View>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.itemContainer, renderItemContainerStyle(item.sensor1_value, item.sensor2_value)]}>
                        <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>Device Id: {item.deviceId}</Text>
                        <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>Sensor-1: {item.sensor1_value}</Text>
                        <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>Sensor-2: {item.sensor2_value}</Text>
                        <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>Valve Status: {item.solenoidValveStatus}</Text>
                        <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>Date Time: {item.createdDateTime}</Text>
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
        backgroundColor: '#F6F3E7'
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
    },
    itemTextWhite: {
        color: '#fff',
    },
    itemTextBlack: {
        color: '#000',
    },
    summaryCard: {
        backgroundColor: 'orange',
        padding: 15,
        marginBottom: 10,
        borderRadius: 25,
        width: 200,
        alignSelf: 'flex-end',
    },
    summaryText: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'end',
    },
});

export default SensorData;