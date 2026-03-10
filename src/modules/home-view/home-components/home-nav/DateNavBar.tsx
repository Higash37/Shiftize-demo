/**
 * @file DateNavBar.tsx
 * @description ホーム画面上部の日付ナビゲーションバー。
 *   「< 2025年6月1日(日) >」のように前日・翌日移動と日付ピッカーを提供する。
 *   右端にパスワード変更ボタン（鍵アイコン）を配置。
 *
 *   使われる画面: HomeCommonScreen（タブレット・モバイル版で表示）
 *   PC版では DateNavigator コンポーネントが直接使われるため、このバーは非表示。
 */

import React from "react";
import { View, Pressable } from "react-native";
// ↑ Pressable はタッチ操作を受け取るコンポーネント。TouchableOpacity より新しいAPI。
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
// ↑ useThemedStyles: テーマオブジェクトを受け取るスタイル生成関数を渡すと、
//   現在のテーマに基づいたスタイルオブジェクトを返すフック
import { createHomeViewStyles } from "../../home-styles/home-view-styles";
import { FontAwesome } from "@expo/vector-icons";
import { DateNavigator } from "@/common/common-ui/ui-navigation/DateNavigator";

// --- Props 型定義 ---

/**
 * DateNavBar の Props（親から受け取るプロパティ）。
 * interface で定義し、React.FC<Props型> のジェネリクスに渡す。
 */
interface DateNavBarProps {
  isMobile: boolean;              // モバイル表示かどうか
  showFirst: boolean;             // 前半表示かどうか（ガント分割用、現在は未使用）
  onToggleHalf: () => void;       // 前半/後半切り替えハンドラ
  // ↑ () => void は「引数なし、戻り値なし」の関数型
  onPrevDay: () => void;          // 前日ボタンのハンドラ
  onNextDay: () => void;          // 翌日ボタンのハンドラ
  dateLabel: string;              // 表示する日付ラベル（例: "2025年6月1日(日)"）
  onOpenDatePicker: () => void;   // 日付ラベルタップ時のハンドラ（ピッカーを開く）
  onPressSettings?: () => void;   // パスワード変更ボタンのハンドラ（オプショナル）
  // ↑ ? を付けるとこのプロパティは省略可能になる
}

// --- コンポーネント ---

/**
 * 日付ナビゲーションバーコンポーネント。
 *
 * React.FC<DateNavBarProps> は React の関数コンポーネント型。
 * FC = FunctionComponent の略。ジェネリクスに Props の型を渡すことで、
 * 引数（props）の型が自動的にチェックされる。
 *
 * 分割代入で必要な props だけを取り出している。
 * isMobile, showFirst, onToggleHalf は受け取っているが、このコンポーネント内では未使用。
 */
export const DateNavBar: React.FC<DateNavBarProps> = ({
  onPrevDay,
  onNextDay,
  dateLabel,
  onOpenDatePicker,
  onPressSettings,
}) => {
  // --- Hooks ---

  const styles = useThemedStyles(createHomeViewStyles);
  const theme = useMD3Theme();

  // --- Render ---

  return (
    <View
      style={[
        styles.datePickerRow,
        {
          alignItems: "center",       // 子要素を縦方向の中央に配置（他: "flex-start", "flex-end"）
          flexDirection: "row",       // 子要素を横並びに配置（他: "column", "row-reverse"）
          justifyContent: "center",   // 子要素を横方向の中央に配置（他: "flex-start", "space-between"）
          position: "relative",       // 子要素の absolute 配置の基準にする（他: "absolute"）
        },
      ]}
    >
      {/* DateNavigator: 共通の日付ナビゲーションコンポーネント（< ラベル >） */}
      <DateNavigator
        label={dateLabel}
        onPrev={onPrevDay}
        onNext={onNextDay}
        onLabelPress={onOpenDatePicker}
      />

      {/* 右端：パスワード変更ボタン */}
      {/* onPressSettings が渡された場合のみ表示する（短絡評価: && の左辺が truthy なら右辺を描画） */}
      {onPressSettings && (
        <View
          style={{
            position: "absolute",  // 親の position: relative を基準に絶対配置
            right: 16,             // 右端から16px
            zIndex: 1,             // 重なり順序（大きいほど手前に表示）
          }}
        >
          <Pressable onPress={onPressSettings}>
            <FontAwesome name="key" size={20} color={theme.colorScheme.onSurfaceVariant} />
          </Pressable>
        </View>
      )}
    </View>
  );
};
