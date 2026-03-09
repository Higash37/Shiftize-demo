import React from "react";
import { View, Pressable } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { createHomeViewStyles } from "../../home-styles/home-view-styles";
import { FontAwesome } from "@expo/vector-icons";
import { DateNavigator } from "@/common/common-ui/ui-navigation/DateNavigator";

interface DateNavBarProps {
  isMobile: boolean;
  showFirst: boolean;
  onToggleHalf: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  dateLabel: string;
  onOpenDatePicker: () => void;
  onPressSettings?: () => void;
}

export const DateNavBar: React.FC<DateNavBarProps> = ({
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
      <DateNavigator
        label={dateLabel}
        onPrev={onPrevDay}
        onNext={onNextDay}
        onLabelPress={onOpenDatePicker}
      />

      {/* 右端：パスワード変更ボタン */}
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
