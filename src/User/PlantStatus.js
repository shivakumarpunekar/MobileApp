import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from "moment";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const PlantStatus = ({ loginId }) => {
    const [selectedDate, setSelectedDate] = useState(moment());
    const [flowRate, setFlowRate] = useState(0);
    const [deviceId, setDeviceId] = useState(null);
    const animatedValue = useState(new Animated.Value(0))[0];

    useEffect(() => {
        // Fetch deviceId based on loginId
        const fetchLoginAndDevice = async () => {
            try {
                const response = await fetch(`http://103.145.50.185:2030/api/UserDevice/byProfile/${loginId}`);
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

    useEffect(() => {
        if (deviceId) {
            const fetchWaterData = async () => {
                try {
                    const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/profile/${loginId}/device/${deviceId}`);
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

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: flowRate < 1250 ? 0 : flowRate > 3800 ? 1 : 0.5,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [flowRate]);

    const animatedColor = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ["#00FF00", "#FFFF00", "#FF0000"],
    });

    const handlePrevDay = () => {
        setSelectedDate(prevDate => moment(prevDate).subtract(1, 'day'));
    };

    const handleNextDay = () => {
        setSelectedDate(prevDate => {
            const today = moment();
            const nextDate = moment(prevDate).add(1, 'day');

            if (nextDate.isAfter(today, 'day')) {
                return prevDate; 
            }

            return nextDate;
        });
    };

    const handleWaterFlow = (flowRate) => {
        if (flowRate < 1250) {
            return "Water is full";
        } else if (flowRate >= 3800) {
            return "Water level is 250 ml or 25%";
        } else {
            return "Normal water flow";
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.dateNav}>
                <TouchableOpacity style={styles.navButton} onPress={handlePrevDay}>
                    <Icon style={styles.arrow} name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <Text style={styles.dateText}>{selectedDate.format('YYYY-MM-DD')}</Text>

                <TouchableOpacity style={styles.navButton} onPress={handleNextDay}>
                    <Icon style={styles.arrow} name="arrow-forward" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.waterCard}> 
                <Text style={styles.waterHeader}>Water level</Text>
                
                <View style={styles.waterRow}>
                    <Text style={styles.waterText}>Total value: </Text>
                    <Text style={styles.waterText}>{handleWaterFlow(flowRate)}</Text>
                    
                    <AnimatedIcon 
                        name="water" 
                        size={24} 
                        style={{ color: animatedColor, transform: [{ scale: animatedValue }] }} 
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
    },
    dateNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    dateText: {
        fontSize: 18,
        backgroundColor: 'lightblue',
        color: '#000',
        textAlign: 'center',
        flex: 1,
        paddingVertical: 5,
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
