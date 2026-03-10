/**
 * @file user/shifts/create.tsx
 * @description ユーザーのシフト作成/編集画面。
 *
 * 【URLパラメータの受け渡し】
 * useLocalSearchParams() でURLのクエリパラメータを取得する。
 * 例: /(main)/user/shifts/create?mode=edit&shiftId=abc&date=2025-03-10
 *     → { mode: "edit", shiftId: "abc", date: "2025-03-10" }
 *
 * デフォルト値: mode="create"（パラメータがない場合は新規作成モード）
 * ShiftCreateForm にこれらのパラメータを渡してフォームを初期化する。
 */

import React from "react";
import { View, StyleSheet } from "react-native";
// useLocalSearchParams: URLクエリパラメータを取得するExpo Routerフック
import { useLocalSearchParams } from "expo-router";
// ShiftCreateForm: シフト作成/編集フォームのUIコンポーネント
import { ShiftCreateForm } from "@/modules/user-view/user-shift-forms/shiftCreate/ShiftCreateForm";
import { colors } from "@/common/common-constants/ThemeConstants";

/**
 * ShiftCreateScreen: シフト作成/編集画面。
 * URLパラメータからモード（create/edit）とシフト初期値を取得し、
 * ShiftCreateForm に渡す。
 */
export default function ShiftCreateScreen() {
  // デストラクチャリング + デフォルト値で URLパラメータを取得
  const {
    mode = "create",      // "create" or "edit"
    shiftId = "",         // 編集時のシフトID
    date,                 // 初期日付
    startTime,            // 初期開始時刻
    endTime,              // 初期終了時刻
    classes,              // 初期クラス情報
  } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* ShiftCreateForm: シフト作成/編集のフォームUIとバリデーション */}
      {/* as string でURLパラメータ（string | string[]）を string に変換 */}
      <ShiftCreateForm
        initialMode={mode as string}
        initialShiftId={shiftId as string}
        initialDate={date as string}
        initialStartTime={startTime as string}
        initialEndTime={endTime as string}
        initialClasses={classes as string}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
