/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Button,
} from 'react-native';

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

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
                    onPress={() => navigation.navigate('Login')}
                    title="Logout"
                    color="#BFA100"
                  />
                ),
                headerTitle:'aairos',
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
                  onPress={() => navigation.navigate('Login')}
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
              options={{ headerTitle: 'device 1' }}
            />

            
            <Stack.Screen
              name="GraphPage" //This is for Admin Graph Page
              component={GraphPage}
              options={{ headerTitle: 'device 1' }}
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