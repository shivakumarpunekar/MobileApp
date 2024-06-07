import React, { useState, useRef } from "react";
import { SafeAreaView, StyleSheet, View, StatusBar, TouchableOpacity, Text } from "react-native";
import PhoneInput from "react-native-phone-number-input";

const MobileNum = () => {
  const [value, setValue] = useState("");
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const phoneInput = useRef(null);

  return (
    <SafeAreaView style={styles.container}>
      <PhoneInput
        ref={phoneInput}
        defaultValue={value}
        defaultCode="IN"
        onChangeFormattedText={(text) => {
          setValue(text);
        }}
        withDarkTheme
        withShadow
        autoFocus
      />
      {showMessage && (
        <Text>
          {valid ? "Valid number" : "Invalid number"}
        </Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          const checkValid = phoneInput.current?.isValidNumber(value);
          setValid(checkValid);
          setShowMessage(true);
        }}
      >
        <Text style={styles.buttonText}>Check Number</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default MobileNum;
