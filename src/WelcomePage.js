import React from 'react';
import { View, Text, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import AdminDetail from './AdminDetail';
import SingleUser from './SingleUser';
import ProfilePage from './ProfileScreen';
import DeviceTable from './DeviceTable';


const Tab = createBottomTabNavigator();

function HomeScreen({ route }) {
    const { loginId } = route.params;
    return (
        <DeviceTable loginId={loginId} />
    );
}

function AdminScreen() {
    return (
        <AdminDetail />
    );
}
function SingleUserScreen() {
    return (
        <SingleUser />
    );
}

function ProfileScreen({ route }) {
    const { loginId } = route.params;
    return (
        // <ProfilePage/>
        <ProfilePage loginId={loginId} />
    );
}
function AboutScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image
                source={require('../assets/aairos.png')}
                style={{ height: 400, width: 400 }}
            />
            <Text style={{ fontSize: 20 }}>
                About the aairos !
            </Text>
        </View>
    );
}

export default function WelcomePage({ route }) {
    const { loginId } = route.params;
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home';
                    } else if (route.name === 'Admin') {
                        iconName = focused ? 'info-circle' : 'info-circle';
                    } else if (route.name === 'User') {
                        iconName = focused ? 'database' : 'database';
                    } else if (route.name === 'ProfileScreen') {
                        iconName = focused ? 'user' : 'user';
                    } else if (route.name === 'About') {
                        iconName = focused ? 'user' : 'user';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}
            tabBarOptions={{
                activeTintColor: '#BFA100',
                inactiveTintColor: 'gray',
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} initialParams={{ loginId }} options={{ headerShown: false }} />
            <Tab.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
            <Tab.Screen name="User" component={SingleUserScreen} options={{ headerShown: false }} />
            <Tab.Screen name="ProfileScreen" component={ProfileScreen} initialParams={{ loginId }} options={{ headerShown: false }} />
            <Tab.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}
