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
const formatDate = dateString => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ProfileScreenEdit = ({ route }) => {
  const navigation = useNavigation();
  const { data } = route.params;

  const [userProfileId, setuserProfileId] = useState(data.userProfileId);
  const [loginId, setlognId] = useState(data.loginId);
  const [guId, setguId] = useState(data.guId);
  const [firstName, setfirstName] = useState(data.firstName);
  const [middleName, setmiddleName] = useState(data.middleName);
  const [lastName, setlastName] = useState(data.lastName);
  const [email, setEmail] = useState(data.email);
  const [dateOfBirth, setdateOfBirth] = useState(new Date(data.dateOfBirth));
  const [mobileNumber, setmobileNumber] = useState(data.mobileNumber);
  const [userName, setuserName] = useState(data.userName);
  const [password, setpassword] = useState(data.password);
  const [country, setcountry] = useState(data.country);
  const [state, setstate] = useState(data.state);
  const [city, setcity] = useState(data.city);
  const [pincode, setpincode] = useState(data.pincode);
  const [profileImage, setprofileImage] = useState(data.profileImage || null);

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleSave = async () => {
    try {
      const updateData = {
        userProfileId,
        loginId,
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

      // Update user profile
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

      if (!profileUpdateResponse.ok) {
        throw new Error('Error updating profile');
      }

      // Update login information
      const loginUpdateResponse = await fetch(
        `http://10.0.2.2:2030/api/Auth/update/${loginId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName,
            password,
          }),
        },
      );

      if (!loginUpdateResponse.ok) {
        throw new Error('Error updating login');
      }

      Alert.alert('Profile updated successfully');
      navigation.goBack(); // Navigate back after successful update
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error updating profile');
    }
  };

  // For Profile Image Change
  const handleImagePicker = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (!result.didCancel && result.assets.length > 0) {
        setprofileImage(result.assets[0].uri);
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
            style={styles.backgroundImage}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Icon name="save" size={30} color="#000" />
            </TouchableOpacity>
            <View style={styles.header}>
              <View style={styles.leftHeader}>
                <View style={styles.inputname}>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setfirstName}
                  />
                  <TextInput
                    style={styles.input}
                    value={middleName}
                    onChangeText={setmiddleName}
                  />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setlastName}
                  />
                </View>
                <TextInput
                  style={styles.email}
                  value={email}
                  onChangeText={setEmail}
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
              onConfirm={date => {
                setDatePickerOpen(false);
                setdateOfBirth(date);
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
            <Text style={styles.sectionTitle}>mobileNumber</Text>
            <TextInput
              style={styles.sectionContent}
              value={mobileNumber}
              onChangeText={setmobileNumber}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="user"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>user Name</Text>
            <TextInput
              style={styles.sectionContent}
              value={userName}
              onChangeText={setuserName}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="lock"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>password</Text>
            <TextInput
              style={styles.sectionContent}
              value={password}
              onChangeText={setpassword}
              placeholder="password"
              secureTextEntry={true}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="globe"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>country</Text>
            <TextInput
              style={styles.sectionContent}
              value={country}
              onChangeText={setcountry}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="map-marker"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>state</Text>
            <TextInput
              style={styles.sectionContent}
              value={state}
              onChangeText={setstate}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="map"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>city</Text>
            <TextInput
              style={styles.sectionContent}
              value={city}
              onChangeText={setcity}
            />
          </View>
          <View style={styles.section}>
            <Icon
              style={styles.sectionIcon}
              name="map-pin"
              size={30}
              color="#BFA100"
            />
            <Text style={styles.sectionTitle}>pincode</Text>
            <TextInput
              style={styles.sectionContent}
              value={pincode}
              onChangeText={setpincode}
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
});

export default ProfileScreenEdit;
