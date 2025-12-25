/**
 * ⚠️ このファイルは凍結中です ⚠️
 *
 * 理由: ファイル機能の使用率が低いため凍結
 * 将来の移行予定: Firebase Storage → Supabase Storage
 *
 * このファイルはStorageServiceに依存しているため無効化しています。
 */

/*
// 以下のコードは凍結中（Firebase Storage使用）

import { collection, getDocs, doc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase-core";
import { StorageService } from "./storageService";
import { FileService } from "./fileService";

export class CollectionRecoveryService {
  // ... コレクション復旧機能（凍結中）
}
*/

// ダミーエクスポート（importエラーを防ぐため）
export class CollectionRecoveryService {
  static async checkFilesCollection(): Promise<never> {
    throw new Error("CollectionRecoveryService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async checkFoldersCollection(): Promise<never> {
    throw new Error("CollectionRecoveryService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async recoverFilesFromStorage(): Promise<never> {
    throw new Error("CollectionRecoveryService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async generateDiagnosticReport(): Promise<never> {
    throw new Error("CollectionRecoveryService is currently disabled. Migration to Supabase Storage is planned.");
  }
}
