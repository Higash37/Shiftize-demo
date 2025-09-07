/**
 * Web環境でのパフォーマンス最適化ユーティリティ
 */

import { Platform } from 'react-native';

/**
 * 開発環境での特定のReact Native警告を抑制
 */
export const suppressReactNativeWebWarnings = () => {
  if (Platform.OS === 'web' && process.env['NODE_ENV'] === 'development') {
    const originalWarn = console.warn;
    const originalViolation = console.error;

    // wheel event警告の抑制
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString?.() || '';
      if (
        message.includes('Added non-passive event listener') ||
        message.includes('shadow*') ||
        message.includes('message handler took')
      ) {
        return; // 特定の警告をスキップ
      }
      originalWarn(...args);
    };

    // Violation警告の抑制
    console.error = (...args: any[]) => {
      const message = args[0]?.toString?.() || '';
      if (message.includes('[Violation]')) {
        return; // Violation警告をスキップ
      }
      originalViolation(...args);
    };
  }
};

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

/**
 * パッシブイベントリスナー対応のスクロールハンドラ
 */
export const createOptimizedScrollHandler = (callback: (event: any) => void) => {
  if (Platform.OS === 'web') {
    let ticking = false;
    
    return (event: any) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback(event);
          ticking = false;
        });
        ticking = true;
      }
    };
  }
  
  return callback;
};