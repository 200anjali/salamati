import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import Voice from '@react-native-voice/voice';
import SOSContactDetailsScreen from './SOSContactDetailsScreen';


const dict = ["help", "emergency", "urgent", "help me"];


const HomeScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (event) => {
    const speechText = event.value[0];
    setRecognizedText(speechText);
    const containsWordFromDict = dict.some(word => speechText.toLowerCase().includes(word.toLowerCase()));
    if (containsWordFromDict) {
      console.log("found emergency");
      Alert.alert('Emergency Alert', 'Voice contains a keyword from the dictionary');
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      setRecognizedText('');
      await Voice.start('en-US');
    } catch (error) {
      console.error(error);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      await Voice.stop();
    } catch (error) {
      console.error(error);
    }
  };

  const callSOS=()=>{
    navigation.navigate('SOSContactDetailsScreen',{userId:userId});
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Home Screen!</Text>
      <Button title='add contact details' onPress={callSOS}></Button>
      <Button title={isListening ? 'Stop Listening' : 'Start Listening'} onPress={isListening ? stopListening : startListening} />
      {recognizedText ? <Text>Recognized: {recognizedText}</Text> : null}
    </View>
  );
};

export default HomeScreen;
