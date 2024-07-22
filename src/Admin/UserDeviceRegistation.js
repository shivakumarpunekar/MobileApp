import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const UserDeviceRegistration = () => {
    const [userProfiles, setUserProfiles] = useState([]);
    const [selectedUsername, setSelectedUsername] = useState('');
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [isActivated, setIsActivated] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserProfiles = async () => {
            try {
                const response = await fetch('http://192.168.1.10:2030/api/userprofiles/GetuserprofileByName');
                const data = await response.json();
                setUserProfiles(data);
            } catch (error) {
                console.error('Error fetching user profiles:', error);
            }
        };

        const fetchDevices = async () => {
            try {
                const response = await axios.get('http://192.168.1.10:2030/api/sensor_data/deviceId');
                setDevices(response.data);
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };

        fetchUserProfiles();
        fetchDevices();
    }, []);

    const handleSubmit = () => {
        if (!selectedUsername || !selectedDeviceId) {
            Alert.alert('Error', 'Please select the username and device ID.');
            return;
        }

        const payload = {
            profileId: selectedUsername,
            sensor_dataId: selectedDeviceId,
            deviceStatus: isActivated ? 'Active' : 'Inactive',
        };

        axios.post('http://192.168.1.10:2030/api/UserDevice', payload)
            .then(response => {
                Alert.alert('Success', 'User Device has been updated successfully.');
                navigation.navigate('UserDevice');
            })
            .catch(error => {
                if (error.response && error.response.data) {
                    Alert.alert('Error', error.response.data);
                } else {
                    Alert.alert('Error', 'There was an error updating the User Device.');
                }
            });
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.label}>Username:</Text>
                <Picker
                    selectedValue={selectedUsername}
                    onValueChange={(itemValue) => setSelectedUsername(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Name" value="" />
                    {userProfiles.map((data) => (
                        <Picker.Item
                            key={data.userProfileId}
                            label={`${data.firstName} ${data.middleName} ${data.lastName}`}
                            value={data.userProfileId}
                        />
                    ))}
                </Picker>

                <Text style={styles.label}>Device ID:</Text>

                <Picker
                    selectedValue={selectedDeviceId}
                    onValueChange={(itemValue) => setSelectedDeviceId(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Device" value="" />
                    {devices.map((device, index) => (
                        <Picker.Item
                            key={index}
                            label={`${device}`}
                            value={device}
                        />
                    ))}
                </Picker>

                <Text style={styles.label}>Status:</Text>
                <Text style={styles.statusText}>{isActivated ? 'Active' : 'Inactive'}</Text>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
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
        ...(Platform.OS === 'ios' && {
            height: 200, // Optional: to fix iOS specific height issues
        }),
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

export default UserDeviceRegistration;
