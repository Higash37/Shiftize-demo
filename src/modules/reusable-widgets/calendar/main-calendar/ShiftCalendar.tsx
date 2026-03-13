/**
 * @file ShiftCalendar.tsx
 * @description メインのシフトカレンダーコンポーネント。
 *              react-native-calendars をベースに、カスタム日付セル（DayComponent）、
 *              月ナビゲーション（DateNavigator）、年月選択モーダル（DatePickerModal）を統合する。
 *              シフトデータからドットマーカーを自動生成し、ステータスに応じた色分けを行う。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react, react-native, react-native-calendars, date-fns,
//              カレンダーモジュール内の各コンポーネント・型・スタイル, テーマ関連
// インポート先: ユーザービュー、マスタービューなど、カレンダーを使う画面全般から使用される。
//              このファイルがカレンダーモジュールの中心コンポーネント。

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
// MarkedDates: react-native-calendars が内部で使う型。日付ごとのマーキング情報を保持する
import type { MarkedDates } from "react-native-calendars/src/types";
import { View, ViewStyle } from "react-native";
// format: Date オブジェクトを指定フォーマットの文字列に変換する（date-fns ライブラリ）
import { format } from "date-fns";
import { colors } from "@/common/common-theme/ThemeColors";
import { DayComponentProps } from "../calendar-types/common.types";
import { DayComponent } from "../day-view/DayComponent";
// DateNavigator: 前月/次月ボタンと年月ラベルを表示する共通ナビゲーションコンポーネント
import { DateNavigator } from "@/common/common-ui/ui-navigation/DateNavigator";

// --- ロケール設定 ---

/**
 * LocaleConfig の日本語設定
 *
 * react-native-calendars はデフォルトで英語表示。
 * LocaleConfig.locales に日本語の月名・曜日名を登録することで日本語化する。
 *
 * monthNames:     月切り替え時に表示するフルネーム
 * monthNamesShort: 短縮名（ここではフルネームと同じ）
 * dayNames:       曜日のフルネーム
 * dayNamesShort:  曜日の短縮名（カレンダーのヘッダー行に表示される）
 * today:          「今日」のラベル
 */
LocaleConfig.locales.ja = {
  monthNames: [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ],
  monthNamesShort: [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ],
  dayNames: [
    "日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日",
  ],
  dayNamesShort: ["日", "月", "火", "水", "木", "金", "土"],
  today: "今日",
};

// デフォルトロケールを日本語に設定
LocaleConfig.defaultLocale = "ja";

import { DatePickerModal } from "../modals/DatePickerModal";
import { useResponsiveCalendarSize } from "../constants";
import { createShiftCalendarStyles } from "./ShiftCalendar.styles";
import { ShiftCalendarProps } from "./ShiftCalendar.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";

// ============================================================
// ShiftCalendar コンポーネント
// ============================================================

/**
 * ShiftCalendar
 *
 * アプリのメインカレンダーコンポーネント。以下の機能を統合する:
 *   - カレンダー表示（react-native-calendars ベース）
 *   - カスタム日付セル（DayComponent）
 *   - シフトデータからのドットマーカー自動生成
 *   - 月ナビゲーション（DateNavigator）
 *   - 年月選択モーダル（DatePickerModal）
 *   - レスポンシブ対応（スケーリング）
 *
 * Props:
 *   - shifts:             シフトデータの配列
 *   - selectedDate:       選択中の日付
 *   - currentMonth:       表示中の月
 *   - currentUserStoreId: ユーザーの店舗ID
 *   - onDayPress:         日付タップ時のコールバック
 *   - onMonthChange:      月切り替え時のコールバック
 *   - markedDates:        外部から渡すマーキングデータ（propMarkedDates として受け取る）
 *   - onMount:            マウント時のコールバック
 *   - hideMonthNav:       月ナビゲーション非表示フラグ
 *   - responsiveSize:     レスポンシブサイズ設定
 */
export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  shifts,
  selectedDate,
  currentMonth,
  currentUserStoreId,
  onDayPress,
  onMonthChange,
  // `markedDates: propMarkedDates` はプロパティのリネーム（別名割り当て）。
  // Props名は markedDates だが、コンポーネント内部では propMarkedDates として使う。
  // 内部で生成する markedDates と名前が衝突するのを避けるため。
  markedDates: propMarkedDates,
  onMount,
  hideMonthNav,
  responsiveSize,
}) => {
  // --- State ---

  // useState<boolean>: 年月選択モーダルの表示/非表示
  const [showDatePicker, setShowDatePicker] = useState(false);
  // useState<Date>: 年月選択モーダルで使う一時的な日付
  const [tempDate, setTempDate] = useState<Date>(new Date(currentMonth));
  // useResponsiveCalendarSize: 画面サイズに応じたカレンダー寸法を取得
  const { isSmallScreen } = useResponsiveCalendarSize();
  // useThemedStyles: テーマに応じたスタイルを生成
  const styles = useThemedStyles(createShiftCalendarStyles);
  // ?? はNullish合体演算子: responsiveSize?.scale が null/undefined なら 1 を使う
  const scale = responsiveSize?.scale ?? 1;

  // --- Effects ---

  /**
   * useEffect: currentMonth が変わったら tempDate も同期させる。
   * これにより、外部から月が変更された場合もモーダルの表示が正しくなる。
   */
  useEffect(() => {
    setTempDate(new Date(currentMonth));
  }, [currentMonth]); // currentMonth が変わったときだけ実行

  /**
   * useEffect: コンポーネントのマウント時に onMount コールバックを実行。
   * 依存配列が [] なので、初回マウント時のみ実行される。
   */
  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, []);

  // --- Memoized Values ---

  /**
   * responsiveStyles - レスポンシブ対応のスタイルを計算
   *
   * useMemo で responsiveSize, scale が変わったときだけ再計算。
   */
  const responsiveStyles = useMemo(() => {
    // ViewStyle 型注釈: この変数が ViewStyle 型であることを明示
    const calendarStyle: ViewStyle = {
      width: "96%",
      maxWidth: 480,
      alignSelf: "center",
    };

    // scale が 1 以外の場合のみ transform を適用
    // transform: [{ scale }] はカレンダー全体の拡大/縮小
    if (scale !== 1) {
      calendarStyle.transform = [{ scale }];
    }

    const containerStyle: ViewStyle = {
      // スプレッド構文で外部から渡されたコンテナスタイルを適用
      ...(responsiveSize?.container || {}),
    };

    return { calendar: calendarStyle, container: containerStyle };
  }, [responsiveSize, scale]);

  /**
   * markedDates - カレンダーのマーカー用データを生成
   *
   * シフトデータから日付ごとのドットマーカーを自動生成する。
   * selectedDate, shifts, currentUserStoreId が変わったときだけ再計算。
   *
   * 処理ステップ:
   *   1. 選択中の日付にハイライトスタイルを設定
   *   2. 選択日の翌日に afterSelected フラグを設定（ボーダー制御用）
   *   3. シフトデータを走査してステータスごとの色付きドットを追加
   */
  const markedDates = useMemo(() => {
    // MarkedDates 型のオブジェクトを作成（react-native-calendars の型）
    const marks: MarkedDates = {};

    // 今日の日付を取得して時刻を0にリセット（日付比較のため）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // --- ステップ1: 選択中の日付のスタイル設定 ---
    if (selectedDate) {
      marks[selectedDate] = {
        selected: true,
        // colors.primary + "20" で20(16進)の不透明度（約12.5%）の薄い色
        selectedColor: colors.primary + "20",
        selectedTextColor: colors.text.primary,
      };

      // --- ステップ2: 選択日の翌日にフラグを付与 ---
      // DayComponent で左ボーダーを消すために使う独自フラグ
      const nextDay = new Date(selectedDate + "T00:00:00");
      nextDay.setDate(nextDay.getDate() + 1); // 翌日に進める

      // padStart(2, "0") で月・日を0埋め2桁にする（例: "3" → "03"）
      const nd = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, "0")}-${String(nextDay.getDate()).padStart(2, "0")}`;
      // `as any` で型チェックを回避（afterSelected は公式の型にないカスタムプロパティ）
      marks[nd] = { ...(marks[nd] || {}), afterSelected: true } as any;
    }

    // --- ステップ3: シフトデータからドットマーカーを生成 ---

    /**
     * getStatusDotColor - ステータスに応じたドットの色を返すローカル関数
     */
    const getStatusDotColor = (status: string) => {
      switch (status) {
        case "pending":
          return "#FFB800"; // オレンジ（承認待ち）
        case "approved":
          return "#0EA5E9"; // 青（承認済み）
        case "completed":
          return "#10B981"; // 緑（完了）
        case "draft":
          return "#9CA3AF"; // グレー（下書き）
        case "rejected":
          return "#EF4444"; // 赤（却下）
        case "deletion_requested":
          return "#FFB800"; // オレンジ（削除申請中、pending と同色）
        default:
          return "#10B981"; // デフォルトは緑
      }
    };

    // filter(): 削除済み・完全削除済みのシフトを除外
    // forEach(): 残ったシフトごとにドットマーカーを追加
    shifts
      .filter((shift) => shift.status !== "deleted" && shift.status !== "purged")
      .forEach((shift) => {
        // 既存のマーキングがあればそれを保持（上書きしない）
        const existingMark = marks[shift.date] || {};
        // 既存のドット配列を取得（なければ空配列）
        const existingDots = existingMark.dots || [];
        const dotColor = getStatusDotColor(shift.status || "approved");

        // スプレッド構文で既存のマーキングを維持しつつ、ドットを追加
        marks[shift.date] = {
          ...existingMark,
          // [...existingDots, { color }] で既存ドット配列に新しいドットを追加
          dots: [...existingDots, { color: dotColor }],
          selected: selectedDate === shift.date,
          selectedColor: colors.primary + "20",
        };
      });

    return marks;
  }, [selectedDate, shifts, currentUserStoreId]);

  // --- マーキングデータの決定 ---

  // propMarkedDates が外部から渡されていればそれを使い、なければ内部生成の markedDates を使う
  // `as MarkedDates | undefined` で型を明示的にキャスト
  const finalMarkedDates: MarkedDates =
    (propMarkedDates as MarkedDates | undefined) || markedDates;

  // propMarkedDates のデバッグ用チェック（現在はログ出力がコメントアウトされている）
  if (propMarkedDates) {
    const sampleKey = Object.keys(propMarkedDates)[0];
    if (sampleKey) {
      const sampleData = propMarkedDates[sampleKey];
      if (sampleData?.dots) {
        // デバッグ用（現在は空ブロック）
      }
    }
  } else {
    // デバッグ用（現在は空ブロック）
  }

  // --- Handlers ---

  /**
   * handleDateSelect - DatePickerModal で日付が選択されたときの処理
   *
   * tempDate を更新し、親コンポーネントに月変更を通知する。
   */
  const handleDateSelect = (date: Date) => {
    setTempDate(date);
    if (onMonthChange) {
      // format() で Date オブジェクトを "yyyy-MM-dd" 形式の文字列に変換
      onMonthChange({ dateString: format(date, "yyyy-MM-dd") });
    }
  };

  /**
   * handlePrevMonth - 前月に移動するハンドラ
   *
   * useCallback: 関数をメモ化するフック。
   * 依存配列の値が変わらない限り、同じ関数参照を返す。
   * これにより、子コンポーネント（DateNavigator）の不要な再レンダリングを防ぐ。
   *
   * 処理:
   *   1. currentMonth から Date オブジェクトを作成
   *   2. setMonth() で1ヶ月前に設定
   *   3. onMonthChange で親に通知
   */
  const handlePrevMonth = useCallback(() => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1); // 1ヶ月戻す
    if (onMonthChange) {
      onMonthChange({ dateString: format(d, "yyyy-MM-dd") });
    }
  }, [currentMonth, onMonthChange]); // これらが変わったときだけ関数を再生成

  /**
   * handleNextMonth - 次月に移動するハンドラ
   * ※ handlePrevMonth と同じパターン（+1 で1ヶ月進める）
   */
  const handleNextMonth = useCallback(() => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1); // 1ヶ月進める
    if (onMonthChange) {
      onMonthChange({ dateString: format(d, "yyyy-MM-dd") });
    }
  }, [currentMonth, onMonthChange]);

  /**
   * calendarMonthLabel - ナビゲーションに表示する「YYYY年M月」ラベル
   *
   * useMemo で currentMonth が変わったときだけ再計算。
   */
  const calendarMonthLabel = useMemo(() => {
    const d = new Date(currentMonth);
    // 無効な日付の場合は現在日時にフォールバック
    const validDate = Number.isNaN(d.getTime()) ? new Date() : d;
    return `${validDate.getFullYear()}年${validDate.getMonth() + 1}月`;
  }, [currentMonth]);

  // --- Render ---

  return (
    <View
      // style={[A, B && C, D]}: 配列でスタイルを結合。B が falsy なら C は適用されない
      style={[
        styles.container,
        isSmallScreen && styles.containerFullWidth, // スマホ時のみフル幅スタイルを追加
        responsiveStyles.container,
      ]}
    >
      {/* --- 月ナビゲーション（Calendar外に配置してscaleの影響を受けない） --- */}
      {/* !hideMonthNav: hideMonthNav が false/undefined のとき表示 */}
      {!hideMonthNav && (
        <DateNavigator
          label={calendarMonthLabel}           // "2026年3月" のようなラベル
          onPrev={handlePrevMonth}             // 前月ボタン
          onNext={handleNextMonth}             // 次月ボタン
          onLabelPress={() => {                // ラベルタップ → 年月選択モーダルを開く
            const d = new Date(currentMonth);
            // 無効な日付の場合のフォールバック処理
            setTempDate(Number.isNaN(d.getTime()) ? new Date() : d);
            setShowDatePicker(true);
          }}
        />
      )}

      {/* --- カレンダー本体（react-native-calendars） --- */}
      <Calendar
        current={currentMonth}                 // 表示する月
        onDayPress={onDayPress}                // 日付タップ時のハンドラ
        // スプレッド構文で条件付きプロパティを追加:
        // onMonthChange が存在する場合のみ onMonthChange プロパティを追加する
        {...(onMonthChange && { onMonthChange })}
        markedDates={finalMarkedDates}          // マーキングデータ
        markingType={"multi-dot"}               // 複数ドット対応のマーキングタイプ
        enableSwipeMonths={true}                // スワイプで月切り替え可能
        hideArrows={true}                       // デフォルトの矢印を非表示（DateNavigator を使うため）
        // renderHeader: デフォルトヘッダーを高さ0のViewに置き換えて非表示にする
        renderHeader={() => <View style={{ height: 0 }} />}
        style={[
          styles.calendar,
          styles.calendarShadow,
          responsiveStyles.calendar,
        ]}
        // theme: react-native-calendars 固有のテーマ設定（通常のStyleSheetとは別体系）
        theme={{
          backgroundColor: "transparent",
          calendarBackground: "transparent",
          textSectionTitleColor: colors.text.secondary,     // 曜日ヘッダー行の色
          dayTextColor: colors.text.primary,
          textDisabledColor: colors.text.secondary,
          selectedDayBackgroundColor: colors.primary + "20",
          selectedDayTextColor: colors.primary,
          todayTextColor: colors.primary,
          dotColor: colors.primary,
          selectedDotColor: colors.primary,
          monthTextColor: colors.text.primary,
          // iOSカレンダー風のフォント設定
          textDayFontFamily:
            "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
          textMonthFontFamily:
            "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
          textDayHeaderFontFamily:
            "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
          textDayFontWeight: "500",
          textMonthFontWeight: "600",
          textDayHeaderFontWeight: "600",
          textDayFontSize: 28,
          textMonthFontSize: 30,
          textDayHeaderFontSize: 20,
        }}
        // dayComponent: カスタム日付セルを指定する
        // react-native-calendars が各日付に対してこの関数を呼び出し、
        // 返されたJSXをデフォルトの日付セルの代わりに表示する
        dayComponent={({ date, state, marking }: DayComponentProps) => (
          <DayComponent
            date={date}
            state={state}
            marking={marking}
            // onPress を変換: DayComponent は dateString（string）を渡すが、
            // onDayPress は { dateString } オブジェクトを期待するので変換する
            onPress={(dateString) => onDayPress({ dateString })}
            responsiveSize={responsiveSize?.day}
          />
        )}
      />

      {/* カレンダー下のその日情報表示（現在はコメントアウトで無効化） */}
      {/* {selectedDate && (
        <ShiftList shifts={shifts} selectedDate={selectedDate} />
      )} */}

      {/* --- 年月選択モーダル --- */}
      <DatePickerModal
        isVisible={showDatePicker}              // 表示/非表示
        initialDate={tempDate}                  // 初期表示日付
        onClose={() => setShowDatePicker(false)} // 閉じる
        onSelect={handleDateSelect}             // 日付選択時
      />
    </View>
  );
};
