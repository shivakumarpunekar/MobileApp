import React, {useState} from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text, Alert, Platform } from 'react-native';
import { GoogleSignin, statusCodes, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import appleAuth, {
  AppleButton,
  AppleAuthError,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';
import Captcha from './Captcha/Captcha';

export default function LoginPage({navigation}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginId, setLoginId] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Configure Google SignIn
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    offlineAccess: true,
  });

  // Function to handle Google Sign-In
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Login is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.log('Error:', error);
      }
    }
  };

  // Function to handle Apple Sign-In
  const onAppleButtonPress = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
      });

      if (!appleAuthRequestResponse.identityToken) {
        throw 'Apple Sign-In failed - no identify token returned';
      }

      Alert.alert('Login Success', 'You are logged in with Apple!');
    } catch (error) {
      if (error.code === AppleAuthError.CANCELED) {
        Alert.alert('Login Canceled', 'You canceled the login');
      } else {
        Alert.alert('Login Failed', 'Something went wrong');
        console.error(error);
      }
    }
  };

  // Function to handle Login
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username, password are required.');
      return;
    }

    if (captchaVerified) {
      try {
        const response = await fetch('http://10.0.2.2:2030/api/Auth/login', {
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

        //Admin and User Login Handular
        if (data.isAdmin) {
          Alert.alert('Admin Login Successful', `Admin Login UserName: ${data.username}`);
          navigation.navigate('AdminHome'); // Navigate to Admin Dashboard
        } else {
          Alert.alert('Login Successful', `UserName: ${data.username}`);
          setLoginId(data.loginId); // Update loginId state after successful login
          navigation.navigate('Welcome', { loginId: data.loginId }); // Navigate to regular user welcome page
        }
      } catch (error) {
        console.error('Login Error:', error.message);
        Alert.alert('Login Failed', 'Please verify username and password.');
      }
    } else {
      Alert.alert('Captcha Verification', 'Please verify the CAPTCHA first.');
    }
  };

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
      <Captcha onVerify={setCaptchaVerified} />

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

      {Platform.OS !== 'ios' && (
        <View style={styles.socialContainer}>
          <GoogleSigninButton
            style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={signInWithGoogle}
          />
        </View>
      )}

      {Platform.OS !== 'android' && (
        <View>
          <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={{
              width: 192,
              height: 48,
              top:6,
            }}
            onPress={onAppleButtonPress}
          />
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
    backgroundColor: '#F6F3E7',
    padding: 16,
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
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 5,
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    width: '60%',
  },
  googleButton: {
    width: 192, 
    height: 48, 
  },
});
