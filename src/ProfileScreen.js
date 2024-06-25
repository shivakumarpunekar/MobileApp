import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axiosInstance from './Api/api';


// This is for date format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ProfilePage = () => {
  const navigation = useNavigation();

  const [error, setError] = useState(null);
  const [userProfiles, setUserProfiles] = useState([]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        debugger
        const response = await axiosInstance.get('/api/userprofiles/1');
        debugger
        setUserProfiles(response.profiles);
      } catch (error) {
        console.error('Error fetching userprofiles:', error);
      }
    };

    fetchUserProfiles();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error fetching user profile: {error.message}</Text>
      </View>
    );
  }

  if (!userProfiles.length) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <FlatList
          data={userProfiles}
          keyExtractor={(profiles) => profiles.userProfileId.toString()}
          renderprofiles={({ profiles }) => (
            <>
              <View style={styles.curvedBackground}>
                <ImageBackground
                  source={require('../assets/123.jpeg')}
                  style={styles.backgroundImage}
                >
                  <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile', { userProfile: profiles })}>
                    <Icon name="edit" size={30} color="#000" />
                  </TouchableOpacity>
                  <View style={styles.header}>
                    <View style={styles.leftHeader}>
                      <Text  key={index} style={styles.name}>
                        {profiles.FirstName} {profiles.MiddleName} {profiles.LastName}
                      </Text>
                      <Text  key={index} style={styles.email}>{profiles.Email}</Text>
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
                  <Text  key={index} style={styles.sectionContent}>{formatDate(profiles.DateOfBirth)}</Text>
                </View>
                <View style={styles.section}>
                  <Icon style={styles.sectionIcon} name="phone" size={30} color="#BFA100" />
                  <Text style={styles.sectionTitle}>MobileNumber</Text>
                  <Text  key={index} style={styles.sectionContent}>{profiles.MobileNumber}</Text>
                </View>
                <View style={styles.section}>
                  <Icon style={styles.sectionIcon} name="user" size={30} color="#BFA100" />
                  <Text style={styles.sectionTitle}>UserName</Text>
                  <Text  key={index} style={styles.sectionContent}>{profiles.UserName}</Text>
                </View>
                <View style={styles.section}>
                  <Icon style={styles.sectionIcon} name="lock" size={30} color="#BFA100" />
                  <Text style={styles.sectionTitle}>Password</Text>
                  <Text  key={index} style={styles.sectionContent}>{profiles.Password}</Text>
                </View>
                <View style={styles.section}>
                  <Icon style={styles.sectionIcon} name="globe" size={30} color="#BFA100" />
                  <Text style={styles.sectionTitle}>Country</Text>
                  <Text  key={index} style={styles.sectionContent}>{profiles.Country}</Text>
                </View>
                <View style={styles.section}>
                  <Icon style={styles.sectionIcon} name="map-marker" size={30} color="#BFA100" />
                  <Text style={styles.sectionTitle}>State</Text>
                  <Text  key={index} style={styles.sectionContent}>{profiles.State}</Text>
                </View>
                <View style={styles.section}>
                  <Icon style={styles.sectionIcon} name="map" size={30} color="#BFA100" />
                  <Text style={styles.sectionTitle}>City</Text>
                  <Text  key={index} style={styles.sectionContent}>{profiles.City}</Text>
                </View>
                <View style={styles.section}>
                  <Icon style={styles.sectionIcon} name="map-pin" size={30} color="#BFA100" />
                  <Text style={styles.sectionTitle}>Pincode</Text>
                  <Text  key={index} style={styles.sectionContent}>{profiles.Pincode}</Text>
                </View>
              </View>
            </>
          )}
        />
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
    width: 70,
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignprofiless: 'center',
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
    alignprofiless: 'center',
    marginBottom: 11,
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

export default ProfilePage;
