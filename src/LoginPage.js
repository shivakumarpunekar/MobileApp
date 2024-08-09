import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text, Alert } from 'react-native';
import RainAnimation from './RainAnimation/RainAnimation';

export default function LoginPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginId, setLoginId] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username, password are required.');
      return;
    }

    try {
      const response = await fetch('http://103.145.50.185:2030/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: username,
          password: password,
          loginId: loginId,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      if (data.isAdmin) {
        Alert.alert('Admin Login Successful', `Admin Login UserName: ${data.username}`);
        navigation.navigate('AdminHome');
      } else {
        setLoginId(data.loginId);
        navigation.navigate('Welcome', { loginId: data.loginId });
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Please verify username and password.');
    }
  };

  return (
    <View style={styles.container}>
      <RainAnimation/>
      <Image
        source={require('../assets/aairos.png')}
        style={styles.profileImage}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RegistrationPage')}
        >
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F3E7',
    padding: 16,
    position: 'absolute', // Position absolute to ensure it's above the rain animation
    zIndex: 1, // Higher zIndex to make sure it appears above the rain animation
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#D3D3D3',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: '#F0F0F0',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
    width: '70%',
  },
  button: {
    backgroundColor: '#BFA100',
    padding: 10,
    borderRadius: 40,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
});

