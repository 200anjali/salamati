import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
    try {
        await auth().signInWithEmailAndPassword(email, password);
        navigation.navigate('Home');
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
        <Button title="Sign In" onPress={signIn} />
        <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
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

export default SignInScreen;
