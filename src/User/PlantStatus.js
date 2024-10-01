import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
import moment from "moment";
import { fetchData, fetchWaterData } from "../Api/api";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const PlantStatus = ({ loginId }) => {
    const [flowRate, setFlowRate] = useState(0);
    const [deviceId, setDeviceId] = useState(null);  // Track device ID
    const animatedValue = useState(new Animated.Value(0))[0];

    // Fetch deviceId and flow rate based on loginId
    useEffect(() => {
        const fetchDeviceData = async () => {
            if (loginId) {
                await fetchData(loginId, setDeviceId, setFlowRate);  // Fetch device ID and flow rate
            }
        };

        fetchDeviceData();

        // Set interval for refreshing water data
        const interval = setInterval(() => {
            if (deviceId) {
                fetchData(deviceId, setFlowRate);  // Refresh the flow rate every 30 seconds
            }
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [loginId, deviceId]);  // Ensure the effect re-runs when deviceId is updated

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
        marginBottom: 15,
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
