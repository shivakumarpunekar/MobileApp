import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, Alert } from "react-native";

const SwitchPage = ({ route, navigation }) => {
  const { deviceId, loginId } = route.params; // Destructure loginId here
  const [isEnabled, setIsEnabled] = useState(false);

  const fetchSwitchState = async () => {
    try {

      //const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/${loginId}/${deviceId}`);
      const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/device/${deviceId}`);

      if (response.ok) {
        const data = await response.json();
        // setIsEnabled(data.valveStatusOnOrOff === 1);
        const valveStatus = data[0];
      setIsEnabled(valveStatus.valveStatusOnOrOff === 1);
      } else {
        console.error('Failed to fetch switch state');
        Alert('no device is there');
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

      //const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/${loginId}/${deviceId}`, {
        const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/device/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valveStatusOnOrOff: newValue,
          deviceId: deviceId,
          userProfileId: loginId,
          createdDate: new Date().toISOString(),
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
          trackColor={{ false: "red", true: "green" }}
          thumbColor={isEnabled ? "green" : "red"}
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
