import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from "react-native";

const SwitchAdmin = ({ deviceId, isAdmin }) => {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (deviceId && isAdmin) {
      fetchSwitchState();
    }
  }, [deviceId, isAdmin]);

  const fetchSwitchState = async () => {
    try {
      const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/admin/device/${deviceId}`);
      if (response.ok) {
        const data = await response.json();
        setIsSwitchOn(data.adminValveStatus === 1);
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

  const updateSwitchState = async (newState) => {
    try {
      const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/admin/device/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminValveStatus: newState ? 1 : 0 }),
      });
      if (response.ok) {
        Alert.alert('Success', `Switch turned ${newState ? 'ON' : 'OFF'}`);
        setIsSwitchOn(newState);
        animateButton(newState);
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

  const buttonBackgroundColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['red', 'green'],
  });

  const buttonText = isSwitchOn ? 'ON' : 'OFF';

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.adminText}>This is for admin</Text>
      </View>
      <TouchableOpacity onPress={toggleSwitch} activeOpacity={0.7}>
        <Animated.View style={[styles.button, { backgroundColor: buttonBackgroundColor }]}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Animated.View>
      </TouchableOpacity>
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
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  button: {
    width: 120,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SwitchAdmin;
