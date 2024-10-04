import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, ScrollView } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
import moment from "moment";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const PlantStatus = ({ loginId }) => {
    const [devices, setDevices] = useState([]); // Store all devices and their flow rates
    const animatedValues = useState(new Animated.Value(0))[0];

    // Fetch device IDs based on loginId and update the state with device data
    useEffect(() => {
        const fetchDeviceData = async () => {
            try {
                const response = await fetch(`http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (data.length > 0) {
                    // Fetch water data for each device and store it in the state
                    const deviceData = await Promise.all(data.map(async (device) => {
                        const deviceResponse = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${device.deviceId}`);
                        if (!deviceResponse.ok) {
                            throw new Error(`HTTP error! Status: ${deviceResponse.status}`);
                        }
                        const sensorData = await deviceResponse.json();
                        if (sensorData && sensorData.length > 0) {
                            const { sensor1_value, sensor2_value } = sensorData[0];
                            const flowRate = (sensor1_value + sensor2_value) / 2;
                            return { deviceId: device.deviceId, flowRate };
                        }
                        return { deviceId: device.deviceId, flowRate: 0 };
                    }));
                    setDevices(deviceData);  // Store all devices and their flow rates
                } else {
                    console.error('No devices found for this login ID');
                }
            } catch (error) {
                console.error('Error fetching device and sensor data:', error);
            }
        };

        if (loginId) {
            fetchDeviceData();
        }

        const interval = setInterval(() => {
            fetchDeviceData();  // Refresh every 30 seconds
        }, 30000);

        return () => clearInterval(interval);  // Clean up on unmount
    }, [loginId]);

    // Animate the water icon based on flow rate for each device
    useEffect(() => {
        devices.forEach((device, index) => {
            Animated.timing(animatedValues, {
                toValue: device.flowRate < 1250 ? 0 : device.flowRate > 3800 ? 1 : 0.5,
                duration: 10000,
                useNativeDriver: false,
            }).start();
        });
    }, [devices]);

    // Dynamic color interpolation based on flow rate
    const animatedColor = animatedValues.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ["#FF0000", "#00FF00", "#FF0000"],
    });

    // Handle water flow status text dynamically based on flow rate
    const handleWaterFlow = (flowRate) => {
        if (flowRate < 1250) {
            return "Soil is more Moisture";
        } else if (flowRate > 3800) {
            return "Soil is Dry";
        } else {
            return "Soil is Moisture";
        }
    };

    return (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={styles.container}>
            
                {devices.map((device, index) => (
                    <View key={device.deviceId} style={styles.waterCard}> 
                        <Text style={styles.waterHeader}>Water level for Device {device.deviceId}</Text>
                        
                        <View style={styles.waterRow}>
                            <Text style={styles.waterText}>{handleWaterFlow(device.flowRate)}</Text>
                            
                            <AnimatedIcon 
                                name="water" 
                                size={40} 
                                style={{ 
                                    color: animatedColor, 
                                    transform: [{ 
                                        scale: animatedValues.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.8, 1.2],  // Adjusted scale range
                                        }) 
                                    }] 
                                }} 
                            />
                        </View>
                    </View>
                ))}
            
        </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
    },
    waterCard: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#e0f7fa',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
        marginRight: 50,
    },
    waterHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    waterRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    waterText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PlantStatus;
