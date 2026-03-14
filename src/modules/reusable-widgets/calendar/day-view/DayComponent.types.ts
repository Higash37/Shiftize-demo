/**
 * @file DayComponent.types.ts
 * @description カレンダーの1日分のセル（DayComponent）に関する型定義ファイル。
 *              DayComponent.tsx が使うProps型と、動的に生成するスタイルの型を定義する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（StyleProp, TextStyle, ViewStyle）,
//              ../calendar-types/common.types（DayComponentProps）
// インポート先: DayComponent.tsx

// StyleProp, TextStyle, ViewStyle は React Native のスタイル型。
// StyleProp<T> は「T型のスタイル、またはその配列」を許容する型。
// ViewStyle はView用、TextStyle はText用のスタイルプロパティ集合。
import { TextStyle, ViewStyle } from "react-native";
import { DayComponentProps } from "../calendar-types/common.types";

/**
 * DayComponentPropsExtended
 *
 * DayComponent コンポーネントに渡すProps型。
 * common.types.ts の DayComponentProps を参照しつつ、onPress の型を具体化している。
 *
 * `DayComponentProps["date"]` は「DayComponentProps の date プロパティの型」を取り出す書き方。
 * これを「インデックスアクセス型（Indexed Access Type）」と呼ぶ。
 *
 * @property date           - 日付情報（DayComponentProps の date と同じ型）
 * @property state          - 日付の状態（"disabled" | "today" | "selected" など）
 * @property marking        - マーキング情報（ドット、選択状態など）
 * @property onPress        - 日付がタップされたときのコールバック。dateString（例: "2026-03-10"）を受け取る
 * @property responsiveSize - レスポンシブサイズ調整値
 */
export interface DayComponentPropsExtended {
  date?: DayComponentProps["date"];
  state?: DayComponentProps["state"];
  marking?: DayComponentProps["marking"];
  onPress: (dateString: string) => void;
  responsiveSize?: any;
}

/**
 * DynamicStyles
 *
 * DayComponent 内で useMemo を使って動的に生成するスタイルの型。
 * 画面サイズに応じてセルの幅・高さ・フォントサイズが変わるため、
 * 静的な StyleSheet ではなく動的に計算する必要がある。
 *
 * @property dayContainer - 日付セル全体のスタイル（ViewStyle: width, height など）
 * @property selectedDay  - 選択中の日付に適用する追加スタイル（borderRadius など）
 * @property dayText      - 日付テキストのスタイル（TextStyle: fontSize など）
 */
export interface DynamicStyles {
  dayContainer: ViewStyle;
  selectedDay: ViewStyle;
  dayText: TextStyle;
}
