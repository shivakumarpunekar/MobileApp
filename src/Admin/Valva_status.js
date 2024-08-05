import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation } from '@react-navigation/native';

const ValvaStatus = () => {
  const [uniqueDates, setUniqueDates] = useState([]);
  const route = useRoute();
  const navigation = useNavigation();
  const { deviceId } = route.params;

  useEffect(() => {
    fetch(`http://192.168.1.10:2030/api/sensor_data/device/${deviceId}/uniqueDatesLast30Days`)
      .then((response) => response.json())
      .then((data) => {
        setUniqueDates(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [deviceId]);

  return (
    <View style={styles.container}>
      {uniqueDates.map((date, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => navigation.navigate('Valva_status_detail', { deviceId, date })}
        >
          <Text style={styles.buttonText}>{new Date(date).toDateString()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F3E7',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#BFA100',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ValvaStatus;
