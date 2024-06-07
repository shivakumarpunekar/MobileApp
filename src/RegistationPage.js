import React, { useState, useRef } from 'react';
import {Text, View, TextInput, Button, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import PhoneInput from "react-native-phone-number-input";

const RegistrationPage = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [conformpassword, setconformPassword] = useState('');
  //This is for Mobile verification OTP
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const phoneInput = useRef(null);

  const handleVerify = () => {
    // Validate phone number first
    if (!phoneInput.current?.isValidNumber(phoneNumber)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }

    // Placeholder for actual OTP verification logic (should be implemented)
    // For demonstration, we just compare with a static OTP
    const staticOTP = "123456"; // Replace with actual OTP from server or static value
    if (otp === staticOTP) {
      setValid(true);
      setShowMessage(true);
    } else {
      setValid(false);
      setShowMessage(true);
    }
  };
//This is form.
  const handleRegistration = () => {
    // Here you can perform validation and submit the data
    console.log({
      firstName,
      middleName,
      lastName,
      dob,
      mobileNumber,
      address,
      username,
      password,
      conformpassword,
    });
  };
  return (
    <ScrollView>
    <View style={styles.container}>
        <Text style={{fontSize:50,bottom:20}}>
            Registation
        </Text>
        <Image 
        source={require('../assets/aairos.png')}
        style={styles.profileImage} 
      />
        <Text style={{fontSize:20}}>
            First Name
        </Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <Text style={{fontSize:20}}>
            Middle Name
        </Text>
      <TextInput
        style={styles.input}
        placeholder="Middle Name"
        value={middleName}
        onChangeText={setMiddleName}
      />
       <Text style={{fontSize:20}}>
            Last Name
        </Text>
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
       <Text style={{fontSize:20}}>
            Date of Birth
        </Text>
      <TextInput
        style={styles.input}
        placeholder="Date of Birth"
        value={dob}
        onChangeText={setDob}
      />
      <Text style={{fontSize:20, bottom:5,}}>
            Mobile Number
        </Text>
        <PhoneInput
        ref={phoneInput}
        defaultValue={phoneNumber}
        defaultCode="IN"
        onChangeFormattedText={(text) => {
          setPhoneNumber(text);
        }}
        withDarkTheme
        withShadow
        autoFocus
        placeholder="Enter phone number"
      />
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
      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
      >
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
      {/* <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      /> */}
      <Text style={{fontSize:20}}>
            Address
        </Text>
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <Text style={{fontSize:20}}>
            Username
        </Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <Text style={{fontSize:20}}>
            Password
        </Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <Text style={{fontSize:20}}>
            Conform Password
        </Text>
      <TextInput
        style={styles.input}
        placeholder="Conform Password"
        secureTextEntry={true}
        value={conformpassword}
        onChangeText={setconformPassword}
      />
      <View style={styles.RegButton}>
        <Button  title="Register" onPress={handleRegistration} />
      </View>
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
    marginBottom:30,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 10,
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
});

export default RegistrationPage;
