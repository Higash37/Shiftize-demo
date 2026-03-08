import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

export const SettingsView: React.FC = () => {
  const { colorScheme: cs } = useMD3Theme();

  return (
    <View style={{ flex: 1, backgroundColor: cs.surface }}>
      <MasterHeader title="設定" />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Ionicons name="construct-outline" size={64} color={cs.outlineVariant} />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: cs.onSurface,
            marginTop: 16,
          }}
        >
          設定
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: cs.onSurfaceVariant,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          この機能は現在開発中です
        </Text>
      </View>
    </View>
  );
};
