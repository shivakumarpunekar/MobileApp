import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

const RainDrop = ({ color, size, speed, positionX }) => {
  const fallAnim = useRef(new Animated.Value(-size)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fallAnim, {
            toValue: height + size,
            duration: speed,
            useNativeDriver: true,
          }),
          Animated.timing(fallAnim, {
            toValue: -size,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    startAnimation();
  }, [fallAnim, size, speed]);

  return (
    <Animated.View
      style={[
        styles.drop,
        { 
          backgroundColor: color, 
          width: size, 
          height: size * 3, 
          transform: [{ translateY: fallAnim }], 
          left: positionX 
        }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  drop: {
    position: 'absolute',
    top: 0,
  },
});

export default RainDrop;
