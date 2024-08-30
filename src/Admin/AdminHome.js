import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import AdminHomeScreen from "./AdminHomeScreen";
import AdminProfileScreen from "./AdminProfileScreen";
import PiChartScreen from "./PiChartScreen";
import SensorDataButton from "./sensor_data_Button";
import UserDevice from "./UserDevice";
import DownloadExcel from "./DownloadExcel";
import Threshold from "./Threshold";

const Tab = createBottomTabNavigator();

const AdminHome = ({ route }) => {
     
    const { isAdmin } = route.params; 

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'AdminProfileScreen') {
                        iconName = 'user';
                    } else if (route.name === 'PiChartScreen') {
                        iconName = 'pie-chart';
                    } else if (route.name === 'SensorDataButton') {
                        iconName = 'tachometer';
                    } else if (route.name === 'UserDevice') {
                        iconName = 'mobile';
                    } else if (route.name === 'download') {
                        iconName = 'download';
                    } else if (route.name === 'Threshold') {
                        iconName = 'sliders';
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
            <Tab.Screen name="PiChartScreen" component={PiChartScreen} options={{ headerShown: false }} />
            <Tab.Screen name="SensorDataButton" component={SensorDataButton} options={{ headerShown: false }} initialParams={{ isAdmin: true }} />
            <Tab.Screen name="UserDevice" component={UserDevice} options={{ headerShown: false }} />
            <Tab.Screen name="download" component={DownloadExcel} options={{ headerShown: false }} />
            <Tab.Screen name="Threshold" component={Threshold} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

export default AdminHome;
