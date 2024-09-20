import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDeviceStateThreshold, fetchSensorData } from "../Api/api";

// Memoized item component to avoid unnecessary re-renders
const SensorDataItem = React.memo(({ item, renderItemContainerStyle, renderTextStyle }) => (
    <View style={[styles.itemContainer, renderItemContainerStyle(item.sensor1_value, item.sensor2_value)]}>
        <View style={styles.leftColumn}>
            <Text style={[styles.itemText, renderTextStyle(item.sensor1_value, item.sensor2_value)]}>
                Device Id: {item.deviceId}
            </Text>
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
    </View>
));

const SensorData = ({ route }) => {
    const [data, setData] = useState([]);
    const [deviceState, setDeviceState] = useState({});
    const [isFetching, setIsFetching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const { deviceId, loginId, isAdmin } = route.params;

    const DATA_STORAGE_KEY = `sensorData_${deviceId}`;
    const STATE_STORAGE_KEY = `deviceState_${deviceId}`;

    // Optimized fetch calls
    const fetchAllData = useCallback(async () => {
        if (!isFetching) {
            setIsFetching(true);
            setLoading(true);
            const deviceStateData = await fetchDeviceStateThreshold(deviceId);
            setDeviceState(deviceStateData);

            const sensorData = await fetchSensorData(deviceId, deviceStateData);
            setData(sensorData);

            setLoading(false);
            setIsFetching(false);
        }
    },[deviceId, isFetching]);

    // Load stored data when the component is mounted
    const loadStoredData = useCallback(async () => {
        try {
            const storedSensorData = await AsyncStorage.getItem(DATA_STORAGE_KEY);
            const storedDeviceState = await AsyncStorage.getItem(STATE_STORAGE_KEY);

            if (storedSensorData) setData(JSON.parse(storedSensorData));
            if (storedDeviceState) setDeviceState(JSON.parse(storedDeviceState));
        } catch (error) {
            console.error('Error loading stored data:', error);
        } finally {
            setLoading(false);
        }
    }, [deviceId]);

    useEffect(() => {
        loadStoredData();
        fetchAllData();
    }, [fetchAllData, loadStoredData]);

    // Use focus effect to refresh data
    useFocusEffect(
        useCallback(() => {
            fetchAllData();
        }, [fetchAllData])
    );

    // Memoized value for relay state
    const getLatestRelayState = useMemo(() => {
        return deviceState?.state || "N/A";
    }, [deviceState]);

    const renderItemContainerStyle = useCallback((sensor1, sensor2) => {
        return (sensor1 >= 4000 && sensor2 >= 4000) ||
               (sensor1 <= 1250 && sensor2 <= 1250) ||
               (sensor1 >= 4000 && sensor2 <= 1250) ||
               (sensor1 <= 1250 && sensor2 >= 4000)
            ? styles.itemContainerRed
            : styles.itemContainerGreen;
    }, []);

    const renderTextStyle = useCallback((sensor1, sensor2) => {
        return (sensor1 >= 4000 && sensor2 >= 4000) ||
               (sensor1 <= 1250 && sensor2 <= 1250) ||
               (sensor1 >= 4000 && sensor2 <= 1250) ||
               (sensor1 <= 1250 && sensor2 >= 4000)
            ? styles.itemTextWhite
            : styles.itemTextBlack;
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    }, [fetchAllData]);

    const summaryData = useMemo(() => {
        const threshold1 = deviceState?.threshold_1 || 'N/A';
        const threshold2 = deviceState?.threshold_2 || 'N/A';
        const thresholdAvg = (threshold1 !== 'N/A' && threshold2 !== 'N/A') ? (Number(threshold1)) - 1000 : 'N/A';

        return { state: getLatestRelayState, threshold1, threshold2, thresholdAvg };
    }, [deviceState, getLatestRelayState]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#BFA100" />
            </View>
        );
    }

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
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ValveStatus', { deviceId })}>
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
                    <SensorDataItem
                        item={item}
                        renderItemContainerStyle={renderItemContainerStyle}
                        renderTextStyle={renderTextStyle}
                    />
                )}
                refreshing={refreshing}
                onRefresh={onRefresh}
                // FlatList optimizations
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={21}
                removeClippedSubviews={true} // Reduce memory consumption
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
    itemContainer: {
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
    },
    itemContainerGreen: {
        backgroundColor: '#7ff000',
    },
    itemContainerRed: {
        backgroundColor: '#ff0000',
    },
    itemText: {
        fontSize: 14,
    },
    itemTextBlack: {
        color: '#000',
    },
    itemTextWhite: {
        color: '#FFF',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#BFA100',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    summaryCard: {
        backgroundColor: 'orange',
        padding: 15,
        marginBottom: 10,
        borderRadius: 25,
        width:200,
        alignSelf: 'flex-end',

    },
    summaryText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SensorData;
