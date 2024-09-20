import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Switch, StyleSheet, Alert, ScrollView } from "react-native";
import Battery from "./Battery";
import SwitchAdmin from "./SwitchAdmin";

const SwitchPage = ({ route, navigation }) => {
  const { deviceId, loginId, isAdmin } = route.params;
  const [isEnabled, setIsEnabled] = useState(false); // Represents switch state
  const [batteryPercentage, setBatteryPercentage] = useState(0);
  console.log('This is a admin',isAdmin);

  // Fetch sensor data (sensor1_value and sensor2_value) only
  const fetchDeviceData = useCallback(async () => {
    if (deviceId) {
      try {
        console.log('Fetching device data for deviceId:', deviceId);
        const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
        const data = await response.json();
        if (data) {
          const { sensor1_value, sensor2_value } = data;
          const calculatedFlowRate = (sensor1_value + sensor2_value) / 2;
          const percentage = Math.min(100, Math.max(0, calculatedFlowRate));
          setBatteryPercentage(percentage);
        } else {
          console.error('Device data not found or empty');
        }
      } catch (error) {
        console.error('Error fetching device data:', error);
      }
    }
  }, [deviceId]);

  // Fetch valveStatusOnOrOff only for the switch state
  const fetchValveStatus = useCallback(async () => {
    if (deviceId) {
      try {
        console.log('Fetching valve status for deviceId:', deviceId);
        const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/device/${deviceId}`);
        const data = await response.json();
  
        // Log the entire response to inspect its structure
        console.log('Full fetched valve status response:', data);
  
        if (Array.isArray(data) && data.length > 0 && typeof data[0].valveStatusOnOrOff !== 'undefined') {
          console.log('Fetched valve status:', data[0].valveStatusOnOrOff);
          setIsEnabled(data[0].valveStatusOnOrOff === 1); // Map valveStatusOnOrOff to switch state
        } else {
          console.error('Valve status not found or empty');
        }
      } catch (error) {
        console.error('Error fetching valve status:', error);
      }
    }
  }, [deviceId]);

  useEffect(() => {
    fetchDeviceData(); // Fetch sensor data immediately on mount
    fetchValveStatus(); // Fetch valve status immediately on mount
    const interval = setInterval(() => {
      fetchDeviceData(); // Fetch sensor data every 10 seconds
      fetchValveStatus(); // Fetch valve status every 10 seconds
    }, 10000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchDeviceData, fetchValveStatus]);

  // Toggle switch function with PUT request to update valveStatusOnOrOff
  const toggleSwitch = async () => {
    const newValue = isEnabled ? 0 : 1; // Toggle to the opposite state
    Alert.alert(
      "Confirm Switch",
      newValue === 1 ? "Are you sure you want to turn ON the switch?" : "Are you sure you want to turn OFF the switch?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              console.log('Toggling switch for deviceId:', deviceId);
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
    
              const responseData = await response.json(); // Add this line to inspect the response
  
              if (response.ok) {
                console.log('Switch state updated successfully for deviceId:', deviceId, responseData);
                setIsEnabled(newValue === 1); // Update local state immediately
                Alert.alert('Switch Updated', newValue === 1 ? 'Switch ON the water' : 'Switch OFF the water');
              } else {
                console.error('Failed to update switch state for deviceId:', deviceId, responseData);
              }
            } catch (error) {
              console.error('Error toggling switch:', error);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

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
            onValueChange={toggleSwitch} // Handle switch toggle
            value={isEnabled} // Bind switch to valveStatusOnOrOff
            style={styles.switch}
          />
        </View>
        <View>
          {/* Conditionally render SwitchAdmin if the user is an admin */}
          {isAdmin && <SwitchAdmin deviceId={deviceId} isAdmin={isAdmin} />}
        </View>
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
    transform: [{ scaleX: 2.2 }, { scaleY: 2.2 }], // Increased scale for a bigger switch
    padding: 5,
  },
});

export default SwitchPage;
