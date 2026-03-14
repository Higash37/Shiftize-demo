/**
 * @file ShiftListAdapter.tsx
 * @description ShiftDetails コンポーネントをラップするアダプターコンポーネント。
 *              isOpen が false のとき何も表示しない（nullを返す）ことで、
 *              不要なレンダリングとアニメーション計算を防ぐ。
 *              アダプターパターンを使って ShiftDetails の表示/非表示を外部から制御する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react, react-native, ShiftDetails（シフト詳細コンポーネント）,
//              shift.types（ShiftAdapterProps 型）, ModelIndex（Shift 型）
// インポート先: ShiftList.tsx（ShiftItem コンポーネント内で使用）

import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { ShiftDetails } from "./ShiftDetails";
import { ShiftAdapterProps } from "../calendar-types/shift.types";

/**
 * ShiftDetailsAdapter
 *
 * ShiftDetails の表示/非表示を制御するアダプターコンポーネント。
 *
 * memo<ShiftAdapterProps>() でメモ化:
 *   - ジェネリクス <ShiftAdapterProps> でPropsの型を指定
 *   - shift と isOpen が変わらない限り再レンダリングをスキップ
 *
 * なぜアダプターが必要か:
 *   - ShiftDetails は Animated.Value で高さアニメーションを管理している
 *   - isOpen=false でも ShiftDetails をレンダリングすると、アニメーション計算が走る
 *   - アダプターで null を返すことで、閉じている時のコストをゼロにする
 *
 * Props:
 *   - shift:  シフトデータ
 *   - isOpen: 開いているかどうか
 */
export const ShiftDetailsAdapter = memo<ShiftAdapterProps>(
  ({ shift, isOpen }) => {
    // isOpenがfalseの場合は何も表示しない（早期リターン）
    if (!isOpen) {
      return null;
    }

    // isOpen=true の場合のみ ShiftDetails をレンダリング
    return (
      <View style={styles.detailsContainer}>
        {/* maxHeight={150}: 詳細パネルの最大高さを150pxに制限 */}
        <ShiftDetails shift={shift} isOpen={true} maxHeight={150} />
      </View>
    );
  }
);

// --- スタイル定義 ---
// コンポーネント外で StyleSheet.create を使用（テーマ非依存）
const styles = StyleSheet.create({
  detailsContainer: {
    marginHorizontal: 5,    // 左右の外側余白
    marginBottom: 10,       // 下の外側余白
    borderRadius: 8,        // 角丸
    overflow: "hidden",     // はみ出す部分を非表示（角丸と組み合わせると角が切れる）
  },
});
