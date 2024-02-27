/**
 * @format
 */

import { Alert, AppRegistry, PermissionsAndroid } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initializeApp } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import React, { useEffect } from 'react'; // Import useEffect from 'react'
import PushNotification from 'react-native-push-notification';

const BackgroundMessageHandler = async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
};

messaging().setBackgroundMessageHandler(BackgroundMessageHandler);

const requestUserPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notification Permission',
        message:
          'Salamati App needs access to your notifications ' +
          'so you can receive emergency alerts.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can now receive notifications');
    } else {
      console.log('Notification permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};


const AppWrapper = () => {
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
        Alert.alert(remoteMessage.notification.body);
        PushNotification.localNotification({
          channelId: 'default-channel-id', // Specify the channel ID here
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
        });
    });

    return unsubscribe;
  }, []);

  return <App />;
};


PushNotification.createChannel(
    {
      channelId: 'default-channel-id', // Specify the same channel ID as in FCMMessageHandler
      channelName: 'Default Channel',
      channelDescription: 'A default channel for notifications',
      playSound: true,
      soundName: 'default',
      importance: 4, // Sets the default importance level for notifications
      vibrate: true,
    },
    () => console.log('Channel created successfully'), // Callback when the channel is created
  );

initializeApp(); // Initialize Firebase
AppRegistry.registerComponent(appName, () => AppWrapper); // Use AppWrapper as the registered component
