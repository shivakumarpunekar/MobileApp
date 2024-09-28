import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDeviceStateThreshold, fetchSensorData } from "../Api/api";

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

const ITEM_HEIGHT = 100;

const SensorData = ({ route }) => {
    const [data, setData] = useState([]);
    const [deviceState, setDeviceState] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const { deviceId, loginId, isAdmin } = route.params;

    const DATA_STORAGE_KEY = `sensorData_${deviceId}`;
    const STATE_STORAGE_KEY = `deviceState_${deviceId}`;

    // Fetch data and save to cache asynchronously
    const fetchAllData = useCallback(async () => {
        try {
            const [deviceStateData, sensorData] = await Promise.all([
                fetchDeviceStateThreshold(deviceId),
                fetchSensorData(deviceId)
            ]);

            // Update state and save to cache
            setDeviceState(deviceStateData);
            setData(sensorData);
            await AsyncStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(sensorData));
            await AsyncStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(deviceStateData));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [deviceId]);

    // Load data from cache for faster UI load
    const loadStoredData = useCallback(async () => {
        try {
            const [storedSensorData, storedDeviceState] = await Promise.all([
                AsyncStorage.getItem(DATA_STORAGE_KEY),
                AsyncStorage.getItem(STATE_STORAGE_KEY)
            ]);

            if (storedSensorData) setData(JSON.parse(storedSensorData));
            if (storedDeviceState) setDeviceState(JSON.parse(storedDeviceState));
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }, [DATA_STORAGE_KEY, STATE_STORAGE_KEY]);

    // Initial data loading - cache first, then fetch new data
    useEffect(() => {
        loadStoredData(); // Load cached data
        fetchAllData();   // Fetch new data in background

        // Auto-refresh data every 30 seconds
        const intervalId = setInterval(() => {
            fetchAllData();
        }, 30000); // 30000 ms = 30 seconds

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, [loadStoredData, fetchAllData]);

    // Fetch data when the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchAllData();
        }, [fetchAllData])
    );

    // Styles based on sensor values
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
        const threshold1 = parseFloat(deviceState?.threshold_1) || 'N/A';
        const threshold2 = parseFloat(deviceState?.threshold_2) || 'N/A';
        const thresholdAvg = !isNaN(threshold1) && !isNaN(threshold2) ? (threshold1 - 1000) : 'N/A';

        return { state: deviceState?.state || "N/A", threshold1, threshold2, thresholdAvg };
    }, [deviceState]);

    const renderItem = ({ item }) => (
        <SensorDataItem
            item={item}
            renderItemContainerStyle={renderItemContainerStyle}
            renderTextStyle={renderTextStyle}
        />
    );

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
                renderItem={renderItem}
                initialNumToRender={10}
                windowSize={5}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                getItemLayout={(data, index) => (
                    { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
                )}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
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
        fontSize: 16,
        fontWeight: 'bold',
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