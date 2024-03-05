/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import "react-native-gesture-handler";
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from "./src/screens/home";
import SignInScreen from "./src/screens/signIn";
import SignUpScreen from "./src/screens/signUp";
import MapScreen from "./src/screens/mapScreen";
import SOSContactDetailsScreen from "./src/screens/SOSContactDetailsScreen";
import videoPlayer from "./src/screens/videoPlayer";
import SafePath from "./src/screens/safePath";
import SpyCamDetection from "./src/screens/spyCamDetection";
import { useEffect, useState } from "react";
import { PropsProvider }  from './context';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { PermissionsAndroid,Linking } from 'react-native';
import { useProps } from "./context";


const Stack = createStackNavigator();




const App = () => {
  // const [appPropsData, setAppPropsData] = useState({
  //   title: "",
  //   body: "",
  // });

  // const updateAppPropsData = (newProps) => {
  //   setAppPropsData(newProps);
  // };
    const { propsData, updatePropsData } = useProps();
    const BackgroundMessageHandler = async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    updatePropsData(remoteMessage.notification);
    console.log("props after updating on app.js",propsData);
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
      // Alert.alert(remoteMessage.notification.title || 'Notification', remoteMessage.notification.body);
      updatePropsData(remoteMessage.notification);
      console.log("props after updating on app.js",propsData);
    }
  
  };
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(handleNotification);

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In', headerTitleStyle: {color:"#F33A6A"},}} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up', headerTitleStyle: {color:"#F33A6A"}, }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' , headerTitleStyle: {color:"#F33A6A"},}} />
        <Stack.Screen name="SOSContactDetailsScreen" component={SOSContactDetailsScreen} options={{title:'SOS', headerTitleStyle: {color:"#F33A6A"},}}/>
        <Stack.Screen name="MapScreen" component={MapScreen} options={{title:'Map Screen', headerTitleStyle: {color:"#F33A6A"},}} />
        <Stack.Screen name="SafeScreen" component={SafePath} options={{title:'Safe Screen', headerTitleStyle: {color:"#F33A6A"},}} />
        <Stack.Screen name="SpyCamScreen" component={SpyCamDetection} options={{title:'Spy Camera Screen', headerTitleStyle: {color:"#F33A6A"},}} />
        <Stack.Screen name="VideoPlayer" component={videoPlayer} options={{title:'Defense Tutorial', headerTitleStyle: {color:"#F33A6A"},}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
