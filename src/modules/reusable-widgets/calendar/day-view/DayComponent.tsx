import React, { memo, useMemo } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { DayComponentPropsExtended } from "./DayComponent.types";
import { useResponsiveCalendarSize } from "../constants";
import { createDayComponentStyles, getIOSDayColor } from "./DayComponent.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { APP_FONT_FAMILY } from "@/common/common-constants/FontConstants";

/**
 * カレンダーの日付コンポーネント
 * メモ化して不要な再レンダリングを防止
 */
export const DayComponent = memo<DayComponentPropsExtended>(
  ({ date, state, marking, onPress, responsiveSize }) => {
    // レスポンシブサイズの取得
    const { dayWidth, dayHeight, isSmallScreen } = useResponsiveCalendarSize();
    const theme = useMD3Theme();
    const styles = useThemedStyles(createDayComponentStyles); // スタイルの動的生成
    const dynamicStyles = useMemo(() => {
      return {
        dayContainer: {
          width: dayWidth,
          height: dayHeight,
          padding: 0, // パディングを0に設定して余白をなくす
        },
        selectedDay: {
          borderRadius: Math.min(dayWidth, dayHeight) / 2,
        },
        dayText: {
          fontSize: isSmallScreen ? 15 : 14, // フォントサイズをさらに小さく
          letterSpacing: -1.0, // 文字間隔を狭める
          ...(responsiveSize?.day || {}),
        },
      };
    }, [dayWidth, dayHeight, isSmallScreen, responsiveSize]);

    // 選択中の日付かどうか
    const isSelected = marking?.selected;
    // 今日の日付かどうか
    const isToday = state === "today";
    // ドットマーカーの有無
    const hasMarker = marking?.marked;
    // 日付の色を取得（iOS風）
    const dayColor = getIOSDayColor(theme, date?.dateString, state, isSelected);

    return (
      <TouchableOpacity
        style={[
          styles.dayContainer,
          dynamicStyles.dayContainer,
          {
            // 選択セル・その右隣セルはボーダーなし
            borderLeftWidth:
              isSelected || (marking as any)?.afterSelected ||
              (date && date.dateString &&
                (new Date(date.dateString).getDay() === 0 || state === "today"))
                ? 0 : 1,
            borderLeftColor: "#E5E5E5",
            borderRightWidth: 0,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            borderRadius: 0,
            backgroundColor: isSelected ? "#007AFF" : "transparent",
          },
        ]}
        onPress={() => date && onPress(date.dateString)}
        activeOpacity={isSelected ? 0.8 : 0.6}
      >
        <Text
          style={[
            styles.dayText,
            dynamicStyles.dayText,
            {
              color: isSelected ? "#fff" : dayColor,
              fontFamily: APP_FONT_FAMILY,
              fontWeight: isToday ? "700" : "500",
              fontSize: isToday ? 20 : 18,
              backgroundColor:
                isToday && !isSelected ? "#F2F6FF" : "transparent",
              borderRadius: 8,
              paddingHorizontal: 2,
              paddingVertical: 1,
            },
          ]}
        >
          {date?.day}
        </Text>
        {/* 複数ドット対応 */}
        {marking?.dots && marking.dots.length > 0 ? (
          <View style={styles.dotsContainer}>
            {marking.dots.map((dot: any, index: number) => (
              <View
                key={dot.key || index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: dot.color,
                    marginHorizontal: 1,
                  },
                ]}
              />
            ))}
          </View>
        ) : (
          hasMarker && <View style={[styles.dot, marking.dotStyle]} />
        )}
      </TouchableOpacity>
    );
  }
);
