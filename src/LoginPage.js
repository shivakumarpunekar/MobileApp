import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const [storedLoginId, isAdmin] = await Promise.all([
          AsyncStorage.getItem('loginId'),
          AsyncStorage.getItem('isAdmin')
        ]);

        if (storedLoginId) {
          if (isAdmin === 'true') {
            navigation.navigate('AdminHome', { isAdmin: true });
          } else {
            navigation.navigate('Welcome', { loginId: storedLoginId });
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, [navigation]);

  const handleLogin = useCallback(async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username and password are required.');
      return;
    }

    setLoading(true);

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

      const isAdmin = data.isAdmin ? 'true' : 'false';
      await AsyncStorage.multiSet([
        ['isAdmin', isAdmin],
        ['loginId', data.loginId.toString()]
      ]);

      if (data.isAdmin) {
        Alert.alert('Admin Login Successful', `Admin Login UserName: ${data.username}`);
        navigation.navigate('AdminHome', { isAdmin: true });
      } else {
        setLoginId(data.loginId);
        navigation.navigate('Welcome', { loginId: data.loginId });
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Please verify your username and password.');
    } finally {
      setLoading(false);
    }
  }, [username, password, navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['loginId', 'isAdmin']);
      navigation.navigate('LoginPage');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#3A3A3A',
      padding: 16,
      position: 'absolute',
      zIndex: 1,
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
  }), []);

  return (
    <View style={styles.container}>
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
