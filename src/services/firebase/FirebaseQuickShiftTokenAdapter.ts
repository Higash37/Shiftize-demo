import type { IQuickShiftTokenService, QuickShiftToken } from "../interfaces/IQuickShiftTokenService";
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

const COLLECTION = "quick_shift_tokens";
const DEFAULT_EXPIRY_HOURS = 168; // 7 days

export class FirebaseQuickShiftTokenAdapter implements IQuickShiftTokenService {
  private async generateTokenId(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async createRecruitmentToken(
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
      Date.now() + (options?.expiresInHours || DEFAULT_EXPIRY_HOURS) * 60 * 60 * 1000
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

    if (options?.maxUses !== undefined) {
      tokenData.maxUses = options.maxUses;
    }
    if (options?.allowedUserIds !== undefined) {
      tokenData.allowedUserIds = options.allowedUserIds;
    }

    await setDoc(doc(db, COLLECTION, tokenId), tokenData);
    return tokenId;
  }

  async createFreeAddToken(
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
      Date.now() + (options?.expiresInHours || DEFAULT_EXPIRY_HOURS) * 60 * 60 * 1000
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

    if (options?.maxUses !== undefined) {
      tokenData.maxUses = options.maxUses;
    }
    if (options?.allowedUserIds !== undefined) {
      tokenData.allowedUserIds = options.allowedUserIds;
    }

    await setDoc(doc(db, COLLECTION, tokenId), tokenData);
    return tokenId;
  }

  async validateToken(
    tokenId: string,
    userId?: string
  ): Promise<{ valid: boolean; token?: QuickShiftToken; error?: string }> {
    try {
      const docRef = doc(db, COLLECTION, tokenId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { valid: false, error: "トークンが見つかりません" };
      }

      const token = { id: docSnap.id, ...docSnap.data() } as QuickShiftToken;

      if (!token.isActive) {
        return { valid: false, error: "このURLは無効化されています" };
      }

      if (new Date() > new Date(token.expiresAt)) {
        return { valid: false, error: "このURLは期限切れです" };
      }

      if (token.maxUses && token.currentUses >= token.maxUses) {
        return { valid: false, error: "このURLは使用上限に達しました" };
      }

      if (userId && token.allowedUserIds && token.allowedUserIds.length > 0) {
        if (!token.allowedUserIds.includes(userId)) {
          return { valid: false, error: "このURLを使用する権限がありません" };
        }
      }

      return { valid: true, token };
    } catch {
      return { valid: false, error: "トークン検証中にエラーが発生しました" };
    }
  }

  async recordTokenUsage(tokenId: string, userId: string, shiftId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, tokenId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return;

      const token = docSnap.data() as QuickShiftToken;
      const usageLog = token.usageLog || [];

      usageLog.push({ userId, usedAt: new Date(), shiftId });

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

  async deactivateToken(tokenId: string): Promise<void> {
    const docRef = doc(db, COLLECTION, tokenId);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteToken(tokenId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, tokenId));
  }

  async getStoreTokens(storeId: string): Promise<QuickShiftToken[]> {
    try {
      const q = query(collection(db, COLLECTION), where("storeId", "==", storeId));
      const querySnapshot = await getDocs(q);
      const tokens: QuickShiftToken[] = [];

      querySnapshot.forEach((d) => {
        const data = d.data();
        tokens.push({
          id: d.id,
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

  generateQuickShiftUrl(tokenId: string, tokenType: "recruitment" | "free_add"): string {
    const baseUrl = "https://shiftschedulerapp-71104.web.app";
    const path = tokenType === "recruitment" ? "quick-recruit" : "quick-add";
    return `${baseUrl}/${path}?token=${tokenId}`;
  }
}
