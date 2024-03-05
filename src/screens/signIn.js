import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
        try {
            const response = await auth().signInWithEmailAndPassword(email, password);
            const uid = response.user.uid;
            const userDoc = await firestore().collection('user_details').doc(uid).get();
            const userData = userDoc.data();

            const fcmToken = await messaging().getToken();
            await firestore().collection('user_details').doc(uid).set(
                {
                    fcm_token: fcmToken,
                },
                { merge: true }
            );
            navigation.navigate('Home', { userId: uid, userName:userData.user_name });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
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
            <View style={styles.buttonContainer}>
                <Button title="Sign In" onPress={signIn} color="#F33A6A" />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} color="#F33A6A" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20, // Add bottom space here
    },
    input: {
        width: '80%',
        padding: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        color: "#F33A6A",
    },
    buttonContainer: {
        width: '80%',
        marginBottom: 10, // Adjust bottom space between buttons
    },
});

export default SignInScreen;
