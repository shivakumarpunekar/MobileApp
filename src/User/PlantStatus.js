import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import moment from "moment";  // Using moment.js for date manipulation

const PlantStatus = () => {
    const [selectedDate, setSelectedDate] = useState(moment());

    const handlePrevDay = () => {
        setSelectedDate(prevDate => moment(prevDate).subtract(1, 'day'));
    };

    const handleNextDay = () => {
        setSelectedDate(prevDate => {
            const today = moment();
            const nextDate = moment(prevDate).add(1, 'day');
    
            // Check if nextDate is after today; if so, don't change the date
            if (nextDate.isAfter(today, 'day')) {
                return prevDate; 
            }
    
            return nextDate;
        });
    };
    
    const handleWaterFlow = (flowRate) => {
        if (flowRate < 1250) {
            return "Water is full";
        } else if (flowRate >= 3800) {
            return "Water level is 250 ml or 25%";
        } else {
            return "Normal water flow";
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.dateNav}>
            <TouchableOpacity style={styles.navButton} onPress={handlePrevDay}>
                    <Text style={styles.navButtonText}>←</Text>
                </TouchableOpacity>

                <Text style={styles.dateText}>{selectedDate.format('YYYY-MM-DD')}</Text>

                <TouchableOpacity style={styles.navButton} onPress={handleNextDay}>
                    <Text style={styles.navButtonText}>→</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Day Wise" onPress={() => alert('Day Wise Selected')} />
                <Button title="Month Wise" onPress={() => alert('Month Wise Selected')} />
            </View>

            <View style={styles.waterCard}>
                <Text style={styles.waterText}>{handleWaterFlow(4000)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    dateNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    dateText: {
        fontSize: 18,
        backgroundColor: '#00FF00',
        color: '#ffff',
        width:"70%",
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    waterCard: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#e0f7fa',
        alignItems: 'center',
    },
    waterText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PlantStatus;
