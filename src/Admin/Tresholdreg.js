import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Tresholdreg = () => {
    const [userProfiles, setUserProfiles] = useState([]);
    const [selectedUserProfileId, setSelectedUserProfileId] = useState('');
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [threshold1, setThreshold1] = useState('');
    const [threshold2, setThreshold2] = useState('');
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

        fetchUserProfiles();
    }, []);

    useEffect(() => {
        if (selectedUserProfileId) {
            const fetchDevices = async () => {
                try {
                    const response = await axios.get(`http://103.145.50.185:2030/api/UserDevice/byProfile/${selectedUserProfileId}`);
                    setDevices(response.data);
                } catch (error) {
                    console.error('Error fetching devices:', error);
                }
            };

            fetchDevices();
        }
    }, [selectedUserProfileId]);

    const handleSubmit = () => {
        if (!selectedUserProfileId || !selectedDeviceId || !threshold1 || !threshold2) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        const payload = {
            userProfileId: selectedUserProfileId,
            deviceId: selectedDeviceId,
            threshold_1: parseInt(threshold1, 10),
            threshold_2: parseInt(threshold2, 10),
        };

        axios.post(`http://192.168.1.10:2030/api/Threshold/CreateSingle?userProfileId=${payload.userProfileId}&deviceId=${payload.deviceId}&threshold_1=${payload.threshold_1}&threshold_2=${payload.threshold_2}`)
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
                <Text style={styles.label}>User Profile:</Text>
                <Picker
                    selectedValue={selectedUserProfileId}
                    onValueChange={(itemValue) => setSelectedUserProfileId(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select User Profile" value="" />
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
                            label={device.deviceId} // Assuming deviceId is the property you want to show
                            value={device.deviceId} // Assuming deviceId is the property you want to use
                        />
                    ))}
                </Picker>

                <Text style={styles.label}>Threshold 1:</Text>
                <TextInput
                    style={styles.input}
                    value={threshold1}
                    onChangeText={setThreshold1}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Threshold 2:</Text>
                <TextInput
                    style={styles.input}
                    value={threshold2}
                    onChangeText={setThreshold2}
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
