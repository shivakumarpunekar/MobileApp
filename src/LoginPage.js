import React, {useState} from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text, Alert } from 'react-native';
import { GoogleSignin, statusCodes, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import appleAuth, {
  AppleButton,
  AppleAuthError,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';
import Captcha from './Captcha/Captcha';



export default function LoginPage({navigation}) {


const [captchaVerified, setCaptchaVerified] = useState(false);

  

  //This is Google Auth
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

  //This is Apple Auth
  const onAppleButtonPress = async () => {
    try {
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw 'Apple Sign-In failed - no identify token returned';
      }

      // You can now send this token to your server to verify the user's identity
      const { identityToken, nonce } = appleAuthRequestResponse;

      // handle the received data as needed

      Alert.alert('Login Success', 'You are logged in with Apple!');
    } catch (error) {
      if (error.code === AppleAuthError.CANCELED) {
        Alert.alert('Login Canceled', 'You canceled the login');
      } else {
        Alert.alert('Login Failed', 'Something went wrong');
        console.error(error);
      }
    }
  }

  //This is a Captcha
  const handleLogin = () => {
    if (captchaVerified) {
      navigation.navigate('Welcome');
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
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
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
    marginBottom:20,
    justifyContent: 'space-between',
    width: '70%',
  },
  button: {
    backgroundColor: '#d3d3d3',
    padding: 10,
    borderRadius: 40,
    alignItems: 'center',
    width: '45%',
  },
  buttonText: {
    color: '#BFA100',
    fontSize: 25,
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