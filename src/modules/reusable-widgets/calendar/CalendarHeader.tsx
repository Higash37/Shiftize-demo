/**
 * @file CalendarHeader.tsx
 * @description カレンダーのヘッダー部分（年月表示）のコンポーネント。
 *              「2026年3月」のようなテキストをタップすると、年月選択モーダルを開く。
 *              DateNavigator と同じスタイルで統一感を持たせている。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react, react-native, MD3ThemeContext（テーマ）, DateNavigator（高さ定数）
// インポート先: ShiftCalendar.tsx などカレンダーヘッダーが必要な場所
//              （現在は ShiftCalendar で DateNavigator を使っているため、直接の使用箇所は限定的）

import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
// SUB_HEADER_HEIGHT: サブヘッダーの高さ定数。DateNavigator と揃えるために共有する
import { SUB_HEADER_HEIGHT } from "@/common/common-ui/ui-navigation/DateNavigator";

// --- 型定義 ---

/**
 * CalendarHeaderProps
 *
 * CalendarHeader コンポーネントのProps型。
 * ファイルローカルで interface 定義している（小さいコンポーネントではこのパターンも一般的）。
 *
 * @property date              - 表示する年月の Date オブジェクト
 * @property onYearMonthSelect - ヘッダーがタップされたときに呼ばれるコールバック
 * @property responsiveStyle   - レスポンシブ対応のスタイル上書き値（省略可能）
 */
interface CalendarHeaderProps {
  date: Date;
  onYearMonthSelect: () => void;
  responsiveStyle?: { fontSize?: number };
}

/**
 * CalendarHeaderComponent
 *
 * カレンダーのヘッダーを描画する内部コンポーネント。
 * 後で memo() でラップしてエクスポートする。
 *
 * 処理ステップ:
 *   1. テーマから色情報を取得
 *   2. 日付が無効（NaN）なら現在日時にフォールバック
 *   3. 年と月を取得して「YYYY年M月」形式で表示
 */
const CalendarHeaderComponent: React.FC<CalendarHeaderProps> = ({
  date,
  onYearMonthSelect,
}) => {
  // 分割代入で colorScheme を cs という短い変数名に束縛（ファイル内だけの略称）
  const { colorScheme: cs } = useMD3Theme();

  // Number.isNaN(date.getTime()) で無効な日付をチェック
  // 無効な場合は new Date()（現在日時）をフォールバックとして使う
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const year = validDate.getFullYear();
  // getMonth() は 0始まり（0=1月）なので +1 する
  const month = validDate.getMonth() + 1;

  // --- Render ---
  return (
    <View
      // インラインスタイル: 小さいコンポーネントでは StyleSheet を使わずに直接書くこともある
      style={{
        flexDirection: "row",          // 横並び（他: "column"=縦並び）
        justifyContent: "center",      // 中央揃え
        alignItems: "center",          // 垂直方向中央
        height: SUB_HEADER_HEIGHT,     // DateNavigator と同じ高さ
      }}
    >
      {/* 年月テキスト（タップ可能） */}
      <TouchableOpacity
        onPress={onYearMonthSelect}
        activeOpacity={0.7}            // タップ時の透明度（0.7 = 少し薄くなる）
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 4,
          height: SUB_HEADER_HEIGHT,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "bold", color: cs.onSurface }}>
          {year}年{month}月
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// displayName: React DevTools でコンポーネント名を表示するための設定
// memo() でラップするとデフォルト名が失われるため、明示的に設定する
CalendarHeaderComponent.displayName = "CalendarHeader";

/**
 * CalendarHeader（エクスポート）
 *
 * memo() でメモ化したバージョンをエクスポート。
 * Props（date, onYearMonthSelect）が変わらない限り再レンダリングをスキップする。
 */
export const CalendarHeader = memo(CalendarHeaderComponent);
