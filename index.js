/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import apiClient from './src/Api/api';



AppRegistry.registerComponent(appName, () => App, apiClient);