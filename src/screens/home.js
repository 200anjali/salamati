import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image} from 'react-native';
import Voice from '@react-native-voice/voice';
import { Card, CardAction, CardButton, CardImage } from 'react-native-cards';
import SOSContactDetailsScreen from './SOSContactDetailsScreen';
import MapScreen from './mapScreen';
import videoPlayer from './videoPlayer';
import Geolocation from '@react-native-community/geolocation';
import Permissions from 'react-native-permissions';


const dict = ["help", "emergency", "urgent", "help me", "Get away", "Stay back", "Somebody help", "harassed"];


const HomeScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [restartInterval, setRestartInterval] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);



  useEffect(() => {
    requestLocationPermission();
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const permissionResult = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (permissionResult === RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        const newPermissionResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (newPermissionResult === RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          Alert.alert('Location permission denied');
        }
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
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
    fetch(`https://5500-36-255-87-1.ngrok-free.app/send_notification/${userId}`,
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
    navigation.navigate('MapScreen');
  }
  const callVideoPlayer=()=>{
    navigation.navigate('VideoPlayer');
  }

  return (
    <View contentContainerStyle={styles.scrollView}>
      <View style={styles.row}> 
        <Card style={styles.cardLeft}>
          <Image source={require('/Users/anjaliraj/salamati-womens-s-safety-app/src/icons/podcast.png')} style={styles.icon} />
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
          <Image source={require('/Users/anjaliraj/salamati-womens-s-safety-app/src/icons/sos.png')} style={styles.icon} />
            <CardAction 
              separator={true} 
              inColumn={false}>
              <CardButton
                onPress={sendNotification}
                title="send emergency sos"
                color="#F33A6A"
              />
            </CardAction>
        </Card> 
      </View>


    <View style={styles.row}> 
      <Card style={styles.cardLeft}>
        <Image source={require('/Users/anjaliraj/salamati-womens-s-safety-app/src/icons/locations.png')} style={styles.icon} />
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
        <Image source={require('/Users/anjaliraj/salamati-womens-s-safety-app/src/icons/play-video.png')} style={styles.icon} />
          <CardAction 
            separator={true} 
            inColumn={false}>
            <CardButton
              onPress={callVideoPlayer}
              title="Click to play videos"
              color="#F33A6A"
            />
          </CardAction>
      </Card>
    </View>

    <View style={styles.row}> 
      <Card style={styles.cardLeft}>
        <Image source={require('/Users/anjaliraj/salamati-womens-s-safety-app/src/icons/cam.png')} style={styles.icon} />
          <CardAction 
            separator={true} 
            inColumn={false}>
            <CardButton
              onPress={()=>{ navigation.navigate('SpyCamScreen')}}
              title="Start detecting"
              color="#F33A6A"
            />
          </CardAction>
        </Card>

        <Card style={styles.cardRight}>
        <Image source={require('/Users/anjaliraj/salamati-womens-s-safety-app/src/icons/info.png')} style={styles.icon} />
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
</View>
  );
};



const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
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
     // Adjust the flex value for the left card
  },
  cardRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Adjust the flex value for the right card
  },
  icon: {
    width: 50, // Adjust the width according to your design
    height: 50,
  },
});
export default HomeScreen;