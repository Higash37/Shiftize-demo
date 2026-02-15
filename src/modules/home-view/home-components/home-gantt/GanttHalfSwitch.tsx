import React from "react";
import { View, Pressable, Text } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

interface GanttHalfSwitchProps {
  showFirst: boolean;
  onChange: (showFirst: boolean) => void;
}

export const GanttHalfSwitch: React.FC<GanttHalfSwitchProps> = ({
  showFirst,
  onChange,
}) => {
  const theme = useMD3Theme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: theme.spacing.sm,
        gap: theme.spacing.sm,
      }}
    >
      <Pressable
        onPress={() => onChange(true)}
        style={{
          backgroundColor: showFirst
            ? theme.colorScheme.surface
            : theme.colorScheme.surfaceContainerHigh,
          borderRadius: theme.shape.small,
          paddingHorizontal: 18,
          paddingVertical: theme.spacing.sm,
          marginRight: theme.spacing.xs,
          borderWidth: showFirst ? 2 : 1,
          borderColor: showFirst ? theme.colorScheme.outlineVariant : theme.colorScheme.outline,
        }}
      >
        <Text
          style={{
            color: showFirst ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant,
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
            ? theme.colorScheme.surface
            : theme.colorScheme.surfaceContainerHigh,
          borderRadius: theme.shape.small,
          paddingHorizontal: 18,
          paddingVertical: theme.spacing.sm,
          borderWidth: !showFirst ? 2 : 1,
          borderColor: !showFirst ? theme.colorScheme.outlineVariant : theme.colorScheme.outline,
        }}
      >
        <Text
          style={{
            color: !showFirst ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant,
            fontWeight: "bold",
          }}
        >
          後半
        </Text>
      </Pressable>
    </View>
  );
};
