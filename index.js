/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { configureNotifications } from './src/NotificationService/NotificationService';
import backgroundNotificationHandler from './src/backgroundTaskApp/backgroundNotificationHandler' 


AppRegistry.registerComponent(appName, () => App);

// Register headless task for background notifications
AppRegistry.registerHeadlessTask('RNPushNotificationListenerService', () =>
    require('./src/NotificationService/backgroundNotificationHandler')
  );

  // Register the headless task
AppRegistry.registerHeadlessTask('BackgroundTask', () => backgroundNotificationHandler);

// Configure notifications
configureNotifications();