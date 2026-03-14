/**
 * @file ShiftListView.tsx
 * @description テーマ対応版のシフト一覧表示コンポーネント。
 *              ShiftList.tsx の簡易版と異なり、MD3テーマのスタイルを使用する。
 *              シフトのステータスに応じた色分け、変更申請内容の表示に対応する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react, react-native, @expo/vector-icons, date-fns,
//              ShiftList.styles（テーマ対応スタイル）, ShiftList.types, ModelIndex（型）,
//              テーマ関連フック
// インポート先: カレンダー関連画面から使用される可能性がある

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { createShiftListStyles, getStatusColor } from "./ShiftList.styles";
import { ShiftListProps, ShiftTypeMap } from "./ShiftList.types";
import { ShiftStatus } from "@/common/common-models/ModelIndex";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

/**
 * ShiftList コンポーネント（テーマ対応版）
 *
 * シフト情報のリストを表示し、各シフトのステータスに応じた色分けを行う。
 * 変更申請（requestedChanges）がある場合はその内容も表示する。
 *
 * Props:
 *   - shifts: 表示するシフトの配列
 *   ※ selectedDate は ShiftListProps に含まれるが、このコンポーネントでは未使用
 */
export const ShiftList: React.FC<ShiftListProps> = ({ shifts }) => {
  // --- Hooks ---

  // useMD3Theme: 現在のMD3テーマ全体を取得
  const theme = useMD3Theme();
  // useThemedStyles: テーマに応じたスタイルを生成
  const styles = useThemedStyles(createShiftListStyles);

  // --- Helper Functions ---

  /**
   * getShiftTypeText - シフトタイプの内部値を日本語に変換する
   *
   * ShiftTypeMap 型のパラメータを受け取る（"user" | "class" | "deleted"）。
   * `as ShiftTypeMap` は型アサーション。shift.type が string 型のため、
   * ShiftTypeMap に変換してこの関数に渡す必要がある。
   */
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

  /**
   * getStatusText - ステータスの内部値を日本語に変換する
   *
   * ※ calendar.utils.ts にも同名の関数があるが、テキストが微妙に異なる
   *    （例: "draft" → ここでは "未実施"、utils では "下書き"）
   */
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

  // --- Render ---

  return (
    <View style={styles.container}>
      {/* shifts.map(): 配列の各要素をJSXに変換して表示 */}
      {shifts.map((shift) => (
        <View
          key={shift.id}
          style={[
            styles.shiftItem,
            // ステータス色でボーダーカラーを設定
            { borderColor: getStatusColor(theme, shift.status) },
          ]}
        >
          {/* シフト情報（左側） */}
          <View style={styles.shiftInfo}>
            <Text style={styles.dateTime}>
              {/* format() で "3月10日(火) 09:00 ~ 18:00" のような形式に */}
              {format(new Date(shift.date), "M月d日(E)", { locale: ja })}{" "}
              {format(new Date(shift.startTime), "HH:mm")}
              {" ~ "}
              {format(new Date(shift.endTime), "HH:mm")}
            </Text>
            <Text style={styles.shiftType}>
              {/* shift.type を ShiftTypeMap 型にキャスト（as）して関数に渡す */}
              {getShiftTypeText(shift.type as ShiftTypeMap)}
            </Text>
          </View>

          {/* ステータス情報（右側） */}
          <View style={styles.rightContainer}>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(theme, shift.status) },
              ]}
            >
              {getStatusText(shift.status)}
            </Text>
            {/* 詳細ボタン */}
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>詳細</Text>
              <AntDesign name="down" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* 変更申請内容の表示（requestedChanges が存在する場合のみ） */}
          {/* && の短絡評価を2重に使用: requestedChanges が存在 && 最初の要素が存在 */}
          {shift.requestedChanges && shift.requestedChanges[0] && (
            <View style={styles.changesContainer}>
              <Text style={styles.changesTitle}>変更申請内容:</Text>
              {/* 各フィールドが存在する場合のみ表示 */}
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
