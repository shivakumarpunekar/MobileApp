import React, { useState, useRef } from 'react';
import { Text, View, TextInput, Button, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PhoneInput from "react-native-phone-number-input";
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';

const RegistrationPage = () => {

  const navigation = useNavigation();

  const [firstName, setfirstName] = useState('');
  const [middleName, setmiddleName] = useState('');
  const [lastName, setlastName] = useState('');
  const [dateOfBirth, setdateOfBirth] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [mobileNumber, setmobileNumber] = useState('');
  const [userName, setuserName] = useState('');
  const [password, setpassword] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');
  // const [otp, setOtp] = useState("");
  // const [valid, setValid] = useState(false);
  // const [showMessage, setShowMessage] = useState(false);
  const [email, setemail] = useState('');
  const [country, setcountry] = useState('');
  const [state, setstate] = useState('');
  const [city, setcity] = useState('');
  const [pincode, setPincode] = useState('');
  const [passwordError, setpasswordError] = useState('');
  const [confirmpasswordError, setConfirmpasswordError] = useState('');
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
    if (!phoneInput.current?.isValidNumber(mobileNumber)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }

    // const staticOTP = "123456";
    // if (otp === staticOTP) {
    //   setValid(true);
    //   setShowMessage(true);
    // } else {
    //   setValid(false);
    //   setShowMessage(true);
    // }
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
      alert('Please Enter password');
      return false;
    }
    if (!confirmpassword.trim()) {
      alert('Please Enter Confirm password');
      return false;
    }
    if (password !== confirmpassword) {
      setpasswordError('password and Confirm password do not match');
      setConfirmpasswordError('password and Confirm password do not match');
      return false;
    } else {
      setpasswordError('');
      setConfirmpasswordError('');
    }
    if (!email.trim()) {
      alert('Please Enter email');
      return false;
    }
    if (!country.trim()) {
      alert('Please Enter country');
      return false;
    }
    if (!state.trim()) {
      alert('Please Enter state');
      return false;
    }
    if (!city.trim()) {
      alert('Please Enter city');
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
        { handleVerify }

        // Post to the userprofile table
        const userProfileResponse = await fetch('http://192.168.1.10:2030/api/userprofiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            middleName,
            lastName,
            dateOfBirth: dateOfBirth.toISOString().split('T')[0],
            mobileNumber,
            userName,
            password,
            email,
            country,
            state,
            city,
            pincode,
          }),
        });


        if (!userProfileResponse.ok) {
          const errorData = await userProfileResponse.json();
          if (errorData.message === "userName already exists.") {
            alert('Username already exists. Please choose a different username.');
          } else if (errorData.message === "mobileNumber already exists.") {
            alert('Mobile number already exists. Please use a different mobile number.');
          } else {
            alert('Error creating user profile: ' + (errorData.message || 'Unknown error'));
          }
          return;
        }

        const userprofileData = await userProfileResponse.json();
        const UserProfileId = userprofileData.UserProfileId;


        // Post to the login table
        const loginResponse = await fetch('http://192.168.1.10:2030/api/Auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName,
            password,
            UserProfileId,
          }),
        });

        if (!loginResponse.ok) {
          const loginErrorData = await loginResponse.json();
          throw new Error('Error creating login: ' + loginErrorData.message);
        }
        navigation.navigate('Login');
      } catch (error) {
        alert('Error registering user: ' + error.message);
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
          value={firstName}
          onChangeText={(value) => setfirstName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Middle Name
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Middle Name"
          value={middleName}
          onChangeText={(value) => setmiddleName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Last Name
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={(value) => setlastName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Date of Birth
        </Text>
        <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{dateOfBirth.toDateString()}</Text>
        </TouchableOpacity>
        <Modal isVisible={isDatePickerVisible} onBackdropPress={hideDatePicker}>
          <View style={styles.modalContent}>
            <DatePicker
              date={dateOfBirth}
              onDateChange={setdateOfBirth}
              mode="date"
              maximumDate={new Date()}
            />
            <Button title="Confirm" onPress={() => handleConfirm(dateOfBirth)} />
          </View>
        </Modal>
        <Text style={{ fontSize: 20, bottom: 5 }}>
          Mobile Number
        </Text>
        <PhoneInput
          ref={phoneInput}
          defaultValue={mobileNumber}
          defaultCode="IN"
          onChangeFormattedText={(text) => {
            setmobileNumber(text);
          }}
          withDarkTheme
          withShadow
          autoFocus
          placeholder="Enter phone number"
        />
        {/* {phoneInput.current?.isValidNumber(mobileNumber) && (
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
        )} */}
        {/* <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
        >
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity> */}
        <Text style={{ fontSize: 20 }}>
          Username
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={userName}
          onChangeText={(value) => setuserName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          password
        </Text>
        <TextInput
          style={styles.input}
          placeholder="password"
          secureTextEntry={true}
          value={password}
          onChangeText={(value) => setpassword(value)}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        <Text style={{ fontSize: 20 }}>
          Confirm password
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry={true}
          value={confirmpassword}
          onChangeText={(value) => setConfirmpassword(value)}
        />
        {confirmpasswordError ? <Text style={styles.errorText}>{confirmpasswordError}</Text> : null}
        <Text style={{ fontSize: 20 }}>
          email
        </Text>
        <TextInput
          style={styles.input}
          placeholder="email"
          keyboardType="email-address"
          value={email}
          onChangeText={(value) => setemail(value)}
        />
        <Text style={{ fontSize: 20 }}>
          country
        </Text>
        <TextInput
          style={styles.input}
          placeholder="country"
          value={country}
          onChangeText={(value) => setcountry(value)}
        />
        <Text style={{ fontSize: 20 }}>
          state
        </Text>
        <TextInput
          style={styles.input}
          placeholder="state"
          value={state}
          onChangeText={(value) => setstate(value)}
        />
        <Text style={{ fontSize: 20 }}>
          city
        </Text>
        <TextInput
          style={styles.input}
          placeholder="city"
          value={city}
          onChangeText={(value) => setcity(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Pincode
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={pincode}
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
    backgroundColor: '#F6F3E7',
    top: 15,
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
    alignItems: 'center',
    width: 100,
    marginTop: 10,
    marginBottom: 30,
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
