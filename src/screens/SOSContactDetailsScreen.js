import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';

const SOSContactDetailsScreen = ({ route, navigation }) => {
  const { userId} = route.params;
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [userPhoneNumber,setUserPhoneNumber] = useState('');
  const [userName,setUserName] = useState('');
  const [SOSContacts,setSOSContacts]=useState(null);
  
    useEffect(() => {
      const getUserDetails = async () => {
        try {
          // Get the user document by ID
          const userDoc = await firestore().collection('user_details').doc(userId).get();
  
          // Check if the document exists
          if (userDoc.exists) {
            // Access the data
            const userData = userDoc.data();
  
            // Log or use the data as needed
            console.log('User Details:', userData);
  
            // Access specific fields
            const userName = userData.user_name;
            const userPhoneNumber = userData.phone_number;
            setUserPhoneNumber(userPhoneNumber);
            setUserName(userName);
  
            console.log('User Name:', userName);
            console.log('Phone Number:', userPhoneNumber);
  
            // You can update the component state with the user data or use it as needed
          } else {
            console.log('User not found');
          }
        } catch (error) {
          console.error('Error getting user details:', error);
        }
      };
  
      // Call the function to get user details when the component mounts
      getUserDetails();
    }, [userId]);



    useEffect(() => {
      const fetchPhoneNumbers = async () => {
        try {
          const snapshot = await firestore()
            .collection('sos_contact_details')
            .doc(userId)
            .get();
  
          if (snapshot.exists) {
            const data = snapshot.data();
            setSOSContacts(data.phoneNumbers || []);
            console.log(SOSContacts);
          }
        } catch (error) {
          console.error('Error fetching phone numbers:', error);
        }
      };
  
      fetchPhoneNumbers();
    }, [userId]);
  


  const addPhoneNumber = () => {
    if (newPhoneNumber.trim() !== '') {
      setPhoneNumbers(prevPhoneNumbers => [...prevPhoneNumbers, newPhoneNumber.trim()]);
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
        navigation.navigate('Home', { userId: userId });
      } else {
        console.error('UserId is undefined.');
      }
    } catch (error) {
      console.error('Error saving SOS contacts:', error);
      // Handle the error, show an alert, etc.
    }
  };

  return (
    <ScrollView>
      <View>
        <Text>
          UserId: {userId}
          Name: {userName}
          Phone Number: {userPhoneNumber}
        </Text>
      </View>
      <View>
        <Text>
          Phone Numbers: 
        </Text>
      </View>
      <View>
      <Text>User ID: {userId}</Text>
      <FlatList
        data={SOSContacts}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </View>
    <View style={styles.container}>
      {phoneNumbers.map((item, index) => (
        <View key={index} style={styles.phoneNumberContainer}>
          <TextInput
            style={styles.phoneNumberText}
            value={item}
            onChangeText={(newText) => {
              const updatedPhoneNumbers = [...phoneNumbers];
              updatedPhoneNumbers[index] = newText;
              setPhoneNumbers(updatedPhoneNumbers);
            }}
          />
        </View>
      ))}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          value={newPhoneNumber}
          onChangeText={setNewPhoneNumber}
        />
      </View>
      <View>
      <Button title="Add Contact" color="#F33A6A" onPress={addPhoneNumber} />
      </View>
      <View>
      <Button title="Save SOS Contacts" color="#F33A6A" onPress={saveSOSContacts} />
      </View>
    </View>
    </ScrollView>
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
