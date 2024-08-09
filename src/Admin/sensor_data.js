import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';

const SensorData = () => {
    const [data, setData] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const { deviceId } = route.params;

    const fetchSensorData = async () => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
            const result = await response.json();
            const latestData = result.slice(0, 30);
            setData(latestData);
        } catch (error) {
            console.error('Failed to fetch sensor data:', error);
        }
    };

    useEffect(() => {
        fetchSensorData();
        const intervalId = setInterval(fetchSensorData, 1000); // Fetch data every 1 second
        return () => clearInterval(intervalId);
    }, []);

    const renderItemContainerStyle = (sensor1, sensor2) => {
        // Conditionally determine the background color based on sensor values
        if ((sensor1 >= 4000 && sensor2 >= 4000) ||
            (sensor1 <= 1250 && sensor2 <= 1250) ||
            (sensor1 >= 4000 && sensor2 <= 1250) ||
            (sensor1 <= 1250 && sensor2 >= 4000)) {
            return styles.itemContainerRed; // Red background
        } else {
            return styles.itemContainerGreen; // Green background
        }
    };

    const renderTextStyle = (sensor1, sensor2) => {
        // Conditionally determine the text color based on the background color
        if ((sensor1 >= 4000 && sensor2 >= 4000) ||
            (sensor1 <= 1250 && sensor2 <= 1250) ||
            (sensor1 >= 4000 && sensor2 <= 1250) ||
            (sensor1 <= 1250 && sensor2 >= 4000)) {
            return styles.itemTextWhite; // White text color for red background
        } else {
            return styles.itemTextBlack; // Default black text color
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* This is a title and graph button */}
                <Text style={styles.title}>Device {deviceId}</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GraphPage', { deviceId })}>
                    <Text style={styles.buttonText}>Go to Graph</Text>
                </TouchableOpacity>
            </View>
            {/* This is a button for Switch and Valve-status */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Switch', { deviceId })}>
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
        // backgroundColor: '#BFA100',
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
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Shadow for Android
        elevation: 8,
    },
    itemContainerGreen: {
        backgroundColor: '#7fff00', // Green background
    },
    itemContainerRed: {
        backgroundColor: '#ff0000', // Red background for specific condition
    },
    itemText: {
        fontSize: 16,
    },
    itemTextWhite: {
        color: '#fff', // White text color
    },
    itemTextBlack: {
        color: '#000', // Black text color
    },
});

export default SensorData;
