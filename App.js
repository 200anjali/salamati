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

const Stack = createStackNavigator();




const App = () => {

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
