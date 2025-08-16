import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { NavigationProps } from "./types";

export const Navigation: React.FC<NavigationProps> = ({
  menuItems,
  activeSection,
  isMobile,
  onScrollToSection,
  onGetStarted,
}) => {
  if (isMobile) {
    return null; // モバイルナビゲーションは別コンポーネント
  }

  return (
    <View style={styles.navigation}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.menuItem,
            activeSection === item.id && styles.menuItemActive,
          ]}
          onPress={() => onScrollToSection(item.id)}
        >
          <MaterialIcons
            name={item.icon}
            size={20}
            color={activeSection === item.id ? "#2563eb" : "#6b7280"}
          />
          <Text
            style={[
              styles.menuItemText,
              activeSection === item.id && styles.menuItemTextActive,
            ]}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  menuItemActive: {
    backgroundColor: "#eff6ff",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  menuItemTextActive: {
    color: "#2563eb",
  },
});