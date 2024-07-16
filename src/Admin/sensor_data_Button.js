import React, { useEffect, useState } from "react";
import { View, Button, ActivityIndicator, StyleSheet } from "react-native";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const SensorDataButton = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axios.get('http://localhost:2030/api/sensor_data');
                setDevices(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const handleDevicePress = (deviceId) => {
        navigation.navigate('SensorData', { deviceId });
    };

    return (
        <View style={styles.container}>
            {devices.map(device => (
                <Button
                    key={device.deviceId}
                    title={`Device ${device.deviceId}`}
                    onPress={() => handleDevicePress(device.deviceId)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SensorDataButton;
