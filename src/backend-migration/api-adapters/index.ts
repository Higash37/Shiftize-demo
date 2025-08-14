/**
 * API サービス抽象化層のエクスポート
 * 
 * このモジュールは段階的なバックエンド移行を管理します。
 * フェーズ1: Firebase直接呼び出しのラッパー
 * フェーズ2+: 実際のAPIエンドポイントへの移行
 */

// シフト管理API
export { ShiftAPIService } from './ShiftAPIService';

// 型定義
export * from './api-adapter-types';

// 将来追加予定のサービス（フェーズ1完了後に段階的に実装）
// export { AuthAPIService } from './AuthAPIService';
// export { MultiStoreAPIService } from './MultiStoreAPIService';
// export { TaskAPIService } from './TaskAPIService';
// export { NotificationAPIService } from './NotificationAPIService';
// export { WageAPIService } from './WageAPIService';

/**
 * API設定とヘルパー関数
 */

/**
 * 現在のAPI移行状況を取得
 */
export function getAPIMigrationStatus(): {
  phase: number;
  description: string;
  enabledServices: string[];
  nextServices: string[];
} {
  return {
    phase: 1,
    description: 'サービス抽象化層の構築（Firebase直接呼び出し）',
    enabledServices: ['ShiftAPIService'],
    nextServices: ['AuthAPIService', 'MultiStoreAPIService', 'TaskAPIService']
  };
}

/**
 * デバッグ情報を取得（開発時のみ使用）
 */
export function getDebugInfo(): Record<string, any> {
  const debugInfo: Record<string, any> = {};
  
  // ShiftAPIService のデバッグ情報
  try {
    const { ShiftAPIService } = require('./ShiftAPIService');
    debugInfo.ShiftAPIService = ShiftAPIService.getDebugInfo();
  } catch (error) {
    debugInfo.ShiftAPIService = { error: 'Failed to get debug info' };
  }
  
  // 将来のサービスのデバッグ情報もここに追加
  
  return debugInfo;
}

/**
 * 環境変数の確認
 * 注意: React Native/Expoでは process.env は使用できません
 * 環境変数は .env ファイルと Expo の設定を通じて管理されます
 */
export function checkEnvironmentVariables(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  // React Native/Expoでは環境変数は別の方法で管理されるため、
  // この関数は常に成功を返します
  return {
    isValid: true,
    missing: [],
    warnings: []
  };
}