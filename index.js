/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotification from 'react-native-push-notification';

// Configure PushNotification once
PushNotification.configure({
  // Called when a remote or local notification is opened or received
  onNotification: function (notification) {
    console.log('LOCAL NOTIFICATION ==>', notification);
    // You can add more logic here to handle notification tap actions, etc.
  },
  // Request permissions on iOS, no effect on Android
  requestPermissions: Platform.OS === 'ios',
});


AppRegistry.registerComponent(appName, () => App);
