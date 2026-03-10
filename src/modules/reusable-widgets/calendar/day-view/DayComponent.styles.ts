/**
 * @file DayComponent.styles.ts
 * @description カレンダーの1日分のセル（DayComponent）のスタイル定義ファイル。
 *              iOS風の曜日色分けロジックと、共通スタイルを提供する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（StyleSheet）, MD3Theme（テーマ型）, ../constants（祝日データ）
// インポート先: DayComponent.tsx

import { StyleSheet } from "react-native";
// MD3Theme は Material Design 3 のテーマ型。色・タイポグラフィ・シェイプ等を持つ
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { HOLIDAYS } from "../constants";

/**
 * getIOSDayColor
 *
 * iOSカレンダー風の曜日ごとの色分けを行う関数。
 * DayComponent がテキストの色を決める際に呼び出す。
 *
 * 処理ステップ:
 *   1. dateString がなければデフォルトのテキスト色を返す
 *   2. 曜日番号を取得（0=日曜〜6=土曜）
 *   3. 選択中 → 白（背景が青なので白文字にする）
 *   4. 無効化 → アウトライン色（薄いグレー）
 *   5. 今日 → プライマリ色（青系）
 *   6. 祝日 → エラー色（赤）
 *   7. 日曜 → エラー色（赤）
 *   8. 土曜 → プライマリ色（青）
 *   9. 平日 → 通常テキスト色
 *
 * @param theme      - MD3テーマオブジェクト（色情報を持つ）
 * @param dateString - 日付文字列（例: "2026-03-10"）
 * @param state      - 日付の状態（"disabled", "today" など）
 * @param isSelected - 選択中かどうか
 * @returns カラーコード文字列
 */
export function getIOSDayColor(
  theme: MD3Theme,
  dateString?: string,
  state?: string,
  isSelected?: boolean
) {
  if (!dateString) return theme.colorScheme.onSurface;
  // getDay() で曜日番号を取得: 0=日曜, 1=月曜, ..., 6=土曜
  const day = new Date(dateString).getDay();
  if (isSelected) return theme.colorScheme.onPrimary;        // 選択中: 白
  if (state === "disabled") return theme.colorScheme.outline; // 無効: 薄いグレー
  if (state === "today") return theme.colorScheme.primary;    // 今日: 青
  // 祝日チェック: HOLIDAYS オブジェクトにキーが存在するかで判定
  if (HOLIDAYS[dateString]) return theme.colorScheme.error;   // 祝日: 赤
  if (day === 0) return theme.colorScheme.error;              // 日曜: 赤
  if (day === 6) return theme.colorScheme.primary;            // 土曜: 青
  return theme.colorScheme.onSurface;                         // 平日: 通常色
}

/**
 * createDayComponentStyles
 *
 * DayComponent の共通スタイルを生成するファクトリ関数。
 * テーマ（MD3Theme）を引数に受け取り、テーマに応じたスタイルを返す。
 *
 * StyleSheet.create() は React Native のスタイル最適化メソッド。
 * 通常のオブジェクトと違い、内部でスタイルIDに変換されてパフォーマンスが向上する。
 *
 * @param theme - MD3テーマオブジェクト
 * @returns StyleSheet で作成されたスタイルオブジェクト
 */
export const createDayComponentStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    // --- 日付セル全体のコンテナスタイル ---
    dayContainer: {
      alignItems: "center",         // 子要素を水平方向中央揃え（他: "flex-start", "flex-end", "stretch"）
      justifyContent: "center",     // 子要素を垂直方向中央揃え（他: "flex-start", "flex-end", "space-between"）
      backgroundColor: "transparent", // 背景を透明に
      position: "relative",         // 子要素の absolute 配置の基準点にする（他: "absolute"）
      paddingVertical: 0,           // 上下の内側余白
      paddingHorizontal: 0,         // 左右の内側余白
      borderRadius: 0,              // 角丸なし
      margin: 0,                    // 外側余白なし
    },
    // --- 日付テキストのスタイル ---
    dayText: {
      ...theme.typography.bodyMedium, // スプレッド構文でテーマのタイポグラフィ設定を展開
      fontWeight: "500",              // 中太（他: "400"=normal, "700"=bold, "900"=最太）
      color: theme.colorScheme.onSurface, // テーマのテキスト色
      zIndex: 1,                      // 重なり順序（大きいほど手前に表示）
      margin: 0,
    },
    // --- 今日の日付テキスト用の上書きスタイル ---
    todayText: {
      color: theme.colorScheme.primary, // 青系で目立たせる
      fontWeight: "700",                 // 太字
    },
    // --- シフト有無を示すドット（丸い点） ---
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,    // width/2 にすると真円になる
      marginTop: 2,       // 日付テキストとの間隔
      zIndex: 1,
    },
    // --- 複数ドットを横並びにするコンテナ ---
    dotsContainer: {
      flexDirection: "row",      // 子要素を横並びにする（他: "column"=縦並び）
      justifyContent: "center",  // 横方向中央揃え
      alignItems: "center",      // 縦方向中央揃え
      position: "absolute",      // 親要素(dayContainer)からの絶対位置指定
      bottom: -8,                // 親の下端から8px下に配置
      alignSelf: "center",       // 自身を水平方向中央揃え
    },
    // --- 選択中の日付スタイル（現在は空。動的スタイルで上書きされる） ---
    selectedDay: {
      // 旧selectedDayは不要
    },
  });
