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
  Alert,
  Linking,
  Platform,
  AppState
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
import { PermissionsAndroid } from 'react-native';
import { configureNotifications,  sendNotification } from './src/NotificationService/NotificationService';
import BackgroundFetch from "react-native-background-fetch";
import axios from 'axios';
import moment from 'moment';

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [initialRoute, setInitialRoute] = useState('Login');
  const [appState, setAppState] = useState(AppState.currentState);
  const [previousStatus, setPreviousStatus] = useState({});

  // Request Permissions
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

        if (cameraGranted !== PermissionsAndroid.RESULTS.GRANTED || 
            locationGranted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED ||
            locationGranted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permission Denied",
            "This app needs permissions to function properly. Please enable them in the app settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          console.log('All permissions granted');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const configureBackgroundFetch = () => {
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Fetch every 15 minutes
        stopOnTerminate: false, // Continue background fetch even after app termination
        startOnBoot: true, // Start background fetch when device boots
        enableHeadless: true, // For Android headless tasks
        requiresCharging: false, // Run task even when device is not charging
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Run task regardless of network connectivity
      },
      async (taskId) => {
        console.log('[BackgroundFetch] taskId:', taskId);

        // Call your background function
        await checkDeviceStatusInBackground();

        // Remove or delay the finish call if you want continuous fetching
        // BackgroundFetch.finish(taskId); // Only call when you want to stop

        // Optionally, you can reschedule the fetch task here if needed
      },
      (error) => {
        console.error("[BackgroundFetch] Failed to start:", error);
      }
    );
  };

  const checkDeviceStatusInBackground = async () => {
    try {
      const loginId = await AsyncStorage.getItem('loginId'); // Retrieve loginId
      if (!loginId) {
        console.error('Login ID not found.');
        return;
      }
  
      const deviceId = loginId; // Assuming loginId is the same as deviceId
      const sensorDataResponse = await axios.get(`http://103.145.50.185:2030/api/sensor_data/device/${deviceId}`);
      const sensorData = sensorDataResponse.data;
  
      const solenoidValveStatus = sensorData.solenoidValveStatus;
      const createdDateTime = sensorData.createdDateTime;
  
      const currentDate = moment().format('DD-MM-YYYY');
      const formattedCreatedDateTime = moment(createdDateTime, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY');
  
      // Determine icon colors
      const heartIconColor = formattedCreatedDateTime === currentDate ? '#00FF00' : '#FF0000';
      const valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' :
                             solenoidValveStatus === 'Off' ? '#FF0000' : '#808080';
  
      const previous = previousStatus[deviceId] || {};
  
      // Compare current status with previous and send notifications if changed
      if (heartIconColor !== previous.heartIconColor) {
        sendNotification(deviceId, heartIconColor, 'heart');
      }
      if (valveIconColor !== previous.valveIconColor) {
        sendNotification(deviceId, valveIconColor, 'valve');
      }
  
      // Update the previous status for this device
      setPreviousStatus(prevStatus => ({
        ...prevStatus,
        [deviceId]: { heartIconColor, valveIconColor }
      }));
    } catch (error) {
      console.error('Error checking device status in background:', error);
    }
  };

  const scheduleBackgroundFetch = async () => {
    try {
      await BackgroundFetch.scheduleTask({
        taskId: 'com.aairos.continuousFetch',
        delay: 60000, // Delay in milliseconds (e.g., 1 minute)
        periodic: true, // Repeat task
        stopOnTerminate: false, // Continue fetching even if app is killed
        startOnBoot: true, // Start fetching on device boot
        enableHeadless: true, // Use headless tasks for Android
      });
      console.log('Scheduled background fetch');
    } catch (error) {
      console.error('Failed to schedule background fetch:', error);
    }
  };
  
  // Register your Headless Task
  BackgroundFetch.registerHeadlessTask(async (event) => {
    const taskId = event.taskId;
    console.log('[BackgroundFetch HeadlessTask] Start: ', taskId);
    // Run your background fetch logic
    await checkDeviceStatusInBackground();
    await scheduleBackgroundFetch();
    // Only finish if you want to stop the task
    // BackgroundFetch.finish(taskId);
  });
  
  useEffect(() => {
    // Request permissions on app startup
    requestPermissions();
    configureNotifications();
    configureBackgroundFetch();

    const checkLoginStatus = async () => {
      const loginId = await AsyncStorage.getItem('loginId');
      const isAdmin = await AsyncStorage.getItem('isAdmin');

      if (loginId) {
        setInitialRoute(isAdmin === 'true' ? 'AdminHome' : 'Welcome');
      }
    };

    checkLoginStatus();
    
     // AppState listener
     const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      }
      
      if (nextAppState === 'background') {
        console.log('App is in the background, checking device status...');
        checkDeviceStatusInBackground();
      }
  
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appState]);

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


