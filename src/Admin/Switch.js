import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

const SwitchPage = ({ route, navigation }) => {
  const { deviceId, loginId, isAdmin } = route.params; // Destructure isAdmin here
  const [isEnabled, setIsEnabled] = useState(false);

  const fetchSwitchState = async () => {
    try {
      const url = isAdmin
        ? `http://192.168.1.10:2030/api/ValveStatus/device/${deviceId}`
        : `http://103.145.50.185:2030/api/ValveStatus/${loginId}/${deviceId}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.valveStatusOnOrOff === 1);
      } else {
        console.error('Failed to fetch switch state');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchSwitchState();
  }, [loginId, deviceId]);

  const toggleSwitch = async () => {
    const newValue = isEnabled ? 0 : 1;  // Toggle the value
    setIsEnabled(previousState => !previousState);

    try {
      const url = isAdmin
        ? `http://192.168.1.10:2030/api/ValveStatus/device/${deviceId}`
        : `http://103.145.50.185:2030/api/ValveStatus/${loginId}/${deviceId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valveStatusOnOrOff: newValue,
          deviceId: deviceId,
          userProfileId: loginId,
          updatedDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('Switch state updated successfully');
        navigation.goBack();
      } else {
        console.error('Failed to update switch state');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is a Switch page.</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>{isEnabled ? "On" : "Off"}</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#767557" }}
          thumbColor={isEnabled ? "#000" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
          style={styles.switch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F3E7',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 18,
    marginRight: 10,
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
  },
});

export default SwitchPage;
