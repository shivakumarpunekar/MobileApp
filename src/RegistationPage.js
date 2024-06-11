import React, { useState, useRef } from 'react';
import { Text, View, TextInput, Button, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import PhoneInput from "react-native-phone-number-input";
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';

const RegistrationPage = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [conformpassword, setconformPassword] = useState('');
  //This is for Mobile verification OTP
  const [otp, setOtp] = useState("");
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const phoneInput = useRef(null);

  //Date Picker for dob
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    setDob(selectedDate);
    hideDatePicker();
  };

  // This is a Phone Number Verify
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

  //check the field is fill or empty
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
    if (!dob) {
      alert('Please Enter Date of Birth');
      return false;
    }
    if (!phoneNumber.trim()) {
      alert('Please Enter Phone Number');
      return false;
    }
    if (!address.trim()) {
      alert('Please Enter Address');
      return false;
    }
    if (!username.trim()) {
      alert('Please Enter Username');
      return false;
    }
    if (!password.trim()) {
      alert('Please Enter Password');
      return false;
    }
    if (!conformpassword.trim()) {
      alert('Please Enter Confirm Password');
      return false;
    }
    if (password !== conformpassword) {
      alert('Password and Confirm Password do not match');
      return false;
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
    if (!district.trim()) {
      alert('Please Enter District');
      return false;
    }
    if (!pincode.trim()) {
      alert('Please Enter Pincode');
      return false;
    }
    return true;
  };

  const handleRegistration = () => {
    if (checkTextInput()) {
      alert('SUCCESS');
      console.log({
        firstName,
        middleName,
        lastName,
        dob,
        phoneNumber,
        address,
        username,
        password,
        conformpassword,
        email,
        country,
        state,
        city,
        district,
        pincode,
      });
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
          onChangeText={(value) => setFirstName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Middle Name
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Middle Name"
          value={middleName}
          onChangeText={(value) => setMiddleName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Last Name
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={(value) => setLastName(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Date of Birth
        </Text>
        <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{dob.toDateString()}</Text>
        </TouchableOpacity>
        <Modal isVisible={isDatePickerVisible} onBackdropPress={hideDatePicker}>
          <View style={styles.modalContent}>
            <DatePicker
              date={dob}
              onDateChange={setDob}
              mode="date"
              maximumDate={new Date()}
            />
            <Button title="Confirm" onPress={() => handleConfirm(dob)} />
          </View>
        </Modal>
        <Text style={{ fontSize: 20, bottom: 5 }}>
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
        {phoneInput.current?.isValidNumber(phoneNumber) && (
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
          Address
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={(value) => setAddress(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Username
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={(value) => setUsername(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Password
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={(value) => setPassword(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Conform Password
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Conform Password"
          secureTextEntry={true}
          value={conformpassword}
          onChangeText={(value) => setconformPassword(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Email
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={(value) => setEmail(value)}
        />
        <Text style={{ fontSize: 20 }}>
          Country
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Country"
          value={country}
          onChangeText={(value) => setCountry(value)}
        />
        <Text style={{ fontSize: 20 }}>
          State
        </Text>
        <TextInput
          style={styles.input}
          placeholder="State"
          value={state}
          onChangeText={(value) => setState(value)}
        />
        <Text style={{ fontSize: 20 }}>
          City
        </Text>
        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={(value) => setCity(value)}
        />
        <Text style={{ fontSize: 20 }}>
          District
        </Text>
        <TextInput
          style={styles.input}
          placeholder="District"
          value={district}
          onChangeText={(value) => setDistrict(value)}
        />
        <View style={styles.RegButton}>
          <Button title="Register" onPress={handleRegistration} />
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
});

export default RegistrationPage;
