import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Navigation } from "./Navigation";
import { NavigationProps } from "./types";

interface HeaderProps extends NavigationProps {}

export const Header: React.FC<HeaderProps> = ({
  menuItems,
  activeSection,
  isMobile,
  onScrollToSection,
  onGetStarted,
}) => {
  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      <View style={styles.headerContent}>
        <Text style={styles.logo}>Shiftize</Text>
        
        <Navigation
          menuItems={menuItems}
          activeSection={activeSection}
          isMobile={isMobile}
          onScrollToSection={onScrollToSection}
          onGetStarted={onGetStarted}
        />

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={onGetStarted}
        >
          <Text style={styles.getStartedButtonText}>無料で始める</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 24,
    paddingVertical: 16,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    letterSpacing: -0.5,
  },
  getStartedButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  getStartedButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});