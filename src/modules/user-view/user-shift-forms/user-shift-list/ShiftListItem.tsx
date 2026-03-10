/** @file ShiftListItem.tsx
 *  @description シフト一覧の1行を表示するコンポーネント。
 *    日付、ニックネーム（マスター用）、ステータスバッジ、時間、
 *    詳細展開ボタンを横並びで表示する。
 *    React.memo でラップしてメモ化されている。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React / React Native / AntDesign / date-fns /
 *          useMD3Theme / useBreakpoint / types / styles
 *  - 利用先: ShiftListView（UserShiftList）内でシフト一覧の各行として表示
 *
 *  【コンポーネント概要】
 *  - 表示内容: [日付] [ニックネーム?] [ステータス] [時間] [詳細ボタン]
 *  - 主要Props: shift, isSelected, selectedDate, onPress, onDetailsPress,
 *               children（展開時の詳細ビュー）, showNickname
 */
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { ShiftListItemProps } from "./types";
import { createShiftListItemStyles } from "./styles";

const ShiftListItemComponent: React.FC<ShiftListItemProps> = ({
  shift,
  isSelected,
  selectedDate,
  onPress,
  onDetailsPress,
  children,
  showNickname = false,
}) => {
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  // useMemo でテーマ・ブレークポイントが変わった時だけスタイルを再生成
  const styles = useMemo(
    () => createShiftListItemStyles(theme, bp),
    [theme, bp]
  );

  // --- Render ---
  return (
    <View style={{ width: "100%" }}>
      <View
        style={[
          styles.shiftItem,
          { borderColor: theme.colorScheme.shift[shift.status] },
          shift.date === selectedDate && styles.selectedShiftItem,
        ]}
      >
        <TouchableOpacity style={styles.shiftContent} onPress={onPress}>
          <View style={styles.textContainer}>
            <View style={styles.shiftInfoContainer}>
              {/* 日付 */}
              <View style={styles.dateContainer}>
                <Text style={styles.dateText} numberOfLines={1}>
                  {format(new Date(shift.date), "d日(E)", {
                    locale: ja,
                  })}
                </Text>
              </View>
              {/* マスター用: ニックネーム */}
              {showNickname && shift.nickname && (
                <View style={styles.nicknameContainer}>
                  <Text style={styles.nicknameText} numberOfLines={1}>
                    {shift.nickname}
                  </Text>
                </View>
              )}
              {/* ステータス */}
              <View style={styles.statusContainer}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.userLabel,
                    {
                      backgroundColor:
                        theme.colorScheme.shift[shift.status] + "20",
                      color: theme.colorScheme.shift[shift.status],
                    },
                  ]}
                >
                  {shift.status === "draft"
                    ? "下書き"
                    : shift.status === "approved"
                    ? "承認済"
                    : shift.status === "pending"
                    ? "承認待ち"
                    : shift.status === "rejected"
                    ? "却下"
                    : shift.status === "deletion_requested"
                    ? "削除申請中"
                    : shift.status === "deleted"
                    ? "削除済"
                    : shift.status === "completed"
                    ? "完了"
                    : ""}
                </Text>
              </View>
              {/* 時間 */}
              <Text
                numberOfLines={1}
                style={[
                  styles.timeText,
                  bp.isMobile && styles.smallTimeText,
                ]}
              >
                {shift.startTime}~{shift.endTime}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton} onPress={onDetailsPress}>
          <AntDesign
            name={isSelected ? "down" : "right"}
            size={bp.isMobile ? 12 : 14}
            color={theme.colorScheme.onSurfaceVariant}
            style={styles.detailsIcon}
          />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
};

/**
 * React.memo でメモ化。
 * Props が変わらなければ再レンダリングをスキップし、パフォーマンスを向上させる。
 */
export const ShiftListItem = React.memo(ShiftListItemComponent);
