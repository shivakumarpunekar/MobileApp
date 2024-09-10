import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
import moment from "moment";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const PlantStatus = ({ loginId }) => {
    const [selectedDate, setSelectedDate] = useState(moment());
    const [flowRate, setFlowRate] = useState(0);
    const [deviceId, setDeviceId] = useState(null);
    const animatedValue = useState(new Animated.Value(0))[0];

    // Fetch deviceId based on loginId
    useEffect(() => {
        const fetchLoginAndDevice = async () => {
            try {
                const response = await fetch(`http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (data.length > 0 && data[0].deviceId) {
                    setDeviceId(data[0].deviceId);
                } else {
                    console.error('Device ID not found or data is empty');
                }
            } catch (error) {
                console.error('Error fetching login and device data:', error);
            }
        };

        if (loginId) {
            fetchLoginAndDevice();
        }
    }, [loginId]);

    // Fetch water data based on deviceId and update flow rate
    useEffect(() => {
        if (deviceId) {
            const fetchWaterData = async () => {
                try {
                    const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/profile/${loginId}/device/${deviceId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const { sensor1_value, sensor2_value } = data[0];
                        const calculatedFlowRate = (sensor1_value + sensor2_value) / 2;
                        setFlowRate(calculatedFlowRate);
                    } else {
                        console.error('Sensor data not found or data is empty');
                    }
                } catch (error) {
                    console.error('Error fetching water data:', error);
                }
            };

            fetchWaterData();

            const interval = setInterval(() => {
                fetchWaterData();
            }, 5000); // Refresh every 5 seconds

            // Clear the interval on component unmount
            return () => clearInterval(interval);
        }
    }, [deviceId, loginId]);

    // Animate the water icon based on flow rate
    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: flowRate < 1250 ? 0 : flowRate > 3800 ? 1 : 0.5,
            duration: 10000,
            useNativeDriver: false,
        }).start();
    }, [flowRate]);

    const animatedColor = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ["#FF0000", "#00FF00", "#FF0000"],
    });

    // Handle water flow status text
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
        <View style={styles.container}>
            <View style={styles.waterCard}> 
                <Text style={styles.waterHeader}>Water level</Text>
                
                <View style={styles.waterRow}>
                    <Text style={styles.waterText}>{handleWaterFlow(flowRate)}</Text>
                    
                    <AnimatedIcon 
                        name="water" 
                        size={40} 
                        style={{ 
                            color: animatedColor, 
                            transform: [{ 
                                scale: animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1.2],  // Adjusted scale range
                                }) 
                            }] 
                        }} 
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginBottom: 50,
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