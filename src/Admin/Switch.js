import React, { useState } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

const SwitchPage = () => {
    const [isEnabled, setIsEnabled] = useState(false);

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>This is a Switch page.</Text>
            <View style={styles.switchContainer}>
                <Text style={styles.switchText}>{isEnabled ? "On" : "Off"}</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#767557" }}
                    thumbColor={isEnabled ? "#000" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                    style={styles.switch}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F3E7',
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchText: {
        fontSize: 18,
        marginRight: 10,
    },
    switch: {
        transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
    },
});

export default SwitchPage;
