import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { createSelectedDateListStyles } from "./SelectedDateList.styles";
import { SelectedDateListProps } from "./types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";

/**
 * SelectedDateList - 選択された日付のリスト表示コンポーネント
 *
 * 選択された日付を一覧表示し、個別に選択解除できる機能を提供します。
 */
const SelectedDateList: React.FC<SelectedDateListProps> = ({
  selectedDates,
  onRemove,
  onRemoveDate,
}) => {
  const styles = useThemedStyles(createSelectedDateListStyles);

  // 日付を「〇月〇日（曜日）」の形式でフォーマット
  const formatDateWithWeekday = (dateStr: string): string => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      weekday: "short",
    };
    return date.toLocaleDateString("ja-JP", options);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 選択済み日付</Text>
      {selectedDates.length === 0 && (
        <Text style={styles.noneText}>まだ日付が選択されていません</Text>
      )}
      {selectedDates.map((date) => (
        <View key={date} style={styles.item}>
          <Text style={styles.dateText}>{formatDateWithWeekday(date)}</Text>
          <TouchableOpacity onPress={() => onRemove?.(date) || onRemoveDate(date)}>
            <Text style={styles.removeText}>選択を解除</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default SelectedDateList;
