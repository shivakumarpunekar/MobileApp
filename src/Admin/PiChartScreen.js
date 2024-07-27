import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { PieChart } from 'react-native-svg-charts';
import { G, Text as SvgText } from 'react-native-svg';
import Modal from 'react-native-modal';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};


const PiChartScreen = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    axios.get('http://103.145.50.185:2030/api/userprofiles/registrationsSummary')
      .then(response => {
        const formattedData = response.data.map(item => ({
          key: formatDate(item.createdDate),
          value: item.count,
          svg: { fill: getRandomColor() },
          arc: { outerRadius: '100%', padAngle: 0 },
          onPress: () => handlePieChartClick(item)
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
    setSelectedItem(item);
    setModalVisible(true);
  };

  const Labels = ({ slices }) => {
    return slices.map((slice, index) => {
      const { pieCentroid, data } = slice;
      return (
        <G key={index}>
          <SvgText
            x={pieCentroid[0]}
            y={pieCentroid[1] - 10}
            fill="white"
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={14}
            stroke="black"
            strokeWidth={0.2}
          >
            {data.value}
          </SvgText>
          <SvgText
            x={pieCentroid[0]}
            y={pieCentroid[1] + 10}
            fill="white"
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={10}
            stroke="black"
            strokeWidth={0.2}
          >
            {data.key}
          </SvgText>
        </G>
      );
    });
  };

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
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Registration Details</Text>
          {selectedItem && (
            <>
              <Text style={styles.modalText}>Date: {formatDate(selectedItem.createdDate)}</Text>
              <Text style={styles.modalText}>Count: {selectedItem.count}</Text>
            </>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16
  }
});

export default PiChartScreen;
