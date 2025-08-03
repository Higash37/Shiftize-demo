import React from 'react';
import { Slot } from 'expo-router';
import { View } from 'react-native';

export default function LandingLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}