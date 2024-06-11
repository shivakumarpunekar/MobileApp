import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const Captcha = ({ onVerify }) => {
  const [input, setInput] = useState('');
  const captchaCode = 'AB1234'; // Static CAPTCHA code

  const verifyCaptcha = () => {
    if (input === captchaCode) {
        onVerify(true);
        Alert.alert('Verification Successful', 'CAPTCHA verified successfully!');
      } else {
        onVerify(false);
        Alert.alert('Verification Failed', 'Incorrect CAPTCHA. Please try again.');
      }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.captchaText}>{captchaCode}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter CAPTCHA"
        value={input}
        onChangeText={setInput}
      />
      <Button title="Verify" onPress={verifyCaptcha} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  captchaText: {
    fontSize: 24,
    marginBottom: 5,
    backgroundColor: '#F6F3E7',
    padding: 10,
    borderRadius: 5,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
});

export default Captcha;
