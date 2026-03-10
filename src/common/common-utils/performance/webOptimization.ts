/**
 * @file webOptimization.ts
 * @description Web環境でのFlatListパフォーマンス最適化設定。
 *
 * 【このファイルの位置づけ】
 * - FlatListを使用する各コンポーネントから呼び出される
 * - Web環境とネイティブ環境で異なる最適な設定を提供する
 * - 関連ファイル: ガントチャートやリスト表示を行う各Viewコンポーネント
 *
 * 【FlatList とは】
 * React Native の仮想化リストコンポーネント。
 * 大量のデータを効率的に表示するため、画面に見えている部分だけをレンダリングする。
 * ただし、Web環境とネイティブ環境では動作が異なるため、設定を分ける必要がある。
 */

import { Platform } from 'react-native';

/**
 * getOptimizedFlatListProps - 環境に応じたFlatListの最適化設定を取得する
 *
 * Web環境とネイティブ環境で最適なパフォーマンス設定が異なるため、
 * Platform.OSで判定して適切な値を返す。
 *
 * 【各プロパティの意味】
 *
 * - removeClippedSubviews:
 *   true → 画面外に出たアイテムをネイティブビュー階層から除外する
 *   Webでは効果がないため false に設定
 *
 * - maxToRenderPerBatch:
 *   1回のレンダリングバッチで処理するアイテム数の上限。
 *   値が大きい → 一度に多く描画（ネイティブ向け）
 *   値が小さい → 少しずつ描画（Web向け、メインスレッドのブロックを軽減）
 *
 * - updateCellsBatchingPeriod:
 *   バッチ更新の間隔（ミリ秒）。
 *   値が大きい → 更新頻度が低い（Web向け、CPU負荷軽減）
 *   値が小さい → 更新頻度が高い（ネイティブ向け、レスポンス重視）
 *
 * - windowSize:
 *   レンダリングするウィンドウのサイズ（画面の何倍分を事前レンダリングするか）。
 *   5 → 画面の5倍分（Web向け、メモリ節約）
 *   10 → 画面の10倍分（ネイティブ向け、スクロール時のちらつき軽減）
 *
 * - initialNumToRender:
 *   初回レンダリング時に表示するアイテム数。
 *   値が小さい → 初期表示が速い（ただし下方向へのスクロールで遅延が発生しやすい）
 *
 * @returns FlatListに展開可能なプロパティオブジェクト
 *
 * 【使い方の例】
 * ```tsx
 * <FlatList
 *   data={items}
 *   renderItem={renderItem}
 *   {...getOptimizedFlatListProps()}
 * />
 * ```
 */
export const getOptimizedFlatListProps = () => {
  // Platform.OS → 'web', 'ios', 'android' のいずれかを返す
  if (Platform.OS === 'web') {
    return {
      // Web環境での最適化（軽量設定）
      removeClippedSubviews: false, // Webでは効果がないため無効
      maxToRenderPerBatch: 10,      // バッチサイズを小さく（CPU負荷軽減）
      updateCellsBatchingPeriod: 100, // 更新間隔を長く（描画回数を減らす）
      windowSize: 5,                  // ウィンドウサイズを小さく（メモリ節約）
      initialNumToRender: 10,         // 初期レンダリング数を小さく（表示速度優先）
    };
  }

  return {
    // ネイティブ環境での設定（パフォーマンス重視）
    removeClippedSubviews: true,    // 画面外の要素を除外（メモリ節約）
    maxToRenderPerBatch: 50,        // バッチサイズを大きく（高速レンダリング）
    updateCellsBatchingPeriod: 50,  // 更新間隔を短く（レスポンス重視）
    windowSize: 10,                  // 大きめのウィンドウ（スクロールちらつき防止）
    initialNumToRender: 20,          // 多めに初期レンダリング（ジャンプスクロール対応）
  };
};
