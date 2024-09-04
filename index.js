/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { configureNotifications } from './src/NotificationService/NotificationService';
import backgroundNotificationHandler from './src/NotificationService/backgroundNotificationHandler';
import backgroundTask from './src/backgroundTaskApp/backgroundTask';


AppRegistry.registerComponent(appName, () => App);

// Register the headless task
AppRegistry.registerHeadlessTask('NotificationService', () => backgroundNotificationHandler);

// Register the headless task (make sure this name matches your headless task registration)
AppRegistry.registerHeadlessTask('BackgroundTask', () => backgroundTask);


// Configure notifications
configureNotifications();