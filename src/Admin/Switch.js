import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Switch, StyleSheet, Alert, ScrollView } from "react-native";
import Battery from "./Battery";
import SwitchAdmin from "./SwitchAdmin";

const SwitchPage = ({ route, navigation }) => {
  const { deviceId, loginId, isAdmin } = route.params;
  const [isEnabled, setIsEnabled] = useState(false); // Represents switch state
  const [batteryPercentage, setBatteryPercentage] = useState(0);
  const [adminValveStatus, setAdminValveStatus] = useState("Auto"); // Track admin status
  const [userValveStatus, setUserValveStatus] = useState("Auto"); // Track user status

  // Handle status change from SwitchAdmin
  const handleStatusChange = (newStatus) => {
    setAdminValveStatus(newStatus); // Update admin valve status
  };

  // Fetch device data (battery, flow rate, etc.)
  const fetchDeviceData = useCallback(async () => {
    if (deviceId) {
      try {
        const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
        const data = await response.json();
        if (data) {
          const { sensor1_value, sensor2_value } = data;
          const calculatedFlowRate = (sensor1_value + sensor2_value) / 2;
          const percentage = Math.min(100, Math.max(0, calculatedFlowRate));
          setBatteryPercentage(percentage);
        }
      } catch (error) {
        console.error('Error fetching device data:', error);
      }
    }
  }, [deviceId]);

  // Fetch valve status (on or off)
  const fetchValveStatus = useCallback(async () => {
    if (deviceId) {
      try {
        const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/device/${deviceId}`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0 && typeof data[0].valveStatusOnOrOff !== 'undefined') {
          setIsEnabled(data[0].valveStatusOnOrOff === 1);
        }
      } catch (error) {
        console.error('Error fetching valve status:', error);
      }
    }
  }, [deviceId]);

  // Fetch all necessary data at once
  const fetchAllData = useCallback(async () => {
    if (deviceId) {
      try {
        await Promise.all([fetchDeviceData(), fetchValveStatus()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  }, [fetchDeviceData, fetchValveStatus, deviceId]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Toggle the valve switch
  const toggleSwitch = async () => {
    // Allow toggling only if admin is in Auto mode or the user is allowed
    if (adminValveStatus === "Auto" || userValveStatus === "On") {
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
    } else {
      Alert.alert('Action Disabled', 'Switch cannot be toggled in this mode.');
    }
  };

  // Determine if the switch is enabled based on admin valve status
  const isSwitchEnabled = adminValveStatus === "Auto" || userValveStatus === "On";

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        {/* Battery View */}
        <Battery deviceId={deviceId} />

        {/* Switch View */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>{isEnabled ? "ON" : "OFF"}</Text>
          <Switch
            trackColor={{ false: "red", true: "green" }}
            thumbColor={isEnabled ? "green" : "red"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.switch}
            disabled={!isSwitchEnabled} // Disable switch if admin status is not Auto and user status is not On
          />
        </View>

        {/* Conditionally render SwitchAdmin if the user is an admin */}
        {isAdmin && <SwitchAdmin deviceId={deviceId} isAdmin={isAdmin} onStatusChange={handleStatusChange} />}
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
