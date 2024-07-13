import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';

// This is for date format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ProfileScreenEdit = ({ route }) => {
  const navigation = useNavigation();
  const { data } = route.params;

  const [userProfileId, setuserProfileId] = useState(data.userProfileId);
  const [guId, setguId] = useState(data.guId);
  const [firstName, setFirstName] = useState(data.firstName);
  const [middleName, setMiddleName] = useState(data.middleName);
  const [lastName, setLastName] = useState(data.lastName);
  const [email, setemail] = useState(data.email);
  const [dateOfBirth, setDateOfBirth] = useState(new Date(data.dateOfBirth));
  const [mobileNumber, setMobileNumber] = useState(data.mobileNumber);
  const [userName, setUserName] = useState(data.userName);
  const [password, setPassword] = useState(data.password);
  const [country, setCountry] = useState(data.country);
  const [state, setState] = useState(data.state);
  const [city, setCity] = useState(data.city);
  const [pincode, setpincode] = useState(data.pincode);
  const [profileImage, setProfileImage] = useState(data.profileImage || null);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    if (!validateMobileNumber()) {
      return;
    }
     
    try {
      const updateData = {
        userProfileId,
        guId,
        firstName,
        middleName,
        lastName,
        email,
        dateOfBirth: dateOfBirth.toISOString(),
        mobileNumber,
        userName,
        password,
        country,
        state,
        city,
        pincode,
        profileImage: profileImage ? profileImage : null,
      };
      const profileUpdateResponse = await fetch(
        `http://10.0.2.2:2030/api/userprofiles/${userProfileId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        },
      );
  
      if (profileUpdateResponse.status === 204) {
        // No content response, update successful
        Alert.alert('Profile updated successfully');
        navigation.goBack();
        return;
      }
  
      // Handle other status codes (200, etc.) here
      const profileUpdateResponseJson = await profileUpdateResponse.json();
  
      if (!profileUpdateResponse.ok) {
        console.error('Profile update response:', profileUpdateResponseJson);
        throw new Error('Error updating profile User');
      }
  
      Alert.alert('Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error updating profile');
    }
  };
  

  // This is a mobileNumber Verification
  const validateMobileNumber = () => {
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      setErrorMessage('Mobile number must be exactly 10 digits.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // For Profile Image Change
  const handleImagePicker = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (!result.didCancel && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.curvedBackground}>
          <ImageBackground
            source={require('../assets/123.jpeg')}
            style={styles.backgroundImage}
          >
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Icon name="save" size={30} color="#000" />
            </TouchableOpacity>
            <View style={styles.header}>
              <View style={styles.leftHeader}>
                <View style={styles.inputname}>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  <TextInput
                    style={styles.input}
                    value={middleName}
                    onChangeText={setMiddleName}
                  />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
                <TextInput
                  style={styles.email}
                  value={email}
                  onChangeText={setemail}
                />
              </View>
              <TouchableOpacity onPress={handleImagePicker}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Image
                    source={require('../assets/User-Avatar-Profile-PNG.png')}
                    style={styles.profileImage}
                  />
                )}
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
        <View style={styles.content}>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="calendar"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>Date of Birth</Text>
            <TouchableOpacity onPress={() => setDatePickerOpen(true)}>
              <Text style={styles.sectionContent}>
                {formatDate(dateOfBirth)}
              </Text>
            </TouchableOpacity>
            <DatePicker
              modal
              open={datePickerOpen}
              date={dateOfBirth}
              mode="date"
              onConfirm={(date) => {
                setDatePickerOpen(false);
                setDateOfBirth(date);
              }}
              onCancel={() => {
                setDatePickerOpen(false);
              }}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="phone"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>Mobile Number</Text>
            <TextInput
              style={styles.sectionContent}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="numeric"
            />
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="user"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>User Name</Text>
            <TextInput
              style={styles.sectionContent}
              value={userName}
              onChangeText={setUserName}
              editable={false}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="lock"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>Password</Text>
            <TextInput
              style={styles.sectionContent}
              value={password}
              onChangeText={setPassword}
              placeholder="password"
              secureTextEntry={true}
              editable={false}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="globe"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>Country</Text>
            <TextInput
              style={styles.sectionContent}
              value={country}
              onChangeText={setCountry}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="map-marker"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>State</Text>
            <TextInput
              style={styles.sectionContent}
              value={state}
              onChangeText={setState}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="map"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>City</Text>
            <TextInput
              style={styles.sectionContent}
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="map-pin"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>Pin Code</Text>
            <TextInput
              style={styles.sectionContent}
              value={pincode}
              onChangeText={setpincode}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3E7',
    height: '100%',
  },
  curvedBackground: {
    width: '100%',
    height: '30%',
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 100,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: 70,
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftHeader: {
    flex: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  inputname: {
    flexDirection: 'row',
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 5,
    marginBottom: 10,
    color: '#000',
  },
  email: {
    fontSize: 16,
    color: '#000',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 10,
    width: 40,
  },
  sectionTitle: {
    width: 150,
    fontWeight: 'bold',
  },
  sectionContent: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});

export default ProfileScreenEdit;
