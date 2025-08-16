import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { NavigationProps } from "./types";

export const MobileNavigation: React.FC<NavigationProps> = ({
  menuItems,
  activeSection,
  isMobile,
  onScrollToSection,
}) => {
  if (!isMobile) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.mobileMenu}
      contentContainerStyle={styles.mobileMenuContent}
    >
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.mobileMenuItem,
            activeSection === item.id && styles.mobileMenuItemActive,
          ]}
          onPress={() => onScrollToSection(item.id)}
        >
          <MaterialIcons
            name={item.icon}
            size={18}
            color={activeSection === item.id ? "#2563eb" : "#6b7280"}
          />
          <Text
            style={[
              styles.mobileMenuItemText,
              activeSection === item.id && styles.mobileMenuItemTextActive,
            ]}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mobileMenu: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
  },
  mobileMenuContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  mobileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    gap: 6,
    minWidth: 80,
  },
  mobileMenuItemActive: {
    backgroundColor: "#eff6ff",
  },
  mobileMenuItemText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  mobileMenuItemTextActive: {
    color: "#2563eb",
  },
});