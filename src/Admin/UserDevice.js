import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const UserDevice = () => {
    const [usernames, setUsernames] = useState([]);
    const [devices, setDevices] = useState([]);
    const [selectedUsername, setSelectedUsername] = useState('');
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [isActivated, setIsActivated] = useState(false);

    useEffect(() => {
        axios.get('http://10.0.2.2:2030/api/UserDevice')
            .then(response => {
                setUsernames(response.data.usernames);
                setDevices(response.data.devices);
            })
            .catch(error => {
                console.error('Error fetching data from API:', error);
            });
    }, []);

    const handleSubmit = () => {
        const payload = {
            username: selectedUsername,
            deviceId: selectedDeviceId,
            status: isActivated ? 'Active' : 'Inactive',
        };

        axios.post('http://10.0.2.2:2030/api/UserDevice', payload)
            .then(response => {
                Alert.alert('Success', 'User Device has been updated successfully.');
            })
            .catch(error => {
                console.error('Error submitting data:', error);
                Alert.alert('Error', 'There was an error updating the User Device.');
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Username:</Text>
            <Picker
                selectedValue={selectedUsername}
                onValueChange={(itemValue) => setSelectedUsername(itemValue)}
                style={styles.picker}
            >
            </Picker>

            <Text style={styles.label}>Device ID:</Text>
            <Picker
                selectedValue={selectedDeviceId}
                onValueChange={(itemValue) => setSelectedDeviceId(itemValue)}
                style={styles.picker}
            >
            </Picker>

            <Text style={styles.label}>Status:</Text>
            <Text style={styles.statusText}>{isActivated ? 'On' : 'Off'}</Text>
            <Switch
                onValueChange={setIsActivated}
                value={isActivated}
                thumbColor={isActivated ? '#4CAF50' : '#f4f3f4'}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                style={styles.switch}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F6F3E7'
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 8,
        color: '#333',
    },
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 8,
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 8,
    },
    switch: {
        marginVertical: 8,
    },
    button: {
        backgroundColor: '#BFA100',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default UserDevice;
