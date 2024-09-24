import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from "react-native";

const SwitchAdmin = ({ deviceId, isAdmin, onStatusChange }) => {
  const [status, setStatus] = useState("Auto");
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (deviceId && isAdmin) {
      fetchSwitchState();
      const intervalId = setInterval(() => {
        fetchSwitchState();
      }, 1000); // Refresh every 1 second

      return () => clearInterval(intervalId); // Clear interval on component unmount
    }
  }, [deviceId, isAdmin]);

  const fetchSwitchState = async () => {
    try {
      const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/admin/device/${deviceId}`);
      if (response.ok) {
        const data = await response.json();
        const newStatus = data.adminValveStatus === 1 ? "On" : data.adminValveStatus === 0 ? "Off" : "Auto";
        setStatus(newStatus);
        onStatusChange(newStatus); // Call the callback to update SwitchPage
        animateButton(data.adminValveStatus === 1);
      } else {
        console.error('Failed to fetch switch state');
        Alert.alert('No device is found');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error fetching switch state');
    }
  };

  const updateSwitchState = async (newStatus) => {
    try {
      const adminValveStatus = newStatus === "On" ? 1 : newStatus === "Off" ? 0 : 2; // 2 for Auto
      const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/admin/device/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminValveStatus }),
      });
      if (response.ok) {
        Alert.alert('Success', `Switch turned ${newStatus}`);
        setStatus(newStatus);
        animateButton(newStatus === "On");
      } else {
        console.error('Failed to update switch state');
        Alert.alert('Failed to update switch state');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error updating switch state');
    }
  };

  const animateButton = (newState) => {
    Animated.timing(animationValue, {
      toValue: newState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePress = (newStatus) => {
    Alert.alert(
      'Confirm Switch',
      `Are you sure you want to switch ${newStatus}?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => updateSwitchState(newStatus),
        },
      ]
    );
  };

  if (!isAdmin) {
    return null; // Render nothing if the user is not an admin
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <TouchableOpacity onPress={() => handlePress("On")} style={[styles.button, { backgroundColor: status === "On" ? 'green' : 'lightblue' }]}>
          <Text style={styles.buttonText}>ON</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress("Off")} style={[styles.button, { backgroundColor: status === "Off" ? 'red' : 'lightblue' }]}>
          <Text style={styles.buttonText}>OFF</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress("Auto")} style={[styles.button, { backgroundColor: status === "Auto" ? 'orange' : 'lightblue' }]}>
          <Text style={styles.buttonText}>Auto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'lightblue',
    padding: 20,
    borderRadius: 50, // Increase border radius for a more pronounced curve
    elevation: 3, // For shadow on Android
    shadowColor: '#000', // For shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center', // Centering content horizontally
    justifyContent: 'center', // Centering content vertically
    marginTop: 50,
    width: 350,
  },
  statusRow: {
    flexDirection: 'row', // Arrange buttons in a row
  },
  button: {
    width: 80,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SwitchAdmin;
