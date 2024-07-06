import React, { useState } from "react";
import { View, StyleSheet, Dimensions, TextInput } from "react-native";
import { BarChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';

const ChartScreen = () => {
    const route = useRoute();
    const { combinedData } = route.params || {};
    const [searchDate, setSearchDate] = useState('');

    // Function to filter data based on createdDate
    const filteredData = combinedData.filter(item => {
        const formattedDate = new Date(item.createdDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return formattedDate.includes(searchDate);
    });

    // Prepare data for bar chart
    const barChartData = {
        labels: filteredData.map(item => {
            return new Date(item.createdDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }),
        datasets: [
            {
                data: filteredData.map(item => item.UserProfileId)
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
                yAxisInterval={1} 
                yLabelsOffset={15}
                yAxisSuffix="0"
                chartConfig={{
                    backgroundColor: '#1cc910',
                    backgroundGradientFrom: '#eff3ff',
                    backgroundGradientTo: '#0f0f',
                    decimalPlaces: 0, 
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
