import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { styles, getStatusColor } from "./ShiftList.styles";
import { ShiftListProps, ShiftTypeMap } from "./ShiftList.types";
import { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";

/**
 * ShiftList - シフト一覧表示コンポーネント
 *
 * シフト情報のリストを表示し、各シフトの詳細情報を開閉式で確認できるコンポーネント。
 * シフトの状態（下書き、承認待ち、承認済み、完了、削除済み）に応じて視覚的に区別されます。
 */
export const ShiftList: React.FC<ShiftListProps> = ({ shifts }) => {
  // シフトタイプに応じたテキストを取得する関数
  const getShiftTypeText = (type: ShiftTypeMap) => {
    switch (type) {
      case "user":
        return "ユーザー";
      case "class":
        return "講師";
      case "deleted":
        return "削除済み";
      default:
        return "";
    }
  };

  // シフトステータスに応じたテキストを取得する関数
  const getStatusText = (status: ShiftStatus) => {
    switch (status) {
      case "draft":
        return "未実施";
      case "pending":
        return "申請許可待ち";
      case "approved":
        return "承認済み";

      case "deleted":
        return "削除済み";
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      {shifts.map((shift) => (
        <View
          key={shift.id}
          style={[
            styles.shiftItem,
            { borderColor: getStatusColor(shift.status) },
          ]}
        >
          <View style={styles.shiftInfo}>
            <Text style={styles.dateTime}>
              {format(new Date(shift.date), "M月d日(E)", { locale: ja })}{" "}
              {format(new Date(shift.startTime), "HH:mm")}
              {" ~ "}
              {format(new Date(shift.endTime), "HH:mm")}
            </Text>
            <Text style={styles.shiftType}>
              {getShiftTypeText(shift.type as ShiftTypeMap)}
            </Text>
          </View>
          <View style={styles.rightContainer}>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(shift.status) },
              ]}
            >
              {getStatusText(shift.status)}
            </Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>詳細</Text>
              <AntDesign name="down" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {shift.requestedChanges && shift.requestedChanges[0] && (
            <View style={styles.changesContainer}>
              <Text style={styles.changesTitle}>変更申請内容:</Text>
              {shift.requestedChanges[0].startTime && (
                <Text style={styles.changesText}>
                  開始時間: {shift.requestedChanges[0].startTime}
                </Text>
              )}
              {shift.requestedChanges[0].endTime && (
                <Text style={styles.changesText}>
                  終了時間: {shift.requestedChanges[0].endTime}
                </Text>
              )}
              {shift.requestedChanges[0].date && (
                <Text style={styles.changesText}>
                  日付:
                  {format(
                    new Date(shift.requestedChanges[0].date),
                    "yyyy年M月d日(E)",
                    { locale: ja }
                  )}
                </Text>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};
