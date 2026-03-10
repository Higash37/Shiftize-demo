/** @file DateNavigator.tsx @description ＜ ラベル ＞ 形式の日付ナビゲーションバー */
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

/** サブヘッダーの統一高さ（全デバイス共通） */
export const SUB_HEADER_HEIGHT = 44;

/** DateNavigatorのProps */
interface DateNavigatorProps {
  /** 中央に表示するラベル（日付文字列等） */
  label: string;
  /** 前へボタン押下時のコールバック */
  onPrev: () => void;
  /** 次へボタン押下時のコールバック */
  onNext: () => void;
  /** ラベル押下時のコールバック。未指定の場合ラベルは押下不可 */
  onLabelPress?: () => void;
  /** ナビゲーションバーの右端に追加する要素 */
  trailing?: React.ReactNode;
}

/** 全画面・全デバイス共通の日付ナビゲーション。高さSUB_HEADER_HEIGHT固定 */
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
