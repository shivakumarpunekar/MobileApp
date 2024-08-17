import React from "react";
import { View, Text, Dimensions } from "react-native";
import { BarChart, Grid } from 'react-native-svg-charts';
import { G, Line, Text as SVGText } from 'react-native-svg';
import * as scale from 'd3-scale';
import moment from 'moment';

const Bargraph = () => {
    // Sample data: array of objects with value and date
    const data = [
        { value: 1000, date: '2024-08-01T12:00:00Z' },
        { value: 2000, date: '2024-08-02T12:00:00Z' },
        { value: 3000, date: '2024-08-03T12:00:00Z' },
        { value: 4000, date: '2024-08-04T12:00:00Z' },
        { value: 5000, date: '2024-08-05T12:00:00Z' },
    ];

    // Function to determine the color of each bar based on its value
    const getBarColor = (value) => {
        if (value >= 3800) return '#FF0000'; // Red for values ≥ 3800
        if (value >= 1250 && value < 3800) return '#00FF00'; // Green for values between 1250 and 3800
        return '#FF0000'; // Red for values < 1250
    };

    const barData = data.map(item => ({
        value: item.value,
        color: getBarColor(item.value),
    }));

    // Custom grid to add more detailed labels
    const CustomGrid = ({ x, y, ticks }) => (
        <G>
            {
                ticks.map(tick => (
                    <Line
                        key={tick}
                        x1={0}
                        x2={Dimensions.get('window').width}
                        y1={y(tick)}
                        y2={y(tick)}
                        stroke="rgba(0,0,0,0.2)"
                    />
                ))
            }
        </G>
    );

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Bar Graph
            </Text>
            <BarChart
                style={{ height: 300 }}
                data={barData.map(item => item.value)}
                svg={{ fill: ({ index }) => barData[index].color }}
                contentInset={{ top: 30, bottom: 30 }}
                yMin={0}
                yMax={5000}
                spacingInner={0.2}
                spacingOuter={0.2}
                xAccessor={({ index }) => index}
                yAccessor={({ item }) => item}
                gridMin={0}
                gridMax={5000}
                numberOfTicks={10}
                gridProps={{ strokeDasharray: [4, 8] }}
            >
                <Grid svg={{ strokeDasharray: [4, 8] }} />
            </BarChart>
        </View>
    );
}

export default Bargraph;
