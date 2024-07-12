import React, { useState, useRef } from 'react';
import { Text, View, TextInput, Button, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PhoneInput from "react-native-phone-number-input";
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';

const RegistrationPage = () => {

  const navigation = useNavigation();

  const [FirstName, setFirstName] = useState('');
  const [MiddleName, setMiddleName] = useState('');
  const [LastName, setLastName] = useState('');
  const [DateOfBirth, setdateOfBirth] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [MobileNumber, setmobileNumber] = useState('');
  const [UserName, setUsername] = useState('');
  const [Password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState("");
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [EmailID, setEmail] = useState('');
  const [Country, setCountry] = useState('');
  const [State, setState] = useState('');
  const [City, setCity] = useState('');
  const [PinCode, setPincode] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const phoneInput = useRef(null);

  //This is a date picker show, hide, handleling
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    setdateOfBirth(selectedDate);
    hideDatePicker();
  };

  //This is a haldle otp
  const handleVerify = () => {
    if (!phoneInput.current?.isValidNumber(MobileNumber)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }

    const staticOTP = "123456";
    if (otp === staticOTP) {
      setValid(true);
      setShowMessage(true);
    } else {
      setValid(false);
      setShowMessage(true);
    }
  };

  //this is a validate the field 
  const checkTextInput = () => {
    if (!firstName.trim()) {
      alert('Please Enter First Name');
      return false;
    }
    if (!middleName.trim()) {
      alert('Please Enter Middle Name');
      return false;
    }
    if (!lastName.trim()) {
      alert('Please Enter Last Name');
      return false;
    }
    if (!dateOfBirth) {
      alert('Please Enter Date of Birth');
      return false;
    }
    if (!mobileNumber.trim()) {
      alert('Please Enter Phone Number');
      return false;
    }
    if (!userName.trim()) {
      alert('Please Enter Username');
      return false;
    }
    if (!password.trim()) {
      alert('Please Enter Password');
      return false;
    }
    if (!confirmPassword.trim()) {  
      alert('Please Enter Confirm Password');
      return false;
    }
    if (Password !== confirmPassword) {
      setPasswordError('Password and Confirm Password do not match');
      setConfirmPasswordError('Password and Confirm Password do not match');
      return false;
    } else {
      setPasswordError('');
      setConfirmPasswordError('');
    }
    if (!email.trim()) {
      alert('Please Enter Email');
      return false;
    }
    if (!country.trim()) {
      alert('Please Enter Country');
      return false;
    }
    if (!state.trim()) {
      alert('Please Enter State');
      return false;
    }
    if (!city.trim()) {
      alert('Please Enter City');
      return false;
    }
    if (!pincode.trim()) {
      alert('Please Enter Pincode');
      return false;
    }
    return true;
  };

  //This is a registration Handler 
  const handleRegistration = async () => {
     
    if (checkTextInput()) {
      try {
        // Post to the login table
        const loginResponse = await fetch('http://10.0.2.2:2030/api/Auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            userProfileId,
          }),
        });

        if (!loginResponse.ok) {
          throw new Error('Error creating login');
        }

        const loginData = await loginResponse.json();
        const loginId = loginData.loginId;

        // Post to the userprofile table
        const userProfileResponse = await fetch('http://10.0.2.2:2030/api/userprofiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            middleName,
            lastName,
            DateOfBirth: dateOfBirth.toISOString().split('T')[0], 
            mobileNumber,
            userName,
            password,
            email,
            country,
            state,
            city,
            pincode,
            loginId,
          }),
        });

        //This is a chicking Username and Mobilenumber
         
        if (userProfileResponse.status === 400) {
          const errorData = await userProfileResponse.json();
          if (errorData.message === "UserName already exists.") {
            alert('Username already exists. Please choose a different username.');
          } else if (errorData.message === "MobileNumber already exists.") {
            alert('Mobile number already exists. Please use a different mobile number.');
          }
          return;
        }
        if (!userProfileResponse.ok) {
          throw new Error('Error creating user profile');
        }
        navigation.navigate('Login');
      } catch (error) {
         
        console.error('Error:', error);
        alert('Error registering user');
      }
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={{ fontSize: 50, bottom: 20 }}>
          Registration
        </Text>
        <Image
          source={require('../assets/aairos.png')}
          style={styles.profileImage}
        />
        <Text style={{ fontSize: 20 }}>
          First Name
        </Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={FirstName}
          onChangeText={(value) => setFirstName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Middle Name
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Middle Name"
          value={MiddleName}
          onChangeText={(value) => setMiddleName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Last Name
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={LastName}
          onChangeText={(value) => setLastName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Date of Birth
        </Text>
        <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{DateOfBirth.toDateString()}</Text>
        </TouchableOpacity>
        <Modal isVisible={isDatePickerVisible} onBackdropPress={hideDatePicker}>
          <View style={styles.modalContent}>
            <DatePicker
              date={DateOfBirth}
              onDateChange={setdateOfBirth}
              mode="date"
              maximumDate={new Date()}
            />
            <Button title="Confirm" onPress={() => handleConfirm(DateOfBirth)} />
          </View>
        </Modal>
        <Text style={{ fontSize: 20, bottom: 5 }}>
          Mobile Number
        </Text>
        <PhoneInput
          ref={phoneInput}
          defaultValue={MobileNumber}
          defaultCode="IN"
          onChangeFormattedText={(text) => {
            setmobileNumber(text);
          }}
          withDarkTheme
          withShadow
          autoFocus
          placeholder="Enter phone number"
        />
        {phoneInput.current?.isValidNumber(MobileNumber) && (
          <>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="numeric"
          onChangeText={(text) => setOtp(text)}
          value={otp}
        />  
        {showMessage && (
          <Text style={styles.message}>
            {valid ? "OTP Verified" : "Invalid OTP"}
          </Text>
        )}
        </>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
        >
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20 }}>
          Username
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={UserName}
          onChangeText={(value) => setUsername(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Password
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          value={Password}
          onChangeText={(value) => setPassword(value)}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        <Text style={{ fontSize: 20 }}>
          Confirm Password
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={(value) => setConfirmPassword(value)}
        />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        <Text style={{ fontSize: 20 }}>
            Email
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={EmailID}
            onChangeText={(value) => setEmail(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Country
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Country"
          value={Country}
          onChangeText={(value) => setCountry(value)}
        />
        <Text style={{ fontSize: 20 }}>
          State
        </Text>
        <TextInput
          style={styles.input}
          placeholder="State"
          value={State}
          onChangeText={(value) => setState(value)}
        />
        <Text style={{ fontSize: 20 }}>
          City
        </Text>
        <TextInput
          style={styles.input}
          placeholder="City"
          value={City}
          onChangeText={(value) => setCity(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Pincode
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={PinCode}
          onChangeText={(value) => setPincode(value)}
        />
        <TouchableOpacity 
          style={styles.RegButton} 
          onPress={handleRegistration}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor:'#F6F3E7',
    top:15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  RegButton: {
    alignItems:'center',
    width:100,
    marginTop:10,
    marginBottom:30,
    backgroundColor: '#BFA100',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    alignItems: "center",
    borderRadius: 5,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  datePickerButton: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  datePickerText: {
    fontSize: 18,
    color: '#000',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
});

export default RegistrationPage;
