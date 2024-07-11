import React, { useState, useMemo } from "react";
import { View, StyleSheet, Dimensions, TextInput } from "react-native";
import { BarChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';

const ChartScreen = () => {
    const route = useRoute();
    const { combinedData } = route.params || {};
    const [searchDate, setSearchDate] = useState('');

    // Filter and format data based on search date
    const filteredData = useMemo(() => combinedData.filter(item => {
        if (!item.createdDate) return false;
        const formattedDate = new Date(item.createdDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return formattedDate.includes(searchDate);
    }), [combinedData, searchDate]);

    // Count devices per date
    const deviceCounts = filteredData.reduce((acc, item) => {
        const formattedDate = new Date(item.createdDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        acc[formattedDate] = (acc[formattedDate] || 0) + 1;
        return acc;
    }, {});

    // Prepare data for bar chart
    const sortedDates = Object.keys(deviceCounts).sort((a, b) => new Date(a) - new Date(b)); 
    const counts = sortedDates.map(date => deviceCounts[date]);

    const barChartData = {
        labels: sortedDates,
        datasets: [
            {
                data: counts
            }
        ]
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Search by Created Date (MM/DD/YYYY)"
                onChangeText={text => setSearchDate(text)}
                value={searchDate}
            />
            <BarChart
                data={barChartData}
                width={Dimensions.get('window').width - 20}
                height={320}
                fromZero={true}
                yAxisSuffix=""
                yAxisMin={0} // Set minimum y-axis value
                yAxisMax={30} // Set maximum y-axis value
                segments={6} // Number of horizontal lines
                chartConfig={{
                    backgroundColor: '#1cc910',
                    backgroundGradientFrom: '#eff3ff',
                    backgroundGradientTo: '#0f0f',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForBackgroundLines: {
                        strokeDasharray: ""
                    },
                    propsForVerticalLabels: {
                        fontSize: 10
                    }
                }}
                verticalLabelRotation={10}
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
                yAxisInterval={5} // Interval of 5 for y-axis
                yLabelsOffset={10} // Offset for y-axis labels
                showBarTops={false} // Hide bar tops
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F3E7',
        padding: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: Dimensions.get('window').width - 40,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
});

export default ChartScreen;
