/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import backgroundNotificationHandler from './src/NotificationService/backgroundNotificationHandler';
import backgroundTask from './src/backgroundTaskApp/backgroundTask';


AppRegistry.registerComponent(appName, () => App);

// Register the headless task
AppRegistry.registerHeadlessTask('NotificationService', () => backgroundNotificationHandler);
AppRegistry.registerHeadlessTask('BackgroundTask', () => backgroundTask);