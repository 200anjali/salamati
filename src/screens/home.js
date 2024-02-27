import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView } from 'react-native';
import Voice from '@react-native-voice/voice';
import { Card, CardTitle, CardContent, CardAction, CardButton, CardImage } from 'react-native-cards';
import SOSContactDetailsScreen from './SOSContactDetailsScreen';

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
    <CardContent text="show map" />
    <CardAction 
      separator={true} 
      inColumn={false}>
      <CardButton
        onPress={()=>{}}
        title="safe path"
        color="#FEB557"
      />
    </CardAction>
  </Card>


  <Card>
    <CardTitle
      subtitle="Detect web cam"
    />
    <CardContent text="This will detect the spy cams" />
    <CardAction 
      separator={true} 
      inColumn={false}>
      <CardButton
        onPress={()=>{}}
        title="start detecting"
        color="#FEB557"
      />
    </CardAction>
  </Card>
 
</ScrollView>







    // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //   <Text>Welcome to Home Screen!</Text>
    //   <Button title='add contact details' onPress={callSOS}></Button>
    //   <Button title={isListening ? 'Stop Listening' : 'Start Listening'} onPress={isListening ? stopListening : startListening} />
    //   {recognizedText ? <Text>Recognized: {recognizedText}</Text> : null}
    // </View>
  );
};

export default HomeScreen;
