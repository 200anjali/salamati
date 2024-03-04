import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';


const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const signUp = async () => {
    try {
        const response=await auth().createUserWithEmailAndPassword(email, password);
        const uid = response.user.uid;
        console.log('User UID:', uid);
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);
        await firestore().collection('user_details').doc(uid).set({
          user_id: uid,
          user_name: name,
          phone_number: phoneNumber,
          fcm_token: fcmToken
        });
        console.log('Navigating to Home');

        navigation.navigate('Home',{userId:uid});
    } catch (error) {
        console.error(error);
    }
    };

    return (
    <View style={styles.container}>
        <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        />
        <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        />
        <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        />
        <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        />
        <Button title="Sign Up" onPress={signUp} color="#F33A6A" />
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    },
    input: {
    width: '80%',
    padding: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    },
});

export default SignUpScreen;
