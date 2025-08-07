import React from "react";
import { View, Pressable, Text } from "react-native";
import { styles } from "../../home-styles/home-view-styles";

interface GanttHalfSwitchProps {
  showFirst: boolean;
  onChange: (showFirst: boolean) => void;
}

export const GanttHalfSwitch: React.FC<GanttHalfSwitchProps> = ({
  showFirst,
  onChange,
}) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    }}
  >
    <Pressable
      onPress={() => onChange(true)}
      style={{
        backgroundColor: showFirst
          ? styles.headerCell.backgroundColor
          : "#f0f0f0",
        borderRadius: 8,
        paddingHorizontal: 18,
        paddingVertical: 8,
        marginRight: 4,
        borderWidth: showFirst ? 2 : 1,
        borderColor: showFirst ? styles.headerCell.borderColor : "#ccc",
      }}
    >
      <Text
        style={{
          color: showFirst ? styles.headerText.color : "#888",
          fontWeight: "bold",
        }}
      >
        前半
      </Text>
    </Pressable>
    <Pressable
      onPress={() => onChange(false)}
      style={{
        backgroundColor: !showFirst
          ? styles.headerCell.backgroundColor
          : "#f0f0f0",
        borderRadius: 8,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderWidth: !showFirst ? 2 : 1,
        borderColor: !showFirst ? styles.headerCell.borderColor : "#ccc",
      }}
    >
      <Text
        style={{
          color: !showFirst ? styles.headerText.color : "#888",
          fontWeight: "bold",
        }}
      >
        後半
      </Text>
    </Pressable>
  </View>
);
