/**
 * 個人情報アクセス監査ログシステム
 * GDPR/CCPA等のプライバシー規制対応
 */

import { SecurityLogger, SecurityEvent } from './securityUtils';

// 監査ログの種類
export type AuditEventType = 
  | 'personal_info_access'    // 個人情報アクセス
  | 'personal_info_create'    // 個人情報作成
  | 'personal_info_update'    // 個人情報更新  
  | 'personal_info_delete'    // 個人情報削除
  | 'encryption_key_access'   // 暗号化キーアクセス
  | 'data_export'            // データエクスポート
  | 'admin_access'           // 管理者アクセス
  | 'consent_given'          // 同意取得
  | 'consent_withdrawn';     // 同意撤回

// 監査ログエントリ
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  userId: string;
  targetUserId?: string;      // 対象ユーザー（他人の情報にアクセスした場合）
  storeId: string;
  dataFields?: string[];      // アクセスしたデータフィールド
  purpose: string;           // アクセス目的
  legalBasis?: string;       // 法的根拠（GDPR Article 6）
  ipAddress?: string;
  userAgent: string;
  sessionId?: string;
  result: 'success' | 'failure' | 'unauthorized';
  details?: string;
  retentionUntil?: Date;     // ログ保持期限
}

// 監査ログ管理クラス
class AuditLogger {
  private static logs: AuditLogEntry[] = [];
  private static readonly MAX_LOGS = 10000;
  private static readonly DEFAULT_RETENTION_DAYS = 2555; // 7年間（GDPR要件）

  /**
   * 監査ログを記録
   */
  static logEvent(event: Omit<AuditLogEntry, 'id' | 'timestamp' | 'retentionUntil'>): void {
    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      retentionUntil: new Date(Date.now() + this.DEFAULT_RETENTION_DAYS * 24 * 60 * 60 * 1000),
      ...event,
    };

    this.logs.push(logEntry);

    // メモリ上のログサイズ制限
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // 重要な監査イベントは即座にSecurityLoggerにも記録
    if (['personal_info_delete', 'admin_access', 'consent_withdrawn'].includes(event.eventType)) {
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        userId: event.userId,
        details: `Audit: ${event.eventType} - ${event.purpose}`,
        userAgent: event.userAgent,
      });
    }

    // 開発環境でのデバッグ出力
    if (__DEV__) {
      console.log('🔍 Audit Log:', logEntry);
    }
  }

  /**
   * 特定ユーザーの監査ログを取得
   */
  static getUserLogs(userId: string): AuditLogEntry[] {
    return this.logs.filter(log => 
      log.userId === userId || log.targetUserId === userId
    );
  }

  /**
   * 期間別監査ログを取得
   */
  static getLogsByDateRange(startDate: Date, endDate: Date): AuditLogEntry[] {
    return this.logs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  /**
   * イベント種別の監査ログを取得
   */
  static getLogsByEventType(eventType: AuditEventType): AuditLogEntry[] {
    return this.logs.filter(log => log.eventType === eventType);
  }

  /**
   * 古い監査ログの自動削除
   */
  static cleanupExpiredLogs(): void {
    const now = new Date();
    this.logs = this.logs.filter(log => 
      !log.retentionUntil || log.retentionUntil > now
    );
  }

  /**
   * ユーザーの個人情報アクセス履歴をエクスポート（GDPR対応）
   */
  static exportUserAuditData(userId: string): {
    summary: any;
    logs: AuditLogEntry[];
    generatedAt: Date;
  } {
    const userLogs = this.getUserLogs(userId);
    
    const summary = {
      totalAccesses: userLogs.length,
      accessTypes: userLogs.reduce((acc, log) => {
        acc[log.eventType] = (acc[log.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      firstAccess: userLogs.length > 0 ? userLogs[0].timestamp : null,
      lastAccess: userLogs.length > 0 ? userLogs[userLogs.length - 1].timestamp : null,
      dataFieldsAccessed: [...new Set(userLogs.flatMap(log => log.dataFields || []))],
    };

    this.logEvent({
      eventType: 'data_export',
      userId: userId,
      storeId: 'system',
      purpose: 'User requested audit data export (GDPR)',
      userAgent: navigator.userAgent,
      result: 'success',
    });

    return {
      summary,
      logs: userLogs,
      generatedAt: new Date(),
    };
  }

  private static generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 全ログの統計情報を取得（管理者用）
   */
  static getAuditStatistics(): {
    totalLogs: number;
    logsByEventType: Record<string, number>;
    logsByResult: Record<string, number>;
    recentActivity: AuditLogEntry[];
  } {
    const recentLogs = this.logs.slice(-100); // 最新100件
    
    return {
      totalLogs: this.logs.length,
      logsByEventType: this.logs.reduce((acc, log) => {
        acc[log.eventType] = (acc[log.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      logsByResult: this.logs.reduce((acc, log) => {
        acc[log.result] = (acc[log.result] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentActivity: recentLogs,
    };
  }
}

export { AuditLogger };

// 個人情報アクセス用のヘルパー関数
export class PersonalInfoAudit {
  /**
   * 個人情報読み取りアクセスを記録
   */
  static logPersonalInfoAccess(params: {
    userId: string;
    targetUserId?: string;
    storeId: string;
    dataFields: string[];
    purpose: string;
    legalBasis?: string;
  }): void {
    AuditLogger.logEvent({
      eventType: 'personal_info_access',
      userId: params.userId,
      targetUserId: params.targetUserId,
      storeId: params.storeId,
      dataFields: params.dataFields,
      purpose: params.purpose,
      legalBasis: params.legalBasis || 'legitimate_interest',
      userAgent: navigator.userAgent,
      result: 'success',
    });
  }

  /**
   * 個人情報更新を記録
   */
  static logPersonalInfoUpdate(params: {
    userId: string;
    storeId: string;
    dataFields: string[];
    purpose: string;
  }): void {
    AuditLogger.logEvent({
      eventType: 'personal_info_update',
      userId: params.userId,
      storeId: params.storeId,
      dataFields: params.dataFields,
      purpose: params.purpose,
      legalBasis: 'contract',
      userAgent: navigator.userAgent,
      result: 'success',
    });
  }

  /**
   * 同意取得を記録
   */
  static logConsentGiven(params: {
    userId: string;
    storeId: string;
    consentType: string;
    purpose: string;
  }): void {
    AuditLogger.logEvent({
      eventType: 'consent_given',
      userId: params.userId,
      storeId: params.storeId,
      purpose: params.purpose,
      details: `Consent type: ${params.consentType}`,
      legalBasis: 'consent',
      userAgent: navigator.userAgent,
      result: 'success',
    });
  }

  /**
   * 同意撤回を記録
   */
  static logConsentWithdrawn(params: {
    userId: string;
    storeId: string;
    consentType: string;
    reason?: string;
  }): void {
    AuditLogger.logEvent({
      eventType: 'consent_withdrawn',
      userId: params.userId,
      storeId: params.storeId,
      purpose: 'User withdrew consent',
      details: `Consent type: ${params.consentType}, Reason: ${params.reason || 'Not specified'}`,
      userAgent: navigator.userAgent,
      result: 'success',
    });
  }

  /**
   * 管理者による他ユーザー情報アクセスを記録
   */
  static logAdminAccess(params: {
    adminUserId: string;
    targetUserId: string;
    storeId: string;
    purpose: string;
    dataFields: string[];
  }): void {
    AuditLogger.logEvent({
      eventType: 'admin_access',
      userId: params.adminUserId,
      targetUserId: params.targetUserId,
      storeId: params.storeId,
      dataFields: params.dataFields,
      purpose: params.purpose,
      legalBasis: 'legitimate_interest',
      userAgent: navigator.userAgent,
      result: 'success',
    });
  }
}

// React Hook for audit logging
export const usePersonalInfoAudit = () => {
  const logAccess = (params: Parameters<typeof PersonalInfoAudit.logPersonalInfoAccess>[0]) => {
    PersonalInfoAudit.logPersonalInfoAccess(params);
  };

  const logUpdate = (params: Parameters<typeof PersonalInfoAudit.logPersonalInfoUpdate>[0]) => {
    PersonalInfoAudit.logPersonalInfoUpdate(params);
  };

  const logConsent = (params: Parameters<typeof PersonalInfoAudit.logConsentGiven>[0]) => {
    PersonalInfoAudit.logConsentGiven(params);
  };

  const logConsentWithdrawal = (params: Parameters<typeof PersonalInfoAudit.logConsentWithdrawn>[0]) => {
    PersonalInfoAudit.logConsentWithdrawn(params);
  };

  return {
    logAccess,
    logUpdate,
    logConsent,
    logConsentWithdrawal,
  };
};

// 定期的な監査ログクリーンアップの設定
if (typeof window !== 'undefined') {
  // 1日1回古いログを削除
  setInterval(() => {
    AuditLogger.cleanupExpiredLogs();
  }, 24 * 60 * 60 * 1000);
}