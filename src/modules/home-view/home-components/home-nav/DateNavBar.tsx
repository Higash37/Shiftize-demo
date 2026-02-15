import React from "react";
import { View, Text, Pressable } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { createHomeViewStyles } from "../../home-styles/home-view-styles";
import { FontAwesome } from "@expo/vector-icons";

interface DateNavBarProps {
  isMobile: boolean;
  showFirst: boolean;
  onToggleHalf: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  dateLabel: string;
  onOpenDatePicker: () => void;
  onPressSettings?: () => void; // パスワード変更ボタン
}

export const DateNavBar: React.FC<DateNavBarProps> = ({
  isMobile,
  showFirst,
  onToggleHalf,
  onPrevDay,
  onNextDay,
  dateLabel,
  onOpenDatePicker,
  onPressSettings,
}) => {
  const styles = useThemedStyles(createHomeViewStyles);
  const theme = useMD3Theme();

  return (
    <View
      style={[
        styles.datePickerRow,
        {
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          position: "relative",
        },
      ]}
    >
      {/* 中央：年月ピッカー＋日付ナビ（常に中央配置） */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable onPress={onPrevDay}>
          <Text style={styles.dateNavBtn}>{"<"}</Text>
        </Pressable>
        <Pressable onPress={onOpenDatePicker}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </Pressable>
        <Pressable onPress={onNextDay}>
          <Text style={styles.dateNavBtn}>{">"}</Text>
        </Pressable>
      </View>

      {/* 右端：パスワード変更ボタン（もしあれば） */}
      {onPressSettings && (
        <View
          style={{
            position: "absolute",
            right: 16,
            zIndex: 1,
          }}
        >
          <Pressable onPress={onPressSettings}>
            <FontAwesome name="key" size={20} color={theme.colorScheme.onSurfaceVariant} />
          </Pressable>
        </View>
      )}
    </View>
  );
};
