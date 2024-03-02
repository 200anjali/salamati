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

const Stack = createStackNavigator();




const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In' }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="SOSContactDetailsScreen" component={SOSContactDetailsScreen} options={{title:'SOS'}}/>
        <Stack.Screen name="MapScreen" component={MapScreen} options={{title:'Map Screen'}} />
        <Stack.Screen name="SafeScreen" component={SafePath} options={{title:'Safe Screen'}} />
        <Stack.Screen name="VideoPlayer" component={videoPlayer} options={{title:'Defense Tutorial'}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
