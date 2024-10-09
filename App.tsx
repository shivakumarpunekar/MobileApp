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
import BackgroundFetch from "react-native-background-fetch";
import DeviceTable from './src/DeviceTable';

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [initialRoute, setInitialRoute] = useState('Login');
  const [appState, setAppState] = useState(AppState.currentState);
  const [loginId, setLoginId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

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
        minimumFetchInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        requiresCharging: false,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      },
      async (taskId) => {
        console.log('[BackgroundFetch] taskId:', taskId);
        await DeviceTable({ loginId });
      },
      (error) => {
        console.error("[BackgroundFetch] Failed to start:", error);
      }
    );
  };

  useEffect(() => {
    requestPermissions();
    configureBackgroundFetch();

    const checkLoginStatus = async () => {
      const loginId = await AsyncStorage.getItem('loginId');
      const isAdmin = await AsyncStorage.getItem('isAdmin');
      console.log('Login ID:', loginId);
      console.log('Admin:', isAdmin);
      if (loginId) {
        setLoginId(loginId);
        setIsAdmin(isAdmin === 'true');
        setInitialRoute(isAdmin === 'true' ? 'AdminHome' : 'Welcome');
      }
    };

    checkLoginStatus();

    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      }
      
      if (nextAppState === 'background') {
        console.log('App is in the background, checking device status...');
        DeviceTable({loginId});
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

  const handleLogout = async (navigation) => {
    try {
      await AsyncStorage.multiRemove(['loginId', 'isAdmin']);
      console.log("Logout successful, navigating to LoginPage");
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginPage' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
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
            name="LoginPage"
            component={LoginPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Welcome"
            component={WelcomePage}
            initialParams={{ loginId: loginId }}
            options={({ navigation }) => ({
              headerLeft: () => null,
              headerRight: () => (
                <Button
                  onPress={() => handleLogout(navigation)}
                  title="Logout"
                  color="#BFA100"
                />
              ),
              headerTitle: 'aairos Technologies',
              headerLeftContainerStyle: { marginLeft: 15 },
              headerRightContainerStyle: { marginRight: 20 },
              headerBackTitleVisible: false,
              headerBackAccessibilityLabel: 'Back',
              gestureEnabled: false,
            })}
          />
          <Stack.Screen
            name="AdminHome"
            component={AdminHome}
            initialParams={{ loginId: loginId, isAdmin: isAdmin }}
            options={({ navigation }) => ({
              headerLeft: () => null,
              headerRight: () => (
                <Button
                  onPress={() => handleLogout(navigation)}
                  title="Logout"
                  color="#BFA100"
                />
              ),
              headerTitle: 'Admin',
              headerLeftContainerStyle: { marginLeft: 15 },
              headerRightContainerStyle: { marginRight: 20 },
              headerBackTitleVisible: false,
              headerBackAccessibilityLabel: 'Back',
              gestureEnabled: false,
            })}
          />
          <Stack.Screen
            name="RegistrationPage"
            component={RegistrationPage}
            options={{ headerTitle: 'Registration' }}
          />
          <Stack.Screen
            name="ProfileScreenEdit"
            component={ProfileScreenEdit}
            options={{ headerTitle: 'ProfileScreenEdit' }}
          />
          <Stack.Screen
            name="Chart"
            component={ChartScreen}
            options={{ headerTitle: 'Chart' }}
          />
          <Stack.Screen
            name="SensorData"
            component={SensorData}
            options={{ headerTitle: 'device' }}
          />
          <Stack.Screen
            name="GraphPage"
            component={GraphPage}
            options={{ headerTitle: 'Graph' }}
          />
          <Stack.Screen
            name="Valva_status"
            component={Valva_status}
            options={{ headerTitle: 'Valva status' }}
          />
          <Stack.Screen
            name="Switch"
            component={Switch}
            options={{ headerTitle: 'Switch' }}
          />
          <Stack.Screen
            name="Valva_status_detail"
            component={Valva_status_detail}
            options={{ headerTitle: 'Valva_status_detail' }}
          />
          <Stack.Screen
            name="UserDeviceRegistration"
            component={UserDeviceRegistation}
            options={{ headerTitle: 'Device Registration' }}
          />
          <Stack.Screen
            name="Tresholdreg"
            component={Tresholdreg}
            options={{ headerTitle: 'Tresholdreg' }}
          />
          <Stack.Screen
            name="ThresholdEdit"
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
