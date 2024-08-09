import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import RainDrop from './RainDrop';

const { height, width } = Dimensions.get('window');

// Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Function to generate a random number within a range
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const RainAnimation = () => {
  const drops = new Array(20).fill(null); // Increase the number of drops here

  return (
    <View style={styles.rainContainer}>
      {drops.map((_, index) => (
        <RainDrop
          key={index}
          color={getRandomColor()}
          size={getRandomNumber(2, 6)} // Random size between 2 and 6
          speed={getRandomNumber(1500, 3000)} // Random speed between 1500ms and 3000ms
          positionX={getRandomNumber(0, width - 5)} // Random horizontal position
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  rainContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, // Lower zIndex to make sure it stays behind other components
    backgroundColor: '#3A3A3A', // Background color of rain animation
  },
});

export default RainAnimation;
