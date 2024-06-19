import React, {useEffect, useState} from 'react';
import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

//This is for date format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};


const ProfilePage = () => {
  // This is for static
  const navigation = useNavigation();

  //   const userProfile = {
  //   UserProfileId: '1',
  //   GuId: '1234-5678-9012',
  //   FirstName: 'John',
  //   MiddleName: 'A',
  //   LastName: 'Doe',
  //   DateOfBirth: '1990-01-01',
  //   MobileNumber: '+1234567890',
  //   NumberOfDevices: 3,
  //   UserName: 'johndoe',
  //   Password: 'password',  // Note: Do not display password in the profile
  //   CreatedDate: '2022-01-01',
  //   UpdatedDate: '2023-01-01',
  //   Country: 'USA',
  //   State: 'California',
  //   City: 'Los Angeles',
  //   Pincode: '90001',
  //   Email: 'john.doe@example.com',
  // };

  //This is for dynamic
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetch('http://192.168.1.4:3001/api/aairos?userProfileId=1')
      .then(response => response.json())
      .then(data => setUserProfile(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  if (!userProfile) {
    return <Text>Loading...</Text>;
    
  }

  return (
    <ScrollView>
    <View style={styles.container}>
      <View style={styles.curvedBackground}>
        <ImageBackground
          source={require('../assets/123.jpeg')}
          style={styles.backgroundImage}
        >
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile', { userProfile })}>
                <Icon  name="edit" size={30} color="#000" />
            </TouchableOpacity>
          <View style={styles.header}>
            
            <View style={styles.leftHeader}>
              <Text style={styles.name}>{userProfile.FirstName} {userProfile.MiddleName} {userProfile.LastName}</Text>
              <Text style={styles.email}>{userProfile.Email}</Text>
            </View>
            <Image
              source={require('../assets/User-Avatar-Profile-PNG.png')}
              style={styles.profileImage}
            />
            
          </View>
        </ImageBackground>
      </View>
      <View style={styles.content}>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="calendar" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>DateOfBirth</Text>
          <Text style={styles.sectionContent}>{formatDate(userProfile.DateOfBirth)}</Text>
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="phone" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>MobileNumber</Text>
          <Text style={styles.sectionContent}>{userProfile.MobileNumber}</Text>
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="user" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>UserName</Text>
          <Text style={styles.sectionContent}>{userProfile.UserName}</Text>
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="lock" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>Password</Text>
          <Text style={styles.sectionContent}>{userProfile.Password}</Text>
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="globe" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>Country</Text>
          <Text style={styles.sectionContent}>{userProfile.Country}</Text>
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="map-marker" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>State</Text>
          <Text style={styles.sectionContent}>{userProfile.State}</Text>
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="map" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>City</Text>
          <Text style={styles.sectionContent}>{userProfile.City}</Text>
        </View>
        <View style={styles.section}>
          <Icon style={styles.sectionIcon} name="map-pin" size={30} color="#BFA100" />
          <Text style={styles.sectionTitle}>Pincode</Text>
          <Text style={styles.sectionContent}>{userProfile.Pincode}</Text>
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
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width:70,
    alignSelf:'flex-end',
    marginRight:10,
    
  },
  editButtonText: {
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
    marginBottom: 11,
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
  },
});

export default ProfilePage;
