/**
 * @file CalendarModal.tsx
 * @description 複数日付を選択できるカレンダーモーダルコンポーネント。
 *              ユーザーが日付をタップして選択/解除し、「設定する」で確定する。
 *              react-native-calendars の Calendar コンポーネントをモーダル内に表示する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react, react-native, react-native-calendars, スタイル/型/テーマ
// インポート先: 他のモジュールから CalendarModal としてインポートされる
//              （シフト作成画面などで日付選択UIとして使用）

import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
// Calendar: react-native-calendars が提供するカレンダーコンポーネント
import { Calendar } from "react-native-calendars";
import { createCalendarModalStyles } from "./CalendarModal.styles";
import { CalendarModalProps } from "./CalendarModal.types";
import { colors } from "@/common/common-theme/ThemeColors";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";

/**
 * CalendarModal コンポーネント
 *
 * 日付選択のためのモーダルUIを提供する。
 * 複数日付の選択に対応し、選択された日付はハイライト表示される。
 *
 * React.FC<CalendarModalProps> は「CalendarModalProps を受け取る関数コンポーネント」の型。
 * FC は FunctionComponent の略。
 *
 * Props:
 *   - visible:      モーダルを表示するか
 *   - onClose:      閉じるコールバック
 *   - onConfirm:    確定コールバック（選択日付の配列を渡す）
 *   - initialDates: 初期選択日付（デフォルト引数 = [] で空配列）
 *                   `= []` はデフォルト引数。Props が省略された場合に空配列を使う。
 */
const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDates = [], // デフォルト引数: 省略時は空配列
}) => {
  // --- Hooks ---

  // useThemedStyles: テーマに応じたスタイルを生成して返すフック
  const styles = useThemedStyles(createCalendarModalStyles);

  // --- State ---

  // useState<string[]>: string配列型の状態を管理する
  // selectedDates: 現在選択中の日付配列
  // setSelectedDates: selectedDates を更新する関数
  const [selectedDates, setSelectedDates] =
    React.useState<string[]>(initialDates);

  // --- Memoized Values ---

  /**
   * markedDates - カレンダーに渡すマーキングデータ
   *
   * useMemo: selectedDates が変わったときだけ再計算する。
   *
   * react-native-calendars の markedDates は以下の形式:
   * { "2026-03-10": { selected: true, selectedColor: "#..." }, ... }
   *
   * 処理ステップ:
   *   1. 空のオブジェクトを作成
   *   2. 選択日付ごとに selected: true と色を設定
   *   3. 完成したオブジェクトを返す
   */
  const markedDates = React.useMemo(() => {
    // `{ [key: string]: any }` は「任意のstring型キーを持ち、値はany型」のオブジェクト型
    const marked: { [key: string]: any } = {};
    // forEach: 配列の各要素に対して関数を実行する
    selectedDates.forEach((date) => {
      marked[date] = {
        selected: true,
        selectedColor: colors.primary, // 選択色をプライマリ色に設定
      };
    });
    return marked;
  }, [selectedDates]); // selectedDates が変わったときだけ再計算

  // --- Handlers ---

  /**
   * handleDayPress - 日付がタップされたときの処理
   *
   * 選択済みの日付をタップ → 選択解除（配列から除去）
   * 未選択の日付をタップ → 選択追加（配列に追加）
   *
   * setSelectedDates に関数を渡す書き方（関数型更新）:
   *   prev は「更新前の状態値」。現在の状態に基づいて新しい状態を計算する場合に使う。
   */
  const handleDayPress = (day: any) => {
    setSelectedDates((prev) => {
      // includes(): 配列に指定した要素が含まれているかチェック
      const dateExists = prev.includes(day.dateString);
      if (dateExists) {
        // filter(): 条件に合う要素だけを残した新しい配列を返す
        // ここでは「タップした日付以外」を残す = その日付を除去
        return prev.filter((date) => date !== day.dateString);
      } else {
        // スプレッド構文 [...prev] で既存の配列をコピーし、新しい日付を末尾に追加
        return [...prev, day.dateString];
      }
    });
  };

  /**
   * handleConfirm - 「設定する」ボタンを押したときの処理
   *
   * 親コンポーネントに選択された日付を通知し、モーダルを閉じる。
   */
  const handleConfirm = () => {
    onConfirm(selectedDates); // 親に選択日付を渡す
    onClose();                // モーダルを閉じる
  };

  /**
   * renderHeader - カレンダーのヘッダー（年月表示）をカスタム描画する関数
   *
   * react-native-calendars の renderHeader プロパティに渡すと、
   * デフォルトのヘッダーの代わりにこの関数の戻り値が表示される。
   *
   * @param date - Date オブジェクト（現在表示中の月の情報）
   */
  const renderHeader = (date: Date) => {
    // getFullYear(): 年を取得, getMonth(): 月を取得（0始まりなので+1する）
    const month = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    return (
      <View style={styles.calendarHeader}>
        <Text style={styles.monthText}>{month}</Text>
      </View>
    );
  };

  // --- Render ---

  return (
    // Modal: React Native の組み込みモーダルコンポーネント
    // transparent: 背景を透明にする（自前のoverlayスタイルで半透明背景を実装）
    // animationType="fade": フェードイン/アウトのアニメーション（他: "slide", "none"）
    // onRequestClose: Androidの戻るボタンで閉じるためのハンドラ
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 半透明オーバーレイ */}
      <View style={styles.overlay}>
        {/* モーダル本体 */}
        <View style={styles.content}>
          {/* ヘッダー: タイトル + 選択数 + 閉じるボタン */}
          <View style={styles.header}>
            <Text style={styles.title}>日付を選択</Text>
            <Text style={styles.subtitle}>{selectedDates.length}日選択中</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* カレンダー本体（react-native-calendars） */}
          <Calendar
            markedDates={markedDates}        // マーキングデータ（選択日付のハイライト）
            onDayPress={handleDayPress}      // 日付タップ時のハンドラ
            enableSwipeMonths                // スワイプで月を切り替え可能にする
            style={styles.calendar}          // カレンダー外観スタイル
            renderHeader={renderHeader}      // カスタムヘッダー
            // theme: カレンダー内部の色設定。react-native-calendarsの専用テーマ設定
            theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.background,
              textSectionTitleColor: colors.text.secondary,     // 曜日ヘッダーの色
              selectedDayBackgroundColor: colors.primary,        // 選択日の背景色
              selectedDayTextColor: colors.text.white,           // 選択日のテキスト色
              todayTextColor: colors.primary,                    // 今日の日付色
              dayTextColor: colors.text.primary,                 // 通常の日付色
              textDisabledColor: colors.text.disabled,           // 無効な日付色
              dotColor: colors.primary,                          // ドットの色
              selectedDotColor: colors.text.white,               // 選択日のドット色
              arrowColor: colors.text.primary,                   // 矢印の色
              monthTextColor: colors.text.primary,               // 月テキスト色
              textMonthFontSize: 16,
              textDayFontSize: 14,
              textDayHeaderFontSize: 12,
            }}
          />

          {/* フッター: キャンセル / 設定するボタン */}
          <View style={styles.footer}>
            <TouchableOpacity
              // style={[A, B]}: 複数スタイルの結合（ボタン共通 + キャンセル固有）
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>設定する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// default export: このファイルをインポートするとき import CalendarModal from "..." と書ける
export default CalendarModal;
