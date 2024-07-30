import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';

const UserDeviceRegistration = () => {
    const [userProfiles, setUserProfiles] = useState([]);
    const [selectedUsername, setSelectedUsername] = useState('');
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        // Fetch user profiles when the component mounts
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
        // Fetch devices based on selected username
        const fetchDevices = async () => {
            if (selectedUsername) {
                try {
                    const response = await axios.get(`http://103.145.50.185:2030/api/UserDevice/byProfile/${selectedUsername}`);
                    const devicesData = response.data;

                    // Ensure device IDs are unique and sorted
                    const uniqueDevices = Array.from(new Set(devicesData.map(device => device.deviceId)))
                        .map(deviceId => devicesData.find(device => device.deviceId === deviceId))
                        .sort((a, b) => a.deviceId - b.deviceId);

                    setDevices(uniqueDevices);
                } catch (error) {
                    console.error('Error fetching devices:', error);
                }
            } else {
                setDevices([]); // Clear devices if no username is selected
            }
        };

        fetchDevices();
    }, [selectedUsername]);

    const handleDownload = async () => {
        if (!selectedUsername || !selectedDeviceId || !startDate || !endDate) {
            Alert.alert('Error', 'Please complete all fields before downloading.');
            return;
        }
    
        const start = startDate.toISOString();
        const end = endDate.toISOString();
        const url = `http://192.168.1.10:2030/api/sensor_data/export?profileId=${selectedUsername}&deviceId=${selectedDeviceId}&startDate=${start}&endDate=${end}`;
    
        try {
            const response = await axios.get(url, { responseType: 'blob' });
            const blob = response.data;
            const reader = new FileReader();
    
            reader.onloadend = async () => {
                const base64data = reader.result.split(',')[1]; 
                const downloadsDirectory = RNFS.DownloadDirectoryPath;
                const filePath = `${downloadsDirectory}/SensorData_${new Date().toISOString().split('T')[0]}.xlsx`;
    
                try {
                    await RNFS.writeFile(filePath, base64data, 'base64');
                    Alert.alert('Success', `Excel file downloaded successfully: ${filePath}`);
                } catch (error) {
                    console.error('Error saving the file:', error);
                    Alert.alert('Error', 'There was an error saving the Excel file.');
                }
            };
    
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Error downloading the Excel file:', error);
            Alert.alert('Error', 'There was an error downloading the Excel file.');
        }
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
                    enabled={!!selectedUsername} // Disable if no username is selected
                >
                    <Picker.Item label="Select Device" value="" />
                    {devices.map((device, index) => (
                        <Picker.Item
                            key={index}
                            label={device.deviceId.toString()} // Ensure deviceId is displayed as string
                            value={device.deviceId.toString()} // Ensure deviceId is used as string
                        />
                    ))}
                </Picker>

                <Text style={styles.label}>Start Date:</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
                    <Icon name="calendar" size={20} color="#fff" style={styles.dateButtonIcon} />
                    <Text style={styles.dateButtonText}>Select Start Date</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowStartDatePicker(false);
                            if (date) setStartDate(date);
                        }}
                    />
                )}
                <Text style={styles.dateText}>{`Selected Start Date: ${startDate.toDateString()}`}</Text>

                <Text style={styles.label}>End Date:</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                    <Icon name="calendar" size={20} color="#fff" style={styles.dateButtonIcon} />
                    <Text style={styles.dateButtonText}>Select End Date</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowEndDatePicker(false);
                            if (date) setEndDate(date);
                        }}
                    />
                )}
                <Text style={styles.dateText}>{`Selected End Date: ${endDate.toDateString()}`}</Text>

                <TouchableOpacity style={styles.button} onPress={handleDownload}>
                    <Text style={styles.buttonText}>Download Excel</Text>
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
    dateButton: {
        backgroundColor: '#BFA100', // Change this color to your preference
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginVertical: 8,
    },
    dateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
        marginVertical: 8,
    },
    button: {
        backgroundColor: '#BFA100',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginVertical: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default UserDeviceRegistration;
