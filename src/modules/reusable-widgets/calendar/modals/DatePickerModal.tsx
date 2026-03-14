/**
 * @file DatePickerModal.tsx
 * @description 年→月→日のステップ式日付ピッカーモーダル。
 *              ユーザーがまず年を選び、次に月を選び、最後に日を選ぶ3段階のUIを提供する。
 *              年・月の選択画面は内部コンポーネント（YearPicker, MonthPicker）として分離されている。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react, react-native, date-fns, スタイル/型/テーマ, ShiftDateSelector
// インポート先: ShiftCalendar.tsx（カレンダーの月ナビゲーションから呼ばれる）

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback, // タッチイベントを受け取るが視覚的フィードバックなし
} from "react-native";
// format: 日付を指定フォーマットの文字列に変換するdate-fnsの関数
import { format } from "date-fns";
// カスタムScrollViewコンポーネント（年リストのスクロールに使用）
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
// ShiftDateSelector: 日付のカレンダー選択UI（日選択ステップで使用）
import ShiftDateSelector from "@/modules/user-view/user-shift-forms/ShiftDateSelector";
import { createDatePickerModalStyles } from "./DatePickerModal.styles";
import {
  DatePickerModalProps,
  YearPickerProps,
  MonthPickerProps,
} from "./DatePickerModal.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";

// ============================================================
// YearPicker - 年選択コンポーネント
// ============================================================

/**
 * YearPicker
 *
 * 現在年の前後5年（計11年）をリスト表示し、タップで年を選択する内部コンポーネント。
 *
 * Props:
 *   - tempDate:     現在の一時日付（選択中の年をハイライトする基準）
 *   - onYearSelect: 年が選択されたときのコールバック
 *   - onCancel:     キャンセルボタンのコールバック
 */
const YearPicker: React.FC<YearPickerProps> = ({
  tempDate,
  onYearSelect,
  onCancel,
}) => {
  const styles = useThemedStyles(createDatePickerModalStyles);

  // 年の配列を生成（現在の年から前後5年 = 計11年分）
  // Array.from({ length: 11 }, (_, i) => ...) は配列生成のイディオム:
  //   - { length: 11 } で要素数11の配列を作る
  //   - (_, i) のコールバックで各要素の値を決める
  //   - _ は「使わない引数」の慣習的な名前
  //   - i はインデックス（0〜10）
  //   - currentYear - 5 + i で「5年前」から「5年後」まで
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // --- Render ---
  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>年を選択</Text>
      {/* CustomScrollView でリストをスクロール可能にする */}
      <CustomScrollView style={styles.pickerContainer}>
        {years.map((year) => (
          <TouchableOpacity
            key={year} // key: Reactのリストレンダリングに必要な一意キー
            style={[
              styles.pickerItem,
              // 現在の年と一致する行にハイライトスタイルを適用
              // `&&` の短絡評価: 左が true のとき右を返す、false のとき false を返す
              year === tempDate.getFullYear() && styles.selectedItem,
            ]}
            onPress={() => onYearSelect(year)}
          >
            <Text
              style={[
                styles.pickerText,
                year === tempDate.getFullYear() && styles.selectedText,
              ]}
            >
              {year}年
            </Text>
          </TouchableOpacity>
        ))}
      </CustomScrollView>
      {/* キャンセルボタン */}
      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
          <Text style={styles.modalButtonText}>キャンセル</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================
// MonthPicker - 月選択コンポーネント
// ============================================================

/**
 * MonthPicker
 *
 * 1月〜12月をグリッド表示し、タップで月を選択する内部コンポーネント。
 *
 * Props:
 *   - tempDate:      現在の一時日付（選択中の月をハイライトする基準）
 *   - onMonthSelect: 月が選択されたときのコールバック（1〜12の数値）
 *   - onBack:        「戻る」ボタンのコールバック
 */
const MonthPicker: React.FC<MonthPickerProps> = ({
  tempDate,
  onMonthSelect,
  onBack,
}) => {
  const styles = useThemedStyles(createDatePickerModalStyles);

  // 1〜12の月配列を生成
  // Array.from({ length: 12 }, (_, i) => i + 1) → [1, 2, 3, ..., 12]
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // --- Render ---
  return (
    <View style={styles.modalContent}>
      {/* テンプレートリテラルで年を表示 */}
      <Text style={styles.modalTitle}>{tempDate.getFullYear()}年 月を選択</Text>
      {/* monthGrid: flexWrap="wrap" でグリッド表示 */}
      <View style={styles.monthGrid}>
        {months.map((month) => (
          <TouchableOpacity
            key={month}
            style={[
              styles.monthItem,
              // getMonth() は0始まり（0=1月）なので +1 して比較
              month === tempDate.getMonth() + 1 && styles.selectedItem,
            ]}
            onPress={() => onMonthSelect(month)}
          >
            <Text
              style={[
                styles.monthItemText,
                month === tempDate.getMonth() + 1 && styles.selectedText,
              ]}
            >
              {month}月
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* 戻るボタン */}
      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.modalButton} onPress={onBack}>
          <Text style={styles.modalButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================
// DatePickerModal - メインの日付ピッカーモーダル
// ============================================================

/**
 * DatePickerModal
 *
 * 年→月→日の3ステップで日付を選択するモーダル。
 * 内部状態で「現在どのステップか」を管理し、対応するピッカーを表示する。
 *
 * 処理フロー:
 *   1. モーダルが開くと年選択画面を表示（showYearPicker=true）
 *   2. 年を選択 → 月選択画面に遷移（showMonthPicker=true）
 *   3. 月を選択 → 日選択画面に遷移（showDayPicker=true）
 *   4. 日を選択 → onSelect コールバックで親に通知し、モーダルを閉じる
 *
 * Props:
 *   - isVisible:   モーダルの表示/非表示
 *   - initialDate: 初期表示日付
 *   - onClose:     閉じるコールバック
 *   - onSelect:    日付確定コールバック
 */
export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isVisible,
  initialDate,
  onClose,
  onSelect,
}) => {
  const styles = useThemedStyles(createDatePickerModalStyles);

  // --- State ---

  // useState<Date>: Date型の状態を管理。tempDate は選択途中の一時的な日付
  const [tempDate, setTempDate] = useState<Date>(initialDate);

  // 3つのboolean状態でどのピッカーを表示するか管理
  // 同時に1つだけ true になる排他的な設計
  const [showYearPicker, setShowYearPicker] = useState(true);   // 年選択画面を表示中か
  const [showMonthPicker, setShowMonthPicker] = useState(false); // 月選択画面を表示中か
  const [showDayPicker, setShowDayPicker] = useState(false);     // 日選択画面を表示中か

  // --- Effects ---

  /**
   * useEffect: isVisible が変わったとき（モーダルが開いたとき）に実行される。
   *
   * useEffect(コールバック, [依存配列]):
   *   - 依存配列の値が変化するたびにコールバックが実行される
   *   - ここでは isVisible か initialDate が変わったとき
   *
   * モーダルが開くたびに状態を初期化する（年選択画面から開始）。
   */
  useEffect(() => {
    if (isVisible) {
      setTempDate(initialDate);      // 一時日付を初期値に戻す
      setShowYearPicker(true);       // 年選択から開始
      setShowMonthPicker(false);
      setShowDayPicker(false);
    }
  }, [initialDate, isVisible]);

  // --- Handlers ---

  /**
   * handleYearSelect - 年が選択されたときの処理
   *
   * 1. tempDate のコピーを作成（元のオブジェクトを変更しないため）
   * 2. setFullYear() で年を設定
   * 3. 年選択を閉じて月選択を表示
   */
  const handleYearSelect = (year: number) => {
    const newDate = new Date(tempDate); // Date のコピーを作成
    newDate.setFullYear(year);           // 年を設定
    setTempDate(newDate);
    setShowYearPicker(false);            // 年選択を閉じる
    setShowMonthPicker(true);            // 月選択を開く
  };

  /**
   * handleMonthSelect - 月が選択されたときの処理
   *
   * month は 1〜12 で渡されるが、setMonth() は 0〜11 を期待するので -1 する。
   */
  const handleMonthSelect = (month: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(month - 1);         // 1始まり → 0始まりに変換
    setTempDate(newDate);
    setShowMonthPicker(false);
    setShowDayPicker(true);              // 日選択を開く
  };

  /**
   * handleDaySelect - 日が選択されたときの処理
   *
   * dateString は "YYYY-MM-DD" 形式の文字列。
   * split("-") で年・月・日に分割し、.map(Number) で数値に変換する。
   *
   * 分割代入 [y, m, d] で各値を取得。
   * ?? はNullish合体演算子: 左が null/undefined のとき右の値を使う（0や空文字はそのまま）。
   * || との違い: || は falsy値（0, ""）でも右を使うが、?? は null/undefined のみ。
   */
  const handleDaySelect = (dateString: string) => {
    const [y, m, d] = dateString.split("-").map(Number);
    // new Date(年, 月(0始まり), 日) でDateオブジェクトを生成
    const newDate = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
    setTempDate(newDate);
    onSelect(newDate);  // 親コンポーネントに選択日付を通知
    onClose();          // モーダルを閉じる
  };

  /**
   * handleClose - モーダルを閉じて年選択画面にリセットする
   */
  const handleClose = () => {
    onClose();
    setShowYearPicker(true);
    setShowMonthPicker(false);
    setShowDayPicker(false);
  };

  // --- Render ---

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* 外側タップで閉じる */}
      {/* TouchableWithoutFeedback: 視覚的フィードバックなしでタッチを検知 */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          {/* 内側タップではモーダルを閉じないようにする */}
          {/* onPress={() => {}} で空のハンドラを設定し、イベントの伝搬を止める */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              {/* ステップ1: 年選択 */}
              {/* 条件付きレンダリング: showYearPicker が true のときだけ表示 */}
              {showYearPicker && (
                <YearPicker
                  tempDate={tempDate}
                  onYearSelect={handleYearSelect}
                  onCancel={handleClose}
                />
              )}
              {/* ステップ2: 月選択 */}
              {showMonthPicker && (
                <MonthPicker
                  tempDate={tempDate}
                  onMonthSelect={handleMonthSelect}
                  onBack={() => {
                    // 月選択から年選択に戻る
                    setShowMonthPicker(false);
                    setShowYearPicker(true);
                  }}
                />
              )}
              {/* ステップ3: 日選択 */}
              {showDayPicker && (
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {tempDate.getFullYear()}年{tempDate.getMonth() + 1}月
                    日を選択
                  </Text>
                  {/* ShiftDateSelector: カレンダーUIで日付を選択するコンポーネント */}
                  <ShiftDateSelector
                    selectedDate={format(tempDate, "yyyy-MM-dd")} // date-fns で "2026-03-10" 形式に変換
                    onSelect={handleDaySelect}
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        // 日選択から月選択に戻る
                        setShowDayPicker(false);
                        setShowMonthPicker(true);
                      }}
                    >
                      <Text style={styles.modalButtonText}>戻る</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
