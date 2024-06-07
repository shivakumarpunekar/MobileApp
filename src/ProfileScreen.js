import React from 'react';
import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const ProfilePage = () => {
  const navigation = useNavigation();

  const profileData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    fieldSchool: 'Some Field School',
    nickName: 'Johnny',
    emergencyContact: 'Jane Doe',
    emergencyNumber: '12345 - 67890',
  };

  return (
    <View style={styles.container}>
        
      <View style={styles.curvedBackground}>
        <ImageBackground
          source={require('../assets/J43.png')}
          style={styles.backgroundImage}
        >
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile', { profileData })}>
                <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          <View style={styles.header}>
            
            <View style={styles.leftHeader}>
              <Text style={styles.name}>{profileData.name}</Text>
              <Text style={styles.email}>{profileData.email}</Text>
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
          <Text style={styles.sectionTitle}>Field School</Text>
          <Text style={styles.sectionContent}>{profileData.fieldSchool}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nick Name</Text>
          <Text style={styles.sectionContent}>{profileData.nickName}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <Text style={styles.sectionContent}>{profileData.emergencyContact}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Number</Text>
          <Text style={styles.sectionContent}>{profileData.emergencyNumber}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: '#000', 
    borderRadius: 5,
    width:70,
    alignSelf:'flex-end',
    marginRight:20,
    
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
    color: '#ffffff', 
  },
  email: {
    fontSize: 16,
    color: '#ffffff', 
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
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
