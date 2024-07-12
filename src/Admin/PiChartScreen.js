import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { PieChart } from 'react-native-svg-charts';
import { G, Text as SvgText } from 'react-native-svg';
import Animated, { Easing } from 'react-native-reanimated';

const { Value, timing } = Animated;

const PiChartScreen = () => {
  const [data, setData] = useState([]);
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [selectedOpacity] = useState(new Value(0));

  useEffect(() => {
    // Fetch data from the API
    axios.get('http://10.0.2.2:2030/api/userprofiles/registrationsSummary')
      .then(response => {
        const formattedData = response.data.map(item => ({
          key: item.createdDate,
          value: item.count,
          svg: { fill: getRandomColor(), onPress: () => handlePieChartClick(item) },
          arc: { outerRadius: '100%', padAngle: 0 },
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
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handlePieChartClick = (item) => {
    setSelectedSlice(item);
    Alert.alert(`Date: ${item.createdDate}`, `Count: ${item.count}`);
    animateSelectedOpacity();
  };

  const animateSelectedOpacity = () => {
    selectedOpacity.setValue(0);
    timing(selectedOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  const Labels = ({ slices }) => {
    return slices.map((slice, index) => {
      const { pieCentroid, data } = slice;
      const isSelected = selectedSlice && selectedSlice.key === data.key;

      return (
        <G key={index}>
          {isSelected && (
            <>
              <AnimatedSvgText
                x={pieCentroid[0]}
                y={pieCentroid[1] - 10}
                fill="white"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={14}
                stroke="black"
                strokeWidth={0.2}
                opacity={selectedOpacity}
              >
                {data.value}
              </AnimatedSvgText>
              <AnimatedSvgText
                x={pieCentroid[0]}
                y={pieCentroid[1] + 10}
                fill="white"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={10}
                stroke="black"
                strokeWidth={0.2}
                opacity={selectedOpacity}
              >
                {data.key}
              </AnimatedSvgText>
            </>
          )}
        </G>
      );
    });
  };

  const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registrations</Text>
      {data.length > 0 && (
        <PieChart
          style={{ height: 220, width: 400 }}
          data={data}
          innerRadius="40%"
          outerRadius="80%"
          labelRadius="110%"
        >
          <Labels />
        </PieChart>
      )}
      <View style={styles.legendContainer}>
        <ScrollView>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: item.svg.fill }]} />
              <Text style={styles.legendText}>{item.key}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F3E7'
  },
  header: {
    fontSize: 18,
    marginVertical: 10
  },
  legendContainer: {
    marginTop: 20,
    width: '90%'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10
  },
  legendText: {
    fontSize: 16
  }
});

export default PiChartScreen;
