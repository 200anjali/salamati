import React, { useState, useEffect } from 'react';
import { ScrollView, View, TextInput, Button, StyleSheet, Text, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
// import { ScrollView } from 'react-native-gesture-handler';

const SOSContactDetailsScreen = ({ route, navigation }) => {
  const { userId} = route.params;
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [userPhoneNumber,setUserPhoneNumber] = useState('');
  const [userName,setUserName] = useState('');
  const [SOSContacts,setSOSContacts]=useState(null);
  const [isAddContactVisible, setAddContactVisibility] = useState(false);
  const toggleAddContactVisibility = () => {
    setAddContactVisibility(!isAddContactVisible);
  };
  
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
    <ScrollView style={styles.container}>
    <View style={styles.userInfoContainer}>
      <Text style={styles.userInfoText}>
        UserId: {userId}
        {'\n'}
        Name: {userName}
        {'\n'}
        Phone Number: {userPhoneNumber}
      </Text>
    </View>

    <View style={styles.contactsContainer}>
      <Text style={styles.contactsHeader}>Emergency Contacts:</Text>
      <FlatList
        data={SOSContacts}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text style={styles.contactItem}>{item}</Text>}
      />
    </View>

    <View style={styles.buttonContainer}>
        <Button title="Click here to add SOS Contact" color="#F33A6A" onPress={toggleAddContactVisibility} />
      </View>

    {isAddContactVisible &&(
    <View style={styles.editContactsContainer}>
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
      <View style={styles.buttonContainer}>
        <Button title="Add Contact" color="#F33A6A" onPress={addPhoneNumber} />
      </View>
    

    <View style={styles.buttonContainer}>
      <Button title="Save SOS Contacts" color="#F33A6A" onPress={saveSOSContacts} />
    </View>
    </View>)}
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  userInfoContainer: {
    marginBottom: 20,
  },
  userInfoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactsContainer: {
    marginBottom: 20,
  },
  contactsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactItem: {
    fontSize: 14,
    marginBottom: 5,
  },
  editContactsContainer: {
    marginBottom: 20,
  },
  phoneNumberContainer: {
    marginBottom: 10,
  },
  phoneNumberText: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    marginBottom: 10,
  },
});

export default SOSContactDetailsScreen;