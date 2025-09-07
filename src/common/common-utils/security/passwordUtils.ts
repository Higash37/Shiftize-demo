/**
 * 安全なパスワードハッシュ化ユーティリティ
 * bcryptベースの堅牢なパスワード管理システム
 */

import CryptoJS from 'crypto-js';
import { SecurityLogger } from './securityUtils';

/**
 * パスワードハッシュ化クラス
 * 
 * ⚠️ SECURITY NOTE:
 * - bcryptが理想的だが、React Nativeとの互換性を考慮しCryptoJS PBKDF2を使用
 * - 将来的にはArgon2への移行を推奨
 */
export class PasswordHasher {
  private static readonly SALT_ROUNDS = 12;
  private static readonly HASH_ALGORITHM = 'SHA512';
  private static readonly KEY_SIZE = 64; // 512 bits
  
  /**
   * パスワードをハッシュ化
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      if (!password || typeof password !== 'string') {
        throw new Error('Invalid password provided');
      }
      
      if (password.length < 6) {
        throw new Error('Password too short');
      }
      
      // ランダムソルト生成
      const salt = CryptoJS.lib.WordArray.random(16).toString();
      
      // PBKDF2でハッシュ化（反復回数: 10000回）
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: this.KEY_SIZE / 4, // WordArrayの単位調整
        iterations: 10000,
        hasher: CryptoJS.algo.SHA512
      }).toString();
      
      // ソルトとハッシュを結合
      const hashedPassword = `$pbkdf2$10000$${salt}$${hash}`;
      
      return hashedPassword;
      
    } catch (error) {
      SecurityLogger.logEvent({
        type: 'encryption_error',
        details: `Password hashing failed: ${error instanceof Error ? error.message : String(error)}`
      });
      throw new Error('Password hashing failed');
    }
  }
  
  /**
   * パスワード検証
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      if (!password || !hashedPassword || 
          typeof password !== 'string' || typeof hashedPassword !== 'string') {
        return false;
      }
      
      // ハッシュ形式の検証
      const hashParts = hashedPassword.split('$');
      if (hashParts.length !== 4 || hashParts[0] !== '' || hashParts[1] !== 'pbkdf2') {
        // レガシー形式（currentPassword）への対応
        if (hashedPassword === password) {
          SecurityLogger.logEvent({
            type: 'encryption_warning',
            details: 'Legacy plaintext password detected during verification'
          });
          return true;
        }
        return false;
      }
      
      const [, , iterations, salt, hash] = hashParts;
      
      if (!iterations || !salt || !hash) {
        return false;
      }
      
      // 同じ条件でハッシュ化して比較
      const testHash = CryptoJS.PBKDF2(password, salt, {
        keySize: this.KEY_SIZE / 4,
        iterations: parseInt(iterations),
        hasher: CryptoJS.algo.SHA512
      }).toString();
      
      // タイミング攻撃対策の安全な比較
      return this.safeStringCompare(`$pbkdf2$${iterations}$${salt}$${testHash}`, hashedPassword);
      
    } catch (error) {
      SecurityLogger.logEvent({
        type: 'encryption_error',
        details: `Password verification failed: ${error instanceof Error ? error.message : String(error)}`
      });
      return false;
    }
  }
  
  /**
   * タイミング攻撃対策の安全な文字列比較
   */
  private static safeStringCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
  
  /**
   * レガシーパスワード（平文）の検出
   */
  static isLegacyPassword(storedPassword: string): boolean {
    return !storedPassword.startsWith('$pbkdf2$');
  }
  
  /**
   * パスワード強度チェック
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;
    
    if (password.length >= 8) score += 25;
    else issues.push('8文字未満');
    
    if (password.length >= 12) score += 10;
    
    if (/[a-z]/.test(password)) score += 15;
    else issues.push('小文字がない');
    
    if (/[A-Z]/.test(password)) score += 15;
    else issues.push('大文字がない');
    
    if (/\d/.test(password)) score += 15;
    else issues.push('数字がない');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
    else issues.push('特殊文字がない');
    
    return {
      isValid: score >= 70,
      score,
      issues
    };
  }
}

/**
 * パスワードマイグレーションヘルパー
 * 既存の平文パスワードを安全にハッシュ化
 */
export class PasswordMigrator {
  /**
   * ユーザーログイン時の自動パスワードマイグレーション
   */
  static async migrateUserPasswordOnLogin(
    userId: string,
    plainPassword: string,
    updateUserCallback: (hashedPassword: string) => Promise<void>
  ): Promise<string> {
    try {
      // パスワードをハッシュ化
      const hashedPassword = await PasswordHasher.hashPassword(plainPassword);
      
      // データベース更新
      await updateUserCallback(hashedPassword);
      
      // 監査ログ
      SecurityLogger.logEvent({
        type: 'encryption_warning',
        userId,
        details: 'Password migrated from plaintext to hash during login'
      });
      
      return hashedPassword;
      
    } catch (error) {
      SecurityLogger.logEvent({
        type: 'encryption_error',
        userId,
        details: `Password migration failed: ${error instanceof Error ? error.message : String(error)}`
      });
      throw error;
    }
  }
  
  /**
   * 全ユーザーの一括パスワードマイグレーション（管理者用）
   */
  static async batchMigratePasswords(
    users: Array<{id: string, currentPassword?: string}>,
    updateCallback: (userId: string, hashedPassword: string) => Promise<void>
  ): Promise<{migrated: number, failed: number, skipped: number}> {
    let migrated = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const user of users) {
      try {
        if (!user.currentPassword || !PasswordHasher.isLegacyPassword(user.currentPassword)) {
          skipped++;
          continue;
        }
        
        const hashedPassword = await PasswordHasher.hashPassword(user.currentPassword);
        await updateCallback(user.id, hashedPassword);
        migrated++;
        
      } catch (error) {
        failed++;
        SecurityLogger.logEvent({
          type: 'encryption_error',
          userId: user.id,
          details: `Batch password migration failed: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
    
    SecurityLogger.logEvent({
      type: 'system_event',
      details: `Batch password migration completed: ${migrated} migrated, ${failed} failed, ${skipped} skipped`
    });
    
    return { migrated, failed, skipped };
  }
}

/**
 * 一時的な互換性ヘルパー
 * 段階的移行期間中の安全な処理
 */
export class PasswordCompatHelper {
  /**
   * パスワード検証（レガシー対応）
   */
  static async verifyPasswordWithFallback(
    inputPassword: string,
    storedPassword: string
  ): Promise<{isValid: boolean, needsMigration: boolean}> {
    // 新形式ハッシュの場合
    if (!PasswordHasher.isLegacyPassword(storedPassword)) {
      const isValid = await PasswordHasher.verifyPassword(inputPassword, storedPassword);
      return { isValid, needsMigration: false };
    }
    
    // レガシー形式（平文）の場合
    const isValid = storedPassword === inputPassword;
    if (isValid) {
      SecurityLogger.logEvent({
        type: 'encryption_warning',
        details: 'Legacy plaintext password used for authentication'
      });
    }
    
    return { isValid, needsMigration: isValid };
  }
}