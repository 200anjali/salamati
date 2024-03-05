import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image,Alert, ScrollView ,Linking} from 'react-native';
import Voice from '@react-native-voice/voice';
import { Card, CardTitle, CardAction, CardButton, CardImage, CardContent } from 'react-native-cards';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import SOSContactDetailsScreen from './SOSContactDetailsScreen';
import MapScreen from './mapScreen';
import videoPlayer from './videoPlayer';
import Geolocation from '@react-native-community/geolocation';
import Permissions from 'react-native-permissions';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { useProps } from '../../context';

const dict = ["help", "emergency", "urgent", "help me", "Get away", "Stay back", "Somebody help", "harassed"];


const HomeScreen = ({ route, navigation }) => {
  const { propsData, updatePropsData } = useProps();
  const { userId,userName } = route.params;
  console.log("username",userName);
  // console.log(userName);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [restartInterval, setRestartInterval] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  // const [notificationData, setNotificationData]=useState({
  //   title: "",
  //   body: "",
  // });
  // // console.log(propsData);
  // useEffect(()=>{
  //   setNotificationData(propsData);
  // },[propsData]);

  useEffect(()=>{
    checkAndRequestLocationPermission();
  },[]);
  useEffect(() => {
    
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const checkAndRequestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const permissionStatus = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (permissionStatus !== RESULTS.GRANTED) {
          const permissionResponse = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
          if (permissionResponse === RESULTS.GRANTED) {
            console.log('Location permission granted');
            getCurrentLocation();
          } else {
            console.log('Location permission denied');
          }
        } else {
          console.log('Location permission already granted');
          checkLocationService();
        }
      } else if (Platform.OS === 'ios') {
        const permissionStatus = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
        if (permissionStatus !== RESULTS.GRANTED) {
          const permissionResponse = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
          if (permissionResponse === RESULTS.GRANTED) {
            console.log('Location permission granted');
            getCurrentLocation();
          } else {
            console.log('Location permission denied');
          }
        } else {
          console.log('Location permission already granted');
          checkLocationService();
        }
      }
    } catch (err) {
      console.warn('Error checking or requesting location permission:', err);
    }
  };
  
  const checkLocationService = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        // Location service is enabled
        console.log('Location service is enabled');
        const { latitude, longitude } = position.coords;
        const currentLocation = { latitude, longitude };
        setCurrentLocation(currentLocation);
      },
      (error) => {
        // Location service is disabled
        console.error('Location service is disabled:', error);
        // Prompt the user to turn on location services
        Alert.alert(
          'Location Service Required',
          'Please enable location services to use this app.',
          [{ text: 'OK', onPress: () => Linking.openSettings() }]
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };
  
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        console.log(latitude);
        setCurrentLocation({ latitude, longitude });
      },
      error => {
        console.error('Error getting current location:', error.message);
        Alert.alert('Error', 'Could not get current location.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const onSpeechResults = (event) => {
    console.log('converting');
    const speechText = event.value[0];
    setRecognizedText(speechText);
    const containsWordFromDict = dict.some(word => speechText.toLowerCase().includes(word.toLowerCase()));
    if (containsWordFromDict) {
      console.log("found emergency");
      //comment it you are not running the server
      sendNotification();
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      setRecognizedText('');
      const intervalId = setInterval(async () => {
        await Voice.stop();
        await Voice.start('en-US');
      }, 5000);
      setRestartInterval(intervalId);
    } catch (error) {
      console.error(error);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      if (restartInterval) {
        clearInterval(restartInterval);
        setRestartInterval(null);
      }
      await Voice.stop();
    } catch (error) {
      console.error(error);
    }
  };

  const sendNotification=async()=>{
try{
   const latitude=currentLocation.latitude;
   const longitude=currentLocation.longitude;
   console.log(latitude);
   console.log(longitude);
   const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
   console.log(url);
   fetch(`https://146b-36-255-87-1.ngrok-free.app/send_notification/${userId}/${userName}/${latitude}/${longitude}`,
      {method:'GET'}) // Replace with your API endpoint
     .then(response => {
       if (!response.ok) {
         throw new Error(`HTTP error! Status: ${response.status}`);
       }
       return response.json();
     })
     .then(data => {
       console.log('Data received:', data);
     })
     .catch(error => {
       console.error('Error:', error);
     });
    }catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const callSOS=()=>{
    navigation.navigate('SOSContactDetailsScreen',{userId:userId});
  }
  const callMapScreen=()=>{
    checkAndRequestLocationPermission();
    navigation.navigate('SafeScreen');
  }
  const callVideoPlayer=()=>{
    navigation.navigate('VideoPlayer');
  }

  console.log("home props",propsData);
  return (
    <View style={styles.container}>
    <ScrollView >
      <View style={styles.row}> 
        <Card style={styles.cardLeft}>
          <Image source={require('../icons/podcast.png')} style={styles.icon} />
            <CardAction 
              separator={true} 
              inColumn={false}>
              <CardButton
                onPress={isListening ? stopListening : startListening}
                title={isListening ? 'Stop Listening' : 'Start Listening'}
                color="#F33A6A"
              />
            </CardAction>
        </Card>
      
        <Card style={styles.cardRight}>
          <Image source={require('../icons//sos.png')} style={styles.icon} />
            <CardAction 
              separator={true} 
              inColumn={false}>
              <CardButton
                onPress={sendNotification}
                title="SOS Alert"
                color="#F33A6A"
              />
            </CardAction>
        </Card> 
      </View>


    <View style={styles.row}> 
      <Card style={styles.cardLeft}>
        <Image source={require('../icons/locations.png')} style={styles.icon} />
          <CardAction 
            separator={true} 
            inColumn={false}>
            <CardButton
              onPress={callMapScreen}
              title="Show safe path"
              color="#F33A6A"
            />
          </CardAction>
        </Card>
      
      <Card style={styles.cardRight}>
        <Image source={require('../icons/play-video.png')} style={styles.icon} />
          <CardAction 
            separator={true} 
            inColumn={false}>
            <CardButton
              onPress={callVideoPlayer}
              title="Defense & SpyCam Tips"
              color="#F33A6A"
            />
          </CardAction>
      </Card>
    </View>

    <View style={styles.row}> 
      <Card style={styles.cardLeft}>
        <Image source={require('../icons/cam.png')} style={styles.icon} />
          <CardAction 
            separator={true} 
            inColumn={false}>
            <CardButton
              onPress={()=>{ navigation.navigate('SpyCamScreen')}}
              title="Detect Spy Cam"
              color="#F33A6A"
            />
          </CardAction>
        </Card>

        <Card style={styles.cardRight}>
        <Image source={require('../icons/info.png')} style={styles.icon} />
          <CardAction 
            separator={true} 
            inColumn={false}>
            <CardButton
              onPress={callSOS}
              title="User Info"
              color="#F33A6A"
            />
          </CardAction>
        </Card>
    </View>

    {propsData && <Card>
    <CardTitle
      title={propsData && propsData.title} // Add a title prop
    />
    <CardContent text={propsData && propsData.body} />
  </Card>}
  
</ScrollView>
</View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FADADD', 
    paddingHorizontal: 10, 
    paddingVertical: 10, 
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    borderRadius: 10,
  },
  cardRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    borderRadius: 10,
  },
  icon: {
    width: 50,
    height: 50,
  },
});


export default HomeScreen;