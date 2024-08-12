import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Tresholdreg = () => {
    const [userProfiles, setUserProfiles] = useState([]);
    const [selectedUsername, setSelectedUsername] = useState('');
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [sensor1Value, setSensor1Value] = useState('');
    const [sensor2Value, setSensor2Value] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserProfiles = async () => {
            try {
                const response = await fetch('http://103.145.50.185:2030/api/userprofiles/GetuserprofileByName');
                const data = await response.json();
                setUserProfiles(data);
            } catch (error) {
                console.error('Error fetching user profiles:', error);
            }
        };

        const fetchDevices = async () => {
            try {
                const response = await axios.get('http://103.145.50.185:2030/api/sensor_data/deviceId');
                setDevices(response.data);
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };

        fetchUserProfiles();
        fetchDevices();
    }, []);

    const handleSubmit = () => {
        if (!selectedUsername || !selectedDeviceId || !sensor1Value || !sensor2Value) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        const payload = {
            profileId: selectedUsername,
            deviceId: selectedDeviceId,
            sensor1_value: parseInt(sensor1Value, 10),
            sensor2_value: parseInt(sensor2Value, 10),
        };

        axios.post(`http://192.168.1.10:2030/api/Threshold/CreateSingle?profileId=${payload.profileId}&deviceId=${payload.deviceId}&sensor1_value=${payload.sensor1_value}&sensor2_value=${payload.sensor2_value}`)
            .then(response => {
                Alert.alert('Success', 'Threshold created successfully.');
                navigation.navigate('Threshold', { refresh: true });
            })
            .catch(error => {
                if (error.response && error.response.data) {
                    Alert.alert('Error', error.response.data);
                } else {
                    Alert.alert('Error', 'There was an error creating the threshold.');
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

                <Text style={styles.label}>Sensor 1 Value:</Text>
                <TextInput
                    style={styles.input}
                    value={sensor1Value}
                    onChangeText={setSensor1Value}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Sensor 2 Value:</Text>
                <TextInput
                    style={styles.input}
                    value={sensor2Value}
                    onChangeText={setSensor2Value}
                    keyboardType="numeric"
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
    },
    input: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 8,
        paddingHorizontal: 10,
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

export default Tresholdreg;
