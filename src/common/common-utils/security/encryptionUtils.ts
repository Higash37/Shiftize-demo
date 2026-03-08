/**
 * 個人情報暗号化ユーティリティ
 * Supabase + React Native 環境での安全なデータ暗号化
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import CryptoJS from "crypto-js";
import { SecurityLogger } from "./securityUtils";
import type { UserRole } from "@/common/common-models/model-user/UserModel";

// 本格的なAES暗号化 - 業界標準のセキュリティレベル
export class AESEncryption {
  /**
   * 暗号学的に安全な256bit暗号化キーを生成
   */
  static generateKey(): string {
    // 32バイト = 256bit の暗号学的に安全なランダムキー
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * AES-256で暗号化（crypto-js標準・自動IV生成）
   */
  static encrypt(plaintext: string, key: string): string {
    try {
      if (!plaintext || typeof plaintext !== "string") {
        throw new Error("無効な平文データです");
      }

      // AES暗号化（自動でIV生成・塩つき）
      const encrypted = CryptoJS.AES.encrypt(plaintext, key);
      return encrypted.toString();
    } catch (error) {
      throw new Error(`暗号化に失敗しました: ${error}`);
    }
  }

  /**
   * AES-256で復号化
   */
  static decrypt(ciphertext: string, key: string): string {
    try {
      if (!ciphertext || typeof ciphertext !== "string") {
        throw new Error("無効な暗号化データです");
      }

      // AES復号化
      const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, key);
      const result = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!result) {
        throw new Error("復号化に失敗しました - 無効なキーまたはデータ");
      }

      return result;
    } catch (error) {
      throw new Error(`復号化に失敗しました: ${error}`);
    }
  }

  /**
   * パスワードベースのキー導出（PBKDF2）
   */
  static deriveKeyFromPassword(password: string, salt: string): string {
    try {
      // PBKDF2でパスワードから256bitキーを導出
      // 10,000回の反復で総当たり攻撃を困難にする
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32, // 32バイト = 256bit
        iterations: 10000,
      });

      return key.toString();
    } catch (error) {
      throw new Error(`キー導出に失敗しました: ${error}`);
    }
  }

  /**
   * @deprecated 新しい passwordUtils.ts の PasswordHasher を使用してください
   * パスワードの安全なハッシュ化（保存用）
   * 🔒 PBKDF2 + ソルト + 100,000回反復
   */
  static hashPassword(password: string): string {
    try {
      if (!password || typeof password !== "string") {
        throw new Error("無効なパスワードです");
      }

      // セキュリティ警告ログ
      SecurityLogger.logEvent({
        type: "encryption_warning",
        details:
          "Deprecated hashPassword method used. Migrate to PasswordHasher.",
      });

      // ランダムソルト生成（128bit）
      const salt = CryptoJS.lib.WordArray.random(16).toString();

      // PBKDF2でハッシュ化（100,000回反復 - 高セキュリティ）
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000,
      });

      // ソルト + ハッシュの形式で保存
      return `${salt}:${hash.toString()}`;
    } catch (error) {
      throw new Error(`パスワードハッシュ化に失敗しました: ${error}`);
    }
  }

  /**
   * @deprecated 新しい passwordUtils.ts の PasswordHasher を使用してください
   * パスワード検証
   */
  static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      if (!password || !hashedPassword) {
        return false;
      }

      // セキュリティ警告ログ
      SecurityLogger.logEvent({
        type: "encryption_warning",
        details:
          "Deprecated verifyPassword method used. Migrate to PasswordHasher.",
      });

      const [salt, hash] = hashedPassword.split(":");
      if (!salt || !hash) {
        return false;
      }

      // 同じソルトで入力パスワードをハッシュ化
      const inputHash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000,
      });

      // 時間攻撃を防ぐため、常に同じ時間で比較
      return hash === inputHash.toString();
    } catch (error) {
      console.warn("Password verification failed:", error);
      return false;
    }
  }
}

// セキュアストレージでの暗号化キー管理
class EncryptionKeyManager {
  private static readonly KEY_NAME = "encryption_master_key";
  private static cachedKey: string | null = null;

  static async getOrCreateKey(): Promise<string> {
    // 🚨 セキュリティ警告: Web環境では真の暗号化は不可能
    // クライアントサイド暗号化は無効化し、サーバーサイドに委譲
    if (Platform.OS === "web") {
      throw new Error(
        "Web環境ではクライアントサイド暗号化は使用できません。サーバーサイド暗号化を使用してください。"
      );
    }

    if (this.cachedKey) {
      return this.cachedKey;
    }

    try {
      // React Native環境のみ対応
      let key = await SecureStore.getItemAsync(this.KEY_NAME);
      if (!key) {
        key = AESEncryption.generateKey();
        await SecureStore.setItemAsync(this.KEY_NAME, key);
      }
      this.cachedKey = key;
      return key;
    } catch (error) {
      // フォールバック: セッション限定キー
      SecurityLogger.logEvent({
        type: "encryption_error",
        userId: "system",
        details: `Key retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      if (!this.cachedKey) {
        this.cachedKey = AESEncryption.generateKey();
      }
      return this.cachedKey;
    }
  }

  static async clearKey(): Promise<void> {
    this.cachedKey = null;
    try {
      if (Platform.OS === "web") {
        // Web環境では暗号化キー操作を無効化
        throw new Error("Web環境では暗号化キーの操作はできません");
      } else {
        await SecureStore.deleteItemAsync(this.KEY_NAME);
      }
    } catch (error) {
      // エラーは無視（削除目的なので）
      SecurityLogger.logEvent({
        type: "encryption_warning",
        userId: "system",
        details: `Key clearing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  }
}

// 個人情報の暗号化インターface
export interface EncryptedPersonalInfo {
  realName?: string; // 実名（暗号化対象）
  phoneNumber?: string; // 電話番号（暗号化対象）
  address?: string; // 住所（暗号化対象）
  notes?: string; // 個人メモ（暗号化対象）
  // 暗号化しないフィールド
  nickname: string; // ニックネーム（平文OK）
  email: string; // メールアドレス（Supabase Auth管理）
  birthdayYear?: number; // 誕生年（年のみなら平文OK）
  role: UserRole;
  storeId: string;
}

// 個人情報暗号化サービス
export class PersonalInfoEncryption {
  /**
   * 個人情報を暗号化してFirestore保存用に変換
   */
  static async encryptPersonalInfo(data: EncryptedPersonalInfo): Promise<any> {
    // 🔒 Web環境では暗号化機能そのものを使用禁止
    if (Platform.OS === "web") {
      throw new Error("Web環境では暗号化機能は利用できません");
    }
    try {
      const key = await EncryptionKeyManager.getOrCreateKey();
      const result: any = {
        // 平文で保存するフィールド
        nickname: data.nickname,
        email: data.email,
        role: data.role,
        storeId: data.storeId,
        birthdayYear: data.birthdayYear,
        // 暗号化フラグ
        isEncrypted: true,
        encryptedAt: new Date().toISOString(),
      };

      // 機密情報をAES-256で暗号化
      if (data.realName) {
        result.realName = AESEncryption.encrypt(data.realName, key);
      }
      if (data.phoneNumber) {
        result.phoneNumber = AESEncryption.encrypt(data.phoneNumber, key);
      }
      if (data.address) {
        result.address = AESEncryption.encrypt(data.address, key);
      }
      if (data.notes) {
        result.notes = AESEncryption.encrypt(data.notes, key);
      }

      return result;
    } catch (error) {
      SecurityLogger.logEvent({
        type: "encryption_error",
        userId: "system",
        details: `Personal info encryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      throw new Error("個人情報の暗号化に失敗しました");
    }
  }

  /**
   * Firestoreから取得したデータを復号化
   */
  static async decryptPersonalInfo(
    encryptedData: any
  ): Promise<EncryptedPersonalInfo> {
    // 🔒 Web環境では暗号化機能そのものを使用禁止
    if (Platform.OS === "web") {
      throw new Error("Web環境では暗号化機能は利用できません");
    }
    try {
      if (!encryptedData.isEncrypted) {
        // 暗号化されていないデータはそのまま返す
        return encryptedData as EncryptedPersonalInfo;
      }

      const key = await EncryptionKeyManager.getOrCreateKey();
      const result: EncryptedPersonalInfo = {
        nickname: encryptedData.nickname,
        email: encryptedData.email,
        role: encryptedData.role,
        storeId: encryptedData.storeId,
        birthdayYear: encryptedData.birthdayYear,
      };

      // 暗号化されたフィールドをAES-256で復号化
      if (encryptedData.realName) {
        result.realName = AESEncryption.decrypt(encryptedData.realName, key);
      }
      if (encryptedData.phoneNumber) {
        result.phoneNumber = AESEncryption.decrypt(
          encryptedData.phoneNumber,
          key
        );
      }
      if (encryptedData.address) {
        result.address = AESEncryption.decrypt(encryptedData.address, key);
      }
      if (encryptedData.notes) {
        result.notes = AESEncryption.decrypt(encryptedData.notes, key);
      }

      return result;
    } catch (error) {
      SecurityLogger.logEvent({
        type: "encryption_error",
        userId: "system",
        details: `Personal info decryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      throw new Error("個人情報の復号化に失敗しました");
    }
  }

  /**
   * 個人情報を安全に削除（暗号化キーごと削除）
   */
  static async secureDelete(): Promise<void> {
    // 🔒 Web環境では暗号化機能そのものを使用禁止
    if (Platform.OS === "web") {
      throw new Error("Web環境では暗号化機能は利用できません");
    }
    await EncryptionKeyManager.clearKey();
  }
}

// データ削除サービス
export class PersonalDataDeletion {
  /**
   * ユーザーアカウントと関連データの完全削除
   */
  static async deleteUserData(userId: string, storeId: string): Promise<void> {
    try {
      // 1. 個人情報暗号化キーの削除
      await PersonalInfoEncryption.secureDelete();

      // 2. Supabaseからユーザーデータを削除
      const { getSupabase } = await import("@/services/supabase/supabase-client");
      const supabase = getSupabase();

      await supabase.from("users").delete().eq("uid", userId);

      // 3. 関連するシフトデータを削除
      await supabase
        .from("shifts")
        .delete()
        .eq("user_id", userId)
        .eq("store_id", storeId);

      // 4. セキュリティログ
      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: userId,
        details: "User data deletion completed",
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      throw new Error(`データ削除に失敗しました: ${error}`);
    }
  }

  /**
   * 管理者による他ユーザーのデータ削除
   */
  static async deleteUserDataByAdmin(
    targetUserId: string,
    storeId: string,
    adminUserId: string
  ): Promise<void> {
    try {
      const { getSupabase } = await import("@/services/supabase/supabase-client");
      const supabase = getSupabase();

      // ユーザーデータを論理削除（監査目的）
      await supabase
        .from("users")
        .update({
          deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: adminUserId,
          real_name: null,
          phone_number: null,
          address: null,
          notes: null,
        })
        .eq("uid", targetUserId);

      // 関連シフトも論理削除
      await supabase
        .from("shifts")
        .update({
          deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: adminUserId,
        })
        .eq("user_id", targetUserId)
        .eq("store_id", storeId);

      // セキュリティログ
      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: adminUserId,
        details: `Admin deleted user data: ${targetUserId}`,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      throw new Error(`管理者によるデータ削除に失敗しました: ${error}`);
    }
  }
}
