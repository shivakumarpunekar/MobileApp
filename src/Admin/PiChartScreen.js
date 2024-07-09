import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import axios from 'axios';

const PiChartScreen = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    axios.get('http://10.0.2.2:2030/api/userprofiles/todayRegistrations')
      .then(response => {
        const formattedData = response.data.map(item => ({
          name: item.createdDate,
          count: item.count,
          color: getRandomColor(),
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        }));
        setData(formattedData);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor (Math.random() * 16)];
    }
    return color;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registrations</Text>
      {data.length > 0 && (
        <PieChart
          data={data}
          width={400}
          height={220}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      )}
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, 
  barPercentage: 0.5
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 18,
    marginVertical: 10
  }
});

export default PiChartScreen;
