import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, StyleSheet, Dimensions, TextInput, TouchableOpacity, Modal, Button } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const UserDevice = ({ navigation }) => {
    const [userProfiles, setUserProfiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDevice, setFilteredProfiles] = useState([]);
    const [cellWidth, setCellWidth] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [newStatus, setNewStatus] = useState(null);

    const windowWidth = Dimensions.get('window').width;

    useEffect(() => {
        fetchUserProfiles();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchUserProfiles();
        }, [])
    );

    useEffect(() => {
        filterProfiles();
    }, [searchQuery, userProfiles]);

    useEffect(() => {
        const numberOfColumns = 4; // Adjust this to match your needs
        const width = (windowWidth - 40) / numberOfColumns; // Subtract padding/margin as needed
        setCellWidth(width);
    }, [windowWidth]);

    const fetchUserProfiles = async () => {
        try {
            const response = await fetch('http://103.145.50.185:2030/api/UserDevice');
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const data = await response.json();
            setUserProfiles(data);
            setFilteredProfiles(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const filterProfiles = () => {
        if (!searchQuery) {
            setFilteredProfiles(userProfiles);
            return;
        }
        const query = searchQuery.toLowerCase();
        const filtered = userProfiles.filter(profile =>
            Object.values(profile).some(value =>
                String(value).toLowerCase().includes(query)
            )
        );
        setFilteredProfiles(filtered);
    };

    const updateDeviceStatus = async (deviceId, newStatus) => {
        try {
            const response = await fetch(`http://103.145.50.185:2030/api/UserDevice/byDevice/${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newStatus),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            await response.json();
        } catch (error) {
            console.error('Error updating device status:', error);
        }
    };

    const toggleDeviceStatus = (index) => {
        const device = filteredDevice[index];
        setSelectedDevice(device);
        setNewStatus(device.deviceStatus);
        setModalVisible(true);
    };

    const handleStatusChange = async () => {
        const updatedProfiles = [...userProfiles];
        const updatedDevice = { ...selectedDevice, deviceStatus: newStatus };

        // Update device status in the backend
        await updateDeviceStatus(updatedDevice.deviceId, newStatus);

        // Update local state
        const deviceIndex = updatedProfiles.findIndex(d => d.deviceId === updatedDevice.deviceId);
        updatedProfiles[deviceIndex] = updatedDevice;
        setUserProfiles(updatedProfiles);
        setFilteredProfiles(updatedProfiles);
        setModalVisible(false);
    };

    const renderUserDevice = ({ item, index }) => (
        <View style={[styles.userDeviceRow, { backgroundColor: index % 2 === 0 ? '#fff' : '#F6F3E7' }]}>
            <Text style={[styles.cell, { width: cellWidth }]}>{item.userProfileId}</Text>
            <Text style={[styles.cell, { width: cellWidth }]}>{item.deviceId}</Text>
            <Text style={[styles.cell, { width: cellWidth }]}>{item.deviceStatus}</Text>
            <Text style={[styles.cell, { width: cellWidth }]}>{formatDate(item.createdDate)}</Text>
            <TouchableOpacity onPress={() => toggleDeviceStatus(index)}>
                <Icon style={styles.editButton} name="edit" size={20} color="#000" />
            </TouchableOpacity>
        </View>
    );

    const keyExtractor = (item, index) => index.toString();

    return (
        <View style={styles.container}>
            <Text style={styles.header}>User Device</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <ScrollView horizontal>
                <View style={{ flex: 1 }}>
                    <View style={[styles.headerRow, { backgroundColor: '#F6F3E7' }]}>
                        {['User Profile ID', 'Device ID', 'Device Status', 'Created Date', 'Edit'].map((title, index) => (
                            <Text
                                key={index}
                                style={[styles.headerCell, { width: cellWidth }]}
                            >
                                {title}
                            </Text>
                        ))}
                    </View>
                    <FlatList
                        data={filteredDevice}
                        renderItem={renderUserDevice}
                        keyExtractor={keyExtractor}
                        style={{ flex: 1 }}
                    />
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => navigation.navigate('UserDeviceRegistration')}
            >
                <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Modal for Device Status Update */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Device Status</Text>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Active"
                                onPress={() => setNewStatus(1)}
                                color={newStatus === 1 ? "green" : "#000"}
                            />
                            <Button
                                title="Inactive"
                                onPress={() => setNewStatus(0)}
                                color={newStatus === 0 ? "red" : "#000"}
                            />
                        </View>
                        <TouchableOpacity style={styles.modalButton} onPress={handleStatusChange}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F6F3E7',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#bbb',
    },
    headerCell: {
        fontWeight: 'bold',
        color: '#000',
        fontSize: 12,
        textAlign: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    userDeviceRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    cell: {
        fontSize: 12,
        textAlign: 'center',
        padding: 10,
    },
    editButton: {
        justifyContent: 'end',
        alignItems: 'end',
        padding: 10,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#BFA100',
        borderRadius: 50,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#BFA100',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        width: '80%',
        marginVertical: 5,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default UserDevice;
