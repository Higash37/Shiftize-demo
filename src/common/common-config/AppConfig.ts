/**
 * 統合アプリケーション設定管理システム
 * 
 * 環境変数の一元管理、バリデーション、セキュリティ強化を提供します。
 * 全ての設定値は型安全性とセキュリティを重視して管理されます。
 */

import { Platform } from 'react-native';
import { SecurityLogger } from '@/common/common-utils/security/securityUtils';

/**
 * 環境タイプの定義
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Firebase設定インターフェース
 */
export interface FirebaseConfigType {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
}

/**
 * Expo設定インターフェース
 */
export interface ExpoConfigType {
  readonly devProjectId: string;
  readonly prodProjectId: string;
}

/**
 * メール設定インターフェース
 */
export interface EmailConfigType {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly pass: string;
}

/**
 * アプリケーション設定インターフェース
 */
export interface AppConfigType {
  readonly environment: Environment;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly platform: string;
  readonly firebase: FirebaseConfigType;
  readonly expo: ExpoConfigType;
  readonly email: EmailConfigType;
  readonly security: {
    readonly maxRetryAttempts: number;
    readonly tokenExpiryDays: number;
    readonly encryptionKeyLength: number;
    readonly auditLogRetentionDays: number;
  };
  readonly notifications: {
    readonly maxTitleLength: number;
    readonly maxBodyLength: number;
    readonly maxDataSize: number;
    readonly maxRecipients: number;
  };
  readonly shifts: {
    readonly maxBatchSize: number;
    readonly maxSubjectLength: number;
    readonly maxCommentLength: number;
    readonly validStatuses: readonly string[];
    readonly validTypes: readonly string[];
  };
}

/**
 * 設定値のバリデーションエラー
 */
export class ConfigValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly reason: string
  ) {
    super(`Configuration validation failed for ${field}: ${reason}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * 環境変数の安全な取得
 */
const getEnvVar = (
  key: string, 
  required: boolean = true, 
  defaultValue?: string
): string => {
  const value = process.env[key] || defaultValue;
  
  if (required && (!value || value.trim().length === 0)) {
    throw new ConfigValidationError(key, 'Required environment variable not set');
  }
  
  return value || '';
};

/**
 * Firebase設定の取得と検証
 */
const getFirebaseConfig = (): FirebaseConfigType => {
  const apiKey = getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY');
  const authDomain = getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
  const projectId = getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  const storageBucket = getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
  const messagingSenderId = getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  const appId = getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID');

  // APIキーの基本的な形式チェック
  if (!/^AIza[0-9A-Za-z_-]{35}$/.test(apiKey)) {
    throw new ConfigValidationError('FIREBASE_API_KEY', 'Invalid API key format');
  }

  // プロジェクトIDの形式チェック
  if (!/^[a-z0-9-]+$/.test(projectId)) {
    throw new ConfigValidationError('FIREBASE_PROJECT_ID', 'Invalid project ID format');
  }

  // Auth Domainの形式チェック
  if (!/^[a-z0-9-]+\.firebaseapp\.com$/.test(authDomain)) {
    throw new ConfigValidationError('FIREBASE_AUTH_DOMAIN', 'Invalid auth domain format');
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
};

/**
 * Expo設定の取得と検証
 */
const getExpoConfig = (): ExpoConfigType => {
  const devProjectId = getEnvVar('EXPO_PUBLIC_DEV_PROJECT_ID', false, 'default-dev-project');
  const prodProjectId = getEnvVar('EXPO_PUBLIC_PROD_PROJECT_ID', false, 'default-prod-project');

  return {
    devProjectId,
    prodProjectId,
  };
};

/**
 * メール設定の取得と検証
 */
const getEmailConfig = (): EmailConfigType => {
  const host = getEnvVar('EMAIL_HOST', false, 'smtp.gmail.com');
  const port = parseInt(getEnvVar('EMAIL_PORT', false, '587'), 10);
  const secure = getEnvVar('EMAIL_SECURE', false, 'false') === 'true';
  const user = getEnvVar('EMAIL_USER', false, 'noreply@example.com');
  const pass = getEnvVar('EMAIL_PASS', false, 'default-password');

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new ConfigValidationError('EMAIL_PORT', 'Invalid port number');
  }

  return {
    host,
    port,
    secure,
    user,
    pass,
  };
};

/**
 * 現在の環境の判定
 */
const getCurrentEnvironment = (): Environment => {
  const nodeEnv = process.env['NODE_ENV'];
  
  if (nodeEnv === 'production') return 'production';
  if (nodeEnv === 'test') return 'test';
  return 'development';
};

/**
 * アプリケーション設定の初期化
 */
const initializeAppConfig = (): AppConfigType => {
  try {
    const environment = getCurrentEnvironment();
    
    const config: AppConfigType = {
      environment,
      isDevelopment: environment === 'development',
      isProduction: environment === 'production',
      platform: Platform.OS,
      firebase: getFirebaseConfig(),
      expo: getExpoConfig(),
      email: getEmailConfig(),
      security: {
        maxRetryAttempts: 3,
        tokenExpiryDays: 30,
        encryptionKeyLength: 32, // 256 bits
        auditLogRetentionDays: 2555, // 7 years
      },
      notifications: {
        maxTitleLength: 100,
        maxBodyLength: 500,
        maxDataSize: 4000, // Firebase FCMの制限
        maxRecipients: 50,
      },
      shifts: {
        maxBatchSize: 10, // Firestoreの制限
        maxSubjectLength: 200,
        maxCommentLength: 1000,
        validStatuses: ['draft', 'pending', 'approved', 'completed', 'cancelled'],
        validTypes: ['user', 'master', 'recruitment'],
      },
    };

    // 設定の初期化成功をログに記録
    try {
      SecurityLogger.logEvent({
        type: 'system_event',
        userId: 'system',
        details: `App configuration initialized successfully for ${environment} environment on ${Platform.OS}`,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side',
      });
    } catch (e) {
      // ログ記録の失敗は無視
    }

    return config;
  } catch (error) {
    // 設定の初期化失敗をログに記録
    try {
      SecurityLogger.logEvent({
        type: 'system_error',
        userId: 'system',
        details: `App configuration initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side',
      });
    } catch (e) {
      // ログ記録の失敗は無視
    }

    throw error;
  }
};

/**
 * シングルトンのアプリケーション設定
 */
export const AppConfig: AppConfigType = initializeAppConfig();

/**
 * 設定値の安全な取得
 */
export const getConfig = (): AppConfigType => AppConfig;

/**
 * Firebase設定の取得
 */
export const getFirebaseConfigFromApp = (): FirebaseConfigType => AppConfig.firebase;

/**
 * 現在のプロジェクトIDの取得
 */
export const getCurrentProjectId = (): string => {
  return AppConfig.isDevelopment 
    ? AppConfig.expo.devProjectId 
    : AppConfig.expo.prodProjectId;
};

/**
 * 設定の検証
 */
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    // 必要な設定値の存在確認
    if (!AppConfig.firebase.apiKey) {
      errors.push('Firebase API key is missing');
    }
    
    if (!AppConfig.firebase.projectId) {
      errors.push('Firebase project ID is missing');
    }
    
    if (!AppConfig.firebase.authDomain) {
      errors.push('Firebase auth domain is missing');
    }

    // セキュリティ設定の検証
    if (AppConfig.security.maxRetryAttempts < 1 || AppConfig.security.maxRetryAttempts > 10) {
      errors.push('Invalid max retry attempts (must be 1-10)');
    }

    if (AppConfig.security.tokenExpiryDays < 1 || AppConfig.security.tokenExpiryDays > 365) {
      errors.push('Invalid token expiry days (must be 1-365)');
    }

  } catch (error) {
    errors.push(`Configuration validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 開発者向けの設定情報出力（本番環境では機密情報を隠す）
 */
export const getConfigSummary = (): Record<string, any> => {
  const summary = {
    environment: AppConfig.environment,
    platform: AppConfig.platform,
    firebase: {
      projectId: AppConfig.firebase.projectId,
      authDomain: AppConfig.firebase.authDomain,
      apiKey: AppConfig.isProduction ? '[HIDDEN]' : AppConfig.firebase.apiKey.substring(0, 10) + '...',
    },
    security: AppConfig.security,
    notifications: AppConfig.notifications,
    shifts: AppConfig.shifts,
  };

  return summary;
};