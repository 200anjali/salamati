/**
 * @format
 */

import { Alert, AppRegistry, PermissionsAndroid,Linking } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initializeApp } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import React, { useEffect } from 'react'; // Import useEffect from 'react'
import PushNotification from 'react-native-push-notification';
import { PropsProvider }  from './context';

// import notifee from '@notifee/react-native';







const AppWrapper = () => {
 

  return     <PropsProvider >
  <App />
  </PropsProvider>;
};



initializeApp(); // Initialize Firebase
AppRegistry.registerComponent(appName, () => AppWrapper); // Use AppWrapper as the registered component
