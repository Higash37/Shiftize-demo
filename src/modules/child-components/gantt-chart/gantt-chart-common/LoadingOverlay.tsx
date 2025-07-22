import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const LoadingOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <View style={[styles.overlay, { pointerEvents: "auto" }]}>
      <ActivityIndicator size="large" color="#1976D2" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});

export default LoadingOverlay;
