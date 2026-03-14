/**
 * @file ShiftList.tsx
 * @description カレンダー下部に表示するシフト一覧コンポーネント（簡易版）。
 *              選択された日付のシフトをフィルタリングし、展開/折りたたみ可能なリストで表示する。
 *              独自のStyleSheet.createでスタイルを定義している（テーマ非依存）。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react, react-native, @expo/vector-icons, date-fns,
//              calendar.utils（ステータス色・テキスト）, ShiftList.types,
//              ShiftListAdapter（詳細表示アダプター）, ScrollViewComponent
// インポート先: ShiftCalendar.tsx（コメントアウトされているが、直接使われる可能性あり）

import React, { useState, useMemo, memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// AntDesign: Ant Design のアイコンセット。@expo/vector-icons はExpoが提供するアイコンライブラリ
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  getStatusColor,
  getStatusText,
} from "../calendar-utils/calendar.utils";
import { ShiftListProps } from "./ShiftList.types";
import { ShiftItemProps } from "./ShiftList.types";
// getPlatformShadow: プラットフォーム（Web/iOS/Android）ごとに適切な影スタイルを返すユーティリティ
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleHelpers";
// ShiftDetailsAdapter: ShiftDetails をラップして表示/非表示を制御するアダプター
import { ShiftDetailsAdapter } from "./ShiftListAdapter";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";

// ============================================================
// ShiftItem - 個別のシフトアイテムコンポーネント
// ============================================================

/**
 * ShiftItem
 *
 * シフト1件分を表示するコンポーネント。
 * タップで詳細を展開/折りたたみできる。
 *
 * memo() でメモ化: Props が変わらない限り再レンダリングをスキップする。
 * リスト内の個別アイテムはメモ化することで、他のアイテムの変更時に不要な再レンダリングを防ぐ。
 *
 * Props:
 *   - shift:      シフトデータ
 *   - isExpanded: 詳細が展開中か
 *   - onToggle:   展開/折りたたみのトグル関数
 */
const ShiftItem = memo(({ shift, isExpanded, onToggle }: ShiftItemProps) => {
  // シフトステータスに応じた枠線色を取得
  const borderColor = getStatusColor(shift.status);

  // --- Render ---
  return (
    <View key={shift.id} style={styles.shiftItemContainer}>
      {/* シフトヘッダー（タップで詳細の開閉を切り替え） */}
      <TouchableOpacity
        // style={[A, B]}: 複数スタイルの結合。B のプロパティが A を上書きする
        // { borderColor } は { borderColor: borderColor } のショートハンド（プロパティ省略記法）
        style={[styles.shiftHeader, { borderColor }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.shiftHeaderContent}>
          {/* ユーザーアイコン */}
          <AntDesign name="user" size={16} color={borderColor} />
          {/* 日付テキスト。numberOfLines={1} で1行に制限（溢れたら省略記号...） */}
          <Text style={styles.dateText} numberOfLines={1}>
            {format(new Date(shift.date), "d日(E)", {
              locale: ja,
            })}
          </Text>
          {/* ステータステキスト（ステータス色で表示） */}
          <Text
            style={[styles.statusText, { color: borderColor }]}
            numberOfLines={1}
          >
            {getStatusText(shift.status)}
          </Text>
          {/* シフト時間 */}
          <Text style={styles.shiftTime} numberOfLines={1}>
            {shift.startTime} ~ {shift.endTime}
          </Text>
        </View>
        {/* 展開/折りたたみの矢印アイコン */}
        {/* 三項演算子で上向き/下向きアイコンを切り替え */}
        <AntDesign
          name={isExpanded ? "up" : "down"}
          size={14}
          color={colors.text.primary}
          style={styles.expandIcon}
        />
      </TouchableOpacity>
      {/* シフト詳細（アダプター経由で ShiftDetails を表示） */}
      <ShiftDetailsAdapter shift={shift} isOpen={isExpanded} />
    </View>
  );
});

// ============================================================
// ShiftList - シフトリストコンポーネント
// ============================================================

/**
 * ShiftList
 *
 * 選択された日付のシフトをフィルタリングして一覧表示するコンポーネント。
 *
 * Props:
 *   - shifts:       全シフトデータの配列
 *   - selectedDate: 選択中の日付（この日付のシフトだけ表示する）
 */
export const ShiftList: React.FC<ShiftListProps> = ({
  shifts,
  selectedDate,
}) => {
  // --- State ---

  /**
   * expandedShifts - 各シフトの展開/折りたたみ状態を管理する
   *
   * `{ [key: string]: boolean }` は「任意のstringキーにboolean値」のオブジェクト型。
   * 例: { "shift-001": true, "shift-002": false }
   *
   * true = そのシフトの詳細が展開されている
   */
  const [expandedShifts, setExpandedShifts] = useState<{
    [key: string]: boolean;
  }>({});

  // --- Memoized Values ---

  /**
   * filteredShifts - 選択日付のシフトだけをフィルタリングした配列
   *
   * useMemo: shifts か selectedDate が変わったときだけ再計算。
   * filter(): 条件に合う要素だけを残した新しい配列を返す。
   */
  const filteredShifts = useMemo(
    () => shifts.filter((shift) => shift.date === selectedDate),
    [shifts, selectedDate]
  );

  // --- Handlers ---

  /**
   * toggleShiftDetails - シフトの展開/折りたたみを切り替える
   *
   * スプレッド構文 ...prev で既存の状態をコピーし、
   * 対象のシフトIDのboolean値を反転（! で否定）する。
   *
   * @param shiftId - 展開/折りたたみを切り替えるシフトのID
   */
  const toggleShiftDetails = (shiftId: string) => {
    setExpandedShifts((prev) => ({
      ...prev,
      [shiftId]: !prev[shiftId], // [shiftId] は算出プロパティ名（動的なキー指定）
    }));
  };

  // --- Early Return ---

  // シフトがない場合は何も表示しない
  if (filteredShifts.length === 0) {
    return null; // null を返すと何もレンダリングされない
  }

  // --- Render ---

  return (
    <CustomScrollView style={styles.shiftList}>
      {filteredShifts.map((shift) => (
        <ShiftItem
          key={shift.id}
          shift={shift}
          // expandedShifts[shift.id] が undefined の場合 false をフォールバック
          isExpanded={expandedShifts[shift.id] || false}
          // アロー関数でシフトIDを渡す（クロージャでshift.idをキャプチャ）
          onToggle={() => toggleShiftDetails(shift.id)}
        />
      ))}
    </CustomScrollView>
  );
};

// --- 静的スタイル定義 ---
// テーマに依存しないため、コンポーネント外で StyleSheet.create を使用。
// テーマ依存のスタイルは ShiftList.styles.ts にある（ShiftListView 用）。
const styles = StyleSheet.create({
  // シフトリスト全体
  shiftList: {
    width: "70%",         // 親要素の70%幅
    padding: 8,
    alignSelf: "center",  // 自身を水平方向中央揃え
  },
  // シフト1件のコンテナ
  shiftItemContainer: {
    marginBottom: 8,
    width: "70%",
  },
  // 展開/折りたたみアイコン
  expandIcon: {
    marginLeft: 4,
  },
  // シフトヘッダー（タップ可能な部分）
  shiftHeader: {
    flexDirection: "row",           // 横並び
    justifyContent: "space-between", // 左右端に配置
    alignItems: "center",
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 6,
    marginBottom: 6,
    marginHorizontal: 3,
    borderWidth: 1,
    ...getPlatformShadow(1),        // プラットフォーム固有の影スタイル
  },
  // シフトヘッダー内のコンテンツ
  shiftHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",               // 折り返しを許可（小さい画面で改行）
    gap: 8,                         // 要素間の間隔
  },
  // ステータステキスト
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  // シフト時間テキスト
  shiftTime: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.text.primary,
    flexShrink: 1,                  // スペースが足りないときに縮小を許可
  },
  // 日付テキスト
  dateText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.primary,
    marginLeft: 3,
  },
  // ユーザーラベル（現在未使用だがスタイル定義は残っている）
  userLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
  },
});
