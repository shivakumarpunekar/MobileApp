import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import apiClient,{fetchaDataFromApi} from './Api/api';

// This is for date format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ProfilePage = () => {
  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const result = await fetchaDataFromApi();
            setData(result);
            <View><Text>{result.data}</Text></View>
        } catch (error) {
            console.error(error);
        }
    };

    fetchData();
}, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView>
    <View style={styles.container}>
    
    {data ? (
      <><View style={styles.curvedBackground}>
      <View><Text>{data.userProfileId}</Text></View>
      <View><Text>{data.guId}</Text></View>
            <ImageBackground
              source={require('../assets/123.jpeg')}
              style={styles.backgroundImage}
            >
              <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile', { data })}>
                <Icon name="edit" size={30} color="#000" />
              </TouchableOpacity>
              <View style={styles.header}>

                <View style={styles.leftHeader}>
                  <Text style={styles.name}>{data.firstName} {data.middleName} {data.lastName}</Text>
                  <Text style={styles.email}>{data.email}</Text>
                </View>
                <Image
                  source={require('../assets/User-Avatar-Profile-PNG.png')}
                  style={styles.profileImage} />

              </View>
            </ImageBackground>
          </View><View style={styles.content}>
              <View style={styles.section}>
                <Icon style={styles.sectionIcon} name="calendar" size={30} color="#BFA100" />
                <Text style={styles.sectionTitle}>DateOfBirth</Text>
                <Text style={styles.sectionContent}>{formatDate(data.dateOfBirth)}</Text>
              </View>
              <View style={styles.section}>
                <Icon style={styles.sectionIcon} name="phone" size={30} color="#BFA100" />
                <Text style={styles.sectionTitle}>MobileNumber</Text>
                <Text style={styles.sectionContent}>{data.mobileNumber}</Text>
              </View>
              <View style={styles.section}>
                <Icon style={styles.sectionIcon} name="user" size={30} color="#BFA100" />
                <Text style={styles.sectionTitle}>UserName</Text>
                <Text style={styles.sectionContent}>{data.userName}</Text>
              </View>
              <View style={styles.section}>
                <Icon style={styles.sectionIcon} name="lock" size={30} color="#BFA100" />
                <Text style={styles.sectionTitle}>Password</Text>
                <Text style={styles.sectionContent}>{'*'.repeat(data.password.length)}</Text>
              </View>
              <View style={styles.section}>
                <Icon style={styles.sectionIcon} name="globe" size={30} color="#BFA100" />
                <Text style={styles.sectionTitle}>Country</Text>
                <Text style={styles.sectionContent}>{data.country}</Text>
              </View>
              <View style={styles.section}>
                <Icon style={styles.sectionIcon} name="map-marker" size={30} color="#BFA100" />
                <Text style={styles.sectionTitle}>State</Text>
                <Text style={styles.sectionContent}>{data.state}</Text>
              </View>
              <View style={styles.section}>
                <Icon style={styles.sectionIcon} name="map" size={30} color="#BFA100" />
                <Text style={styles.sectionTitle}>City</Text>
                <Text style={styles.sectionContent}>{data.city}</Text>
              </View>
              <View style={styles.section}>
                <Icon style={styles.sectionIcon} name="map-pin" size={30} color="#BFA100" />
                <Text style={styles.sectionTitle}>Pincode</Text>
                <Text style={styles.sectionContent}>{data.pincode}</Text>
              </View>
            </View></>
    ) : (
      <Text style={styles.loadingText}>Loading...</Text>
      )}
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

export default ProfilePage;
