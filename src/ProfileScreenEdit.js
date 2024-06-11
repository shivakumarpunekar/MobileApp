import React, { useState } from 'react';
import { View, Text, ImageBackground, Image, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreenEdit = ({ route }) => {
  const navigation = useNavigation();
  const { profileData } = route.params;

  const [name, setName] = useState(profileData.name);
  const [email, setEmail] = useState(profileData.email);
  const [fieldSchool, setFieldSchool] = useState(profileData.fieldSchool);
  const [nickName, setNickName] = useState(profileData.nickName);
  const [emergencyContact, setEmergencyContact] = useState(profileData.emergencyContact);
  const [emergencyNumber, setEmergencyNumber] = useState(profileData.emergencyNumber);
  const [profileImage, setProfileImage] = useState(profileData.profileImage || null);

  const handleSave = () => {
    // Perform save operation here (e.g., update state, make API call)
    // For now, we'll simply show an alert and navigate back

    // Example of updating profileData (if it were managed via context or props)
    const updatedProfileData = {
      name,
      email,
      fieldSchool,
      nickName,
      emergencyContact,
      emergencyNumber,
    };

    // Navigate back to the profile page
    navigation.navigate('ProfilePage', { updatedProfileData });

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
          <Icon style={styles.sectionIcon} name="graduation-cap" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>Field School</Text>
          <TextInput
            style={styles.sectionContent}
            value={fieldSchool}
            onChangeText={setFieldSchool}
            placeholder="Field School"
          />
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="user" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>Nick Name</Text>
          <TextInput
            style={styles.sectionContent}
            value={nickName}
            onChangeText={setNickName}
            placeholder="Nick Name"
          />
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="phone" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <TextInput
            style={styles.sectionContent}
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="Emergency Contact"
          />
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="phone" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>Emergency Number</Text>
          <TextInput
            style={styles.sectionContent}
            value={emergencyNumber}
            onChangeText={setEmergencyNumber}
            placeholder="Emergency Number"
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
    
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
    marginBottom: 50,
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
