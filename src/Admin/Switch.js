import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, Alert, ScrollView } from "react-native";
import Battery from "./Battery";
import SwitchAdmin from "./SwitchAdmin";

const SwitchPage = ({ route, navigation }) => {
  const { deviceId, loginId } = route.params;
  const [isEnabled, setIsEnabled] = useState(false);
  const [batteryPercentage, setBatteryPercentage] = useState(0);

  // Fetch sensor data and calculate battery percentage
  useEffect(() => {
    if (deviceId) {
      const fetchSensorData = async () => {
        try {
          const response = await fetch(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
          const data = await response.json();
          if (data && data.length > 0) {
            const { sensor1_value, sensor2_value } = data[0];
            const calculatedFlowRate = (sensor1_value + sensor2_value) / 2;
            const percentage = Math.min(100, Math.max(0, calculatedFlowRate)); // Ensure percentage is between 0 and 100
            setBatteryPercentage(percentage);
          } else {
            console.error('Sensor data not found or data is empty');
          }
        } catch (error) {
          console.error('Error fetching sensor data:', error);
        }
      };

      fetchSensorData();
      const interval = setInterval(fetchSensorData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [deviceId, loginId]);

  // Fetch switch state
  useEffect(() => {
    const fetchSwitchState = async () => {
      try {
        const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/device/${deviceId}`);
        if (response.ok) {
          const data = await response.json();
          const valveStatus = data[0];
          setIsEnabled(valveStatus.valveStatusOnOrOff === 1);
        } else {
          console.error('Failed to fetch switch state');
          Alert.alert('No device is found');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchSwitchState();
  }, [deviceId, loginId]);

  // Toggle switch
  const toggleSwitch = async () => {
    const newValue = isEnabled ? 0 : 1;

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
            setIsEnabled((previousState) => !previousState);
            try {
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
                Alert.alert(
                  'Switch Updated',
                  newValue === 1 ? 'Switch ON the water' : 'Switch OFF the water'
                );
              } else {
                console.error('Failed to update switch state');
              }
            } catch (error) {
              console.error('Error:', error);
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
        
        <Battery deviceId={deviceId} />
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>{isEnabled ? "ON" : "OFF"}</Text>
          <Switch
            trackColor={{ false: "red", true: "green" }}
            thumbColor={isEnabled ? "green" : "red"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.switch}
          // disabled={batteryPercentage > 75} // Disable switch if battery level is over 75%
          />
        </View>
        <SwitchAdmin loginId={loginId} deviceId={deviceId} />
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
