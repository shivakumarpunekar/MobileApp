import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const SwitchLabel = ({ deviceId, isAdmin }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch(`http://103.145.50.185:2030/api/ValveStatus/user/device/${deviceId}`);
                const data = await response.json();
                if (!isAdmin) {
                    setStatus(data.status); // Update status based on response
                }
            } catch (error) {
                console.error("Error fetching status:", error);
            } finally {
                setLoading(false);
            }
        };

        // Fetch the status initially
        fetchStatus();

        // Set up a timer to fetch the status every second
        const interval = setInterval(() => {
            fetchStatus();
        }, 1000);

        // Clear the timer when the component unmounts
        return () => clearInterval(interval);
    }, [deviceId, isAdmin]);

    if (isAdmin) {
        return null; // Do not render anything if the user is an admin
    }

    // Function to get styles for a given status
    const getStatusStyle = (statusType) => {
        const isActive = status === statusType;
        return {
            backgroundColor: isActive ? styles[statusType.toLowerCase()].backgroundColor : styles.default.backgroundColor,
            color: isActive ? '#fff' : '#000', // Text color based on active status
        };
    };

    // Function to render the status labels
    const renderLabels = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#0000ff" />;
        }

        return (
            <View style={styles.circleContainer}>
                <View style={[styles.outerCircle, { backgroundColor: getStatusStyle("On").backgroundColor }]}>
                    <Text style={[styles.innerText, { color: getStatusStyle("On").color }]}>On</Text>
                </View>
                <View style={[styles.outerCircle, { backgroundColor: getStatusStyle("Off").backgroundColor }]}>
                    <Text style={[styles.innerText, { color: getStatusStyle("Off").color }]}>Off</Text>
                </View>
                <View style={[styles.outerCircle, { backgroundColor: getStatusStyle("Undecided").backgroundColor }]}>
                    <Text style={[styles.innerText, { color: getStatusStyle("Undecided").color }]}>😐</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.labelRow}>
                {renderLabels()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'lightblue',
        padding: 20,
        borderRadius: 50, // Increase border radius for a more pronounced curve
        elevation: 3, // For shadow on Android
        shadowColor: '#000', // For shadow on iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        alignItems: 'center', // Centering content horizontally
        justifyContent: 'center', // Centering content vertically
        marginTop: 50,
        width: 250,
    },
    labelRow: {
        flexDirection: 'row', // Arrange items in a row
        justifyContent: 'center', // Center content
        width: '100%', // Full width of the card
    },
    circleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    outerCircle: {
        width: 50,
        height: 50,
        borderRadius: 25, // Makes the View circular
        borderColor: '#000', // Outer circle border color
        borderWidth: 2, // Outer circle border width
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5, // Spacing between circles
    },
    innerText: {
        fontSize: 18,
    },
    on: {
        backgroundColor: 'green', // Green for On
    },
    off: {
        backgroundColor: 'red', // Red for Off
    },
    undecided: {
        backgroundColor: 'orange', // Orange for Undecided
    },
    default: {
        backgroundColor: '#f0f0f0', // Default background color
    }
});

export default SwitchLabel;
