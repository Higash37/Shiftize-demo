import React from "react";
import { View, Text, Pressable } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { styles } from "../../home-styles/home-view-styles";
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
}) => (
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
    {/* 左端：前半/後半ボタン */}
    {isMobile && (
      <View
        style={{
          position: "absolute",
          left: 16,
          zIndex: 1,
        }}
      >
        <Pressable
          onPress={onToggleHalf}
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.primary + "66",
            backgroundColor: colors.primary + "1A",
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: "bold" }}>
            {showFirst ? "前半" : "後半"}
          </Text>
        </Pressable>
      </View>
    )}

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
          <FontAwesome name="key" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>
    )}
  </View>
);
