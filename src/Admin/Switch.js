import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Switch, StyleSheet, Alert, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Battery from "./Battery";
import SwitchAdmin from "./SwitchAdmin";

const SwitchPage = ({ route, navigation }) => {
  const { deviceId, loginId, isAdmin } = route.params;
  const [isEnabled, setIsEnabled] = useState(false);
  const [batteryPercentage, setBatteryPercentage] = useState(0);
  const [adminValveStatus, setAdminValveStatus] = useState("Auto");
  const [userValveStatus, setUserValveStatus] = useState("Auto");
  const [isAdminSetValveStatus, setIsAdminSetValveStatus] = useState(false);

  const handleStatusChange = useCallback((newStatus) => {
    setAdminValveStatus(newStatus);
  }, []);

  const fetchDeviceData = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
      const data = await response.json();
      if (data) {
        const { sensor1_value, sensor2_value } = data;
        const calculatedFlowRate = (sensor1_value + sensor2_value) / 2;
        const percentage = Math.min(100, Math.max(0, calculatedFlowRate));
        setBatteryPercentage(percentage);
        await AsyncStorage.setItem(`@deviceData_${deviceId}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching device data:', error);
    }
  }, [deviceId]);

  const fetchValveStatus = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/device/${deviceId}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const { valveStatusOnOrOff, isAdminSetValveStatus } = data[0];
        setIsEnabled(valveStatusOnOrOff === 1);
        setIsAdminSetValveStatus(isAdminSetValveStatus);
        await AsyncStorage.setItem(`@valveStatus_${deviceId}`, JSON.stringify(data[0]));
      }
    } catch (error) {
      console.error('Error fetching valve status:', error);
    }
  }, [deviceId]);

  const fetchAllData = useCallback(async () => {
    if (!deviceId) return;
    try {
      await Promise.all([fetchDeviceData(), fetchValveStatus()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [fetchDeviceData, fetchValveStatus, deviceId]);

  const loadCachedData = useCallback(async () => {
    try {
      const cachedDeviceData = await AsyncStorage.getItem(`@deviceData_${deviceId}`);
      const cachedValveStatus = await AsyncStorage.getItem(`@valveStatus_${deviceId}`);

      if (cachedDeviceData) {
        const data = JSON.parse(cachedDeviceData);
        const { sensor1_value, sensor2_value } = data;
        const calculatedFlowRate = (sensor1_value + sensor2_value) / 2;
        const percentage = Math.min(100, Math.max(0, calculatedFlowRate));
        setBatteryPercentage(percentage);
      }

      if (cachedValveStatus) {
        const data = JSON.parse(cachedValveStatus);
        const { valveStatusOnOrOff, isAdminSetValveStatus } = data;
        setIsEnabled(valveStatusOnOrOff === 1);
        setIsAdminSetValveStatus(isAdminSetValveStatus);
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }, [deviceId]);

  useEffect(() => {
    loadCachedData();
    fetchAllData();
  }, [loadCachedData, fetchAllData]);

  const toggleSwitch = useCallback(async () => {
    if (!isAdminSetValveStatus) {
      Alert.alert('Action Disabled', 'Switch cannot be toggled in this mode.');
      return;
    }

    const newValue = isEnabled ? 0 : 1;
    Alert.alert(
      "Confirm Switch",
      newValue === 1 ? "Are you sure you want to turn ON the switch?" : "Are you sure you want to turn OFF the switch?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/device/${deviceId}`, {
                method: 'PUT',
                headers: {
                  'Accept': '*/*',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  valveStatusOnOrOff: newValue,
                  deviceId,
                  userProfileId: loginId,
                  createdDate: new Date().toISOString(),
                  updatedDate: new Date().toISOString(),
                }),
              });

              if (response.ok) {
                setIsEnabled(newValue === 1);
                Alert.alert('Switch Updated', newValue === 1 ? 'Switch ON the water' : 'Switch OFF the water');
              } else {
                Alert.alert('Update Failed', 'Failed to update the switch status.');
              }
            } catch (error) {
              console.error('Error toggling switch:', error);
              Alert.alert('Error', 'There was an error processing your request.');
            }
          }
        }
      ],
      { cancelable: true }
    );
  }, [isAdminSetValveStatus, isEnabled, deviceId, loginId]);

  const memoizedBattery = useMemo(() => <Battery deviceId={deviceId} />, [deviceId]);
  const memoizedSwitchAdmin = useMemo(() => isAdmin && <SwitchAdmin deviceId={deviceId} isAdmin={isAdmin} onStatusChange={handleStatusChange} />, [deviceId, isAdmin, handleStatusChange]);

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        {memoizedBattery}
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>{isEnabled ? "ON" : "OFF"}</Text>
          <Switch
            trackColor={{ false: "red", true: "green" }}
            thumbColor={isEnabled ? "green" : "red"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.switch}
            disabled={!isAdminSetValveStatus}
          />
        </View>
        {memoizedSwitchAdmin}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F3E7',
    padding: 20,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  switchText: {
    fontSize: 22,
    marginRight: 10,
  },
  switch: {
    transform: [{ scaleX: 2.2 }, { scaleY: 2.2 }],
    padding: 5,
  },
});

export default SwitchPage;
