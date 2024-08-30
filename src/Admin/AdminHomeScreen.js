import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const AdminHomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('AdminProfileScreen')}
        >
          <FontAwesome name="user" size={40} color="#BFA100" />
          <Text style={styles.cardText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PiChartScreen')}
        >
          <FontAwesome name="pie-chart" size={40} color="#BFA100"  />
          <Text style={styles.cardText}>Pi Chart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('SensorDataButton')}
        >
          <FontAwesome name="tachometer" size={40} color="#BFA100"  />
          <Text style={styles.cardText}>Sensor Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('UserDevice')}
        >
          <FontAwesome name="mobile" size={40} color="#BFA100"  />
          <Text style={styles.cardText}>User Device</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('download')}
        >
          <FontAwesome name="download" size={40} color="#BFA100"  />
          <Text style={styles.cardText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Threshold')}
        >
          <FontAwesome name="sliders" size={40} color="#BFA100"  />
          <Text style={styles.cardText}>Threshold</Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F6F3E7',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardText: {
    color: '#333',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default AdminHomeScreen;
