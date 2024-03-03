import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const SOSContactDetailsScreen = ({ route, navigation }) => {
  const userId  = route.params;
  const userRef =  firestore().collection('user_details');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const addPhoneNumber = () => {
    if (newPhoneNumber.trim() !== '') {
      setPhoneNumbers([...phoneNumbers, newPhoneNumber]);
      setNewPhoneNumber('');
    }
  };

  const saveSOSContacts = async () => {
    try {

      // Ensure userId is available before proceeding
      if (userId) {
        const sosContactsRef = firestore().collection('sos_contact_details');

        // Check if a document for the user already exists
        const userDocument = await sosContactsRef.doc(userId).get();

        if (userDocument.exists) {
          // If the document exists, update the array of phone numbers
          await sosContactsRef.doc(userId).update({
            phoneNumbers: firestore.FieldValue.arrayUnion(...phoneNumbers.map(phone => phone.trim()))
          });
        } else {
          // If the document doesn't exist, create a new one
          await sosContactsRef.doc(userId).set({
            phoneNumbers: phoneNumbers.map(phone => phone.trim())
          });
        }

        // Navigate to the Home screen or any other screen
        navigation.navigate('Home',{userId:userId});
      } else {
        console.error('UserId is undefined.');
      }
    } catch (error) {
      console.error('Error saving SOS contacts:', error);
      // Handle the error, show an alert, etc.
    }
  };
 console.log(userDetails.name);
  return (
    <View style={styles.container}>
      {/* <Text>Name: {userDetails.name}</Text>
      <Text>Email: {userDetails.email}</Text>
      <Text>Phone: {userDetails.phoneNumber}</Text> */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          value={newPhoneNumber}
          onChangeText={setNewPhoneNumber}
        />
        <Button title="Add Contact" onPress={addPhoneNumber} />
      </View>
      <Button title="Save SOS Contacts" onPress={saveSOSContacts} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderBottomWidth: 1,
  },
  phoneNumberContainer: {
    padding: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
  },
  phoneNumberText: {
    flex: 1,
  },
});

export default SOSContactDetailsScreen;
