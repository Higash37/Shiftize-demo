import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

/** サブヘッダーの統一高さ（全デバイス共通） */
export const SUB_HEADER_HEIGHT = 44;

interface DateNavigatorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onLabelPress?: () => void;
  trailing?: React.ReactNode;
}

/**
 * 統一された ＜ ラベル ＞ 日付ナビゲーション
 *
 * 全画面・全デバイスで共通使用。高さ SUB_HEADER_HEIGHT で固定。
 */
export const DateNavigator: React.FC<DateNavigatorProps> = React.memo(
  ({ label, onPrev, onNext, onLabelPress, trailing }) => {
    const { colorScheme: cs } = useMD3Theme();

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: SUB_HEADER_HEIGHT,
        }}
      >
        <TouchableOpacity
          style={{ paddingHorizontal: 10, justifyContent: "center", height: SUB_HEADER_HEIGHT }}
          onPress={onPrev}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: cs.primary }}>
            ＜
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLabelPress}
          disabled={!onLabelPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 4,
            height: SUB_HEADER_HEIGHT,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "bold", color: cs.onSurface }}>
            {label}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingHorizontal: 10, justifyContent: "center", height: SUB_HEADER_HEIGHT }}
          onPress={onNext}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: cs.primary }}>
            ＞
          </Text>
        </TouchableOpacity>

        {trailing}
      </View>
    );
  }
);
