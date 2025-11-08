import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

/**
 * セクションコンポーネントのローディングフォールバック
 * 遅延読み込み中の表示用
 */
export const SectionLoadingFallback: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
});

