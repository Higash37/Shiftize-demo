/**
 * クイックシフト追加用トークンサービス
 * 教室長がURLを発行 → 講師がタップして即座にシフト追加
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import * as Crypto from "expo-crypto";

/**
 * クイックシフトトークンの型定義
 */
export interface QuickShiftToken {
  id: string; // トークンID（ランダム生成）
  storeId: string; // 店舗ID
  createdBy: string; // 作成者のFirebase UID（教室長）
  tokenType: "recruitment" | "free_add"; // トークンタイプ

  // 募集シフト型の場合
  recruitmentShiftIds?: string[]; // 募集シフトID配列（複数選択対応）

  // フリー入力型の場合
  allowedDateRange?: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  };

  // セキュリティ設定
  expiresAt: Date; // 有効期限
  maxUses: number | undefined; // 最大使用回数（未指定は無制限）
  currentUses: number; // 現在の使用回数

  // アクセス制御
  allowedUserIds: string[] | undefined; // 特定ユーザーのみ許可（未指定は全員OK）
  requireLineAuth: boolean; // LINE認証必須か

  // メタデータ
  isActive: boolean; // アクティブ状態
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date; // 最終使用日時
  usageLog: Array<{
    userId: string;
    usedAt: Date;
    shiftId: string; // 作成されたシフトID
  }>;
}

export class QuickShiftTokenService {
  private static readonly COLLECTION = "quick_shift_tokens";
  private static readonly DEFAULT_EXPIRY_HOURS = 168; // 7日間

  /**
   * ランダムトークンID生成（URLに使用）
   */
  private static async generateTokenId(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * 募集シフト型トークン作成
   * 教室長が特定の募集シフト（複数可）のURLを発行
   */
  static async createRecruitmentToken(
    storeId: string,
    createdBy: string,
    recruitmentShiftIds: string[],
    options?: {
      expiresInHours?: number;
      maxUses?: number;
      allowedUserIds?: string[];
      requireLineAuth?: boolean;
    }
  ): Promise<string> {
    const tokenId = await this.generateTokenId();
    const expiresAt = new Date(
      Date.now() + (options?.expiresInHours || this.DEFAULT_EXPIRY_HOURS) * 60 * 60 * 1000
    );

    const tokenData: any = {
      storeId,
      createdBy,
      tokenType: "recruitment",
      recruitmentShiftIds,
      expiresAt,
      currentUses: 0,
      requireLineAuth: options?.requireLineAuth ?? true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageLog: [],
    };

    // オプショナルフィールドは値がある場合のみ追加
    if (options?.maxUses !== undefined) {
      tokenData.maxUses = options.maxUses;
    }
    if (options?.allowedUserIds !== undefined) {
      tokenData.allowedUserIds = options.allowedUserIds;
    }

    await setDoc(doc(db, this.COLLECTION, tokenId), tokenData);
    return tokenId;
  }

  /**
   * フリー入力型トークン作成
   * 教室長が「自由にシフト追加できるURL」を発行
   */
  static async createFreeAddToken(
    storeId: string,
    createdBy: string,
    options?: {
      expiresInHours?: number;
      maxUses?: number;
      allowedUserIds?: string[];
      requireLineAuth?: boolean;
    }
  ): Promise<string> {
    const tokenId = await this.generateTokenId();
    const expiresAt = new Date(
      Date.now() + (options?.expiresInHours || this.DEFAULT_EXPIRY_HOURS) * 60 * 60 * 1000
    );

    const tokenData: any = {
      storeId,
      createdBy,
      tokenType: "free_add",
      expiresAt,
      currentUses: 0,
      requireLineAuth: options?.requireLineAuth ?? true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageLog: [],
    };

    // オプショナルフィールドは値がある場合のみ追加
    if (options?.maxUses !== undefined) {
      tokenData.maxUses = options.maxUses;
    }
    if (options?.allowedUserIds !== undefined) {
      tokenData.allowedUserIds = options.allowedUserIds;
    }

    await setDoc(doc(db, this.COLLECTION, tokenId), tokenData);
    return tokenId;
  }

  /**
   * トークン検証
   * URLアクセス時にトークンの有効性をチェック
   */
  static async validateToken(
    tokenId: string,
    userId?: string
  ): Promise<{ valid: boolean; token?: QuickShiftToken; error?: string }> {
    try {
      const docRef = doc(db, this.COLLECTION, tokenId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { valid: false, error: "トークンが見つかりません" };
      }

      const token = { id: docSnap.id, ...docSnap.data() } as QuickShiftToken;

      // アクティブチェック
      if (!token.isActive) {
        return { valid: false, error: "このURLは無効化されています" };
      }

      // 有効期限チェック
      if (new Date() > new Date(token.expiresAt)) {
        return { valid: false, error: "このURLは期限切れです" };
      }

      // 使用回数チェック
      if (token.maxUses && token.currentUses >= token.maxUses) {
        return { valid: false, error: "このURLは使用上限に達しました" };
      }

      // ユーザー制限チェック
      if (userId && token.allowedUserIds && token.allowedUserIds.length > 0) {
        if (!token.allowedUserIds.includes(userId)) {
          return { valid: false, error: "このURLを使用する権限がありません" };
        }
      }

      return { valid: true, token };
    } catch (error) {
      return { valid: false, error: "トークン検証中にエラーが発生しました" };
    }
  }

  /**
   * トークン使用記録
   * シフト追加成功時に使用ログを記録
   */
  static async recordTokenUsage(
    tokenId: string,
    userId: string,
    shiftId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, tokenId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return;

      const token = docSnap.data() as QuickShiftToken;
      const usageLog = token.usageLog || [];

      usageLog.push({
        userId,
        usedAt: new Date(),
        shiftId,
      });

      await updateDoc(docRef, {
        currentUses: token.currentUses + 1,
        lastUsedAt: Timestamp.now(),
        usageLog,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Failed to record token usage:", error);
    }
  }

  /**
   * トークン無効化
   * 教室長がURLを無効化
   */
  static async deactivateToken(tokenId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, tokenId);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * トークン削除
   */
  static async deleteToken(tokenId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, tokenId);
    await deleteDoc(docRef);
  }

  /**
   * 店舗のトークン一覧取得
   * 教室長がURL発行履歴を確認
   */
  static async getStoreTokens(storeId: string): Promise<QuickShiftToken[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where("storeId", "==", storeId)
      );

      const querySnapshot = await getDocs(q);
      const tokens: QuickShiftToken[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tokens.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : data['createdAt'],
          updatedAt: data['updatedAt']?.toDate ? data['updatedAt'].toDate() : data['updatedAt'],
          expiresAt: data['expiresAt']?.toDate ? data['expiresAt'].toDate() : data['expiresAt'],
          lastUsedAt: data['lastUsedAt']?.toDate ? data['lastUsedAt'].toDate() : data['lastUsedAt'],
        } as QuickShiftToken);
      });

      return tokens;
    } catch (error) {
      console.error("Failed to get store tokens:", error);
      return [];
    }
  }

  /**
   * URL生成ヘルパー
   * トークンIDからWeb URLを生成
   */
  static generateQuickShiftUrl(tokenId: string, tokenType: "recruitment" | "free_add"): string {
    const baseUrl = "https://shiftschedulerapp-71104.web.app";
    const path = tokenType === "recruitment" ? "quick-recruit" : "quick-add";
    return `${baseUrl}/${path}?token=${tokenId}`;
  }
}
