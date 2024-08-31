/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';


AppRegistry.registerComponent(appName, () => App);

// Register headless task for background notifications
AppRegistry.registerHeadlessTask('RNPushNotificationListenerService', () =>
    require('./src/NotificationService/backgroundNotificationHandler')
  );