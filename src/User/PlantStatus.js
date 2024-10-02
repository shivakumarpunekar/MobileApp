import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
import moment from "moment";
import { fetchData, fetchWaterData } from "../Api/api";
import { debounce } from "lodash";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const PlantStatus = ({ loginId }) => {
    const [flowRate, setFlowRate] = useState(0);
    const [deviceId, setDeviceId] = useState(null);
    const animatedValue = useState(new Animated.Value(0))[0];

    const fetchDeviceData = useCallback(async () => {
        if (loginId) {
            await fetchData(loginId, setDeviceId, setFlowRate);
        }
    }, [loginId]);

    const fetchWaterDataDebounced = useMemo(() => debounce(async (deviceId) => {
        if (deviceId) {
            await fetchWaterData(deviceId, setFlowRate);
        }
    }, 500), []);

    useEffect(() => {
        fetchDeviceData();

        const interval = setInterval(() => {
            fetchWaterDataDebounced(deviceId);
        }, 60000);

        return () => {
            clearInterval(interval);
            fetchWaterDataDebounced.cancel();
        };
    }, [fetchDeviceData, fetchWaterDataDebounced, deviceId]);

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: flowRate < 1250 ? 0 : flowRate > 3800 ? 1 : 0.5,
            duration: 10000,
            useNativeDriver: true,
        }).start();
    }, [flowRate]);

    const animatedColor = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ["#FF0000", "#00FF00", "#FF0000"],
    });

    const handleWaterFlow = useCallback((flowRate) => {
        if (flowRate < 1250) {
            return "Soil is more Moisture";
        } else if (flowRate > 3800) {
            return "Soil is Dry";
        } else {
            return "Soil is Moisture";
        }
    }, []);

    const styles = useMemo(() => StyleSheet.create({
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
    }), []);

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
                                    outputRange: [0.8, 1.2],
                                }) 
                            }] 
                        }} 
                    />
                </View>
            </View>
        </View>
    );
};

export default PlantStatus;
