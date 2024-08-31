/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './src/LoginPage';
import WelcomePage from './src/WelcomePage';
import RegistrationPage from './src/RegistationPage';
import ProfileScreenEdit from './src/ProfileScreenEdit';
import AdminHome from './src/Admin/AdminHome';
import ChartScreen from './src/Admin/Chart';
import SensorData from './src/Admin/sensor_data';
import GraphPage from './src/Admin/GraphPage ';
import UserDeviceRegistation from './src/Admin/UserDeviceRegistation';
import Valva_status from './src/Admin/Valva_status';
import Switch from './src/Admin/Switch';
import Valva_status_detail from './src/Admin/Valva_status_detail';
import Tresholdreg from './src/Admin/Tresholdreg';
import ThresholdEdit from './src/Admin/ThresholdEdit';
import { PermissionsAndroid, Platform } from 'react-native';

import { configureNotifications } from './src/NotificationService/NotificationService';

const Stack = createStackNavigator();

// This is a Permissions
const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const cameraGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      const locationGranted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const notificationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'This app needs access to send notifications.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (
        cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
        locationGranted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
        locationGranted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
        notificationGranted === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('All permissions granted');
      } else {
        console.log('Some permissions denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }
};


function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    // Request permissions on app startup
    requestPermissions();
    configureNotifications();

    const checkLoginStatus = async () => {
      const loginId = await AsyncStorage.getItem('loginId');
      const isAdmin = await AsyncStorage.getItem('isAdmin');

      if (loginId) {
        setInitialRoute(isAdmin === 'true' ? 'AdminHome' : 'Welcome');
      }
    };

    checkLoginStatus();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // Logout function to clear AsyncStorage and navigate to Login
  const handleLogout = async (navigation) => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('Login');
    } catch (e) {
      console.error('Failed to clear the async storage.', e);
    }
  }; 

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen
              name="Login" //This is For login page
              component={LoginPage}
              options={{ headerShown: false}}
            />
            {/* This is a User Database  */}
            <Stack.Screen
              name="Welcome" // This is For Welcome Page
              component={WelcomePage}
              options={({ navigation }) => ({
                headerLeft: () => null,
                headerRight: () => (
                  <Button
                    onPress={() => handleLogout(navigation)}
                    title="Logout"
                    color="#BFA100"
                  />
                ),
                headerTitle:'aairos Technologies',
                headerLeftContainerStyle: { marginLeft: 15 },
                headerRightContainerStyle: {marginRight: 20},
                headerBackTitleVisible: false,
                headerBackAccessibilityLabel: 'Back',
                gestureEnabled: false,
              })}
            />
            {/* This is a Admin Database  */}
            <Stack.Screen
            name="AdminHome" //This is for AdminHome Page
            component={AdminHome}
            options={({ navigation }) => ({
              headerLeft: () => null,
              headerRight: () => (
                <Button
                  onPress={() => handleLogout(navigation)}
                  title="Logout"
                  color="#BFA100"
                />
              ),
              headerTitle:'Admin',
              headerLeftContainerStyle: { marginLeft: 15 },
              headerRightContainerStyle: {marginRight: 20},
              headerBackTitleVisible: false,
              headerBackAccessibilityLabel: 'Back',
              gestureEnabled: false,
            })}
          />
            <Stack.Screen
              name="RegistrationPage" //This is for Registation Page
              component={RegistrationPage}
              options={{ headerTitle: 'Registration' }}
            />

            <Stack.Screen
              name="ProfileScreenEdit" //This is for ProfileScreenEdit Page
              component={ProfileScreenEdit}
              options={{ headerTitle: 'ProfileScreenEdit' }}
            />

            <Stack.Screen
              name="Chart" //This is for ProfileScreenEdit Page
              component={ChartScreen}
              options={{ headerTitle: 'Chart' }}
            />

            <Stack.Screen
              name="SensorData" //This is for Admin SensorData Page
              component={SensorData}
              options={{ headerTitle: 'device' }}
            />

            
            <Stack.Screen
              name="GraphPage" //This is for Admin Graph Page
              component={GraphPage}
              options={{ headerTitle: 'Graph' }}
            />

            <Stack.Screen
              name="Valva_status" //This is for Admin Valva_status Page
              component={Valva_status}
              options={{ headerTitle: 'Valva_status' }}
            />

            <Stack.Screen
              name="Switch" //This is for Admin Switch Page
              component={Switch}
              options={{ headerTitle: 'Switch' }}
            />


            <Stack.Screen
              name="Valva_status_detail" //This is for Admin Valva_status_detail Page
              component={Valva_status_detail}
              options={{ headerTitle: 'Valva_status_detail' }}
            />

            <Stack.Screen
              name="UserDeviceRegistation" //This is for Admin device registation Page
              component={UserDeviceRegistation}
              options={{ headerTitle: 'Device Registation' }}
            />

            <Stack.Screen
              name="Tresholdreg" //This is for Admin Tresholdreg Page
              component={Tresholdreg}
              options={{ headerTitle: 'Tresholdreg' }}
            />

            <Stack.Screen
              name="ThresholdEdit" //This is for Admin ThresholdEdit Page
              component={ThresholdEdit}
              options={{ headerTitle: 'ThresholdEdit' }}
            />
          </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;