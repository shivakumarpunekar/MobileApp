import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, Alert } from "react-native";

const SwitchAdmin = ({ deviceId, isAdmin }) => {
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  useEffect(() => {
    if (deviceId && isAdmin) {
      fetchSwitchState();
    }
  }, [deviceId, isAdmin]);

  const fetchSwitchState = async () => {
    try {
      const response = await fetch(`http://192.168.1.10:2030/api/ValveStatus/admin/device/${deviceId}`);
      if (response.ok) {
        const data = await response.json();
        setIsSwitchOn(data.adminValveStatus === 1);
      } else {
        console.error('Failed to fetch switch state');
        Alert.alert('No device is found');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error fetching switch state');
    }
  };

  const updateSwitchState = async (newState) => {
    try {
      const response = await fetch(`http://192.168.1.10:2030/api/ValveStatus/admin/device/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminValveStatus: newState ? 1 : 0 }),
      });
      if (response.ok) {
        Alert.alert('Success', `Switch turned ${newState ? 'ON' : 'OFF'}`);
        setIsSwitchOn(newState);
      } else {
        console.error('Failed to update switch state');
        Alert.alert('Failed to update switch state');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error updating switch state');
    }
  };

  const toggleSwitch = () => {
    const newState = !isSwitchOn;
    Alert.alert(
      'Confirm Switch Change',
      `Are you sure you want to turn the switch ${newState ? 'ON' : 'OFF'}?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => updateSwitchState(newState),
        },
      ]
    );
  };

  if (!isAdmin) {
    return null; // Render nothing if the user is not an admin
  }

  return (
    <View style={styles.container}>
      {/* Admin text at the top */}
      <View style={styles.textContainer}>
        <Text style={styles.adminText}>This is for admin</Text>
      </View>

      {/* Switch and status */}
      <View style={styles.switchContainer}>
        <Text style={styles.text}>{isSwitchOn ? "ON" : "OFF"}</Text>
        <Switch
          trackColor={{ false: "red", true: "green" }}
          thumbColor={isSwitchOn ? "green" : "red"}
          onValueChange={toggleSwitch}
          value={isSwitchOn}
          style={styles.switch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  textContainer: {
    marginBottom: 10, // Add space between the admin text and the switch
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 22,
    marginRight: 20,
  },
  switch: {
    transform: [{ scaleX: 2 }, { scaleY: 2 }],
  },
});

export default SwitchAdmin;
