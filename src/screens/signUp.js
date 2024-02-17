import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signUp = async () => {
    try {
        await auth().createUserWithEmailAndPassword(email, password);
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
        <Button title="Sign Up" onPress={signUp} />
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
