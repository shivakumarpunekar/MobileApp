import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, StyleSheet, Dimensions, TextInput, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const UserDevice = ({ navigation }) => {
    const [userProfiles, setUserProfiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDevice, setFilteredProfiles] = useState([]);

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

    const fetchUserProfiles = async () => {
        try {
            const response = await fetch('http://192.168.1.10:2030/api/UserDevice');
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

    const renderUserdevice = ({ item, index }) => (
        <View style={[styles.userDeviceRow, { backgroundColor: index % 2 === 0 ? '#fff' : '#F6F3E7' }]}>
            <Text style={[styles.cell]}>{item.profileId}</Text>
            <Text style={[styles.cell]}>{item.deviceId}</Text>
            <Text style={[styles.cell]}>{item.deviceStatus}</Text>
            <Text style={[styles.cell]}>{item.createdDate}</Text>
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
                        <Text style={[styles.headerCell, { width: 100 }]}>profileId</Text>
                        <Text style={[styles.headerCell, { width: 100 }]}>DeviceId</Text>
                        <Text style={[styles.headerCell, { width: 100 }]}>deviceStatus</Text>
                        <Text style={[styles.headerCell, { width: 100 }]}>createdDate</Text>
                    </View>
                    <FlatList
                        data={filteredDevice}
                        renderItem={renderUserdevice}
                        keyExtractor={keyExtractor}
                        style={{ flex: 1 }}
                    />
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => navigation.navigate('UserDeviceRegistation')}
            >
                <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F6F3E7'
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    searchBar: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    headerRow: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        color: '#000',
        fontSize: 15,
        textAlign: 'center',
        paddingVertical: 10,
    },
    userDeviceRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    cell: {
        flex: 1,
        padding: 10,
        fontSize: 15,
        textAlign: 'center',
        paddingVertical: 10,
        width: 100,
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
    },
});

export default UserDevice;
