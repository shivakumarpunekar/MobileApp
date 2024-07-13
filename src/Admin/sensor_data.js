import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const SensorData = () => {
    const [data, setData] = useState([]);

    const fetchSensorData = async () => {
        try {
            const response = await fetch('http://10.0.2.2:2030/api/sensor_data');
            const result = await response.json();
            const latestData = result.slice(0, 30);
            setData(latestData);
        } catch (error) {
            console.error('Failed to fetch sensor data:', error);
        }
    };

    useEffect(() => {
        fetchSensorData();
        const intervalId = setInterval(fetchSensorData, 10000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sensor Data</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemText}>ID: {item.id}</Text>
                        <Text style={styles.itemText}>Sensor1 Value: {item.sensor1_value}</Text>
                        <Text style={styles.itemText}>Sensor2 Value: {item.sensor2_value}</Text>
                        <Text style={styles.itemText}>Device Id: {item.deviceId}</Text>
                        <Text style={styles.itemText}>Solenoid Valve Status: {item.solenoidValveStatus}</Text>
                        <Text style={styles.itemText}>Created Date: {(item.timestamp)}</Text>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    itemContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Shadow for Android
        elevation: 8,
    },
    itemText: {
        fontSize: 16,
        color:'#000'
    },
});

export default SensorData;
