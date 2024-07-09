import React, { useState, useMemo } from "react";
import { View, StyleSheet, Dimensions, TextInput } from "react-native";
import { BarChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';

const ChartScreen = () => {
    const route = useRoute();
    const { combinedData } = route.params || {};
    const [searchDate, setSearchDate] = useState('');

    // Function to filter data based on createdDate
    const filteredData = useMemo(() => combinedData.filter(item => {
        if (!item.createdDate) return false;
        const formattedDate = new Date(item.createdDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return formattedDate.includes(searchDate);
    }), [combinedData, searchDate]);

    // Aggregate data to count logins per date
    const loginCounts = filteredData.reduce((acc, item) => {
        const formattedDate = new Date(item.createdDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        acc[formattedDate] = (acc[formattedDate] || 0) + 1;
        return acc;
    }, {});

    const dates = Object.keys(loginCounts);
    const counts = Object.values(loginCounts);

    // Prepare data for bar chart
    const barChartData = {
        labels: dates,
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
                segments={7} // Number of horizontal lines
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
                yAxisInterval={5} // Correct yAxisInterval
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
