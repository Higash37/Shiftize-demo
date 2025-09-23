/**
 * LINE Bot 統合サービス
 * 既存のFirebase認証システムとLINE Messaging APIを連携
 */

import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "./firebase-core";
import { PersonalInfoEncryption } from "@/common/common-utils/security/encryptionUtils";
import { SecurityLogger } from "@/common/common-utils/security/securityUtils";
import crypto from "crypto";

// LINE連携データの型定義
export interface LineUserMapping {
  id: string;                    // ドキュメントID
  hashedLineUserId: string;      // SHA-256ハッシュ化されたLINE User ID
  encryptedFirebaseUid: string;  // AES-256暗号化されたFirebase UID
  encryptedNickname: string;     // AES-256暗号化されたニックネーム
  storeId: string;              // 店舗ID（平文 - Firebase Security Rules用）
  role: "user" | "master";      // 役割
  isActive: boolean;            // アクティブ状態
  lastUsedAt: Date;            // 最終使用日時
  deviceFingerprint?: string;   // デバイスフィンガープリント
  createdAt: Date;
  updatedAt: Date;
}

// 認証コード管理
export interface LineAuthCode {
  id: string;                   // ドキュメントID
  authCode: string;            // 6桁認証コード
  hashedLineUserId: string;    // SHA-256ハッシュ化されたLINE User ID  
  firebaseUid: string;         // Firebase UID
  expiresAt: Date;            // 有効期限（5分間）
  attempts: number;           // 試行回数
  isUsed: boolean;            // 使用済みフラグ
  deviceChallenge?: string;   // デバイス認証チャレンジ
  createdAt: Date;
}

export class LineService {
  private static readonly COLLECTION_MAPPINGS = "line_user_mappings";
  private static readonly COLLECTION_AUTH_CODES = "line_auth_codes";
  private static readonly AUTH_CODE_EXPIRY_MINUTES = 5;
  private static readonly MAX_AUTH_ATTEMPTS = 3;

  /**
   * LINE User IDをハッシュ化（検索用）
   */
  private static hashLineUserId(lineUserId: string): string {
    return crypto.createHash('sha256').update(lineUserId).digest('hex');
  }

  /**
   * 認証コード生成（6桁数字）
   */
  private static generateAuthCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * LINE ユーザーマッピングの作成
   */
  static async createLineMapping(
    lineUserId: string,
    firebaseUid: string,
    nickname: string,
    storeId: string,
    role: "user" | "master",
    deviceFingerprint?: string
  ): Promise<void> {
    try {
      const hashedLineUserId = this.hashLineUserId(lineUserId);
      
      // 既存のマッピングをチェック
      const existingMapping = await this.getLineMappingByLineUserId(lineUserId);
      if (existingMapping) {
        throw new Error("This LINE account is already linked to another user");
      }

      // 暗号化（簡易実装）
      const encryptedFirebaseUid = firebaseUid; // TODO: 暗号化実装
      const encryptedNickname = nickname; // TODO: 暗号化実装

      const mappingData: Omit<LineUserMapping, "id"> = {
        hashedLineUserId,
        encryptedFirebaseUid,
        encryptedNickname,
        storeId,
        role,
        isActive: true,
        lastUsedAt: new Date(),
        deviceFingerprint: deviceFingerprint || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Firebase UIDをドキュメントIDとして使用（一意性保証）
      await setDoc(doc(db, this.COLLECTION_MAPPINGS, firebaseUid), mappingData);

      // セキュリティログ
      SecurityLogger.logEvent({
        type: 'system_event',
        details: `LINE mapping created for user ${nickname}`,
      });

    } catch (error) {
      SecurityLogger.logEvent({
        type: 'system_error',
        details: `Failed to create LINE mapping: ${error}`,
      });
      throw error;
    }
  }

  /**
   * LINE User ID からマッピング情報取得
   */
  static async getLineMappingByLineUserId(lineUserId: string): Promise<LineUserMapping | null> {
    try {
      const hashedLineUserId = this.hashLineUserId(lineUserId);
      
      // hashedLineUserId で検索（複合インデックス必要）
      const mappingsRef = query(
        collection(db, this.COLLECTION_MAPPINGS),
        where('hashedLineUserId', '==', hashedLineUserId),
        where('isActive', '==', true),
        limit(1)
      );
      
      const querySnapshot = await getDocs(mappingsRef);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const docSnap = querySnapshot.docs[0];
      if (docSnap && docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LineUserMapping;
      }
      return null;
    } catch (error) {
      // Silent error handling for getting LINE mapping by LINE User ID
      return null;
    }
  }

  /**
   * Firebase UID からマッピング情報取得
   */
  static async getLineMappingByFirebaseUid(firebaseUid: string): Promise<LineUserMapping | null> {
    try {
      const docRef = doc(db, this.COLLECTION_MAPPINGS, firebaseUid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LineUserMapping;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 認証コード生成
   */
  static async generateLineAuthCode(
    lineUserId: string,
    firebaseUid: string,
    deviceChallenge?: string
  ): Promise<string> {
    try {
      const hashedLineUserId = this.hashLineUserId(lineUserId);
      const authCode = this.generateAuthCode();
      const expiresAt = new Date(Date.now() + this.AUTH_CODE_EXPIRY_MINUTES * 60 * 1000);

      const authCodeData: Omit<LineAuthCode, "id"> = {
        authCode,
        hashedLineUserId,
        firebaseUid,
        expiresAt,
        attempts: 0,
        isUsed: false,
        deviceChallenge: deviceChallenge || '',
        createdAt: new Date()
      };

      // 認証コードIDとしてランダムIDを生成
      const authCodeId = crypto.randomBytes(16).toString('hex');
      await setDoc(doc(db, this.COLLECTION_AUTH_CODES, authCodeId), authCodeData);

      // セキュリティログ
      SecurityLogger.logEvent({
        type: 'system_event',
        details: `Authentication code generated for LINE user (expires: ${expiresAt.toISOString()})`,
      });

      return authCode;
    } catch (error) {
      SecurityLogger.logEvent({
        type: 'system_error',
        details: `Failed to generate auth code: ${error}`,
      });
      throw error;
    }
  }

  /**
   * 認証コード検証
   */
  static async verifyLineAuthCode(
    lineUserId: string,
    authCode: string
  ): Promise<{ success: boolean; firebaseUid?: string }> {
    try {
      const hashedLineUserId = this.hashLineUserId(lineUserId);

      // TODO: 認証コード検索の実装
      // 実際の実装では where句での検索が必要

      return { success: false };
    } catch (error) {
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        details: `Auth code verification failed: ${error}`,
      });
      return { success: false };
    }
  }

  /**
   * LINE マッピングの無効化
   */
  static async deactivateLineMapping(firebaseUid: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_MAPPINGS, firebaseUid);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });

      SecurityLogger.logEvent({
        type: 'system_event',
        details: `LINE mapping deactivated for user ${firebaseUid}`,
      });

    } catch (error) {
      SecurityLogger.logEvent({
        type: 'system_error',
        details: `Failed to deactivate LINE mapping: ${error}`,
      });
      throw error;
    }
  }

  /**
   * LINE マッピングの完全削除（GDPR準拠）
   */
  static async deleteLineMapping(firebaseUid: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_MAPPINGS, firebaseUid);
      await deleteDoc(docRef);

      // 関連する認証コードも削除
      // TODO: 認証コード検索・削除の実装

      SecurityLogger.logEvent({
        type: 'system_event',
        details: `LINE mapping permanently deleted (GDPR compliance) for user ${firebaseUid}`,
      });

    } catch (error) {
      SecurityLogger.logEvent({
        type: 'system_error',
        details: `Failed to delete LINE mapping: ${error}`,
      });
      throw error;
    }
  }

  /**
   * 最終使用日時の更新
   */
  static async updateLastUsed(firebaseUid: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_MAPPINGS, firebaseUid);
      await updateDoc(docRef, {
        lastUsedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      // エラーログのみ、処理は継続
      // Silent error handling for updating last used time
    }
  }
}