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
// import notifee from '@notifee/react-native';

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


const handleNotification = (remoteMessage) => {
  console.log('Received notification:', remoteMessage);

  if (remoteMessage.notification && remoteMessage.notification.body) {
    Alert.alert(remoteMessage.notification.title || 'Notification', remoteMessage.notification.body);
  }

  const action = remoteMessage.data.action;
  console.log(action);
  // Check the custom action and take appropriate action
  switch (action) {
    case 'OPEN_MAP':
      if (remoteMessage.data.link) {
        if (Linking && Linking.openURL) {
          Linking.openURL(remoteMessage.data.link).catch((err) =>
            console.error('Error opening URL:', err)
          );
        } else {
          console.error('Linking is not supported on this platform');
        }
      }
      break;
    // Add more cases for other custom actions if needed

    default:
      // Default action if no match is found
      break;
  }
};


const AppWrapper = () => {
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(handleNotification);

    // const unsubscribe = messaging().onMessage(async remoteMessage => {
    //     console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    //     Alert.alert(remoteMessage.notification.body);
    //     PushNotification.localNotification({
    //       title: remoteMessage.notification.title,
    //       message: remoteMessage.notification.body,
    //     });
    // });

    return unsubscribe;
  }, []);

  return <App />;
};



initializeApp(); // Initialize Firebase
AppRegistry.registerComponent(appName, () => AppWrapper); // Use AppWrapper as the registered component
