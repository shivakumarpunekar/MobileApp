import React, { useState } from 'react';
import { View, Text, ImageBackground, Image, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreenEdit = ({ route }) => {
  const navigation = useNavigation();
  const { userProfile } = route.params;

  const [name, setName] = useState(userProfile.FirstName + ' ' + userProfile.MiddleName + ' ' + userProfile.LastName);
  const [email, setEmail] = useState(userProfile.Email);
  const [DateOfBirth, setDateOfBirth] = useState(userProfile.DateOfBirth);
  const [MobileNumber, seMobileNumber] = useState(userProfile.MobileNumber);
  const [UserName, setUserName] = useState(userProfile.UserName);
  const [Password, setPassword] = useState(userProfile.Password);
  const [Country, setCountry] = useState(userProfile.Country);
  const [State, setState] = useState(userProfile.State);
  const [City, setCity] = useState(userProfile.City);
  const [Pincode, setPincode] = useState(userProfile.Pincode);
  const [profileImage, setProfileImage] = useState(userProfile.profileImage || null);

  const handleSave = () => {
    // Perform save operation here (e.g., update state, make API call)
    // For now, we'll simply show an alert and navigate back

    // Example of updating userProfile (if it were managed via context or props)
    const updateduserProfile = {
      name,
      email,
      DateOfBirth,
      MobileNumber,
      UserName,
      Password,
      Country,
      State,
      City,
      Pincode,
    };

    // Navigate back to the profile page
    navigation.navigate('ProfilePage', { updateduserProfile });

    // Alternatively, show an alert as a placeholder for save operation
    Alert.alert('Profile Saved', 'Your profile has been updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  //For Profile Image Change
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
              value={DateOfBirth}
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
              onChangeText={seMobileNumber}
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
            />
          </View>
          <View style={styles.saveButtonView}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
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
    marginBottom: 13,
  },
  sectionIcon: {
    marginRight:10,
    width:40,
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
  saveButtonView: {
    backgroundColor: '#F6F3E7',
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
