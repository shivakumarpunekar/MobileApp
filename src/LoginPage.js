import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RainAnimation from './RainAnimation/RainAnimation';

export default function LoginPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loading, setLoading] = useState(false); // Loading state to handle login process

  useEffect(() => {
    // Check if the user is already logged in
    const checkLoginStatus = async () => {
      const storedLoginId = await AsyncStorage.getItem('loginId');
      const isAdmin = await AsyncStorage.getItem('isAdmin');
      if (storedLoginId) {
        if (isAdmin === 'true') {
          navigation.navigate('AdminHome', { isAdmin: true });
        } else {
          navigation.navigate('Welcome', { loginId: storedLoginId });
        }
      }
    };

    checkLoginStatus();
  }, [navigation]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username and password are required.');
      return;
    }

    setLoading(true); // Start loading when login process begins

    try {
      const response = await fetch('http://103.145.50.185:2030/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      if (data.isAdmin) {
        await AsyncStorage.setItem('isAdmin', 'true'); // Save isAdmin status
        await AsyncStorage.setItem('loginId', data.loginId.toString()); // Save loginId as string
        Alert.alert('Admin Login Successful', `Admin Login UserName: ${data.username}`);
        navigation.navigate('AdminHome', { isAdmin: true });
      } else {
        await AsyncStorage.setItem('isAdmin', 'false');
        await AsyncStorage.setItem('loginId', data.loginId.toString()); // Save loginId as string
        setLoginId(data.loginId);
        navigation.navigate('Welcome', { loginId: data.loginId });
      } 
    } catch (error) {
      console.error('Login error:', error); // Log the error for debugging
      Alert.alert('Login Failed', 'Please verify your username and password.');
    } finally {
      setLoading(false); // Stop loading when login process ends
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('loginId');
      await AsyncStorage.removeItem('isAdmin');
      navigation.navigate('LoginPage');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* <RainAnimation/> */}
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

      {loading ? (
        <ActivityIndicator size="large" color="#BFA100" />
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
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
