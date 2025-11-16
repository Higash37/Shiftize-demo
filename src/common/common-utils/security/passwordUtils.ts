/**
 * 安全なパスワードハッシュ化ユーティリティ
 *
 * PBKDF2ベースの堅牢なパスワード管理システム
 *
 * ⚠️ SECURITY WARNINGS:
 * - このモジュールは平文パスワードのレガシー対応を含んでいます
 * - レガシーパスワードの検出時は必ずマイグレーションを実行してください
 * - 本番環境では平文パスワードの保存を絶対に許可しないでください
 *
 * ⚠️ IMPLEMENTATION NOTES:
 * - React Nativeとの互換性を考慮しCryptoJS PBKDF2を使用
 * - 反復回数: 10,000回（必要に応じて増やすことを推奨）
 * - 将来的にはArgon2idへの移行を推奨
 */

import CryptoJS from "crypto-js";
import { SecurityLogger } from "./securityUtils";

/**
 * パスワードハッシュ化クラス
 *
 * PBKDF2-SHA512を使用した安全なパスワードハッシュ化を提供します。
 *
 * ⚠️ SECURITY NOTE:
 * - パスワードは必ずハッシュ化して保存してください
 * - 平文パスワードの保存は重大なセキュリティリスクです
 * - レガシーシステムからの移行時は PasswordMigrator を使用してください
 */
export class PasswordHasher {
  /** PBKDF2のキーサイズ（512ビット = 64バイト） */
  private static readonly KEY_SIZE = 64;

  /** PBKDF2の反復回数（10,000回 - 必要に応じて増やすことを推奨） */
  private static readonly PBKDF2_ITERATIONS = 10000;

  /**
   * パスワードをハッシュ化
   *
   * PBKDF2-SHA512を使用してパスワードを安全にハッシュ化します。
   * 各パスワードに対してランダムなソルトを生成し、10,000回の反復処理を行います。
   *
   * @param password - ハッシュ化するパスワード（最低6文字以上）
   * @returns ハッシュ化されたパスワード（形式: $pbkdf2$iterations$salt$hash）
   * @throws パスワードが無効な場合、またはハッシュ化に失敗した場合
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      if (!password || typeof password !== "string") {
        throw new Error("Invalid password provided");
      }

      if (password.length < 6) {
        throw new Error("Password too short");
      }

      // ランダムソルト生成
      const salt = CryptoJS.lib.WordArray.random(16).toString();

      // PBKDF2でハッシュ化
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: this.KEY_SIZE / 4, // WordArrayの単位調整（64バイト = 16ワード）
        iterations: this.PBKDF2_ITERATIONS,
        hasher: CryptoJS.algo.SHA512,
      }).toString();

      // ソルトとハッシュを結合（形式: $pbkdf2$iterations$salt$hash）
      const hashedPassword = `$pbkdf2$${this.PBKDF2_ITERATIONS}$${salt}$${hash}`;

      return hashedPassword;
    } catch (error) {
      SecurityLogger.logEvent({
        type: "encryption_error",
        details: `Password hashing failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      throw new Error("Password hashing failed");
    }
  }

  /**
   * パスワード検証
   *
   * 入力されたパスワードが保存されているハッシュと一致するか検証します。
   * タイミング攻撃対策として安全な文字列比較を使用します。
   *
   * ⚠️ LEGACY SUPPORT:
   * - レガシー形式（平文）のパスワードにも対応していますが、これは移行期間中のみです
   * - 平文パスワードが検出された場合は、セキュリティログに警告が記録されます
   * - 本番環境では必ず全パスワードをマイグレーションしてください
   *
   * @param password - 検証するパスワード
   * @param hashedPassword - 保存されているハッシュ化されたパスワード（またはレガシー平文）
   * @returns パスワードが一致する場合 true、それ以外の場合 false
   */
  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      if (
        !password ||
        !hashedPassword ||
        typeof password !== "string" ||
        typeof hashedPassword !== "string"
      ) {
        return false;
      }

      // ハッシュ形式の検証
      const hashParts = hashedPassword.split("$");
      if (
        hashParts.length !== 4 ||
        hashParts[0] !== "" ||
        hashParts[1] !== "pbkdf2"
      ) {
        // ⚠️ レガシー形式（平文パスワード）への対応
        // 警告: 本番環境ではこの処理を削除し、全パスワードをマイグレーションしてください
        if (hashedPassword === password) {
          SecurityLogger.logEvent({
            type: "encryption_warning",
            details:
              "⚠️ CRITICAL: Legacy plaintext password detected during verification - immediate migration required",
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
        iterations: Number.parseInt(iterations, 10),
        hasher: CryptoJS.algo.SHA512,
      }).toString();

      // タイミング攻撃対策の安全な比較
      return this.safeStringCompare(
        `$pbkdf2$${iterations}$${salt}$${testHash}`,
        hashedPassword
      );
    } catch (error) {
      SecurityLogger.logEvent({
        type: "encryption_error",
        details: `Password verification failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      return false;
    }
  }

  /**
   * タイミング攻撃対策の安全な文字列比較
   *
   * 文字列の比較を一定時間で実行し、タイミング攻撃を防ぎます。
   * すべての文字を比較してから結果を返すため、文字列の長さや内容による
   * 実行時間の差異が発生しません。
   *
   * @param a - 比較する最初の文字列
   * @param b - 比較する2番目の文字列
   * @returns 文字列が一致する場合 true、それ以外の場合 false
   */
  private static safeStringCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    // 文字列を配列に変換してcodePointAtを使用
    const aArray = [...a];
    const bArray = [...b];

    for (let i = 0; i < aArray.length; i++) {
      const charA = aArray[i];
      const charB = bArray[i];
      if (!charA || !charB) {
        result |= 1; // undefinedの場合は不一致として扱う
        continue;
      }
      const codePointA = charA.codePointAt(0) ?? 0;
      const codePointB = charB.codePointAt(0) ?? 0;
      result |= codePointA ^ codePointB;
    }

    return result === 0;
  }

  /**
   * レガシーパスワード（平文）の検出
   *
   * ⚠️ SECURITY WARNING:
   * - このメソッドが true を返す場合、パスワードは平文で保存されています
   * - 即座に PasswordMigrator を使用してマイグレーションを実行してください
   * - 本番環境で平文パスワードが検出された場合は重大なセキュリティ問題です
   */
  static isLegacyPassword(storedPassword: string): boolean {
    return !storedPassword.startsWith("$pbkdf2$");
  }

  /**
   * パスワード強度チェック
   *
   * パスワードの強度を評価し、改善点を返します。
   * スコア70以上で有効と判定されます。
   *
   * @returns 検証結果（有効性、スコア、改善点のリスト）
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 25;
    else issues.push("8文字未満");

    if (password.length >= 12) score += 10;

    if (/[a-z]/.test(password)) score += 15;
    else issues.push("小文字がない");

    if (/[A-Z]/.test(password)) score += 15;
    else issues.push("大文字がない");

    if (/\d/.test(password)) score += 15;
    else issues.push("数字がない");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
    else issues.push("特殊文字がない");

    return {
      isValid: score >= 70,
      score,
      issues,
    };
  }
}

/**
 * パスワードマイグレーションヘルパー
 *
 * 既存の平文パスワードを安全にハッシュ化するためのユーティリティクラス。
 *
 * ⚠️ IMPORTANT:
 * - このクラスはレガシーシステムからの移行期間中のみ使用してください
 * - マイグレーション完了後は、平文パスワードの処理を完全に削除してください
 * - 本番環境では必ず全ユーザーのパスワードをマイグレーションしてください
 */
export class PasswordMigrator {
  /**
   * ユーザーログイン時の自動パスワードマイグレーション
   *
   * ログイン時にレガシーパスワード（平文）を検出した場合、
   * 自動的にハッシュ化してデータベースを更新します。
   *
   * @param userId - ユーザーID
   * @param plainPassword - 平文パスワード（ログイン時に検証済み）
   * @param updateUserCallback - データベース更新用のコールバック関数
   * @returns ハッシュ化されたパスワード
   *
   * ⚠️ SECURITY NOTE:
   * - このメソッドは平文パスワードを受け取りますが、即座にハッシュ化します
   * - コールバック関数内で平文パスワードを保存しないでください
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
        type: "encryption_warning",
        userId,
        details: "Password migrated from plaintext to hash during login",
      });

      return hashedPassword;
    } catch (error) {
      SecurityLogger.logEvent({
        type: "encryption_error",
        userId,
        details: `Password migration failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      throw error;
    }
  }

  /**
   * 全ユーザーの一括パスワードマイグレーション（管理者用）
   *
   * 複数のユーザーのパスワードを一括でマイグレーションします。
   * 管理者権限が必要な操作です。
   *
   * @param users - マイグレーション対象のユーザー配列
   * @param updateCallback - 各ユーザーのパスワード更新用コールバック関数
   * @returns マイグレーション結果（成功数、失敗数、スキップ数）
   *
   * ⚠️ WARNING:
   * - このメソッドは管理者権限が必要です
   * - 大量のユーザーを処理する場合は、バッチサイズを制限してください
   * - マイグレーション中はシステムの負荷が高くなる可能性があります
   */
  static async batchMigratePasswords(
    users: Array<{ id: string; currentPassword?: string }>,
    updateCallback: (userId: string, hashedPassword: string) => Promise<void>
  ): Promise<{ migrated: number; failed: number; skipped: number }> {
    let migrated = 0;
    let failed = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        if (
          !user.currentPassword ||
          !PasswordHasher.isLegacyPassword(user.currentPassword)
        ) {
          skipped++;
          continue;
        }

        const hashedPassword = await PasswordHasher.hashPassword(
          user.currentPassword
        );
        await updateCallback(user.id, hashedPassword);
        migrated++;
      } catch (error) {
        failed++;
        SecurityLogger.logEvent({
          type: "encryption_error",
          userId: user.id,
          details: `Batch password migration failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    }

    SecurityLogger.logEvent({
      type: "system_event",
      details: `Batch password migration completed: ${migrated} migrated, ${failed} failed, ${skipped} skipped`,
    });

    return { migrated, failed, skipped };
  }
}

/**
 * 一時的な互換性ヘルパー
 *
 * 段階的移行期間中の安全なパスワード処理を提供します。
 *
 * ⚠️ DEPRECATION WARNING:
 * - このクラスは移行期間中のみ使用してください
 * - 全ユーザーのマイグレーション完了後は削除してください
 * - 本番環境で長期間使用することは推奨されません
 */
export class PasswordCompatHelper {
  /**
   * パスワード検証（レガシー対応）
   *
   * 新形式のハッシュパスワードとレガシー形式（平文）の両方に対応した検証を行います。
   * レガシーパスワードが検出された場合は、マイグレーションが必要であることを示します。
   *
   * @param inputPassword - 検証するパスワード
   * @param storedPassword - 保存されているパスワード（ハッシュまたは平文）
   * @returns 検証結果（有効性、マイグレーション必要性）
   *
   * ⚠️ SECURITY WARNING:
   * - このメソッドは平文パスワードの検証を許可します
   * - needsMigration が true の場合、即座にマイグレーションを実行してください
   * - 本番環境では平文パスワードの検証を許可しないことを強く推奨します
   */
  static async verifyPasswordWithFallback(
    inputPassword: string,
    storedPassword: string
  ): Promise<{ isValid: boolean; needsMigration: boolean }> {
    // 新形式ハッシュの場合
    if (!PasswordHasher.isLegacyPassword(storedPassword)) {
      const isValid = await PasswordHasher.verifyPassword(
        inputPassword,
        storedPassword
      );
      return { isValid, needsMigration: false };
    }

    // ⚠️ レガシー形式（平文）の場合
    // 警告: この処理は移行期間中のみ使用してください
    const isValid = storedPassword === inputPassword;
    if (isValid) {
      SecurityLogger.logEvent({
        type: "encryption_warning",
        details:
          "⚠️ CRITICAL: Legacy plaintext password used for authentication - immediate migration required",
      });
    }

    return { isValid, needsMigration: isValid };
  }
}
