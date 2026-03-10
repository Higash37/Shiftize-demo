/**
 * @file DayComponent.tsx
 * @description カレンダーの1日分のセルを表示するコンポーネント。
 *              日付の数字、選択状態、今日のハイライト、シフト有無のドットを描画する。
 *              react-native-calendars の dayComponent として差し替えて使用する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react, react-native, DayComponent.types/styles, constants, テーマ関連
// インポート先: ShiftCalendar.tsx（dayComponent プロパティとして渡される）

import React, { memo, useMemo } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { DayComponentPropsExtended } from "./DayComponent.types";
import { useResponsiveCalendarSize } from "../constants";
import { createDayComponentStyles, getIOSDayColor } from "./DayComponent.styles";
// useThemedStyles はテーマに応じたスタイルを生成するカスタムフック
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
// useMD3Theme は現在のMD3テーマオブジェクトを取得するフック
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
// APP_FONT_FAMILY はアプリ全体で使うフォントファミリー定数
import { APP_FONT_FAMILY } from "@/common/common-constants/FontConstants";

/**
 * DayComponent
 *
 * カレンダーの1日分を表示するコンポーネント。
 * memo() でラップしてメモ化し、Propsが変わらない限り再レンダリングをスキップする。
 *
 * memo<DayComponentPropsExtended>(...) の <DayComponentPropsExtended> はジェネリクス。
 * 「このmemoコンポーネントが受け取るPropsの型はDayComponentPropsExtendedだよ」と指定している。
 *
 * Props:
 *   - date:           日付情報（day, month, year, dateString など）
 *   - state:          日付の状態（"today", "disabled" など）
 *   - marking:        マーキング情報（selected, dots など）
 *   - onPress:        タップ時のコールバック
 *   - responsiveSize: レスポンシブ対応のサイズ調整値
 */
export const DayComponent = memo<DayComponentPropsExtended>(
  ({ date, state, marking, onPress, responsiveSize }) => {
    // --- State & Hooks ---

    // useResponsiveCalendarSize: 画面サイズに応じた日付セルの寸法を取得するフック
    const { dayWidth, dayHeight, isSmallScreen } = useResponsiveCalendarSize();

    // useMD3Theme: 現在のテーマ（色、フォントなど）を取得
    const theme = useMD3Theme();

    // useThemedStyles: テーマに応じたスタイルシートを生成
    // createDayComponentStyles 関数にテーマを渡して実行した結果がキャッシュされる
    const styles = useThemedStyles(createDayComponentStyles);

    // --- Memoized Values ---

    /**
     * dynamicStyles - 画面サイズに応じて動的に計算するスタイル
     *
     * useMemo: 依存配列の値が変わったときだけ再計算する。
     * ここでは dayWidth, dayHeight, isSmallScreen, responsiveSize が変わったときだけ。
     * 毎レンダリングで新しいオブジェクトを作らないことでパフォーマンスを向上させる。
     */
    const dynamicStyles = useMemo(() => {
      return {
        dayContainer: {
          width: dayWidth,       // セルの幅
          height: dayHeight,     // セルの高さ
          padding: 0,            // パディングを0に設定して余白をなくす
        },
        selectedDay: {
          // Math.min() で幅と高さの小さい方を選び、2で割って円形にする
          borderRadius: Math.min(dayWidth, dayHeight) / 2,
        },
        dayText: {
          fontSize: isSmallScreen ? 15 : 14, // スマホでは少し大きめのフォント
          letterSpacing: -1.0,               // 文字間隔を狭める（負の値=詰める）
          // スプレッド構文: responsiveSize?.day があればそのプロパティを展開して上書き
          // ?. はオプショナルチェーン。responsiveSize が null/undefined でもエラーにならない
          // || {} は「undefinedの場合は空オブジェクト」のフォールバック
          ...(responsiveSize?.day || {}),
        },
      };
    }, [dayWidth, dayHeight, isSmallScreen, responsiveSize]);

    // --- Derived Values（計算から導出される値） ---

    // marking?.selected: marking が存在すれば selected を取得。なければ undefined
    const isSelected = marking?.selected;

    // state が "today" なら今日の日付
    const isToday = state === "today";

    // ドットマーカーの有無
    const hasMarker = marking?.marked;

    // iOS風の日付テキスト色を取得
    const dayColor = getIOSDayColor(theme, date?.dateString, state, isSelected);

    // --- Render ---

    return (
      // TouchableOpacity: タップ可能な透明ボタン。押すと半透明になるフィードバックがある
      <TouchableOpacity
        // style={[A, B, C]} は配列でスタイルを結合する書き方。後ろのスタイルが優先される
        style={[
          styles.dayContainer,           // 基本スタイル
          dynamicStyles.dayContainer,    // 動的サイズ
          {
            // 左ボーダーの表示/非表示ロジック:
            // 選択中、選択日の翌日、日曜、今日 → ボーダーなし(0)、それ以外 → ボーダーあり(1)
            // `(marking as any)?.afterSelected` の `as any` は型アサーション。
            // 本来の型にない独自プロパティ(afterSelected)にアクセスするためのキャスト。
            borderLeftWidth:
              isSelected || (marking as any)?.afterSelected ||
              (date && date.dateString &&
                (new Date(date.dateString).getDay() === 0 || state === "today"))
                ? 0 : 1,
            borderLeftColor: "#E5E5E5",   // 薄いグレーのボーダー
            borderRightWidth: 0,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            borderRadius: 0,              // 四角いセル
            // 選択中なら青背景、それ以外は透明
            backgroundColor: isSelected ? "#007AFF" : "transparent",
          },
        ]}
        // date が存在するときだけ onPress を呼ぶ。&& は「左がtruthyなら右を実行」
        onPress={() => date && onPress(date.dateString)}
        // activeOpacity: タップ中の不透明度。0=完全に透明, 1=変化なし
        activeOpacity={isSelected ? 0.8 : 0.6}
      >
        {/* 日付の数字テキスト */}
        <Text
          style={[
            styles.dayText,
            dynamicStyles.dayText,
            {
              color: isSelected ? "#fff" : dayColor,  // 選択中は白、それ以外はdayColor
              fontFamily: APP_FONT_FAMILY,             // アプリ共通フォント
              fontWeight: isToday ? "700" : "500",     // 今日は太字
              fontSize: isToday ? 20 : 18,             // 今日は少し大きめ
              // 今日かつ未選択なら薄い青背景をつけて目立たせる
              backgroundColor:
                isToday && !isSelected ? "#F2F6FF" : "transparent",
              borderRadius: 8,
              paddingHorizontal: 2,
              paddingVertical: 1,
            },
          ]}
        >
          {/* date?.day: オプショナルチェーンで日付の数字を表示（例: 10） */}
          {date?.day}
        </Text>

        {/* --- ドットマーカー表示 --- */}
        {/* 複数ドット対応: marking.dots 配列がある場合はすべて表示 */}
        {marking?.dots && marking.dots.length > 0 ? (
          <View style={styles.dotsContainer}>
            {/* .map() で配列の各要素をJSX（View）に変換して表示 */}
            {marking.dots.map((dot: any, index: number) => (
              <View
                // key: Reactがリスト要素を効率的に追跡するための一意な識別子
                // dot.key があればそれを使い、なければ index をフォールバックにする
                key={dot.key || index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: dot.color,  // ドットの色（ステータスごとに異なる）
                    marginHorizontal: 1,          // ドット間の横間隔
                  },
                ]}
              />
            ))}
          </View>
        ) : (
          // dots 配列がなく、marked フラグだけある場合は単一ドットを表示
          hasMarker && <View style={[styles.dot, marking.dotStyle]} />
        )}
      </TouchableOpacity>
    );
  }
);
