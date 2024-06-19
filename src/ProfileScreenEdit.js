import React, { useState } from 'react';
import { View, Text, ImageBackground, Image, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';

// This is for date format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ProfileScreenEdit = ({ route }) => {
  const navigation = useNavigation();

  const { userProfile } = route.params;
  const [name, setName] = useState(userProfile.FirstName + ' ' + userProfile.MiddleName + ' ' + userProfile.LastName);
  const [email, setEmail] = useState(userProfile.Email);
  const [DateOfBirth, setDateOfBirth] = useState(userProfile.DateOfBirth);
  const [MobileNumber, setMobileNumber] = useState(userProfile.MobileNumber);
  const [UserName, setUserName] = useState(userProfile.UserName);
  const [Password, setPassword] = useState(userProfile.Password);
  const [Country, setCountry] = useState(userProfile.Country);
  const [State, setState] = useState(userProfile.State);
  const [City, setCity] = useState(userProfile.City);
  const [Pincode, setPincode] = useState(userProfile.Pincode);
  const [profileImage, setProfileImage] = useState(userProfile.profileImage || null);

  const handleSave = () => {
    const updatedProfile = {
      FirstName: name.split(' ')[0],
      MiddleName: name.split(' ')[1] || '',
      LastName: name.split(' ')[2] || '',
      Email: email,
      DateOfBirth: DateOfBirth,
      MobileNumber: MobileNumber,
      UserName: UserName,
      Password: Password,
      Country: Country,
      State: State,
      City: City,
      Pincode: Pincode,
      profileImage: profileImage
    };

    const requestUrl = `http://192.168.1.4:3001/api/aairos/Userprofile/${userProfile.UserProfileId}`;
    console.log('Request URL:', requestUrl);

    axios.put(requestUrl, updatedProfile)
      .then(response => {
        Alert.alert('Profile Updated', 'Your profile has been updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again later.');
      });
  };

  // For Profile Image Change
  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode) {
        const source = { uri: response.assets[0].uri };
        setProfileImage(source);
      }
    });
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.curvedBackground}>
          <ImageBackground
            source={require('../assets/123.jpeg')}
            style={styles.backgroundImage}
          >
            <View style={styles.header}>
              <View style={styles.leftHeader}>
                <TextInput
                  style={styles.name}
                  value={name}
                  onChangeText={setName}
                  placeholder="Name"
                  placeholderTextColor="#000"
                />
                <TextInput
                  style={styles.email}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#000"
                />
              </View>
              <TouchableOpacity onPress={handleChoosePhoto}>
                <Image
                  source={profileImage ? { uri: profileImage.uri } : require('../assets/User-Avatar-Profile-PNG.png')}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
        <View style={styles.content}>
          <View style={styles.section}>
            <Icon style={styles.sectionIcon} name="calendar" size={30} color="#BFA100" />
            <Text style={styles.sectionTitle}>DateOfBirth</Text>
            <TextInput
              style={styles.sectionContent}
              value={formatDate(DateOfBirth)}
              onChangeText={setDateOfBirth}
              placeholder="DateOfBirth"
            />
          </View>
          <View style={styles.section}>
            <Icon style={styles.sectionIcon} name="phone" size={30} color="#BFA100" />
            <Text style={styles.sectionTitle}>MobileNumber</Text>
            <TextInput
              style={styles.sectionContent}
              value={MobileNumber}
              onChangeText={setMobileNumber}
              placeholder="MobileNumber"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.section}>
            <Icon style={styles.sectionIcon} name="user" size={30} color="#BFA100" />
            <Text style={styles.sectionTitle}>UserName</Text>
            <TextInput
              style={styles.sectionContent}
              value={UserName}
              onChangeText={setUserName}
              placeholder="UserName"
            />
          </View>
          <View style={styles.section}>
            <Icon style={styles.sectionIcon} name="lock" size={30} color="#BFA100" />
            <Text style={styles.sectionTitle}>Password</Text>
            <TextInput
              style={styles.sectionContent}
              value={Password}
              onChangeText={setPassword}
              placeholder="Password"
            />
          </View>
          <View style={styles.section}>
            <Icon style={styles.sectionIcon} name="globe" size={30} color="#BFA100" />
            <Text style={styles.sectionTitle}>Country</Text>
            <TextInput
              style={styles.sectionContent}
              value={Country}
              onChangeText={setCountry}
              placeholder="Country"
            />
          </View>
          <View style={styles.section}>
            <Icon style={styles.sectionIcon} name="map-marker" size={30} color="#BFA100" />
            <Text style={styles.sectionTitle}>State</Text>
            <TextInput
              style={styles.sectionContent}
              value={State}
              onChangeText={setState}
              placeholder="State"
            />
          </View>
          <View style={styles.section}>
            <Icon style={styles.sectionIcon} name="map" size={30} color="#BFA100" />
            <Text style={styles.sectionTitle}>City</Text>
            <TextInput
              style={styles.sectionContent}
              value={City}
              onChangeText={setCity}
              placeholder="City"
            />
          </View>
          <View style={styles.section}>
            <Icon style={styles.sectionIcon} name="map-pin" size={30} color="#BFA100" />
            <Text style={styles.sectionTitle}>Pincode</Text>
            <TextInput
              style={styles.sectionContent}
              value={Pincode}
              onChangeText={setPincode}
              placeholder="Pincode"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3E7',
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
    marginTop:40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginBottom:10,
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
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 5,
  },
  saveButton: {
    backgroundColor: '#BFA100',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default ProfileScreenEdit;
