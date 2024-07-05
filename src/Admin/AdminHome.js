import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import AdminHomeScreen from "./AdminHomeScreen";
import AdminProfileScreen from "./AdminProfileScreen";
import ChartScreen from "./Chart";

const Tab = createBottomTabNavigator();

const AdminHome = () => {
    return (
        <Tab.Navigator 
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home';
                    } else if (route.name === 'AdminProfileScreen') {
                        iconName = focused ? 'user' : 'user';
                    } 
                    // Return the icon component
                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}
            tabBarOptions={{
                activeTintColor: '#BFA100',
                inactiveTintColor: 'gray',
            }}
        >
            <Tab.Screen name="Home" component={AdminHomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="AdminProfileScreen" component={AdminProfileScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

export default AdminHome;
