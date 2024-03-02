import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView } from 'react-native';
import Voice from '@react-native-voice/voice';
import { Card, CardTitle, CardContent, CardAction, CardButton, CardImage } from 'react-native-cards';
import SOSContactDetailsScreen from './SOSContactDetailsScreen';
import MapScreen from './mapScreen';
import videoPlayer from './videoPlayer';

const dict = ["help", "emergency", "urgent", "help me"];


const HomeScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [restartInterval, setRestartInterval] = useState(null);


  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  const onSpeechResults = (event) => {
    console.log('converting');
    const speechText = event.value[0];
    setRecognizedText(speechText);
    const containsWordFromDict = dict.some(word => speechText.toLowerCase().includes(word.toLowerCase()));
    if (containsWordFromDict) {
      console.log("found emergency");
      
      //comment the fetch route if you are not running the server

      fetch(`https://a077-36-255-87-7.ngrok-free.app/send_notification/${userId}`,
      {method:'GET' }) // Replace with your API endpoint
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
  
    <ScrollView>
 
  <Card>
    <CardImage 
      source={{uri: 'http://bit.ly/2GfzooV'}} 
      title="Welcome to Salamati"
    />
    <CardTitle
      subtitle="Enable listening to voice"
    />
    <CardContent text="You can switch on this to actively listen and trigger SOS" />
    <CardAction 
      separator={true} 
      inColumn={false}>
      <CardButton
        onPress={isListening ? stopListening : startListening}
        title={isListening ? 'Stop Listening' : 'Start Listening'}
        color="#FEB557"
      />
    </CardAction>
  </Card>




  <Card>
    <CardTitle
      subtitle="Add contact details"
    />
    <CardContent text="Add all the phone numbers ypou want to send notification to" />
    <CardAction 
      separator={true} 
      inColumn={false}>
      <CardButton
        onPress={callSOS}
        title="Click to add contacts"
        color="#FEB557"
      />
    </CardAction>
  </Card>




  <Card>
    <CardTitle
      subtitle="show safe path"
    />
    <CardContent text="Show nearest safe place" />
    <CardAction 
      separator={true} 
      inColumn={false}>
      <CardButton
        onPress={callMapScreen}
        title="safe path"
        color="#FEB557"
      />
    </CardAction>
  </Card>


  <Card>
    <CardTitle
      subtitle="Defense Tutorials"
    />
    <CardContent text="Learn how to protect yourself" />
    <CardAction 
      separator={true} 
      inColumn={false}>
      <CardButton
        onPress={callVideoPlayer}
        title="Click to play videos"
        color="#FEB557"
      />
    </CardAction>
  </Card>

  <Card>
    <CardTitle
      subtitle="Spy cam detection"
    />
    <CardContent text="Detect hidden cameras" />
    <CardAction 
      separator={true} 
      inColumn={false}>
      <CardButton
        onPress={()=>{ }}
        title="Start detecting"
        color="#FEB557"
      />
    </CardAction>
  </Card>
 
</ScrollView>
  );
};

export default HomeScreen;