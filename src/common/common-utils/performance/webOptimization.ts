/**
 * Web環境でのパフォーマンス最適化ユーティリティ
 */

import { Platform } from 'react-native';

/**
 * FlatListのWeb最適化設定
 */
export const getOptimizedFlatListProps = () => {
  if (Platform.OS === 'web') {
    return {
      // Web環境での最適化
      removeClippedSubviews: false, // Webでは無効
      maxToRenderPerBatch: 10, // バッチサイズを小さく
      updateCellsBatchingPeriod: 100, // 更新間隔を長く
      windowSize: 5, // ウィンドウサイズを小さく
      initialNumToRender: 10, // 初期レンダリング数を小さく
    };
  }
  
  return {
    // ネイティブ環境での設定
    removeClippedSubviews: true,
    maxToRenderPerBatch: 50,
    updateCellsBatchingPeriod: 50,
    windowSize: 10,
    initialNumToRender: 20,
  };
};

